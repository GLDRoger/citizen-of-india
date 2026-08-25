import type { GraphEvent } from "@/features/graph/schema";
import { localizeNodeTitle } from "./content";
import { getMessage, isMessageKey, type Language, type MessageKey } from "./messages";

const statusKeys: Record<string, MessageKey> = {
  active: "statusActive",
  "appointment-booked": "statusAppointmentBooked",
  completed: "statusCompleted",
  "documents-ready": "statusDocumentsReady",
  draft: "statusDraft",
  due: "statusDue",
  paid: "statusPaid",
  "partner-consent-pending": "statusPartnerConsentPending",
  processing: "statusProcessing",
  received: "statusReceived",
  revoked: "statusRevoked",
  submitted: "statusSubmitted",
};

const documentKindKeys: Record<string, MessageKey> = {
  aadhaar: "documentAadhaar",
  "death-certificate": "documentDeathCertificate",
  "driving-licence": "documentDrivingLicence",
  "gst-registration": "documentGstRegistration",
  "marriage-certificate": "documentMarriageCertificate",
  pan: "documentPan",
  passport: "documentPassport",
  "payment-receipt": "documentPaymentReceipt",
  "property-khata": "documentPropertyKhata",
  "udyam-certificate": "documentUdyamCertificate",
  "vehicle-rc": "documentVehicleRc",
};

const scamVerdictKeys: Record<string, MessageKey> = {
  "likely-legitimate": "statusLikelyLegitimate",
  suspicious: "suspicious",
  unclear: "statusUnclear",
};

const confidenceKeys: Record<string, MessageKey> = {
  high: "confidenceHigh",
  medium: "confidenceMedium",
  low: "confidenceLow",
};

export function getStatusMessageKey(status: string) {
  return statusKeys[status];
}

export function getDocumentKindMessageKey(kind: string) {
  return documentKindKeys[kind];
}

export function getScamVerdictMessageKey(verdict: string) {
  return scamVerdictKeys[verdict];
}

export function getConfidenceMessageKey(confidence: string) {
  return confidenceKeys[confidence];
}

export function localizeEvidence(language: Language, evidence: string) {
  if (evidence === "doc:itr-v-fy25") return getMessage(language, "evidenceLatestItr");
  if (evidence === "income-declaration") return getMessage(language, "evidenceIncomeDeclaration");
  if (evidence === "death-certificate") return getMessage(language, "documentDeathCertificate");
  return evidence.replace("doc:", "").replaceAll("-", " ");
}

export function localizeEventLabel(event: GraphEvent, language: Language) {
  if (!event.labelKey || !isMessageKey(event.labelKey)) return event.label ?? event.labelKey ?? "";
  const params = { ...event.labelParams };
  if (event.labelKey === "eventDocumentSaved" && typeof params.documentKind === "string") {
    const key = getDocumentKindMessageKey(params.documentKind);
    params.document = key ? getMessage(language, key) : params.documentKind;
  }
  if (event.labelKey === "eventBenefitApplicationStarted" && typeof params.benefitId === "string") {
    params.benefit = localizeNodeTitle(language, params.benefitId, params.benefitId);
  }
  return getMessage(language, event.labelKey, params);
}
