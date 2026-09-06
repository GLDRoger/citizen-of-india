import { DEMO_TODAY } from "@/lib/demo-clock";
import { daysUntil } from "@/lib/format";
import type { CitizenGraph, GraphNode } from "./schema";

type ApplicationNode = Extract<GraphNode, { type: "application" }>;
type ObligationNode = Extract<GraphNode, { type: "obligation" }>;

/**
 * Who is holding the work right now. Every open item in the record is either
 * waiting on the citizen or waiting on an authority. Saying which, since when,
 * and what happens if nobody moves is the difference between a tracker and a
 * record that tells you where you stand.
 */
export interface Ownership {
  holder: "you" | "authority" | "person";
  authority: string;
  /** ISO date the current holder took the item, when the record knows it. */
  since?: string;
  /** Days until the due date; negative when overdue. Only when the citizen holds it. */
  dueInDays?: number;
  /** Plain-language consequence of inaction, straight from the record. */
  consequence?: string;
  /** Whether the authority has given an expected window. */
  expectedWindow?: boolean;
  /** The citizen said the finished procedure did not solve the real problem. */
  unresolved?: boolean;
}

const settled = new Set(["paid", "received", "completed"]);
const citizenHeldStatuses = new Set(["draft", "documents-ready", "appointment-booked"]);

export function getObligationOwnership(node: ObligationNode): Ownership | undefined {
  const status = node.attrs.status ?? "due";
  if (node.attrs.citizenOutcome === "unresolved") {
    return { holder: "you", authority: node.attrs.authority, since: DEMO_TODAY, unresolved: true };
  }
  if (settled.has(status)) return undefined;
  if (node.attrs.direction === "receivable") {
    return { holder: "authority", authority: node.attrs.authority, since: node.attrs.initiatedOn, expectedWindow: true };
  }
  return {
    holder: "you",
    authority: node.attrs.authority,
    since: node.attrs.issuedOn,
    dueInDays: node.attrs.dueDate ? daysUntil(node.attrs.dueDate) : undefined,
    consequence: node.attrs.consequence,
  };
}

export function consentRecipientId(node: ApplicationNode) {
  return node.attrs.participants?.[1] ?? "person:priya";
}

export function needsPartnerConsent(node: ApplicationNode, viewerId: string) {
  return node.attrs.status === "partner-consent-pending" && consentRecipientId(node) === viewerId;
}

export function getApplicationOwnership(graph: CitizenGraph, node: ApplicationNode, viewerId: string): Ownership | undefined {
  const status = node.attrs.status;
  if (node.attrs.citizenOutcome === "unresolved") {
    return { holder: "you", authority: node.attrs.authority, since: DEMO_TODAY, unresolved: true };
  }
  if (settled.has(status)) return undefined;
  if (status === "partner-consent-pending") {
    const recipient = graph.nodes.find((person) => person.id === consentRecipientId(node) && person.type === "person");
    return needsPartnerConsent(node, viewerId)
      ? { holder: "you", authority: node.attrs.authority, since: node.attrs.createdOn }
      : { holder: "person", authority: recipient?.type === "person" ? recipient.attrs.name : node.attrs.authority, since: node.attrs.createdOn };
  }
  if (citizenHeldStatuses.has(status)) {
    return { holder: "you", authority: node.attrs.authority, since: node.attrs.createdOn };
  }
  return { holder: "authority", authority: node.attrs.authority, since: node.attrs.submittedOn ?? node.attrs.createdOn ?? DEMO_TODAY, expectedWindow: false };
}

export function summarizeOwnership(items: Array<Ownership | undefined>) {
  return items.reduce(
    (summary, item) => {
      if (!item) return summary;
      if (item.holder === "you") summary.withYou += 1;
      else if (item.holder === "person") summary.withOthers += 1;
      else summary.withGovernment += 1;
      return summary;
    },
    { withYou: 0, withGovernment: 0, withOthers: 0 },
  );
}
