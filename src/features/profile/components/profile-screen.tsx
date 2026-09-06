"use client";

import { BriefcaseBusiness, Building2, CarFront, ChevronRight, FileText, Home, KeyRound, Landmark, List, ShieldCheck, UserRound, UsersRound, Waypoints } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { cn } from "@/lib/cn";
import { buildRecordMap } from "../record-map/model";
import { RecordDetail } from "../record-map/record-detail";
import { RecordMap } from "../record-map/record-map";
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
  return <Link className="group flex min-h-20 items-center gap-4 border-b border-paper-line py-3 transition-colors last:border-b-0 hover:bg-paper-shade/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-deep" href={`/documents#${document.id}`}><FileText aria-hidden className="size-5 shrink-0 text-indigo-deep" /><div className="min-w-0 flex-1"><strong className="block text-sm capitalize leading-5 text-ink [overflow-wrap:anywhere]">{title}</strong><span className="text-xs text-ink-mute">{document.attrs.numberMasked ? maskIdentifier(document.attrs.numberMasked) : document.attrs.holderName} · {formatDate(document.attrs.issuedOn, language)}</span></div><VerificationBadge verification={document.verification} /><ChevronRight aria-hidden className="size-4 shrink-0 text-ink-mute transition-transform group-hover:translate-x-0.5" /></Link>;
}

function GovernmentRow({ authority, detail, status, title }: { authority: string; detail?: string; status?: string; title: string }) {
  const { t } = useI18n();
  const statusKey = status ? getStatusMessageKey(status) : undefined;
  const complete = status === "completed" || status === "paid" || status === "received";
  return <article className="grid min-h-20 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 border-b border-paper-line py-3 last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]"><Landmark aria-hidden className="size-5 shrink-0 text-indigo-deep" /><div className="min-w-0"><strong className="block text-sm leading-5 text-ink [overflow-wrap:anywhere]">{title}</strong><span className="text-xs leading-5 text-ink-mute">{authority}{detail ? ` · ${detail}` : ""}</span></div><div className="col-start-2 w-fit sm:col-start-3"><StatusPill label={statusKey ? t(statusKey) : status ?? t("pending")} tone={complete ? "success" : status === "due" ? "warning" : "info"} /></div></article>;
}

const DELEGATION_ID = "dlg:sunita-arjun-paperwork";
const DELEGATION_EXPIRES = "2026-11-22";
const DELEGATION_SCOPES = ["property", "documents"] as const;
const selfDeclared = { source: "Self", state: "self-declared", asOf: "2026-08-28" } as const;

/**
 * Sunita ↔ Arjun shared access. Arjun can ask; only Sunita can grant or revoke.
 * The delegation node walks requested → active → revoked; nothing is deleted.
 */
