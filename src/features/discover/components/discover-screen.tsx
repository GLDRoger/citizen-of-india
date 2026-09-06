"use client";

import { Check, CircleHelp, FileWarning, MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { ContrastLine, Page, PageHeader, SectionHeader } from "@/components/ui/page";
import { SimulatedChip, StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getApplications, getBenefitCatalogue, type EligibilityResult } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { isBenefitVisibleInDemo } from "@/features/services/availability";
import { getApplicationHref } from "@/features/graph/navigation";
import { useI18n } from "@/i18n/use-i18n";
import { localizeBenefitAudience, localizeNodeTitle, localizeRuleExplanation } from "@/i18n/content";
import { localizeEvidence } from "@/i18n/formatters";

function tone(status: EligibilityResult["status"]) {
  if (status === "eligible") return "success" as const;
  if (status === "potentially-eligible") return "warning" as const;
  return "neutral" as const;
}

function EligibilityCard({ result, personId }: { result: EligibilityResult; personId: string }) {
  const { language, t } = useI18n();
  const router = useRouter();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const appId = `app:${result.benefit.id.slice(4)}:${personId.slice(7)}`;
  const existing = getApplications(graph, personId).find(
    (node) =>
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
            title: result.benefit.attrs.name,
            authority: result.benefit.attrs.authority,
            status: "draft",
            createdOn: "2026-08-28",
            relatedTo: result.benefit.id,
            kind: "benefit",
            participants: [personId],
          },
          verification: { source: "Self", state: "self-declared", asOf: "2026-08-28" },
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
          validFrom: "2026-08-28",
          status: "active",
          verification: { source: "Self", state: "self-declared", asOf: "2026-08-28" },
        },
      },
    ];
    commit({ actorId: personId, labelKey: "eventBenefitApplicationStarted", labelParams: { benefitId: result.benefit.id, benefitName: result.benefit.attrs.name }, mutations });
    router.push(`/workflows/benefit-application?application=${encodeURIComponent(appId)}`);
  };

  return (
    <article className="grid min-h-[290px] content-between gap-6 rounded-[3px] border border-paper-line bg-panel p-5 sm:p-6">
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><StatusPill label={statusLabel} tone={tone(result.status)} /><SimulatedChip authority={result.benefit.attrs.authority} /></div>
        <div className="grid gap-2"><p className="eyebrow">{result.benefit.attrs.authority}</p><h2 className="font-display text-2xl font-semibold leading-tight tracking-[-0.025em] text-ink">{localizeNodeTitle(language, result.benefit.id, result.benefit.attrs.name)}</h2><p className="text-sm font-bold text-green-deep">{result.benefit.attrs.valuePerYear}</p></div>
        {result.benefit.id === "ben:eps-family-pension" ? <ContrastLine>{t("contrastFamilyPension")}</ContrastLine> : null}
        {result.passedReasons.length ? <ul className="grid gap-2">{result.passedReasons.slice(0, 3).map((reason) => <li className="flex gap-2 text-xs leading-5 text-ink-mute" key={reason}><Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-green-deep" />{localizeRuleExplanation(language, reason)}</li>)}</ul> : null}
        {result.failedReasons.length ? <ul className="grid gap-2">{result.failedReasons.slice(0, 2).map((reason) => <li className="flex gap-2 text-xs leading-5 text-ink-mute" key={reason}><CircleHelp aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ink-mute" />{localizeRuleExplanation(language, reason)}</li>)}</ul> : null}
        {result.missingEvidence.length ? <div className="grid gap-2 rounded-[3px] bg-brick-tint p-3"><p className="flex items-center gap-2 text-xs font-bold text-brick"><FileWarning aria-hidden className="size-3.5" />{t("missingEvidence")}</p>{result.missingEvidence.map((evidence) => <span className="text-xs text-brick" key={evidence}>{localizeEvidence(language, evidence)}</span>)}</div> : null}
      </div>
      {result.benefit.id === "ben:mudra-kishor" ? <LinkButton href="/workflows/loan" variant="secondary">{t("loanService")} <MoveRight aria-hidden className="size-4" /></LinkButton> : existing ? <LinkButton href={getApplicationHref(existing) ?? "/discover"}>{existing.attrs.status === "submitted" ? t("view") : t("continueDraft")} <MoveRight aria-hidden className="size-4" /></LinkButton> : <Button disabled={result.status === "not-eligible"} onClick={apply} variant={result.status === "eligible" ? "primary" : "secondary"}>{t("apply")} <MoveRight aria-hidden className="size-4" /></Button>}
    </article>
  );
}

function OtherSchemeCard({ result }: { result: EligibilityResult }) {
  const { language, t } = useI18n();
  const audience = result.benefit.attrs.audience;
  return (
    <article className="grid content-start gap-3 rounded-[3px] border border-paper-line bg-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><StatusPill label={t("notEligible")} tone="neutral" /><SimulatedChip authority={result.benefit.attrs.authority} /></div>
      <div className="grid gap-1"><p className="eyebrow">{result.benefit.attrs.authority}</p><h3 className="font-display text-xl font-semibold leading-tight tracking-[-0.02em] text-ink">{localizeNodeTitle(language, result.benefit.id, result.benefit.attrs.name)}</h3><p className="text-sm font-bold text-green-deep">{result.benefit.attrs.valuePerYear}</p></div>
      {audience ? <p className="text-sm leading-6 text-ink-mute"><span className="font-bold text-ink">{t("benefitsWhoFor")}:</span> {localizeBenefitAudience(language, result.benefit.id, audience)}</p> : null}
    </article>
  );
}

export function DiscoverScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;
  const catalogue = getBenefitCatalogue(graph, personId).filter((result) => isBenefitVisibleInDemo(result.benefit.id));
  const forYou = catalogue.filter((result) => result.status !== "not-eligible");
  const others = catalogue.filter((result) => result.status === "not-eligible");

  return (
    <Page className="grid gap-10">
      <PageHeader backdrop="gateway-of-india" title={t("eligibility")} description={t("eligibilityRechecks")} />
      {forYou.length ? <section className="grid gap-5"><SectionHeader eyebrow={`${forYou.length}`} title={t("benefitsForYou")} /><div className="grid gap-4 md:grid-cols-2">{forYou.map((result) => <EligibilityCard key={result.benefit.id} personId={personId} result={result} />)}</div></section> : <EmptyState title={t("noLinkedSchemes")} body={t("noLinkedSchemesBody")} />}
      {others.length ? <section className="grid gap-5"><div className="grid gap-1"><SectionHeader eyebrow={`${others.length}`} title={t("benefitsOthersTitle")} /><p className="max-w-2xl text-sm leading-6 text-ink-mute">{t("benefitsOthersBody")}</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{others.map((result) => <OtherSchemeCard key={result.benefit.id} result={result} />)}</div></section> : null}
    </Page>
  );
}
