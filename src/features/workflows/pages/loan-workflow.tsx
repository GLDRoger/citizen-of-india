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
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency, formatEvidence } from "@/lib/format";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const steps: ProcedureStep[] = [
  { id: "evidence", title: "Check connected evidence", description: "Business, tax, and obligation records." },
  { id: "compare", title: "Compare options", description: "Amount, term and tradeoffs." },
  { id: "decide", title: "Explain risk", description: "See missing proof before applying." },
];

const loanOptions = [
  { id: "mudra", name: "Mudra Kishor", authority: "SIDBI / member bank", amount: "Up to ₹5 lakh", rate: "Bank-set", term: "Up to 5 years", note: "No collateral; latest ITR-V still needed." },
  { id: "bank", name: "Small business term loan", authority: "Selected member bank", amount: "Up to ₹10 lakh", rate: "From 13.5%", term: "3–5 years", note: "Higher cost; stronger income proof required." },
  { id: "credit", name: "Working capital line", authority: "Selected member bank", amount: "Up to ₹3 lakh", rate: "From 16%", term: "Revolving", note: "Flexible, but expensive for long-term use." },
];

export function LoanWorkflow() {
  const { language } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const switchPersona = useAuthStore((state) => state.switchPersona);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [stage, setStage] = useState(0);
  const [selected, setSelected] = useState("mudra");
  const [risk, setRisk] = useState("");
  const [loading, setLoading] = useState(false);
  if (!personId) return null;
  const business = getNodeByType(graph, "biz:sharma-web", "business");
  const mudra = getEligibility(graph, personId).find((result) => result.benefit.id === "ben:mudra-kishor");
  const application = graph.nodes
    .filter((node) => node.type === "application")
    .find((node) => node.attrs.kind === "business-loan" && node.attrs.participants?.includes(personId));
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
        body: JSON.stringify({
          content: `Selected option: ${selectedOption.name}. Business turnover is ${business?.attrs.turnoverFY25 ?? 0}. Mudra eligibility is ${mudra?.status ?? "unknown"}. Missing evidence: ${mudra?.missingEvidence.join(", ") ?? "none"}.`,
          language,
          context: { subject: "Business loan risk", sender: "Citizen eligibility engine", legitimacy: "legitimate", relatedTitle: "Sharma Web Solutions" },
        }),
      });
      if (response.ok && response.headers.get("x-citizen-fallback") !== "true") {
        const result = explainResponseSchema.parse(await response.json());
        setRisk(`${result.plainLanguage} ${result.nextAction}`);
      }
    } catch {
      setRisk(localRisk);
    } finally {
      setLoading(false);
      setStage(2);
    }
  };

  const startApplication = () => {
    if (!business || !mudra || application) return;
    const applicationId = "app:arjun-business-loan";
    const mutations: GraphMutation[] = [
      { type: "addNode", node: { id: applicationId, type: "application", attrs: { title: selectedOption.name, authority: selectedOption.authority, status: "draft", createdOn: "2026-08-24", relatedTo: business.id, kind: "business-loan", participants: [personId], currentStep: 0, note: `Selected ${selectedOption.name}.` }, verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" } } },
      { type: "addEdge", edge: { id: "e:arjun-subject-business-loan-application", type: "subjectOf", from: personId, to: applicationId, attrs: {}, validFrom: "2026-08-24", status: "active", verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" } } },
    ];
    commit({ actorId: personId, label: `${selectedOption.name} application started`, procedureId: "business-loan", mutations });
  };

  if (!business || !mudra) {
    return <ProcedureShell authority="Citizen eligibility engine" currentStep={0} description="This experience needs a linked business, registration, and benefit rule set." steps={steps} title="Business loan decision"><StepCard eyebrow="No linked business" title="Switch to Arjun’s profile" body="The loan decision reads Sharma Web Solutions, its Udyam record, turnover, and obligations. This profile has no connected business."><Button onClick={() => switchPersona("person:arjun")} variant="secondary">Switch to Arjun</Button></StepCard></ProcedureShell>;
  }

  const content = complete ? (
    <CompletionCard title="Your loan application is ready to continue." body="Citizen created a draft without hiding the missing ITR-V. The selected option and supporting evidence remain visible in Activity."><LinkButton href="/activity" variant="inverse">View application <ArrowRight aria-hidden className="size-4" /></LinkButton></CompletionCard>
  ) : stage === 0 ? (
    <StepCard eyebrow={business.attrs.name} title="You are potentially eligible for Mudra Kishor" body="Citizen checked the connected records instead of asking you to enter the same information again."><div className="flex flex-wrap items-center gap-2"><StatusPill label="Potentially eligible" tone="warning" /><SimulatedChip authority="SIDBI / member banks" /></div><div className="grid gap-2">{mudra.passedReasons.map((reason) => <p className="flex gap-2 text-xs leading-5 text-ink-muted" key={reason}><Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-success" />{reason}</p>)}{mudra.missingEvidence.map((evidence) => <p className="flex gap-2 rounded-xl bg-warning-soft p-3 text-xs font-bold text-warning" key={evidence}><FileWarning aria-hidden className="size-4 shrink-0" />Missing: {formatEvidence(evidence)}</p>)}</div><Button onClick={() => setStage(1)}>Compare options <ArrowRight aria-hidden className="size-4" /></Button></StepCard>
  ) : stage === 1 ? (
    <StepCard eyebrow="Three paths" title="Compare the cost and evidence burden" body="Rates are illustrative estimates, not offers. Choose the path you want Citizen to explain."><div className="grid gap-3">{loanOptions.map((option) => <button aria-pressed={selected === option.id} className={`grid gap-3 rounded-[17px] border p-4 text-left transition sm:grid-cols-[minmax(0,1fr)_repeat(3,auto)] sm:items-center ${selected === option.id ? "border-action bg-action-soft" : "border-line bg-surface hover:border-action/30"}`} key={option.id} onClick={() => setSelected(option.id)}><div><strong className="block text-sm text-ink">{option.name}</strong><span className="text-xs text-ink-muted">{option.note}</span></div><span className="text-xs font-bold text-ink">{option.amount}</span><span className="text-xs text-ink-muted">{option.rate}</span><span className="text-xs text-ink-muted">{option.term}</span></button>)}</div><Button loading={loading} onClick={() => void explainRisk()}><Scale aria-hidden className="size-4" />Explain my risk</Button></StepCard>
  ) : (
    <StepCard eyebrow={selectedOption.name} title="Fix the missing proof before borrowing" body={risk}><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-[16px] bg-success-soft p-4"><ShieldCheck aria-hidden className="mb-4 size-5 text-success" /><strong className="block text-sm text-success">Strong signals</strong><span className="text-xs leading-5 text-success">Udyam active, two-year vintage, ₹18 lakh turnover.</span></div><div className="rounded-[16px] bg-warning-soft p-4"><CircleHelp aria-hidden className="mb-4 size-5 text-warning" /><strong className="block text-sm text-warning">Before applying</strong><span className="text-xs leading-5 text-warning">Add ITR-V and review current obligations.</span></div></div><div className="flex flex-col gap-2 sm:flex-row"><Button onClick={startApplication}><Landmark aria-hidden className="size-4" />Start {selectedOption.name} draft</Button><Button onClick={() => setStage(1)} variant="secondary">Back to comparison</Button></div></StepCard>
  );

  return <ProcedureShell authority="Citizen eligibility engine + simulated member banks" complete={complete} currentStep={complete ? 3 : stage} description={`A decision built from ${formatCurrency(business.attrs.turnoverFY25)} turnover, registrations, tax evidence and live obligations.`} steps={steps} title="Should I take a business loan?">{content}</ProcedureShell>;
}
