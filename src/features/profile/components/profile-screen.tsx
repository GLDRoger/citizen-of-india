"use client";

import { BriefcaseBusiness, Building2, CarFront, Clock3, Home, KeyRound, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Page, PageHeader, SectionHeader } from "@/components/ui/page";
import { StatusPill, VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import {
  getEmployment,
  getOwnedAssets,
  getProfileSummary,
  getRelationshipViews,
} from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency, formatDate, maskIdentifier } from "@/lib/format";

function AssetRow({ asset }: { asset: ReturnType<typeof getOwnedAssets>[number] }) {
  if (asset.type === "business") {
    return <div className="flex min-h-20 items-center gap-4 border-t border-line py-3"><span className="grid size-10 place-items-center rounded-full bg-action-soft text-action"><BriefcaseBusiness aria-hidden className="size-5" /></span><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-ink">{asset.attrs.name}</strong><span className="text-xs capitalize text-ink-muted">{asset.attrs.entityType} · {formatCurrency(asset.attrs.turnoverFY25)} FY25 turnover</span></div><VerificationBadge verification={asset.verification} /></div>;
  }
  if (asset.type === "vehicle") {
    return <div className="flex min-h-20 items-center gap-4 border-t border-line py-3"><span className="grid size-10 place-items-center rounded-full bg-surface-strong text-ink"><CarFront aria-hidden className="size-5" /></span><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-ink">{asset.attrs.make} {asset.attrs.model}</strong><span className="text-xs text-ink-muted">{maskIdentifier(asset.attrs.regNumber)}</span></div><VerificationBadge verification={asset.verification} /></div>;
  }
  if (asset.type === "property") {
    return <div className="flex min-h-20 items-center gap-4 border-t border-line py-3"><span className="grid size-10 place-items-center rounded-full bg-saffron-soft text-saffron-ink"><Home aria-hidden className="size-5" /></span><div className="min-w-0 flex-1"><strong className="block truncate text-sm capitalize text-ink">{asset.attrs.kind}</strong><span className="text-xs text-ink-muted">{asset.attrs.authority} · {formatCurrency(asset.attrs.estimatedValue)}</span></div><VerificationBadge verification={asset.verification} /></div>;
  }
  return null;
}

function DelegationPanel({ personId }: { personId: string }) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const delegation = graph.nodes
    .filter((node) => node.type === "delegation")
    .find((node) => node.attrs.delegatorId === personId || node.attrs.delegateId === personId);
  if (!delegation && personId !== "person:sunita") return null;
  const canCreate = personId === "person:sunita" && !delegation;

  const createDelegation = () => {
    const mutations: GraphMutation[] = [
      {
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
          verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" },
        },
      },
      {
        type: "addEdge",
        edge: {
          id: "e:arjun-delegateof-sunita",
          type: "delegateOf",
          from: "person:arjun",
          to: "person:sunita",
          attrs: { scopes: ["pension", "property"], expiresOn: "2026-11-22" },
          validFrom: "2026-08-24",
          status: "active",
          verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" },
        },
      },
    ];
    commit({ actorId: personId, label: "Paperwork delegated to Arjun", procedureId: "delegation", mutations });
  };

  const revoke = () => {
    if (!delegation) return;
    const mutations: GraphMutation[] = [
      { type: "patchAttrs", nodeId: delegation.id, attrs: { status: "revoked" } },
      { type: "endEdge", edgeId: "e:arjun-delegateof-sunita", validTo: "2026-08-24" },
    ];
    commit({ actorId: personId, label: "Paperwork delegation revoked", procedureId: "delegation", mutations });
  };

  return (
    <section className="grid gap-5 rounded-[22px] bg-ink p-6 text-canvas">
      <div className="flex items-start justify-between gap-4"><span className="grid size-11 place-items-center rounded-full bg-canvas/10 text-saffron"><KeyRound aria-hidden className="size-5" /></span>{delegation ? <StatusPill label={delegation.attrs.status} tone={delegation.attrs.status === "active" ? "success" : "neutral"} /> : null}</div>
      <div className="grid gap-2"><p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-canvas/50">{t("delegation")}</p><h2 className="font-display text-3xl font-semibold leading-none">{delegation?.attrs.title ?? t("delegatePaperwork")}</h2><p className="text-xs leading-5 text-canvas/65">{delegation ? `${delegation.attrs.scopes.join(" + ")} · expires ${formatDate(delegation.attrs.expiresOn)}` : "Choose a narrow scope, a 90-day expiry, and revoke access at any time."}</p></div>
      {canCreate ? <Button className="bg-canvas text-ink hover:bg-saffron" onClick={createDelegation}>{t("delegatePaperwork")}</Button> : delegation?.attrs.status === "active" && personId === "person:sunita" ? <Button className="border border-canvas/20 text-canvas hover:bg-canvas/10" onClick={revoke} variant="quiet">{t("revoke")}</Button> : null}
    </section>
  );
}

