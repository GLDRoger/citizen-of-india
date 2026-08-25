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

const desiredAmount = 400_000;
const loanOptions = [
  { id: "mudra", name: "Mudra Kishor", authority: "SIDBI / member bank", annualRate: 10.5, termMonths: 60, note: "Within the ₹5 lakh Kishor cap; no collateral, but the latest ITR-V is still needed." },
  { id: "bank", name: "Small business term loan", authority: "Selected member bank", annualRate: 13.5, termMonths: 60, note: "Covers the same ₹4 lakh request at a higher illustrative cost and with stronger income proof." },
] as const;

function monthlyPayment(principal: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 1_200;
  return Math.round((principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1));
}

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
    return <ProcedureShell authority="Citizen eligibility engine" currentStep={0} description={t("loanWorkflowBody")} procedureId="business-loan" steps={steps} title={t("loanWorkflowTitle")}><StepCard eyebrow={t("noLinkedBusiness")} title={t("switchArjunTitle")} body={t("switchArjunBody")}><Button onClick={() => switchPersona("person:arjun")} variant="secondary">{t("switchArjun")}</Button></StepCard></ProcedureShell>;
  }

  const content = complete ? (
    <CompletionCard title={t("loanCompleteTitle")} body={t("loanCompleteBody")}><LinkButton href="/dashboard" variant="inverse">{t("viewApplication")} <ArrowRight aria-hidden className="size-4" /></LinkButton></CompletionCard>
  ) : (
    <div className="grid gap-7">
      <article className="grid gap-6 rounded-[8px] border border-green-deep/30 bg-green-tint p-6 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-end sm:p-8">
        <div className="grid gap-4"><div className="flex flex-wrap items-center gap-2"><StatusPill label={t("potentiallyEligible")} tone="warning" /><SimulatedChip authority="SIDBI / member banks" /></div><div className="grid gap-2"><p className="eyebrow">{t("recommendation")}</p><h2 className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-ink">{selectedOption.name}</h2><p className="max-w-2xl text-sm leading-6 text-ink-mute">{risk || localRisk}</p></div></div>
        <div className="grid gap-2 border-y border-green-deep/20 py-4"><span className="text-xs text-ink-mute">{t("requestedAmount")}</span><strong className="font-display text-3xl font-bold text-ink">{formatCurrency(desiredAmount)}</strong><span className="text-xs text-ink-mute">{business.attrs.name} · {formatCurrency(business.attrs.turnoverFY25)}</span></div>
      </article>

      <section className="grid gap-4"><h2 className="font-display text-3xl font-semibold tracking-[-0.035em] text-ink">{steps[1].title}</h2><div className="grid gap-4 md:grid-cols-2">{loanOptions.map((option) => { const emi = monthlyPayment(desiredAmount, option.annualRate, option.termMonths); const interest = (emi * option.termMonths) - desiredAmount; return <button aria-pressed={selected === option.id} className={`grid min-h-72 content-between gap-6 rounded-[8px] border p-5 text-left transition-colors ${selected === option.id ? "border-green-deep bg-green-tint" : "border-paper-line bg-paper-shade hover:border-green-deep/35"}`} key={option.id} onClick={() => { setSelected(option.id); setRisk(""); }}><div className="flex items-start justify-between gap-3"><Landmark aria-hidden className="size-5 text-green-deep" /><StatusPill label={`${option.annualRate}%`} tone={selected === option.id ? "info" : "neutral"} /></div><div className="grid gap-3"><strong className="font-display text-2xl font-semibold leading-tight text-ink">{option.name}</strong><div className="grid grid-cols-2 border-y border-paper-line text-xs"><span className="grid gap-1 border-r border-paper-line py-3 pr-3 text-ink-mute">{t("estimatedEmi")}<b className="font-display text-lg text-ink">{formatCurrency(emi)}</b></span><span className="grid gap-1 py-3 pl-3 text-ink-mute">{t("totalInterest")}<b className="font-display text-lg text-ink">{formatCurrency(interest)}</b></span></div><p className="text-xs leading-5 text-ink-mute">{option.note}</p></div></button>; })}</div></section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="grid content-start gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5"><ShieldCheck aria-hidden className="size-5 text-green-deep" /><h3 className="font-display text-2xl font-semibold text-ink">{t("whyThisFits")}</h3><div className="grid gap-2">{mudra.passedReasons.slice(0, 3).map((reason) => <p className="flex gap-2 text-xs leading-5 text-ink-mute" key={reason}><Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-green-deep" />{localizeRuleExplanation(language, reason)}</p>)}</div></article>
        <article className="grid content-start gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5"><FileWarning aria-hidden className="size-5 text-brick" /><h3 className="font-display text-2xl font-semibold text-ink">{t("risks")}</h3><div className="grid gap-2">{mudra.missingEvidence.map((evidence) => <p className="flex gap-2 text-xs leading-5 text-ink-mute" key={evidence}><CircleHelp aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brick" />{localizeEvidence(language, evidence)}</p>)}{payable > 0 ? <p className="text-xs leading-5 text-ink-mute">{t("due")}: {formatCurrency(payable)}</p> : null}</div></article>
        <article className="grid content-start gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5"><Scale aria-hidden className="size-5 text-green-deep" /><h3 className="font-display text-2xl font-semibold text-ink">{t("nextAction")}</h3><p className="text-xs leading-5 text-ink-mute">{risk || selectedOption.note}</p><div className="grid gap-2"><Button loading={loading} onClick={() => void explainRisk()} variant="secondary">{t("explainMyRisk")}</Button>{risk ? <Button onClick={startApplication}>{t("start")}</Button> : null}</div></article>
      </section>
    </div>
  );

  return <ProcedureShell authority="Citizen eligibility engine + simulated member banks" complete={complete} currentStep={complete ? 3 : risk ? 2 : 1} description={t("loanWorkflowBody")} procedureId="business-loan" steps={steps} title={t("loanWorkflowTitle")}>{content}</ProcedureShell>;
}
