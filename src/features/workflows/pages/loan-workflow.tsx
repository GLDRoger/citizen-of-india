"use client";

import { ArrowDown, ArrowRight, Check, CircleHelp, FileWarning, Landmark, Scale, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip, StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getEligibility, getMoneySummary, getObligations, getOwnedAssets } from "@/features/graph/selectors";
import type { GraphMutation, GraphNode } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { localizeNodeTitle, localizeRuleExplanation } from "@/i18n/content";
import { localizeEvidence } from "@/i18n/formatters";
import type { Language, MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency } from "@/lib/format";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [{ id: "evidence", title: "Check your records", description: "Business, tax and pending payments." }, { id: "compare", title: "Compare loans", description: "Monthly payment, term and total interest." }, { id: "decide", title: "Check the risk", description: "See what is missing before you apply." }],
  hi: [{ id: "evidence", title: "अपने रिकॉर्ड जाँचें", description: "व्यवसाय, कर और बकाया भुगतान।" }, { id: "compare", title: "लोन की तुलना करें", description: "मासिक भुगतान, अवधि और कुल ब्याज।" }, { id: "decide", title: "जोखिम जाँचें", description: "आवेदन से पहले देखें कि क्या बाकी है।" }],
  kn: [{ id: "evidence", title: "ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ", description: "ವ್ಯವಹಾರ, ತೆರಿಗೆ ಮತ್ತು ಬಾಕಿ ಪಾವತಿಗಳು." }, { id: "compare", title: "ಸಾಲಗಳನ್ನು ಹೋಲಿಸಿ", description: "ತಿಂಗಳ ಪಾವತಿ, ಅವಧಿ ಮತ್ತು ಒಟ್ಟು ಬಡ್ಡಿ." }, { id: "decide", title: "ಅಪಾಯ ಪರಿಶೀಲಿಸಿ", description: "ಅರ್ಜಿಗೂ ಮುನ್ನ ಏನು ಬಾಕಿ ಇದೆ ನೋಡಿ." }],
};

const desiredAmount = 400_000;

interface LoanOptionDefinition {
  annualRate: number;
  authority: string;
  id: "bank" | "mudra";
  nameKey: MessageKey;
  noteKey: MessageKey;
  termMonths: number;
}

interface LoanOption extends LoanOptionDefinition {
  emi: number;
  interest: number;
  name: string;
  note: string;
}

type LoanApplication = Extract<GraphNode, { type: "application" }>;
type PayableObligation = ReturnType<typeof getObligations>[number];

const loanOptionDefinitions: readonly LoanOptionDefinition[] = [
  { id: "mudra", nameKey: "loanMudraName", authority: "SIDBI / member bank", annualRate: 10.5, termMonths: 60, noteKey: "loanMudraNote" },
  { id: "bank", nameKey: "loanBankName", authority: "Selected member bank", annualRate: 13.5, termMonths: 60, noteKey: "loanBankNote" },
];

function monthlyPayment(principal: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 1_200;
  return Math.round((principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1));
}

function LoanOptionCard({ onSelect, option, selected }: { onSelect: () => void; option: LoanOption; selected: boolean }) {
  const { t } = useI18n();
  return (
    <button aria-pressed={selected} className={`grid min-h-56 content-between gap-4 rounded-[8px] border p-5 text-left transition-colors ${selected ? "border-indigo-deep bg-indigo-tint" : "border-paper-line bg-paper-shade hover:border-indigo/35"}`} onClick={onSelect} type="button">
      <span className="flex items-start justify-between gap-3"><Landmark aria-hidden className="size-5 text-indigo-deep" /><StatusPill label={`${option.annualRate}%`} tone={selected ? "info" : "neutral"} /></span>
      <span className="grid gap-3"><strong className="font-display text-2xl font-semibold leading-tight text-ink">{option.name}</strong><span className="grid grid-cols-2 border-y border-paper-line text-xs"><span className="grid gap-1 border-r border-paper-line py-3 pr-3 text-ink-mute">{t("estimatedEmi")}<b className="font-display text-lg text-ink">{formatCurrency(option.emi)}</b></span><span className="grid gap-1 py-3 pl-3 text-ink-mute">{t("totalInterest")}<b className="font-display text-lg text-ink">{formatCurrency(option.interest)}</b></span></span><span className="text-xs leading-5 text-ink-mute">{option.note}</span></span>
    </button>
  );
}

