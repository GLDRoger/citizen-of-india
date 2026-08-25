"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Building2, CarFront, FileCheck2, HeartHandshake, Landmark, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getOwnedAssets, getPerson } from "@/features/graph/selectors";
import type { GraphMutation, Verification } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency, formatDate, getInitials, maskIdentifier } from "@/lib/format";
import { issueDeathCertificate, registerDeath, requestFamilyConsent, submitClaim } from "@/lib/mockGov";
import { FamilyBriefing } from "../components/family-briefing";
import { ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [
    { id: "identify", title: "Confirm family member", description: "Use verified family relationships." },
    { id: "register", title: "Register the death", description: "Prepare a simulated BBMP registration." },
    { id: "certificate", title: "Issue the certificate", description: "Create one reusable document." },
    { id: "benefits", title: "Pension and nominee", description: "Stop the old pension and start claims." },
    { id: "heirs", title: "Legal-heir consent", description: "Collect consent across the family." },
    { id: "finish", title: "Review downstream work", description: "Keep property and vehicle actions visible." },
  ],
  hi: [
    { id: "identify", title: "परिवार के सदस्य की पुष्टि", description: "सत्यापित रिश्तों से सही व्यक्ति चुनें।" },
    { id: "register", title: "मृत्यु पंजीकरण", description: "सिम्युलेटेड BBMP पंजीकरण तैयार करें।" },
    { id: "certificate", title: "प्रमाणपत्र जारी करें", description: "एक दस्तावेज़, कई प्रक्रियाओं में उपयोग।" },
    { id: "benefits", title: "पेंशन और नॉमिनी", description: "पुरानी पेंशन रोकें और दावे शुरू करें।" },
    { id: "heirs", title: "कानूनी वारिस की सहमति", description: "परिवार की सहमति एक जगह लें।" },
    { id: "finish", title: "बाकी काम देखें", description: "संपत्ति और वाहन के काम खुले रखें।" },
  ],
  kn: [
    { id: "identify", title: "ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ಖಚಿತಪಡಿಸಿ", description: "ಪರಿಶೀಲಿಸಿದ ಸಂಬಂಧಗಳಿಂದ ಸರಿಯಾದ ವ್ಯಕ್ತಿಯನ್ನು ಆರಿಸಿ." },
    { id: "register", title: "ಮರಣ ನೋಂದಣಿ", description: "ಅನುಕರಿಸಿದ BBMP ನೋಂದಣಿ ಸಿದ್ಧಪಡಿಸಿ." },
    { id: "certificate", title: "ಪ್ರಮಾಣಪತ್ರ ನೀಡಿ", description: "ಒಂದು ದಾಖಲೆಯನ್ನು ಹಲವು ಕ್ರಮಗಳಲ್ಲಿ ಬಳಸಿ." },
    { id: "benefits", title: "ಪಿಂಚಣಿ ಮತ್ತು ನಾಮಿನಿ", description: "ಹಳೆಯ ಪಿಂಚಣಿ ನಿಲ್ಲಿಸಿ ಹಕ್ಕು ಪ್ರಾರಂಭಿಸಿ." },
    { id: "heirs", title: "ಕಾನೂನು ವಾರಸುದಾರರ ಒಪ್ಪಿಗೆ", description: "ಕುಟುಂಬದ ಒಪ್ಪಿಗೆ ಪಡೆಯಿರಿ." },
    { id: "finish", title: "ಮುಂದಿನ ಕೆಲಸ ಪರಿಶೀಲಿಸಿ", description: "ಆಸ್ತಿ ಮತ್ತು ವಾಹನ ಕ್ರಮಗಳನ್ನು ಕಾಣಿಸಿ." },
  ],
};

function sourceVerification(source: "Municipal" | "EPFO" | "Self" = "Self"): Verification {
  return { source, state: source === "Self" ? "self-declared" : "verified", asOf: "2026-08-24" };
}

