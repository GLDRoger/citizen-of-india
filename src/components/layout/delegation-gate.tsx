"use client";

import { Fragment, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/button";
import { Page, PageHeader } from "@/components/ui/page";
import { ProvenanceLine } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { delegatedScopes, getActiveDelegation } from "@/features/graph/delegation";
import { getFamilySharedAlerts } from "@/features/graph/family";
import { getOwnedAssets } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { localizeNodeTitle } from "@/i18n/content";
import { getRelationshipMessageKey } from "@/i18n/formatters";
import { useI18n } from "@/i18n/use-i18n";

/** A delegated session never mounts the unrestricted citizen workspace, including on direct URLs. */
export function DelegationGate({ children }: { children: ReactNode }) {
  const { language, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { actorId, personId, stopActing } = useAuthStore();
  const graph = useCitizenStore((state) => state.graph);
  if (!actorId || !personId) return <Fragment key={personId}>{children}</Fragment>;
  const permission = getActiveDelegation(graph, actorId, personId);
  const scopes = delegatedScopes(graph, actorId, personId);
  if (permission && scopes.includes("documents") && pathname === "/documents") return children;
  const outsideScope = pathname !== "/home" && pathname !== "/you";
  const properties = scopes.includes("property") ? getOwnedAssets(graph, personId).filter((node) => node.type === "property") : [];
  const sharedAlerts = permission && actorId
    ? getFamilySharedAlerts(graph, actorId).filter((alert) => alert.ownerId === personId)
    : [];
  return (
    <Page className="grid gap-7">
      <PageHeader title={t("sharedRecordTitle")} description={t("sharedRecordBody")} />
      {!permission || outsideScope ? <p className="border-l-4 border-brick bg-brick-tint p-4 text-sm text-brick" role="status">{t(!permission ? "sharedExpired" : "sharedUnavailable")}</p> : null}
      {permission ? <>
        {scopes.includes("documents") ? <div><LinkButton href="/documents">{t("sharedDocuments")}</LinkButton></div> : null}
        {properties.length ? <section className="grid gap-4"><h2 className="font-display text-2xl font-semibold">{t("sharedProperty")}</h2>{properties.map((property) => <article className="grid gap-3 border-y border-paper-line py-5" key={property.id}><h3 className="text-lg font-bold">{property.attrs.authority} · {property.attrs.khataNumber}</h3><ProvenanceLine verification={property.verification} /></article>)}</section> : null}
        {sharedAlerts.length ? <section className="grid gap-4"><h2 className="font-display text-2xl font-semibold">{t("familySharedAlertsTitle")}</h2><p className="text-sm leading-6 text-ink-mute">{t("familySharedAlertsIntro")}</p><div className="border-y border-paper-line">{sharedAlerts.map((alert) => { const relationshipKey = getRelationshipMessageKey(alert.relationship); const relationship = relationshipKey ? t(relationshipKey) : alert.relationship; const title = localizeNodeTitle(language, alert.relatedTo ?? alert.id, alert.title); return <article className="grid gap-1 border-b border-paper-line py-4 last:border-b-0" key={alert.id}><p className="eyebrow text-indigo-deep">{t("familySharedUpdateLabel")}</p><h3 className="font-display text-xl font-semibold leading-tight text-ink">{t("familyAlertTitle", { relationship, name: alert.ownerName, title })}</h3><p className="text-xs text-ink-mute">{alert.meta}</p></article>; })}</div></section> : null}
        <p className="text-sm leading-6 text-ink-mute">{t("sharedReadOnly")}</p>
      </> : null}
      <div><Button onClick={() => { stopActing(); router.push("/home"); }} variant="secondary">{t("actingStop")}</Button></div>
    </Page>
  );
}
