"use client";

import { ArrowRight, CheckCircle2, Landmark } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getNodeByType } from "@/features/graph/selectors";
import type { GraphMutation, Verification } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency, formatDate, maskIdentifier } from "@/lib/format";
import { processPayment, submitGstr3b } from "@/lib/mockGov";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

export type MoneyAction = "gstr3b" | "passport-renewal" | "property-tax" | "refund-track";

const steps: Record<Language, ProcedureStep[]> = {
  en: [{ id: "action", title: "Review and confirm", description: "This action is part of the demo." }],
  hi: [{ id: "action", title: "जाँचें और पक्का करें", description: "यह काम केवल डेमो का हिस्सा है।" }],
  kn: [{ id: "action", title: "ಪರಿಶೀಲಿಸಿ ಖಚಿತಪಡಿಸಿ", description: "ಈ ಕ್ರಮ ಡೆಮೊದ ಭಾಗ ಮಾತ್ರ." }],
};

function verification(source: Verification["source"]): Verification {
  return { source, state: "verified", asOf: "2026-08-25" };
}

export function MoneyActionWorkflow({ action }: { action: MoneyAction }) {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  if (!personId) return null;

  const title = action === "property-tax" ? t("payPropertyTax") : action === "gstr3b" ? t("fileGstr") : action === "passport-renewal" ? t("passportWorkflowTitle") : t("trackRefund");
  const procedureId = action === "property-tax" ? "property-tax-payment" : action === "gstr3b" ? "gstr3b-filing" : action;
  if (personId !== "person:arjun") {
    return <ProcedureShell authority={t("simulatedResponse")} currentStep={0} procedureId={procedureId} steps={steps[language]} title={title}><StepCard eyebrow={t("profileScopeEyebrow")} title={t("profileScopeTitle")} body={t("moneyProfileScopeBody")}><LinkButton href="/home#attention" variant="secondary">{t("returnHome")}</LinkButton></StepCard></ProcedureShell>;
  }

  const propertyTax = getNodeByType(graph, "obl:bbmp-property-tax", "obligation");
  const gstr = getNodeByType(graph, "obl:gstr3b-sep", "obligation");
  const business = getNodeByType(graph, "biz:sharma-web", "business");
  const property = propertyTax?.attrs.relatedTo ? getNodeByType(graph, propertyTax.attrs.relatedTo, "property") : undefined;
  const propertyAddress = property ? getNodeByType(graph, property.attrs.addressId, "address") : undefined;
  const propertyComplete = propertyTax?.attrs.status === "paid";
  const gstrComplete = gstr?.attrs.status === "completed";
  const complete = action === "property-tax" ? propertyComplete : action === "gstr3b" ? gstrComplete : false;

  const payPropertyTax = async () => {
    if (!propertyTax || propertyComplete) return;
    setLoading(true);
    setError(null);
    try {
      const response = await processPayment({ purpose: propertyTax.attrs.title, amount: propertyTax.attrs.amount ?? 0, payerId: personId });
      const receiptId = "doc:arjun-bbmp-property-tax-receipt";
      const mutations: GraphMutation[] = [
        { type: "patchAttrs", nodeId: propertyTax.id, attrs: { status: "paid", note: `Simulated BBMP property-tax receipt ${response.data.receipt}.` }, verification: verification("Municipal") },
        { type: "addNode", node: { id: receiptId, type: "document", attrs: { kind: "payment-receipt", holderName: "Arjun Sharma", numberMasked: maskIdentifier(response.data.receipt), issuedOn: "2026-08-25", authority: "BBMP via Karnataka One", downloaded: true }, verification: verification("Municipal") } },
        { type: "addEdge", edge: { id: "e:arjun-holds-bbmp-tax-receipt", type: "holds", from: personId, to: receiptId, attrs: {}, validFrom: "2026-08-25", status: "active", verification: verification("Municipal") } },
      ];
      commit({ actorId: personId, labelKey: "eventPropertyTaxPaid", procedureId, mutations });
    } catch {
      setError(t("moneyServiceError"));
    } finally {
      setLoading(false);
    }
  };

  const fileGstr = async () => {
    if (!gstr || gstrComplete) return;
    setLoading(true);
    setError(null);
    try {
      const response = await submitGstr3b({ businessId: "biz:sharma-web", period: "2026-08" });
      commit({ actorId: personId, labelKey: "eventGstrFiled", procedureId, labelParams: { reference: response.data.acknowledgement }, mutations: [{ type: "patchAttrs", nodeId: gstr.id, attrs: { status: "completed", note: `Simulated filing acknowledgement ${response.data.acknowledgement}.` }, verification: verification("Self") }] });
    } catch {
      setError(t("moneyServiceError"));
    } finally {
      setLoading(false);
    }
  };

  const content = action === "property-tax" ? propertyComplete ? (
    <CompletionCard title={t("propertyTaxPaidTitle")} body={t("propertyTaxPaidBody")}><LinkButton href="/documents" variant="inverse">{t("openReceipt")} <ArrowRight aria-hidden className="size-4" /></LinkButton></CompletionCard>
  ) : (
    <StepCard eyebrow="BBMP · Karnataka One" title={t("propertyTaxTitle")} body={t("propertyTaxBody")}><dl className="grid border-y border-paper-line sm:grid-cols-2"><div className="grid gap-1 py-4 sm:pr-4"><dt className="text-xs text-ink-mute">{t("propertyAddress")}</dt><dd className="text-sm font-bold leading-5">{propertyAddress ? `${propertyAddress.attrs.line1}, ${propertyAddress.attrs.city}` : "—"}</dd></div><div className="grid gap-1 border-t border-paper-line py-4 sm:border-l sm:border-t-0 sm:pl-4"><dt className="text-xs text-ink-mute">{t("propertyKhata")}</dt><dd className="font-display text-lg font-bold tabular-nums">{property ? maskIdentifier(property.attrs.khataNumber) : "—"}</dd></div><div className="grid gap-1 border-t border-paper-line py-4 sm:pr-4"><dt className="text-xs text-ink-mute">{t("dueOn", { date: propertyTax?.attrs.dueDate ? formatDate(propertyTax.attrs.dueDate, language) : "—" })}</dt><dd className="text-sm font-bold">{propertyTax?.attrs.note}</dd></div><div className="grid gap-1 border-t border-paper-line py-4 sm:border-l sm:pl-4"><dt className="text-xs text-ink-mute">{t("propertyAmountDue")}</dt><dd className="font-display text-3xl font-bold tabular-nums">{formatCurrency(propertyTax?.attrs.amount ?? 0)}</dd></div></dl><div className="flex justify-end"><SimulatedChip authority="Karnataka One" /></div><Button loading={loading} onClick={() => void payPropertyTax()}>{t("confirmPropertyTaxPayment")} <CheckCircle2 aria-hidden className="size-4" /></Button></StepCard>
  ) : action === "gstr3b" ? gstrComplete ? (
    <CompletionCard title={t("gstrFiledTitle")} body={t("gstrFiledBody")}><LinkButton href="/home#attention" variant="inverse">{t("returnHome")} <ArrowRight aria-hidden className="size-4" /></LinkButton></CompletionCard>
  ) : (
    <StepCard eyebrow="GSTN" title={t("gstrTitle")} body={t("gstrBody")}><div className="flex items-center gap-3 rounded-[8px] bg-indigo-tint p-5"><Landmark aria-hidden className="size-5 text-indigo-deep" /><div><strong className="block text-sm text-ink">{business?.attrs.name ?? "Sharma Web Solutions"}</strong><span className="text-xs text-ink-mute">GSTIN {business?.attrs.gstin ? maskIdentifier(business.attrs.gstin) : "—"} · August 2026</span></div></div><label className="flex min-h-12 cursor-pointer items-start gap-3 border-y border-paper-line py-3 text-sm leading-6"><input checked={confirmed} className="mt-1 size-4" onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" /><span>{t("gstrConfirmDeclaration")}</span></label><Button disabled={!confirmed} loading={loading} onClick={() => void fileGstr()}>{t("confirmGstrFiling")} <CheckCircle2 aria-hidden className="size-4" /></Button></StepCard>
  ) : action === "passport-renewal" ? (
    <StepCard eyebrow={t("serviceUnavailable")} title={t("passportScopeTitle")} body={t("passportScopeBody")}><ol className="grid gap-0 border-y border-paper-line">{["passportStepOne", "passportStepTwo", "passportStepThree"].map((key, index) => <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-paper-line py-3 text-sm last:border-b-0" key={key}><span className="font-display font-bold text-green-deep">{index + 1}</span><span>{t(key as "passportStepOne" | "passportStepTwo" | "passportStepThree")}</span></li>)}</ol><p className="text-xs leading-5 text-ink-mute">{t("passportDemoLimit")}</p><LinkButton href="/documents" variant="secondary">{t("viewPassport")}</LinkButton></StepCard>
  ) : (
    <StepCard eyebrow="Income Tax Department" title={t("refundTrackTitle")} body={t("refundTrackBody")}><div className="grid gap-0 border-y border-paper-line"><div className="flex items-center justify-between gap-4 border-b border-paper-line py-3"><span className="text-sm text-ink-mute">{t("refundStarted")}</span><strong className="font-display text-2xl font-bold text-ink">₹12,400</strong></div><p className="py-3 text-sm text-ink-mute">{t("refundExpected")} · {t("refundAccount")}</p></div><LinkButton href="/home#attention" variant="secondary">{t("returnHome")}</LinkButton></StepCard>
  );

  return <ProcedureShell authority={t("simulatedResponse")} complete={complete} currentStep={complete ? 1 : 0} procedureId={procedureId} steps={steps[language]} title={title}>{error ? <p className="mb-3 text-sm font-bold text-brick">{error}</p> : null}{content}</ProcedureShell>;
}
