import type { CitizenGraph } from "./schema";
import { getApplications, getObligations } from "./selectors";

/** Feedback belongs to a specific record in the active profile, never the latest global procedure event. */
export function getOutcomeTarget(graph: CitizenGraph, personId: string, targetId: string) {
  return [...getApplications(graph, personId), ...getObligations(graph, personId)].find((node) => node.id === targetId);
}
