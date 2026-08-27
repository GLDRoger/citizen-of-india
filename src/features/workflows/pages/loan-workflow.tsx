"use client";

import { ArrowRight, Check, CircleHelp, FileWarning, Landmark, Scale, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip, StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getEligibility, getMoneySummary, getOwnedAssets } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import type { Language, MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { localizeRuleExplanation } from "@/i18n/content";
import { localizeEvidence } from "@/i18n/formatters";
import { formatCurrency } from "@/lib/format";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [{ id: "evidence", title: "Check your records", description: "Business, tax and pending payments." }, { id: "compare", title: "Compare loans", description: "Monthly payment, term and total interest." }, { id: "decide", title: "Check the risk", description: "See what is missing before you apply." }],
  hi: [{ id: "evidence", title: "अपने रिकॉर्ड जाँचें", description: "व्यवसाय, कर और बकाया भुगतान।" }, { id: "compare", title: "लोन की तुलना करें", description: "मासिक भुगतान, अवधि और कुल ब्याज।" }, { id: "decide", title: "जोखिम जाँचें", description: "आवेदन से पहले देखें कि क्या बाकी है।" }],
  kn: [{ id: "evidence", title: "ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ", description: "ವ್ಯವಹಾರ, ತೆರಿಗೆ ಮತ್ತು ಬಾಕಿ ಪಾವತಿಗಳು." }, { id: "compare", title: "ಸಾಲಗಳನ್ನು ಹೋಲಿಸಿ", description: "ತಿಂಗಳ ಪಾವತಿ, ಅವಧಿ ಮತ್ತು ಒಟ್ಟು ಬಡ್ಡಿ." }, { id: "decide", title: "ಅಪಾಯ ಪರಿಶೀಲಿಸಿ", description: "ಅರ್ಜಿಗೂ ಮುನ್ನ ಏನು ಬಾಕಿ ಇದೆ ನೋಡಿ." }],
};

const desiredAmount = 400_000;
const loanOptionDefinitions = [
  { id: "mudra", nameKey: "loanMudraName", authority: "SIDBI / member bank", annualRate: 10.5, termMonths: 60, noteKey: "loanMudraNote" },
  { id: "bank", nameKey: "loanBankName", authority: "Selected member bank", annualRate: 13.5, termMonths: 60, noteKey: "loanBankNote" },
] as const;

function monthlyPayment(principal: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 1_200;
  return Math.round((principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1));
}

