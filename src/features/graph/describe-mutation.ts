import type { MessageKey } from "@/i18n/messages";
import type { CitizenGraph, GraphEvent, GraphMutation, NodeType, Verification } from "./schema";

type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

const nodeTypeKeys: Record<NodeType, MessageKey> = {
  address: "mutationNodeAddress",
  application: "mutationNodeApplication",
  benefit: "mutationNodeBenefit",
  business: "mutationNodeBusiness",
  delegation: "mutationNodeDelegation",
  document: "mutationNodeDocument",
  employment: "mutationNodeEmployment",
  notice: "mutationNodeNotice",
  obligation: "mutationNodeObligation",
  person: "mutationNodePerson",
  property: "mutationNodeProperty",
  vehicle: "mutationNodeVehicle",
};

const fieldKeys: Record<string, MessageKey> = {
  amountPaid: "mutationFieldAmountPaid",
  appointmentOn: "mutationFieldAppointment",
  currentStep: "mutationFieldProgress",
  deceasedOn: "mutationFieldLifeStatus",
  downloaded: "mutationFieldSavedCopy",
  holderName: "mutationFieldHolder",
  maritalStatus: "mutationFieldMaritalStatus",
  note: "mutationFieldNote",
  pension: "mutationFieldPension",
  read: "mutationFieldReadStatus",
  reference: "mutationFieldReference",
  status: "mutationFieldStatus",
  submittedOn: "mutationFieldSubmission",
  witnesses: "mutationFieldWitnesses",
};

/** Plain-language lines for one mutation, for receipts and the timeline. */
export function describeMutation(mutation: GraphMutation, t: Translate): string[] {
  switch (mutation.type) {
    case "addNode":
      return [t("mutationNodeAdded", { type: t(nodeTypeKeys[mutation.node.type]) })];
    case "addEdge":
      return [t("mutationRelationshipAdded")];
    case "endEdge":
      return [t("mutationRelationshipEnded")];
    case "patchEdgeAttrs":
      return Object.keys(mutation.attrs).map((field) => t("mutationRelationshipUpdated", { field: t(fieldKeys[field] ?? "mutationFieldDetails") }));
    case "patchAttrs":
      return Object.keys(mutation.attrs).map((field) => t("mutationRecordUpdated", { field: t(fieldKeys[field] ?? "mutationFieldDetails") }));
    default: {
      const exhaustive: never = mutation;
      return exhaustive;
    }
  }
}

/**
 * The authority standing behind an event: the verification source carried by
 * the records it touched. Seed history and demo actions both resolve here, so
 * the timeline can print "Source: UIDAI" without a second bookkeeping path.
 */
export function describeEventSources(graph: CitizenGraph, event: GraphEvent): Verification["source"][] {
  if (["eventOutcomeSolved", "eventOutcomeUnresolved", "eventDocumentSaved"].includes(event.labelKey ?? "")) return ["Self"];
  const sources = new Set<Verification["source"]>();
  for (const mutation of event.mutations) {
    if (mutation.type === "addNode") sources.add(mutation.node.verification.source);
    else if (mutation.type === "addEdge") sources.add(mutation.edge.verification.source);
    else if (mutation.type === "patchAttrs") {
      const source = mutation.verification?.source ?? graph.nodes.find((node) => node.id === mutation.nodeId)?.verification.source;
      if (source) sources.add(source);
    } else {
      const edge = graph.edges.find((candidate) => candidate.id === mutation.edgeId);
      if (edge) sources.add(edge.verification.source);
    }
  }
  return [...sources];
}

/** Records a mutation touches, so the timeline can link back to them. */
export function describeEventTargets(event: GraphEvent): string[] {
  const ids = new Set<string>();
  for (const mutation of event.mutations) {
    if (mutation.type === "addNode") ids.add(mutation.node.id);
    else if (mutation.type === "addEdge") ids.add(mutation.edge.to);
    else if (mutation.type === "patchAttrs") ids.add(mutation.nodeId);
  }
  return [...ids];
}
