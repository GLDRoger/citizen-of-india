"use client";

import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeEventLabel } from "@/i18n/formatters";
import type { GraphMutation, NodeType } from "@/features/graph/schema";
import type { MessageKey } from "@/i18n/messages";

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

type Translate = ReturnType<typeof useI18n>["t"];

function mutationLines(mutation: GraphMutation, t: Translate) {
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

export function MutationReceipt({ procedureId }: { procedureId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const lastEventId = useCitizenStore((state) => state.lastEventId);
  const event = lastEventId ? graph.events.find((candidate) => candidate.id === lastEventId) : undefined;
  if (!event || event.procedureId !== procedureId) return null;

  const details = event.mutations.flatMap((mutation) => mutationLines(mutation, t));

  return (
    <aside aria-live="polite" className="grid gap-3 border-y border-green-deep/25 bg-green-tint px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
      <span className="status-text mt-0.5">{t("changeRecorded")}</span>
      <div className="grid gap-2">
        <strong className="font-display text-lg font-bold text-ink">{localizeEventLabel(event, language)}</strong>
        <span className="text-xs font-semibold text-ink-mute">{t("recordsUpdated", { count: details.length })}</span>
        <ul className="grid gap-1 text-xs leading-5 text-ink-mute">
          {details.map((detail, index) => <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-2" key={`${detail}-${index}`}><span aria-hidden="true">·</span><span>{detail}</span></li>)}
        </ul>
      </div>
    </aside>
  );
}
