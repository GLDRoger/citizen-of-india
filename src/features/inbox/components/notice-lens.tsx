"use client";

import { useState } from "react";
import { ArrowRight, Check, FileText, Info, RotateCcw } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { FilePanel } from "@/components/ui/file-panel";
import { SimulatedChip } from "@/components/ui/status";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { formatCurrency, formatDate } from "@/lib/format";
import { analyzeNotice, noticeSamples, type NoticeAnalysis } from "../analyze";
import type { GraphMutation } from "@/features/graph/schema";

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function stableNoticeId(text: string) {
  const hash = [...normalize(text)].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
  return `ntc:lens-${hash.toString(36)}`;
}

function StepLabel({ current, number, title }: { current: boolean; number: number; title: string }) {
  return <li aria-current={current ? "step" : undefined} className={`flex items-center gap-2 text-xs font-bold ${current ? "text-indigo-deep" : "text-ink-mute"}`}><span className={`grid size-6 place-items-center rounded-full border text-[0.6875rem] ${current ? "border-indigo-deep bg-indigo-deep text-paper" : "border-paper-line"}`}>{number}</span>{title}</li>;
}

function AnalysisCard({ analysis, confirmed, onConfirm, onSave, saved, text }: { analysis: NoticeAnalysis; confirmed: boolean; onConfirm: (value: boolean) => void; onSave: () => void; saved: boolean; text: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const related = analysis.relatedRecordId ? graph.nodes.find((node) => node.id === analysis.relatedRecordId) : undefined;
  const relatedTitle = related ? (related.type === "benefit" ? related.attrs.name : "title" in related.attrs ? related.attrs.title : related.id) : undefined;
  return (
    <div className="grid gap-5 border-t border-paper-line pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="eyebrow text-indigo-deep">{analysis.match === "supported" ? t("noticeLensStepReview") : t("noticeLensUncertain")}</p><SimulatedChip authority={analysis.authority ?? "Notice guide"} /></div>
      {analysis.match === "supported" ? <>
        <div className="grid gap-2 rounded-[3px] bg-indigo-tint p-5"><p className="eyebrow">{t("noticeLensPlainLanguage")}</p><p className="font-display text-2xl font-semibold leading-tight text-ink">{analysis.plainLanguage}</p><p className="text-sm leading-6 text-ink-mute">{analysis.whatItMeans}</p><p className="grid gap-1 text-sm leading-6 text-ink-mute"><strong className="text-ink">{t("noticeLensRequiredAction")}</strong>{analysis.action === "no-action" ? t("noticeLensNoAction") : analysis.nextAction}</p></div>
        <dl className="grid gap-3 border-y border-paper-line py-4 text-sm sm:grid-cols-2"><div><dt className="text-xs text-ink-mute">{t("noticeLensIssuer")}</dt><dd className="font-bold text-ink">{analysis.authority}</dd></div>{analysis.issuer ? <div><dt className="text-xs text-ink-mute">{t("noticeLensReference")}</dt><dd className="font-bold text-ink">{analysis.issuer}{analysis.reference ? ` · ${analysis.reference}` : ""}</dd></div> : null}{analysis.amount !== undefined ? <div><dt className="text-xs text-ink-mute">{t("noticeLensAmount")}</dt><dd className="font-bold text-ink">{formatCurrency(analysis.amount)}</dd></div> : null}{analysis.deadline ? <div><dt className="text-xs text-ink-mute">{t("noticeLensDeadline")}</dt><dd className="font-bold text-ink">{formatDate(analysis.deadline, language)}</dd></div> : null}{analysis.consequence ? <div className="sm:col-span-2"><dt className="text-xs text-ink-mute">{t("noticeLensConsequence")}</dt><dd className="font-bold text-brick">{analysis.consequence}</dd></div> : null}</dl>
        {related ? <label className="flex items-start gap-3 text-sm leading-6 text-ink"><input checked={confirmed} className="mt-1 size-4 accent-indigo-deep" onChange={(event) => onConfirm(event.target.checked)} type="checkbox" /><span>{t("noticeLensConfirmRecord")}<strong className="block text-ink">{relatedTitle}</strong></span></label> : null}
      </> : <div className="grid gap-3 rounded-[3px] bg-paper-shade p-5 text-sm leading-6 text-ink-mute"><p>{t("noticeLensUnknownBody")}</p><p><strong className="text-ink">{t("noticeLensRequiredAction")}:</strong> {t("noticeLensUnknownNext")}</p></div>}
      <details className="group border-t border-paper-line pt-4"><summary className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-bold text-ink-mute"><FileText aria-hidden className="size-4" />{t("noticeLensOriginalText")}</summary><p className="whitespace-pre-wrap pb-2 pt-3 text-xs leading-5 text-ink-mute">{text}</p></details>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{saved ? <p className="flex min-h-11 items-center gap-2 text-sm font-bold text-green-deep"><Check aria-hidden className="size-4" />{t("noticeLensSaved")}</p> : <Button disabled={analysis.match === "supported" && Boolean(related) && !confirmed} onClick={onSave}>{t("noticeLensSave")}</Button>}{saved && analysis.workflowHref ? <LinkButton href={analysis.workflowHref}>{t("noticeLensOpenWorkflow")}<ArrowRight aria-hidden className="size-4" /></LinkButton> : null}</div>
    </div>
  );
}

export function NoticeLens({ personId }: { personId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<NoticeAnalysis | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [error, setError] = useState(false);

  const explain = () => {
    if (text.trim().length < 10) return;
    setDuplicate(false);
    setError(false);
    setConfirmed(false);
    setSaved(false);
    setAnalysis(analyzeNotice(text, graph, personId, language));
  };

  const save = () => {
    if (!analysis || text.trim().length < 10) return;
    const normalized = normalize(text);
    if (graph.nodes.some((node) => node.type === "notice" && node.attrs.lensText && normalize(node.attrs.lensText) === normalized)) {
      setDuplicate(true);
      return;
    }
    const existing = analysis.sampleId ? graph.nodes.find((node) => node.id === analysis.sampleId && node.type === "notice") : undefined;
    const selfDeclared = { source: "Self", state: "self-declared", asOf: DEMO_TODAY } as const;
    const mutations: GraphMutation[] = existing
      ? [{ type: "patchAttrs", nodeId: existing.id, attrs: { lensText: text, lensSavedOn: DEMO_TODAY, lensSampleId: analysis.sampleId } }]
      : (() => {
        const noticeId = stableNoticeId(text);
        const notice = { id: noticeId, type: "notice" as const, attrs: { channel: "letter" as const, sender: "Pasted by you", receivedOn: DEMO_TODAY, subject: "Notice saved for review", body: text, legitimacy: "unknown" as const, lensText: text, lensSavedOn: DEMO_TODAY }, verification: { source: "Self" as const, state: "pending" as const, asOf: DEMO_TODAY } };
        return [{ type: "addNode" as const, node: notice }, { type: "addEdge" as const, edge: { id: `e:${noticeId}:subject:${personId}`, type: "subjectOf" as const, from: personId, to: noticeId, attrs: { role: "notice", read: false }, validFrom: DEMO_TODAY, status: "active" as const, verification: selfDeclared } }];
      })();
    try {
      commit({ actorId: personId, labelKey: "eventNoticeLensSaved", procedureId: "notice-lens", mutations });
      setDuplicate(false);
      setError(false);
      setSaved(true);
    } catch {
      setError(true);
    }
  };

  const clear = () => { setText(""); setAnalysis(null); setConfirmed(false); setSaved(false); setDuplicate(false); setError(false); };

  return (
    <FilePanel className="grid gap-5 sm:p-7" label={t("noticeLensTitle")}>
      <div className="grid gap-2"><h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-ink">{t("noticeLensTitle")}</h2><p className="max-w-2xl text-sm leading-6 text-ink-mute">{t("noticeLensIntro")}</p></div>
      <ol aria-label={t("noticeLensTitle")} className="grid grid-cols-4 gap-2 border-y border-paper-line py-3"><StepLabel current={!analysis} number={1} title={t("noticeLensStepPaste")} /><StepLabel current={Boolean(analysis)} number={2} title={t("noticeLensStepExplain")} /><StepLabel current={Boolean(analysis)} number={3} title={t("noticeLensStepReview")} /><StepLabel current={saved} number={4} title={t("noticeLensStepSave")} /></ol>
      <label className="grid gap-2"><span className="text-sm font-bold text-ink">{t("noticeLensPaste")}</span><textarea aria-describedby="notice-lens-hint" className="min-h-32 resize-y rounded-[3px] border border-paper-line bg-paper px-4 py-3 text-sm leading-6 text-ink outline-none transition focus:border-indigo focus:ring-2 focus:ring-indigo/20" maxLength={20_000} onChange={(event) => { setText(event.target.value); setAnalysis(null); setSaved(false); setDuplicate(false); }} placeholder={t("noticeLensPaste")} value={text} /><span className="text-xs leading-5 text-ink-mute" id="notice-lens-hint">{t("noticeLensPasteHint")}</span></label>
      <div className="grid gap-2"><p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-mute">{t("noticeLensSamples")}</p><div className="flex flex-wrap gap-2">{noticeSamples.map((sample) => <button className="min-h-11 rounded-[2px] border border-paper-line px-3 text-xs font-bold text-indigo-deep transition-colors hover:border-indigo/40 hover:bg-indigo-tint" key={sample.id} onClick={() => { setText(sample.text[language]); setAnalysis(null); setSaved(false); setDuplicate(false); }} type="button">{sample.subject}</button>)}</div></div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"><Button disabled={text.trim().length < 10} onClick={explain}>{t("noticeLensExplain")}<ArrowRight aria-hidden className="size-4" /></Button>{analysis ? <Button onClick={clear} variant="secondary"><RotateCcw aria-hidden className="size-4" />{t("noticeLensClear")}</Button> : null}</div>
      {duplicate ? <p className="rounded-[2px] bg-indigo-tint px-4 py-3 text-sm font-semibold text-indigo-deep" role="status">{t("noticeLensDuplicate")}</p> : null}
      {error ? <p className="rounded-[2px] bg-brick-tint px-4 py-3 text-sm font-semibold text-brick" role="alert">{t("noticeLensSaveError")}</p> : null}
      {analysis ? <AnalysisCard analysis={analysis} confirmed={confirmed} onConfirm={setConfirmed} onSave={save} saved={saved} text={text} /> : null}
      <p className="flex items-start gap-2 border-t border-paper-line pt-4 text-xs leading-5 text-ink-mute"><Info aria-hidden className="mt-0.5 size-4 shrink-0 text-indigo-deep" />{t("noticeLensSafety")}</p>
    </FilePanel>
  );
}
