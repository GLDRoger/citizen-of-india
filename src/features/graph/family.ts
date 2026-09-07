import type { CitizenGraph, GraphNode } from "./schema";
import { getPerson, getRelationshipViews } from "./selectors";

export type ConnectionRelationship = "parent" | "child" | "sibling" | "partner" | "other";
export type ConnectionInvitation = Extract<GraphNode, { type: "connectionInvitation" }>;

export function getConnectionInvitations(graph: CitizenGraph, personId: string) {
  return graph.nodes
    .filter((node): node is ConnectionInvitation => node.type === "connectionInvitation"
      && (node.attrs.inviterId === personId || node.attrs.inviteeId === personId))
    .sort((first, second) => second.attrs.requestedOn.localeCompare(first.attrs.requestedOn));
}

export function getConnectedPersonIds(graph: CitizenGraph, personId: string) {
  return new Set(getRelationshipViews(graph, personId).map((view) => view.person.id));
}

export function getAvailableConnectionPeople(graph: CitizenGraph, personId: string) {
  const connected = getConnectedPersonIds(graph, personId);
  const invited = new Set(getConnectionInvitations(graph, personId)
    .filter((invitation) => invitation.attrs.status === "requested")
    .map((invitation) => invitation.attrs.inviterId === personId ? invitation.attrs.inviteeId : invitation.attrs.inviterId));
  return graph.nodes
    .filter((node): node is Extract<GraphNode, { type: "person" }> => node.type === "person"
      && node.id !== personId && !connected.has(node.id) && !invited.has(node.id))
    .sort((first, second) => first.attrs.name.localeCompare(second.attrs.name));
}

export function getFamilySharing(graph: CitizenGraph, personId: string) {
  return graph.nodes
    .filter((node): node is Extract<GraphNode, { type: "delegation" }> => node.type === "delegation"
      && (node.attrs.delegatorId === personId || node.attrs.delegateId === personId))
    .map((delegation) => ({
      delegation,
      other: getPerson(graph, delegation.attrs.delegatorId === personId ? delegation.attrs.delegateId : delegation.attrs.delegatorId),
    }))
    .filter((sharing): sharing is typeof sharing & { other: NonNullable<typeof sharing.other> } => Boolean(sharing.other));
}

export function hasFamilyConnection(graph: CitizenGraph, firstId: string, secondId: string) {
  return getConnectedPersonIds(graph, firstId).has(secondId);
}
