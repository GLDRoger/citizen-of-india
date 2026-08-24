"use client";

import { ArrowRight, CheckCircle2, IndianRupee, ReceiptText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip, VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getNodeByType } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency, formatDate, maskIdentifier } from "@/lib/format";
import { processPayment } from "@/lib/mockGov";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [{ id: "review", title: "Review challan", description: "Match it to the vehicle and notice." }, { id: "payment", title: "Confirm payment", description: "Create a simulated service receipt." }],
  hi: [{ id: "review", title: "चालान जाँचें", description: "वाहन और संदेश से मिलान करें।" }, { id: "payment", title: "भुगतान पक्का करें", description: "सिम्युलेटेड सेवा रसीद बनाएँ।" }],
  kn: [{ id: "review", title: "ದಂಡ ಪರಿಶೀಲಿಸಿ", description: "ವಾಹನ ಮತ್ತು ಸಂದೇಶದೊಂದಿಗೆ ಹೋಲಿಸಿ." }, { id: "payment", title: "ಪಾವತಿ ಖಚಿತಪಡಿಸಿ", description: "ಅನುಕರಿಸಿದ ಸೇವಾ ರಸೀದಿ ರಚಿಸಿ." }],
};

export function ObligationsWorkflow() {
  const { language, t } = useI18n();
  const steps = stepsByLanguage[language];
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const switchPersona = useAuthStore((state) => state.switchPersona);
  const [reviewed, setReviewed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!personId) return null;
  const obligation = getNodeByType(graph, "obl:echallan-500", "obligation");
  const vehicle = getNodeByType(graph, "veh:activa", "vehicle");
  if (!obligation || !vehicle) return null;
  if (personId !== "person:arjun") {
    return <ProcedureShell authority="Bengaluru Traffic Police + Karnataka One" currentStep={0} description={t("obligationsPromise")} steps={steps} title={t("obligationsService")}><StepCard eyebrow="No linked challan" title="Switch to Arjun’s profile" body="This traffic notice belongs to Arjun’s Activa. Citizen will not let another profile pay or change it."><Button onClick={() => switchPersona("person:arjun")} variant="secondary">Switch to Arjun</Button></StepCard></ProcedureShell>;
  }
  const complete = obligation.attrs.status === "paid";
  const currentStep = complete ? 2 : reviewed ? 1 : 0;

  const pay = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await processPayment({ purpose: obligation.attrs.title, amount: obligation.attrs.amount ?? 0, payerId: personId });
      const mutations: GraphMutation[] = [
        { type: "patchAttrs", nodeId: obligation.id, attrs: { status: "paid", note: `Paid through simulated Karnataka One receipt ${response.data.receipt}.` }, verification: { source: "RTO", state: "verified", asOf: "2026-08-24" } },
        { type: "addNode", node: { id: "doc:arjun-echallan-receipt", type: "document", attrs: { kind: "payment-receipt", holderName: "Arjun Sharma", numberMasked: maskIdentifier(response.data.receipt), issuedOn: "2026-08-24", authority: response.authority, downloaded: true }, verification: { source: "RTO", state: "verified", asOf: "2026-08-24" } } },
        { type: "addEdge", edge: { id: "e:arjun-holds-echallan-receipt", type: "holds", from: personId, to: "doc:arjun-echallan-receipt", attrs: {}, validFrom: "2026-08-24", status: "active", verification: { source: "RTO", state: "verified", asOf: "2026-08-24" } } },
      ];
      commit({ actorId: personId, label: "Traffic e-challan paid", procedureId: "echallan-payment", mutations });
    } catch {
      setError("The simulated payment did not respond. The challan is still unpaid.");
    } finally {
      setLoading(false);
    }
  };

  const content = complete ? (
    <CompletionCard title="The challan is paid." body="The ₹500 payable is removed from your money-due total, and the receipt is stored in Documents."><div className="flex flex-wrap gap-2"><LinkButton href="/dashboard" variant="inverse">View updated activity <ArrowRight aria-hidden className="size-4" /></LinkButton><LinkButton href="/documents" variant="secondary">Open receipt</LinkButton></div></CompletionCard>
  ) : !reviewed ? (
    <StepCard eyebrow="Bengaluru Traffic Police" title="Confirm this is your challan" body="Citizen matched the notice to Arjun’s Activa and the existing payable record."><div className="grid gap-4 rounded-[8px] bg-paper-line p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"><span className="grid size-11 place-items-center rounded-[4px] bg-brick-tint text-brick"><ReceiptText aria-hidden className="size-5" /></span><div><strong className="block text-sm">{obligation.attrs.title}</strong><span className="text-xs text-ink-mute">{maskIdentifier(vehicle.attrs.regNumber)} · due {obligation.attrs.dueDate ? formatDate(obligation.attrs.dueDate) : "soon"}</span></div><VerificationBadge verification={obligation.verification} /></div><Button onClick={() => setReviewed(true)}>Review payment <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : (
    <StepCard eyebrow="Karnataka One · simulated" title={`Pay ${formatCurrency(obligation.attrs.amount ?? 0)}`} body="No payment details are collected. Confirming creates a simulated success response, updates the records, and issues a receipt."><div className="flex items-center justify-between gap-4 rounded-[8px] bg-green-tint p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-[4px] bg-green-deep text-paper"><IndianRupee aria-hidden className="size-5" /></span><div><strong className="block text-sm">Total</strong><span className="font-display text-2xl font-semibold">{formatCurrency(obligation.attrs.amount ?? 0)}</span></div></div><SimulatedChip authority="Karnataka One" /></div><p className="flex gap-2 text-xs leading-5 text-ink-mute"><ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-green-deep" />This button never opens a payment gateway or collects bank information.</p><Button loading={loading} onClick={() => void pay()}>Confirm simulated payment <CheckCircle2 aria-hidden className="size-4" /></Button></StepCard>
  );

  return <ProcedureShell authority="Bengaluru Traffic Police + Karnataka One" complete={complete} currentStep={currentStep} description={t("obligationsPromise")} steps={steps} title={t("obligationsService")}>{error ? <p className="mb-3 rounded-xl bg-brick-tint p-3 text-sm font-semibold text-brick" role="alert">{error}</p> : null}{content}</ProcedureShell>;
}
