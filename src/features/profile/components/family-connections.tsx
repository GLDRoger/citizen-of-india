"use client";

import type { MessageKey } from "@/i18n/messages";
import { formatDate } from "@/lib/format";

import { useState } from "react";
import { Check, UserPlus, X } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { PageHeader, SectionHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import {
  getActiveFamilySharing,
  getAvailableConnectionPeople,
  getConnectionInvitations,
  getFamilySharedAlerts,
  type ConnectionRelationship,
} from "@/features/graph/family";
import {
  getPerson,
  getRelationshipViews,
  type RelationshipView,
} from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { ConnectionCard } from "./family-sharing";
import {
  inviteFamily,
  respondToFamily,
} from "@/features/graph/family-procedures";
import { familyRelationship } from "@/features/graph/relationships";
import { localizeNodeTitle } from "@/i18n/content";
import { getRelationshipMessageKey } from "@/i18n/formatters";
import { useI18n } from "@/i18n/use-i18n";

const RELATIONSHIPS: ConnectionRelationship[] = [
  "parent",
  "child",
  "sibling",
  "partner",
  "other",
];
type FamilyRelationship = RelationshipView["relationship"];

function relationshipLabel(
  relationship: FamilyRelationship,
  t: ReturnType<typeof useI18n>["t"],
) {
  const key = getRelationshipMessageKey(relationship);
  return key ? t(key) : relationship;
}

export function FamilyConnectionsPanel({
  personId,
  compact = false,
}: {
  personId: string;
  compact?: boolean;
}) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [adding, setAdding] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [relationship, setRelationship] =
    useState<ConnectionRelationship>("sibling");
  const connections = getRelationshipViews(graph, personId);
  const connectedIds = new Set(
    connections.map((connection) => connection.person.id),
  );
  const invitations = getConnectionInvitations(graph, personId).filter(
    (invitation) =>
      invitation.attrs.status === "requested" &&
      !connectedIds.has(
        invitation.attrs.inviterId === personId
          ? invitation.attrs.inviteeId
          : invitation.attrs.inviterId,
      ),
  );
  const people = getAvailableConnectionPeople(graph, personId);
  const sharedAlerts = getFamilySharedAlerts(graph, personId);
  const activeSharedAccess = getActiveFamilySharing(graph, personId);

  const [error, setError] = useState(false);
  const [feedback, setFeedback] = useState<MessageKey>();
  const invite = () => {
    try {
      commit({
        actorId: personId,
        labelKey: "eventConnectionRequested",
        procedureId: "family-connection",
        mutations: inviteFamily(
          useCitizenStore.getState().graph,
          personId,
          selectedPersonId,
          relationship,
        ),
      });
      setFeedback("familyInvitationSent");
      setAdding(false);
      setSelectedPersonId("");
      setError(false);
    } catch {
      setError(true);
    }
  };
  const respond = (
    invitationId: string,
    status: "accepted" | "declined" | "cancelled",
  ) => {
    try {
      commit({
        actorId: personId,
        labelKey:
          status === "accepted"
            ? "eventConnectionAccepted"
            : status === "declined"
              ? "eventConnectionDeclined"
              : "eventConnectionCancelled",
        procedureId: "family-connection",
        mutations: respondToFamily(
          useCitizenStore.getState().graph,
          personId,
          invitationId,
          status,
        ),
      });
      setFeedback(
        status === "accepted"
          ? "familyAccepted"
          : status === "declined"
            ? "familyDeclined"
            : "eventConnectionCancelled",
      );
      setError(false);
    } catch {
      setError(true);
    }
  };

  if (compact)
    return (
      <section className="grid scroll-mt-24 gap-5" id="family-connections">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="grid gap-1">
            <p className="eyebrow">{t("familyNav")}</p>
            <h2 className="font-display text-3xl font-semibold leading-tight text-ink">
              {t("familyTitle")}
            </h2>
          </div>
          <LinkButton href="/family" variant="secondary">
            {t("familyManage")}
          </LinkButton>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-ink-mute">
          {t("familyCompactIntro")}
        </p>
        <div className="grid grid-cols-3 divide-x divide-paper-line border-y border-paper-line py-4">
          <div className="grid gap-1 pr-3">
            <span className="text-xs text-ink-mute">
              {t("familySummaryConnected")}
            </span>
            <strong className="font-display text-2xl text-ink">
              {connections.length}
            </strong>
          </div>
          <div className="grid gap-1 px-3">
            <span className="text-xs text-ink-mute">
              {t("familySummaryRequests")}
            </span>
            <strong className="font-display text-2xl text-ink">
              {invitations.length}
            </strong>
          </div>
          <div className="grid gap-1 pl-3">
            <span className="text-xs text-ink-mute">
              {t("familySummaryShared")}
            </span>
            <strong className="font-display text-2xl text-ink">
              {activeSharedAccess.length}
            </strong>
          </div>
        </div>
      </section>
    );

  return (
    <section className="grid scroll-mt-24 gap-7" id="family-connections">
      <PageHeader
        backdrop="mysore-palace"
        eyebrow={String(connections.length)}
        title={t("familyTitle")}
        description={t("familySubtitle")}
        action={people.length ? (
          <Button
            onClick={() => {
              setAdding((current) => !current);
              setSelectedPersonId(people[0]?.id ?? "");
            }}
            variant="secondary"
          >
            <UserPlus aria-hidden className="size-4" />
            {t("familyAddConnection")}
          </Button>
        ) : undefined}
      />
      <div className="grid grid-cols-3 divide-x divide-paper-line border-y border-paper-line py-5">
        <div className="grid gap-1 pr-4">
          <span className="text-xs text-ink-mute">
            {t("familySummaryConnected")}
          </span>
          <strong className="font-display text-3xl text-ink">
            {connections.length}
          </strong>
        </div>
        <div className="grid gap-1 px-4">
          <span className="text-xs text-ink-mute">
            {t("familySummaryRequests")}
          </span>
          <strong className="font-display text-3xl text-ink">
            {invitations.length}
          </strong>
        </div>
        <div className="grid gap-1 pl-4">
          <span className="text-xs text-ink-mute">
            {t("familySummaryShared")}
          </span>
          <strong className="font-display text-3xl text-ink">
            {activeSharedAccess.length}
          </strong>
        </div>
      </div>
      {feedback ? (
        <p className="text-sm font-semibold text-green-deep" role="status">
          {t(feedback)}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm font-bold text-brick" role="alert">
          {t("sharedSaveError")}
        </p>
      ) : null}
      {adding ? (
        <div className="grid gap-4 rounded-[3px] border border-paper-line bg-panel p-5">
          <div className="grid gap-1">
            <strong className="text-sm text-ink">
              {t("familyAddConnection")}
            </strong>
            <span className="text-xs leading-5 text-ink-mute">
              {t("familyConnectionsIntro")}
            </span>
          </div>
          <label className="grid gap-2 text-sm font-bold text-ink">
            {t("familyChoosePerson")}
            <select
              className="min-h-11 rounded-[2px] border border-paper-line bg-paper px-3 font-normal"
              onChange={(event) => setSelectedPersonId(event.target.value)}
              value={selectedPersonId}
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.attrs.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            {t("familyChooseRelationship")}
            <select
              className="min-h-11 rounded-[2px] border border-paper-line bg-paper px-3 font-normal"
              onChange={(event) =>
                setRelationship(event.target.value as ConnectionRelationship)
              }
              value={relationship}
            >
              {RELATIONSHIPS.map((option) => (
                <option key={option} value={option}>
                  {relationshipLabel(option, t)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button disabled={!selectedPersonId} onClick={invite}>
              {t("familyInvite")}
            </Button>
            <Button onClick={() => setAdding(false)} variant="secondary">
              {t("familyCancel")}
            </Button>
          </div>
        </div>
      ) : null}
      {invitations.length > 0 ? (
        <section className="grid gap-4" id="requests">
          <SectionHeader
            eyebrow={`${invitations.length}`}
            title={t("familyRequestsTitle")}
          />
          <p className="text-sm leading-6 text-ink-mute">
            {t("familyRequestsIntro")}
          </p>
          <div className="border-y border-paper-line">
            {invitations.map((invitation) => {
              const incoming = invitation.attrs.inviteeId === personId;
              const otherId = incoming
                ? invitation.attrs.inviterId
                : invitation.attrs.inviteeId;
              const other = getPerson(graph, otherId);
              return (
                <article
                  className="grid gap-3 border-b border-paper-line py-4 last:border-b-0"
                  key={invitation.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <strong className="text-sm text-ink">
                        {incoming
                          ? t("familyInviteFrom", {
                              name: other?.attrs.name ?? "family member",
                            })
                          : t("familyInviteSentTo", {
                              name: other?.attrs.name ?? "family member",
                            })}
                      </strong>
                      <span className="text-xs text-ink-mute">
                        {t("familyRelationshipLabel")}:{" "}
                        {relationshipLabel(
                          familyRelationship(
                            invitation.attrs.relationship,
                            !incoming,
                          ),
                          t,
                        )}
                      </span>
                    </div>
                    <StatusPill
                      label={
                        incoming
                          ? t("familyInvitationIncoming")
                          : t("familyInvitationSent")
                      }
                      tone={incoming ? "warning" : "info"}
                    />
                  </div>
                  {incoming ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => respond(invitation.id, "accepted")}
                      >
                        <Check aria-hidden className="size-4" />
                        {t("familyAccept")}
                      </Button>
                      <Button
                        onClick={() => respond(invitation.id, "declined")}
                        variant="secondary"
                      >
                        <X aria-hidden className="size-4" />
                        {t("familyDecline")}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs text-ink-mute">
                        {t("familyInvitationPending")}
                      </p>
                      <Button
                        onClick={() => respond(invitation.id, "cancelled")}
                        variant="secondary"
                      >
                        {t("familyCancelInvitation")}
                      </Button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
      <section className="grid gap-4" id="access">
        <SectionHeader
          eyebrow={`${connections.length}`}
          title={t("familyConnectionsSection")}
        />
        <p className="text-sm leading-6 text-ink-mute">
          {t("familyConnectionsSectionIntro")}
        </p>
        {connections.length ? (
          <div>
            {connections.map((connection) => (
              <ConnectionCard
                connection={connection}
                key={connection.person.id}
                personId={personId}
              />
            ))}
          </div>
        ) : (
          <p className="border-y border-paper-line py-5 text-sm text-ink-mute">
            {t("familyNoConnections")}
          </p>
        )}
      </section>
      {sharedAlerts.length ? (
        <section className="grid gap-4" id="shared-alerts">
          <SectionHeader
            eyebrow={`${sharedAlerts.length}`}
            title={t("familySharedAlertsTitle")}
          />
          <p className="text-sm leading-6 text-ink-mute">
            {t("familySharedAlertsIntro")}
          </p>
          <div className="border-y border-paper-line">
            {sharedAlerts.map((alert) => {
              const relationship = relationshipLabel(alert.relationship, t);
              const title = localizeNodeTitle(
                language,
                alert.recordId,
                alert.title,
              );
              return (
                <article
                  className="grid gap-1 border-b border-paper-line py-4 last:border-b-0"
                  key={alert.id}
                >
                  <p className="eyebrow text-indigo-deep">
                    {t("familySharedUpdateLabel")}
                  </p>
                  <h3 className="font-display text-xl font-semibold leading-tight text-ink">
                    {t("familyAlertTitle", {
                      relationship,
                      name: alert.ownerName,
                      title,
                    })}
                  </h3>
                  <p className="text-xs text-ink-mute">
                    {alert.meta}
                    {alert.dueDate
                      ? ` · ${formatDate(alert.dueDate, language)}`
                      : ""}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </section>
  );
}
