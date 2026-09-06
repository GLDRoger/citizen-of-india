"use client";

import { AlertTriangle, ArrowRight, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/button";
import { FilePanel } from "@/components/ui/file-panel";
import { ProvenanceLine, VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getDelegationFor } from "@/features/graph/insights";
import type { CitizenGraph } from "@/features/graph/schema";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency, formatDate } from "@/lib/format";
import { groupLabelKeys, type MapNode } from "./model";

interface Action {
  href: string;
  label: string;
  primary?: boolean;
}

function actionsFor(node: MapNode, t: ReturnType<typeof useI18n>["t"]): Action[] {
  const record = node.node;
  switch (record.type) {
    case "document": {
      const actions: Action[] = [];
      if (record.verification.state === "mismatch") actions.push({ href: "/workflows/record-correction", label: t("resolveMismatch"), primary: true });
      if (record.attrs.kind === "passport") actions.push({ href: "/workflows/passport-renewal", label: t("recordsRenewPassport") });
      actions.push({ href: `/documents#${record.id}`, label: t("recordsViewDocument"), primary: actions.length === 0 });
      return actions;
    }
    case "employment": return [{ href: "/workflows/epfo", label: t("recordsEpfo"), primary: true }];
    case "business": return [{ href: "/workflows/gstr3b", label: t("recordsFileGst"), primary: true }, { href: "/workflows/loan", label: t("recordsCompareLoans") }];
    case "vehicle": return [{ href: "/workflows/obligations", label: t("recordsPayChallan"), primary: true }];
    case "property": return [{ href: "/workflows/property-tax", label: t("recordsPropertyTax"), primary: true }];
    case "address": return [{ href: "/workflows/service-unavailable", label: t("recordsFixMistake"), primary: true }];
    default: return [];
  }
}

function Facts({ node }: { node: MapNode }) {
  const { language, t } = useI18n();
  const record = node.node;
  const rows: Array<[string, string]> = [];
  switch (record.type) {
    case "document":
      rows.push([t("documentIssued", { date: formatDate(record.attrs.issuedOn, language) }), record.attrs.holderName]);
      if (record.attrs.expiresOn) rows.push([t("expiry"), formatDate(record.attrs.expiresOn, language)]);
      break;
    case "person":
      if (record.attrs.deceasedOn) rows.push([t("diedOn", { date: formatDate(record.attrs.deceasedOn, language) }), ""]);
      break;
    case "employment":
      if (record.attrs.since) rows.push([t("recordsSince", { date: formatDate(record.attrs.since, language) }), record.attrs.location]);
      break;
    case "business":
      rows.push([t("fyTurnover", { amount: formatCurrency(record.attrs.turnoverFY25) }), record.attrs.sector]);
      break;
    case "vehicle":
      rows.push([t("recordsSince", { date: formatDate(record.attrs.registeredOn, language) }), record.attrs.rto]);
      break;
    case "property":
      rows.push([formatCurrency(record.attrs.estimatedValue), `${record.attrs.areaSqft} sq ft`]);
      break;
    case "address":
      rows.push([record.attrs.line1, `${record.attrs.city} ${record.attrs.pincode}`]);
      rows.push([t("recordsSince", { date: formatDate(record.attrs.since, language) }), ""]);
      break;
  }
  if (!rows.length) return null;
  return <ul className="grid gap-1 text-sm leading-6 text-ink-mute">{rows.map(([primary, secondary]) => <li key={primary}><span className="text-ink">{primary}</span>{secondary ? ` · ${secondary}` : ""}</li>)}</ul>;
}

export function RecordDetail({ graph, node, personId }: { graph: CitizenGraph; node: MapNode | null; personId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const actorId = useAuthStore((state) => state.actorId);
  const actFor = useAuthStore((state) => state.actFor);

  if (!node) {
    return (
      <FilePanel label={t("recordsDetailEmptyTitle")}>
        <p className="text-sm leading-6 text-ink-mute">{t("recordsDetailEmptyBody")}</p>
      </FilePanel>
    );
  }

  const record = node.node;
  const actions = actionsFor(node, t);
  const linked = node.linkedTo ? graph.nodes.find((candidate) => candidate.id === node.linkedTo) : undefined;
  const linkedName = linked?.type === "business" ? linked.attrs.name : linked?.type === "vehicle" ? `${linked.attrs.make} ${linked.attrs.model}` : linked?.type === "property" ? linked.attrs.kind : undefined;
  const delegation = record.type === "person" && !actorId ? getDelegationFor(graph, personId) : undefined;
  const canActFor = record.type === "person" && Boolean(delegation && delegation.attrs.delegatorId === record.id && !record.attrs.deceasedOn);
  const center = graph.nodes.find((candidate) => candidate.id === personId);
  const mismatch = record.type === "document" && record.verification.state === "mismatch" && center?.type === "person";

  return (
    <FilePanel aside={<VerificationBadge verification={record.verification} />} label={t(groupLabelKeys[node.group])}>
      <div className="grid gap-4">
        <div className="grid gap-1">
          <h3 className="font-display text-2xl font-semibold leading-tight text-ink">{node.title}</h3>
          <p className="text-sm font-bold tracking-wide text-ink-mute">{node.subtitle}</p>
          {linkedName ? <p className="text-xs text-ink-mute">{t("recordsLinkedTo", { name: linkedName })}</p> : null}
        </div>
        <Facts node={node} />
        {mismatch ? <p className="flex gap-2 rounded-[2px] bg-brick-tint px-3 py-3 text-xs leading-5 text-brick"><AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0" />{t("panMismatchExplanation", { aadhaarName: center.attrs.name, panName: record.type === "document" ? record.attrs.holderName : "" })}</p> : null}
        <ProvenanceLine verification={record.verification} />
        {actions.length || canActFor ? (
          <div className="grid gap-2 border-t border-paper-line pt-4">
            {canActFor ? <Button variant="saffron" onClick={() => { actFor(record.id, graph); window.scrollTo(0, 0); router.push("/home"); }}><UsersRound aria-hidden className="size-4" />{t("actFor", { name: record.type === "person" ? record.attrs.name.split(" ")[0] : "" })}</Button> : null}
            {actions.map((action) => <LinkButton href={action.href} key={action.href} variant={action.primary ? "primary" : "secondary"}>{action.label}<ArrowRight aria-hidden className="size-4" /></LinkButton>)}
          </div>
        ) : null}
      </div>
    </FilePanel>
  );
}
