"use client";

import { AlertTriangle, ArrowRight, Check, Link2Off, MessageSquareWarning, ShieldAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip, StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getNotices } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { getConfidenceMessageKey, getScamVerdictMessageKey } from "@/i18n/formatters";
import { submitCybercrimeReport } from "@/lib/mockGov";
import { analyzeScamLocally } from "../lib/scam-fallback";
import { scamCheckResponseSchema, type ScamCheckResponse } from "../lib/scam-schema";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [{ id: "paste", title: "Add the message", description: "Paste text without opening links." }, { id: "inspect", title: "Inspect warning signs", description: "Sender, domain, urgency and history." }, { id: "respond", title: "Choose a safe action", description: "Ignore, verify or start a report." }],
  hi: [{ id: "paste", title: "संदेश जोड़ें", description: "लिंक खोले बिना संदेश चिपकाएँ।" }, { id: "inspect", title: "चेतावनी संकेत जाँचें", description: "भेजने वाला, डोमेन, जल्दबाज़ी और इतिहास।" }, { id: "respond", title: "सुरक्षित कदम चुनें", description: "अनदेखा करें, पुष्टि करें या रिपोर्ट बनाएँ।" }],
  kn: [{ id: "paste", title: "ಸಂದೇಶ ಸೇರಿಸಿ", description: "ಲಿಂಕ್ ತೆರೆಯದೆ ಪಠ್ಯ ಅಂಟಿಸಿ." }, { id: "inspect", title: "ಎಚ್ಚರಿಕೆ ಲಕ್ಷಣ ಪರಿಶೀಲಿಸಿ", description: "ಕಳುಹಿಸಿದವರು, ಡೊಮೇನ್, ತುರ್ತು ಮತ್ತು ಇತಿಹಾಸ." }, { id: "respond", title: "ಸುರಕ್ಷಿತ ಕ್ರಮ ಆರಿಸಿ", description: "ನಿರ್ಲಕ್ಷಿಸಿ, ಖಚಿತಪಡಿಸಿ ಅಥವಾ ವರದಿ ರಚಿಸಿ." }],
};

export function ScamWorkflow() {
  const { language } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const notices = personId ? getNotices(graph, personId) : [];
  const searchParams = useSearchParams();
  const requestedNoticeId = searchParams.get("notice") ?? "ntc:scam-pan";
  const requestedNotice = notices.find((notice) => notice.node.id === requestedNoticeId) ?? notices.find((notice) => notice.node.id === "ntc:scam-pan");
  const seededMessage = requestedNotice?.node.attrs.body ?? "";
  const reportMode = searchParams.get("mode") === "report";

  if (!personId) return null;
  return <ScamWorkflowSession initialMessage={seededMessage} key={`${language}:${requestedNotice?.node.id ?? "message"}:${reportMode}`} noticeId={requestedNotice?.node.id} personId={personId} reportMode={reportMode} />;
}