function EligibilityCard({ language, reasons }: { language: Language; reasons: string[] }) {
  const { t } = useI18n();
  return <article className="grid content-start gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5"><ShieldCheck aria-hidden className="size-5 text-green-deep" /><h3 className="font-display text-2xl font-semibold text-ink">{t("whyThisFits")}</h3><div className="grid gap-2">{reasons.slice(0, 3).map((reason) => <p className="flex gap-2 text-xs leading-5 text-ink-mute" key={reason}><Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-green-deep" />{localizeRuleExplanation(language, reason)}</p>)}</div></article>;
}

function BeforeApplyCard({ language, missingEvidence, option, payableItems, payable, receivable }: { language: Language; missingEvidence: string[]; option: LoanOption; payableItems: PayableObligation[]; payable: number; receivable: number }) {
  const { t } = useI18n();
  const mudraEvidence = missingEvidence.map((evidence) => localizeEvidence(language, evidence));
  const evidence = option.id === "mudra" ? mudraEvidence.join(", ") || t("loanEvidenceReady") : option.note;
  return (
    <article className="grid content-start gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5">
      <FileWarning aria-hidden className="size-5 text-brick" /><h3 className="font-display text-2xl font-semibold text-ink">{t("risks")}</h3>
      <div className="grid divide-y divide-paper-line"><p className="flex gap-2 pb-3 text-xs leading-5 text-ink-mute"><CircleHelp aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brick" />{evidence}</p>{payableItems.map((item) => <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 py-3 text-xs text-ink-mute" key={item.id}><span>{localizeNodeTitle(language, item.id, item.attrs.title)}</span><strong className="shrink-0 text-ink">{formatCurrency(item.attrs.amount ?? 0)}</strong>{item.attrs.note ? <span className="col-span-2 leading-5">{item.attrs.note}</span> : null}</div>)}{receivable > 0 ? <p className="flex items-center justify-between gap-3 py-3 text-xs text-ink-mute"><span>{t("comingToYou")}</span><strong className="text-green-deep">{formatCurrency(receivable)}</strong></p> : null}</div>
      {option.id === "mudra" && missingEvidence.length ? <p className="bg-indigo-tint p-3 text-xs leading-5 text-indigo-deep">{t("loanItrClarification")}</p> : null}
      {receivable > 0 ? <p className="text-xs leading-5 text-ink-mute">{t("loanRefundCaution", { count: payableItems.length, due: formatCurrency(payable), refund: formatCurrency(receivable) })}</p> : null}
    </article>
  );
}

function RiskCard({ onApply, onReview, option, payable, receivable, reviewed }: { onApply: () => void; onReview: () => void; option: LoanOption; payable: number; receivable: number; reviewed: boolean }) {
  const { t } = useI18n();
  const decision = t(option.id === "mudra" ? "loanRiskDecisionMudra" : "loanRiskDecisionBank");
  return (
    <article className="grid content-start gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5">
      <Scale aria-hidden className="size-5 text-indigo-deep" /><h3 className="font-display text-2xl font-semibold text-ink">{t("nextAction")}</h3>
      {reviewed ? <div className="grid gap-3"><p className="bg-indigo-tint p-3 text-xs font-semibold leading-5 text-indigo-deep">{t("loanRiskVerdict", { decision, due: formatCurrency(payable), emi: formatCurrency(option.emi), option: option.name, refund: formatCurrency(receivable) })}</p><dl className="grid divide-y divide-paper-line border-y border-paper-line text-xs"><div className="flex justify-between gap-3 py-3"><dt className="text-ink-mute">{t("estimatedEmi")}</dt><dd className="font-bold text-ink">{formatCurrency(option.emi)}</dd></div><div className="flex justify-between gap-3 py-3"><dt className="text-ink-mute">{t("due")}</dt><dd className="font-bold text-ink">{formatCurrency(payable)}</dd></div><div className="flex justify-between gap-3 py-3"><dt className="text-ink-mute">{t("comingToYou")}</dt><dd className="font-bold text-green-deep">{formatCurrency(receivable)}</dd></div></dl><Button onClick={onApply}>{t("apply")}<ArrowRight aria-hidden className="size-4" /></Button></div> : <><p className="text-xs leading-5 text-ink-mute">{option.note}</p><Button onClick={onReview} variant="secondary">{t("explainMyRisk")}</Button></>}
    </article>
  );
}

