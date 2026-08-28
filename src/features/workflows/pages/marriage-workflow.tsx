"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CalendarCheck, Check, FileStack, Heart, IndianRupee, UserRoundCheck, UsersRound } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip, VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getDocuments, getPerson } from "@/features/graph/selectors";
import type { GraphMutation, Verification } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { getDocumentKindMessageKey } from "@/i18n/formatters";
import { formatDate, maskIdentifier } from "@/lib/format";
import { bookAppointment, processPayment, submitMarriageRegistration } from "@/lib/mockGov";
import { CompletionCard, ParticipantStrip, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [
    { id: "invite", title: "Invite Priya", description: "Start one shared application." },
    { id: "consent", title: "Partner consent", description: "Priya approves from her login." },
    { id: "documents", title: "Documents and witnesses", description: "Reuse identity records and choose witnesses." },
    { id: "appointment", title: "Appointment and fee", description: "Book in Bengaluru and pay the ₹500 fee." },
    { id: "certificate", title: "Register marriage", description: "Receive one shared certificate." },
  ],
  hi: [
    { id: "invite", title: "प्रिया को आमंत्रित करें", description: "एक साझा आवेदन शुरू करें।" },
    { id: "consent", title: "साथी की सहमति", description: "प्रिया अपने लॉगिन से सहमति देंगी।" },
    { id: "documents", title: "दस्तावेज़ और गवाह", description: "पहचान के दस्तावेज़ दोबारा इस्तेमाल करें और गवाह चुनें।" },
    { id: "appointment", title: "अपॉइंटमेंट और शुल्क", description: "बेंगलुरु में अपॉइंटमेंट बुक करें और ₹500 भरें।" },
    { id: "certificate", title: "विवाह पंजीकरण", description: "दोनों के लिए एक साझा प्रमाणपत्र पाएँ।" },
  ],
  kn: [
    { id: "invite", title: "ಪ್ರಿಯಾ ಅವರನ್ನು ಆಹ್ವಾನಿಸಿ", description: "ಒಂದು ಜಂಟಿ ಅರ್ಜಿಯನ್ನು ಪ್ರಾರಂಭಿಸಿ." },
    { id: "consent", title: "ಸಂಗಾತಿಯ ಒಪ್ಪಿಗೆ", description: "ಪ್ರಿಯಾ ತಮ್ಮ ಲಾಗಿನ್‌ನಿಂದ ಒಪ್ಪಿಗೆ ನೀಡುತ್ತಾರೆ." },
    { id: "documents", title: "ದಾಖಲೆಗಳು ಮತ್ತು ಸಾಕ್ಷಿಗಳು", description: "ಗುರುತಿನ ದಾಖಲೆಗಳನ್ನು ಮರುಬಳಸಿ, ಸಾಕ್ಷಿಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ." },
    { id: "appointment", title: "ಭೇಟಿ ಮತ್ತು ಶುಲ್ಕ", description: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಭೇಟಿ ನಿಗದಿಪಡಿಸಿ ₹500 ಪಾವತಿಸಿ." },
    { id: "certificate", title: "ವಿವಾಹ ನೋಂದಣಿ", description: "ಇಬ್ಬರಿಗೂ ಒಂದೇ ಪ್ರಮಾಣಪತ್ರ ಪಡೆಯಿರಿ." },
  ],
};

function verification(source: Verification["source"] = "Self"): Verification {
  return { source, state: source === "Self" ? "self-declared" : "verified", asOf: source === "Municipal" ? "2026-09-03" : "2026-08-28" };
}

export function MarriageWorkflow() {
  const router = useRouter();
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const switchPersona = useAuthStore((state) => state.switchPersona);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWitnesses, setSelectedWitnesses] = useState<string[]>([]);
  if (!personId) return null;
  const arjun = getPerson(graph, "person:arjun");
  const priya = getPerson(graph, "person:priya");
  if (!arjun || !priya) return null;
  const application = graph.nodes
    .filter((node) => node.type === "application")
    .find((node) => node.id === "app:marriage-arjun-priya");
  const currentStep = application?.attrs.currentStep ?? 0;
  const complete = application?.attrs.status === "completed";
  const steps = stepsByLanguage[language];
  const arjunStatus = complete ? t("completed") : currentStep > 0 ? t("done") : t("active");
  const priyaStatus = complete ? t("completed") : currentStep > 1 ? t("done") : t("pending");

  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try { await action(); } catch { setError(t("marriageServiceError")); } finally { setLoading(false); }
  };

  const invite = () => {
    if (personId !== arjun.id) return;
    const mutations: GraphMutation[] = [
      { type: "addNode", node: { id: "app:marriage-arjun-priya", type: "application", attrs: { title: "Marriage registration: Arjun & Priya", authority: "Kaveri Online Services", status: "partner-consent-pending", createdOn: "2026-08-28", kind: "marriage", participants: [arjun.id, priya.id], currentStep: 1 }, verification: verification() } },
      { type: "addEdge", edge: { id: "e:arjun-subject-marriage-app", type: "subjectOf", from: arjun.id, to: "app:marriage-arjun-priya", attrs: {}, validFrom: "2026-08-28", status: "active", verification: verification() } },
      { type: "addEdge", edge: { id: "e:priya-subject-marriage-app", type: "subjectOf", from: priya.id, to: "app:marriage-arjun-priya", attrs: {}, validFrom: "2026-08-28", status: "active", verification: verification() } },
    ];
    commit({ actorId: personId, labelKey: "eventMarriageInviteSent", procedureId: "marriage-arjun-priya", mutations });
  };

  const consent = () => {
    if (personId !== priya.id) return;
    commit({ actorId: personId, labelKey: "eventMarriageConsentReceived", procedureId: "marriage-arjun-priya", mutations: [{ type: "patchAttrs", nodeId: "app:marriage-arjun-priya", attrs: { status: "documents-ready", currentStep: 2 } }] });
  };

  const reuseDocuments = () => {
    if (selectedWitnesses.length === 0) return;
    commit({ actorId: personId, labelKey: "eventMarriageDocumentsAdded", procedureId: "marriage-arjun-priya", mutations: [{ type: "patchAttrs", nodeId: "app:marriage-arjun-priya", attrs: { currentStep: 3, witnesses: selectedWitnesses } }] });
  };

  const appointment = () => run(async () => {
    const [booking, payment] = await Promise.all([
      bookAppointment({ procedureId: "marriage-arjun-priya", city: "Bengaluru" }),
      processPayment({ purpose: "Marriage registration fee", amount: 500, payerId: personId }),
    ]);
    commit({ actorId: personId, labelKey: "eventMarriageAppointmentBooked", procedureId: "marriage-arjun-priya", mutations: [{ type: "patchAttrs", nodeId: "app:marriage-arjun-priya", attrs: { currentStep: 4, status: "appointment-booked", appointmentOn: booking.data.scheduledFor, amountPaid: payment.data.amount, reference: booking.data.appointmentId } }] });
  });

  const register = () => run(async () => {
    const response = await submitMarriageRegistration({ applicantId: arjun.id, partnerId: priya.id });
    const certificateId = "doc:arjun-priya-marriage-certificate";
    const mutations: GraphMutation[] = [
      { type: "addNode", node: { id: certificateId, type: "document", attrs: { kind: "marriage-certificate", holderName: "Arjun Sharma & Priya Patel", numberMasked: maskIdentifier(response.data.certificateNumber), issuedOn: "2026-09-03", authority: response.authority, downloaded: true }, verification: verification("Municipal") } },
      { type: "addEdge", edge: { id: "e:arjun-holds-marriage-certificate", type: "holds", from: arjun.id, to: certificateId, attrs: {}, validFrom: "2026-09-03", status: "active", verification: verification("Municipal") } },
      { type: "addEdge", edge: { id: "e:priya-holds-marriage-certificate", type: "holds", from: priya.id, to: certificateId, attrs: {}, validFrom: "2026-09-03", status: "active", verification: verification("Municipal") } },
      { type: "addEdge", edge: { id: "e:arjun-spouseof-priya", type: "spouseOf", from: arjun.id, to: priya.id, attrs: { marriageRegisteredAt: "Sub-Registrar, Jayanagar, Bengaluru" }, validFrom: "2026-09-03", status: "active", verification: verification("Municipal") } },
      { type: "patchAttrs", nodeId: arjun.id, attrs: { maritalStatus: "married" } },
      { type: "patchAttrs", nodeId: priya.id, attrs: { maritalStatus: "married" } },
      { type: "patchAttrs", nodeId: "app:marriage-arjun-priya", attrs: { currentStep: 5, status: "completed", submittedOn: "2026-09-03", reference: response.data.applicationReference }, verification: verification("Municipal") },
    ];
    commit({ actorId: personId, labelKey: "eventMarriageRegistered", procedureId: "marriage-arjun-priya", mutations });
  });

  const switchTo = (nextPersonId: string) => {
    switchPersona(nextPersonId);
    router.refresh();
  };

  const arjunDocs = getDocuments(graph, arjun.id).filter((document) => ["aadhaar", "pan", "passport"].includes(document.attrs.kind) && document.verification.state === "verified");
  const priyaDocs = getDocuments(graph, priya.id).filter((document) => ["aadhaar", "pan", "passport"].includes(document.attrs.kind) && document.verification.state === "verified");
  const reusedDocumentCount = arjunDocs.length + priyaDocs.length;
  const witnessCandidates = [getPerson(graph, "person:sunita"), getPerson(graph, "person:kavita")].filter(
    (candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate),
  );

  const toggleWitness = (witnessId: string) => {
    setSelectedWitnesses((current) =>
      current.includes(witnessId)
        ? current.filter((id) => id !== witnessId)
        : current.length < 2
          ? [...current, witnessId]
          : current,
    );
  };

  const content = complete ? (
    <CompletionCard title={t("marriageCompleteTitle")} body={t("marriageCompleteBody")}><div className="flex flex-wrap gap-3"><LinkButton href="/documents" variant="inverse">{t("marriageOpenCertificate")} <ArrowRight aria-hidden className="size-4" /></LinkButton><LinkButton href="/you" variant="inverseQuiet">{t("marriageViewRelationship")}</LinkButton></div></CompletionCard>
  ) : currentStep === 0 ? (
    <StepCard eyebrow={t("marriageSharedEyebrow")} title={personId === arjun.id ? t("marriageInviteTitle") : t("marriageStartWithArjun")} body={t(personId === arjun.id ? "marriageSharedBody" : "marriageStartWithArjunBody")}><div className="flex items-center gap-4 border-y border-paper-line py-4"><Heart aria-hidden className="size-5 shrink-0 text-brick" /><div className="flex-1"><strong className="block text-sm">Arjun Sharma + Priya Patel</strong><span className="text-xs text-ink-mute">Bengaluru · Ahmedabad</span></div><SimulatedChip authority="Citizen invite relay" /></div>{personId === arjun.id ? <Button onClick={invite}>{t("marriageInvitePriya")} <ArrowRight aria-hidden className="size-4" /></Button> : <Button onClick={() => switchTo(arjun.id)} variant="secondary">{t("switchArjun")}</Button>}</StepCard>
  ) : currentStep === 1 ? (
    <StepCard eyebrow={t("marriageConsentEyebrow")} title={personId === priya.id ? t("marriageConsentQuestion") : t("marriageWaitingPriya")} body={t("marriageConsentBody")}><div className="grid gap-2 rounded-[8px] bg-green-tint p-4 text-xs text-ink-mute"><span className="flex gap-2"><Check aria-hidden className="size-4 text-green-deep" />{t("marriageIdentityVerification")}</span><span className="flex gap-2"><Check aria-hidden className="size-4 text-green-deep" />{t("marriageVerifiedDocumentsOnly")}</span><span className="flex gap-2"><Check aria-hidden className="size-4 text-green-deep" />{t("marriageSpouseAfterSubmission")}</span></div>{personId === priya.id ? <Button onClick={consent}><UserRoundCheck aria-hidden className="size-4" />{t("marriageIConsent")}</Button> : <Button onClick={() => switchTo(priya.id)} variant="secondary"><UsersRound aria-hidden className="size-4" />{t("marriageSwitchPriya")}</Button>}</StepCard>
  ) : currentStep === 2 ? (
    <StepCard eyebrow={t("marriageRecordsEyebrow")} title={t("marriageRecordsTitle")} body={t("marriageRecordsBody", { count: reusedDocumentCount })}><div className="grid gap-4 sm:grid-cols-2">{[{ name: "Arjun", docs: arjunDocs }, { name: "Priya", docs: priyaDocs }].map((group) => <div className="grid gap-2 rounded-[8px] bg-paper-line p-4" key={group.name}><strong className="text-sm">{group.name}</strong>{group.docs.map((document) => { const kindKey = getDocumentKindMessageKey(document.attrs.kind); return <span className="flex items-center justify-between gap-2 text-xs text-ink-mute" key={document.id}><span className="flex items-center gap-2"><FileStack aria-hidden className="size-3.5" />{kindKey ? t(kindKey) : document.attrs.kind}</span><VerificationBadge verification={document.verification} /></span>; })}</div>)}</div><div className="grid gap-2"><p className="text-xs font-bold text-ink">{t("marriageWitnesses")}</p><div className="grid gap-2 sm:grid-cols-2">{witnessCandidates.map((witness) => { const selected = selectedWitnesses.includes(witness.id); return <button aria-pressed={selected} className={`flex min-h-14 items-center justify-between rounded-[8px] border px-4 text-left text-sm font-bold transition ${selected ? "border-green-deep bg-green-tint text-green-deep" : "border-paper-line bg-paper-shade"}`} key={witness.id} onClick={() => toggleWitness(witness.id)} type="button"><span>{witness.attrs.name}</span>{selected ? <Check aria-hidden className="size-4" /> : null}</button>; })}</div></div><Button disabled={selectedWitnesses.length === 0} onClick={reuseDocuments}>{t("marriageUseDocuments")} <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : currentStep === 3 ? (
    <StepCard eyebrow="Jayanagar, Bengaluru" title={t("marriageAppointmentTitle")} body={t("marriageAppointmentBody", { count: application?.attrs.witnesses?.length ?? 0 })}><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-[8px] bg-paper-line p-4"><CalendarCheck aria-hidden className="mb-4 size-5 text-green-deep" /><strong className="block text-sm">{t("marriageAppointmentSlot", { date: formatDate("2026-09-03", language) })}</strong><span className="text-xs text-ink-mute">{t("marriageRegistrar")}</span></div><div className="rounded-[8px] bg-paper-line p-4"><IndianRupee aria-hidden className="mb-4 size-5 text-green-deep" /><strong className="block text-sm">{t("marriageRegistrationFee")}</strong><span className="text-xs text-ink-mute">Karnataka One · {t("simulated").toLowerCase()}</span></div></div><Button loading={loading} onClick={() => void appointment()}>{t("marriageBookAndPay")} <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : (
    <StepCard eyebrow={application?.attrs.reference} title={t("marriageConfirmTitle")} body={t("marriageConfirmBody", { date: application?.attrs.appointmentOn ? formatDate(application.attrs.appointmentOn, language) : formatDate("2026-09-03", language) })}><div className="flex items-center justify-between gap-4 rounded-[8px] bg-green-tint p-4"><div><strong className="block text-sm">{t("marriageSpouseRelationship")}</strong><span className="text-xs text-ink-mute">Arjun Sharma ↔ Priya Patel</span></div><SimulatedChip authority="Kaveri Online Services" /></div><Button loading={loading} onClick={() => void register()}>{t("marriageRegisterAction")} <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  );

  return <ProcedureShell authority="Kaveri Online Services + Karnataka One" complete={complete} currentStep={currentStep} description={t("marriageWorkflowBody")} procedureId="marriage-arjun-priya" steps={steps} title={t("marriageWorkflowTitle")}><div className="grid gap-5"><ParticipantStrip left={{ name: arjun.attrs.name, status: arjunStatus, tone: complete || currentStep > 0 ? "success" : "info" }} right={{ name: priya.attrs.name, status: priyaStatus, tone: complete || currentStep > 1 ? "success" : "warning" }} />{error ? <p className="rounded-[4px] bg-brick-tint p-3 text-sm font-semibold text-brick" role="alert">{error}</p> : null}{content}</div></ProcedureShell>;
}
