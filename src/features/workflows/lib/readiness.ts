import { getObligationOwnership } from "@/features/graph/ownership";
import type { CitizenGraph, GraphNode, Verification } from "@/features/graph/schema";
import { ageFromDob, getApplications, getDocuments, getEligibility, getEmployment, getNodeByType, getNotices, getObligations, getOwnedAssets, getPerson } from "@/features/graph/selectors";
import type { MessageKey } from "@/i18n/messages";

export type CheckState = "ready" | "missing" | "mismatch" | "blocked" | "unknown";

export interface ReadinessCheck {
  id: string;
  labelKey: MessageKey;
  labelParams?: Record<string, string | number>;
  state: CheckState;
  /** The record that satisfied or failed the check, so the row can show source and freshness. */
  verification?: Verification;
  href?: string;
}

export interface Dependency {
  labelKey: MessageKey;
  done: boolean;
}

export interface Preflight {
  authority: string;
  checks: ReadinessCheck[];
  needsFirst: Dependency[];
  unlocks: Dependency[];
  /** Working days the simulated authority usually takes. Labelled as an estimate in the UI. */
  estimatedDays: number;
}

type DocumentNode = Extract<GraphNode, { type: "document" }>;

function docCheck(id: string, labelKey: MessageKey, document: DocumentNode | undefined, params?: Record<string, string | number>): ReadinessCheck {
  if (!document) return { id, labelKey, labelParams: params, state: "missing" };
  const state: CheckState = document.verification.state === "verified" ? "ready" : document.verification.state === "mismatch" ? "mismatch" : document.verification.state === "not-documented" ? "unknown" : "blocked";
  return { id, labelKey, labelParams: params, state, verification: document.verification };
}

function ready(id: string, labelKey: MessageKey, ok: boolean, verification?: Verification, params?: Record<string, string | number>): ReadinessCheck {
  return { id, labelKey, labelParams: params, state: ok ? "ready" : "missing", verification };
}

function findDoc(graph: CitizenGraph, personId: string, kind: string) {
  return getDocuments(graph, personId).find((document) => document.attrs.kind === kind);
}

function firstName(graph: CitizenGraph, personId: string) {
  return getPerson(graph, personId)?.attrs.name.split(" ")[0] ?? "";
}

function marriage(graph: CitizenGraph, viewerId: string): Preflight {
  const arjun = getPerson(graph, "person:arjun");
  const priya = getPerson(graph, "person:priya");
  const application = getApplications(graph, "person:arjun").find((node) => node.id === "app:marriage-arjun-priya");
  const step = application?.attrs.currentStep ?? 0;
  const checks: ReadinessCheck[] = [
    docCheck("arjun-aadhaar", "checkAadhaar", findDoc(graph, "person:arjun", "aadhaar"), { name: firstName(graph, "person:arjun") }),
    docCheck("priya-aadhaar", "checkAadhaar", findDoc(graph, "person:priya", "aadhaar"), { name: firstName(graph, "person:priya") }),
    ready("arjun-age", "checkAge", Boolean(arjun && ageFromDob(arjun.attrs.dob) >= 21), arjun?.verification, { name: firstName(graph, "person:arjun") }),
    ready("priya-age", "checkAge", Boolean(priya && ageFromDob(priya.attrs.dob) >= 18), priya?.verification, { name: firstName(graph, "person:priya") }),
    ready("address", "checkAddress", graph.edges.some((edge) => edge.type === "residesAt" && edge.from === "person:arjun" && edge.status === "active")),
    ready("consent", "checkConsent", step >= 2, application?.verification, { name: firstName(graph, application?.attrs.participants?.[1] ?? (viewerId === "person:priya" ? "person:arjun" : "person:priya")) }),
    ready("witnesses", "checkWitnesses", (application?.attrs.witnesses?.length ?? 0) >= 2),
    ready("fee", "checkFee", (application?.attrs.amountPaid ?? 0) >= 500),
  ];
  const married = application?.attrs.status === "completed";
  return {
    authority: "Kaveri Online Services",
    checks,
    needsFirst: [{ labelKey: "depIdentity", done: checks[0].state === "ready" && checks[1].state === "ready" }, { labelKey: "depAddress", done: checks[4].state === "ready" }],
    unlocks: [{ labelKey: "unlockEpfNominee", done: married }, { labelKey: "unlockSpouseSchemes", done: married }, { labelKey: "unlockNameChange", done: married }],
    estimatedDays: 7,
  };
}

