import { getApplicationOwnership, getObligationOwnership, summarizeOwnership } from "./ownership";
import seedJson from "@/data/seed.json";
import { createSeedGraph } from "./seed";
import { getApplications, getNotices, getObligations, getThingsToDo } from "./selectors";
import type { GraphEdge, NodeType } from "./schema";

/**
 * Facts about Arjun's seeded record, computed once for the public pages. The
 * landing and manifesto describe the record; the numbers they print must come
 * from the same seed the app runs on, never from copy.
 */
const graph = createSeedGraph();
const activeEdges = graph.edges.filter((edge) => edge.status === "active");
const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));

export const arjunEdges = activeEdges.filter((edge) => edge.from === "person:arjun");

export function countArjunLinks(edgeType: GraphEdge["type"], nodeType: NodeType) {
  return arjunEdges.filter((edge) => edge.type === edgeType && nodesById.get(edge.to)?.type === nodeType).length;
}

export const arjunParentIds = arjunEdges.filter((edge) => edge.type === "childOf").map((edge) => edge.to);

export const familyPropertyCount = new Set(activeEdges.filter((edge) => (
  edge.type === "owns" && arjunParentIds.includes(edge.from) && nodesById.get(edge.to)?.type === "property"
)).map((edge) => edge.to)).size;

export const arjunMoneyDue = graph.nodes.reduce((sum, node) => (
  node.type === "obligation"
  && node.attrs.direction === "payable"
  && !["paid", "completed"].includes(node.attrs.status ?? "")
  && arjunEdges.some((edge) => edge.to === node.id)
    ? sum + (node.attrs.amount ?? 0)
    : sum
), 0);

const challan = graph.nodes.find((node) => node.id === "obl:echallan-500");
export const challanAmount = challan?.type === "obligation" ? challan.attrs.amount ?? 0 : 0;

const arjun = graph.nodes.find((node) => node.id === "person:arjun");
const arjunHome = graph.nodes.find((node) => node.id === "addr:jpnagar");
const arjunDocs = new Map(graph.nodes.filter((node) => node.type === "document" && arjunEdges.some((edge) => edge.type === "holds" && edge.to === node.id)).map((node) => [node.type === "document" ? node.attrs.kind : "", node]));

function maskedNumber(kind: string) {
  const document = arjunDocs.get(kind);
  return document?.type === "document" ? document.attrs.numberMasked ?? "" : "";
}

/** Identity facts printed on the citizen file object. */
export const arjunFile = {
  name: arjun?.type === "person" ? arjun.attrs.name : "Arjun Sharma",
  dob: arjun?.type === "person" ? arjun.attrs.dob : "1997-03-14",
  city: arjunHome?.type === "address" ? arjunHome.attrs.city : "Bengaluru",
  locality: arjunHome?.type === "address" ? arjunHome.attrs.line1.split(", ").at(-1) ?? "" : "",
  aadhaar: maskedNumber("aadhaar"),
  pan: maskedNumber("pan"),
  passport: maskedNumber("passport"),
  docketNumber: maskedNumber("aadhaar").slice(-4),
};

/** "Where things stand" for Arjun, as Home computes it, for the brief preview on the landing page. */
export const arjunStand = {
  ...summarizeOwnership([
    ...getObligations(graph, "person:arjun").map((node) => getObligationOwnership(node)),
    ...getApplications(graph, "person:arjun").map((node) => getApplicationOwnership(graph, node, "person:arjun")),
  ]),
  unread: getNotices(graph, "person:arjun").filter((notice) => !notice.read).length,
};

/** The first tasks Home would list for Arjun. */
export const arjunTasks = getThingsToDo(graph, "person:arjun").slice(0, 3);

/** The fictional sign-ins listed on the About page. */
export const demoLogins = seedJson.logins as Array<{ label: string; personId: string; phone: string }>;
