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
import { useDraft } from "@/features/workflows/progress-store";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { getDocumentKindMessageKey } from "@/i18n/formatters";
import { formatDate, maskIdentifier } from "@/lib/format";
import { bookAppointment, processPayment, submitMarriageRegistration } from "@/lib/mockGov";
import { CompletionCard, ParticipantStrip, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";
import { MarriageRippleCard } from "../components/marriage-ripple";
import { MarriageFamilyCue } from "../components/marriage-family-cue";
import { ConsentPacket, marriageConsentFields } from "../components/consent-packet";

/** `{partner}` is replaced with the other person's first name, seen from whoever is logged in. */
const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [
    { id: "invite", title: "Invite {partner}", description: "Either of you can start the shared application." },
    { id: "consent", title: "Partner consent", description: "{partner} approves from their own login." },
    { id: "documents", title: "Documents and witnesses", description: "Reuse identity records and choose witnesses." },
    { id: "appointment", title: "Appointment and fee", description: "Book in Bengaluru and pay the ₹500 fee." },
    { id: "certificate", title: "Register marriage", description: "Receive one shared certificate." },
  ],
  hi: [
    { id: "invite", title: "{partner} को आमंत्रित करें", description: "साझा आवेदन आप दोनों में से कोई भी शुरू कर सकता है।" },
    { id: "consent", title: "साथी की सहमति", description: "{partner} अपने लॉगिन से सहमति देंगे।" },
    { id: "documents", title: "दस्तावेज़ और गवाह", description: "पहचान के दस्तावेज़ दोबारा इस्तेमाल करें और गवाह चुनें।" },
    { id: "appointment", title: "अपॉइंटमेंट और शुल्क", description: "बेंगलुरु में अपॉइंटमेंट बुक करें और ₹500 भरें।" },
    { id: "certificate", title: "विवाह पंजीकरण", description: "दोनों के लिए एक साझा प्रमाणपत्र पाएँ।" },
  ],
  kn: [
    { id: "invite", title: "{partner} ಅವರನ್ನು ಆಹ್ವಾನಿಸಿ", description: "ಜಂಟಿ ಅರ್ಜಿಯನ್ನು ನಿಮ್ಮಿಬ್ಬರಲ್ಲಿ ಯಾರಾದರೂ ಆರಂಭಿಸಬಹುದು." },
    { id: "consent", title: "ಸಂಗಾತಿಯ ಒಪ್ಪಿಗೆ", description: "{partner} ತಮ್ಮ ಲಾಗಿನ್‌ನಿಂದ ಒಪ್ಪಿಗೆ ನೀಡುತ್ತಾರೆ." },
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
  const { draft, save } = useDraft("marriage-arjun-priya", personId);
  const selectedWitnesses = Array.isArray(draft.witnesses) ? draft.witnesses : [];
  const setSelectedWitnesses = (update: (current: string[]) => string[]) => save({ witnesses: update(selectedWitnesses) });
  if (!personId) return null;
  const arjun = getPerson(graph, "person:arjun");
  const priya = getPerson(graph, "person:priya");
  if (!arjun || !priya) return null;
  const application = graph.nodes
    .filter((node) => node.type === "application")
    .find((node) => node.id === "app:marriage-arjun-priya");
  const currentStep = application?.attrs.currentStep ?? 0;
  const complete = application?.attrs.status === "completed";
  // Whoever sent the invitation leads; before that, whoever is looking. Sunita and others see it from Arjun's side.
  const couple = [arjun, priya];
  const isCouple = couple.some((person) => person.id === personId);
  if (!isCouple) return <ProcedureShell authority="Kaveri Online Services" currentStep={0} procedureId="marriage-arjun-priya" showProgress={false} steps={[]} title={t("marriageWorkflowTitle")}><StepCard title={t("marriageStartWithCouple")} body={t("marriageStartWithCoupleBody")} /></ProcedureShell>;
  const initiator = couple.find((person) => person.id === (application?.attrs.participants?.[0] ?? (isCouple ? personId : arjun.id))) ?? arjun;
  const partner = initiator.id === arjun.id ? priya : arjun;
  const partnerFirst = partner.attrs.name.split(" ")[0];
  const initiatorFirst = initiator.attrs.name.split(" ")[0];
  const partnerKey = partner.id.replace("person:", "");
  const steps = stepsByLanguage[language].map((step) => ({ ...step, title: step.title.replace("{partner}", partnerFirst), description: step.description?.replace("{partner}", partnerFirst) }));
  const initiatorStatus = complete ? t("completed") : currentStep > 0 ? t("done") : t("active");
  const partnerStatus = complete ? t("completed") : currentStep > 1 ? t("done") : t("pending");

  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try { await action(); } catch { setError(t("marriageServiceError")); } finally { setLoading(false); }
  };

  const invite = () => {
    if (!isCouple) return;
    const mutations: GraphMutation[] = [
      { type: "addNode", node: { id: "app:marriage-arjun-priya", type: "application", attrs: { title: "Marriage registration: Arjun & Priya", authority: "Kaveri Online Services", status: "partner-consent-pending", createdOn: "2026-08-28", kind: "marriage", participants: [initiator.id, partner.id], currentStep: 1 }, verification: verification() } },
      { type: "addEdge", edge: { id: "e:arjun-subject-marriage-app", type: "subjectOf", from: arjun.id, to: "app:marriage-arjun-priya", attrs: {}, validFrom: "2026-08-28", status: "active", verification: verification() } },
      { type: "addEdge", edge: { id: "e:priya-subject-marriage-app", type: "subjectOf", from: priya.id, to: "app:marriage-arjun-priya", attrs: {}, validFrom: "2026-08-28", status: "active", verification: verification() } },
    ];
    commit({ actorId: personId, labelKey: "eventMarriageInviteSent", labelParams: { name: partnerFirst }, procedureId: "marriage-arjun-priya", mutations });
  };

  const consent = () => {
    if (personId !== partner.id) return;
    const mutations: GraphMutation[] = [
      { type: "patchAttrs", nodeId: "app:marriage-arjun-priya", attrs: { status: "documents-ready", currentStep: 2 } },
      { type: "addNode", node: { id: `doc:${partnerKey}-consent-marriage`, type: "document", attrs: { kind: "consent-receipt", holderName: partner.attrs.name, issuedOn: "2026-08-28", authority: "Kaveri Online Services", downloaded: true }, verification: verification() } },
      { type: "addEdge", edge: { id: `e:${partnerKey}-holds-consent-marriage`, type: "holds", from: partner.id, to: `doc:${partnerKey}-consent-marriage`, attrs: {}, validFrom: "2026-08-28", status: "active", verification: verification() } },
    ];
    commit({ actorId: personId, labelKey: "eventMarriageConsentReceived", labelParams: { name: partnerFirst }, procedureId: "marriage-arjun-priya", mutations });
  };
  const partnerAddressId = graph.edges.find((edge) => edge.type === "residesAt" && edge.from === partner.id && edge.status === "active")?.to;
  const partnerAddress = graph.nodes.find((node) => node.id === partnerAddressId);
  const consentFields = marriageConsentFields(partner, getDocuments(graph, partner.id).find((document) => document.attrs.kind === "aadhaar"), partnerAddress?.type === "address" ? `${partnerAddress.attrs.line1}, ${partnerAddress.attrs.city}` : "—");

  const reuseDocuments = () => {
    if (selectedWitnesses.length !== 2) return;
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
    const response = await submitMarriageRegistration({ applicantId: initiator.id, partnerId: partner.id });
    const certificateId = "doc:arjun-priya-marriage-certificate";
    const mutations: GraphMutation[] = [
      { type: "addNode", node: { id: certificateId, type: "document", attrs: { kind: "marriage-certificate", holderName: "Arjun Sharma & Priya Patel", numberMasked: maskIdentifier(response.data.certificateNumber), issuedOn: "2026-09-03", authority: response.authority, downloaded: true }, verification: verification("Municipal") } },
      { type: "addEdge", edge: { id: "e:arjun-holds-marriage-certificate", type: "holds", from: arjun.id, to: certificateId, attrs: {}, validFrom: "2026-09-03", status: "active", verification: verification("Municipal") } },
      { type: "addEdge", edge: { id: "e:priya-holds-marriage-certificate", type: "holds", from: priya.id, to: certificateId, attrs: {}, validFrom: "2026-09-03", status: "active", verification: verification("Municipal") } },
      { type: "addEdge", edge: { id: "e:arjun-spouseof-priya", type: "spouseOf", from: arjun.id, to: priya.id, attrs: { marriageRegisteredAt: "Sub-Registrar, Jayanagar, Bengaluru" }, validFrom: "2026-09-03", status: "active", verification: verification("Municipal") } },
      { type: "patchAttrs", nodeId: arjun.id, attrs: { maritalStatus: "married" } },
      { type: "patchAttrs", nodeId: priya.id, attrs: { maritalStatus: "married" } },
      { type: "patchAttrs", nodeId: "app:marriage-arjun-priya", attrs: { currentStep: 5, status: "completed", submittedOn: "2026-09-03", reference: response.data.applicationReference }, verification: verification("Municipal") },
      { type: "addNode", node: { id: "ntc:marriage-ripple", type: "notice", attrs: { channel: "email", sender: "CITIZEN-RELAY", receivedOn: "2026-09-03", subject: "Marriage registered — review connected next steps", body: "Your marriage certificate is saved to both document wallets. Arjun can now review whether to propose Priya as his EPF nominee, and each of you can check schemes from your own profile. Nothing changes automatically.", legitimacy: "legitimate", relatedTo: "app:marriage-arjun-priya" }, verification: verification("Municipal") } },
      { type: "addEdge", edge: { id: "e:arjun-subject-marriage-ripple", type: "subjectOf", from: arjun.id, to: "ntc:marriage-ripple", attrs: { read: false }, validFrom: "2026-09-03", status: "active", verification: verification("Municipal") } },
      { type: "addEdge", edge: { id: "e:priya-subject-marriage-ripple", type: "subjectOf", from: priya.id, to: "ntc:marriage-ripple", attrs: { read: false }, validFrom: "2026-09-03", status: "active", verification: verification("Municipal") } },
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
    <div className="grid gap-5">
      <CompletionCard title={t("marriageCompleteTitle")} body={t("marriageCompleteBody")}><div className="flex flex-wrap gap-3"><LinkButton href="/documents" variant="inverse">{t("marriageOpenCertificate")} <ArrowRight aria-hidden className="size-4" /></LinkButton><LinkButton href="/you" variant="inverseQuiet">{t("marriageViewRelationship")}</LinkButton></div></CompletionCard>
      <MarriageRippleCard personId={personId} />
    </div>
  ) : currentStep === 0 ? (
    <StepCard eyebrow={t("marriageSharedEyebrow")} title={isCouple ? t("marriageInviteTitle", { name: partnerFirst }) : t("marriageStartWithCouple")} body={isCouple ? t("marriageSharedBody", { name: partnerFirst }) : t("marriageStartWithCoupleBody")}><div className="flex items-center gap-4 border-y border-paper-line py-4"><Heart aria-hidden className="size-5 shrink-0 text-brick" /><div className="flex-1"><strong className="block text-sm">Arjun Sharma + Priya Patel</strong><span className="text-xs text-ink-mute">Bengaluru · Ahmedabad</span></div><SimulatedChip authority="Citizen invite relay" /></div>{isCouple ? <Button onClick={invite}>{t("marriageInvitePriya", { name: partnerFirst })} <ArrowRight aria-hidden className="size-4" /></Button> : <Button onClick={() => switchTo(arjun.id)} variant="secondary">{t("switchArjun")}</Button>}</StepCard>
  ) : currentStep === 1 ? (
    <StepCard eyebrow={t("marriageConsentEyebrow")} title={personId === partner.id ? t("marriageConsentQuestion", { name: partnerFirst }) : t("marriageWaitingPriya", { name: partnerFirst })} body={t("marriageConsentBody", { name: initiatorFirst })}>{personId === partner.id ? <ConsentPacket expiry={t("consentExpiryMarriage")} fields={consentFields} purpose={t("consentPurposeMarriage")} recipient="Kaveri Online Services" sharer={partnerFirst} /> : <p className="text-sm leading-6 text-ink-mute">{t("marriageSharedBody", { name: partnerFirst })}</p>}{personId === partner.id ? <Button onClick={consent}><UserRoundCheck aria-hidden className="size-4" />{t("marriageIConsent")}</Button> : <Button onClick={() => switchTo(partner.id)} variant="secondary"><UsersRound aria-hidden className="size-4" />{t("marriageSwitchPriya", { name: partnerFirst })}</Button>}</StepCard>
  ) : currentStep === 2 ? (
    <StepCard eyebrow={t("marriageRecordsEyebrow")} title={t("marriageRecordsTitle")} body={t("marriageRecordsBody", { count: reusedDocumentCount })}><div className="grid gap-4 sm:grid-cols-2">{[{ name: "Arjun", docs: arjunDocs }, { name: "Priya", docs: priyaDocs }].map((group) => <div className="grid gap-2 rounded-[3px] bg-paper-line p-4" key={group.name}><strong className="text-sm">{group.name}</strong>{group.docs.map((document) => { const kindKey = getDocumentKindMessageKey(document.attrs.kind); return <span className="flex items-center justify-between gap-2 text-xs text-ink-mute" key={document.id}><span className="flex items-center gap-2"><FileStack aria-hidden className="size-3.5" />{kindKey ? t(kindKey) : document.attrs.kind}</span><VerificationBadge verification={document.verification} /></span>; })}</div>)}</div><div className="grid gap-2"><p className="text-xs font-bold text-ink">{t("marriageWitnesses")}</p><div className="grid gap-2 sm:grid-cols-2">{witnessCandidates.map((witness) => { const selected = selectedWitnesses.includes(witness.id); return <button aria-pressed={selected} className={`flex min-h-14 items-center justify-between rounded-[3px] border px-4 text-left text-sm font-bold transition ${selected ? "border-green-deep bg-green-tint text-green-deep" : "border-paper-line bg-panel"}`} key={witness.id} onClick={() => toggleWitness(witness.id)} type="button"><span>{witness.attrs.name}</span>{selected ? <Check aria-hidden className="size-4" /> : null}</button>; })}</div></div><Button disabled={selectedWitnesses.length !== 2} onClick={reuseDocuments}>{t("marriageUseDocuments")} <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : currentStep === 3 ? (
    <StepCard eyebrow="Jayanagar, Bengaluru" title={t("marriageAppointmentTitle")} body={t("marriageAppointmentBody", { count: application?.attrs.witnesses?.length ?? 0 })}><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-[3px] bg-paper-line p-4"><CalendarCheck aria-hidden className="mb-4 size-5 text-green-deep" /><strong className="block text-sm">{t("marriageAppointmentSlot", { date: formatDate("2026-09-03", language) })}</strong><span className="text-xs text-ink-mute">{t("marriageRegistrar")}</span></div><div className="rounded-[3px] bg-paper-line p-4"><IndianRupee aria-hidden className="mb-4 size-5 text-green-deep" /><strong className="block text-sm">{t("marriageRegistrationFee")}</strong><span className="text-xs text-ink-mute">Karnataka One · {t("simulated").toLowerCase()}</span></div></div><Button loading={loading} onClick={() => void appointment()}>{t("marriageBookAndPay")} <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : (
    <StepCard eyebrow={application?.attrs.reference} title={t("marriageConfirmTitle")} body={t("marriageConfirmBody", { date: application?.attrs.appointmentOn ? formatDate(application.attrs.appointmentOn, language) : formatDate("2026-09-03", language) })}><div className="flex items-center justify-between gap-4 rounded-[3px] bg-green-tint p-4"><div><strong className="block text-sm">{t("marriageSpouseRelationship")}</strong><span className="text-xs text-ink-mute">Arjun Sharma ↔ Priya Patel</span></div><SimulatedChip authority="Kaveri Online Services" /></div><Button loading={loading} onClick={() => void register()}>{t("marriageRegisterAction")} <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  );

  return <ProcedureShell authority="Kaveri Online Services + Karnataka One" complete={complete} outcomeTargetId={application?.id} currentStep={currentStep} description={t("marriageWorkflowBody")} procedureId="marriage-arjun-priya" steps={steps} title={t("marriageWorkflowTitle")}><div className="grid gap-5">{complete ? <MarriageFamilyCue names={[arjun.attrs.name, priya.attrs.name]} /> : <ParticipantStrip left={{ name: initiator.attrs.name, status: initiatorStatus, tone: complete || currentStep > 0 ? "success" : "info" }} right={{ name: partner.attrs.name, status: partnerStatus, tone: complete || currentStep > 1 ? "success" : "warning" }} />}{error ? <p className="rounded-[2px] bg-brick-tint p-3 text-sm font-semibold text-brick" role="alert">{error}</p> : null}{content}</div></ProcedureShell>;
}
