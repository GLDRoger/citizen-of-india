"use client";

import { ArrowRight, Check, CircleHelp, FileWarning, Landmark, Scale, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip, StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getEligibility, getMoneySummary, getNodeByType } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { explainResponseSchema } from "@/features/inbox/schema";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { localizeRuleExplanation } from "@/i18n/content";
import { localizeEvidence } from "@/i18n/formatters";
import { formatCurrency, formatEvidence } from "@/lib/format";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [{ id: "evidence", title: "Check connected evidence", description: "Business, tax, and obligation records." }, { id: "compare", title: "Compare options", description: "Amount, term and tradeoffs." }, { id: "decide", title: "Explain risk", description: "See missing proof before applying." }],
  hi: [{ id: "evidence", title: "जुड़े प्रमाण जाँचें", description: "व्यवसाय, कर और दायित्व रिकॉर्ड।" }, { id: "compare", title: "विकल्पों की तुलना", description: "राशि, अवधि और समझौते।" }, { id: "decide", title: "जोखिम समझें", description: "आवेदन से पहले बाकी प्रमाण देखें।" }],
  kn: [{ id: "evidence", title: "ಸಂಪರ್ಕಿತ ಸಾಕ್ಷ್ಯ ಪರಿಶೀಲಿಸಿ", description: "ವ್ಯವಹಾರ, ತೆರಿಗೆ ಮತ್ತು ಬಾಕಿ ದಾಖಲೆಗಳು." }, { id: "compare", title: "ಆಯ್ಕೆಗಳನ್ನು ಹೋಲಿಸಿ", description: "ಮೊತ್ತ, ಅವಧಿ ಮತ್ತು ವ್ಯತ್ಯಾಸಗಳು." }, { id: "decide", title: "ಅಪಾಯ ತಿಳಿಯಿರಿ", description: "ಅರ್ಜಿಗೂ ಮುನ್ನ ಬಾಕಿ ಸಾಕ್ಷ್ಯ ನೋಡಿ." }],
};

const desiredAmount = 1_200_000;
const loanOptions = [
  { id: "mudra", name: "Mudra Kishor", authority: "SIDBI / member bank", amount: "Up to ₹5 lakh", rate: "Bank-set", term: "Up to 5 years", note: "No collateral; latest ITR-V still needed." },
  { id: "bank", name: "Small business term loan", authority: "Selected member bank", amount: "₹12 lakh", rate: "From 13.5%", term: "5 years", note: "Covers the full request, with a higher cost and stronger income proof." },
] as const;

