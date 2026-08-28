"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getApplications, getEmployment, getNotices } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import type { Language, MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { registerEpfoGrievance } from "@/lib/mockGov";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [
    { id: "passbook", title: "Check passbook", description: "UAN, employer and current balance." },
    { id: "contribution", title: "Review contribution", description: "Check the latest credited amount." },
    { id: "action", title: "Choose action", description: "Close the check or register a grievance." },
  ],
  hi: [
    { id: "passbook", title: "पासबुक जाँचें", description: "UAN, नियोक्ता और मौजूदा बैलेंस।" },
    { id: "contribution", title: "अंशदान जाँचें", description: "नवीनतम जमा राशि देखें।" },
    { id: "action", title: "कार्रवाई चुनें", description: "जाँच बंद करें या शिकायत दर्ज करें।" },
  ],
  kn: [
    { id: "passbook", title: "ಪಾಸ್‌ಬುಕ್ ನೋಡಿ", description: "UAN, ಉದ್ಯೋಗದಾತ ಮತ್ತು ಈಗಿನ ಬಾಕಿ." },
    { id: "contribution", title: "ವಂತಿಗೆ ಪರಿಶೀಲಿಸಿ", description: "ಇತ್ತೀಚಿನ ಜಮೆ ಮೊತ್ತ ನೋಡಿ." },
    { id: "action", title: "ಕ್ರಮ ಆರಿಸಿ", description: "ಪರಿಶೀಲನೆ ಮುಗಿಸಿ ಅಥವಾ ದೂರು ದಾಖಲಿಸಿ." },
  ],
};

const issueKeys: MessageKey[] = ["epfoIssueWrongAmount", "epfoIssueMissing", "epfoIssueEmployer"];

type Screen = "passbook" | "contribution" | "issue" | "checked";

