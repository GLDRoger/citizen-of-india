"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { useCitizenStore } from "@/features/graph/store";
import { seedLogins } from "@/features/graph/seed";
import { getPerson, type RelationshipView } from "@/features/graph/selectors";
import {
  getFamilyAccess,
  familySharingScopes,
  type FamilySharingScope,
} from "@/features/graph/family";
import { shareFamily, revokeFamily } from "@/features/graph/family-procedures";
import {
  LEGACY_DELEGATION_ID,
  type Delegation,
} from "@/features/graph/delegation";
import { getRelationshipMessageKey } from "@/i18n/formatters";
import { useI18n } from "@/i18n/use-i18n";
import { formatDate } from "@/lib/format";

const scopeLabels = {
  documents: "familyPermissionDocuments",
  property: "familyPermissionProperty",
  pension: "familyPermissionPension",
  tax: "familyPermissionTax",
} as const;

function SharingControls({
  personId,
  recipientId,
  existing,
  onRevoked,
}: {
  personId: string;
  recipientId: string;
  existing?: Delegation;
  onRevoked: () => void;
}) {
  const { language, t } = useI18n();
  const [scopes, setScopes] = useState<FamilySharingScope[]>(
    existing?.attrs.scopes ?? [],
  );
  const [error, setError] = useState(false);
  const save = (revoke = false) => {
    const { graph, commit } = useCitizenStore.getState();
    try {
      const mutations =
        revoke && existing
          ? revokeFamily(graph, personId, existing.id)
          : shareFamily(graph, personId, recipientId, scopes);
      commit({
        actorId: personId,
        labelKey: revoke
          ? "eventAuthorisedUpdatesRevoked"
          : "eventAuthorisedUpdatesShared",
        procedureId: "family-sharing",
        mutations,
      });
      setError(false);
      if (revoke) {
        setScopes([]);
        onRevoked();
      }
    } catch {
      setError(true);
    }
  };
  return (
    <div className="grid gap-4 bg-paper p-4">
      <div className="flex items-start gap-3">
        <KeyRound
          aria-hidden
          className="mt-1 size-4 shrink-0 text-indigo-deep"
        />
        <p className="text-sm leading-6 text-ink-mute">
          {t("familySharingIntro")}
        </p>
      </div>
      <fieldset className="grid gap-1">
        <legend className="mb-2 text-sm font-bold text-ink">
          {t("familyChoosePermissions")}
        </legend>
        {familySharingScopes.map((scope) => (
          <label
            className="flex min-h-11 items-center gap-3 text-sm text-ink"
            key={scope}
          >
            <input
              checked={scopes.includes(scope)}
              className="size-4 accent-indigo-deep"
              onChange={() => {
                setError(false);
                setScopes((current) =>
                  current.includes(scope)
                    ? current.filter((value) => value !== scope)
                    : [...current, scope],
                );
              }}
              type="checkbox"
            />
            {t(scopeLabels[scope])}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={
            !scopes.length ||
            Boolean(
              existing &&
              [...scopes].sort().join() ===
                [...existing.attrs.scopes].sort().join(),
            )
          }
          onClick={() => save()}
        >
          {existing ? t("familyUpdateSharing") : t("familyShareUpdates")}
        </Button>
        {existing ? (
          <Button onClick={() => save(true)} variant="secondary">
            {t("familyRevokeSharing")}
          </Button>
        ) : null}
      </div>
      {existing ? (
        <p className="text-xs leading-5 text-ink-mute" role="status">
          {t("familySharingActive")} ·{" "}
          {t("familySharingExpiry", {
            date: formatDate(existing.attrs.expiresOn, language),
          })}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm font-bold text-brick" role="alert">
          {t("sharedSaveError")}
        </p>
      ) : null}
    </div>
  );
}

function IncomingAccessCard({ delegation }: { delegation: Delegation }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const router = useRouter();
  const owner = getPerson(graph, delegation.attrs.delegatorId);
  if (!owner) return null;
  return (
    <div className="grid gap-3 bg-indigo-tint p-4">
      <div className="flex items-start gap-3">
        <UsersRound
          aria-hidden
          className="mt-1 size-4 shrink-0 text-indigo-deep"
        />
        <div>
          <strong className="text-sm text-ink">
            {t("familyAccessSharedWithYou")}
          </strong>
          <p className="mt-1 text-xs leading-5 text-ink-mute">
            {t("familySharedBy", { name: owner.attrs.name })}
          </p>
        </div>
      </div>
      <p className="text-sm font-bold text-ink">
        {delegation.attrs.scopes
          .map((scope) => t(scopeLabels[scope]))
          .join(" · ")}
      </p>
      <p className="text-xs text-ink-mute">
        {t("familySharingExpiry", {
          date: formatDate(delegation.attrs.expiresOn, language),
        })}
      </p>
      <div>
        <Button
          onClick={() => {
            useAuthStore
              .getState()
              .actFor(owner.id, useCitizenStore.getState().graph);
            router.push("/home");
          }}
          variant="secondary"
        >
          {t("familyOpenSharedView")}
        </Button>
      </div>
      <p className="text-xs leading-5 text-ink-mute">
        {t("familySharedViewHint")}
      </p>
    </div>
  );
}

export function ConnectionCard({
  personId,
  connection,
}: {
  personId: string;
  connection: RelationshipView;
}) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const summaryRef = useRef<HTMLElement>(null);
  const [revoked, setRevoked] = useState(false);
  const access = getFamilyAccess(graph, personId);
  const incoming = access.incoming.filter(
    ({ delegation }) => delegation.attrs.delegatorId === connection.person.id,
  );
  const outgoing = access.outgoing.find(
    ({ delegation }) => delegation.attrs.delegateId === connection.person.id,
  )?.delegation;
  const relationshipKey = getRelationshipMessageKey(connection.relationship);
  const interactive = seedLogins.some(
    (login) => login.personId === connection.person.id,
  );
  const legacy =
    outgoing?.id === LEGACY_DELEGATION_ID ||
    (personId === "person:sunita" && connection.person.id === "person:arjun");
  return (
    <article className="grid gap-4 border-b border-paper-line py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-semibold leading-tight text-ink">
            {connection.person.attrs.name}
          </h3>
          <p className="mt-1 text-sm text-ink-mute">
            {relationshipKey ? t(relationshipKey) : connection.relationship}
          </p>
        </div>
        {incoming.length || outgoing ? (
          <StatusPill label={t("familyAccessSection")} tone="info" />
        ) : null}
      </div>
      {!interactive ? (
        <p className="text-xs leading-5 text-ink-mute">
          {t("familyUnavailableProfile")}
        </p>
      ) : (
        <details
          className="group rounded-[3px] border border-paper-line"
          open={Boolean(incoming.length || outgoing)}
        >
          <summary
            ref={summaryRef}
            className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-4 text-sm font-bold text-indigo-deep focus-visible:outline-2 focus-visible:outline-indigo-deep"
          >
            <span>
              {incoming.length
                ? t("familyAccessSharedWithYou")
                : outgoing
                  ? t("familyManageSharing")
                  : t("familyShareRecords")}
            </span>
            <span aria-hidden className="text-lg group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="grid gap-3 border-t border-paper-line p-3">
            {incoming.map(({ delegation }) => (
              <IncomingAccessCard delegation={delegation} key={delegation.id} />
            ))}
            {legacy ? (
              <div className="grid gap-2 p-4 text-sm leading-6 text-ink-mute">
                <p>{t("familyExistingAccess")}</p>
                <Link
                  className="min-h-11 content-center font-bold text-indigo-deep underline underline-offset-4"
                  href="/you#delegation"
                >
                  {t("familyManageLegacy")}
                </Link>
              </div>
            ) : (
              <SharingControls
                existing={outgoing}
                onRevoked={() => {
                  setRevoked(true);
                  summaryRef.current?.focus();
                }}
                key={`${personId}:${connection.person.id}`}
                personId={personId}
                recipientId={connection.person.id}
              />
            )}
          </div>
        </details>
      )}
      {revoked && !outgoing ? (
        <p className="text-sm font-semibold text-green-deep" role="status">
          {t("familySharingRevoked")}
        </p>
      ) : null}
    </article>
  );
}