export function LoanWorkflow() {
  const { language, t } = useI18n();
  const steps = stepsByLanguage[language];
  const personId = useAuthStore((state) => state.personId);
  const switchPersona = useAuthStore((state) => state.switchPersona);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [selected, setSelected] = useState<(typeof loanOptions)[number]["id"]>("mudra");
  const [risk, setRisk] = useState("");
  const [loading, setLoading] = useState(false);
  if (!personId) return null;
  const business = getNodeByType(graph, "biz:sharma-web", "business");
  const mudra = getEligibility(graph, personId).find((result) => result.benefit.id === "ben:mudra-kishor");
  const application = graph.nodes.filter((node) => node.type === "application").find((node) => node.attrs.kind === "business-loan" && node.attrs.participants?.includes(personId));
  const complete = Boolean(application);
  const payable = getMoneySummary(graph, personId).payable;
  const selectedOption = loanOptions.find((option) => option.id === selected) ?? loanOptions[0];
  const localRisk = `${selectedOption.name}: your registrations and two-year business vintage are strong. ${mudra?.missingEvidence.length ? `Add ${mudra.missingEvidence.map(formatEvidence).join(", ")} before applying.` : "The required evidence is present."} ${payable > 0 ? `Review ${formatCurrency(payable)} in current payables before choosing debt.` : "There are no current government payables."}`;

  const explainRisk = async () => {
    setLoading(true);
    setRisk(localRisk);
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: `Selected option: ${selectedOption.name}. Business turnover is ${business?.attrs.turnoverFY25 ?? 0}. Mudra eligibility is ${mudra?.status ?? "unknown"}. Missing evidence: ${mudra?.missingEvidence.join(", ") ?? "none"}.`, language, context: { subject: "Business loan risk", sender: "Citizen eligibility engine", legitimacy: "legitimate", relatedTitle: "Sharma Web Solutions" } }),
      });
      if (response.ok && response.headers.get("x-citizen-fallback") !== "true") {
        const result = explainResponseSchema.parse(await response.json());
        setRisk(`${result.plainLanguage} ${result.nextAction}`);
      }
    } catch {
      setRisk(localRisk);
    } finally {
      setLoading(false);
    }
  };

  const startApplication = () => {
    if (!business || !mudra || application) return;
    const applicationId = "app:arjun-business-loan";
    const mutations: GraphMutation[] = [
      { type: "addNode", node: { id: applicationId, type: "application", attrs: { title: selectedOption.name, authority: selectedOption.authority, status: "draft", createdOn: "2026-08-24", relatedTo: business.id, kind: "business-loan", participants: [personId], currentStep: 0, note: `Selected ${selectedOption.name}.` }, verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" } } },
      { type: "addEdge", edge: { id: "e:arjun-subject-business-loan-application", type: "subjectOf", from: personId, to: applicationId, attrs: {}, validFrom: "2026-08-24", status: "active", verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" } } },
    ];
    commit({ actorId: personId, labelKey: "eventLoanApplicationStarted", labelParams: { option: selectedOption.name }, procedureId: "business-loan", mutations });
  };

  if (!business || !mudra) {
    return <ProcedureShell authority="Citizen eligibility engine" currentStep={0} description={t("loanWorkflowBody")} steps={steps} title={t("loanWorkflowTitle")}><StepCard eyebrow={t("noLinkedBusiness")} title={t("switchArjunTitle")} body={t("switchArjunBody")}><Button onClick={() => switchPersona("person:arjun")} variant="secondary">{t("switchArjun")}</Button></StepCard></ProcedureShell>;
  }

  const affordability = Math.max(0, 100 - Math.min(100, Math.round((desiredAmount / business.attrs.turnoverFY25) * 100)));
  const content = complete ? (
    <CompletionCard title={t("loanCompleteTitle")} body={t("loanCompleteBody")}><LinkButton href="/dashboard" variant="inverse">{t("viewApplication")} <ArrowRight aria-hidden className="size-4" /></LinkButton></CompletionCard>
  ) : (
    <div className="grid gap-7">
      <article className="grid gap-6 rounded-[8px] border border-green-deep/30 bg-green-tint p-6 sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-end sm:p-8">
        <div className="grid gap-4"><div className="flex flex-wrap items-center gap-2"><StatusPill label={t("potentiallyEligible")} tone="warning" /><SimulatedChip authority="SIDBI / member banks" /></div><div className="grid gap-2"><p className="eyebrow">{t("recommendation")}</p><h2 className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-ink">{selectedOption.name}</h2><p className="max-w-2xl text-sm leading-6 text-ink-mute">{risk || localRisk}</p></div></div>
        <div className="grid gap-3"><div className="flex items-end justify-between gap-3"><span className="text-xs font-bold text-ink-mute">{formatCurrency(desiredAmount)}</span><strong className="font-display text-2xl text-ink">{affordability}%</strong></div><div className="h-2 overflow-hidden rounded-[4px] bg-paper-shade"><div className="h-full rounded-[4px] bg-green-deep" style={{ width: `${affordability}%` }} /></div><span className="text-xs text-ink-mute">{business.attrs.name} · {formatCurrency(business.attrs.turnoverFY25)}</span></div>
      </article>

      <section className="grid gap-4"><h2 className="font-display text-3xl font-semibold tracking-[-0.035em] text-ink">{steps[1].title}</h2><div className="grid gap-4 md:grid-cols-2">{loanOptions.map((option) => <button aria-pressed={selected === option.id} className={`grid min-h-60 content-between gap-8 rounded-[8px] border p-5 text-left transition-colors ${selected === option.id ? "border-green-deep bg-green-tint" : "border-paper-line bg-paper-shade hover:border-green-deep/35"}`} key={option.id} onClick={() => { setSelected(option.id); setRisk(""); }}><div className="flex items-start justify-between gap-3"><Landmark aria-hidden className="size-5 text-green-deep" /><StatusPill label={option.rate} tone={selected === option.id ? "info" : "neutral"} /></div><div className="grid gap-2"><strong className="font-display text-2xl font-semibold leading-tight text-ink">{option.name}</strong><span className="text-sm font-bold text-green-deep">{option.amount} · {option.term}</span><p className="text-xs leading-5 text-ink-mute">{option.note}</p></div></button>)}</div></section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="grid content-start gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5"><ShieldCheck aria-hidden className="size-5 text-green-deep" /><h3 className="font-display text-2xl font-semibold text-ink">{t("whyThisFits")}</h3><div className="grid gap-2">{mudra.passedReasons.slice(0, 3).map((reason) => <p className="flex gap-2 text-xs leading-5 text-ink-mute" key={reason}><Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-green-deep" />{localizeRuleExplanation(language, reason)}</p>)}</div></article>
        <article className="grid content-start gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5"><FileWarning aria-hidden className="size-5 text-brick" /><h3 className="font-display text-2xl font-semibold text-ink">{t("risks")}</h3><div className="grid gap-2">{mudra.missingEvidence.map((evidence) => <p className="flex gap-2 text-xs leading-5 text-ink-mute" key={evidence}><CircleHelp aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brick" />{localizeEvidence(language, evidence)}</p>)}{payable > 0 ? <p className="text-xs leading-5 text-ink-mute">{t("due")}: {formatCurrency(payable)}</p> : null}</div></article>
        <article className="grid content-start gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5"><Scale aria-hidden className="size-5 text-green-deep" /><h3 className="font-display text-2xl font-semibold text-ink">{t("nextAction")}</h3><p className="text-xs leading-5 text-ink-mute">{risk || selectedOption.note}</p><div className="grid gap-2"><Button loading={loading} onClick={() => void explainRisk()} variant="secondary">{t("explainMyRisk")}</Button>{risk ? <Button onClick={startApplication}>{t("start")}</Button> : null}</div></article>
      </section>
    </div>
  );

  return <ProcedureShell authority="Citizen eligibility engine + simulated member banks" complete={complete} currentStep={complete ? 3 : risk ? 2 : 1} description={t("loanWorkflowBody")} steps={steps} title={t("loanWorkflowTitle")}>{content}</ProcedureShell>;
}
