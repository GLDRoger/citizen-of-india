import { describeEventTargets, describeMutation } from "@/features/graph/describe-mutation";
import type { CitizenGraph, GraphEvent } from "@/features/graph/schema";
import { localizeNodeTitle } from "@/i18n/content";
import { getStatusMessageKey } from "@/i18n/formatters";
import type { Language, MessageKey } from "@/i18n/messages";

type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

/** Exact effects of the recorded transaction, not a canned success story or a guessed latest task. */
export function describeConsequences(graph: CitizenGraph, event: GraphEvent, language: Language, t: Translate) {
  const lines: string[] = [];
  for (const mutation of event.mutations) {
    if (mutation.type === "addNode" && mutation.node.type === "application") {
      lines.push(t("effectApplication", { title: localizeNodeTitle(language, mutation.node.id, mutation.node.attrs.title) }));
      const relatedId = mutation.node.attrs.relatedTo;
      const related = graph.nodes.find((node) => node.id === relatedId);
      if (related && (related.type === "application" || related.type === "obligation")) {
        lines.push(t("effectLinked", { title: localizeNodeTitle(language, related.id, related.attrs.title) }));
      }
    } else if (mutation.type === "patchAttrs") {
      const node = graph.nodes.find((candidate) => candidate.id === mutation.nodeId);
      if (!node) continue;
      const title = "title" in node.attrs ? localizeNodeTitle(language, node.id, node.attrs.title) : node.type === "document" ? node.attrs.kind.toUpperCase() : t("citizenRecord");
      if ("citizenOutcome" in mutation.attrs && mutation.attrs.citizenOutcome) {
        lines.push(t(mutation.attrs.citizenOutcome === "unresolved" ? "effectUnresolved" : "effectSolved", { title }));
      } else if ("status" in mutation.attrs && typeof mutation.attrs.status === "string") {
        const statusKey = getStatusMessageKey(mutation.attrs.status);
        lines.push(t("effectStatus", { title, status: statusKey ? t(statusKey) : mutation.attrs.status }));
      } else if (mutation.verification?.state === "pending" && node.type === "document") {
        lines.push(t("effectPending", { title }));
      } else {
        lines.push(...describeMutation(mutation, t));
      }
    } else if (mutation.type !== "addEdge" || !["holds", "subjectOf"].includes(mutation.edge.type)) {
      lines.push(...describeMutation(mutation, t));
    }
  }
  return [...new Set(lines)];
}

export function getLatestCaseEvent(graph: CitizenGraph, personId: string, procedureId: string, targetId: string) {
  return [...graph.events].reverse().find((event) => event.actorId === personId && event.procedureId === procedureId
    && describeEventTargets(event).includes(targetId));
}
