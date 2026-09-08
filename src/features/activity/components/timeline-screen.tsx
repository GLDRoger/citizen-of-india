"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Page, PageHeader } from "@/components/ui/page";
import { useAuthStore } from "@/features/auth/store";
import { describeEventSources, describeEventTargets, describeMutation } from "@/features/graph/describe-mutation";
import { getApplicationHref } from "@/features/graph/navigation";
import type { CitizenGraph, GraphEvent } from "@/features/graph/schema";
import { getActivityEvents, getPerson } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeEventLabel } from "@/i18n/formatters";
import { formatDate, formatDateTime } from "@/lib/format";

const obligationHrefs: Record<string, string> = {
  "obl:echallan-500": "/workflows/obligations",
  "obl:bbmp-property-tax": "/workflows/property-tax",
  "obl:gstr3b-sep": "/workflows/gstr3b",
  "obl:itr-refund": "/workflows/refund-track",
};

function eventHref(graph: CitizenGraph, event: GraphEvent) {
  for (const id of describeEventTargets(event)) {
    const node = graph.nodes.find((candidate) => candidate.id === id);
    if (!node) continue;
    if (node.type === "application") return getApplicationHref(node) ?? "/you#government-dealings";
    if (node.type === "obligation") return obligationHrefs[node.id] ?? "/home#attention";
    if (node.type === "document") return "/documents";
    if (node.type === "delegation") return "/you";
    if (node.type === "notice") return `/inbox#${encodeURIComponent(node.id)}`;
  }
  return undefined;
}

function sourceLabel(source: string, t: ReturnType<typeof useI18n>["t"]) {
  return source === "Self" ? t("sourceSelf") : source === "Municipal" ? t("sourceMunicipal") : source === "IncomeTax" ? t("sourceIncomeTax") : source;
}

function TimelineEvent({ event, personId, seeded }: { event: GraphEvent; personId: string; seeded: boolean }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const actor = getPerson(graph, event.actorId);
  const actorName = event.actorId === personId ? t("timelineYou") : actor?.attrs.name ?? event.actorId;
  const sources = describeEventSources(graph, event);
  const changes = event.mutations.flatMap((mutation) => describeMutation(mutation, t));
  const href = eventHref(graph, event);
  return (
    <li className="grid gap-3 border-b border-paper-line py-5 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8">
      <div className="grid content-start gap-1">
        <time className="font-display text-base font-bold tabular-nums text-ink" dateTime={event.occurredAt}>{seeded ? formatDate(event.occurredAt, language) : formatDateTime(event.occurredAt, language)}</time>
        {seeded ? null : <span className="text-xs text-ink-mute">{t("timelineBy", { name: actorName })}</span>}
      </div>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">{localizeEventLabel(event, language)}</h3>
          {href ? <Link className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href={href}>{t("timelineOpen")}<ArrowRight aria-hidden className="size-3.5" /></Link> : null}
        </div>
        <dl className="grid gap-x-6 gap-y-1 text-xs leading-5 text-ink-mute sm:grid-cols-[auto_minmax(0,1fr)]">
          <dt className="font-bold text-ink">{t("timelineSource")}</dt>
          <dd>{sources.length ? sources.map((source) => sourceLabel(source, t)).join(" · ") : "—"}</dd>
          <dt className="font-bold text-ink">{changes.length === 1 ? t("timelineChangeOne") : t("timelineChanges", { count: changes.length })}</dt>
          <dd className="grid gap-0.5">{changes.map((change, index) => <span key={`${change}-${index}`}>{change}</span>)}</dd>
        </dl>
      </div>
    </li>
  );
}

const PAGE_SIZE = 8;

/** Newer / older controls for the on-record list. Dates run newest first, so "older" moves forward through pages. */
function Pager({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  const { t } = useI18n();
  if (total <= 1) return null;
  return (
    <nav aria-label={t("pageOf", { page: page + 1, total })} className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink pt-4">
      <Button disabled={page === 0} onClick={() => onChange(page - 1)} variant="secondary"><ArrowLeft aria-hidden className="size-4" />{t("pagePrevious")}</Button>
      <span className="text-xs font-bold tabular-nums text-ink-mute">{t("pageOf", { page: page + 1, total })}</span>
      <Button disabled={page >= total - 1} onClick={() => onChange(page + 1)} variant="secondary">{t("pageNext")}<ArrowRight aria-hidden className="size-4" /></Button>
    </nav>
  );
}

export function TimelineScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const [page, setPage] = useState(0);
  if (!personId) return null;
  const events = getActivityEvents(graph, personId);
  const demoEvents = events.filter((event) => !event.id.startsWith("evt:seed-"));
  const seededEvents = events.filter((event) => event.id.startsWith("evt:seed-"));
  const pageCount = Math.max(1, Math.ceil(seededEvents.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const pageEvents = seededEvents.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const changePage = (next: number) => {
    setPage(next);
    document.getElementById("on-record")?.scrollIntoView({ block: "start" });
  };

  return (
    <Page className="grid gap-10">
      <PageHeader description={t("timelineBody")} eyebrow={t("timelineCount", { count: events.length })} title={t("timelineTitle")} />
      <section className="grid gap-4">
        <h2 className="eyebrow text-indigo-deep">{t("timelineDuringDemo")}</h2>
        {demoEvents.length ? (
          <ol className="border-y border-paper-line">{demoEvents.map((event) => <TimelineEvent event={event} key={event.id} personId={personId} seeded={false} />)}</ol>
        ) : (
          <p className="border-y border-paper-line py-7 text-sm text-ink-mute">{t("timelineEmpty")}</p>
        )}
      </section>
      <section className="grid scroll-mt-20 gap-4" id="on-record">
        <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="eyebrow">{t("timelineOnRecord")}</h2><span className="text-xs tabular-nums text-ink-mute">{t("pageShowing", { from: current * PAGE_SIZE + 1, to: current * PAGE_SIZE + pageEvents.length, total: seededEvents.length })}</span></div>
        <ol className="border-y border-paper-line">{pageEvents.map((event) => <TimelineEvent event={event} key={event.id} personId={personId} seeded />)}</ol>
        <Pager onChange={changePage} page={current} total={pageCount} />
      </section>
    </Page>
  );
}
