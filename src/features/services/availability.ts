import { getApplications, getEmployment, getNotices, getObligations, getOwnedAssets } from "@/features/graph/selectors";
import type { CitizenGraph } from "@/features/graph/schema";

export const connectedWorkflowSlugs = [
  "epfo",
  "marriage",
  "obligations",
  "loan",
  "record-correction",
  "start-business",
] as const;

export type ConnectedWorkflowSlug = (typeof connectedWorkflowSlugs)[number];

export const serviceWorkflowSlugs = [
  ...connectedWorkflowSlugs,
  "property-tax",
  "gstr3b",
  "passport-renewal",
  "refund-track",
] as const;

export type ServiceWorkflowSlug = (typeof serviceWorkflowSlugs)[number];

const deferredBenefitIds: readonly string[] = ["ben:eps-family-pension", "ben:ka-widow-pension"];

export function isBenefitVisibleInDemo(benefitId: string) {
  return !deferredBenefitIds.includes(benefitId);
}

export function getAvailableWorkflows(graph: CitizenGraph, personId: string): ConnectedWorkflowSlug[] {
  const available: ConnectedWorkflowSlug[] = ["start-business"];
  const employment = getEmployment(graph, personId);
  const hasPassbook = employment?.verification.source === "EPFO"
    && Boolean(employment.attrs.uan)
    && employment.attrs.epfBalance !== undefined
    && getNotices(graph, personId).some((notice) => notice.node.attrs.relatedTo === employment.id);
  if (hasPassbook) available.push("epfo");
  if (personId === "person:arjun" || personId === "person:priya") available.push("marriage");
  if (getObligations(graph, personId).some((obligation) => obligation.id === "obl:echallan-500")) available.push("obligations");
  if (getOwnedAssets(graph, personId).some((node) => node.type === "business")) available.push("loan");
  if (
    graph.nodes.some((node) => node.type === "document" && node.verification.state === "mismatch" && graph.edges.some((edge) => edge.type === "holds" && edge.from === personId && edge.to === node.id && edge.status === "active"))
    || getApplications(graph, personId).some((application) => application.attrs.kind === "record-correction" && application.attrs.status !== "completed")
  ) {
    available.push("record-correction");
  }
  return available;
}

const obligationServices: Readonly<Record<string, ServiceWorkflowSlug>> = {
  "obl:bbmp-property-tax": "property-tax",
  "obl:gstr3b-sep": "gstr3b",
  "obl:passport-renewal": "passport-renewal",
  "obl:itr-refund": "refund-track",
};

export function getAvailableServices(graph: CitizenGraph, personId: string): ServiceWorkflowSlug[] {
  const available = new Set<ServiceWorkflowSlug>(getAvailableWorkflows(graph, personId));
  getObligations(graph, personId).forEach((obligation) => {
    const service = obligationServices[obligation.id];
    if (service) available.add(service);
  });
  return serviceWorkflowSlugs.filter((service) => available.has(service));
}
