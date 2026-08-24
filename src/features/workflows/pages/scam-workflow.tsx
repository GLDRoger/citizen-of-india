"use client";

import { AlertTriangle, ArrowRight, Check, Link2Off, MessageSquareWarning, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip, StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getNotices } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { submitCybercrimeReport } from "@/lib/mockGov";
import { analyzeScamLocally } from "../lib/scam-fallback";
import { scamCheckResponseSchema, type ScamCheckResponse } from "../lib/scam-schema";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const steps: ProcedureStep[] = [
  { id: "paste", title: "Add the message", description: "Paste text without opening links." },
  { id: "inspect", title: "Inspect warning signs", description: "Sender, domain, urgency and history." },
  { id: "respond", title: "Choose a safe action", description: "Ignore, verify or start a report." },
];

export function ScamWorkflow() {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const notices = personId ? getNotices(graph, personId) : [];
  const seededMessage = notices.find((notice) => notice.node.id === "ntc:scam-pan")?.node.attrs.body ?? "";
  const [message, setMessage] = useState(seededMessage);
  const [analysis, setAnalysis] = useState<ScamCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!personId) return null;
  const reportId = `app:cybercrime:${personId.slice(7)}`;
  const report = graph.nodes
    .filter((node) => node.type === "application")
    .find((node) => node.id === reportId);
  const complete = Boolean(report);
  const currentStep = complete ? 3 : analysis ? 2 : 0;

  const analyze = async () => {
    const trimmed = message.trim();
    if (trimmed.length < 5) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/scamcheck", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          language,
          knownInteractions: notices.map((notice) => ({ sender: notice.node.attrs.sender, subject: notice.node.attrs.subject, legitimacy: notice.node.attrs.legitimacy })),
        }),
      });
      if (!response.ok) throw new Error("Analysis unavailable");
      setAnalysis(scamCheckResponseSchema.parse(await response.json()));
    } catch {
      setAnalysis(analyzeScamLocally(trimmed, language));
    } finally {
      setLoading(false);
    }
  };

  const startReport = async () => {
    if (!analysis || report) return;
    setLoading(true);
    setError(null);
    try {
      const response = await submitCybercrimeReport({ reporterId: personId, message });
      const mutations: GraphMutation[] = [
        { type: "addNode", node: { id: reportId, type: "application", attrs: { title: "Cybercrime report: suspicious message", authority: response.authority, status: "draft", createdOn: "2026-08-24", relatedTo: seededMessage === message ? "ntc:scam-pan" : undefined, kind: "cybercrime", participants: [personId], reference: response.data.acknowledgement, note: "Draft only. Nothing was submitted to a real portal." }, verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" } } },
        { type: "addEdge", edge: { id: `e:${personId.slice(7)}-subject-cybercrime-draft`, type: "subjectOf", from: personId, to: reportId, attrs: {}, validFrom: "2026-08-24", status: "active", verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" } } },
      ];
      commit({ actorId: personId, label: "Cybercrime report draft created", procedureId: "scam-check", mutations });
    } catch {
      setError("The simulated report service did not respond. No draft was created.");
    } finally {
      setLoading(false);
    }
  };

  const content = complete ? (
    <CompletionCard title="A safe report draft is ready." body="Citizen preserved the suspicious message and warning signs in a local draft. Nothing was sent to a live cybercrime portal."><LinkButton href="/dashboard" variant="inverse">View draft <ArrowRight aria-hidden className="size-4" /></LinkButton></CompletionCard>
  ) : !analysis ? (
    <StepCard eyebrow="Paste without clicking" title="Check a suspicious message" body="Citizen compares the sender, links, pressure tactics, and interactions already shown in your inbox."><label className="grid gap-2"><span className="text-xs font-bold text-ink">Message text</span><textarea className="min-h-40 resize-y rounded-[17px] border border-line bg-canvas p-4 text-sm leading-6 text-ink outline-none focus:border-action focus:ring-4 focus:ring-action/10" maxLength={2000} onChange={(event) => setMessage(event.target.value)} value={message} /></label><p className="flex gap-2 text-xs text-ink-muted"><Link2Off aria-hidden className="size-4 shrink-0 text-danger" />Citizen never opens a pasted link during this check.</p><Button disabled={message.trim().length < 5} loading={loading} onClick={() => void analyze()}><MessageSquareWarning aria-hidden className="size-4" />Analyze message</Button></StepCard>
  ) : (
    <StepCard eyebrow="Safety result" title={analysis.summary} body="This automated check uses the message text and the interactions already shown in your inbox. Verify through an official channel before acting."><div className="flex flex-wrap items-center gap-2"><StatusPill label={analysis.verdict.replaceAll("-", " ")} tone={analysis.verdict === "suspicious" ? "warning" : "info"} /><StatusPill label={`${analysis.confidence} confidence`} tone="neutral" /><SimulatedChip authority={analysis.authority} /></div><div className="grid gap-2">{analysis.signals.map((signal) => <p className="flex gap-2 text-xs leading-5 text-ink-muted" key={signal}><AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0 text-warning" />{signal}</p>)}</div><div className="grid gap-2 rounded-[16px] bg-action-soft p-4"><strong className="flex items-center gap-2 text-sm text-ink"><ShieldAlert aria-hidden className="size-4 text-action" />Safe next actions</strong>{analysis.nextActions.map((action) => <p className="flex gap-2 text-xs leading-5 text-ink-muted" key={action}><Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-success" />{action}</p>)}</div><div className="flex flex-col gap-2 sm:flex-row"><Button loading={loading} onClick={() => void startReport()}>Create cybercrime draft</Button><Button onClick={() => setAnalysis(null)} variant="secondary">Check another</Button></div></StepCard>
  );

  return <ProcedureShell authority="Citizen safety analysis + simulated cybercrime portal" complete={complete} currentStep={currentStep} description={t("scamPromise")} steps={steps} title={t("scamService")}>{error ? <p className="mb-3 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger" role="alert">{error}</p> : null}{content}</ProcedureShell>;
}
