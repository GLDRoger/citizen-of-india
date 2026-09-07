"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, KeyRound, UserPlus, UsersRound, X } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getActiveFamilySharing, getAvailableConnectionPeople, getConnectionInvitations, getFamilyAccess, getFamilySharedAlerts, familySharingScopes, type ConnectionRelationship, type FamilySharingScope } from "@/features/graph/family";
import { getPerson, getRelationshipViews, type RelationshipView } from "@/features/graph/selectors";
import type { GraphMutation, GraphNode } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { localizeNodeTitle } from "@/i18n/content";
import { getRelationshipMessageKey } from "@/i18n/formatters";
import { useI18n } from "@/i18n/use-i18n";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { formatDate } from "@/lib/format";

const RELATIONSHIPS: ConnectionRelationship[] = ["parent", "child", "sibling", "partner", "other"];
const SCOPE_LABELS = {
  documents: "familyPermissionDocuments",
  property: "familyPermissionProperty",
  pension: "familyPermissionPension",
  tax: "familyPermissionTax",
} as const;
const DEMO_EXPIRY = "2026-11-22";
const LEGACY_DELEGATION_ID = "dlg:sunita-arjun-paperwork";

type FamilyRelationship = RelationshipView["relationship"];

function relationshipLabel(relationship: FamilyRelationship, t: ReturnType<typeof useI18n>["t"]) {
  const key = getRelationshipMessageKey(relationship);
  return key ? t(key) : relationship;
}

function AccessScopeList({ scopes }: { scopes: string[] }) {
  const { t } = useI18n();
  const labels = scopes
    .filter((scope): scope is FamilySharingScope => familySharingScopes.includes(scope as FamilySharingScope))
    .map((scope) => t(SCOPE_LABELS[scope]));
  return <span>{labels.length ? labels.join(" · ") : t("familyNoAccess")}</span>;
}

