"use client";

import Link from "next/link";
import type { Ownership } from "@/features/graph/ownership";
import { useI18n } from "@/i18n/use-i18n";
import { formatDate } from "@/lib/format";

/**
 * "Where things stand": the one line a portal never tells you. How many open
 * items are waiting on you, how many are sitting with an authority, and how
 * many notices you have not read yet. Numbers link to the ledgers below.
 */
export function HomeStand({ unread, withGovernment, withYou, withOthers }: { unread: number; withGovernment: number; withYou: number; withOthers: number }) {
  const { t } = useI18n();
  const figures = [
    { href: "/home#attention", label: t("standWithYou"), tone: withYou > 0 ? "text-brick" : "text-ink", value: withYou },
    { href: "/home#attention", label: t("standWithGovernment"), tone: "text-indigo-deep", value: withGovernment },
    ...(withOthers > 0 ? [{ href: "/home#attention", label: t("ownWithOthers"), tone: "text-indigo-deep", value: withOthers }] : []),
    { href: "/home#records", label: t("standUnread"), tone: unread > 0 ? "text-indigo-deep" : "text-ink", value: unread },
  ];
  return (
    <section className="grid gap-4 border-l-4 border-saffron py-2 pl-5 sm:pl-7 lg:grid-cols-[13rem_minmax(0,1fr)_auto] lg:items-center lg:gap-8">
      <div className="grid gap-1">
        <p className="eyebrow text-indigo-deep">{t("standTitle")}</p>
        {withYou === 0 ? <p className="text-sm text-ink-mute">{t("standAllClear")}</p> : null}
      </div>
      <dl className={`grid gap-y-4 divide-x divide-paper-line ${withOthers > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
        {figures.map((figure) => (
          <div className="grid min-w-0 content-start gap-1 px-4 first:pl-0 last:pr-0" key={figure.label}>
            <dd className={`font-display text-5xl font-bold leading-none tabular-nums sm:text-6xl lg:text-7xl ${figure.tone}`}><Link href={figure.href}>{figure.value}</Link></dd>
            <dt className="text-xs font-bold leading-4 text-ink-mute">{figure.label}</dt>
          </div>
        ))}
      </dl>
      <Link className="min-h-11 w-fit content-center text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href="/activity">{t("standSeeTimeline")}</Link>
    </section>
  );
}

/** One-line holder statement under a task row: who has it, since when, and the cost of doing nothing. */
export function OwnershipLine({ dark = false, language, ownership }: { dark?: boolean; language: "en" | "hi" | "kn"; ownership: Ownership }) {
  const { t } = useI18n();
  const holder = ownership.unresolved
    ? t("ownPersonalFollowUp")
    : ownership.holder === "you"
    ? t("ownWithYou")
    : ownership.holder === "person"
      ? t("ownWaitingOn", { name: ownership.authority })
      : t("ownWithAuthority", { authority: ownership.authority });
  const timing = ownership.dueInDays !== undefined
    ? ownership.dueInDays < 0
      ? t("ownOverdue", { count: Math.abs(ownership.dueInDays) })
      : ownership.dueInDays === 0
        ? t("ownDueToday")
        : t("ownDueIn", { count: ownership.dueInDays })
    : ownership.since
      ? t("ownSince", { date: formatDate(ownership.since, language) })
      : undefined;
  return (
    <span className={`grid gap-0.5 text-xs leading-4 ${dark ? "text-paper/70" : "text-ink-mute"}`}>
      <span><strong className={dark ? (ownership.holder === "you" ? "text-saffron" : "text-paper") : ownership.holder === "you" ? "text-brick" : "text-indigo-deep"}>{holder}</strong>{timing ? ` · ${timing}` : ""}</span>
      {ownership.unresolved ? <span>{t("ownUnresolvedConsequence")}</span> : ownership.consequence ? <span>{t("ownIfNothing", { consequence: ownership.consequence })}</span> : null}
    </span>
  );
}
