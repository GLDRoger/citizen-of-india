"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, IndianRupee } from "lucide-react";
import { EmptyState } from "@/components/ui/feedback";
import { Page, PageHeader, SectionHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getApplicationHref } from "@/features/graph/navigation";
import { getActivityEvents, getApplications, getMoneySummary, getObligations } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency, formatDate } from "@/lib/format";

function statusTone(status: string) {
  if (["completed", "paid", "received"].includes(status)) return "success" as const;
  if (["processing", "submitted", "appointment-booked"].includes(status)) return "info" as const;
  return "warning" as const;
}

export function ActivityScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;
  const obligations = getObligations(graph, personId);
  const applications = getApplications(graph, personId);
  const money = getMoneySummary(graph, personId);
  const events = getActivityEvents(graph, personId);

  return (
    <Page className="grid gap-10">
      <PageHeader eyebrow={t("activity")} title={t("deadlines")} description="Payments, filings, applications and completed record changes in one chronological view." />

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex min-h-28 items-center gap-4 border-y border-line py-5">
          <span className="grid size-11 place-items-center rounded-full bg-danger-soft text-danger"><IndianRupee aria-hidden className="size-5" /></span>
          <div><span className="text-xs text-ink-muted">{t("due")}</span><strong className="block font-display text-3xl font-semibold text-ink">{formatCurrency(money.payable)}</strong></div>
        </div>
        <div className="flex min-h-28 items-center gap-4 border-y border-line py-5">
          <span className="grid size-11 place-items-center rounded-full bg-success-soft text-success"><IndianRupee aria-hidden className="size-5" /></span>
          <div><span className="text-xs text-ink-muted">{t("comingToYou")}</span><strong className="block font-display text-3xl font-semibold text-ink">{formatCurrency(money.receivable)}</strong></div>
        </div>
      </section>

      <section className="grid gap-5">
        <SectionHeader eyebrow={`${obligations.length}`} title={t("deadlines")} />
        <div className="divide-y divide-line border-y border-line">
          {obligations.map((obligation) => {
            const complete = ["paid", "received", "completed"].includes(obligation.attrs.status ?? "");
            return (
              <article className="grid gap-3 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center" key={obligation.id}>
                <span className={`grid size-10 place-items-center rounded-full ${complete ? "bg-success-soft text-success" : "bg-surface-strong text-ink-muted"}`}>
                  {complete ? <CheckCircle2 aria-hidden className="size-5" /> : <CalendarDays aria-hidden className="size-5" />}
                </span>
                <div className="min-w-0"><h3 className="font-bold text-ink">{obligation.attrs.title}</h3><p className="mt-1 text-xs text-ink-muted">{obligation.attrs.authority}{obligation.attrs.dueDate ? ` · ${formatDate(obligation.attrs.dueDate)}` : ""}</p></div>
                <div className="flex items-center gap-3 sm:justify-end">
                  {obligation.attrs.amount ? <strong className="text-sm text-ink">{formatCurrency(obligation.attrs.amount)}</strong> : null}
                  {obligation.id === "obl:echallan-500" && !complete ? (
                    <Link className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-action px-4 text-xs font-bold text-action-ink" href="/workflows/obligations">{t("pay")} <ArrowUpRight aria-hidden className="size-3" /></Link>
                  ) : <StatusPill label={obligation.attrs.status ?? "Due"} tone={statusTone(obligation.attrs.status ?? "due")} />}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5">
        <SectionHeader eyebrow={`${applications.length}`} title={t("pendingApplications")} />
        {applications.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {applications.map((application) => {
              const href = getApplicationHref(application);
              const content = <><div className="flex items-start justify-between gap-3"><Clock3 aria-hidden className="size-5 text-action" /><StatusPill label={application.attrs.status.replaceAll("-", " ")} tone={statusTone(application.attrs.status)} /></div><div><h3 className="font-display text-xl font-semibold text-ink">{application.attrs.title}</h3><p className="text-xs text-ink-muted">{application.attrs.authority} · {formatDate(application.attrs.createdOn)}</p></div></>;
              const className = "grid min-h-36 gap-5 rounded-[20px] border border-line bg-surface p-5";
              return href ? <Link className={`${className} transition hover:border-action/35`} href={href} key={application.id}>{content}</Link> : <article className={className} key={application.id}>{content}</article>;
            })}
          </div>
        ) : <EmptyState title={t("noItems")} />}
      </section>

      <section className="grid gap-5">
        <SectionHeader title={t("recentActivity")} />
        {events.length ? (
          <ol className="relative grid gap-0 border-y border-line">
            {events.map((event) => (
              <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-line py-4 last:border-b-0" key={event.id}>
                <span className="mt-1 size-2 rounded-full bg-action" />
                <div><strong className="block text-sm text-ink">{event.label}</strong><span className="text-xs text-ink-muted">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.occurredAt))} · {event.mutations.length} record change{event.mutations.length === 1 ? "" : "s"}</span></div>
              </li>
            ))}
          </ol>
        ) : <EmptyState title="Your completed actions will appear here" body="Complete a workflow to create the first audit event." />}
      </section>
    </Page>
  );
}