function SharingControls({ personId, recipientId }: { personId: string; recipientId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const recipient = getPerson(graph, recipientId);
  const existing = getFamilyAccess(graph, personId).outgoing.find(({ delegation }) => delegation.id !== LEGACY_DELEGATION_ID && delegation.attrs.delegateId === recipientId);
  const [scopes, setScopes] = useState<FamilySharingScope[]>((existing?.delegation.attrs.scopes ?? []).filter((scope): scope is FamilySharingScope => familySharingScopes.includes(scope as FamilySharingScope)));
  const [error, setError] = useState(false);

  if (!recipient) return null;
  const toggleScope = (scope: FamilySharingScope) => setScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]);
  const share = () => {
    if (!scopes.length) return;
    const delegationId = existing?.delegation.id ?? `dlg:family-${crypto.randomUUID()}`;
    const verification = { source: "Self" as const, state: "self-declared" as const, asOf: DEMO_TODAY };
    const edge = existing ? graph.edges.find((candidate) => candidate.type === "delegateOf" && candidate.from === recipientId && candidate.to === personId && candidate.status === "active") : undefined;
    const mutations: GraphMutation[] = existing
      ? [{ type: "patchAttrs", nodeId: existing.delegation.id, attrs: { scopes } }, ...(edge ? [{ type: "patchEdgeAttrs" as const, edgeId: edge.id, attrs: { scopes } }] : [])]
      : [
        { type: "addNode", node: { id: delegationId, type: "delegation" as const, attrs: { title: "Authorised family updates", delegateId: recipientId, delegatorId: personId, scopes, expiresOn: DEMO_EXPIRY, status: "active" as const }, verification } },
        { type: "addEdge", edge: { id: `e:${delegationId}:delegateOf`, type: "delegateOf" as const, from: recipientId, to: personId, attrs: { scopes, expiresOn: DEMO_EXPIRY }, validFrom: DEMO_TODAY, status: "active" as const, verification } },
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

  return <div className="grid gap-4 rounded-[3px] bg-paper p-4"><div className="flex items-start gap-3"><KeyRound aria-hidden className="mt-0.5 size-4 shrink-0 text-indigo-deep" /><div className="grid gap-1"><strong className="text-sm text-ink">{t("familyAccessYouShare")} · {recipient.attrs.name}</strong><span className="text-xs leading-5 text-ink-mute">{t("familySharingIntro")}</span></div></div><fieldset className="grid gap-2"><legend className="text-xs font-bold text-ink">{t("familyChoosePermissions")}</legend>{familySharingScopes.map((scope) => <label className="flex min-h-11 items-center gap-3 text-sm text-ink" key={scope}><input checked={scopes.includes(scope)} className="size-4 accent-indigo-deep" onChange={() => toggleScope(scope)} type="checkbox" />{t(SCOPE_LABELS[scope])}</label>)}</fieldset><div className="flex flex-wrap items-center gap-2"><Button disabled={!scopes.length} onClick={share} variant="secondary">{existing ? t("familyUpdateSharing") : t("familyShareUpdates")}</Button>{existing ? <><StatusPill label={t("familySharingActive")} tone="success" /><Button onClick={revoke} variant="secondary">{t("familyRevokeSharing")}</Button></> : null}</div>{existing ? <p className="text-xs text-ink-mute">{t("familySharingExpiry", { date: formatDate(existing.delegation.attrs.expiresOn, language) })}</p> : null}{error ? <p className="text-xs font-bold text-brick" role="alert">{t("sharedSaveError")}</p> : null}</div>;
}

function IncomingAccessCard({ delegation }: { delegation: Extract<GraphNode, { type: "delegation" }> }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const personId = useAuthStore((state) => state.personId);
  const actFor = useAuthStore((state) => state.actFor);
  const router = useRouter();
  const owner = getPerson(graph, delegation.attrs.delegatorId);
  if (!owner || !personId) return null;
  const openSharedView = () => {
    actFor(owner.id, graph);
    router.push("/home");
  };
  return <div className="grid gap-3 rounded-[3px] bg-indigo-tint p-4"><div className="flex items-start gap-3"><UsersRound aria-hidden className="mt-0.5 size-4 shrink-0 text-indigo-deep" /><div className="grid gap-1"><strong className="text-sm text-ink">{t("familyAccessSharedWithYou")}</strong><span className="text-xs leading-5 text-ink-mute">{t("familySharedBy", { name: owner.attrs.name })}</span></div></div><p className="text-sm font-bold text-ink"><AccessScopeList scopes={delegation.attrs.scopes} /></p><p className="text-xs leading-5 text-ink-mute">{t("familySharingExpiry", { date: formatDate(delegation.attrs.expiresOn, language) })}</p><div><Button onClick={openSharedView} variant="secondary">{t("familyOpenSharedView")}</Button></div><p className="text-xs text-ink-mute">{t("familySharedViewHint")}</p></div>;
}

function ConnectionCard({ personId, connection }: { personId: string; connection: RelationshipView }) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const access = getFamilyAccess(graph, personId);
  const incoming = access.incoming.find(({ delegation }) => delegation.attrs.delegatorId === connection.person.id);
  const outgoing = access.outgoing.find(({ delegation }) => delegation.attrs.delegateId === connection.person.id);
  return <article className="grid gap-3 border-y border-paper-line py-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><UserPlus aria-hidden className="mt-1 size-4 shrink-0 text-ink-mute" /><div className="grid gap-1"><strong className="text-sm text-ink">{connection.person.attrs.name}</strong><span className="text-xs text-ink-mute">{relationshipLabel(connection.relationship, t)} · {t("familyAccepted")}</span></div></div>{incoming || outgoing ? <StatusPill label={t("familyAccessSection")} tone="info" /> : null}</div><details className="group rounded-[3px] border border-paper-line bg-paper-shade" open={Boolean(incoming || outgoing)}><summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 text-sm font-bold text-indigo-deep"><span>{incoming ? t("familyAccessSharedWithYou") : outgoing ? t("familyManageSharing") : t("familyShareRecords")}</span><span aria-hidden className="text-lg leading-none group-open:rotate-45">+</span></summary><div className="grid gap-4 border-t border-paper-line p-3">{incoming ? <IncomingAccessCard delegation={incoming.delegation} /> : null}{outgoing?.delegation.id === LEGACY_DELEGATION_ID ? <div className="grid gap-2 rounded-[3px] bg-paper p-4 text-sm leading-6 text-ink-mute"><p>{t("familyExistingAccess")}</p><Link className="font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href="/you#delegation">{t("familyManage")}</Link></div> : <SharingControls key={`${personId}:${connection.person.id}`} personId={personId} recipientId={connection.person.id} />}</div></details></article>;
}

export function FamilyConnectionsPanel({ personId, compact = false }: { personId: string; compact?: boolean }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [adding, setAdding] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [relationship, setRelationship] = useState<ConnectionRelationship>("sibling");
  const connections = getRelationshipViews(graph, personId);
  const connectedIds = new Set(connections.map((connection) => connection.person.id));
  const invitations = getConnectionInvitations(graph, personId).filter((invitation) => invitation.attrs.status === "requested" && !connectedIds.has(invitation.attrs.inviterId === personId ? invitation.attrs.inviteeId : invitation.attrs.inviterId));
  const people = getAvailableConnectionPeople(graph, personId);
  const sharedAlerts = getFamilySharedAlerts(graph, personId);
  const activeSharedAccess = getActiveFamilySharing(graph, personId);

  const invite = () => {
    const invitee = selectedPersonId ? getPerson(graph, selectedPersonId) : undefined;
    if (!invitee) return;
    const verification = { source: "Self" as const, state: "self-declared" as const, asOf: DEMO_TODAY };
    commit({ actorId: personId, labelKey: "eventConnectionRequested", procedureId: "family-connection", mutations: [{ type: "addNode", node: { id: `inv:${crypto.randomUUID()}`, type: "connectionInvitation" as const, attrs: { title: `Family connection: ${invitee.attrs.name}`, inviterId: personId, inviteeId: invitee.id, relationship, requestedOn: DEMO_TODAY, status: "requested" as const }, verification } }] });
    setAdding(false);
    setSelectedPersonId("");
  };

  const respond = (invitationId: string, accepted: boolean) => {
    const invitation = invitations.find((item) => item.id === invitationId);
    if (!invitation) return;
    const alreadyConnected = connectedIds.has(invitation.attrs.inviterId === personId ? invitation.attrs.inviteeId : invitation.attrs.inviterId);
    const verification = { source: "Self" as const, state: "self-declared" as const, asOf: DEMO_TODAY };
    const mutations: GraphMutation[] = [{ type: "patchAttrs", nodeId: invitation.id, attrs: { status: accepted ? "accepted" : "declined", respondedOn: DEMO_TODAY } }];
    if (accepted && !alreadyConnected) mutations.push({ type: "addEdge", edge: { id: `e:${invitation.id}:family`, type: "familyOf" as const, from: invitation.attrs.inviterId, to: invitation.attrs.inviteeId, attrs: { relationship: invitation.attrs.relationship }, validFrom: DEMO_TODAY, status: "active" as const, verification } });
    commit({ actorId: personId, labelKey: accepted ? "eventConnectionAccepted" : "eventConnectionDeclined", procedureId: "family-connection", mutations });
  };

  if (compact) return <section className="grid scroll-mt-24 gap-5" id="family-connections"><div className="flex flex-wrap items-end justify-between gap-3"><div className="grid gap-1"><p className="eyebrow">{t("familyNav")}</p><h2 className="font-display text-3xl font-semibold leading-tight text-ink">{t("familyTitle")}</h2></div><LinkButton href="/family" variant="secondary">{t("familyManage")}</LinkButton></div><p className="max-w-2xl text-sm leading-6 text-ink-mute">{t("familyCompactIntro")}</p><div className="grid grid-cols-3 divide-x divide-paper-line border-y border-paper-line py-4"><div className="grid gap-1 pr-3"><span className="text-xs text-ink-mute">{t("familySummaryConnected")}</span><strong className="font-display text-2xl text-ink">{connections.length}</strong></div><div className="grid gap-1 px-3"><span className="text-xs text-ink-mute">{t("familySummaryRequests")}</span><strong className="font-display text-2xl text-ink">{invitations.length}</strong></div><div className="grid gap-1 pl-3"><span className="text-xs text-ink-mute">{t("familySummaryShared")}</span><strong className="font-display text-2xl text-ink">{activeSharedAccess.length}</strong></div></div></section>;

  return <section className="grid scroll-mt-24 gap-7" id="family-connections"><div className="flex flex-wrap items-end justify-between gap-3"><div className="grid gap-1"><p className="eyebrow">{connections.length}</p><h1 className="font-display text-4xl font-semibold leading-tight tracking-[-0.03em] text-ink">{t("familyTitle")}</h1></div>{people.length ? <Button onClick={() => { setAdding((current) => !current); setSelectedPersonId(people[0]?.id ?? ""); }} variant="secondary"><UserPlus aria-hidden className="size-4" />{t("familyAddConnection")}</Button> : null}</div><p className="max-w-2xl text-base leading-7 text-ink-mute">{t("familySubtitle")}</p><div className="grid grid-cols-3 divide-x divide-paper-line border-y border-paper-line py-5"><div className="grid gap-1 pr-4"><span className="text-xs text-ink-mute">{t("familySummaryConnected")}</span><strong className="font-display text-3xl text-ink">{connections.length}</strong></div><div className="grid gap-1 px-4"><span className="text-xs text-ink-mute">{t("familySummaryRequests")}</span><strong className="font-display text-3xl text-ink">{invitations.length}</strong></div><div className="grid gap-1 pl-4"><span className="text-xs text-ink-mute">{t("familySummaryShared")}</span><strong className="font-display text-3xl text-ink">{activeSharedAccess.length}</strong></div></div>{adding ? <div className="grid gap-4 rounded-[3px] border border-paper-line bg-panel p-5"><div className="grid gap-1"><strong className="text-sm text-ink">{t("familyAddConnection")}</strong><span className="text-xs leading-5 text-ink-mute">{t("familyConnectionsIntro")}</span></div><label className="grid gap-2 text-sm font-bold text-ink">{t("familyChoosePerson")}<select className="min-h-11 rounded-[2px] border border-paper-line bg-paper px-3 font-normal" onChange={(event) => setSelectedPersonId(event.target.value)} value={selectedPersonId}>{people.map((person) => <option key={person.id} value={person.id}>{person.attrs.name}</option>)}</select></label><label className="grid gap-2 text-sm font-bold text-ink">{t("familyChooseRelationship")}<select className="min-h-11 rounded-[2px] border border-paper-line bg-paper px-3 font-normal" onChange={(event) => setRelationship(event.target.value as ConnectionRelationship)} value={relationship}>{RELATIONSHIPS.map((option) => <option key={option} value={option}>{relationshipLabel(option, t)}</option>)}</select></label><div className="flex flex-wrap gap-2"><Button disabled={!selectedPersonId} onClick={invite}>{t("familyInvite")}</Button><Button onClick={() => setAdding(false)} variant="secondary">{t("familyCancel")}</Button></div></div> : null}<section className="grid gap-4" id="requests"><SectionHeader eyebrow={`${invitations.length}`} title={t("familyRequestsTitle")} /><p className="text-sm leading-6 text-ink-mute">{t("familyRequestsIntro")}</p>{invitations.length ? <div className="border-y border-paper-line">{invitations.map((invitation) => { const incoming = invitation.attrs.inviteeId === personId; const otherId = incoming ? invitation.attrs.inviterId : invitation.attrs.inviteeId; const other = getPerson(graph, otherId); return <article className="grid gap-3 border-b border-paper-line py-4 last:border-b-0" key={invitation.id}><div className="flex flex-wrap items-start justify-between gap-3"><div className="grid gap-1"><strong className="text-sm text-ink">{incoming ? t("familyInviteFrom", { name: other?.attrs.name ?? "family member" }) : t("familyInviteSentTo", { name: other?.attrs.name ?? "family member" })}</strong><span className="text-xs text-ink-mute">{t("familyRelationshipLabel")}: {relationshipLabel(invitation.attrs.relationship, t)}</span></div><StatusPill label={incoming ? t("familyInvitationIncoming") : t("familyInvitationSent")} tone={incoming ? "warning" : "info"} /></div>{incoming ? <div className="flex flex-wrap gap-2"><Button onClick={() => respond(invitation.id, true)}><Check aria-hidden className="size-4" />{t("familyAccept")}</Button><Button onClick={() => respond(invitation.id, false)} variant="secondary"><X aria-hidden className="size-4" />{t("familyDecline")}</Button></div> : <p className="text-xs text-ink-mute">{t("familyInvitationPending")}</p>}</article>; })}</div> : <p className="border-y border-paper-line py-5 text-sm text-ink-mute">{t("familyNoRequests")}</p>}</section><section className="grid gap-4" id="access"><SectionHeader eyebrow={`${connections.length}`} title={t("familyConnectionsSection")} /><p className="text-sm leading-6 text-ink-mute">{t("familyConnectionsSectionIntro")}</p>{connections.length ? <div>{connections.map((connection) => <ConnectionCard connection={connection} key={connection.person.id} personId={personId} />)}</div> : <p className="border-y border-paper-line py-5 text-sm text-ink-mute">{t("familyNoConnections")}</p>}</section>{sharedAlerts.length ? <section className="grid gap-4" id="shared-alerts"><SectionHeader eyebrow={`${sharedAlerts.length}`} title={t("familySharedAlertsTitle")} /><p className="text-sm leading-6 text-ink-mute">{t("familySharedAlertsIntro")}</p><div className="border-y border-paper-line">{sharedAlerts.map((alert) => { const relationship = relationshipLabel(alert.relationship, t); const title = localizeNodeTitle(language, alert.relatedTo ?? alert.id, alert.title); return <article className="grid gap-1 border-b border-paper-line py-4 last:border-b-0" key={alert.id}><p className="eyebrow text-indigo-deep">{t("familySharedUpdateLabel")}</p><h3 className="font-display text-xl font-semibold leading-tight text-ink">{t("familyAlertTitle", { relationship, name: alert.ownerName, title })}</h3><p className="text-xs text-ink-mute">{alert.meta}</p></article>; })}</div></section> : null}</section>;
}