function recordCorrection(graph: CitizenGraph, personId: string): Preflight {
  const pan = findDoc(graph, personId, "pan");
  const aadhaar = findDoc(graph, personId, "aadhaar");
  const application = getApplications(graph, personId).find((node) => node.id === "app:pan-name-correction");
  const submitted = application?.attrs.status === "submitted";
  return {
    authority: "Protean eGov",
    checks: [
      docCheck("aadhaar", "checkAadhaar", aadhaar, { name: firstName(graph, personId) }),
      { id: "pan", labelKey: "checkPanMismatch", state: pan?.verification.state === "mismatch" ? "mismatch" : pan ? "ready" : "missing", verification: pan?.verification },
      ready("draft", "checkPanDraft", Boolean(application), application?.verification),
    ],
    needsFirst: [{ labelKey: "depIdentity", done: aadhaar?.verification.state === "verified" }],
    unlocks: [{ labelKey: "unlockPanClean", done: submitted && pan?.verification.state === "verified" }, { labelKey: "unlockBank", done: submitted && pan?.verification.state === "verified" }],
    estimatedDays: 15,
  };
}

function businessLoan(graph: CitizenGraph, personId: string): Preflight {
  const person = getPerson(graph, personId);
  const business = getOwnedAssets(graph, personId).find((node) => node.type === "business");
  const overdue = getObligations(graph, personId).some((node) => (getObligationOwnership(node)?.dueInDays ?? 0) < 0);
  return {
    authority: "SIDBI / member banks",
    checks: [
      docCheck("udyam", "checkUdyam", findDoc(graph, personId, "udyam-certificate")),
      docCheck("gst", "checkGst", findDoc(graph, personId, "gst-registration")),
      ready("itr", "checkItr", Boolean(person?.attrs.itrFiledLastYear), person?.verification),
      ready("turnover", "checkTurnover", Boolean(business && business.type === "business" && business.attrs.turnoverFY25 > 0), business?.verification),
      ready("dues", "checkNoOverdue", !overdue),
    ],
    needsFirst: [{ labelKey: "unlockUdyam", done: Boolean(findDoc(graph, personId, "udyam-certificate")) }, { labelKey: "unlockGst", done: Boolean(findDoc(graph, personId, "gst-registration")) }],
    unlocks: [{ labelKey: "unlockLoanApply", done: getApplications(graph, personId).some((node) => node.attrs.kind === "loan") }],
    estimatedDays: 10,
  };
}

function epfo(graph: CitizenGraph, personId: string): Preflight {
  const employment = getEmployment(graph, personId);
  const notice = getNotices(graph, personId).find((candidate) => candidate.node.id === "ntc:epfo-passbook");
  const grievance = getApplications(graph, personId).find((node) => node.attrs.kind === "epfo-grievance");
  return {
    authority: "EPFO",
    checks: [
      ready("employment", "checkEmployment", Boolean(employment), employment?.verification),
      ready("passbook", "checkPassbook", Boolean(notice), notice?.node.verification),
      docCheck("aadhaar", "checkAadhaar", findDoc(graph, personId, "aadhaar"), { name: firstName(graph, personId) }),
    ],
    needsFirst: [{ labelKey: "checkEmployment", done: Boolean(employment) }],
    unlocks: [{ labelKey: "unlockGrievanceTrack", done: Boolean(grievance) }, { labelKey: "unlockPassbookFixed", done: false }],
    estimatedDays: 30,
  };
}

