import type { Language } from "@/i18n/messages";
import { localizeNodeTitle, localizeNoticeBody } from "@/i18n/content";
import { createFallbackExplanation } from "./fallback";
import type { CitizenGraph, GraphNode } from "@/features/graph/schema";
import { getNotices } from "@/features/graph/selectors";
import { createSeedGraph } from "@/features/graph/seed";

export type NoticeAction = "action" | "no-action" | "uncertain";
export interface NoticeAnalysis {
  match: "supported" | "unknown";
  sampleId?: string;
  plainLanguage?: string;
  whatItMeans?: string;
  nextAction?: string;
  authority?: string;
  issuer?: string;
  reference?: string;
  amount?: number;
  deadline?: string;
  consequence?: string;
  relatedRecordId?: string;
  workflowHref?: string;
  action: NoticeAction;
}

const supportedIds = new Set([
  "ntc:echallan",
  "ntc:epfo-passbook",
  "ntc:itr-refund",
]);
const languages: Language[] = ["en", "hi", "kn"];
// The seed and its existing translations own sample facts; no parallel notice fixtures.
export const noticeSamples = createSeedGraph()
  .nodes.filter(
    (node): node is Extract<GraphNode, { type: "notice" }> =>
      node.type === "notice" && supportedIds.has(node.id),
  )
  .map((node) => ({
    id: node.id,
    subject: node.attrs.subject,
    text: Object.fromEntries(
      languages.map((language) => [
        language,
        localizeNoticeBody(language, node.id, node.attrs.body),
      ]),
    ) as Record<Language, string>,
  }));

/** Preserve punctuation, numbers and Indic marks: a different fact is a different message. */
export function normalizeNoticeText(text: string) {
  return text.normalize("NFC").toLowerCase().replace(/\s+/gu, " ").trim();
}

export function getNoticeSamples(
  graph: CitizenGraph,
  personId: string,
  language: Language,
) {
  const owned = new Set(getNotices(graph, personId).map(({ node }) => node.id));
  return noticeSamples
    .filter((sample) => owned.has(sample.id))
    .map((sample) => ({
      ...sample,
      subject: localizeNodeTitle(language, sample.id, sample.subject),
    }));
}

export function analyzeNotice(
  text: string,
  graph: CitizenGraph,
  personId: string,
  language: Language,
): NoticeAnalysis {
  if (text.length > 20_000) return { match: "unknown", action: "uncertain" };
  const normalized = normalizeNoticeText(text);
  const sample = noticeSamples.find((candidate) =>
    languages.some(
      (locale) => normalizeNoticeText(candidate.text[locale]) === normalized,
    ),
  );
  const notice =
    sample &&
    getNotices(graph, personId).find(({ node }) => node.id === sample.id)?.node;
  if (!sample || !notice) return { match: "unknown", action: "uncertain" };
  const explanation = createFallbackExplanation(sample.id, language);
  const related = graph.nodes.find(
    (node) => node.id === notice.attrs.relatedTo,
  );
  const obligation = related?.type === "obligation" ? related : undefined;
  const isChallan = sample.id === "ntc:echallan";
  return {
    match: "supported",
    sampleId: sample.id,
    ...explanation,
    authority: obligation?.attrs.authority ?? notice.verification.source,
    issuer: notice.attrs.sender,
    reference: isChallan
      ? sample.text.en.match(/\b[A-Z]{2,}[A-Z0-9-]*-\d{4}-\d{4,}\b/)?.[0]
      : undefined,
    amount: notice.attrs.amount ?? obligation?.attrs.amount,
    deadline: isChallan ? obligation?.attrs.dueDate : undefined,
    consequence: obligation?.attrs.consequence,
    relatedRecordId: notice.attrs.relatedTo,
    workflowHref: isChallan
      ? "/workflows/obligations"
      : sample.id === "ntc:epfo-passbook"
        ? "/workflows/epfo"
        : "/workflows/refund-track",
    action: isChallan ? "action" : "no-action",
  };
}