function SavedLoanDraft({ application, isMudra }: { application: LoanApplication; isMudra: boolean }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-7">
      <CompletionCard title={t("loanCompleteTitle")} body={t("loanCompleteBody")}><LinkButton href="#application" variant="inverse">{t("viewApplication")}<ArrowDown aria-hidden className="size-4" /></LinkButton></CompletionCard>
      <section className="grid scroll-mt-24 gap-5 rounded-[8px] border border-paper-line bg-paper-shade p-6 sm:p-8" id="application"><header className="flex flex-wrap items-start justify-between gap-4"><div className="grid gap-2"><StatusPill label={t("statusDraft")} tone="info" /><h2 className="font-display text-3xl font-semibold text-ink">{application.attrs.title}</h2></div><strong className="font-display text-3xl text-indigo-deep">{formatCurrency(desiredAmount)}</strong></header><dl className="grid border-y border-paper-line text-sm sm:grid-cols-2"><div className="grid gap-1 py-4 sm:border-r sm:pr-5"><dt className="text-xs text-ink-mute">{t("loanAuthority")}</dt><dd className="font-bold text-ink">{application.attrs.authority}</dd></div><div className="grid gap-1 border-t border-paper-line py-4 sm:border-t-0 sm:pl-5"><dt className="text-xs text-ink-mute">{t("nextAction")}</dt><dd className="leading-6 text-ink">{isMudra ? t("loanItrClarification") : t("loanBankNote")}</dd></div></dl><div><LinkButton href="/services" variant="secondary">{t("back")}</LinkButton></div></section>
    </div>
  );
}

