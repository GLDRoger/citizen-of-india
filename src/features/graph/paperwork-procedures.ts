import { DEMO_TODAY } from "@/lib/demo-clock";
import type { CitizenGraph, GraphMutation } from "./schema";
import {
  getActiveDelegations,
  getDelegationEdges,
  LEGACY_DELEGATION_ID,
} from "./delegation";

export const PAPERWORK_EXPIRES = "2026-11-22";
const scopes = ["property", "documents"] as const;
const verification = {
  source: "Self",
  state: "self-declared",
  asOf: DEMO_TODAY,
} as const;

/** The guided Sunita/Arjun journey owns exactly this permission, not their other family grants. */
export function preparePaperworkAccess(
  graph: CitizenGraph,
  actorId: string,
  action: "request" | "grant",
): GraphMutation[] {
  if (actorId !== (action === "request" ? "person:arjun" : "person:sunita"))
    throw new Error("Only the named participant can take this action.");
  const existing = graph.nodes.find((node) => node.id === LEGACY_DELEGATION_ID);
  if (
    existing &&
    (existing.type !== "delegation" ||
      existing.attrs.delegateId !== "person:arjun" ||
      existing.attrs.delegatorId !== "person:sunita")
  )
    throw new Error("The saved permission has different participants.");
  if (
    getActiveDelegations(graph, "person:arjun", "person:sunita").some(
      (node) => node.id === LEGACY_DELEGATION_ID,
    )
  )
    throw new Error("This permission is already active.");
  if (action === "request" && existing?.attrs.status === "requested")
    throw new Error("The request is already waiting.");
  const status = action === "grant" ? "active" : "requested";
  const attrs = {
    scopes: [...scopes],
    expiresOn: PAPERWORK_EXPIRES,
    status: status as "active" | "requested",
  };
  const mutations: GraphMutation[] = [
    existing
      ? { type: "patchAttrs", nodeId: existing.id, attrs }
      : {
          type: "addNode",
          node: {
            id: LEGACY_DELEGATION_ID,
            type: "delegation",
            attrs: {
              title: "Property records and documents",
              delegateId: "person:arjun",
              delegatorId: "person:sunita",
              ...attrs,
            },
            verification,
          },
        },
  ];
  if (action === "grant") {
    if (existing)
      mutations.push(
        ...getDelegationEdges(graph, existing)
          .filter((edge) => edge.status === "active" && !edge.validTo)
          .map(
            (edge): GraphMutation => ({
              type: "endEdge",
              edgeId: edge.id,
              validTo: DEMO_TODAY,
            }),
          ),
      );
    mutations.push({
      type: "addEdge",
      edge: {
        id: `e:arjun-delegateof-sunita:${crypto.randomUUID()}`,
        type: "delegateOf",
        from: "person:arjun",
        to: "person:sunita",
        attrs: {
          delegationId: LEGACY_DELEGATION_ID,
          scopes: [...scopes],
          expiresOn: PAPERWORK_EXPIRES,
        },
        validFrom: DEMO_TODAY,
        status: "active",
        verification,
      },
    });
  }
  return mutations;
}
