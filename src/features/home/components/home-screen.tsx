"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarClock, FileCheck2, IndianRupee, MoveRight } from "lucide-react";
import { Page, SectionHeader } from "@/components/ui/page";
import { StatusPill, VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getApplicationHref } from "@/features/graph/navigation";
import {
  getApplications,
  getMoneySummary,
  getProfileSummary,
  getThingsToDo,
} from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { IntentComposer } from "@/features/intent/components/intent-composer";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency } from "@/lib/format";

function greetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return "goodMorning" as const;
  if (hour < 17) return "goodAfternoon" as const;
  return "goodEvening" as const;
}

export function HomeScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;
  const profile = getProfileSummary(graph, personId);
  if (!profile) return null;
  const tasks = getThingsToDo(graph, personId);
  const money = getMoneySummary(graph, personId);
  const applications = getApplications(graph, personId).slice(0, 3);

  return (
    <Page className="grid gap-10 sm:gap-12">
      <header className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="grid gap-2">
          <p className="eyebrow">{t(greetingKey())}</p>
          <h1 className="font-display text-[2.8rem] font-semibold leading-[0.9] tracking-[-0.045em] text-ink sm:text-6xl">
            {profile.person.attrs.name.split(" ")[0]}<span className="text-saffron">.</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 border-y border-line py-3 text-xs sm:border-y-0 sm:py-0">
          <div><span className="block text-ink-faint">{profile.residence}</span><strong className="text-ink">{profile.age} years</strong></div>
          <div><span className="block text-ink-faint">{t("documents")}</span><strong className="text-ink">{profile.verifiedDocumentCount}/{profile.documentCount} {t("verified").toLowerCase()}</strong></div>
        </div>
      </header>

      <IntentComposer />

      <section className="grid gap-5">
        <SectionHeader title={t("thingsToDo")} action={<Link className="text-xs font-bold text-action-strong hover:underline" href="/activity">{t("seeAll")}</Link>} />
        {tasks.length ? (
          <div className="divide-y divide-line border-y border-line">
            {tasks.slice(0, 4).map((task, index) => (
              <Link className="group grid min-h-20 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 transition hover:pl-1" href={task.href} key={task.id}>
                <span className="grid size-9 place-items-center rounded-full bg-surface-strong font-display text-xs font-bold text-ink">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0"><strong className="block truncate text-sm text-ink">{task.title}</strong><span className="block truncate text-xs text-ink-muted">{task.meta}</span></span>
                {task.urgent ? <StatusPill label="Soon" tone="warning" /> : <ArrowUpRight aria-hidden className="size-4 text-ink-faint transition group-hover:text-action group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
              </Link>
            ))}
          </div>
        ) : <p className="border-y border-line py-7 text-sm text-ink-muted">{t("noItems")}</p>}
      </section>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden rounded-[24px] bg-action p-6 text-action-ink sm:p-7">
          <IndianRupee aria-hidden className="absolute -bottom-8 -right-6 size-36 text-action-ink/10" strokeWidth={1} />
          <div className="relative grid gap-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-action-ink/70">{t("money")}</p>
            <div className="grid grid-cols-2 gap-6">
              <div><span className="block text-xs text-action-ink/65">{t("due")}</span><strong className="font-display text-3xl font-semibold tracking-tight">{formatCurrency(money.payable)}</strong></div>
              <div><span className="block text-xs text-action-ink/65">{t("comingToYou")}</span><strong className="font-display text-3xl font-semibold tracking-tight">{formatCurrency(money.receivable)}</strong></div>
            </div>
            <Link className="flex min-h-11 items-center justify-between border-t border-action-ink/20 pt-3 text-sm font-bold" href="/activity">{t("view")} <MoveRight aria-hidden className="size-4" /></Link>
          </div>
        </section>

        <section className="grid content-start gap-5">
          <SectionHeader title={t("pendingApplications")} />
          <div className="grid gap-2">
            {applications.length ? applications.map((application) => (
              <Link className="flex min-h-20 items-center gap-4 rounded-[18px] border border-line bg-surface px-4 transition hover:border-action/35" href={getApplicationHref(application) ?? "/activity"} key={application.id}>
                <span className="grid size-10 place-items-center rounded-full bg-surface-strong text-action"><CalendarClock aria-hidden className="size-5" /></span>
                <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-ink">{application.attrs.title}</strong><span className="text-xs capitalize text-ink-muted">{application.attrs.status.replaceAll("-", " ")}</span></span>
                <VerificationBadge verification={application.verification} />
              </Link>
            )) : (
              <div className="flex min-h-24 items-center gap-3 border-y border-line py-4 text-sm text-ink-muted"><FileCheck2 aria-hidden className="size-5 text-success" />{t("noItems")}</div>
            )}
          </div>
        </section>
      </div>
    </Page>
  );
}
