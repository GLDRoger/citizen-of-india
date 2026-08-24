import type { CitizenGraph } from "@/features/graph/schema";
import {
  getApplications,
  getObligations,
  getOwnedAssets,
  getPerson,
  getRelationshipViews,
} from "@/features/graph/selectors";
import { classifyIntentLocally } from "./intent-fallback";
import { intentResponseSchema, type IntentContext } from "./schema";

export function buildIntentContext(graph: CitizenGraph, personId: string): IntentContext {
  const person = getPerson(graph, personId);
  if (!person) throw new Error("The active profile is missing from the graph.");
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
    applications: getApplications(graph, personId).map((node) => ({
      id: node.id,
      title: node.attrs.title,
      status: node.attrs.status,
    })),
    businesses: getOwnedAssets(graph, personId)
      .filter((node) => node.type === "business")
      .map((node) => ({ id: node.id, name: node.attrs.name, entityType: node.attrs.entityType })),
  };
}

export async function classifyIntent(text: string, context: IntentContext) {
  try {
    const response = await fetch("/api/intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, context }),
    });
    if (!response.ok) return classifyIntentLocally(text);
    return intentResponseSchema.parse(await response.json());
  } catch {
    return classifyIntentLocally(text);
  }
}
