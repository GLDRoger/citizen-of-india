"use client";

import { ArrowRight, CheckCircle2, FileClock, Landmark } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getNodeByType } from "@/features/graph/selectors";
import type { GraphMutation, Verification } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency, maskIdentifier } from "@/lib/format";
import { processPayment, submitGstr3b } from "@/lib/mockGov";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

export type MoneyAction = "gstr3b" | "passport-renewal" | "property-tax" | "refund-track";

const steps: Record<Language, ProcedureStep[]> = {
  en: [{ id: "action", title: "Review and confirm", description: "One honest simulated action." }],
  hi: [{ id: "action", title: "जाँचें और पक्का करें", description: "एक साफ़ सिम्युलेटेड कार्रवाई।" }],
  kn: [{ id: "action", title: "ಪರಿಶೀಲಿಸಿ ಖಚಿತಪಡಿಸಿ", description: "ಒಂದು ಸ್ಪಷ್ಟ ಅನುಕರಿಸಿದ ಕ್ರಮ." }],
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
  if (!personId) return null;

  const propertyTax = getNodeByType(graph, "obl:bbmp-property-tax", "obligation");
  const gstr = getNodeByType(graph, "obl:gstr3b-sep", "obligation");
  const business = getNodeByType(graph, "biz:sharma-web", "business");
  const propertyComplete = propertyTax?.attrs.status === "paid";
  const gstrComplete = gstr?.attrs.status === "completed";
  const complete = action === "property-tax" ? propertyComplete : action === "gstr3b" ? gstrComplete : false;
  const procedureId = action === "property-tax" ? "property-tax-payment" : action === "gstr3b" ? "gstr3b-filing" : action;

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
      setError(t("deathServiceError"));
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
      setError(t("deathServiceError"));
    } finally {
      setLoading(false);
    }
  };

  const content = action === "property-tax" ? propertyComplete ? (
    <CompletionCard title={t("propertyTaxPaidTitle")} body={t("propertyTaxPaidBody")}><LinkButton href="/#money" variant="inverse">{t("returnHome")} <ArrowRight aria-hidden className="size-4" /></LinkButton></CompletionCard>
  ) : (
    <StepCard eyebrow="BBMP · Karnataka One" title={t("propertyTaxTitle")} body={t("propertyTaxBody")}><div className="flex items-center justify-between gap-4 rounded-[8px] bg-paper-line p-5"><div><strong className="block text-xs text-ink-mute">BBMP</strong><span className="font-display text-3xl font-bold text-ink">{formatCurrency(propertyTax?.attrs.amount ?? 0)}</span></div><SimulatedChip authority="Karnataka One" /></div><Button loading={loading} onClick={() => void payPropertyTax()}>{t("confirmPropertyTaxPayment")} <CheckCircle2 aria-hidden className="size-4" /></Button></StepCard>
  ) : action === "gstr3b" ? gstrComplete ? (
    <CompletionCard title={t("gstrFiledTitle")} body={t("gstrFiledBody")}><LinkButton href="/#money" variant="inverse">{t("returnHome")} <ArrowRight aria-hidden className="size-4" /></LinkButton></CompletionCard>
  ) : (
    <StepCard eyebrow="GSTN" title={t("gstrTitle")} body={t("gstrBody")}><div className="flex items-center gap-3 rounded-[8px] bg-paper-line p-5"><Landmark aria-hidden className="size-5 text-green-deep" /><div><strong className="block text-sm text-ink">{business?.attrs.name ?? "Sharma Web Solutions"}</strong><span className="text-xs text-ink-mute">GSTIN {business?.attrs.gstin ?? "—"} · August 2026</span></div></div><Button loading={loading} onClick={() => void fileGstr()}>{t("confirmGstrFiling")} <CheckCircle2 aria-hidden className="size-4" /></Button></StepCard>
  ) : action === "passport-renewal" ? (
    <StepCard eyebrow={t("serviceUnavailable")} title={t("passportScopeTitle")} body={t("passportScopeBody")}><div className="flex gap-3 border-y border-paper-line py-4 text-xs leading-5 text-ink-mute"><FileClock aria-hidden className="size-5 shrink-0" />Passport S98***21 · Passport Seva Kendra, Bengaluru</div><LinkButton href="/documents" variant="secondary">{t("documents")}</LinkButton></StepCard>
  ) : (
    <StepCard eyebrow={t("trackRefund")} title={t("refundTrackTitle")} body={t("refundTrackBody")}><div className="flex items-center justify-between gap-4 rounded-[8px] bg-green-tint p-5"><span className="text-xs text-ink-mute">Income Tax Department</span><strong className="font-display text-2xl font-bold text-ink">₹12,400</strong></div><LinkButton href="/#money" variant="secondary">{t("returnHome")}</LinkButton></StepCard>
  );

  const title = action === "property-tax" ? t("payPropertyTax") : action === "gstr3b" ? t("fileGstr") : action === "passport-renewal" ? t("reviewScope") : t("trackRefund");
  return <ProcedureShell authority="Citizen + simulated service desk" complete={complete} currentStep={complete ? 1 : 0} description={action === "refund-track" ? t("refundTrackBody") : action === "passport-renewal" ? t("passportScopeBody") : action === "gstr3b" ? t("gstrBody") : t("propertyTaxBody")} procedureId={procedureId} steps={steps[language]} title={title}>{error ? <p className="mb-3 text-sm font-bold text-brick">{error}</p> : null}{content}</ProcedureShell>;
}
