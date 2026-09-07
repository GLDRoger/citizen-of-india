"use client";

import { useState } from "react";
import { Check, KeyRound, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status";
import { getConnectionInvitations, getAvailableConnectionPeople, getFamilySharing, type ConnectionRelationship } from "@/features/graph/family";
import { getPerson, getRelationshipViews } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { formatDate } from "@/lib/format";

const RELATIONSHIPS: ConnectionRelationship[] = ["parent", "child", "sibling", "partner", "other"];
const SCOPES = [
  ["documents", "familyPermissionDocuments"],
  ["property", "familyPermissionProperty"],
  ["pension", "familyPermissionPension"],
  ["tax", "familyPermissionTax"],
] as const;
type SharingScope = typeof SCOPES[number][0];
const DEMO_EXPIRY = "2026-11-22";

function relationshipLabel(relationship: ConnectionRelationship, t: ReturnType<typeof useI18n>["t"]) {
  if (relationship === "sibling") return t("relationshipSibling");
  if (relationship === "partner") return t("relationshipPartner");
  if (relationship === "other") return t("relationshipOther");
  return relationship === "parent" ? t("relationshipParent") : t("relationshipChild");
}

function SharingControls({ personId, recipientId }: { personId: string; recipientId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const recipient = getPerson(graph, recipientId);
  const existing = getFamilySharing(graph, personId).find(({ delegation }) => delegation.id !== "dlg:sunita-arjun-paperwork" && delegation.attrs.delegatorId === personId && delegation.attrs.delegateId === recipientId && delegation.attrs.status === "active");
  const [scopes, setScopes] = useState<SharingScope[]>((existing?.delegation.attrs.scopes ?? []) as SharingScope[]);
  const [error, setError] = useState(false);
  if (!recipient) return null;
  const toggleScope = (scope: SharingScope) => setScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]);
  const share = () => {
    if (scopes.length === 0) return;
    const delegationId = existing?.delegation.id ?? `dlg:family-${crypto.randomUUID()}`;
    const selfDeclared = { source: "Self" as const, state: "self-declared" as const, asOf: DEMO_TODAY };
    const mutations: GraphMutation[] = existing
      ? [{ type: "patchAttrs", nodeId: existing.delegation.id, attrs: { scopes } }]
      : [
        { type: "addNode", node: { id: delegationId, type: "delegation" as const, attrs: { title: "Authorised family updates", delegateId: recipientId, delegatorId: personId, scopes, expiresOn: DEMO_EXPIRY, status: "active" as const }, verification: selfDeclared } },
        { type: "addEdge", edge: { id: `e:${delegationId}:delegateOf`, type: "delegateOf" as const, from: recipientId, to: personId, attrs: { scopes, expiresOn: DEMO_EXPIRY }, validFrom: DEMO_TODAY, status: "active" as const, verification: selfDeclared } },
      ];
    try {
      commit({ actorId: personId, labelKey: "eventAuthorisedUpdatesShared", procedureId: "family-sharing", mutations });
      setError(false);
    } catch {
      setError(true);
    }
  };
  const revoke = () => {
    if (!existing) return;
    const edge = graph.edges.find((candidate) => candidate.type === "delegateOf" && candidate.from === recipientId && candidate.to === personId && candidate.status === "active");
    const mutations: GraphMutation[] = [{ type: "patchAttrs", nodeId: existing.delegation.id, attrs: { status: "revoked" as const } }];
    if (edge) mutations.push({ type: "endEdge", edgeId: edge.id, validTo: DEMO_TODAY });
    try {
      commit({ actorId: personId, labelKey: "eventAuthorisedUpdatesRevoked", procedureId: "family-sharing", mutations });
      setScopes([]);
      setError(false);
    } catch {
      setError(true);
    }
  };
  return <div className="grid gap-3 border-t border-paper-line pt-4"><div className="flex items-center gap-2"><KeyRound aria-hidden className="size-4 text-indigo-deep" /><strong className="text-sm text-ink">{t("familySharingTitle")} · {recipient.attrs.name}</strong></div><p className="text-xs leading-5 text-ink-mute">{t("familySharingIntro")}</p><fieldset className="grid gap-2"><legend className="text-xs font-bold text-ink">{t("familyChoosePermissions")}</legend>{SCOPES.map(([scope, label]) => <label className="flex min-h-11 items-center gap-3 text-sm text-ink" key={scope}><input checked={scopes.includes(scope)} className="size-4 accent-indigo-deep" onChange={() => toggleScope(scope)} type="checkbox" />{t(label)}</label>)}</fieldset><div className="flex flex-wrap items-center gap-3"><Button disabled={scopes.length === 0} onClick={share} variant="secondary">{t("familyShareUpdates")}</Button>{existing ? <><StatusPill label={t("familySharingActive")} tone="success" /><Button onClick={revoke} variant="secondary">{t("familyRevokeSharing")}</Button></> : null}</div>{existing ? <p className="text-xs text-ink-mute">{t("familySharingExpiry", { date: formatDate(existing.delegation.attrs.expiresOn, language) })}</p> : null}{error ? <p className="text-xs font-bold text-brick" role="alert">{t("sharedSaveError")}</p> : null}</div>;
}

