import type { GraphNode } from "./schema";

type ApplicationNode = Extract<GraphNode, { type: "application" }>;

export function getApplicationHref(application: ApplicationNode) {
  switch (application.attrs.kind) {
    case "marriage":
      return "/workflows/marriage";
    case "death":
      return "/workflows/death";
    case "benefit":
      return "/discover";
    case "business-loan":
      return "/workflows/loan";
    case "business-registration":
      return "/workflows/start-business";
    case "cybercrime":
      return "/workflows/scam-check";
    case "property-mutation":
    case "vehicle-transfer":
      return "/workflows/death#family-briefing";
    default:
      return application.attrs.relatedTo?.startsWith("doc:") ? "/documents" : null;
  }
}
