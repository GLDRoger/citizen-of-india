import type { Language, MessageKey } from "@/i18n/messages";
import { localizeNodeTitle } from "@/i18n/content";
import { getDocumentKindMessageKey, getRelationshipMessageKey } from "@/i18n/formatters";
import type { CitizenGraph, GraphNode } from "@/features/graph/schema";
import { getDocuments, getEmployment, getOwnedAssets, getPerson, getRelationshipViews } from "@/features/graph/selectors";
import { formatDate, maskIdentifier } from "@/lib/format";

export type MapGroup = "identity" | "family" | "work" | "assets";

export interface MapNode {
  id: string;
  group: MapGroup;
  node: GraphNode;
  title: string;
  subtitle: string;
  /** Another record on the map this one describes, e.g. an RC to its vehicle. */
  linkedTo?: string;
  x: number;
  y: number;
}

export interface RecordMap {
  center: Extract<GraphNode, { type: "person" }>;
  nodes: MapNode[];
  groups: Record<MapGroup, number>;
}

type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

export const groupOrder: readonly MapGroup[] = ["identity", "family", "work", "assets"];
export const groupLabelKeys: Record<MapGroup, MessageKey> = {
  identity: "recordsGroupIdentity",
  family: "recordsGroupFamily",
  work: "recordsGroupWork",
  assets: "recordsGroupAssets",
};

/** Spiral geometry in CSS pixels. The map pans, so this never has to fit the viewport. */
const INNER_RADIUS = 120;
const RADIUS_STEP = 11;
const TURNS = 1.55;

/**
 * Lay the records along an Archimedean spiral so each group owns a contiguous
 * arc. Adjacent nodes stay at least ~80px apart at the inner turn, and the
 * turns sit ~90px apart radially, so labels never collide.
 */
function placeOnSpiral(nodes: Omit<MapNode, "x" | "y">[]): MapNode[] {
  const count = Math.max(nodes.length, 1);
  const step = (Math.PI * 2 * TURNS) / count;
  return nodes.map((node, index) => {
    const angle = -Math.PI / 2 + index * step;
    const radius = INNER_RADIUS + index * RADIUS_STEP * (14 / count);
    return { ...node, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });
}

export function spiralPath(nodes: MapNode[]) {
  if (nodes.length < 2) return "";
  return nodes.map((node, index) => `${index === 0 ? "M" : "L"}${node.x.toFixed(1)} ${node.y.toFixed(1)}`).join(" ");
}

export function buildRecordMap(graph: CitizenGraph, personId: string, language: Language, t: Translate): RecordMap | undefined {
  const center = getPerson(graph, personId);
  if (!center) return undefined;

  const documents = getDocuments(graph, personId);
  const relationships = getRelationshipViews(graph, personId);
  const employment = getEmployment(graph, personId);
  const assets = getOwnedAssets(graph, personId);
  const addressId = graph.edges.find((edge) => edge.from === personId && edge.type === "residesAt" && edge.status === "active")?.to;
  const address = addressId ? graph.nodes.find((node) => node.id === addressId && node.type === "address") : undefined;

  const documentNodes = documents.map((document): Omit<MapNode, "x" | "y"> => {
    const kindKey = getDocumentKindMessageKey(document.attrs.kind);
    const title = kindKey ? t(kindKey) : localizeNodeTitle(language, document.id, document.attrs.kind.replaceAll("-", " "));
    const linkedTo = document.attrs.businessId ?? document.attrs.vehicleId ?? document.attrs.propertyId;
    const group: MapGroup = document.attrs.businessId ? "work" : document.attrs.vehicleId || document.attrs.propertyId ? "assets" : "identity";
    return {
      id: document.id,
      group,
      node: document,
      title,
      subtitle: document.attrs.numberMasked ? maskIdentifier(document.attrs.numberMasked) : formatDate(document.attrs.issuedOn, language),
      linkedTo,
    };
  });

  const familyNodes = relationships.map((view): Omit<MapNode, "x" | "y"> => {
    const key = getRelationshipMessageKey(view.relationship);
    return { id: view.person.id, group: "family", node: view.person, title: view.person.attrs.name, subtitle: key ? t(key) : view.relationship };
  });

  const workNodes: Omit<MapNode, "x" | "y">[] = [];
  if (employment) workNodes.push({ id: employment.id, group: "work", node: employment, title: employment.attrs.employer, subtitle: employment.attrs.designation });
  for (const asset of assets) {
    if (asset.type === "business") workNodes.push({ id: asset.id, group: "work", node: asset, title: asset.attrs.name, subtitle: asset.attrs.entityType });
  }

  const assetNodes: Omit<MapNode, "x" | "y">[] = [];
  for (const asset of assets) {
    if (asset.type === "vehicle") assetNodes.push({ id: asset.id, group: "assets", node: asset, title: `${asset.attrs.make} ${asset.attrs.model}`, subtitle: maskIdentifier(asset.attrs.regNumber) });
    if (asset.type === "property") assetNodes.push({ id: asset.id, group: "assets", node: asset, title: asset.attrs.kind, subtitle: asset.attrs.authority });
  }
  if (address && address.type === "address") assetNodes.push({ id: address.id, group: "assets", node: address, title: address.attrs.city, subtitle: address.attrs.pincode });

  const byGroup: Record<MapGroup, Omit<MapNode, "x" | "y">[]> = { identity: [], family: familyNodes, work: workNodes, assets: assetNodes };
  for (const node of documentNodes) byGroup[node.group].push(node);
  // Keep a document next to the thing it describes, so the short link edge reads at a glance.
  for (const group of ["work", "assets"] as const) {
    byGroup[group].sort((a, b) => (a.linkedTo ?? a.id).localeCompare(b.linkedTo ?? b.id) || (a.linkedTo ? 1 : 0) - (b.linkedTo ? 1 : 0));
  }

  const ordered = groupOrder.flatMap((group) => byGroup[group]);
  const nodes = placeOnSpiral(ordered);
  const groups = { identity: byGroup.identity.length, family: byGroup.family.length, work: byGroup.work.length, assets: byGroup.assets.length };
  return { center, nodes, groups };
}
