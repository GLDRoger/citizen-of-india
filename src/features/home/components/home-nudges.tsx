"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getProactiveNudges, type Nudge } from "@/features/graph/insights";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle } from "@/i18n/content";

function NudgeRow({ nudge }: { nudge: Nudge }) {
  const { language, t } = useI18n();
  const title =
    nudge.kind === "benefit" && nudge.benefit
      ? t("nudgeBenefitTitle", { benefit: localizeNodeTitle(language, nudge.benefit.id, nudge.benefit.attrs.name) })
      : nudge.kind === "epf-nominee"
        ? t("nudgeEpfNomineeTitle")
        : t("nudgeDelegationTitle");
  const body =
    nudge.kind === "benefit" && nudge.benefit
      ? nudge.benefit.attrs.valuePerYear
      : nudge.kind === "epf-nominee"
        ? t("nudgeEpfNomineeBody")
        : t("nudgeDelegationBody");
  return (
    <Link
      className="group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-paper-line py-3 last:border-b-0"
      href={nudge.href}
    >
      <div className="min-w-0">
        <strong className="block text-sm font-medium leading-5 text-ink">{title}</strong>
        <span className="text-xs leading-5 text-ink-mute">{body}</span>
      </div>
      <ArrowRight aria-hidden className="size-4 text-indigo-deep transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function HomeNudges({ personId }: { personId: string }) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const nudges = getProactiveNudges(graph, personId);
  if (nudges.length === 0) return null;
  return (
    <section className="rounded-[8px] border border-paper-line bg-paper-shade px-5 py-3">
      <p className="eyebrow flex items-center gap-2 py-3 text-indigo-deep">
        <Sparkles aria-hidden className="size-3.5" />
        {t("nudgesTitle")}
      </p>
      {nudges.map((nudge) => (
        <NudgeRow key={nudge.id} nudge={nudge} />
      ))}
    </section>
  );
}
