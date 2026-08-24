"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Bell, CalendarDays, ExternalLink, FileClock, FileText, IndianRupee, MessageSquareText, SearchCheck } from "lucide-react";
import { useRef, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { ListRow } from "@/components/ui/list-row";
import { Page, PageHeader, SectionHeader } from "@/components/ui/page";
import { StatCard } from "@/components/ui/stat-card";
import { SimulatedChip, StatusPill, VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getActivityEvents, getApplications, getDocuments, getMoneySummary, getNotices, getObligations, type NoticeView } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { createFallbackExplanation } from "@/features/inbox/fallback";
import { explainResponseSchema, type ExplainResponse } from "@/features/inbox/schema";
import { useI18n } from "@/i18n/use-i18n";
import { daysUntil, formatCurrency, formatDate } from "@/lib/format";

function NoticeDetail({ notice }: { notice: NoticeView }) {
  const { language, t } = useI18n();
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const suspicious = notice.node.attrs.legitimacy === "scam";

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
    <article className="grid gap-6 rounded-[22px] border border-line bg-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="grid gap-1"><p className="eyebrow">{notice.node.attrs.sender}</p><h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-ink">{notice.node.attrs.subject}</h2></div><div className="flex flex-wrap gap-2"><VerificationBadge verification={notice.node.verification} /><SimulatedChip authority={notice.node.verification.source} /></div></div>
      <blockquote className="border-y border-line py-5 text-sm leading-7 text-ink-muted">{notice.node.attrs.body}</blockquote>
      {notice.node.attrs.scamSignals ? <div className="grid gap-3"><p className="text-xs font-bold text-danger">{t("warningSigns")}</p><ul className="grid gap-2">{notice.node.attrs.scamSignals.map((signal) => <li className="flex gap-2 text-xs leading-5 text-danger" key={signal}><AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0" />{signal}</li>)}</ul></div> : null}
      {explanation ? <div className="grid gap-4 rounded-[18px] bg-action-soft p-5"><div className="flex items-center justify-between gap-3"><p className="eyebrow">{t("explain")}</p><SimulatedChip authority={explanation.authority} /></div><p className="font-display text-xl font-semibold leading-snug text-ink">{explanation.plainLanguage}</p><p className="grid gap-1 text-xs leading-5 text-ink-muted"><strong className="text-ink">{t("whatItMeans")}</strong>{explanation.whatItMeans}</p><p className="grid gap-1 text-xs leading-5 text-ink-muted"><strong className="text-ink">{t("nextAction")}</strong>{explanation.nextAction}</p></div> : null}
      <div className="flex flex-col gap-2 sm:flex-row"><Button loading={loading} onClick={() => void explain()} variant="secondary"><MessageSquareText aria-hidden className="size-4" />{t("explain")}</Button>{suspicious ? <LinkButton href="/workflows/scam-check">{t("respond")}<ArrowRight aria-hidden className="size-4" /></LinkButton> : notice.node.attrs.relatedTo === "obl:echallan-500" ? <LinkButton href="/workflows/obligations">{t("respond")}<ArrowRight aria-hidden className="size-4" /></LinkButton> : null}</div>
      <details className="border-t border-line pt-4"><summary className="flex min-h-10 items-center justify-between text-xs font-bold text-ink-muted">{t("source")}<ExternalLink aria-hidden className="size-3.5" /></summary><div className="grid gap-1 pb-2 pt-3 text-xs leading-5 text-ink-muted"><span><strong className="text-ink">{t("authority")}:</strong> {notice.node.verification.source}</span><span><strong className="text-ink">{t("checked")}:</strong> {formatDate(notice.node.verification.asOf)}</span><span><strong className="text-ink">{t("linkedRecord")}:</strong> {notice.node.attrs.relatedTo ?? "—"}</span></div></details>
    </article>
  );
}

function DocumentsRail({ personId }: { personId: string }) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const documents = getDocuments(graph, personId);
  return (
    <aside className="grid content-start gap-5 rounded-[22px] border border-line bg-surface p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3"><h2 className="font-display text-2xl font-semibold text-ink">{t("documents")}</h2><span className="font-display text-2xl font-semibold text-action-strong">{documents.length}</span></div>
      <div className="divide-y divide-line">{documents.slice(0, 5).map((document) => <div className="grid gap-2 py-3" key={document.id}><strong className="text-sm capitalize text-ink">{document.attrs.kind.replaceAll("-", " ")}</strong><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-ink-muted">{document.attrs.numberMasked ?? document.attrs.holderName}</span><VerificationBadge verification={document.verification} /></div></div>)}</div>
      <Link className="flex min-h-11 items-center justify-between border-t border-line pt-3 text-sm font-bold text-action-strong" href="/documents">{t("view")}<ArrowRight aria-hidden className="size-4" /></Link>
    </aside>
  );
}

export function DashboardScreen() {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const notices = personId ? getNotices(graph, personId) : [];
  const [selectedId, setSelectedId] = useState(notices[0]?.node.id ?? "");
  const detailRef = useRef<HTMLDivElement>(null);
  if (!personId) return null;

  const obligations = getObligations(graph, personId).filter((node) => !["paid", "received", "completed"].includes(node.attrs.status ?? ""));
  const applications = getApplications(graph, personId).filter((node) => node.attrs.status !== "completed");
  const documents = getDocuments(graph, personId);
  const expiringDocuments = documents.filter((document) => document.attrs.expiresOn && daysUntil(document.attrs.expiresOn) >= 0 && daysUntil(document.attrs.expiresOn) <= 180);
  const deadlineCount = obligations.filter((node) => Boolean(node.attrs.dueDate)).length;
  const money = getMoneySummary(graph, personId);
  const events = getActivityEvents(graph, personId);
  const selected = notices.find((notice) => notice.node.id === selectedId) ?? notices[0];
  const locale = language === "hi" ? "hi-IN" : language === "kn" ? "kn-IN" : "en-IN";

  const openNotice = (id: string) => {
    setSelectedId(id);
    window.requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  return (
    <Page className="grid gap-10 lg:gap-14">
      <PageHeader eyebrow={t("dashboard")} title={t("dashboardHeadline")} description={t("dashboardBody")} action={<LinkButton href="/workflows/scam-check" variant="secondary"><SearchCheck aria-hidden className="size-4" />{t("checkMessage")}</LinkButton>} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard detail={obligations[0]?.attrs.title ?? t("noItems")} href="#attention" icon={CalendarDays} showArrow={false} title={t("deadlines")} tone="saffron" value={deadlineCount} /><StatCard detail={expiringDocuments[0]?.attrs.kind.replaceAll("-", " ") ?? t("noItems")} href="/documents" icon={FileClock} title={t("expiry")} tone="info" value={expiringDocuments.length} /><StatCard detail={applications[0]?.attrs.title ?? t("noItems")} href="#attention" icon={FileText} showArrow={false} title={t("pendingApplications")} value={applications.length} /><StatCard detail={`${t("comingToYou")}: ${formatCurrency(money.receivable)}`} href="#attention" icon={IndianRupee} showArrow={false} title={t("due")} tone="success" value={formatCurrency(money.payable)} /></section>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div className="grid gap-10">
          <section className="grid gap-5" id="attention"><SectionHeader eyebrow={`${notices.length + obligations.length} ${t("thingsToDo").toLowerCase()}`} title={t("thingsToDo")} /><div className="border-y border-line">{notices.map((notice) => <ListRow action={<Button className="min-h-10 px-4" onClick={() => openNotice(notice.node.id)} variant="secondary">{t("view")}</Button>} icon={notice.node.attrs.legitimacy === "scam" ? AlertTriangle : Bell} key={notice.node.id} meta={`${notice.node.attrs.sender} · ${formatDate(notice.node.attrs.receivedOn)}`} status={<StatusPill label={notice.node.attrs.legitimacy === "scam" ? t("warningSigns") : notice.read ? t("done") : t("unread")} tone={notice.node.attrs.legitimacy === "scam" ? "warning" : notice.read ? "neutral" : "info"} />} title={notice.node.attrs.subject} tone={notice.node.attrs.legitimacy === "scam" ? "danger" : "info"} />)}{obligations.map((obligation) => <ListRow action={obligation.id === "obl:echallan-500" ? <LinkButton className="min-h-10 px-4" href="/workflows/obligations">{t("pay")}</LinkButton> : <StatusPill label={obligation.attrs.status ?? t("pending")} tone={obligation.attrs.direction === "receivable" ? "success" : "warning"} />} icon={obligation.attrs.direction === "payable" ? IndianRupee : CalendarDays} key={obligation.id} meta={`${obligation.attrs.authority}${obligation.attrs.dueDate ? ` · ${formatDate(obligation.attrs.dueDate)}` : ""}`} title={obligation.attrs.title} tone={obligation.attrs.direction === "receivable" ? "success" : "saffron"} />)}</div></section>
          {selected ? <div ref={detailRef}><NoticeDetail key={selected.node.id} notice={selected} /></div> : <EmptyState title={t("noItems")} />}
          <section className="grid gap-5"><SectionHeader title={t("recentActivity")} />{events.length ? <ol className="border-y border-line">{events.slice(0, 6).map((event) => <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-line py-4 last:border-b-0" key={event.id}><span className="mt-1.5 size-2 rounded-full bg-action" /><div><strong className="block text-sm text-ink">{event.label}</strong><span className="text-xs text-ink-muted">{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.occurredAt))}</span></div></li>)}</ol> : <EmptyState title={t("noActivity")} />}</section>
        </div>
        <DocumentsRail personId={personId} />
      </div>
    </Page>
  );
}