export function EpfoWorkflow() {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [screen, setScreen] = useState<Screen>("passbook");
  const [issueKey, setIssueKey] = useState<MessageKey>(issueKeys[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!personId) return null;

  const employment = getEmployment(graph, personId);
  const notice = getNotices(graph, personId).find((candidate) => candidate.node.id === "ntc:epfo-passbook");
  const application = getApplications(graph, personId).find((candidate) => candidate.attrs.kind === "epfo-grievance");
  const submitted = application?.attrs.status === "submitted";
  const currentStep = submitted || screen === "checked" ? 3 : screen === "issue" ? 2 : screen === "contribution" ? 1 : 0;

  if (!employment || !notice) {
    return (
      <ProcedureShell authority={t("epfoAuthority")} currentStep={0} procedureId="epfo-grievance" showProgress={false} steps={stepsByLanguage[language]} title={t("epfoWorkflowTitle")}>
        <StepCard eyebrow={t("profileScopeEyebrow")} title={t("profileScopeTitle")} body={t("epfoUnavailableBody")}>
          <LinkButton href="/services" variant="secondary">{t("back")}</LinkButton>
        </StepCard>
      </ProcedureShell>
    );
  }

  const submitGrievance = async () => {
    if (application) return;
    setLoading(true);
    setError("");
    try {
      const response = await registerEpfoGrievance({ employmentId: employment.id, issue: issueKey, memberId: personId });
      const personKey = personId.slice("person:".length);
      const applicationId = `app:${personKey}-epfo-grievance`;
      const mutations: GraphMutation[] = [
        {
          type: "addNode",
          node: {
            id: applicationId,
            type: "application",
            attrs: {
              title: t("epfoService"),
              authority: t("epfoAuthority"),
              status: "submitted",
              createdOn: "2026-08-28",
              submittedOn: "2026-08-28",
              relatedTo: employment.id,
              kind: "epfo-grievance",
              participants: [personId],
              currentStep: 3,
              reference: response.data.grievanceReference,
              note: t(issueKey),
            },
            verification: { source: "EPFO", state: "pending", asOf: "2026-08-28" },
          },
        },
        {
          type: "addEdge",
          edge: {
            id: `e:${personKey}-subject-epfo-grievance`,
            type: "subjectOf",
            from: personId,
            to: applicationId,
            attrs: {},
            validFrom: "2026-08-28",
            status: "active",
            verification: { source: "EPFO", state: "pending", asOf: "2026-08-28" },
          },
        },
      ];
      commit({ actorId: personId, labelKey: "eventEpfoGrievanceRegistered", procedureId: "epfo-grievance", mutations });
    } catch {
      setError(t("epfoServiceError"));
    } finally {
      setLoading(false);
    }
  };

  const content = submitted ? (
    <CompletionCard title={t("epfoGrievanceCompleteTitle")} body={t("epfoGrievanceCompleteBody", { reference: application.attrs.reference ?? "—" })}>
      <div className="grid gap-2 text-paper"><span className="text-xs text-paper/65">{t("epfoReference")}</span><strong className="font-display text-xl tabular-nums">{application.attrs.reference}</strong></div>
      <LinkButton href="/home#attention" variant="inverse">{t("returnHome")} <ArrowRight aria-hidden className="size-4" /></LinkButton>
    </CompletionCard>
  ) : screen === "checked" ? (
    <CompletionCard title={t("epfoNoActionTitle")} body={t("epfoNoActionBody")}>
      <LinkButton href="/home" variant="inverse">{t("returnHome")}</LinkButton>
    </CompletionCard>
  ) : screen === "passbook" ? (
    <StepCard eyebrow={t("epfoPassbookLabel")} title={t("epfoPassbookTitle")} body={t("epfoPassbookBody")}>
      <dl className="grid grid-cols-2 border-y border-paper-line sm:grid-cols-3 sm:divide-x sm:divide-paper-line">
        <div className="grid min-w-0 gap-1 py-3 pr-3 sm:px-4 sm:first:pl-0"><dt className="text-xs text-ink-mute">UAN</dt><dd className="font-display text-base font-bold tabular-nums [overflow-wrap:anywhere] sm:text-lg">{employment.attrs.uan ?? "—"}</dd></div>
        <div className="grid min-w-0 gap-1 border-l border-paper-line py-3 pl-3 sm:border-l-0 sm:px-4"><dt className="text-xs text-ink-mute">{t("epfoBalance")}</dt><dd className="font-display text-base font-bold tabular-nums sm:text-lg">{formatCurrency(employment.attrs.epfBalance ?? 0)}</dd></div>
        <div className="col-span-2 grid gap-1 border-t border-paper-line py-3 sm:col-span-1 sm:border-t-0 sm:px-4 sm:last:pr-0"><dt className="text-xs text-ink-mute">{t("epfoEmployer")}</dt><dd className="text-sm font-bold leading-5">{employment.attrs.employer}</dd></div>
      </dl>
      <Button onClick={() => setScreen("contribution")}>{t("epfoReviewContribution")} <ArrowRight aria-hidden className="size-4" /></Button>
    </StepCard>
  ) : screen === "contribution" ? (
    <StepCard title={t("epfoContributionTitle")} body={t("epfoContributionBody")}>
      <div className="grid gap-4 border-y border-paper-line py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="grid gap-1"><span className="text-xs text-ink-mute">{t("epfoLatestContribution")}{notice.node.attrs.period ? ` · ${formatMonthYear(notice.node.attrs.period, language)}` : ""}</span>{notice.node.attrs.amount !== undefined ? <strong className="font-display text-3xl font-bold tabular-nums">{formatCurrency(notice.node.attrs.amount)}</strong> : null}</div>
        <VerificationBadge verification={notice.node.verification} />
      </div>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button onClick={() => setScreen("checked")}>{t("epfoContributionMatches")}</Button>
        <button className="min-h-11 px-2 text-sm font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4" onClick={() => setScreen("issue")} type="button">{t("epfoReportIssue")}</button>
      </div>
    </StepCard>
  ) : (
    <StepCard title={t("epfoReportIssue")} body={t("epfoContributionBody")}>
      <fieldset className="grid gap-2"><legend className="mb-2 text-sm font-bold">{t("epfoIssueLabel")}</legend>{issueKeys.map((key) => <label className="flex min-h-12 cursor-pointer items-center gap-3 border-y border-paper-line px-1 py-3 text-sm" key={key}><input checked={issueKey === key} name="epfo-issue" onChange={() => setIssueKey(key)} type="radio" /><span>{t(key)}</span></label>)}</fieldset>
      {error ? <p className="text-sm font-bold text-brick" role="alert">{error}</p> : null}
      <Button loading={loading} onClick={() => void submitGrievance()}>{t("epfoSubmitGrievance")} <ArrowRight aria-hidden className="size-4" /></Button>
    </StepCard>
  );

  return (
    <ProcedureShell authority={t("epfoAuthority")} complete={submitted || screen === "checked"} currentStep={currentStep} description={t("epfoWorkflowBody")} procedureId="epfo-grievance" steps={stepsByLanguage[language]} title={t("epfoWorkflowTitle")}>
      {content}
    </ProcedureShell>
  );
}
