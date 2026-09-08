"use client";

import { BriefcaseBusiness, Building2, CarFront, ChevronRight, FileText, Home, List, ShieldCheck, Waypoints } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Page, PageHeader, SectionHeader } from "@/components/ui/page";
import { VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import {
  getDocuments,
  getEmployment,
  getOwnedAssets,
  getProfileSummary,
  getRelationshipViews,
} from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle } from "@/i18n/content";
import { getDocumentKindMessageKey } from "@/i18n/formatters";
import { formatCurrency, formatDate, maskIdentifier } from "@/lib/format";
import { cn } from "@/lib/cn";
import { buildRecordMap } from "../record-map/model";
import { RecordDetail } from "../record-map/record-detail";
import { RecordMap } from "../record-map/record-map";
import { FamilyConnectionsPanel } from "./family-connections";

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

function DocumentRow({ document }: { document: ReturnType<typeof getDocuments>[number] }) {
  const { language, t } = useI18n();
  const kindKey = getDocumentKindMessageKey(document.attrs.kind);
  const title = kindKey ? t(kindKey) : localizeNodeTitle(language, document.id, document.attrs.kind.replaceAll("-", " "));
  return <Link className="group flex min-h-20 items-center gap-4 border-b border-paper-line py-3 transition-colors last:border-b-0 hover:bg-paper-shade/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-deep" href={`/documents#${document.id}`}><FileText aria-hidden className="size-5 shrink-0 text-indigo-deep" /><div className="min-w-0 flex-1"><strong className="block text-sm capitalize leading-5 text-ink [overflow-wrap:anywhere]">{title}</strong><span className="text-xs text-ink-mute">{document.attrs.numberMasked ? maskIdentifier(document.attrs.numberMasked) : document.attrs.holderName} · {formatDate(document.attrs.issuedOn, language)}</span></div><VerificationBadge verification={document.verification} /><ChevronRight aria-hidden className="size-4 shrink-0 text-ink-mute transition-transform group-hover:translate-x-0.5" /></Link>;
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
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const assets = getOwnedAssets(graph, personId);
  const employment = getEmployment(graph, personId);
  const documents = getDocuments(graph, personId);
  return (
    <>
      <section className="grid gap-5"><SectionHeader eyebrow={`${documents.length}`} title={t("documents")} action={<Link className="text-sm font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href="/documents">{t("recordsAllDocuments")}</Link>} /><div className="border-y border-paper-line">{documents.map((document) => <DocumentRow document={document} key={document.id} />)}</div></section>

      <section className="grid gap-5"><SectionHeader title={t("workAndBusiness")} />{employment ? <div className="flex min-h-24 items-center gap-4 border-y border-paper-line py-4"><Building2 aria-hidden className="size-5 shrink-0 text-indigo-deep" /><div className="min-w-0 flex-1"><strong className="block text-sm leading-5 text-ink [overflow-wrap:anywhere]">{employment.attrs.employer}</strong><span className="text-xs text-ink-mute">{employment.attrs.designation} · {employment.attrs.location}</span></div><VerificationBadge verification={employment.verification} /></div> : null}{assets.filter((asset) => asset.type === "business").map((asset) => <AssetRow asset={asset} key={asset.id} />)}</section>

      <section className="grid gap-5"><SectionHeader title={t("propertyAndVehicles")} />{assets.filter((asset) => asset.type !== "business").length ? <div>{assets.filter((asset) => asset.type !== "business").map((asset) => <AssetRow asset={asset} key={asset.id} />)}</div> : <p className="border-y border-paper-line py-6 text-sm text-ink-mute">{t("noPropertyVehicles")}</p>}</section>

    </>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  useEffect(() => {
    const followLegacyLink = () => {
      if (window.location.hash === "#delegation") router.replace("/family#delegation");
      if (window.location.hash === "#government-dealings") router.replace("/activity");
    };
    followLegacyLink();
    window.addEventListener("hashchange", followLegacyLink);
    return () => window.removeEventListener("hashchange", followLegacyLink);
  }, [router]);
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
        <p className="text-xs leading-5 text-ink-mute">{t("recordsPurpose")}</p>
        {view === "list" && dataSaver && !chosenView ? <p className="text-xs text-ink-mute">{t("recordsListSaver")}</p> : null}
      </div>
      {map ? (
        <div className="grid gap-7 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <RecordMap map={map} onSelect={setSelectedId} selectedId={selectedId} />
          <div className="grid scroll-mt-24 content-start gap-5" ref={detailRef}>
            <RecordDetail graph={graph} node={selected} personId={personId} />
            <FamilyConnectionsPanel compact personId={personId} />
          </div>
        </div>
      ) : (
        <div className="grid gap-7 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="grid content-start gap-7">
            <RecordSections personId={personId} />
          </div>
          <div className="grid content-start gap-5">
            <FamilyConnectionsPanel compact personId={personId} />
            <div className="grid gap-4 border-y border-paper-line py-5"><div className="flex items-center gap-3"><ShieldCheck aria-hidden className="size-5 text-green-deep" /><strong className="text-sm text-ink">{t("recordHealth")}</strong></div><div className="grid grid-cols-2 gap-4"><div><span className="block text-xs text-ink-mute">{t("verified")}</span><strong className="font-display text-2xl text-ink">{profile.verifiedDocumentCount}/{profile.documentCount}</strong></div><div><span className="block text-xs text-ink-mute">{t("relationships")}</span><strong className="font-display text-2xl text-ink">{relationshipCount}</strong></div></div></div>
          </div>
        </div>
      )}
    </Page>
  );
}
