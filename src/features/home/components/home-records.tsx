"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { EmptyState } from "@/components/ui/feedback";
import { ListRow } from "@/components/ui/list-row";
import { StatusPill, VerificationBadge } from "@/components/ui/status";
import { getActivityEvents, getDocuments, getNotices, getPerson, type NoticeView } from "@/features/graph/selectors";
import type { CitizenGraph, GraphEvent } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { Button } from "@/components/ui/button";
import { NoticeDetail, getNoticeAuthority } from "@/features/inbox/components/notice-detail";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle } from "@/i18n/content";
import { getDocumentKindMessageKey, localizeEventLabel } from "@/i18n/formatters";
import { formatDate, formatDateTime } from "@/lib/format";

/** Name of the person who recorded a demo event on someone else's record, or undefined when they acted for themselves. */
function actedByOther(graph: CitizenGraph, event: GraphEvent, personId: string) {
  if (event.actorId === personId || event.id.startsWith("evt:seed-")) return undefined;
  return getPerson(graph, event.actorId)?.attrs.name ?? event.actorId;
}

function DocumentsRail({ personId }: { personId: string }) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const documents = getDocuments(graph, personId);

  return (
    <aside className="grid content-start gap-5 rounded-[3px] border border-paper-line bg-panel p-5 lg:sticky lg:top-24">
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
        <details className="group overflow-hidden rounded-[3px] border border-paper-line bg-panel px-5" onToggle={(event) => setInboxOpen(event.currentTarget.open)} open={inboxOpen}>
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 font-display text-2xl font-semibold text-ink [&::-webkit-details-marker]:hidden"><span>{t("governmentInbox")}</span><span className="flex items-center gap-3 text-base tabular-nums text-ink-mute">{notices.length}<ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" /></span></summary>
          <div className="grid gap-5 border-t border-paper-line">
            {notices.length ? <div>{notices.map((notice) => { const title = localizeNodeTitle(language, notice.node.id, notice.node.attrs.subject); return <ListRow action={<Button aria-label={`${t("view")}: ${title}`} onClick={() => openNotice(notice)} variant="quiet">{t("view")}</Button>} key={notice.node.id} meta={`${notice.node.attrs.lensSavedOn && notice.node.verification.source === "Self" ? t("noticeLensSavedByYou") : getNoticeAuthority(graph, notice)} · ${formatDate(notice.node.attrs.receivedOn, language)}`} status={<StatusPill label={notice.read ? t("noticeRead") : t("unread")} tone={notice.read ? "neutral" : "info"} />} title={title} />; })}</div> : <EmptyState title={t("noItems")} />}
            {selected ? <div className="pb-5" ref={detailRef}><NoticeDetail key={selected.node.id} notice={selected} personId={personId} /></div> : null}
          </div>
        </details>
        <Link className="min-h-11 content-center justify-self-start text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href="/inbox">{t("noticeLensTitle")}</Link>
        <section>{events.length ? <details className="group overflow-hidden rounded-[3px] border border-paper-line bg-panel px-5"><summary className="flex min-h-16 items-center justify-between font-display text-2xl font-semibold text-ink">{t("recentActivity")}<ChevronDown aria-hidden className="size-4 text-ink-mute transition-transform group-open:rotate-180" /></summary><ol className="border-t border-paper-line">{events.slice(0, 4).map((event) => <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-paper-line py-4 last:border-b-0" key={event.id}><span className="mt-1.5 size-2 rounded-full bg-green-deep" /><div><strong className="block text-sm text-ink">{localizeEventLabel(event, language)}</strong><span className="text-xs text-ink-mute">{formatDateTime(event.occurredAt, language)}{actedByOther(graph, event, personId) ? ` · ${t("recentBy", { name: actedByOther(graph, event, personId) ?? "" })}` : ""}</span></div></li>)}</ol></details> : <EmptyState title={t("noActivity")} />}</section>
      </section>
      <DocumentsRail personId={personId} />
    </div>
  );
}
