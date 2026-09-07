import { DEMO_TODAY } from "@/lib/demo-clock";
import { getActiveDelegation } from "./delegation";
import { getConnectionInvitations, getFamilySharing } from "./family";
import { getApplications, getNotices, getObligations, getPerson, getThingsToDo, type NoticeView, type TaskView } from "./selectors";
import type { CitizenGraph } from "./schema";

export const attentionCategories = ["personal", "business", "family", "financial"] as const;
export type AttentionCategory = typeof attentionCategories[number];
export type AttentionState = "action" | "waiting" | "information";
export type AttentionSource = "task" | "notice" | "connection" | "shared";

export interface AttentionItem {
  id: string;
  title: string;
  meta: string;
  href: string;
  categories: AttentionCategory[];
  state: AttentionState;
  source: AttentionSource;
  urgent: boolean;
  read?: boolean;
  task?: TaskView;
  notice?: NoticeView;
}

function relatedType(graph: CitizenGraph, id?: string) {
  return id ? graph.nodes.find((node) => node.id === id)?.type : undefined;
}

function taskCategories(graph: CitizenGraph, task: TaskView): AttentionCategory[] {
  const text = `${task.id} ${task.title}`.toLowerCase();
  const relatedId = task.id.replace(/:follow-up$/, "");
  const type = relatedType(graph, relatedId);
  const categories = new Set<AttentionCategory>();
  if (/(business|gstr|gst|loan|udyam|start-business|business)/.test(text) || type === "business") categories.add("business");
  if (/(family|marriage|consent|mother|sunita|parent|pension)/.test(text) || type === "person") categories.add("family");
  if (/(payment|payable|receivable|refund|tax|challan|loan|money|financial)/.test(text)) categories.add("financial");
  if (categories.size === 0 || /(pan|passport|epfo|document|record|personal)/.test(text)) categories.add("personal");
  return Array.from(categories);
}

function taskState(graph: CitizenGraph, personId: string, task: TaskView): AttentionState {
  const id = task.id.replace(/:follow-up$/, "");
  const application = getApplications(graph, personId).find((node) => node.id === id);
  if (application && ["submitted", "processing"].includes(application.attrs.status)) return "waiting";
  const obligation = getObligations(graph, personId).find((node) => node.id === id);
  if (obligation?.attrs.status === "processing") return "waiting";
  return "action";
}

function noticeCategories(notice: NoticeView): AttentionCategory[] {
  const text = `${notice.node.id} ${notice.node.attrs.subject} ${notice.node.attrs.relatedTo ?? ""}`.toLowerCase();
  const categories = new Set<AttentionCategory>();
  if (/(family|marriage|pension|sunita|parent)/.test(text)) categories.add("family");
  if (/(business|gst|gstr|udyam|loan)/.test(text)) categories.add("business");
  if (/(refund|tax|payment|challan|money)/.test(text)) categories.add("financial");
  if (categories.size === 0) categories.add("personal");
  return Array.from(categories);
}

function noticeIsCoveredByTask(notice: NoticeView, tasks: TaskView[]) {
  return Boolean(notice.node.attrs.relatedTo && tasks.some((task) => task.id.replace(/:follow-up$/, "") === notice.node.attrs.relatedTo));
}

export function getAttentionItems(graph: CitizenGraph, personId: string): AttentionItem[] {
  const tasks = getThingsToDo(graph, personId);
  const items: AttentionItem[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    meta: task.meta,
    href: task.href,
    categories: taskCategories(graph, task),
    state: taskState(graph, personId, task),
    source: "task",
    urgent: task.urgent,
    task,
  }));

  for (const notice of getNotices(graph, personId)) {
    if (!notice.node.attrs.lensSavedOn || noticeIsCoveredByTask(notice, tasks)) continue;
    items.push({
      id: `notice:${notice.node.id}`,
      title: notice.node.attrs.subject,
      meta: notice.node.attrs.sender,
      href: "/inbox",
      categories: noticeCategories(notice),
      state: notice.node.attrs.legitimacy === "unknown" ? "information" : notice.read ? "information" : "action",
      source: "notice",
      urgent: false,
      read: notice.read,
      notice,
    });
  }

  for (const invitation of getConnectionInvitations(graph, personId).filter((item) => item.attrs.status === "requested")) {
    const incoming = invitation.attrs.inviteeId === personId;
    const other = getPerson(graph, incoming ? invitation.attrs.inviterId : invitation.attrs.inviteeId);
    items.push({
      id: invitation.id,
      title: incoming ? `${other?.attrs.name ?? "Family member"} invited you` : `Invitation to ${other?.attrs.name ?? "family member"}`,
      meta: incoming ? "Your answer is needed" : "Waiting for their answer",
      href: "/you#family-connections",
      categories: ["family"],
      state: incoming ? "action" : "waiting",
      source: "connection",
      urgent: incoming,
    });
  }

  for (const { delegation, other } of getFamilySharing(graph, personId).filter(({ delegation }) => delegation.attrs.status === "active" && delegation.attrs.expiresOn >= DEMO_TODAY)) {
    const recipient = delegation.attrs.delegateId === personId;
    if (!getActiveDelegation(graph, delegation.attrs.delegateId, delegation.attrs.delegatorId)) continue;
    items.push({
      id: `${delegation.id}:shared`,
      title: recipient ? `${other.attrs.name} shared authorised updates with you` : `Authorised updates shared with ${other.attrs.name}`,
      meta: `Access ends ${delegation.attrs.expiresOn}`,
      href: "/you#family-connections",
      categories: ["family"],
      state: "information",
      source: "shared",
      urgent: false,
    });
  }

  return items;
}
