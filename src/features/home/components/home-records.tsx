"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, MessageSquareText } from "lucide-react";
import { useRef, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { ListRow } from "@/components/ui/list-row";
import { SimulatedChip, StatusPill, VerificationBadge } from "@/components/ui/status";
import { getActivityEvents, getDocuments, getNotices, type NoticeView } from "@/features/graph/selectors";
import type { CitizenGraph } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { createFallbackExplanation } from "@/features/inbox/fallback";
import type { ExplainResponse } from "@/features/inbox/schema";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle, localizeNoticeBody } from "@/i18n/content";
import { getDocumentKindMessageKey, localizeEventLabel } from "@/i18n/formatters";
import { formatDate, formatDateTime } from "@/lib/format";

function getNoticeAuthority(graph: CitizenGraph, notice: NoticeView) {
  const related = notice.node.attrs.relatedTo
    ? graph.nodes.find((node) => node.id === notice.node.attrs.relatedTo)
    : undefined;
  if (related?.type === "application" || related?.type === "benefit" || related?.type === "document" || related?.type === "obligation") {
    return related.attrs.authority ?? notice.node.verification.source;
  }
  return notice.node.verification.source;
}

function getLinkedRecordTitle(graph: CitizenGraph, notice: NoticeView, language: "en" | "hi" | "kn") {
  const relatedId = notice.node.attrs.relatedTo;
  if (!relatedId) return "—";
  const related = graph.nodes.find((node) => node.id === relatedId);
  if (!related) return "—";
  if (related.type === "application" || related.type === "obligation") return localizeNodeTitle(language, related.id, related.attrs.title);
  if (related.type === "benefit") return localizeNodeTitle(language, related.id, related.attrs.name);
  if (related.type === "employment") return `${related.attrs.employer} · ${related.attrs.designation}`;
  if (related.type === "document") return localizeNodeTitle(language, related.id, related.attrs.kind.replaceAll("-", " "));
  return localizeNodeTitle(language, related.id, notice.node.attrs.subject);
}

function LegitimateNoticeDetail({ authority, linkedRecord, notice }: { authority: string; linkedRecord: string; notice: NoticeView }) {
  const { language, t } = useI18n();
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);

  const explain = () => {
    setExplanation(createFallbackExplanation(notice.node.id, language));
  };

  return (
    <article className="grid gap-6 rounded-[8px] border border-paper-line bg-paper p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="grid gap-1"><p className="eyebrow">{authority}</p><h3 className="font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-ink">{localizeNodeTitle(language, notice.node.id, notice.node.attrs.subject)}</h3></div><div className="flex flex-wrap gap-2"><VerificationBadge verification={notice.node.verification} /><SimulatedChip authority={authority} /></div></div>
      <blockquote className="border-y border-paper-line py-5 text-sm leading-7 text-ink-mute">{localizeNoticeBody(language, notice.node.id, notice.node.attrs.body)}</blockquote>
      {explanation ? <div className="grid gap-4 rounded-[8px] bg-indigo-tint p-5"><div className="flex items-center justify-between gap-3"><p className="eyebrow">{t("explain")}</p><SimulatedChip authority={explanation.authority} /></div><p className="font-display text-xl font-semibold leading-snug text-ink">{explanation.plainLanguage}</p><p className="grid gap-1 text-xs leading-5 text-ink-mute"><strong className="text-ink">{t("whatItMeans")}</strong>{explanation.whatItMeans}</p><p className="grid gap-1 text-xs leading-5 text-ink-mute"><strong className="text-ink">{t("nextAction")}</strong>{explanation.nextAction}</p></div> : null}
      <div className="flex flex-col gap-2 sm:flex-row">{explanation ? null : <Button onClick={explain} variant="secondary"><MessageSquareText aria-hidden className="size-4" />{t("explain")}</Button>}{notice.node.attrs.relatedTo === "obl:echallan-500" ? <LinkButton href="/workflows/obligations">{t("respond")}<ArrowRight aria-hidden className="size-4" /></LinkButton> : notice.node.id === "ntc:epfo-passbook" ? <LinkButton href="/workflows/epfo">{t("epfoService")}<ArrowRight aria-hidden className="size-4" /></LinkButton> : notice.node.id === "ntc:marriage-ripple" ? <LinkButton href="/workflows/marriage">{t("view")}<ArrowRight aria-hidden className="size-4" /></LinkButton> : null}</div>
      <details className="group border-t border-paper-line pt-4"><summary className="flex min-h-11 items-center justify-between text-xs font-bold text-ink-mute">{t("source")}<ChevronDown aria-hidden className="size-3.5 transition-transform group-open:rotate-180" /></summary><div className="grid gap-1 pb-2 pt-3 text-xs leading-5 text-ink-mute"><span><strong className="text-ink">{t("authority")}:</strong> {authority}</span><span><strong className="text-ink">{t("checked")}:</strong> {formatDate(notice.node.verification.asOf, language)}</span><span><strong className="text-ink">{t("linkedRecord")}:</strong> {linkedRecord}</span></div></details>
    </article>
  );
}

