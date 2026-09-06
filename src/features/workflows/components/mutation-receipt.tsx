"use client";

import { ChevronDown } from "lucide-react";
import { describeMutation } from "@/features/graph/describe-mutation";
import { useCitizenStore } from "@/features/graph/store";
import { useAuthStore } from "@/features/auth/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeEventLabel } from "@/i18n/formatters";

export function MutationReceipt({ procedureId }: { procedureId: string }) {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const lastEventId = useCitizenStore((state) => state.lastEventId);
  const event = lastEventId ? graph.events.find((candidate) => candidate.id === lastEventId) : undefined;
  if (!personId || !event || event.actorId !== personId || event.procedureId !== procedureId) return null;

  const details = event.mutations.flatMap((mutation) => describeMutation(mutation, t));

  return (
    <aside aria-live="polite" className="border-y border-green-deep/25 bg-green-tint px-4">
      <details className="group">
        <summary className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
          <span className="status-text">{t("changeRecorded")}</span>
          <strong className="font-display text-sm font-bold leading-5 text-ink">{localizeEventLabel(event, language)}</strong>
          <span className="col-start-2 flex items-center gap-2 text-xs font-semibold tabular-nums text-ink-mute sm:col-start-auto">{details.length === 1 ? t("timelineChangeOne") : t("recordsUpdated", { count: details.length })}<ChevronDown aria-hidden className="size-3.5 transition-transform group-open:rotate-180" /></span>
        </summary>
        <ul className="grid gap-1 border-t border-green-deep/15 py-3 text-xs leading-5 text-ink-mute">
          {details.map((detail, index) => <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-2" key={`${detail}-${index}`}><span aria-hidden="true">·</span><span>{detail}</span></li>)}
        </ul>
      </details>
    </aside>
  );
}
