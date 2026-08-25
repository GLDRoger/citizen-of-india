"use client";

import { Check, CircleHelp, FileWarning, MoveRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Page, PageHeader } from "@/components/ui/page";
import { SimulatedChip, StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getEligibility, type EligibilityResult } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle, localizeRuleExplanation } from "@/i18n/content";
import { localizeEvidence } from "@/i18n/formatters";

function tone(status: EligibilityResult["status"]) {
  if (status === "eligible") return "success" as const;
  if (status === "potentially-eligible") return "warning" as const;
  return "neutral" as const;
}

function EligibilityCard({ result, personId }: { result: EligibilityResult; personId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const appId = `app:${result.benefit.id.slice(4)}:${personId.slice(7)}`;
  const existing = graph.nodes.find(
    (node) =>
      node.type === "application" &&
      node.attrs.relatedTo === result.benefit.id &&
      node.attrs.participants?.includes(personId) === true,
  );
  const statusLabel = result.status === "eligible" ? t("eligible") : result.status === "potentially-eligible" ? t("potentiallyEligible") : t("notEligible");

  const apply = () => {
    if (existing || result.status === "not-eligible") return;
    const mutations: GraphMutation[] = [
      {
        type: "addNode",
        node: {
          id: appId,
          type: "application",
          attrs: {
            title: `Application for ${result.benefit.attrs.name}`,
            authority: result.benefit.attrs.authority,
            status: "draft",
            createdOn: "2026-08-24",
            relatedTo: result.benefit.id,
            kind: "benefit",
            participants: [personId],
          },
          verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" },
        },
      },
      {
        type: "addEdge",
        edge: {
          id: `e:${personId.slice(7)}-subject-${result.benefit.id.slice(4)}-application`,
          type: "subjectOf",
          from: personId,
          to: appId,
          attrs: {},
          validFrom: "2026-08-24",
          status: "active",
          verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" },
        },
      },
    ];
    commit({ actorId: personId, labelKey: "eventBenefitApplicationStarted", labelParams: { benefitId: result.benefit.id }, mutations });
  };

  return (
    <article className="grid min-h-[330px] content-between gap-7 rounded-[8px] border border-paper-line bg-paper-shade p-5 sm:p-6">
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><StatusPill label={statusLabel} tone={tone(result.status)} /><SimulatedChip authority={result.benefit.attrs.authority} /></div>
        <div className="grid gap-2"><p className="eyebrow">{result.benefit.attrs.authority}</p><h2 className="font-display text-2xl font-semibold leading-tight tracking-[-0.025em] text-ink">{localizeNodeTitle(language, result.benefit.id, result.benefit.attrs.name)}</h2><p className="text-sm font-bold text-green-deep">{result.benefit.attrs.valuePerYear}</p></div>
        {result.passedReasons.length ? <ul className="grid gap-2">{result.passedReasons.slice(0, 3).map((reason) => <li className="flex gap-2 text-xs leading-5 text-ink-mute" key={reason}><Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-green-deep" />{localizeRuleExplanation(language, reason)}</li>)}</ul> : null}
        {result.failedReasons.length ? <ul className="grid gap-2">{result.failedReasons.slice(0, 2).map((reason) => <li className="flex gap-2 text-xs leading-5 text-ink-mute" key={reason}><CircleHelp aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ink-mute" />{localizeRuleExplanation(language, reason)}</li>)}</ul> : null}
        {result.missingEvidence.length ? <div className="grid gap-2 rounded-[8px] bg-brick-tint p-3"><p className="flex items-center gap-2 text-xs font-bold text-brick"><FileWarning aria-hidden className="size-3.5" />{t("missingEvidence")}</p>{result.missingEvidence.map((evidence) => <span className="text-xs text-brick" key={evidence}>{localizeEvidence(language, evidence)}</span>)}</div> : null}
      </div>
      <Button disabled={Boolean(existing) || result.status === "not-eligible"} onClick={apply} variant={result.status === "eligible" ? "primary" : "secondary"}>
        {existing ? t("pending") : t("apply")} <MoveRight aria-hidden className="size-4" />
      </Button>
    </article>
  );
}

export function DiscoverScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;
  const results = getEligibility(graph, personId);

  return (
    <Page className="grid gap-8">
      <PageHeader eyebrow={t("discover")} title={t("eligibility")} description={t("eligibilityRechecks")} action={<div className="flex items-center gap-2 text-xs font-bold text-green-deep"><Sparkles aria-hidden className="size-4" /> Continuous eligibility</div>} />
      {results.length ? <div className="grid gap-4 md:grid-cols-2">{results.map((result) => <EligibilityCard key={result.benefit.id} personId={personId} result={result} />)}</div> : <EmptyState title="No linked schemes yet" body="Citizen will show benefits here as your connected records change." />}
    </Page>
  );
}
