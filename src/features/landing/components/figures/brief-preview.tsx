"use client";

import Link from "next/link";
import { arjunFile, arjunStand, arjunTasks } from "@/features/graph/seed-facts";
import { useI18n } from "@/i18n/use-i18n";
import { getInitials } from "@/lib/format";

/**
 * A phone-sized rendering of what Home shows Arjun: where things stand and the
 * first tasks, computed from the same seed the app runs on. Not a screenshot,
 * so it never goes stale.
 */
export function BriefPreview() {
  const { t } = useI18n();
  const figures = [
    { label: t("standWithYou"), tone: arjunStand.withYou > 0 ? "text-brick" : "text-ink", value: arjunStand.withYou },
    { label: t("standWithGovernment"), tone: "text-indigo-deep", value: arjunStand.withGovernment },
    { label: t("standUnread"), tone: "text-indigo-deep", value: arjunStand.unread },
  ];
  return (
    <figure className="m-0 grid justify-items-center gap-4">
      <Link aria-label={t("landingStart")} className="block w-full max-w-[19rem] rounded-[1.6rem] border border-ink/15 bg-ink p-2 shadow-[0_1.4rem_3rem_-1rem_rgba(5,12,47,0.45)] transition-transform hover:-translate-y-1" href="/start">
        <div className="grid gap-4 rounded-[1.2rem] bg-paper px-4 pb-5 pt-4 text-ink">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-indigo-deep">
              <span className="grid size-6 place-items-center rounded-[3px] bg-indigo-deep font-display text-[0.6rem] text-paper">{getInitials(arjunFile.name)}</span>
              {arjunFile.name}
            </span>
            <span className="stamp stamp--simulated text-[0.5rem]">{t("simulated")}</span>
          </div>
          <div className="grid gap-2 border-y border-paper-line py-3">
            <p className="text-[0.65rem] font-bold text-indigo-deep">{t("standTitle")}</p>
            <dl className="grid grid-cols-3 divide-x divide-paper-line">
              {figures.map((figure) => (
                <div className="grid min-w-0 gap-0.5 px-2 first:pl-0 last:pr-0" key={figure.label}>
                  <dd className={`font-display text-3xl font-bold leading-none tabular-nums ${figure.tone}`}>{figure.value}</dd>
                  <dt className="text-[0.6rem] font-bold leading-3 text-ink-mute">{figure.label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <ul className="grid divide-y divide-paper-line">
            {arjunTasks.map((task) => (
              <li className="grid gap-0.5 py-2 first:pt-0 last:pb-0" key={task.id}>
                <span className="text-[0.8rem] font-bold leading-4">{task.titleKey ? t(task.titleKey, { kind: task.documentKind?.toUpperCase() ?? "" }) : task.title}</span>
                <span className={`text-[0.62rem] font-bold ${task.urgent ? "text-brick" : "text-ink-mute"}`}>{task.metaKey ? t(task.metaKey) : task.meta}</span>
              </li>
            ))}
          </ul>
        </div>
      </Link>
      <figcaption className="max-w-[19rem] text-center text-xs leading-5 text-ink-mute">{t("landingBriefCaption")}</figcaption>
    </figure>
  );
}
