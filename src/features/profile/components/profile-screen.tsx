"use client";

import { BriefcaseBusiness, Building2, CarFront, FileText, Home, KeyRound, Landmark, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Page, PageHeader, SectionHeader } from "@/components/ui/page";
import { StatusPill, VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import {
  getApplications,
  getDocuments,
  getEmployment,
  getNodeByType,
  getObligations,
  getOwnedAssets,
  getProfileSummary,
  getRelationshipViews,
  type RelationshipView,
} from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle } from "@/i18n/content";
import { getDocumentKindMessageKey, getRelationshipMessageKey, getStatusMessageKey } from "@/i18n/formatters";
import { formatCurrency, formatDate, maskIdentifier } from "@/lib/format";
import { GovernmentHealthCard } from "./government-health";

function AssetRow({ asset }: { asset: ReturnType<typeof getOwnedAssets>[number] }) {
  const { t } = useI18n();
  if (asset.type === "business") {
    return <div className="flex min-h-20 items-center gap-4 border-t border-paper-line py-3"><BriefcaseBusiness aria-hidden className="size-5 shrink-0 text-indigo-deep" /><div className="min-w-0 flex-1"><strong className="block text-sm leading-5 text-ink [overflow-wrap:anywhere]">{asset.attrs.name}</strong><span className="text-xs capitalize text-ink-mute">{asset.attrs.entityType} · {t("fyTurnover", { amount: formatCurrency(asset.attrs.turnoverFY25) })}</span></div><VerificationBadge verification={asset.verification} /></div>;
  }
  if (asset.type === "vehicle") {
    return <div className="flex min-h-20 items-center gap-4 border-t border-paper-line py-3"><CarFront aria-hidden className="size-5 shrink-0 text-ink-mute" /><div className="min-w-0 flex-1"><strong className="block text-sm leading-5 text-ink [overflow-wrap:anywhere]">{asset.attrs.make} {asset.attrs.model}</strong><span className="text-xs text-ink-mute">{maskIdentifier(asset.attrs.regNumber)}</span></div><VerificationBadge verification={asset.verification} /></div>;
  }
  if (asset.type === "property") {
    return <div className="flex min-h-20 items-center gap-4 border-t border-paper-line py-3"><Home aria-hidden className="size-5 shrink-0 text-brick" /><div className="min-w-0 flex-1"><strong className="block text-sm capitalize leading-5 text-ink [overflow-wrap:anywhere]">{asset.attrs.kind}</strong><span className="text-xs text-ink-mute">{asset.attrs.authority} · {formatCurrency(asset.attrs.estimatedValue)}</span></div><VerificationBadge verification={asset.verification} /></div>;
  }
  return null;
}

function RelationshipRow({ view }: { view: RelationshipView }) {
  const { language, t } = useI18n();
  const relationshipKey = getRelationshipMessageKey(view.relationship);
  return (
    <article className="flex min-h-20 items-center gap-4 border-b border-paper-line py-3 last:border-b-0">
      <UserRound aria-hidden className="size-5 shrink-0 text-ink-mute" />
      <div className="min-w-0">
        <strong className="block text-sm leading-5 text-ink [overflow-wrap:anywhere]">{view.person.attrs.name}</strong>
        <span className="text-xs text-ink-mute">{relationshipKey ? t(relationshipKey) : view.relationship}{view.person.attrs.deceasedOn ? ` · ${t("diedOn", { date: formatDate(view.person.attrs.deceasedOn, language) })}` : ""}</span>
      </div>
    </article>
  );
}

function DocumentRow({ document }: { document: ReturnType<typeof getDocuments>[number] }) {
  const { language, t } = useI18n();
  const kindKey = getDocumentKindMessageKey(document.attrs.kind);
  const title = kindKey ? t(kindKey) : localizeNodeTitle(language, document.id, document.attrs.kind.replaceAll("-", " "));
  return <article className="flex min-h-20 items-center gap-4 border-b border-paper-line py-3 last:border-b-0"><FileText aria-hidden className="size-5 shrink-0 text-indigo-deep" /><div className="min-w-0 flex-1"><strong className="block text-sm capitalize leading-5 text-ink [overflow-wrap:anywhere]">{title}</strong><span className="text-xs text-ink-mute">{document.attrs.numberMasked ? maskIdentifier(document.attrs.numberMasked) : document.attrs.holderName} · {formatDate(document.attrs.issuedOn, language)}</span></div><VerificationBadge verification={document.verification} /></article>;
}

