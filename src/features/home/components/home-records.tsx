"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Bell, ExternalLink, MessageSquareText } from "lucide-react";
import { useRef, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { ListRow } from "@/components/ui/list-row";
import { SectionHeader } from "@/components/ui/page";
import { SimulatedChip, StatusPill, VerificationBadge } from "@/components/ui/status";
import { getDocuments, getNotices, type NoticeView } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { createFallbackExplanation } from "@/features/inbox/fallback";
import { explainResponseSchema, type ExplainResponse } from "@/features/inbox/schema";
import { useI18n } from "@/i18n/use-i18n";
import { formatDate } from "@/lib/format";

function isSuspiciousNotice(notice: NoticeView) {
  return notice.node.attrs.legitimacy === "scam" || Boolean(notice.node.attrs.scamSignals?.length);
}

function ScamNoticeDetail({ notice }: { notice: NoticeView }) {
  const { t } = useI18n();
  const checkHref = `/workflows/scam-check?notice=${encodeURIComponent(notice.node.id)}`;

  return (
    <article className="grid gap-6 rounded-[8px] border border-brick/25 bg-brick-tint p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div className="grid gap-2"><StatusPill label={t("suspicious")} tone="warning" /><h3 className="font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-brick">{t("suspiciousMessageDetected")}</h3></div><SimulatedChip authority={notice.node.verification.source} /></div>
      <figure className="grid gap-3 rounded-[4px] border border-paper-line bg-paper p-4"><figcaption className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-mute">{t("originalMessage")} · {notice.node.attrs.sender}</figcaption><blockquote className="text-xs leading-6 text-ink-mute">{notice.node.attrs.body}</blockquote></figure>
      {notice.node.attrs.scamSignals ? <div className="grid gap-3"><p className="text-xs font-bold text-brick">{t("warningSigns")}</p><ul className="grid gap-2">{notice.node.attrs.scamSignals.map((signal) => <li className="flex gap-2 text-xs leading-5 text-brick" key={signal}><AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0" />{signal}</li>)}</ul></div> : null}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center"><LinkButton href={checkHref}>{t("runScamCheck")}<ArrowRight aria-hidden className="size-4" /></LinkButton><a className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ink underline decoration-ink/30 underline-offset-4" href="https://www.cybercrime.gov.in/" rel="noreferrer" target="_blank">{t("reportToCybercrime")}<ExternalLink aria-hidden className="size-3.5" /></a></div>
    </article>
  );
}

function LegitimateNoticeDetail({ notice }: { notice: NoticeView }) {
  const { language, t } = useI18n();
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const explain = async () => {
    setLoading(true);
    setExplanation(null);
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: notice.node.attrs.body, language, context: { subject: notice.node.attrs.subject, sender: notice.node.attrs.sender, legitimacy: notice.node.attrs.legitimacy } }),
      });
      if (!response.ok) throw new Error("Explanation unavailable");
      setExplanation(explainResponseSchema.parse(await response.json()));
    } catch {
      setExplanation(createFallbackExplanation(notice.node.attrs.legitimacy, language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="grid gap-6 rounded-[8px] border border-paper-line bg-paper-shade p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="grid gap-1"><p className="eyebrow">{notice.node.attrs.sender}</p><h3 className="font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-ink">{notice.node.attrs.subject}</h3></div><div className="flex flex-wrap gap-2"><VerificationBadge verification={notice.node.verification} /><SimulatedChip authority={notice.node.verification.source} /></div></div>
      <blockquote className="border-y border-paper-line py-5 text-sm leading-7 text-ink-mute">{notice.node.attrs.body}</blockquote>
      {explanation ? <div className="grid gap-4 rounded-[8px] bg-green-tint p-5"><div className="flex items-center justify-between gap-3"><p className="eyebrow">{t("explain")}</p><SimulatedChip authority={explanation.authority} /></div><p className="font-display text-xl font-semibold leading-snug text-ink">{explanation.plainLanguage}</p><p className="grid gap-1 text-xs leading-5 text-ink-mute"><strong className="text-ink">{t("whatItMeans")}</strong>{explanation.whatItMeans}</p><p className="grid gap-1 text-xs leading-5 text-ink-mute"><strong className="text-ink">{t("nextAction")}</strong>{explanation.nextAction}</p></div> : null}
      <div className="flex flex-col gap-2 sm:flex-row"><Button loading={loading} onClick={() => void explain()} variant="secondary"><MessageSquareText aria-hidden className="size-4" />{t("explain")}</Button>{notice.node.attrs.relatedTo === "obl:echallan-500" ? <LinkButton href="/workflows/obligations">{t("respond")}<ArrowRight aria-hidden className="size-4" /></LinkButton> : null}</div>
      <details className="border-t border-paper-line pt-4"><summary className="flex min-h-10 items-center justify-between text-xs font-bold text-ink-mute">{t("source")}<ExternalLink aria-hidden className="size-3.5" /></summary><div className="grid gap-1 pb-2 pt-3 text-xs leading-5 text-ink-mute"><span><strong className="text-ink">{t("authority")}:</strong> {notice.node.verification.source}</span><span><strong className="text-ink">{t("checked")}:</strong> {formatDate(notice.node.verification.asOf)}</span><span><strong className="text-ink">{t("linkedRecord")}:</strong> {notice.node.attrs.relatedTo ?? "—"}</span></div></details>
    </article>
  );
}

function NoticeDetail({ notice }: { notice: NoticeView }) {
  return isSuspiciousNotice(notice) ? <ScamNoticeDetail notice={notice} /> : <LegitimateNoticeDetail notice={notice} />;
}

function DocumentsRail({ personId }: { personId: string }) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const documents = getDocuments(graph, personId);

  return (
    <aside className="grid content-start gap-5 border-y border-paper-line py-5 lg:sticky lg:top-24 lg:rounded-[8px] lg:border lg:bg-paper-shade lg:p-5">
      <div className="flex items-center justify-between gap-3"><h2 className="font-display text-2xl font-semibold text-ink">{t("documents")}</h2><span className="font-display text-2xl font-semibold tabular-nums text-green-deep">{documents.length}</span></div>
      <div className="divide-y divide-paper-line">{documents.slice(0, 5).map((document) => <div className="grid gap-2 py-3" key={document.id}><strong className="text-sm capitalize text-ink">{document.attrs.kind.replaceAll("-", " ")}</strong><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-ink-mute">{document.attrs.numberMasked ?? document.attrs.holderName}</span><VerificationBadge verification={document.verification} /></div></div>)}</div>
      <Link className="flex min-h-11 items-center justify-between border-t border-paper-line pt-3 text-sm font-bold text-green-deep" href="/documents">{t("view")}<ArrowRight aria-hidden className="size-4" /></Link>
    </aside>
  );
}

export function HomeRecords({ personId }: { personId: string }) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const notices = getNotices(graph, personId);
  const unread = notices.filter((notice) => !notice.read).length;
  const [selectedId, setSelectedId] = useState(notices[0]?.node.id ?? "");
  const detailRef = useRef<HTMLDivElement>(null);
  const selected = notices.find((notice) => notice.node.id === selectedId) ?? notices[0];

  const openNotice = (id: string) => {
    setSelectedId(id);
    window.requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
      <section className="grid gap-5">
        <SectionHeader eyebrow={`${unread} ${t("unreadNotices").toLowerCase()}`} title={t("inbox")} />
        <div className="border-y border-paper-line">{notices.map((notice) => { const suspicious = isSuspiciousNotice(notice); return <ListRow action={<Button className="min-h-10 px-4" onClick={() => openNotice(notice.node.id)} variant="secondary">{t("view")}</Button>} icon={suspicious ? AlertTriangle : Bell} key={notice.node.id} meta={`${notice.node.attrs.sender} · ${formatDate(notice.node.attrs.receivedOn)}`} status={<StatusPill label={suspicious ? t("suspicious") : notice.read ? t("done") : t("unread")} tone={suspicious ? "warning" : notice.read ? "neutral" : "info"} />} title={suspicious ? t("suspiciousMessageDetected") : notice.node.attrs.subject} />; })}</div>
        {selected ? <div ref={detailRef}><NoticeDetail key={selected.node.id} notice={selected} /></div> : <EmptyState title={t("noItems")} />}
      </section>
      <DocumentsRail personId={personId} />
    </div>
  );
}
