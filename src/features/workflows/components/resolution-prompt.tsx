"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCitizenStore } from "@/features/graph/store";
import { getOutcomeTarget } from "@/features/graph/outcomes";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle } from "@/i18n/content";

/**
 * The department says done. The citizen decides whether the real problem is
 * fixed. "No" keeps the record open with all its context and offers the next
 * route instead of a restart.
 */
export function ResolutionPrompt({ personId, procedureId, targetId }: { personId: string; procedureId: string; targetId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const target = getOutcomeTarget(graph, personId, targetId);
  if (!target) return null;
  const title = localizeNodeTitle(language, target.id, target.attrs.title);
  const outcome = target.attrs.citizenOutcome;

  const answer = (next: "solved" | "unresolved") => {
    commit({
      actorId: personId,
      labelKey: next === "solved" ? "eventOutcomeSolved" : "eventOutcomeUnresolved",
      labelParams: { title: target.attrs.title },
      procedureId,
      mutations: [{ type: "patchAttrs", nodeId: target.id, attrs: { citizenOutcome: next } }],
    });
  };

  if (outcome === "solved") {
    return <aside className="grid gap-3 border-l-4 border-green-deep bg-green-tint px-5 py-4"><strong className="font-display text-lg font-semibold text-green-deep">{t("resolveSolvedTitle")}</strong><span className="text-sm text-ink-mute">{t("resolveSolvedBody")}</span><div><Button onClick={() => answer("unresolved")} variant="secondary">{t("resolveReopen")}</Button></div></aside>;
  }
  if (outcome === "unresolved") {
    const isRedress = target.type === "application" && ["rti-request", "grievance"].includes(target.attrs.kind ?? "");
    const route = "inline-flex min-h-11 items-center gap-1 text-sm font-bold text-indigo-deep underline underline-offset-4";
    return (
      <aside className="grid gap-3 border-l-4 border-brick bg-brick-tint px-5 py-4">
        <div className="grid gap-1"><strong className="font-display text-lg font-semibold text-brick">{t("resolveOpenTitle")}</strong><span className="text-sm leading-6 text-ink-mute">{isRedress ? t("resolveScope", { authority: target.attrs.authority }) : t("resolveRouteBody")}</span></div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {isRedress ? null : <Link className={route} href={`/workflows/grievance?about=${encodeURIComponent(target.id)}`}>{t("resolveRouteGrievance")}<ArrowUpRight aria-hidden className="size-4" /></Link>}
          {isRedress ? null : <Link className={route} href={`/workflows/rti?about=${encodeURIComponent(target.id)}`}>{t("resolveRouteRti")}<ArrowUpRight aria-hidden className="size-4" /></Link>}
          <Link className={route} href="/activity">{t("resolveRouteTimeline")}<ArrowUpRight aria-hidden className="size-4" /></Link>
          <Button onClick={() => answer("solved")} variant="secondary">{t("resolveNow")}</Button>
        </div>
      </aside>
    );
  }
  return (
    <aside className="grid gap-4 border-y-2 border-ink py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="grid gap-1"><strong className="font-display text-2xl font-semibold leading-none text-ink">{t("resolveTitle")}</strong><span className="text-sm text-ink-mute">{t("resolveBody")} <span className="text-ink">{title}</span></span></div>
      <div className="flex flex-wrap gap-2"><Button onClick={() => answer("solved")}>{t("resolveYes")}</Button><Button onClick={() => answer("unresolved")} variant="secondary">{t("resolveNo")}</Button></div>
    </aside>
  );
}