export function ProfileScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;
  const profile = getProfileSummary(graph, personId);
  if (!profile) return null;
  const relationships = getRelationshipViews(graph, personId);
  const assets = getOwnedAssets(graph, personId);
  const employment = getEmployment(graph, personId);

  return (
    <Page className="grid gap-10">
      <PageHeader eyebrow={t("you")} title={profile.person.attrs.name} description={`${profile.age} years · ${profile.residence ?? "Address pending"} · ${profile.documentCount} connected documents`} action={<VerificationBadge verification={profile.person.verification} />} />
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-9">
          <section className="grid gap-5"><SectionHeader eyebrow={`${relationships.length}`} title={t("relationships")} /><div className="grid gap-3 sm:grid-cols-2">{relationships.map(({ person, relationship }) => <article className="flex min-h-28 items-center gap-4 rounded-[18px] border border-line bg-surface p-4" key={person.id}><span className="grid size-11 place-items-center rounded-full bg-surface-strong text-ink"><UserRound aria-hidden className="size-5" /></span><div className="min-w-0"><strong className="block truncate text-sm text-ink">{person.attrs.name}</strong><span className="text-xs capitalize text-ink-muted">{relationship}{person.attrs.deceasedOn ? ` · died ${formatDate(person.attrs.deceasedOn)}` : ""}</span></div></article>)}</div></section>

          <section className="grid gap-5"><SectionHeader title={t("workAndBusiness")} />{employment ? <div className="flex min-h-24 items-center gap-4 border-y border-line py-4"><span className="grid size-11 place-items-center rounded-full bg-action-soft text-action"><Building2 aria-hidden className="size-5" /></span><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-ink">{employment.attrs.employer}</strong><span className="text-xs text-ink-muted">{employment.attrs.designation} · {employment.attrs.location}</span></div><VerificationBadge verification={employment.verification} /></div> : null}{assets.filter((asset) => asset.type === "business").map((asset) => <AssetRow asset={asset} key={asset.id} />)}</section>

          <section className="grid gap-5"><SectionHeader title={t("propertyAndVehicles")} />{assets.filter((asset) => asset.type !== "business").length ? <div>{assets.filter((asset) => asset.type !== "business").map((asset) => <AssetRow asset={asset} key={asset.id} />)}</div> : <p className="border-y border-line py-6 text-sm text-ink-muted">No property or vehicles connected to this citizen.</p>}</section>
        </div>
        <div className="grid content-start gap-5">
          <DelegationPanel personId={personId} />
          <div className="grid gap-4 rounded-[20px] border border-line bg-surface p-5"><div className="flex items-center gap-3"><ShieldCheck aria-hidden className="size-5 text-action" /><strong className="text-sm text-ink">Record health</strong></div><div className="grid grid-cols-2 gap-4"><div><span className="block text-xs text-ink-muted">{t("verified")}</span><strong className="font-display text-2xl text-ink">{profile.verifiedDocumentCount}/{profile.documentCount}</strong></div><div><span className="block text-xs text-ink-muted">{t("relationships")}</span><strong className="font-display text-2xl text-ink">{relationships.length}</strong></div></div><p className="flex items-center gap-2 text-xs text-ink-muted"><UsersRound aria-hidden className="size-4" /> Earlier family relationships stay in your history.</p><p className="flex items-center gap-2 text-xs text-ink-muted"><Clock3 aria-hidden className="size-4" /> Prior versions remain available when records change.</p></div>
        </div>
      </div>
    </Page>
  );
}