export function FamilyConnectionsPanel({ personId }: { personId: string }) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [adding, setAdding] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [relationship, setRelationship] = useState<ConnectionRelationship>("sibling");
  const people = getAvailableConnectionPeople(graph, personId);
  const invitations = getConnectionInvitations(graph, personId);
  const connections = getRelationshipViews(graph, personId);
  const sharing = getFamilySharing(graph, personId).filter(({ delegation }) => delegation.id !== "dlg:sunita-arjun-paperwork");

  const invite = () => {
    if (!selectedPersonId) return;
    const invitee = getPerson(graph, selectedPersonId);
    if (!invitee) return;
    const selfDeclared = { source: "Self" as const, state: "self-declared" as const, asOf: DEMO_TODAY };
    commit({ actorId: personId, labelKey: "eventConnectionRequested", procedureId: "family-connection", mutations: [{ type: "addNode", node: { id: `inv:${crypto.randomUUID()}`, type: "connectionInvitation" as const, attrs: { title: `Family connection: ${invitee.attrs.name}`, inviterId: personId, inviteeId: selectedPersonId, relationship, requestedOn: DEMO_TODAY, status: "requested" as const }, verification: selfDeclared } }] });
    setAdding(false);
    setSelectedPersonId("");
  };

  const respond = (invitationId: string, accepted: boolean) => {
    const invitation = invitations.find((item) => item.id === invitationId);
    if (!invitation) return;
    const selfDeclared = { source: "Self" as const, state: "self-declared" as const, asOf: DEMO_TODAY };
    const mutations: GraphMutation[] = [{ type: "patchAttrs", nodeId: invitation.id, attrs: { status: accepted ? "accepted" : "declined", respondedOn: DEMO_TODAY } }];
    if (accepted) mutations.push({ type: "addEdge", edge: { id: `e:${invitation.id}:family`, type: "familyOf", from: invitation.attrs.inviterId, to: invitation.attrs.inviteeId, attrs: { relationship: invitation.attrs.relationship }, validFrom: DEMO_TODAY, status: "active", verification: selfDeclared } });
    commit({ actorId: personId, labelKey: accepted ? "eventConnectionAccepted" : "eventConnectionDeclined", procedureId: "family-connection", mutations });
  };

  return <section className="grid scroll-mt-24 gap-5" id="family-connections"><div className="flex flex-wrap items-baseline justify-between gap-3"><div className="grid gap-1"><p className="eyebrow">{connections.length + invitations.length}</p><h2 className="font-display text-3xl font-semibold leading-tight text-ink">{t("familyConnectionsTitle")}</h2></div>{people.length ? <Button onClick={() => { setAdding((current) => !current); setSelectedPersonId(people[0]?.id ?? ""); }} variant="secondary"><UserPlus aria-hidden className="size-4" />{t("familyAddConnection")}</Button> : null}</div><p className="max-w-2xl text-sm leading-6 text-ink-mute">{t("familyConnectionsIntro")}</p>{adding ? <div className="grid gap-4 rounded-[3px] border border-paper-line bg-panel p-5"><label className="grid gap-2 text-sm font-bold text-ink">{t("familyChoosePerson")}<select className="min-h-11 rounded-[2px] border border-paper-line bg-paper px-3 font-normal" onChange={(event) => setSelectedPersonId(event.target.value)} value={selectedPersonId}>{people.map((person) => <option key={person.id} value={person.id}>{person.attrs.name}</option>)}</select></label><label className="grid gap-2 text-sm font-bold text-ink">{t("familyChooseRelationship")}<select className="min-h-11 rounded-[2px] border border-paper-line bg-paper px-3 font-normal" onChange={(event) => setRelationship(event.target.value as ConnectionRelationship)} value={relationship}>{RELATIONSHIPS.map((option) => <option key={option} value={option}>{relationshipLabel(option, t)}</option>)}</select></label><div><Button disabled={!selectedPersonId} onClick={invite}>{t("familyInvite")}</Button></div></div> : null}{invitations.map((invitation) => { const incoming = invitation.attrs.inviteeId === personId; const other = getPerson(graph, incoming ? invitation.attrs.inviterId : invitation.attrs.inviteeId); const statusLabel = invitation.attrs.status === "requested" ? incoming ? t("familyInvitationIncoming") : t("familyInvitationSent") : invitation.attrs.status === "accepted" ? t("familyAccepted") : t("familyDeclined"); return <article className="grid gap-4 border-y border-paper-line py-4" key={invitation.id}><div className="flex flex-wrap items-start justify-between gap-3"><div className="grid gap-1"><strong className="text-sm text-ink">{incoming ? t("familyInviteFrom", { name: other?.attrs.name ?? "family member" }) : t("familyInviteSentTo", { name: other?.attrs.name ?? "family member" })}</strong><span className="text-xs text-ink-mute">{t("familyRelationshipLabel")}: {relationshipLabel(invitation.attrs.relationship, t)}</span></div><StatusPill label={statusLabel} tone={invitation.attrs.status === "accepted" ? "success" : invitation.attrs.status === "requested" && incoming ? "warning" : "info"} /></div>{invitation.attrs.status === "requested" && incoming ? <div className="flex flex-wrap gap-2"><Button onClick={() => respond(invitation.id, true)}><Check aria-hidden className="size-4" />{t("familyAccept")}</Button><Button onClick={() => respond(invitation.id, false)} variant="secondary"><X aria-hidden className="size-4" />{t("familyDecline")}</Button></div> : invitation.attrs.status === "requested" ? <p className="text-xs text-ink-mute">{t("familyInvitationPending")}</p> : null}</article>; })}{connections.length ? <div className="grid gap-4">{connections.map((connection) => { const canShare = connection.person.id !== personId; return <article className="grid gap-3 border-y border-paper-line py-4" key={connection.person.id}><div className="flex items-center justify-between gap-3"><div className="grid gap-1"><strong className="text-sm text-ink">{connection.person.attrs.name}</strong><span className="text-xs text-ink-mute">{t("familyRelationshipLabel")}: {relationshipLabel(connection.relationship as ConnectionRelationship, t)}</span></div><StatusPill label={t("familyAccepted")} tone="success" /></div>{canShare ? <SharingControls personId={personId} recipientId={connection.person.id} /> : null}</article>; })}</div> : null}{!people.length && !invitations.length && !connections.length ? <p className="border-y border-paper-line py-6 text-sm text-ink-mute">{t("familyNoOtherPeople")}</p> : null}{sharing.length ? <p className="text-xs text-ink-mute">{t("familySharingActive")}</p> : null}</section>;
}