export function LoanWorkflow() {
  const { language, t } = useI18n();
  const steps = stepsByLanguage[language];
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [selected, setSelected] = useState<(typeof loanOptionDefinitions)[number]["id"]>("mudra");
  const [risk, setRisk] = useState("");
  if (!personId) return null;
  const business = getOwnedAssets(graph, personId).find((node) => node.type === "business");
  const mudra = getEligibility(graph, personId).find((result) => result.benefit.id === "ben:mudra-kishor");
  const application = graph.nodes.filter((node) => node.type === "application").find((node) => node.attrs.kind === "business-loan" && node.attrs.participants?.includes(personId));
  const complete = Boolean(application);
  const money = getMoneySummary(graph, personId);
  const { payable, receivable } = money;
  const loanOptions = loanOptionDefinitions.map((option) => ({ ...option, name: t(option.nameKey as MessageKey), note: t(option.noteKey as MessageKey) }));
  const recommendedOption = loanOptions[0];
  const selectedOption = loanOptions.find((option) => option.id === selected) ?? loanOptions[0];
  const evidenceContext = mudra?.missingEvidence.length
    ? t("loanEvidenceNeeded", { evidence: mudra.missingEvidence.map((evidence) => localizeEvidence(language, evidence)).join(", ") })
    : t("loanEvidenceReady");
  const payableContext = payable > 0 ? t("loanPayables", { amount: formatCurrency(payable) }) : t("loanNoPayables");
  const receivableContext = receivable > 0 ? t("loanReceivables", { amount: formatCurrency(receivable) }) : "";
  const recommendedSummary = t("loanRiskSummary", { option: recommendedOption.name, evidence: evidenceContext, payables: payableContext, receivables: receivableContext });
  const selectedRisk = t("loanRiskSummary", { option: selectedOption.name, evidence: evidenceContext, payables: payableContext, receivables: receivableContext });

  const explainRisk = () => {
    setRisk(selectedRisk);
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
    return <ProcedureShell authority={t("sampleProfileRole")} currentStep={0} procedureId="business-loan" steps={steps} title={t("loanService")}><StepCard eyebrow={t("profileScopeEyebrow")} title={t("profileScopeTitle")} body={t("loanProfileScopeBody")}><LinkButton href="/services" variant="secondary">{t("back")}</LinkButton></StepCard></ProcedureShell>;
  }

  const content = complete ? (
    <CompletionCard title={t("loanCompleteTitle")} body={t("loanCompleteBody")}><LinkButton href="/home#attention" variant="inverse">{t("viewApplication")} <ArrowRight aria-hidden className="size-4" /></LinkButton></CompletionCard>
  ) : (
    <div className="grid gap-7">
      <article className="grid gap-6 rounded-[8px] border border-indigo/25 bg-indigo-tint p-6 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-end sm:p-8">
        <div className="grid gap-4"><div className="flex flex-wrap items-center gap-2"><StatusPill label={t("potentiallyEligible")} tone="warning" /><SimulatedChip authority="SIDBI / member banks" /></div><div className="grid gap-2"><p className="eyebrow">{t("recommendation")}</p><h2 className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-ink">{recommendedOption.name}</h2><p className="max-w-2xl text-sm leading-6 text-ink-mute">{recommendedSummary}</p></div></div>
        <div className="grid gap-2 border-y border-indigo/20 py-4"><span className="text-xs text-ink-mute">{t("requestedAmount")}</span><strong className="font-display text-3xl font-bold text-ink">{formatCurrency(desiredAmount)}</strong><span className="text-xs text-ink-mute">{business.attrs.name} · {formatCurrency(business.attrs.turnoverFY25)}</span></div>
      </article>

      <section className="grid gap-4"><h2 className="font-display text-3xl font-semibold tracking-[-0.035em] text-ink">{steps[1].title}</h2><div className="grid gap-4 md:grid-cols-2">{loanOptions.map((option) => { const emi = monthlyPayment(desiredAmount, option.annualRate, option.termMonths); const interest = (emi * option.termMonths) - desiredAmount; return <button aria-pressed={selected === option.id} className={`grid min-h-56 content-between gap-4 rounded-[8px] border p-5 text-left transition-colors ${selected === option.id ? "border-indigo-deep bg-indigo-tint" : "border-paper-line bg-paper-shade hover:border-indigo/35"}`} key={option.id} onClick={() => { setSelected(option.id); setRisk(""); }}><div className="flex items-start justify-between gap-3"><Landmark aria-hidden className="size-5 text-indigo-deep" /><StatusPill label={`${option.annualRate}%`} tone={selected === option.id ? "info" : "neutral"} /></div><div className="grid gap-3"><strong className="font-display text-2xl font-semibold leading-tight text-ink">{option.name}</strong><div className="grid grid-cols-2 border-y border-paper-line text-xs"><span className="grid gap-1 border-r border-paper-line py-3 pr-3 text-ink-mute">{t("estimatedEmi")}<b className="font-display text-lg text-ink">{formatCurrency(emi)}</b></span><span className="grid gap-1 py-3 pl-3 text-ink-mute">{t("totalInterest")}<b className="font-display text-lg text-ink">{formatCurrency(interest)}</b></span></div><p className="text-xs leading-5 text-ink-mute">{option.note}</p></div></button>; })}</div></section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="grid content-start gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5"><ShieldCheck aria-hidden className="size-5 text-green-deep" /><h3 className="font-display text-2xl font-semibold text-ink">{t("whyThisFits")}</h3><div className="grid gap-2">{mudra.passedReasons.slice(0, 3).map((reason) => <p className="flex gap-2 text-xs leading-5 text-ink-mute" key={reason}><Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-green-deep" />{localizeRuleExplanation(language, reason)}</p>)}</div></article>
        <article className="grid content-start gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5"><FileWarning aria-hidden className="size-5 text-brick" /><h3 className="font-display text-2xl font-semibold text-ink">{t("risks")}</h3><div className="grid divide-y divide-paper-line">{mudra.missingEvidence.map((evidence) => <p className="flex gap-2 py-3 text-xs leading-5 text-ink-mute first:pt-0" key={evidence}><CircleHelp aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brick" />{localizeEvidence(language, evidence)}</p>)}{payable > 0 ? <p className="flex items-center justify-between gap-3 py-3 text-xs text-ink-mute"><span>{t("due")}</span><strong className="text-ink">{formatCurrency(payable)}</strong></p> : null}{receivable > 0 ? <p className="flex items-center justify-between gap-3 py-3 text-xs text-ink-mute"><span>{t("comingToYou")}</span><strong className="text-green-deep">{formatCurrency(receivable)}</strong></p> : null}</div>{receivable > 0 ? <p className="text-xs leading-5 text-ink-mute">{t("loanRefundCaution")}</p> : null}</article>
        <article className="grid content-start gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5"><Scale aria-hidden className="size-5 text-indigo-deep" /><h3 className="font-display text-2xl font-semibold text-ink">{t("nextAction")}</h3><p className="text-xs leading-5 text-ink-mute">{risk || selectedOption.note}</p><div className="grid gap-2">{risk ? <Button onClick={startApplication}>{t("apply")}</Button> : <Button onClick={explainRisk} variant="secondary">{t("explainMyRisk")}</Button>}</div></article>
      </section>
    </div>
  );

  return <ProcedureShell authority={t("loanAuthority")} complete={complete} currentStep={complete ? 3 : risk ? 2 : 1} description={t("loanWorkflowBody")} procedureId="business-loan" steps={steps} title={t("loanWorkflowTitle")}>{content}</ProcedureShell>;
}