function GovernmentRow({ authority, detail, status, title }: { authority: string; detail?: string; status?: string; title: string }) {
  const { t } = useI18n();
  const statusKey = status ? getStatusMessageKey(status) : undefined;
  const complete = status === "completed" || status === "paid" || status === "received";
  return <article className="grid min-h-20 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 border-b border-paper-line py-3 last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]"><Landmark aria-hidden className="size-5 shrink-0 text-indigo-deep" /><div className="min-w-0"><strong className="block text-sm leading-5 text-ink [overflow-wrap:anywhere]">{title}</strong><span className="text-xs leading-5 text-ink-mute">{authority}{detail ? ` · ${detail}` : ""}</span></div><div className="col-start-2 w-fit sm:col-start-3"><StatusPill label={statusKey ? t(statusKey) : status ?? t("pending")} tone={complete ? "success" : status === "due" ? "warning" : "info"} /></div></article>;
}

function DelegationPanel({ personId }: { personId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const delegation = graph.nodes
    .filter((node) => node.type === "delegation")
    .find((node) => node.attrs.delegatorId === personId || node.attrs.delegateId === personId);
  if (!delegation && personId !== "person:sunita") return null;
  const activeDelegation = delegation?.attrs.status === "active";
  const canCreate = personId === "person:sunita" && !activeDelegation;
  const rajesh = getNodeByType(graph, "person:rajesh", "person");
  const familyProperty = getNodeByType(graph, "prop:jpnagar-house", "property");

  const createDelegation = () => {
    const delegationNode: GraphMutation = delegation
      ? { type: "patchAttrs", nodeId: delegation.id, attrs: { status: "active", expiresOn: "2026-11-22" } }
      : {
        type: "addNode",
        node: {
          id: "dlg:sunita-arjun-paperwork",
          type: "delegation",
          attrs: {
            title: "Pension and property paperwork",
            delegateId: "person:arjun",
            delegatorId: "person:sunita",
            scopes: ["pension", "property"],
            expiresOn: "2026-11-22",
            status: "active",
          },
          verification: { source: "Self", state: "self-declared", asOf: "2026-08-28" },
        },
      };
    const mutations: GraphMutation[] = [
      delegationNode,
      {
        type: "addEdge",
        edge: {
          id: `e:arjun-delegateof-sunita:${crypto.randomUUID()}`,
          type: "delegateOf",
          from: "person:arjun",
          to: "person:sunita",
          attrs: { scopes: ["pension", "property"], expiresOn: "2026-11-22" },
          validFrom: "2026-08-28",
          status: "active",
          verification: { source: "Self", state: "self-declared", asOf: "2026-08-28" },
        },
      },
    ];
    commit({ actorId: personId, labelKey: "eventPaperworkDelegated", procedureId: "delegation", mutations });
  };

  const revoke = () => {
    if (!delegation) return;
    const activeEdge = graph.edges.find((edge) => edge.type === "delegateOf" && edge.from === delegation.attrs.delegateId && edge.to === delegation.attrs.delegatorId && edge.status === "active");
    const mutations: GraphMutation[] = [
      { type: "patchAttrs", nodeId: delegation.id, attrs: { status: "revoked" } },
      ...(activeEdge ? [{ type: "endEdge" as const, edgeId: activeEdge.id, validTo: "2026-08-28" }] : []),
    ];
    commit({ actorId: personId, labelKey: "eventPaperworkRevoked", procedureId: "delegation", mutations });
  };

  return (
    <section className="grid gap-5 rounded-[8px] bg-indigo-deep p-6 text-paper">
      <div className="flex items-start justify-between gap-4"><KeyRound aria-hidden className="size-5 text-brick" />{delegation ? <StatusPill label={t(getStatusMessageKey(delegation.attrs.status) ?? "pending")} tone={delegation.attrs.status === "active" ? "success" : "neutral"} /> : null}</div>
      <div className="grid gap-2"><p className="text-xs font-bold uppercase tracking-[0.12em] text-paper/55">{t("delegation")}</p><h2 className="font-display text-3xl font-semibold leading-none">{delegation ? t(activeDelegation ? "delegationActiveTitle" : "delegationEndedTitle") : t("delegationSetupTitle")}</h2><p className="text-xs leading-5 text-paper/72">{delegation ? activeDelegation ? t("delegationActiveBody", { date: formatDate(delegation.attrs.expiresOn, language) }) : t("delegationEndedBody") : t("delegationSetupBody", { date: formatDate("2026-11-22", language) })}</p></div>
      {activeDelegation && personId === "person:arjun" ? <div className="grid divide-y divide-paper/15 border-y border-paper/15 text-xs"><div className="grid gap-1 py-3"><span className="text-paper/60">{rajesh?.attrs.pension?.scheme ?? "EPS-95"}</span><strong className="text-sm text-paper">{t("monthlyAmount", { amount: formatCurrency(rajesh?.attrs.pension?.monthlyAmount ?? 0) })}</strong></div><div className="grid gap-1 py-3"><span className="capitalize text-paper/60">{familyProperty?.attrs.kind ?? t("propertyAndVehicles")}</span><strong className="text-sm text-paper">{rajesh?.attrs.name ?? "Rajesh Sharma"} · {familyProperty?.attrs.authority ?? "BBMP"}</strong></div></div> : null}
      {canCreate ? <Button className="bg-paper text-ink hover:bg-saffron" onClick={createDelegation}>{t("delegationGrantAction")}</Button> : delegation?.attrs.status === "active" && personId === "person:sunita" ? <Button onClick={revoke} variant="inverseQuiet">{t("revoke")}</Button> : null}
    </section>
  );
}

export function ProfileScreen() {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;
  const profile = getProfileSummary(graph, personId);
  if (!profile) return null;
  const relationships = getRelationshipViews(graph, personId);
  const assets = getOwnedAssets(graph, personId);
  const employment = getEmployment(graph, personId);
  const documents = getDocuments(graph, personId);
  const applications = getApplications(graph, personId);
  const obligations = getObligations(graph, personId);

  return (
    <Page className="grid gap-7">
      <PageHeader eyebrow={t("you")} title={profile.person.attrs.name} description={t(profile.documentCount === 1 ? "profileSummaryOne" : "profileSummary", { age: profile.age, place: profile.residence ?? t("addressPending"), count: profile.documentCount })} action={<VerificationBadge verification={profile.person.verification} />} />
      <div className="grid gap-7 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="lg:col-start-2 lg:row-start-1">
          <GovernmentHealthCard personId={personId} />
        </div>
        <div className="grid gap-7 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <section className="grid gap-5"><SectionHeader eyebrow={`${documents.length}`} title={t("documents")} /><div className="border-y border-paper-line">{documents.map((document) => <DocumentRow document={document} key={document.id} />)}</div></section>

          <section className="grid gap-5"><SectionHeader eyebrow={`${relationships.length}`} title={t("relationships")} /><div className="border-y border-paper-line">{relationships.map((view) => <RelationshipRow key={view.person.id} view={view} />)}</div></section>

          <section className="grid gap-5"><SectionHeader title={t("workAndBusiness")} />{employment ? <div className="flex min-h-24 items-center gap-4 border-y border-paper-line py-4"><Building2 aria-hidden className="size-5 shrink-0 text-indigo-deep" /><div className="min-w-0 flex-1"><strong className="block text-sm leading-5 text-ink [overflow-wrap:anywhere]">{employment.attrs.employer}</strong><span className="text-xs text-ink-mute">{employment.attrs.designation} · {employment.attrs.location}</span></div><VerificationBadge verification={employment.verification} /></div> : null}{assets.filter((asset) => asset.type === "business").map((asset) => <AssetRow asset={asset} key={asset.id} />)}</section>

          <section className="grid gap-5"><SectionHeader title={t("propertyAndVehicles")} />{assets.filter((asset) => asset.type !== "business").length ? <div>{assets.filter((asset) => asset.type !== "business").map((asset) => <AssetRow asset={asset} key={asset.id} />)}</div> : <p className="border-y border-paper-line py-6 text-sm text-ink-mute">{t("noPropertyVehicles")}</p>}</section>

          <section className="grid scroll-mt-24 gap-5" id="government-dealings"><SectionHeader eyebrow={`${applications.length + obligations.length}`} title={t("governmentDealings")} /><div className="border-y border-paper-line">{applications.map((application) => <GovernmentRow authority={application.attrs.authority} detail={formatDate(application.attrs.createdOn, language)} key={application.id} status={application.attrs.status} title={localizeNodeTitle(language, application.id, application.attrs.title)} />)}{obligations.map((obligation) => <GovernmentRow authority={obligation.attrs.authority} detail={obligation.attrs.amount !== undefined ? formatCurrency(obligation.attrs.amount) : obligation.attrs.dueDate ? formatDate(obligation.attrs.dueDate, language) : undefined} key={obligation.id} status={obligation.attrs.status ?? "due"} title={localizeNodeTitle(language, obligation.id, obligation.attrs.title)} />)}</div></section>
        </div>
        <div className="grid content-start gap-5 lg:col-start-2 lg:row-start-2">
          <DelegationPanel personId={personId} />
          <div className="grid gap-4 border-y border-paper-line py-5"><div className="flex items-center gap-3"><ShieldCheck aria-hidden className="size-5 text-green-deep" /><strong className="text-sm text-ink">{t("recordHealth")}</strong></div><div className="grid grid-cols-2 gap-4"><div><span className="block text-xs text-ink-mute">{t("verified")}</span><strong className="font-display text-2xl text-ink">{profile.verifiedDocumentCount}/{profile.documentCount}</strong></div><div><span className="block text-xs text-ink-mute">{t("relationships")}</span><strong className="font-display text-2xl text-ink">{relationships.length}</strong></div></div></div>
        </div>
      </div>
    </Page>
  );
}
