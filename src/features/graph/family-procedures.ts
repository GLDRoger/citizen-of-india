import { DEMO_TODAY } from "@/lib/demo-clock";
import type { CitizenGraph, GraphMutation } from "./schema";
import { seedLogins } from "./seed";
import { getPerson } from "./selectors";
import {
  getAvailableConnectionPeople,
  getConnectedPersonIds,
  getConnectionInvitations,
  getFamilySharing,
  familySharingScopes,
  type ConnectionRelationship,
  type FamilySharingScope,
} from "./family";
import { getDelegationEdges, LEGACY_DELEGATION_ID } from "./delegation";

const verification = {
  source: "Self",
  state: "self-declared",
  asOf: DEMO_TODAY,
} as const;
const expiresOn = "2026-11-22";
export const relationships: ConnectionRelationship[] = [
  "parent",
  "child",
  "sibling",
  "partner",
  "other",
];

export function inviteFamily(
  graph: CitizenGraph,
  personId: string,
  inviteeId: string,
  relationship: ConnectionRelationship,
): GraphMutation[] {
  if (
    !getPerson(graph, personId) ||
    !relationships.includes(relationship) ||
    !getAvailableConnectionPeople(graph, personId).some(
      (person) => person.id === inviteeId,
    )
  )
    throw new Error("Connection is unavailable.");
  const invitee = getPerson(graph, inviteeId)!;
  return [
    {
      type: "addNode",
      node: {
        id: `inv:${crypto.randomUUID()}`,
        type: "connectionInvitation",
        attrs: {
          title: `Family connection: ${invitee.attrs.name}`,
          inviterId: personId,
          inviteeId,
          relationship,
          requestedOn: DEMO_TODAY,
          status: "requested",
        },
        verification,
      },
    },
  ];
}

export function respondToFamily(
  graph: CitizenGraph,
  personId: string,
  invitationId: string,
  status: "accepted" | "declined" | "cancelled",
): GraphMutation[] {
  const invitation = getConnectionInvitations(graph, personId).find(
    (item) => item.id === invitationId,
  );
  if (
    !invitation ||
    invitation.attrs.status !== "requested" ||
    (status === "cancelled"
      ? invitation.attrs.inviterId !== personId
      : invitation.attrs.inviteeId !== personId)
  )
    throw new Error("This invitation cannot be changed by this profile.");
  const mutations: GraphMutation[] = [
    {
      type: "patchAttrs",
      nodeId: invitation.id,
      attrs: { status, respondedOn: DEMO_TODAY },
    },
  ];
  if (
    status === "accepted" &&
    !getConnectedPersonIds(graph, personId).has(invitation.attrs.inviterId)
  ) {
    mutations.push({
      type: "addEdge",
      edge: {
        id: `e:${invitation.id}:family`,
        type: "familyOf",
        from: invitation.attrs.inviterId,
        to: personId,
        attrs: { relationship: invitation.attrs.relationship },
        validFrom: DEMO_TODAY,
        status: "active",
        verification,
      },
    });
  }
  return mutations;
}

export function shareFamily(
  graph: CitizenGraph,
  ownerId: string,
  recipientId: string,
  scopes: FamilySharingScope[],
): GraphMutation[] {
  if (
    !getPerson(graph, ownerId) ||
    !seedLogins.some((login) => login.personId === recipientId) ||
    !getConnectedPersonIds(graph, ownerId).has(recipientId) ||
    !scopes.length ||
    scopes.some((scope) => !familySharingScopes.includes(scope))
  )
    throw new Error("Choose a connected person and valid permissions.");
  const current = getFamilySharing(graph, ownerId).find(
    ({ delegation }) =>
      delegation.attrs.delegatorId === ownerId &&
      delegation.attrs.delegateId === recipientId &&
      delegation.attrs.status === "active",
  );
  if (current?.delegation.id === LEGACY_DELEGATION_ID)
    throw new Error(
      "Manage this permission through the existing shared-access journey.",
    );
  const delegationId =
    current?.delegation.id ?? `dlg:family-${crypto.randomUUID()}`;
  const priorEdges = current
    ? getDelegationEdges(graph, current.delegation).filter(
        (edge) => edge.status === "active" && !edge.validTo,
      )
    : [];
  return [
    ...(current
      ? [
          {
            type: "patchAttrs" as const,
            nodeId: delegationId,
            attrs: { scopes: [...new Set(scopes)], expiresOn },
          },
        ]
      : [
          {
            type: "addNode" as const,
            node: {
              id: delegationId,
              type: "delegation" as const,
              attrs: {
                title: "Authorised family updates",
                delegateId: recipientId,
                delegatorId: ownerId,
                scopes: [...new Set(scopes)],
                expiresOn,
                status: "active" as const,
              },
              verification,
            },
          },
        ]),
    ...priorEdges.map(
      (edge): GraphMutation => ({
        type: "endEdge",
        edgeId: edge.id,
        validTo: DEMO_TODAY,
      }),
    ),
    {
      type: "addEdge",
      edge: {
        id: `e:${delegationId}:${crypto.randomUUID()}`,
        type: "delegateOf",
        from: recipientId,
        to: ownerId,
        attrs: { delegationId, scopes: [...new Set(scopes)], expiresOn },
        validFrom: DEMO_TODAY,
        status: "active",
        verification,
      },
    },
  ];
}

export function revokeFamily(
  graph: CitizenGraph,
  ownerId: string,
  delegationId: string,
): GraphMutation[] {
  const delegation = getFamilySharing(graph, ownerId).find(
    (item) => item.delegation.id === delegationId,
  )?.delegation;
  if (
    !delegation ||
    delegation.attrs.delegatorId !== ownerId ||
    delegation.attrs.status !== "active"
  )
    throw new Error("Only the owner can revoke this permission.");
  return [
    { type: "patchAttrs", nodeId: delegationId, attrs: { status: "revoked" } },
    ...getDelegationEdges(graph, delegation)
      .filter((edge) => edge.status === "active" && !edge.validTo)
      .map(
        (edge): GraphMutation => ({
          type: "endEdge",
          edgeId: edge.id,
          validTo: DEMO_TODAY,
        }),
      ),
  ];
}