function ScamWorkflowSession({ initialMessage, noticeId, personId, reportMode }: { initialMessage: string; noticeId?: string; personId: string; reportMode: boolean }) {
  const { language, t } = useI18n();
  const steps = stepsByLanguage[language];
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const notices = getNotices(graph, personId);
  const [message, setMessage] = useState(initialMessage);
  const [analysis, setAnalysis] = useState<ScamCheckResponse | null>(() => reportMode && initialMessage ? analyzeScamLocally(initialMessage, language) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportId = `app:cybercrime:${personId.slice(7)}`;
  const report = graph.nodes
    .filter((node) => node.type === "application")
    .find((node) => node.id === reportId);
  const complete = Boolean(report);
  const currentStep = complete ? 2 : analysis ? 1 : 0;
  const verdictKey = analysis ? getScamVerdictMessageKey(analysis.verdict) : undefined;
  const confidenceKey = analysis ? getConfidenceMessageKey(analysis.confidence) : undefined;

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
      { type: "addNode", node: { id: reportId, type: "application", attrs: { title: "Cybercrime report: suspicious message", authority: response.authority, status: "draft", createdOn: "2026-08-24", relatedTo: initialMessage === message ? noticeId : undefined, kind: "cybercrime", participants: [personId], reference: response.data.acknowledgement, note: "Draft only. Nothing was submitted to a real portal." }, verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" } } },
        { type: "addEdge", edge: { id: `e:${personId.slice(7)}-subject-cybercrime-draft`, type: "subjectOf", from: personId, to: reportId, attrs: {}, validFrom: "2026-08-24", status: "active", verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" } } },
      ];
      commit({ actorId: personId, labelKey: "eventCybercrimeDraftCreated", procedureId: "scam-check", mutations });
    } catch {
      setError("The simulated report service did not respond. No draft was created.");
    } finally {
      setLoading(false);
    }
  };

  const content = complete ? (
    <CompletionCard title="A safe report draft is ready." body="Citizen preserved the suspicious message and warning signs in a local draft. Nothing was sent to a live cybercrime portal."><LinkButton href="/dashboard" variant="inverse">View draft <ArrowRight aria-hidden className="size-4" /></LinkButton></CompletionCard>
  ) : !analysis ? (
    <StepCard eyebrow="Paste without clicking" title="Check a suspicious message" body="Citizen compares the sender, links, pressure tactics, and interactions already shown in your inbox."><label className="grid gap-2"><span className="text-xs font-bold text-ink">Message text</span><textarea className="min-h-40 resize-y rounded-[8px] border border-paper-line bg-paper p-4 text-sm leading-6 text-ink outline-none focus:border-green-deep focus:ring-4 focus:ring-green-deep/10" maxLength={2000} onChange={(event) => setMessage(event.target.value)} value={message} /></label><p className="flex gap-2 text-xs text-ink-mute"><Link2Off aria-hidden className="size-4 shrink-0 text-brick" />Citizen never opens a pasted link during this check.</p><Button disabled={message.trim().length < 5} loading={loading} onClick={() => void analyze()}><MessageSquareWarning aria-hidden className="size-4" />Analyze message</Button></StepCard>
  ) : (
    <div id="report-draft"><StepCard eyebrow="Safety result" title={analysis.summary} body="This automated check uses the message text and the interactions already shown in your inbox. Verify through an official channel before acting."><div className="flex flex-wrap items-center gap-2"><StatusPill label={verdictKey ? t(verdictKey) : analysis.verdict} tone={analysis.verdict === "suspicious" ? "warning" : "info"} /><StatusPill label={t("confidenceLabel", { confidence: confidenceKey ? t(confidenceKey) : analysis.confidence })} tone="neutral" /><SimulatedChip authority={analysis.authority} /></div><div className="grid gap-2">{analysis.signals.map((signal) => <p className="flex gap-2 text-xs leading-5 text-ink-mute" key={signal}><AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brick" />{signal}</p>)}</div><div className="grid gap-2 rounded-[8px] bg-green-tint p-4"><strong className="flex items-center gap-2 text-sm text-ink"><ShieldAlert aria-hidden className="size-4 text-green-deep" />Safe next actions</strong>{analysis.nextActions.map((action) => <p className="flex gap-2 text-xs leading-5 text-ink-mute" key={action}><Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-green-deep" />{action}</p>)}</div><div className="flex flex-col gap-2 sm:flex-row"><Button loading={loading} onClick={() => void startReport()}>Create cybercrime draft</Button><Button onClick={() => setAnalysis(null)} variant="secondary">Check another</Button></div></StepCard></div>
  );

  return <ProcedureShell authority="Citizen safety analysis + simulated cybercrime portal" complete={complete} currentStep={currentStep} description={t("scamPromise")} procedureId="scam-check" steps={steps} title={t("scamService")}>{error ? <p className="mb-3 rounded-xl bg-brick-tint p-3 text-sm font-semibold text-brick" role="alert">{error}</p> : null}{content}</ProcedureShell>;
}
