"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Building2, CarFront, FileCheck2, HeartHandshake, Landmark, ShieldCheck, UsersRound } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getOwnedAssets, getPerson } from "@/features/graph/selectors";
import type { GraphMutation, Verification } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency, maskIdentifier } from "@/lib/format";
import { issueDeathCertificate, registerDeath, requestFamilyConsent, submitClaim } from "@/lib/mockGov";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

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
  const { language } = useI18n();
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
      setError("The simulated service did not respond. Your records were not changed.");
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
    commit({ actorId: personId, label: "Rajesh confirmed for death registration", procedureId: "death-rajesh", mutations });
  };

  const register = () => run(async () => {
    const response = await registerDeath({ deceasedName: rajesh.attrs.name, date: "2026-08-24", reporterId: personId });
    const mutations: GraphMutation[] = [
      { type: "patchAttrs", nodeId: rajesh.id, attrs: { deceasedOn: "2026-08-24", pension: rajesh.attrs.pension ? { ...rajesh.attrs.pension, status: "ended" } : undefined }, verification: { source: "Municipal", state: "verified", asOf: "2026-08-24", note: "Death registration confirmed by the simulated municipal service." } },
      { type: "patchAttrs", nodeId: sunita.id, attrs: { maritalStatus: "widowed" } },
      { type: "endEdge", edgeId: "e:rajesh-spouseof-sunita", validTo: "2026-08-24" },
      { type: "patchAttrs", nodeId: "app:death-rajesh", attrs: { currentStep: 2, reference: response.data.registrationId, status: "processing" }, verification: sourceVerification("Municipal") },
    ];
    commit({ actorId: personId, label: "Death registered with simulated BBMP service", procedureId: "death-rajesh", mutations });
  });

  const issueCertificate = () => run(async () => {
    const response = await issueDeathCertificate({ deceasedName: rajesh.attrs.name, registrationId: application?.attrs.reference ?? "BBMP-DR-PENDING" });
    const mutations: GraphMutation[] = [
      { type: "addNode", node: { id: "doc:rajesh-death-certificate", type: "document", attrs: { kind: "death-certificate", holderName: rajesh.attrs.name, numberMasked: maskIdentifier(response.data.certificateNumber), issuedOn: response.data.issuedOn, authority: response.authority, downloaded: true }, verification: sourceVerification("Municipal") } },
      { type: "addEdge", edge: { id: "e:arjun-holds-rajesh-death-certificate", type: "holds", from: "person:arjun", to: "doc:rajesh-death-certificate", attrs: {}, validFrom: "2026-08-24", status: "active", verification: sourceVerification("Municipal") } },
      { type: "addEdge", edge: { id: "e:sunita-holds-rajesh-death-certificate", type: "holds", from: "person:sunita", to: "doc:rajesh-death-certificate", attrs: {}, validFrom: "2026-08-24", status: "active", verification: sourceVerification("Municipal") } },
      { type: "patchAttrs", nodeId: "app:death-rajesh", attrs: { currentStep: 3 } },
    ];
    commit({ actorId: personId, label: "Death certificate issued and saved", procedureId: "death-rajesh", mutations });
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
    commit({ actorId: personId, label: "Family pension and EPF nominee claims submitted", procedureId: "death-rajesh", mutations: applications });
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
    commit({ actorId: personId, label: "Legal-heir consent received from all three heirs", procedureId: "death-rajesh", mutations });
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
    commit({ actorId: personId, label: "Death and family-actions journey completed", procedureId: "death-rajesh", mutations: [...downstreamMutations, { type: "patchAttrs", nodeId: "app:death-rajesh", attrs: { currentStep: 6, status: "completed" }, verification: sourceVerification("Municipal") }] });
  };

  const openSunitaEligibility = () => {
    switchPersona("person:sunita");
    router.push("/discover");
  };

  const relationshipTitle = personId === "person:sunita" ? "Is this your husband?" : personId === "person:arjun" ? "Is this your father?" : "Is this your family member?";
  const relationshipBody = personId === "person:sunita" ? "Citizen found one verified spouse relationship." : "Citizen found a verified family relationship.";
  const content = complete ? (
    <CompletionCard title="The family record is up to date." body="The certificate is reusable, pension and nominee claims are submitted, legal-heir consent is recorded, and property and vehicle transfer drafts remain visible."><div className="flex flex-wrap gap-2"><Button onClick={openSunitaEligibility} variant="inverse">See Sunita’s eligibility <ArrowRight aria-hidden className="size-4" /></Button><LinkButton href="/activity" variant="secondary">View audit trail</LinkButton></div></CompletionCard>
  ) : currentStep === 0 ? (
    <StepCard eyebrow="Verified family records" title={relationshipTitle} body={`${relationshipBody} Confirm the connected record before anything changes.`}><div className="grid gap-4 rounded-[18px] bg-surface-strong p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"><span className="grid size-12 place-items-center rounded-full bg-ink text-canvas"><UsersRound aria-hidden className="size-6" /></span><div><strong className="block text-ink">{rajesh.attrs.name}</strong><span className="text-xs text-ink-muted">EPS pensioner · Bengaluru</span></div><VerificationBadge verification={rajesh.verification} /></div><Button onClick={identify}>Confirm Rajesh <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : currentStep === 1 ? (
    <StepCard eyebrow="BBMP Births & Deaths" title="Review the registration" body="The form is prefilled from Rajesh’s verified identity and family records. This creates a simulated registration only."><div className="grid gap-3 rounded-[18px] bg-surface-strong p-4 text-sm"><span className="flex justify-between gap-3"><span className="text-ink-muted">Name</span><strong>{rajesh.attrs.name}</strong></span><span className="flex justify-between gap-3"><span className="text-ink-muted">Date</span><strong>24 Aug 2026</strong></span><span className="flex justify-between gap-3"><span className="text-ink-muted">Reporter</span><strong>{getPerson(graph, personId)?.attrs.name}</strong></span></div><Button loading={loading} onClick={() => void register()}>Register death <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : currentStep === 2 ? (
    <StepCard eyebrow={application?.attrs.reference} title="Create one reusable certificate" body="The certificate will be stored in Arjun’s document wallet and reused for pension, nominee and widow-pension checks."><div className="flex items-center gap-4 rounded-[18px] bg-action-soft p-4"><FileCheck2 aria-hidden className="size-7 text-action" /><div><strong className="block text-ink">Death certificate</strong><span className="text-xs text-ink-muted">Verified by simulated BBMP response</span></div></div><Button loading={loading} onClick={() => void issueCertificate()}>Issue certificate <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : currentStep === 3 ? (
    <StepCard eyebrow="EPFO" title="Start Sunita’s pension and nominee claims" body="Rajesh’s EPS pension is ended. The same certificate now supports family pension and the ₹6.1 lakh EPF nominee claim."><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-[16px] bg-surface-strong p-4"><Landmark aria-hidden className="mb-5 size-5 text-action" /><strong className="block text-sm">Family pension</strong><span className="text-xs text-ink-muted">≈ ₹4,100/month</span></div><div className="rounded-[16px] bg-surface-strong p-4"><HeartHandshake aria-hidden className="mb-5 size-5 text-action" /><strong className="block text-sm">EPF nominee claim</strong><span className="text-xs text-ink-muted">{formatCurrency(rajesh.attrs.epf?.balance ?? 0)}</span></div></div><Button loading={loading} onClick={() => void startClaims()}>Submit both claims <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : currentStep === 4 ? (
    <StepCard eyebrow="Shared family workflow" title="Collect legal-heir consent" body="Sunita and Arjun are ready. Kavita’s consent arrives asynchronously from Delhi through a simulated relay."><div className="grid gap-2">{["Sunita Sharma", "Arjun Sharma", "Kavita Verma · waiting"].map((name, index) => <div className="flex items-center justify-between rounded-[14px] bg-surface-strong px-4 py-3 text-sm" key={name}><span>{name}</span><span className={index < 2 ? "text-success" : "text-warning"}>{index < 2 ? "Ready" : "Pending"}</span></div>)}</div><Button loading={loading} onClick={() => void collectHeirConsent()}><ShieldCheck aria-hidden className="size-4" />Request Kavita’s consent</Button></StepCard>
  ) : (
    <StepCard eyebrow="Keep these visible" title="Create the property and vehicle next actions" body="Citizen will not transfer ownership automatically. It creates narrow drafts so the family can complete each succession process separately."><div className="grid gap-3 sm:grid-cols-2">{assets.map((asset) => <div className="flex items-center gap-3 rounded-[16px] bg-surface-strong p-4" key={asset.id}>{asset.type === "property" ? <Building2 aria-hidden className="size-5 text-saffron-ink" /> : <CarFront aria-hidden className="size-5 text-action" />}<div className="min-w-0"><strong className="block truncate text-sm capitalize">{asset.type === "property" ? asset.attrs.kind : asset.type === "vehicle" ? `${asset.attrs.make} ${asset.attrs.model}` : "Record"}</strong><span className="text-xs text-ink-muted">Succession draft will be created</span></div></div>)}</div><Button onClick={finish}>Create drafts and finish <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  );

  return <ProcedureShell authority="BBMP + EPFO + Citizen consent relay" complete={complete} currentStep={currentStep} description="One family event becomes a coordinated set of registrations, documents, benefits, nominee claims and consents." steps={steps} title="A death in the family">{error ? <p className="mb-3 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger" role="alert">{error}</p> : null}{content}</ProcedureShell>;
}
