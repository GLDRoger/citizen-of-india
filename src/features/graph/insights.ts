import type { CitizenGraph, GraphNode } from "./schema";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { getActiveDelegations, LEGACY_DELEGATION_ID, getActiveDelegation as getDelegationFor } from "./delegation";
import {
  getApplications,
  getEligibility,
} from "./selectors";

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

/** The active delegation this person may act under, if any (they are the delegate). */
export { getActiveDelegation as getDelegationFor } from "./delegation";

export interface Nudge {
  id: string;
  kind: "benefit" | "epf-nominee" | "delegation" | "act-for" | "ask-access";
  benefit?: BenefitNode;
  personName?: string;
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
  const guidedAccessActive = getActiveDelegations(graph, "person:arjun", "person:sunita").some((node) => node.id === LEGACY_DELEGATION_ID);
  const guidedRequestPending = graph.nodes.some((node) => node.type === "delegation" && node.id === LEGACY_DELEGATION_ID
    && node.attrs.delegatorId === "person:sunita" && node.attrs.delegateId === "person:arjun"
    && node.attrs.status === "requested" && node.attrs.expiresOn >= DEMO_TODAY);
  if (personId === "person:sunita" && !guidedAccessActive) {
    nudges.push({ id: "nudge:delegation", kind: "delegation", href: "/family#delegation" });
  }
  if (personId === "person:arjun" && !guidedAccessActive && !guidedRequestPending) {
    nudges.push({ id: "nudge:ask-access", kind: "ask-access", href: "/family#delegation" });
  }
  const delegation = getDelegationFor(graph, personId);
  if (delegation) {
    const delegator = graph.nodes.find((node) => node.id === delegation.attrs.delegatorId);
    nudges.push({ id: "nudge:act-for", kind: "act-for", personName: delegator?.type === "person" ? delegator.attrs.name : undefined, href: delegation.id === LEGACY_DELEGATION_ID ? "/family#delegation" : "/family#access" });
  }
  return nudges;
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
