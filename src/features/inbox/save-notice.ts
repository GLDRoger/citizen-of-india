import type { CitizenGraph, GraphMutation } from "@/features/graph/schema";
import { getNotices, getPerson } from "@/features/graph/selectors";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { analyzeNotice, normalizeNoticeText } from "./analyze";

export function prepareNoticeSave(
  graph: CitizenGraph,
  personId: string,
  text: string,
  confirmedRecordId?: string,
) {
  if (
    !getPerson(graph, personId) ||
    text.trim().length < 10 ||
    text.length > 20_000
  )
    throw new Error("Invalid notice.");
  const analysis = analyzeNotice(text, graph, personId, "en");
  if (
    analysis.relatedRecordId &&
    confirmedRecordId !== analysis.relatedRecordId
  )
    throw new Error("Confirm the related record first.");
  const notices = getNotices(graph, personId);
  const normalized = normalizeNoticeText(text);
  const duplicate = notices.find(
    ({ node }) =>
      (node.attrs.lensText &&
        normalizeNoticeText(node.attrs.lensText) === normalized) ||
      (node.id === analysis.sampleId && node.attrs.lensSavedOn),
  );
  if (duplicate)
    return {
      noticeId: duplicate.node.id,
      duplicate: true,
      mutations: [] as GraphMutation[],
    };
  const existing = notices.find(
    ({ node }) => node.id === analysis.sampleId,
  )?.node;
  if (existing)
    return {
      noticeId: existing.id,
      duplicate: false,
      mutations: [
        {
          type: "patchAttrs",
          nodeId: existing.id,
          attrs: {
            lensText: text,
            lensSavedOn: DEMO_TODAY,
            lensSampleId: existing.id,
          },
        },
      ] as GraphMutation[],
    };
  // Identity belongs to this saved copy, not to a global hash of someone's private text.
  const noticeId = `ntc:lens-${personId.slice(7)}-${crypto.randomUUID()}`;
  const verification = {
    source: "Self",
    state: "pending",
    asOf: DEMO_TODAY,
  } as const;
  return {
    noticeId,
    duplicate: false,
    mutations: [
      {
        type: "addNode",
        node: {
          id: noticeId,
          type: "notice",
          attrs: {
            channel: "letter",
            sender: "Pasted by you",
            receivedOn: DEMO_TODAY,
            subject: text.trim().slice(0, 100),
            body: text,
            legitimacy: "unknown",
            lensText: text,
            lensSavedOn: DEMO_TODAY,
          },
          verification,
        },
      },
      {
        type: "addEdge",
        edge: {
          id: `e:${noticeId}:subject`,
          type: "subjectOf",
          from: personId,
          to: noticeId,
          attrs: { role: "notice", read: false },
          validFrom: DEMO_TODAY,
          status: "active",
          verification,
        },
      },
    ] as GraphMutation[],
  };
}