export function LoanWorkflow() {
  const { language, t } = useI18n();
  const steps = stepsByLanguage[language];
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [selected, setSelected] = useState<LoanOptionDefinition["id"]>("mudra");
  const [riskReviewed, setRiskReviewed] = useState(false);
  if (!personId) return null;

  const business = getOwnedAssets(graph, personId).find((node) => node.type === "business");
  const mudra = getEligibility(graph, personId).find((result) => result.benefit.id === "ben:mudra-kishor");
  const application = graph.nodes.find((node): node is LoanApplication => node.type === "application" && node.attrs.kind === "business-loan" && Boolean(node.attrs.participants?.includes(personId)));
  const money = getMoneySummary(graph, personId);
  const payableItems = getObligations(graph, personId).filter((node) => node.attrs.direction === "payable" && !["paid", "completed"].includes(node.attrs.status ?? ""));
  const loanOptions: LoanOption[] = loanOptionDefinitions.map((option) => { const emi = monthlyPayment(desiredAmount, option.annualRate, option.termMonths); return { ...option, emi, interest: (emi * option.termMonths) - desiredAmount, name: t(option.nameKey), note: t(option.noteKey) }; });
  const recommendedOption = loanOptions[0];
  const selectedOption = loanOptions.find((option) => option.id === selected) ?? recommendedOption;
  if (!business || !mudra || !recommendedOption || !selectedOption) {
    return <ProcedureShell authority={t("sampleProfileRole")} currentStep={0} procedureId="business-loan" showProgress={false} steps={steps} title={t("loanService")}><StepCard eyebrow={t("profileScopeEyebrow")} title={t("profileScopeTitle")} body={t("loanProfileScopeBody")}><LinkButton href="/services" variant="secondary">{t("back")}</LinkButton></StepCard></ProcedureShell>;
  }

  const evidenceContext = mudra.missingEvidence.length ? t("loanEvidenceNeeded", { evidence: mudra.missingEvidence.map((evidence) => localizeEvidence(language, evidence)).join(", ") }) : t("loanEvidenceReady");
  const recommendedSummary = t("loanRiskSummary", { evidence: evidenceContext, option: recommendedOption.name });
  const complete = application?.attrs.status === "completed";
  const savedOptionId = application?.attrs.note === "bank" ? "bank" : "mudra";

  const startApplication = () => {
    if (application) return;
    const applicationId = "app:arjun-business-loan";
    const mutations: GraphMutation[] = [
      { type: "addNode", node: { id: applicationId, type: "application", attrs: { title: selectedOption.name, authority: selectedOption.authority, status: "draft", createdOn: "2026-08-28", relatedTo: business.id, kind: "business-loan", participants: [personId], currentStep: 0, note: selectedOption.id }, verification: { source: "Self", state: "self-declared", asOf: "2026-08-28" } } },
      { type: "addEdge", edge: { id: "e:arjun-subject-business-loan-application", type: "subjectOf", from: personId, to: applicationId, attrs: {}, validFrom: "2026-08-28", status: "active", verification: { source: "Self", state: "self-declared", asOf: "2026-08-28" } } },
    ];
    commit({ actorId: personId, labelKey: "eventLoanApplicationStarted", labelParams: { option: selectedOption.name }, procedureId: "business-loan", mutations });
  };

  const content = application ? <SavedLoanDraft application={application} isMudra={savedOptionId === "mudra"} /> : <div className="grid gap-7"><article className="grid gap-6 rounded-[8px] border border-indigo/25 bg-indigo-tint p-6 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-end sm:p-8"><div className="grid gap-4"><div className="flex flex-wrap items-center gap-2"><StatusPill label={t("potentiallyEligible")} tone="warning" /><SimulatedChip authority="SIDBI / member banks" /></div><div className="grid gap-2"><p className="eyebrow">{t("recommendation")}</p><h2 className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-ink">{recommendedOption.name}</h2><p className="max-w-2xl text-sm leading-6 text-ink-mute">{recommendedSummary}</p></div></div><div className="grid gap-2 border-y border-indigo/20 py-4"><span className="text-xs text-ink-mute">{t("requestedAmount")}</span><strong className="font-display text-3xl font-bold text-ink">{formatCurrency(desiredAmount)}</strong><span className="text-xs text-ink-mute">{business.attrs.name} · {formatCurrency(business.attrs.turnoverFY25)}</span></div></article><section className="grid gap-4"><h2 className="font-display text-3xl font-semibold tracking-[-0.035em] text-ink">{steps[1]?.title}</h2><div className="grid gap-4 md:grid-cols-2">{loanOptions.map((option) => <LoanOptionCard key={option.id} onSelect={() => { setSelected(option.id); setRiskReviewed(false); }} option={option} selected={selected === option.id} />)}</div></section><section className="grid gap-4 md:grid-cols-3"><EligibilityCard language={language} reasons={mudra.passedReasons} /><BeforeApplyCard language={language} missingEvidence={mudra.missingEvidence} option={selectedOption} payable={money.payable} payableItems={payableItems} receivable={money.receivable} /><RiskCard onApply={startApplication} onReview={() => setRiskReviewed(true)} option={selectedOption} payable={money.payable} receivable={money.receivable} reviewed={riskReviewed} /></section></div>;

  return <ProcedureShell authority={t("loanAuthority")} complete={complete} currentStep={application ? 2 : riskReviewed ? 2 : 1} description={t("loanWorkflowBody")} procedureId="business-loan" showProgress={!application || complete} steps={steps} title={t("loanWorkflowTitle")}>{content}</ProcedureShell>;
}
