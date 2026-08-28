"use client";

import { ArrowRight, CheckCircle2, IndianRupee, ReceiptText } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip, VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getObligations, getOwnedAssets } from "@/features/graph/selectors";
import type { GraphMutation, GraphNode } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency, formatDate, maskIdentifier } from "@/lib/format";
import { processPayment } from "@/lib/mockGov";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [{ id: "review", title: "Review challan", description: "Check the vehicle and due date." }, { id: "payment", title: "Confirm payment", description: "Save a demo receipt." }],
  hi: [{ id: "review", title: "चालान जाँचें", description: "वाहन और आखिरी तारीख जाँचें।" }, { id: "payment", title: "भुगतान पक्का करें", description: "डेमो रसीद सेव करें।" }],
  kn: [{ id: "review", title: "ದಂಡ ಪರಿಶೀಲಿಸಿ", description: "ವಾಹನ ಮತ್ತು ಕೊನೆಯ ದಿನಾಂಕ ಪರಿಶೀಲಿಸಿ." }, { id: "payment", title: "ಪಾವತಿ ಖಚಿತಪಡಿಸಿ", description: "ಡೆಮೊ ರಸೀದಿ ಉಳಿಸಿ." }],
};

export function ObligationsWorkflow() {
  const { language, t } = useI18n();
  const steps = stepsByLanguage[language];
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [reviewed, setReviewed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!personId) return null;
  if (personId !== "person:arjun") {
    return <ProcedureShell authority={t("sampleProfileRole")} currentStep={0} procedureId="echallan-payment" showProgress={false} steps={steps} title={t("obligationsService")}><StepCard eyebrow={t("profileScopeEyebrow")} title={t("profileScopeTitle")} body={t("obligationsProfileScopeBody")}><LinkButton href="/services" variant="secondary">{t("back")}</LinkButton></StepCard></ProcedureShell>;
  }
  const obligation = getObligations(graph, personId).find((node) => node.id === "obl:echallan-500");
  const vehicle = getOwnedAssets(graph, personId).find(
    (node): node is Extract<GraphNode, { type: "vehicle" }> => node.type === "vehicle" && node.id === "veh:activa",
  );
  if (!obligation || !vehicle) return null;
  const complete = obligation.attrs.status === "paid";
  const currentStep = complete ? 2 : reviewed ? 1 : 0;

  const pay = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await processPayment({ purpose: obligation.attrs.title, amount: obligation.attrs.amount ?? 0, payerId: personId });
      const mutations: GraphMutation[] = [
        { type: "patchAttrs", nodeId: obligation.id, attrs: { status: "paid", note: `Paid through simulated Karnataka One receipt ${response.data.receipt}.` }, verification: { source: "RTO", state: "verified", asOf: "2026-08-28" } },
        { type: "addNode", node: { id: "doc:arjun-echallan-receipt", type: "document", attrs: { kind: "payment-receipt", holderName: "Arjun Sharma", numberMasked: maskIdentifier(response.data.receipt), issuedOn: "2026-08-28", authority: response.authority, downloaded: true }, verification: { source: "RTO", state: "verified", asOf: "2026-08-28" } } },
        { type: "addEdge", edge: { id: "e:arjun-holds-echallan-receipt", type: "holds", from: personId, to: "doc:arjun-echallan-receipt", attrs: {}, validFrom: "2026-08-28", status: "active", verification: { source: "RTO", state: "verified", asOf: "2026-08-28" } } },
      ];
      commit({ actorId: personId, labelKey: "eventChallanPaid", procedureId: "echallan-payment", mutations });
    } catch {
      setError(t("challanPaymentError"));
    } finally {
      setLoading(false);
    }
  };

  const content = complete ? (
    <CompletionCard title={t("challanPaidTitle")} body={t("challanPaidBody")}><div className="flex flex-wrap gap-3"><LinkButton href="/documents" variant="inverse">{t("openReceipt")} <ArrowRight aria-hidden className="size-4" /></LinkButton><LinkButton href="/home#attention" variant="inverseQuiet">{t("returnHome")}</LinkButton></div></CompletionCard>
  ) : !reviewed ? (
    <StepCard eyebrow={t("challanAuthority")} title={t("challanConfirmTitle")} body={t("challanConfirmBody")}><div className="grid gap-4 border-y border-paper-line py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"><ReceiptText aria-hidden className="size-5 text-brick" /><div><strong className="block text-sm">{obligation.attrs.title}</strong><span className="text-xs text-ink-mute">{maskIdentifier(vehicle.attrs.regNumber)} · {t("dueOn", { date: obligation.attrs.dueDate ? formatDate(obligation.attrs.dueDate, language) : t("soon") })}</span></div><VerificationBadge verification={obligation.verification} /></div><Button onClick={() => setReviewed(true)}>{t("reviewPayment")} <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : (
    <StepCard eyebrow={t("challanPaymentEyebrow")} title={t("payAmount", { amount: formatCurrency(obligation.attrs.amount ?? 0) })} body={t("challanPaymentBody")}><div className="flex items-center justify-between gap-4 rounded-[8px] bg-green-tint p-5"><div className="flex items-center gap-3"><IndianRupee aria-hidden className="size-5 text-green-deep" /><div><strong className="block text-sm">{t("total")}</strong><span className="font-display text-2xl font-semibold">{formatCurrency(obligation.attrs.amount ?? 0)}</span></div></div><SimulatedChip authority="Karnataka One" /></div><Button loading={loading} onClick={() => void pay()}>{t("confirmSimulatedPayment")} <CheckCircle2 aria-hidden className="size-4" /></Button></StepCard>
  );

  return <ProcedureShell authority="Bengaluru Traffic Police + Karnataka One" complete={complete} currentStep={currentStep} procedureId="echallan-payment" steps={steps} title={t("challanWorkflowTitle")}>{error ? <p className="mb-3 rounded-[4px] bg-brick-tint p-3 text-sm font-semibold text-brick" role="alert">{error}</p> : null}{content}</ProcedureShell>;
}
