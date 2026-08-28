import type { CitizenGraph } from "@/features/graph/schema";
import {
  getApplications,
  getDocuments,
  getEligibility,
  getObligations,
  getOwnedAssets,
  getPerson,
  getRelationshipViews,
} from "@/features/graph/selectors";
import { getAvailableServices, isBenefitVisibleInDemo } from "@/features/services/availability";
import { classifyIntentLocally } from "./intent-fallback";
import type { IntentContext, RoutableIntent } from "./schema";

export function buildIntentContext(graph: CitizenGraph, personId: string): IntentContext {
  const person = getPerson(graph, personId);
  if (!person) throw new Error("The active profile is missing from the graph.");
  const applications = getApplications(graph, personId);
  const availableWorkflows: RoutableIntent[] = [...getAvailableServices(graph, personId)];
  availableWorkflows.push("profile");
  if (getDocuments(graph, personId).length) availableWorkflows.push("documents");
  const hasBenefitJourney = applications.some((application) => application.attrs.kind === "benefit")
    || getEligibility(graph, personId).some((result) => result.benefit.id !== "ben:mudra-kishor" && isBenefitVisibleInDemo(result.benefit.id));
  if (hasBenefitJourney) availableWorkflows.push("benefit-application");
  return {
    person: {
      id: person.id,
      name: person.attrs.name,
      maritalStatus: person.attrs.maritalStatus,
      preferredLanguage: person.attrs.preferredLanguage,
    },
    relationships: getRelationshipViews(graph, personId).map((relative) => ({
      name: relative.person.attrs.name,
      relationship: relative.relationship,
    })),
    obligations: getObligations(graph, personId).map((node) => ({
      id: node.id,
      title: node.attrs.title,
      direction: node.attrs.direction,
      status: node.attrs.status,
    })),
    applications: applications.map((node) => ({
      id: node.id,
      title: node.attrs.title,
      status: node.attrs.status,
    })),
    businesses: getOwnedAssets(graph, personId)
      .filter((node) => node.type === "business")
      .map((node) => ({ id: node.id, name: node.attrs.name, entityType: node.attrs.entityType })),
    availableWorkflows,
  };
}

export function classifyIntent(text: string, context: IntentContext) {
  return classifyIntentLocally(text, context);
}
