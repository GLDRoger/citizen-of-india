import type { CitizenGraph, GraphNode } from "./schema";
import {
  getApplications,
  getDocuments,
  getEligibility,
  getMoneySummary,
  getNotices,
  getObligations,
} from "./selectors";
import { daysUntil } from "@/lib/format";

type BenefitNode = Extract<GraphNode, { type: "benefit" }>;

const MARRIAGE_EDGE = { from: "person:arjun", to: "person:priya" };
const EPF_EMPLOYMENT_ID = "emp:arjun-meridian";

function isMarried(graph: CitizenGraph) {
  return graph.edges.some(
    (edge) =>
      edge.type === "spouseOf" &&
      edge.status === "active" &&
      edge.from === MARRIAGE_EDGE.from &&
      edge.to === MARRIAGE_EDGE.to,
  );
}

function hasEpfNominee(graph: CitizenGraph) {
  return graph.edges.some(
    (edge) => edge.type === "nomineeOf" && edge.status === "active" && edge.to === EPF_EMPLOYMENT_ID,
  );
}

function hasActiveDelegation(graph: CitizenGraph, delegatorId: string) {
  return graph.nodes.some(
    (node) => node.type === "delegation" && node.attrs.delegatorId === delegatorId && node.attrs.status === "active",
  );
}

export interface Nudge {
  id: string;
  kind: "benefit" | "epf-nominee" | "delegation";
  benefit?: BenefitNode;
  href: string;
}

export function getProactiveNudges(graph: CitizenGraph, personId: string): Nudge[] {
  const nudges: Nudge[] = [];
  const applications = getApplications(graph, personId);
  for (const result of getEligibility(graph, personId)) {
    if (result.status !== "eligible") continue;
    if (applications.some((node) => node.attrs.relatedTo === result.benefit.id)) continue;
    nudges.push({ id: `nudge:${result.benefit.id}`, kind: "benefit", benefit: result.benefit, href: "/discover" });
  }
  if (personId === "person:arjun" && isMarried(graph) && !hasEpfNominee(graph)) {
    nudges.push({ id: "nudge:epf-nominee", kind: "epf-nominee", href: "/workflows/marriage" });
  }
  if (personId === "person:sunita" && !hasActiveDelegation(graph, personId)) {
    nudges.push({ id: "nudge:delegation", kind: "delegation", href: "/you" });
  }
  return nudges;
}

export interface GovernmentHealth {
  obligationsDue: number;
  payable: number;
  receivable: number;
  expiringDocuments: number;
  unreadNotices: number;
  recordIssues: number;
  unclaimedBenefits: BenefitNode[];
  attentionCount: number;
}

export function getGovernmentHealth(graph: CitizenGraph, personId: string): GovernmentHealth {
  const actionableObligations = getObligations(graph, personId).filter(
    (node) =>
      node.attrs.direction !== "receivable" &&
      !["paid", "received", "completed"].includes(node.attrs.status ?? "due"),
  );
  const documentsWithActions = new Set(
    actionableObligations
      .map((node) => node.attrs.relatedTo)
      .filter((nodeId): nodeId is string => Boolean(nodeId)),
  );
  const money = getMoneySummary(graph, personId);
  const expiringDocuments = getDocuments(graph, personId).filter((node) => {
    if (!node.attrs.expiresOn || documentsWithActions.has(node.id)) return false;
    const days = daysUntil(node.attrs.expiresOn);
    return days >= 0 && days <= 180;
  }).length;
  const unreadNotices = getNotices(graph, personId).filter((notice) => !notice.read).length;
  const recordIssues = getDocuments(graph, personId).filter((node) =>
    ["mismatch", "expired"].includes(node.verification.state),
  ).length;
  const applications = getApplications(graph, personId);
  const unclaimedBenefits = getEligibility(graph, personId)
    .filter(
      (result) =>
        result.status === "eligible" &&
        !applications.some((node) => node.attrs.relatedTo === result.benefit.id),
    )
    .map((result) => result.benefit);
  return {
    obligationsDue: actionableObligations.length,
    payable: money.payable,
    receivable: money.receivable,
    expiringDocuments,
    unreadNotices,
    recordIssues,
    unclaimedBenefits,
    attentionCount: actionableObligations.length + expiringDocuments + unreadNotices + recordIssues,
  };
}

export interface MarriageRipple {
  married: boolean;
  certificateSaved: boolean;
  nomineeAdded: boolean;
}

export function getMarriageRipple(graph: CitizenGraph): MarriageRipple {
  const married = isMarried(graph);
  const certificateSaved =
    graph.edges.filter(
      (edge) =>
        edge.type === "holds" && edge.status === "active" && edge.to === "doc:arjun-priya-marriage-certificate",
    ).length === 2;
  return {
    married,
    certificateSaved,
    nomineeAdded: hasEpfNominee(graph),
  };
}
