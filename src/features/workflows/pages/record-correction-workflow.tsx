"use client";

import { ArrowRight, Check, FileCheck2 } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getApplications, getDocuments, getPerson } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { submitPanCorrection } from "@/lib/mockGov";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [
    { id: "compare", title: "Compare the records", description: "See the conflicting names and sources." },
    { id: "review", title: "Review the request", description: "Know what will and will not change." },
    { id: "submit", title: "Track the correction", description: "Keep the PAN pending until a response arrives." },
  ],
  hi: [
    { id: "compare", title: "रिकॉर्ड मिलाएँ", description: "अलग नाम और उनके स्रोत देखें।" },
    { id: "review", title: "अनुरोध जाँचें", description: "जानें कि क्या बदलेगा और क्या नहीं।" },
    { id: "submit", title: "सुधार की स्थिति देखें", description: "जवाब आने तक PAN को लंबित रखें।" },
  ],
  kn: [
    { id: "compare", title: "ದಾಖಲೆಗಳನ್ನು ಹೋಲಿಸಿ", description: "ಬೇರೆ ಹೆಸರುಗಳು ಮತ್ತು ಅವುಗಳ ಮೂಲ ನೋಡಿ." },
    { id: "review", title: "ವಿನಂತಿ ಪರಿಶೀಲಿಸಿ", description: "ಏನು ಬದಲಾಗುತ್ತದೆ, ಏನು ಬದಲಾಗುವುದಿಲ್ಲ ತಿಳಿಯಿರಿ." },
    { id: "submit", title: "ತಿದ್ದುಪಡಿ ಸ್ಥಿತಿ ನೋಡಿ", description: "ಉತ್ತರ ಬರುವವರೆಗೆ PAN ಅನ್ನು ಬಾಕಿ ಇರಿಸಿ." },
  ],
};

export function RecordCorrectionWorkflow() {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!personId) return null;

  const person = getPerson(graph, personId);
  const documents = getDocuments(graph, personId);
  const pan = documents.find((document) => document.attrs.kind === "pan");
  const aadhaar = documents.find((document) => document.attrs.kind === "aadhaar");
  const application = getApplications(graph, personId).find((candidate) => candidate.id === "app:pan-name-correction");
  const submitted = application?.attrs.status === "submitted";
  const canSubmit = person && pan?.verification.state === "mismatch" && application?.attrs.status === "draft";
  const steps = stepsByLanguage[language];

  const submit = async () => {
    if (!canSubmit || !person || !pan || !application) return;
    setLoading(true);
    setError("");
    try {
      const response = await submitPanCorrection({ personId, correctedName: person.attrs.name });
      const mutations: GraphMutation[] = [
        {
          type: "patchAttrs",
          nodeId: pan.id,
          attrs: {},
          verification: {
            source: "NSDL",
            state: "pending",
            asOf: "2026-08-28",
            note: "A simulated name-correction request is pending. The current PAN name remains unchanged until a response arrives.",
          },
        },
        {
          type: "patchAttrs",
          nodeId: application.id,
          attrs: {
            kind: "record-correction",
            status: "submitted",
            submittedOn: "2026-08-28",
            reference: response.data.acknowledgement,
            note: "Simulated correction submitted. The PAN record has not been overwritten.",
          },
          verification: { source: "Self", state: "pending", asOf: "2026-08-28" },
        },
      ];
      commit({ actorId: personId, labelKey: "eventPanCorrectionSubmitted", procedureId: "record-correction", mutations });
    } catch {
      setError(t("recordCorrectionError"));
    } finally {
      setLoading(false);
    }
  };

  const content = submitted ? (
    <CompletionCard title={t("recordCorrectionCompleteTitle")} body={t("recordCorrectionCompleteBody", { reference: application.attrs.reference ?? "—" })}>
      <LinkButton href="/documents" variant="inverse">{t("viewDocuments")} <ArrowRight aria-hidden className="size-4" /></LinkButton>
    </CompletionCard>
  ) : canSubmit && person && pan && aadhaar ? (
    <StepCard eyebrow={t("recordCorrectionEyebrow")} title={t("recordCorrectionReviewTitle")} body={t("recordCorrectionReviewBody")}>
      <dl className="border-y border-paper-line">
        <div className="grid gap-2 border-b border-paper-line py-4 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-center"><dt className="text-xs font-bold text-ink-mute">{t("citizenRecord")}</dt><dd className="font-display text-xl font-semibold text-ink">{person.attrs.name}</dd><VerificationBadge verification={aadhaar.verification} /></div>
        <div className="grid gap-2 py-4 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-center"><dt className="text-xs font-bold text-ink-mute">{t("documentPan")}</dt><dd className="font-display text-xl font-semibold text-ink">{pan.attrs.holderName}</dd><VerificationBadge verification={pan.verification} /></div>
      </dl>
      <div className="grid gap-3 rounded-[8px] bg-green-tint p-5 text-sm leading-6 text-ink">
        <p className="flex gap-2"><Check aria-hidden className="mt-1 size-4 shrink-0 text-green-deep" />{t("recordCorrectionUses")}</p>
        <p className="flex gap-2"><Check aria-hidden className="mt-1 size-4 shrink-0 text-green-deep" />{t("recordCorrectionLeaves")}</p>
      </div>
      {error ? <p className="rounded-[4px] bg-brick-tint p-3 text-sm font-semibold text-brick" role="alert">{error}</p> : null}
      <Button loading={loading} onClick={() => void submit()}><FileCheck2 aria-hidden className="size-4" />{t("recordCorrectionSubmit")}</Button>
    </StepCard>
  ) : (
    <StepCard eyebrow={t("profileScopeEyebrow")} title={t("recordCorrectionUnavailableTitle")} body={t("recordCorrectionUnavailableBody")}>
      <LinkButton href="/documents" variant="secondary">{t("viewDocuments")}</LinkButton>
    </StepCard>
  );

  return (
    <ProcedureShell
      authority={t("recordCorrectionAuthority")}
      complete={submitted}
      currentStep={submitted ? 3 : 1}
      procedureId="record-correction"
      showProgress={Boolean(submitted || canSubmit)}
      steps={steps}
      title={t("recordCorrectionService")}
    >
      {content}
    </ProcedureShell>
  );
}