function DocumentsRail({ personId }: { personId: string }) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const documents = getDocuments(graph, personId);

  return (
    <aside className="grid content-start gap-5 rounded-[8px] border border-paper-line bg-paper-shade p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3"><h2 className="font-display text-2xl font-semibold text-ink">{t("documents")}</h2><span className="font-display text-2xl font-semibold tabular-nums text-indigo-deep">{documents.length}</span></div>
      <div className="divide-y divide-paper-line">{documents.slice(0, 3).map((document) => { const kindKey = getDocumentKindMessageKey(document.attrs.kind); return <div className="grid gap-2 py-3" key={document.id}><strong className="text-sm text-ink">{kindKey ? t(kindKey) : document.attrs.kind.replaceAll("-", " ")}</strong><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-ink-mute">{document.attrs.numberMasked ?? document.attrs.holderName}</span><VerificationBadge verification={document.verification} /></div></div>; })}</div>
      <Link className="flex min-h-11 items-center justify-between border-t border-paper-line pt-3 text-sm font-bold text-indigo-deep" href="/documents">{t("viewDocuments")}<ArrowRight aria-hidden className="size-4" /></Link>
    </aside>
  );
}

export function HomeRecords({ personId }: { personId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const notices = getNotices(graph, personId);
  const unread = notices.filter((notice) => !notice.read).length;
  const [inboxOpen, setInboxOpen] = useState(unread > 0);
  const [selectedId, setSelectedId] = useState("");
  const detailRef = useRef<HTMLDivElement>(null);
  const selected = selectedId ? notices.find((notice) => notice.node.id === selectedId) : undefined;
  const events = getActivityEvents(graph, personId);

  const markNoticeRead = (notice: NoticeView) => {
    if (notice.read) return;
    const edge = graph.edges.find((candidate) => candidate.type === "subjectOf" && candidate.from === personId && candidate.to === notice.node.id && candidate.status === "active");
    if (edge) commit({ actorId: personId, labelKey: "eventNoticeRead", labelParams: { noticeId: notice.node.id }, procedureId: "notice-reading", mutations: [{ type: "patchEdgeAttrs", edgeId: edge.id, attrs: { read: true } }] });
  };

  const openNotice = (notice: NoticeView) => {
    setSelectedId(notice.node.id);
    markNoticeRead(notice);
    window.requestAnimationFrame(() => detailRef.current?.scrollIntoView({ block: "nearest" }));
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <section className="grid gap-5">
        <details className="group overflow-hidden rounded-[8px] border border-paper-line bg-paper-shade px-5" onToggle={(event) => setInboxOpen(event.currentTarget.open)} open={inboxOpen}>
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 font-display text-2xl font-semibold text-ink [&::-webkit-details-marker]:hidden"><span>{t("governmentInbox")}</span><span className="flex items-center gap-3 text-base tabular-nums text-ink-mute">{notices.length}<ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" /></span></summary>
          <div className="grid gap-5 border-t border-paper-line">
            {notices.length ? <div>{notices.map((notice) => { const title = localizeNodeTitle(language, notice.node.id, notice.node.attrs.subject); return <ListRow action={<Button aria-label={`${t("view")}: ${title}`} onClick={() => openNotice(notice)} variant="quiet">{t("view")}</Button>} key={notice.node.id} meta={`${getNoticeAuthority(graph, notice)} · ${formatDate(notice.node.attrs.receivedOn, language)}`} status={<StatusPill label={notice.read ? t("done") : t("unread")} tone={notice.read ? "neutral" : "info"} />} title={title} />; })}</div> : <EmptyState title={t("noItems")} />}
            {selected ? <div className="pb-5" ref={detailRef}><LegitimateNoticeDetail authority={getNoticeAuthority(graph, selected)} key={selected.node.id} linkedRecord={getLinkedRecordTitle(graph, selected, language)} notice={selected} /></div> : null}
          </div>
        </details>
        <section>{events.length ? <details className="group overflow-hidden rounded-[8px] border border-paper-line bg-paper-shade px-5"><summary className="flex min-h-16 items-center justify-between font-display text-2xl font-semibold text-ink">{t("recentActivity")}<ChevronDown aria-hidden className="size-4 text-ink-mute transition-transform group-open:rotate-180" /></summary><ol className="border-t border-paper-line">{events.slice(0, 4).map((event) => <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-paper-line py-4 last:border-b-0" key={event.id}><span className="mt-1.5 size-2 rounded-full bg-green-deep" /><div><strong className="block text-sm text-ink">{localizeEventLabel(event, language)}</strong><span className="text-xs text-ink-mute">{formatDateTime(event.occurredAt, language)}</span></div></li>)}</ol></details> : <EmptyState title={t("noActivity")} />}</section>
      </section>
      <DocumentsRail personId={personId} />
    </div>
  );
}
