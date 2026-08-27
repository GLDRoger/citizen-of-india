"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getApplications, getNodeByType } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { localizeNodeTitle } from "@/i18n/content";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { submitBenefitApplication } from "@/lib/mockGov";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [
    { id: "review", title: "Review scheme", description: "Cover, premium and eligibility." },
    { id: "submit", title: "Submit application", description: "Create a simulated application reference." },
  ],
  hi: [
    { id: "review", title: "योजना जाँचें", description: "कवर, प्रीमियम और पात्रता।" },
    { id: "submit", title: "आवेदन जमा करें", description: "सिम्युलेटेड आवेदन संदर्भ बनाएँ।" },
  ],
  kn: [
    { id: "review", title: "ಯೋಜನೆ ಪರಿಶೀಲಿಸಿ", description: "ರಕ್ಷಣೆ, ಪ್ರೀಮಿಯಂ ಮತ್ತು ಅರ್ಹತೆ." },
    { id: "submit", title: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ", description: "ಅನುಕರಿತ ಅರ್ಜಿ ಉಲ್ಲೇಖ ರಚಿಸಿ." },
  ],
};

export function BenefitApplicationWorkflow() {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [understood, setUnderstood] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!personId) return null;

  const application = getApplications(graph, personId).find((candidate) => candidate.attrs.kind === "benefit");
  const benefit = application?.attrs.relatedTo
    ? getNodeByType(graph, application.attrs.relatedTo, "benefit")
    : undefined;
  const submitted = application?.attrs.status === "submitted";

  const submit = async () => {
    if (!application || !benefit || submitted || !understood) return;
    setLoading(true);
    setError("");
    try {
      const response = await submitBenefitApplication({ benefitId: benefit.id, applicantId: personId });
      const mutations: GraphMutation[] = [{
        type: "patchAttrs",
        nodeId: application.id,
        attrs: {
          status: "submitted",
          submittedOn: "2026-08-27",
          currentStep: 2,
          reference: response.data.applicationReference,
          note: "Simulated scheme application submitted without collecting bank details.",
        },
        verification: { source: "Self", state: "pending", asOf: "2026-08-27" },
      }];
      commit({ actorId: personId, labelKey: "eventBenefitApplicationSubmitted", procedureId: "benefit-application", mutations });
    } catch {
      setError(t("benefitApplicationError"));
    } finally {
      setLoading(false);
    }
  };

  const content = !application || !benefit ? (
    <StepCard title={t("benefitDraftMissingTitle")} body={t("benefitDraftMissingBody")}>
      <LinkButton href="/discover" variant="secondary">{t("discover")}</LinkButton>
    </StepCard>
  ) : submitted ? (
    <CompletionCard title={t("benefitCompleteTitle")} body={t("benefitCompleteBody", { reference: application.attrs.reference ?? "—" })}>
      <div className="grid gap-2 text-paper"><span className="text-xs text-paper/65">{t("benefitReference")}</span><strong className="font-display text-xl tabular-nums">{application.attrs.reference}</strong></div>
      <LinkButton href="/home#attention" variant="inverse">{t("returnHome")} <ArrowRight aria-hidden className="size-4" /></LinkButton>
    </CompletionCard>
  ) : (
    <StepCard title={t("benefitReviewTitle")} body={t("benefitReviewBody")}>
      <div className="grid gap-4 border-y border-paper-line py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="grid gap-2"><span className="text-xs font-bold text-ink-mute">{benefit.attrs.authority}</span><strong className="font-display text-2xl font-semibold leading-tight">{localizeNodeTitle(language, benefit.id, benefit.attrs.name)}</strong><span className="text-sm font-bold text-indigo-deep">{benefit.attrs.valuePerYear}</span></div>
        <SimulatedChip authority={benefit.attrs.authority} />
      </div>
      <label className="flex min-h-12 cursor-pointer items-start gap-3 border-b border-paper-line py-3 text-sm leading-6"><input checked={understood} className="mt-1 size-4" onChange={(event) => setUnderstood(event.target.checked)} type="checkbox" /><span>{t("benefitConsent")}</span></label>
      {error ? <p className="text-sm font-bold text-brick" role="alert">{error}</p> : null}
      <Button disabled={!understood} loading={loading} onClick={() => void submit()}>{t("benefitSubmit")} <ArrowRight aria-hidden className="size-4" /></Button>
    </StepCard>
  );

  return <ProcedureShell authority={benefit?.attrs.authority ?? t("simulatedResponse")} complete={submitted} currentStep={submitted ? 2 : application ? 1 : 0} procedureId="benefit-application" steps={stepsByLanguage[language]} title={t("benefitReviewTitle")}>{content}</ProcedureShell>;
}
