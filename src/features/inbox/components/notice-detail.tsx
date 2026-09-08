"use client";
import { useState } from "react";
import { ArrowRight, ChevronDown, MessageSquareText } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip, VerificationBadge } from "@/components/ui/status";
import type { CitizenGraph } from "@/features/graph/schema";
import type { NoticeView } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle, localizeNoticeBody } from "@/i18n/content";
import { formatDate } from "@/lib/format";
import { analyzeNotice } from "../analyze";
import { createFallbackExplanation } from "../fallback";
import type { ExplainResponse } from "../schema";

export function getNoticeAuthority(graph: CitizenGraph, notice: NoticeView) {
  const related = notice.node.attrs.relatedTo
    ? graph.nodes.find((node) => node.id === notice.node.attrs.relatedTo)
    : undefined;
  if (
    related?.type === "application" ||
    related?.type === "benefit" ||
    related?.type === "document" ||
    related?.type === "obligation"
  ) {
    return related.attrs.authority ?? notice.node.verification.source;
  }
  return notice.node.verification.source;
}

function getLinkedRecordTitle(
  graph: CitizenGraph,
  notice: NoticeView,
  language: "en" | "hi" | "kn",
) {
  const relatedId = notice.node.attrs.relatedTo;
  if (!relatedId) return "—";
  const related = graph.nodes.find((node) => node.id === relatedId);
  if (!related) return "—";
  if (related.type === "application" || related.type === "obligation")
    return localizeNodeTitle(language, related.id, related.attrs.title);
  if (related.type === "benefit")
    return localizeNodeTitle(language, related.id, related.attrs.name);
  if (related.type === "employment")
    return `${related.attrs.employer} · ${related.attrs.designation}`;
  if (related.type === "document")
    return localizeNodeTitle(
      language,
      related.id,
      related.attrs.kind.replaceAll("-", " "),
    );
  return localizeNodeTitle(language, related.id, notice.node.attrs.subject);
}

export function NoticeDetail({
  personId,
  notice,
}: {
  personId: string;
  notice: NoticeView;
}) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const [explained, setExplained] = useState(false);
  const analysis = notice.node.attrs.lensText
    ? analyzeNotice(notice.node.attrs.lensText, graph, personId, language)
    : undefined;
  const uncertain = analysis?.match === "unknown";
  const authority =
    uncertain ||
    (notice.node.attrs.lensSavedOn &&
      notice.node.verification.source === "Self")
      ? t("noticeLensSavedByYou")
      : getNoticeAuthority(graph, notice);
  const linkedRecord = uncertain
    ? "—"
    : getLinkedRecordTitle(graph, notice, language);
  const verification = uncertain
    ? {
        ...notice.node.verification,
        source: "Self" as const,
        state: "pending" as const,
        asOf: notice.node.attrs.lensSavedOn ?? notice.node.verification.asOf,
      }
    : notice.node.verification;
  let explanation: ExplainResponse | undefined;
  if (explained) {
    try {
      if (!analysis || analysis.match === "supported")
        explanation = createFallbackExplanation(notice.node.id, language);
    } catch {
      /* A saved unknown message has no invented explanation. */
    }
  }
  const unknown = uncertain || (explained && !explanation);
  const canRespond = !analysis || analysis.match === "supported";
  const explain = () => setExplained(true);

  return (
    <article className="grid gap-6 rounded-[3px] border border-paper-line bg-paper p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <p className="eyebrow">{authority}</p>
          <h3 className="font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-ink">
            {localizeNodeTitle(
              language,
              notice.node.id,
              notice.node.attrs.subject,
            )}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <VerificationBadge verification={verification} />
          <SimulatedChip authority={authority} />
        </div>
      </div>
      <blockquote className="border-y border-paper-line py-5 text-sm leading-7 text-ink-mute">
        {notice.node.attrs.lensText ??
          localizeNoticeBody(language, notice.node.id, notice.node.attrs.body)}
      </blockquote>
      {explanation ? (
        <div className="grid gap-4 rounded-[3px] bg-indigo-tint p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">{t("explain")}</p>
            <SimulatedChip authority={explanation.authority} />
          </div>
          <p className="font-display text-xl font-semibold leading-snug text-ink">
            {explanation.plainLanguage}
          </p>
          <p className="grid gap-1 text-xs leading-5 text-ink-mute">
            <strong className="text-ink">{t("whatItMeans")}</strong>
            {explanation.whatItMeans}
          </p>
          <p className="grid gap-1 text-xs leading-5 text-ink-mute">
            <strong className="text-ink">{t("nextAction")}</strong>
            {explanation.nextAction}
          </p>
        </div>
      ) : unknown ? (
        <div className="rounded-[3px] bg-paper-shade p-5 text-sm leading-6 text-ink-mute">
          {t("noticeLensUnknownBody")}
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        {explanation || unknown ? null : (
          <Button onClick={explain} variant="secondary">
            <MessageSquareText aria-hidden className="size-4" />
            {t("explain")}
          </Button>
        )}
        {canRespond && notice.node.attrs.relatedTo === "obl:echallan-500" ? (
          <LinkButton href="/workflows/obligations">
            {t("respond")}
            <ArrowRight aria-hidden className="size-4" />
          </LinkButton>
        ) : canRespond && notice.node.id === "ntc:epfo-passbook" ? (
          <LinkButton href="/workflows/epfo">
            {t("epfoService")}
            <ArrowRight aria-hidden className="size-4" />
          </LinkButton>
        ) : canRespond && notice.node.id === "ntc:marriage-ripple" ? (
          <LinkButton href="/workflows/marriage">
            {t("view")}
            <ArrowRight aria-hidden className="size-4" />
          </LinkButton>
        ) : null}
      </div>
      <details className="group border-t border-paper-line pt-4">
        <summary className="flex min-h-11 items-center justify-between text-xs font-bold text-ink-mute">
          {t("source")}
          <ChevronDown
            aria-hidden
            className="size-3.5 transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="grid gap-1 pb-2 pt-3 text-xs leading-5 text-ink-mute">
          <span>
            <strong className="text-ink">{t("authority")}:</strong> {authority}
          </span>
          <span>
            <strong className="text-ink">{t("checked")}:</strong>{" "}
            {formatDate(verification.asOf, language)}
          </span>
          <span>
            <strong className="text-ink">{t("linkedRecord")}:</strong>{" "}
            {linkedRecord}
          </span>
        </div>
      </details>
    </article>
  );
}
