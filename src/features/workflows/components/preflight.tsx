"use client";

import { Check, Minus } from "lucide-react";
import { useCitizenStore } from "@/features/graph/store";
import { getPreflight, summarizeReadiness, type CheckState, type Dependency, type ReadinessCheck } from "@/features/workflows/lib/readiness";
import { useI18n } from "@/i18n/use-i18n";
import { formatDate } from "@/lib/format";

const stateKeys = { ready: "stateReady", missing: "stateMissing", mismatch: "stateMismatch", blocked: "stateBlocked", unknown: "stateUnknown" } as const;
const stateTone: Record<CheckState, string> = { ready: "text-green-deep", missing: "text-brick", mismatch: "text-brick", blocked: "text-brick", unknown: "text-ink-mute" };

function CheckRow({ check }: { check: ReadinessCheck }) {
  const { language, t } = useI18n();
  const ok = check.state === "ready";
  return (
    <li className="grid grid-cols-[1.4rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-paper-line py-2.5 last:border-b-0">
      <span aria-hidden className={`grid size-5 place-items-center rounded-full ${ok ? "bg-green-deep text-paper" : "border-2 border-current " + stateTone[check.state]}`}>{ok ? <Check className="size-3" strokeWidth={3} /> : <Minus className="size-3" strokeWidth={3} />}</span>
      <span className="grid gap-0.5">
        <span className={`text-sm font-semibold leading-5 ${ok ? "text-ink" : "text-ink"}`}>{t(check.labelKey, check.labelParams)}</span>
        {check.verification ? <span className="text-xs text-ink-mute">{t("preflightSource", { source: check.verification.source, date: formatDate(check.verification.asOf, language) })}</span> : null}
      </span>
      <span className={`text-xs font-extrabold uppercase tracking-[0.1em] ${stateTone[check.state]}`}>{t(stateKeys[check.state])}</span>
    </li>
  );
}

function DependencyList({ items, title }: { items: Dependency[]; title: string }) {
  const { t } = useI18n();
  if (!items.length) return null;
  return (
    <div className="grid content-start gap-2">
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-saffron">{title}</p>
      <ul className="grid gap-1.5">
        {items.map((item) => (
          <li className="flex items-baseline gap-2 text-sm leading-5" key={item.labelKey}>
            <span aria-hidden className={`mt-1.5 size-2 shrink-0 rounded-full ${item.done ? "bg-green-deep" : "border border-ink/40"}`} />
            <span className={item.done ? "text-ink-mute line-through decoration-ink/30" : "text-ink"}>{t(item.labelKey)}</span>
            {item.done ? <span className="text-xs font-bold text-green-deep">{t("preflightDone")}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One diagnosis before any simulated submission: how much of what this step
 * needs is already on the record, what is missing, what has to happen first,
 * what becomes possible afterwards, and how long the authority usually takes.
 */
export function Preflight({ personId, procedureId }: { personId: string; procedureId: string }) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const preflight = getPreflight(graph, personId, procedureId);
  if (!preflight) return null;
  const { readyCount, total, missing } = summarizeReadiness(preflight);
  const summary = missing.length === 0 ? t("preflightAllReady") : missing.length === 1 ? t("preflightOneMissing") : t("preflightSomeMissing", { count: missing.length });

  return (
    <details className="group rounded-[3px] border border-paper-line bg-paper open:bg-paper-shade/60" open={missing.length > 0}>
      <summary className="grid min-h-16 cursor-pointer list-none gap-3 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4 [&::-webkit-details-marker]:hidden">
        <span className="grid gap-1">
          <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-indigo-deep">{t("preflightTitle")}</span>
          <span className="font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">{t("preflightReady", { ready: readyCount, total })}<span className="text-ink-mute"> · </span><span className={missing.length ? "text-brick" : "text-green-deep"}>{summary}</span></span>
        </span>
        <span aria-hidden className="relative h-2 w-full overflow-hidden rounded-full bg-paper-line sm:w-40"><span className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ${missing.length ? "bg-saffron" : "bg-green-deep"}`} style={{ width: `${Math.round((readyCount / Math.max(total, 1)) * 100)}%` }} /></span>
      </summary>
      <div className="grid gap-6 border-t border-paper-line px-5 py-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(14rem,0.7fr)] lg:gap-10">
        <ul className="grid">{preflight.checks.map((check) => <CheckRow check={check} key={check.id} />)}</ul>
        <div className="grid content-start gap-5">
          <DependencyList items={preflight.needsFirst} title={t("preflightNeedsFirst")} />
          <DependencyList items={preflight.unlocks} title={t("preflightUnlocks")} />
          <p className="grid gap-0.5 border-t border-paper-line pt-3 text-xs leading-5 text-ink-mute"><strong className="text-ink">{t("preflightEstimate", { days: preflight.estimatedDays, authority: preflight.authority })}</strong><span>{t("preflightEstimateNote")}</span></p>
        </div>
      </div>
    </details>
  );
}