function DelegationPanel({ personId }: { personId: string }) {
  const { language, t } = useI18n();
  const actorId = useAuthStore((state) => state.actorId);
  const actFor = useAuthStore((state) => state.actFor);
  const router = useRouter();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const isSunita = personId === "person:sunita";
  const isArjun = personId === "person:arjun";
  const delegation = graph.nodes
    .filter((node) => node.type === "delegation")
    .find((node) => node.attrs.delegatorId === personId || node.attrs.delegateId === personId);
  if (!delegation && !isSunita && !isArjun) return null;
  const status = delegation?.attrs.status;
  const active = status === "active";
  const requested = status === "requested";
  const ended = status === "revoked" || status === "expired";
  const familyProperty = getNodeByType(graph, "prop:jpnagar-house", "property");
  const expires = formatDate(delegation?.attrs.expiresOn ?? DELEGATION_EXPIRES, language);

  const delegationNode = (nextStatus: "requested" | "active"): GraphMutation => delegation
    ? { type: "patchAttrs", nodeId: delegation.id, attrs: { status: nextStatus, expiresOn: DELEGATION_EXPIRES } }
    : {
      type: "addNode",
      node: {
        id: DELEGATION_ID,
        type: "delegation",
        attrs: { title: "Property records and documents", delegateId: "person:arjun", delegatorId: "person:sunita", scopes: [...DELEGATION_SCOPES], expiresOn: DELEGATION_EXPIRES, status: nextStatus },
        verification: selfDeclared,
      },
    };

  const request = () => commit({ actorId: personId, labelKey: "eventAccessRequested", procedureId: "delegation", mutations: [delegationNode("requested")] });

  const grant = () => {
    const mutations: GraphMutation[] = [
      delegationNode("active"),
      {
        type: "addEdge",
        edge: {
          id: `e:arjun-delegateof-sunita:${crypto.randomUUID()}`,
          type: "delegateOf",
          from: "person:arjun",
          to: "person:sunita",
          attrs: { scopes: [...DELEGATION_SCOPES], expiresOn: DELEGATION_EXPIRES },
          validFrom: "2026-08-28",
          status: "active",
          verification: selfDeclared,
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

  const title = active ? t("delegationActiveTitle")
    : requested ? t(isSunita ? "delegationRequestedTitle" : "delegationRequestSentTitle")
    : ended ? t("delegationEndedTitle")
    : t(isSunita ? "delegationSetupTitle" : "delegationRequestAction");
  const body = active ? t("delegationActiveBody", { date: expires })
    : requested ? t(isSunita ? "delegationRequestedBody" : "delegationRequestSentBody", { date: expires })
    : ended ? t("delegationEndedBody")
    : isSunita ? t("delegationSetupBody", { date: expires })
    : t("delegationRequestHint");

  const action = actorId && isSunita
    ? <p className="border-l-2 border-saffron pl-3 text-xs leading-5 text-paper/80">{t("actingNotDelegable", { name: "Sunita" })}</p>
    : isSunita && !active ? <Button onClick={grant} variant="inverse">{t("delegationGrantAction")}</Button>
    : isSunita && active ? <Button onClick={revoke} variant="inverseQuiet">{t("revoke")}</Button>
    : isArjun && active && !actorId ? <Button onClick={() => { actFor("person:sunita", graph); window.scrollTo(0, 0); router.push("/home"); }} variant="saffron"><UsersRound aria-hidden className="size-4" />{t("actFor", { name: "Sunita" })}</Button>
    : isArjun && !active && !requested && !actorId ? <Button onClick={request} variant="inverse">{t("delegationRequestAction")}</Button>
    : null;

  return (
    <section className="grid scroll-mt-20 gap-5 rounded-[3px] bg-indigo-deep p-6 text-paper" id="delegation">
      <div className="flex items-start justify-between gap-4"><KeyRound aria-hidden className="size-5 text-saffron" />{delegation ? <StatusPill label={t(getStatusMessageKey(delegation.attrs.status) ?? "pending")} tone={active ? "success" : requested ? "info" : "neutral"} /> : null}</div>
      <div className="grid gap-2"><p className="text-xs font-bold uppercase tracking-[0.12em] text-paper/55">{t("delegation")}</p><h2 className="font-display text-3xl font-semibold leading-none">{title}</h2><p className="text-xs leading-5 text-paper/72">{body}</p></div>
      {active && isArjun ? <div className="grid divide-y divide-paper/15 border-y border-paper/15 text-xs"><div className="grid gap-1 py-3"><span className="capitalize text-paper/60">{familyProperty?.attrs.kind ?? t("propertyAndVehicles")}</span><strong className="text-sm text-paper">{familyProperty?.attrs.authority ?? "BBMP"} · {familyProperty?.attrs.khataNumber ?? ""}</strong></div></div> : null}
      {action}
    </section>
  );
}

type RecordView = "map" | "list";

function ViewToggle({ onChange, view }: { onChange: (view: RecordView) => void; view: RecordView }) {
  const { t } = useI18n();
  const options: Array<[RecordView, string, typeof Waypoints]> = [["map", t("recordsMap"), Waypoints], ["list", t("recordsList"), List]];
  return (
    <div aria-label={t("recordsViewLabel")} className="inline-flex rounded-[2px] border border-paper-line bg-panel p-0.5" role="group">
      {options.map(([value, label, Icon]) => (
        <button aria-pressed={view === value} className={cn("inline-flex min-h-10 items-center gap-2 rounded-[2px] px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-deep", view === value ? "bg-ink text-paper" : "text-ink-mute hover:text-ink")} key={value} onClick={() => onChange(value)} type="button"><Icon aria-hidden className="size-4" />{label}</button>
      ))}
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function RecordSections({ personId }: { personId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const relationships = getRelationshipViews(graph, personId);
  const assets = getOwnedAssets(graph, personId);
  const employment = getEmployment(graph, personId);
  const documents = getDocuments(graph, personId);
  const applications = getApplications(graph, personId);
  const obligations = getObligations(graph, personId);
  return (
    <>
      <section className="grid gap-5"><SectionHeader eyebrow={`${documents.length}`} title={t("documents")} action={<Link className="text-sm font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href="/documents">{t("recordsAllDocuments")}</Link>} /><div className="border-y border-paper-line">{documents.map((document) => <DocumentRow document={document} key={document.id} />)}</div></section>

      <section className="grid gap-5"><SectionHeader eyebrow={`${relationships.length}`} title={t("relationships")} /><div className="border-y border-paper-line">{relationships.map((view) => <RelationshipRow key={view.person.id} view={view} />)}</div></section>

      <section className="grid gap-5"><SectionHeader title={t("workAndBusiness")} />{employment ? <div className="flex min-h-24 items-center gap-4 border-y border-paper-line py-4"><Building2 aria-hidden className="size-5 shrink-0 text-indigo-deep" /><div className="min-w-0 flex-1"><strong className="block text-sm leading-5 text-ink [overflow-wrap:anywhere]">{employment.attrs.employer}</strong><span className="text-xs text-ink-mute">{employment.attrs.designation} · {employment.attrs.location}</span></div><VerificationBadge verification={employment.verification} /></div> : null}{assets.filter((asset) => asset.type === "business").map((asset) => <AssetRow asset={asset} key={asset.id} />)}</section>

      <section className="grid gap-5"><SectionHeader title={t("propertyAndVehicles")} />{assets.filter((asset) => asset.type !== "business").length ? <div>{assets.filter((asset) => asset.type !== "business").map((asset) => <AssetRow asset={asset} key={asset.id} />)}</div> : <p className="border-y border-paper-line py-6 text-sm text-ink-mute">{t("noPropertyVehicles")}</p>}</section>

      <section className="grid scroll-mt-24 gap-5" id="government-dealings"><SectionHeader eyebrow={`${applications.length + obligations.length}`} title={t("governmentDealings")} /><div className="border-y border-paper-line">{applications.map((application) => <GovernmentRow authority={application.attrs.authority} detail={formatDate(application.attrs.createdOn, language)} key={application.id} status={application.attrs.status} title={localizeNodeTitle(language, application.id, application.attrs.title)} />)}{obligations.map((obligation) => <GovernmentRow authority={obligation.attrs.authority} detail={obligation.attrs.amount !== undefined ? formatCurrency(obligation.attrs.amount) : obligation.attrs.dueDate ? formatDate(obligation.attrs.dueDate, language) : undefined} key={obligation.id} status={obligation.attrs.status ?? "due"} title={localizeNodeTitle(language, obligation.id, obligation.attrs.title)} />)}</div></section>
    </>
  );
}

export function ProfileScreen() {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const dataSaver = useAuthStore((state) => state.dataSaver);
  const graph = useCitizenStore((state) => state.graph);
  const reducedMotion = usePrefersReducedMotion();
  const [chosenView, setChosenView] = useState<RecordView | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // On one-column layouts the detail card sits under the map; bring it into view after a tap.
    if (selectedId && window.innerWidth < 1024) detailRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, [selectedId, reducedMotion]);
  if (!personId) return null;
  const profile = getProfileSummary(graph, personId);
  if (!profile) return null;
  const view: RecordView = chosenView ?? "list";
  const map = view === "map" ? buildRecordMap(graph, personId, language, t) : undefined;
  const selected = map?.nodes.find((node) => node.id === selectedId) ?? null;
  const relationshipCount = getRelationshipViews(graph, personId).length;

  return (
    <Page className="grid gap-7">
      <PageHeader backdrop="vidhana-soudha" eyebrow={t("you")} title={profile.person.attrs.name} description={t(profile.documentCount === 1 ? "profileSummaryOne" : "profileSummary", { age: profile.age, place: profile.residence ?? t("addressPending"), count: profile.documentCount })} action={<VerificationBadge verification={profile.person.verification} />} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewToggle onChange={setChosenView} view={view} />
        <p className="text-xs leading-5 text-ink-mute">{t("recordsMapOptional")}</p>
        {view === "list" && dataSaver && !chosenView ? <p className="text-xs text-ink-mute">{t("recordsListSaver")}</p> : null}
      </div>
      {map ? (
        <div className="grid gap-7 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <RecordMap map={map} onSelect={setSelectedId} selectedId={selectedId} />
          <div className="grid scroll-mt-24 content-start gap-5" ref={detailRef}>
            <RecordDetail graph={graph} node={selected} personId={personId} />
            <GovernmentHealthCard personId={personId} />
            <DelegationPanel personId={personId} />
          </div>
        </div>
      ) : (
        <div className="grid gap-7 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="order-2 lg:order-none lg:col-start-2 lg:row-start-1">
            <GovernmentHealthCard personId={personId} />
          </div>
          <div className="order-1 grid gap-7 lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <RecordSections personId={personId} />
          </div>
          <div className="order-3 grid content-start gap-5 lg:order-none lg:col-start-2 lg:row-start-2">
            <DelegationPanel personId={personId} />
            <div className="grid gap-4 border-y border-paper-line py-5"><div className="flex items-center gap-3"><ShieldCheck aria-hidden className="size-5 text-green-deep" /><strong className="text-sm text-ink">{t("recordHealth")}</strong></div><div className="grid grid-cols-2 gap-4"><div><span className="block text-xs text-ink-mute">{t("verified")}</span><strong className="font-display text-2xl text-ink">{profile.verifiedDocumentCount}/{profile.documentCount}</strong></div><div><span className="block text-xs text-ink-mute">{t("relationships")}</span><strong className="font-display text-2xl text-ink">{relationshipCount}</strong></div></div></div>
          </div>
        </div>
      )}
    </Page>
  );
}