export function DeathWorkflow() {
  const router = useRouter();
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const switchPersona = useAuthStore((state) => state.switchPersona);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!personId) return null;
  const rajesh = getPerson(graph, "person:rajesh");
  const sunita = getPerson(graph, "person:sunita");
  if (!rajesh || !sunita) return null;
  const application = graph.nodes
    .filter((node) => node.type === "application")
    .find((node) => node.id === "app:death-rajesh");
  const currentStep = application?.attrs.currentStep ?? 0;
  const complete = application?.attrs.status === "completed";
  const steps = stepsByLanguage[language];

  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await action();
    } catch {
      setError(t("deathServiceError"));
    } finally {
      setLoading(false);
    }
  };

  const identify = () => {
    const mutations: GraphMutation[] = [
      {
        type: "addNode",
        node: {
          id: "app:death-rajesh",
          type: "application",
          attrs: { title: "Death registration and family actions", authority: "BBMP", status: "draft", createdOn: "2026-08-24", relatedTo: rajesh.id, kind: "death", participants: [personId, "person:sunita", "person:kavita"], currentStep: 1 },
          verification: sourceVerification(),
        },
      },
      { type: "addEdge", edge: { id: `e:${personId.slice(7)}-subject-death-rajesh`, type: "subjectOf", from: personId, to: "app:death-rajesh", attrs: {}, validFrom: "2026-08-24", status: "active", verification: sourceVerification() } },
    ];
    commit({ actorId: personId, labelKey: "eventRajeshConfirmed", procedureId: "death-rajesh", mutations });
  };

  const register = () => run(async () => {
    const response = await registerDeath({ deceasedName: rajesh.attrs.name, date: "2026-08-24", reporterId: personId });
    const mutations: GraphMutation[] = [
      { type: "patchAttrs", nodeId: rajesh.id, attrs: { deceasedOn: "2026-08-24", pension: rajesh.attrs.pension ? { ...rajesh.attrs.pension, status: "ended" } : undefined }, verification: { source: "Municipal", state: "verified", asOf: "2026-08-24", note: "Death registration confirmed by the simulated municipal service." } },
      { type: "patchAttrs", nodeId: sunita.id, attrs: { maritalStatus: "widowed" } },
      { type: "endEdge", edgeId: "e:rajesh-spouseof-sunita", validTo: "2026-08-24" },
      { type: "patchAttrs", nodeId: "app:death-rajesh", attrs: { currentStep: 2, reference: response.data.registrationId, status: "processing" }, verification: sourceVerification("Municipal") },
    ];
    commit({ actorId: personId, labelKey: "eventDeathRegistered", procedureId: "death-rajesh", mutations });
  });

  const issueCertificate = () => run(async () => {
    const response = await issueDeathCertificate({ deceasedName: rajesh.attrs.name, registrationId: application?.attrs.reference ?? "BBMP-DR-PENDING" });
    const mutations: GraphMutation[] = [
      { type: "addNode", node: { id: "doc:rajesh-death-certificate", type: "document", attrs: { kind: "death-certificate", holderName: rajesh.attrs.name, numberMasked: maskIdentifier(response.data.certificateNumber), issuedOn: response.data.issuedOn, authority: response.authority, downloaded: true }, verification: sourceVerification("Municipal") } },
      { type: "addEdge", edge: { id: "e:arjun-holds-rajesh-death-certificate", type: "holds", from: "person:arjun", to: "doc:rajesh-death-certificate", attrs: {}, validFrom: "2026-08-24", status: "active", verification: sourceVerification("Municipal") } },
      { type: "addEdge", edge: { id: "e:sunita-holds-rajesh-death-certificate", type: "holds", from: "person:sunita", to: "doc:rajesh-death-certificate", attrs: {}, validFrom: "2026-08-24", status: "active", verification: sourceVerification("Municipal") } },
      { type: "patchAttrs", nodeId: "app:death-rajesh", attrs: { currentStep: 3 } },
    ];
    commit({ actorId: personId, labelKey: "eventDeathCertificateSaved", procedureId: "death-rajesh", mutations });
  });

  const startClaims = () => run(async () => {
    const [pension, epf] = await Promise.all([
      submitClaim({ kind: "EPS family pension", claimantId: sunita.id }),
      submitClaim({ kind: "EPF nominee settlement", claimantId: sunita.id }),
    ]);
    const applications: GraphMutation[] = [
      { type: "addNode", node: { id: "app:sunita-family-pension", type: "application", attrs: { title: "EPS-95 family pension", authority: "EPFO", status: "submitted", createdOn: "2026-08-24", submittedOn: "2026-08-24", relatedTo: "ben:eps-family-pension", kind: "benefit", participants: [sunita.id], reference: pension.data.claimReference }, verification: sourceVerification("EPFO") } },
      { type: "addEdge", edge: { id: "e:sunita-subject-family-pension-app", type: "subjectOf", from: sunita.id, to: "app:sunita-family-pension", attrs: {}, validFrom: "2026-08-24", status: "active", verification: sourceVerification("EPFO") } },
      { type: "addNode", node: { id: "app:sunita-epf-nominee-claim", type: "application", attrs: { title: "Rajesh Sharma EPF nominee claim", authority: "EPFO", status: "submitted", createdOn: "2026-08-24", submittedOn: "2026-08-24", relatedTo: "emp:rajesh-kswc", kind: "claim", participants: [sunita.id], reference: epf.data.claimReference }, verification: sourceVerification("EPFO") } },
      { type: "addEdge", edge: { id: "e:sunita-subject-epf-claim-app", type: "subjectOf", from: sunita.id, to: "app:sunita-epf-nominee-claim", attrs: {}, validFrom: "2026-08-24", status: "active", verification: sourceVerification("EPFO") } },
      { type: "patchAttrs", nodeId: "app:death-rajesh", attrs: { currentStep: 4 } },
    ];
    commit({ actorId: personId, labelKey: "eventDeathClaimsSubmitted", procedureId: "death-rajesh", mutations: applications });
  });

  const collectHeirConsent = () => run(async () => {
    await requestFamilyConsent({ participantName: "Kavita Verma", procedureId: "death-rajesh" });
    const heirs = [
      { id: "person:sunita", label: "sunita", share: 0.34 },
      { id: "person:arjun", label: "arjun", share: 0.33 },
      { id: "person:kavita", label: "kavita", share: 0.33 },
    ];
    const mutations: GraphMutation[] = heirs.map((heir) => ({ type: "addEdge", edge: { id: `e:${heir.label}-legalheir-rajesh`, type: "legalHeirOf", from: heir.id, to: rajesh.id, attrs: { share: heir.share, consent: "granted" }, validFrom: "2026-08-24", status: "active", verification: sourceVerification() } }));
    mutations.push({ type: "patchAttrs", nodeId: "app:death-rajesh", attrs: { currentStep: 5 } });
    commit({ actorId: personId, labelKey: "eventHeirConsentReceived", procedureId: "death-rajesh", mutations });
  });

  const assets = getOwnedAssets(graph, rajesh.id);
  const finish = () => {
    const downstreamMutations = assets.flatMap((asset): GraphMutation[] => {
      if (asset.type !== "property" && asset.type !== "vehicle") return [];
      const assetKey = asset.id.replace(":", "-");
      const title = asset.type === "property" ? "Property succession mutation" : "Vehicle ownership transfer";
      const authority = asset.type === "property" ? asset.attrs.authority : asset.attrs.rto;
      return [
        { type: "addNode", node: { id: `app:rajesh-${assetKey}-succession`, type: "application", attrs: { title, authority, status: "draft", createdOn: "2026-08-24", relatedTo: asset.id, kind: asset.type === "property" ? "property-mutation" : "vehicle-transfer", participants: ["person:sunita", "person:arjun", "person:kavita"], note: "Created as a family next action; no ownership changed automatically." }, verification: sourceVerification() } },
        { type: "addEdge", edge: { id: `e:arjun-subject-${assetKey}-succession`, type: "subjectOf", from: "person:arjun", to: `app:rajesh-${assetKey}-succession`, attrs: {}, validFrom: "2026-08-24", status: "active", verification: sourceVerification() } },
      ];
    });
    commit({ actorId: personId, labelKey: "eventDeathJourneyCompleted", procedureId: "death-rajesh", mutations: [...downstreamMutations, { type: "patchAttrs", nodeId: "app:death-rajesh", attrs: { currentStep: 6, status: "completed" }, verification: sourceVerification("Municipal") }] });
  };

  const openSunitaEligibility = () => {
    switchPersona("person:sunita");
    router.push("/discover");
  };

  const relationshipTitle = personId === "person:sunita" ? t("deathRelationshipHusband") : personId === "person:arjun" ? t("deathRelationshipFather") : t("deathRelationshipFamily");
  const relationshipBody = personId === "person:sunita" ? t("deathSpouseFound") : t("deathFamilyFound");
  const content = complete ? (
    <FamilyBriefing onViewSunita={openSunitaEligibility} />
  ) : currentStep === 0 ? (
    <StepCard eyebrow={t("deathVerifiedFamilyRecords")} title={relationshipTitle} body={`${relationshipBody} ${t("deathConfirmBeforeChange")}`}><div className="grid gap-4 rounded-[8px] bg-paper-line p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"><span className="grid size-12 place-items-center rounded-[50%] border border-paper-line bg-paper-shade font-display text-sm font-bold text-ink">{getInitials(rajesh.attrs.name)}</span><div><strong className="block text-ink">{rajesh.attrs.name}</strong><span className="text-xs text-ink-mute">{t("deathPensionerLocation")}</span></div><VerificationBadge verification={rajesh.verification} /></div><Button onClick={identify}>{t("deathConfirmRajesh")} <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : currentStep === 1 ? (
    <StepCard eyebrow={t("deathRegistryAuthority")} title={t("deathReviewRegistration")} body={t("deathReviewRegistrationBody")}><div className="grid gap-3 rounded-[8px] bg-paper-line p-4 text-sm"><span className="flex justify-between gap-3"><span className="text-ink-mute">{t("fieldName")}</span><strong>{rajesh.attrs.name}</strong></span><span className="flex justify-between gap-3"><span className="text-ink-mute">{t("fieldDate")}</span><strong>{formatDate("2026-08-24", language)}</strong></span><span className="flex justify-between gap-3"><span className="text-ink-mute">{t("fieldReporter")}</span><strong>{getPerson(graph, personId)?.attrs.name}</strong></span></div><Button loading={loading} onClick={() => void register()}>{t("deathRegisterAction")} <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : currentStep === 2 ? (
    <StepCard eyebrow={application?.attrs.reference} title={t("deathCertificateTitle")} body={t("deathCertificateBody")}><div className="flex items-center gap-4 rounded-[8px] bg-green-tint p-4"><FileCheck2 aria-hidden className="size-7 text-green-deep" /><div><strong className="block text-ink">{t("documentDeathCertificate")}</strong><span className="text-xs text-ink-mute">{t("deathCertificateVerified")}</span></div></div><Button loading={loading} onClick={() => void issueCertificate()}>{t("deathIssueCertificate")} <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : currentStep === 3 ? (
    <StepCard eyebrow="EPFO" title={t("deathClaimsTitle")} body={t("deathClaimsBody")}><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-[8px] bg-paper-line p-4"><Landmark aria-hidden className="mb-5 size-5 text-green-deep" /><strong className="block text-sm">{t("deathFamilyPension")}</strong><span className="text-xs text-ink-mute">≈ {t("monthlyAmount", { amount: "₹4,100" })}</span></div><div className="rounded-[8px] bg-paper-line p-4"><HeartHandshake aria-hidden className="mb-5 size-5 text-green-deep" /><strong className="block text-sm">{t("deathEpfClaim")}</strong><span className="text-xs text-ink-mute">{formatCurrency(rajesh.attrs.epf?.balance ?? 0)}</span></div></div><Button loading={loading} onClick={() => void startClaims()}>{t("deathSubmitClaims")} <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : currentStep === 4 ? (
    <StepCard eyebrow={t("deathSharedWorkflow")} title={t("deathConsentTitle")} body={t("deathConsentBody")}><div className="grid gap-2">{["Sunita Sharma", "Arjun Sharma", "Kavita Verma"].map((name, index) => <div className="flex items-center justify-between rounded-[8px] bg-paper-line px-4 py-3 text-sm" key={name}><span>{name}</span><span className={index < 2 ? "text-green-deep" : "text-brick"}>{index < 2 ? t("ready") : t("pending")}</span></div>)}</div><Button loading={loading} onClick={() => void collectHeirConsent()}><ShieldCheck aria-hidden className="size-4" />{t("deathRequestConsent")}</Button></StepCard>
  ) : (
    <StepCard eyebrow={t("deathKeepVisible")} title={t("deathDownstreamTitle")} body={t("deathDownstreamBody")}><div className="grid gap-3 sm:grid-cols-2">{assets.map((asset) => <div className="flex items-center gap-3 rounded-[8px] bg-paper-line p-4" key={asset.id}>{asset.type === "property" ? <Building2 aria-hidden className="size-5 text-brick" /> : <CarFront aria-hidden className="size-5 text-green-deep" />}<div className="min-w-0"><strong className="block truncate text-sm">{asset.type === "property" ? asset.attrs.authority : asset.type === "vehicle" ? `${asset.attrs.make} ${asset.attrs.model}` : "—"}</strong><span className="text-xs text-ink-mute">{t("deathSuccessionDraft")}</span></div></div>)}</div><Button onClick={finish}>{t("deathCreateDrafts")} <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  );

  return <ProcedureShell authority={t("deathAuthority")} complete={complete} currentStep={currentStep} description={t("deathWorkflowBody")} procedureId="death-rajesh" steps={steps} title={t("deathWorkflowTitle")}>{error ? <p className="mb-3 rounded-xl bg-brick-tint p-3 text-sm font-semibold text-brick" role="alert">{error}</p> : null}{content}</ProcedureShell>;
}
