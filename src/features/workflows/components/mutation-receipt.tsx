"use client";

import Link from "next/link";
import { describeConsequences, getLatestCaseEvent } from "@/features/cases/consequences";
import { caseBriefHref } from "@/features/cases/model";
import { useCitizenStore } from "@/features/graph/store";
import { useAuthStore } from "@/features/auth/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeEventLabel } from "@/i18n/formatters";

export function MutationReceipt({ procedureId, targetId }: { procedureId: string; targetId?: string }) {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const lastEventId = useCitizenStore((state) => state.lastEventId);
  const event = personId && targetId ? getLatestCaseEvent(graph, personId, procedureId, targetId)
    : lastEventId ? graph.events.find((candidate) => candidate.id === lastEventId) : undefined;
  if (!personId || !event || event.actorId !== personId || event.procedureId !== procedureId) return null;
  const lines = describeConsequences(graph, event, language, t);
  if (!lines.length) return null;
  return (
    <aside aria-label={t("effectTitle")} aria-live="polite" className="grid gap-3 border-y border-green-deep/25 bg-green-tint p-5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-green-deep">{t("effectTitle")}</p>
      <h2 className="font-display text-xl font-semibold leading-tight text-ink">{localizeEventLabel(event, language)}</h2>
      <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-ink">{lines.map((line) => <li key={line}>{line}</li>)}</ul>
      {targetId ? <Link className="min-h-11 content-center justify-self-start text-sm font-bold text-indigo-deep underline underline-offset-4" href={caseBriefHref(targetId)}>{t("briefOpen")} →</Link> : null}
    </aside>
  );
}
