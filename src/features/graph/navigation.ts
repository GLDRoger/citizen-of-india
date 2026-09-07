import type { GraphNode } from "./schema";

type ApplicationNode = Extract<GraphNode, { type: "application" }>;

export function getApplicationHref(application: ApplicationNode) {
  switch (application.attrs.kind) {
    case "marriage":
      return "/workflows/marriage";
    case "benefit":
      return `/workflows/benefit-application?application=${encodeURIComponent(application.id)}`;
    case "business-loan":
      return "/workflows/loan";
    case "business-registration":
      return "/workflows/start-business";
    case "record-correction":
      return "/workflows/record-correction";
    case "epfo-grievance":
      return "/workflows/epfo";
    case "rti-request":
      return application.attrs.relatedTo ? `/workflows/rti?about=${encodeURIComponent(application.attrs.relatedTo)}` : "/workflows/rti";
    case "grievance":
      return application.attrs.relatedTo ? `/workflows/grievance?about=${encodeURIComponent(application.attrs.relatedTo)}` : "/workflows/grievance";
    default:
      return application.attrs.relatedTo?.startsWith("doc:") ? "/workflows/record-correction" : null;
  }
}
