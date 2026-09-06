import { DEMO_TODAY } from "@/lib/demo-clock";
import type { CitizenGraph, GraphMutation, GraphNode } from "./schema";

type Delegation = Extract<GraphNode, { type: "delegation" }>;

/** Both the permission and its relationship must still be active. */
export function getActiveDelegation(graph: CitizenGraph, delegateId: string, subjectId?: string): Delegation | undefined {
  return graph.nodes.find((node): node is Delegation => node.type === "delegation"
    && node.attrs.delegateId === delegateId
    && (!subjectId || node.attrs.delegatorId === subjectId)
    && node.attrs.status === "active"
    && node.attrs.expiresOn >= DEMO_TODAY
    && graph.edges.some((edge) => edge.type === "delegateOf"
      && edge.from === delegateId && edge.to === node.attrs.delegatorId
      && edge.status === "active" && !edge.validTo && edge.validFrom.slice(0, 10) <= DEMO_TODAY
      && typeof edge.attrs.expiresOn === "string" && edge.attrs.expiresOn >= DEMO_TODAY));
}

export function delegatedScopes(graph: CitizenGraph, delegateId: string, subjectId: string) {
  const delegation = getActiveDelegation(graph, delegateId, subjectId);
  if (!delegation) return [];
  const edge = graph.edges.find((candidate) => candidate.type === "delegateOf" && candidate.status === "active"
    && !candidate.validTo && candidate.from === delegateId && candidate.to === subjectId
    && candidate.validFrom.slice(0, 10) <= DEMO_TODAY
    && typeof candidate.attrs.expiresOn === "string" && candidate.attrs.expiresOn >= DEMO_TODAY);
  const scopes = edge?.type === "delegateOf" ? edge.attrs.scopes : [];
  return delegation.attrs.scopes.filter((scope) => scopes.includes(scope));
}

/** Only document caching is a delegated write in this prototype. No applications, payments or consent. */
export function canCommitDelegated(graph: CitizenGraph, actorId: string, subjectId: string, mutations: GraphMutation[]) {
  if (!delegatedScopes(graph, actorId, subjectId).includes("documents") || mutations.length === 0) return false;
  return mutations.every((mutation) => mutation.type === "patchAttrs"
    && !mutation.verification
    && Object.keys(mutation.attrs).length === 1 && "downloaded" in mutation.attrs && mutation.attrs.downloaded === true
    && graph.nodes.some((node) => node.id === mutation.nodeId && node.type === "document")
    && graph.edges.some((edge) => edge.type === "holds" && edge.status === "active"
      && !edge.validTo && edge.from === subjectId && edge.to === mutation.nodeId));
}
