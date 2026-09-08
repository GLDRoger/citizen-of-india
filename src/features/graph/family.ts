import { seedLogins } from "./seed";
import type { CitizenGraph, GraphNode } from "./schema";
import { delegatedScopes, getActiveDelegations } from "./delegation";
import { getNotices, getObligations, getOwnedAssets, getPerson, getRelationshipViews } from "./selectors";

import type { ConnectionRelationship } from "./relationships";
export type { ConnectionRelationship } from "./relationships";
export type ConnectionInvitation = Extract<GraphNode, { type: "connectionInvitation" }>;
export const familySharingScopes = ["documents", "property", "pension", "tax"] as const;
export type FamilySharingScope = typeof familySharingScopes[number];

export function getConnectionInvitations(graph: CitizenGraph, personId: string) {
  return graph.nodes
    .filter((node): node is ConnectionInvitation => node.type === "connectionInvitation"
      && (node.attrs.inviterId === personId || node.attrs.inviteeId === personId))
    .sort((first, second) => second.attrs.requestedOn.localeCompare(first.attrs.requestedOn));
}

export function getConnectedPersonIds(graph: CitizenGraph, personId: string) {
  return new Set(getRelationshipViews(graph, personId).filter((view) => view.relationship !== "historical spouse" && !view.person.attrs.deceasedOn).map((view) => view.person.id));
}

export function getAvailableConnectionPeople(graph: CitizenGraph, personId: string) {
  const connected = getConnectedPersonIds(graph, personId);
  const invited = new Set(getConnectionInvitations(graph, personId)
    .filter((invitation) => invitation.attrs.status === "requested")
    .map((invitation) => invitation.attrs.inviterId === personId ? invitation.attrs.inviteeId : invitation.attrs.inviterId));
  return graph.nodes
    .filter((node): node is Extract<GraphNode, { type: "person" }> => node.type === "person"
      && seedLogins.some((login) => login.personId === node.id) && !node.attrs.deceasedOn
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

export function getActiveFamilySharing(graph: CitizenGraph, personId: string) {
  return getFamilySharing(graph, personId).filter(({ delegation }) =>
    getActiveDelegations(graph, delegation.attrs.delegateId, delegation.attrs.delegatorId).some((active) => active.id === delegation.id),
  );
}

export function getFamilyAccess(graph: CitizenGraph, personId: string) {
  const active = getActiveFamilySharing(graph, personId);
  return {
    incoming: active.filter(({ delegation }) => delegation.attrs.delegateId === personId),
    outgoing: active.filter(({ delegation }) => delegation.attrs.delegatorId === personId),
  };
}

function isVisibleByScope(graph: CitizenGraph, ownerId: string, relatedTo: string | undefined, scope: FamilySharingScope, label = "") {
  if (!relatedTo) return false;
  if (scope === "tax") return /(tax|gst|gstr|refund|challan|income|payment|payable)/i.test(label);
  if (scope === "property") return getOwnedAssets(graph, ownerId).some((asset) => asset.type === "property" && asset.id === relatedTo);
  if (scope === "documents") return graph.nodes.some((node) => node.type === "document" && node.id === relatedTo && graph.edges.some((edge) => edge.type === "holds" && edge.from === ownerId && edge.to === relatedTo && edge.status === "active"));
  return Boolean(graph.nodes.find((node) => node.id === relatedTo && (node.type === "employment" || node.type === "benefit")));
}

function matchesAnyScope(graph: CitizenGraph, ownerId: string, relatedTo: string | undefined, scopes: FamilySharingScope[], label = "") {
  return scopes.some((scope) => isVisibleByScope(graph, ownerId, relatedTo, scope, label));
}

export interface FamilySharedAlert {
  id: string;
  ownerId: string;
  ownerName: string;
  relationship: RelationshipForAlert;
  title: string;
  meta: string;
  recordId: string;
  dueDate?: string;
  href: string;
  relatedTo?: string;
  kind: "obligation" | "notice";
}

type RelationshipForAlert = ConnectionRelationship | "spouse" | "historical spouse";

export function getFamilySharedAlerts(graph: CitizenGraph, delegateId: string): FamilySharedAlert[] {
  const access = getFamilyAccess(graph, delegateId).incoming;
  const alerts: FamilySharedAlert[] = [];
  const seen = new Set<string>();
  const relationshipByPerson = new Map(getRelationshipViews(graph, delegateId).map((view) => [view.person.id, view.relationship]));
  for (const { delegation, other } of access) {
    const ownerId = delegation.attrs.delegatorId;
    const scopes = delegatedScopes(graph, delegateId, ownerId).filter((scope): scope is FamilySharingScope => familySharingScopes.includes(scope as FamilySharingScope));
    const ownerObligations = getObligations(graph, ownerId);
    const ownedPropertyIds = new Set(getOwnedAssets(graph, ownerId).filter((asset) => asset.type === "property").map((asset) => asset.id));
    const propertyObligations = graph.nodes.filter((node): node is Extract<GraphNode, { type: "obligation" }> => node.type === "obligation" && node.attrs.relatedTo !== undefined && ownedPropertyIds.has(node.attrs.relatedTo));
    const obligations = [...new Map([...ownerObligations, ...propertyObligations].map((obligation) => [obligation.id, obligation])).values()];
    for (const obligation of obligations) {
      const active = ["paid", "received", "completed"].includes(obligation.attrs.status ?? "due") === false;
      if (!active || !matchesAnyScope(graph, ownerId, obligation.attrs.relatedTo, scopes, obligation.attrs.title)) continue;
      const alertKey = `${ownerId}:${obligation.id}`;
      if (seen.has(alertKey)) continue;
      seen.add(alertKey);
      alerts.push({
        id: `${delegation.id}:${obligation.id}`,
        ownerId,
        ownerName: other.attrs.name,
        relationship: relationshipByPerson.get(ownerId) ?? "other",
        title: obligation.attrs.title,
        meta: obligation.attrs.authority,
        dueDate: obligation.attrs.dueDate,
        recordId: obligation.id,
        href: "/family#shared-alerts",
        relatedTo: obligation.id,
        kind: "obligation",
      });
    }
    for (const notice of getNotices(graph, ownerId)) {
      if (!matchesAnyScope(graph, ownerId, notice.node.attrs.relatedTo, scopes, notice.node.attrs.subject)) continue;
      const alertKey = `${ownerId}:${notice.node.id}`;
      if (seen.has(alertKey) || alerts.some((alert) => alert.ownerId === ownerId && alert.relatedTo === notice.node.attrs.relatedTo)) continue;
      seen.add(alertKey);
      alerts.push({
        id: `${delegation.id}:${notice.node.id}`,
        ownerId,
        ownerName: other.attrs.name,
        relationship: relationshipByPerson.get(ownerId) ?? "other",
        title: notice.node.attrs.subject,
        meta: notice.node.attrs.sender,
        recordId: notice.node.id,
        href: "/family#shared-alerts",
        relatedTo: notice.node.attrs.relatedTo,
        kind: "notice",
      });
    }
  }
  return alerts;
}

export function hasFamilyConnection(graph: CitizenGraph, firstId: string, secondId: string) {
  return getConnectedPersonIds(graph, firstId).has(secondId);
}
