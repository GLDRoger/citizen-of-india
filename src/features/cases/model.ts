import { describeEventTargets } from "@/features/graph/describe-mutation";
import { getOutcomeTarget } from "@/features/graph/outcomes";
import type { CitizenGraph, GraphNode } from "@/features/graph/schema";
import { getActivityEvents, getApplications, getDocuments, getNotices, getPerson } from "@/features/graph/selectors";

export type CaseRecord = Extract<GraphNode, { type: "application" | "obligation" }>;
const followUpKinds = new Set(["grievance", "rti-request"]);
export const isFollowUp = (record: CaseRecord) => record.type === "application" && followUpKinds.has(record.attrs.kind ?? "");
export const caseBriefHref = (recordId: string) => `/case-brief?record=${encodeURIComponent(recordId)}`;

/** A case is a view over one person's existing records, never a copy of their whole graph. */
export function getCaseBrief(graph: CitizenGraph, personId: string, recordId: string) {
  const person = getPerson(graph, personId);
  const selected = getOutcomeTarget(graph, personId, recordId);
  if (!person || !selected) return undefined;
  let root = selected;
  const ancestors = new Set<string>();
  while (isFollowUp(root) && root.attrs.relatedTo) {
    if (ancestors.has(root.id)) return undefined;
    ancestors.add(root.id);
    const parent = getOutcomeTarget(graph, personId, root.attrs.relatedTo);
    // An inaccessible parent must never be exposed through an owned follow-up.
    if (!parent) return undefined;
    root = parent;
  }
  const ids = new Set([root.id]);
  const applications = getApplications(graph, personId);
  let added = true;
  while (added) {
    added = false;
    for (const application of applications) {
      if (isFollowUp(application) && application.attrs.relatedTo && ids.has(application.attrs.relatedTo) && !ids.has(application.id)) {
        ids.add(application.id);
        added = true;
      }
    }
  }
  const followUps = applications.filter((application) => application.id !== root.id && ids.has(application.id));
  const events = getActivityEvents(graph, personId).filter((event) => describeEventTargets(event).some((id) => ids.has(id))).reverse();
  const ownedDocuments = getDocuments(graph, personId);
  const documentIds = new Set<string>();
  if (root.attrs.relatedTo) documentIds.add(root.attrs.relatedTo);
  for (const event of events) {
    for (const id of describeEventTargets(event)) documentIds.add(id);
  }
  // This workflow explicitly compares these two owned records; it does not share the family profile.
  if (root.type === "application" && root.attrs.kind === "record-correction") {
    const aadhaar = ownedDocuments.find((document) => document.attrs.kind === "aadhaar");
    if (aadhaar) documentIds.add(aadhaar.id);
  }
  const documents = ownedDocuments.filter((document) => documentIds.has(document.id));
  const notices = getNotices(graph, personId).map(({ node }) => node)
    .filter((notice) => notice.attrs.relatedTo && (ids.has(notice.attrs.relatedTo) || notice.attrs.relatedTo === root.attrs.relatedTo));
  return { person, selected, root, followUps, events, documents, notices };
}

export type CaseBrief = NonNullable<ReturnType<typeof getCaseBrief>>;
