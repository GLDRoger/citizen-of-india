import { DEMO_TODAY } from "@/lib/demo-clock";
import type {
  CitizenGraph,
  GraphEdge,
  GraphMutation,
  GraphNode,
} from "./schema";

export type Delegation = Extract<GraphNode, { type: "delegation" }>;
export const LEGACY_DELEGATION_ID = "dlg:sunita-arjun-paperwork";

/** Resolve the edge for this permission, never another permission for the same pair. */
export function getDelegationEdges(
  graph: CitizenGraph,
  delegation: Delegation,
) {
  return graph.edges.filter(
    (edge): edge is Extract<GraphEdge, { type: "delegateOf" }> =>
      edge.type === "delegateOf" &&
      edge.from === delegation.attrs.delegateId &&
      edge.to === delegation.attrs.delegatorId &&
      (edge.attrs.delegationId === delegation.id ||
        (!edge.attrs.delegationId &&
          (edge.id === `e:${delegation.id}:delegateOf` ||
            (delegation.id === LEGACY_DELEGATION_ID &&
              edge.id.startsWith("e:arjun-delegateof-sunita:"))))),
  );
}

export function getActiveDelegations(
  graph: CitizenGraph,
  delegateId: string,
  subjectId?: string,
): Delegation[] {
  return graph.nodes.filter(
    (node): node is Delegation =>
      node.type === "delegation" &&
      node.attrs.delegateId === delegateId &&
      (!subjectId || node.attrs.delegatorId === subjectId) &&
      node.attrs.status === "active" &&
      node.attrs.expiresOn >= DEMO_TODAY &&
      getDelegationEdges(graph, node).some(
        (edge) =>
          edge.status === "active" &&
          !edge.validTo &&
          edge.validFrom.slice(0, 10) <= DEMO_TODAY &&
          edge.attrs.expiresOn >= DEMO_TODAY,
      ),
  );
}

/** Both the exact permission and its relationship must still be active. */
export function getActiveDelegation(
  graph: CitizenGraph,
  delegateId: string,
  subjectId?: string,
) {
  return getActiveDelegations(graph, delegateId, subjectId)[0];
}

export function delegatedScopes(
  graph: CitizenGraph,
  delegateId: string,
  subjectId: string,
) {
  return [
    ...new Set(
      getActiveDelegations(graph, delegateId, subjectId).flatMap(
        (delegation) => {
          const scopes = getDelegationEdges(graph, delegation)
            .filter(
              (edge) =>
                edge.status === "active" &&
                !edge.validTo &&
                edge.validFrom.slice(0, 10) <= DEMO_TODAY &&
                edge.attrs.expiresOn >= DEMO_TODAY,
            )
            .flatMap((edge) => edge.attrs.scopes);
          return delegation.attrs.scopes.filter((scope) =>
            scopes.includes(scope),
          );
        },
      ),
    ),
  ];
}

/** Only document caching is a delegated write. No applications, payments or consent. */
export function canCommitDelegated(
  graph: CitizenGraph,
  actorId: string,
  subjectId: string,
  mutations: GraphMutation[],
) {
  if (
    !delegatedScopes(graph, actorId, subjectId).includes("documents") ||
    mutations.length === 0
  )
    return false;
  return mutations.every(
    (mutation) =>
      mutation.type === "patchAttrs" &&
      !mutation.verification &&
      Object.keys(mutation.attrs).length === 1 &&
      "downloaded" in mutation.attrs &&
      mutation.attrs.downloaded === true &&
      graph.nodes.some(
        (node) => node.id === mutation.nodeId && node.type === "document",
      ) &&
      graph.edges.some(
        (edge) =>
          edge.type === "holds" &&
          edge.status === "active" &&
          !edge.validTo &&
          edge.validFrom.slice(0, 10) <= DEMO_TODAY &&
          edge.from === subjectId &&
          edge.to === mutation.nodeId,
      ),
  );
}
