"use client";

import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeEventLabel } from "@/i18n/formatters";

const deathRegistrationDetails = [
  "mutationRajeshDeceased",
  "mutationPensionEnded",
  "mutationSunitaWidowed",
] as const;

export function MutationReceipt({ procedureId }: { procedureId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const lastEventId = useCitizenStore((state) => state.lastEventId);
  const event = lastEventId ? graph.events.find((candidate) => candidate.id === lastEventId) : undefined;
  if (!event || event.procedureId !== procedureId) return null;

  const details = event.labelKey === "eventDeathRegistered"
    ? deathRegistrationDetails.map((key) => t(key))
    : [localizeEventLabel(event, language)];
  const count = event.labelKey === "eventDeathRegistered" ? details.length : event.mutations.length;

  return (
    <aside aria-live="polite" className="grid gap-3 border-y border-green-deep/25 bg-green-tint px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
      <span className="status-text mt-0.5">{t("changeRecorded")}</span>
      <div className="grid gap-2">
        <strong className="font-display text-lg font-bold text-ink">{t("recordsUpdated", { count })}</strong>
        <p className="text-xs leading-5 text-ink-mute">{details.join(" · ")}</p>
      </div>
    </aside>
  );
}
