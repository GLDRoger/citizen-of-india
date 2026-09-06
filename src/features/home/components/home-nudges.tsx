"use client";

import Link from "next/link";
import { FilePanel } from "@/components/ui/file-panel";
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
        : nudge.kind === "act-for"
          ? t("nudgeActForTitle", { name: nudge.personName?.split(" ")[0] ?? "" })
          : nudge.kind === "ask-access"
            ? t("nudgeAskAccessTitle")
            : t("nudgeDelegationTitle");
  const body =
    nudge.kind === "benefit" && nudge.benefit
      ? nudge.benefit.attrs.valuePerYear
      : nudge.kind === "epf-nominee"
        ? t("nudgeEpfNomineeBody")
        : nudge.kind === "act-for"
          ? t("nudgeActForBody", { name: nudge.personName?.split(" ")[0] ?? "" })
          : nudge.kind === "ask-access"
            ? t("nudgeAskAccessBody")
            : t("nudgeDelegationBody");
  return (
    <Link
      className="group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-paper-line py-3 last:border-b-0"
      href={nudge.href}
    >
      <div className="min-w-0">
        <strong className="block font-display text-base font-semibold leading-5 text-ink">{title}</strong>
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
    <FilePanel aside={<Sparkles aria-hidden className="mb-0.5 size-3.5 text-saffron" />} label={t("nudgesTitle")}>
      {nudges.map((nudge) => (
        <NudgeRow key={nudge.id} nudge={nudge} />
      ))}
    </FilePanel>
  );
}