function challan(graph: CitizenGraph, personId: string): Preflight {
  const rc = findDoc(graph, personId, "vehicle-rc");
  const obligation = getNodeByType(graph, "obl:echallan-500", "obligation");
  const paid = obligation?.attrs.status === "paid";
  return {
    authority: "Karnataka One",
    checks: [
      docCheck("rc", "checkVehicle", rc),
      ready("match", "checkChallanVehicle", Boolean(obligation?.attrs.relatedTo && obligation.attrs.relatedTo === rc?.attrs.vehicleId), obligation?.verification),
    ],
    needsFirst: [],
    unlocks: [{ labelKey: "unlockReceipt", done: paid }, { labelKey: "unlockChallanClear", done: paid }],
    estimatedDays: 1,
  };
}

function propertyTax(graph: CitizenGraph): Preflight {
  const obligation = getNodeByType(graph, "obl:bbmp-property-tax", "obligation");
  const property = obligation?.attrs.relatedTo ? getNodeByType(graph, obligation.attrs.relatedTo, "property") : undefined;
  return {
    authority: "BBMP via Karnataka One",
    checks: [ready("property", "checkProperty", Boolean(property), property?.verification)],
    needsFirst: [],
    unlocks: [{ labelKey: "unlockReceipt", done: obligation?.attrs.status === "paid" }],
    estimatedDays: 1,
  };
}

function gstr(graph: CitizenGraph, personId: string): Preflight {
  const obligation = getNodeByType(graph, "obl:gstr3b-sep", "obligation");
  return {
    authority: "GSTN",
    checks: [docCheck("gst", "checkGst", findDoc(graph, personId, "gst-registration")), ready("period", "checkGstPeriod", obligation?.attrs.status !== "completed", obligation?.verification)],
    needsFirst: [],
    unlocks: [{ labelKey: "unlockReceipt", done: obligation?.attrs.status === "completed" }],
    estimatedDays: 1,
  };
}

function startBusiness(graph: CitizenGraph, personId: string): Preflight {
  const application = getApplications(graph, personId).find((node) => node.attrs.kind === "business-registration");
  return {
    authority: "Udyam / GSTN",
    checks: [
      docCheck("aadhaar", "checkAadhaar", findDoc(graph, personId, "aadhaar"), { name: firstName(graph, personId) }),
      ready("details", "checkBusinessDetails", Boolean(application?.attrs.businessType && application.attrs.city)),
    ],
    needsFirst: [{ labelKey: "depIdentity", done: findDoc(graph, personId, "aadhaar")?.verification.state === "verified" }],
    unlocks: [{ labelKey: "unlockUdyam", done: false }, { labelKey: "unlockGst", done: false }, { labelKey: "unlockBank", done: false }],
    estimatedDays: 3,
  };
}

function benefit(graph: CitizenGraph, personId: string): Preflight {
  const results = getEligibility(graph, personId);
  const eligible = results.filter((result) => result.status === "eligible");
  return {
    authority: "UMANG scheme application desk",
    checks: [docCheck("aadhaar", "checkAadhaar", findDoc(graph, personId, "aadhaar"), { name: firstName(graph, personId) }), ready("rules", "checkEligibility", eligible.length > 0)],
    needsFirst: [],
    unlocks: [],
    estimatedDays: 21,
  };
}

/** The pre-flight diagnosis for a procedure, computed from the record every render. */
export function getPreflight(graph: CitizenGraph, personId: string, procedureId: string): Preflight | undefined {
  switch (procedureId) {
    case "marriage-arjun-priya": return marriage(graph, personId);
    case "record-correction": return recordCorrection(graph, personId);
    case "business-loan": return businessLoan(graph, personId);
    case "epfo-grievance": return epfo(graph, personId);
    case "echallan-payment": return challan(graph, personId);
    case "property-tax-payment": return propertyTax(graph);
    case "gstr3b-filing": return gstr(graph, personId);
    case "start-business": return startBusiness(graph, personId);
    case "benefit-application": return benefit(graph, personId);
    default: return undefined;
  }
}

export function summarizeReadiness(preflight: Preflight) {
  const total = preflight.checks.length;
  const readyCount = preflight.checks.filter((check) => check.state === "ready").length;
  return { readyCount, total, missing: preflight.checks.filter((check) => check.state !== "ready") };
}
