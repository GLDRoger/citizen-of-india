import { daysUntil } from "@/lib/format";
import type {
  CitizenGraph,
  EligibilityRule,
  GraphEdge,
  GraphEvent,
  GraphMutation,
  GraphNode,
  NodeType,
} from "./schema";
import { getApplicationHref } from "./navigation";

type PersonNode = Extract<GraphNode, { type: "person" }>;
type DocumentNode = Extract<GraphNode, { type: "document" }>;
type ObligationNode = Extract<GraphNode, { type: "obligation" }>;
type ApplicationNode = Extract<GraphNode, { type: "application" }>;
type NoticeNode = Extract<GraphNode, { type: "notice" }>;
type BenefitNode = Extract<GraphNode, { type: "benefit" }>;
type BusinessNode = Extract<GraphNode, { type: "business" }>;

export function getNodeByType<T extends NodeType>(
  graph: CitizenGraph,
  id: string,
  type: T,
): Extract<GraphNode, { type: T }> | undefined {
  return graph.nodes.find(
    (node): node is Extract<GraphNode, { type: T }> => node.id === id && node.type === type,
  );
}

export function getPerson(graph: CitizenGraph, personId: string) {
  return getNodeByType(graph, personId, "person");
}

function activeEdges(graph: CitizenGraph, personId: string, type?: GraphEdge["type"]) {
  return graph.edges.filter(
    (edge) =>
      edge.status === "active" &&
      (edge.from === personId || edge.to === personId) &&
      (!type || edge.type === type),
  );
}

function targetsForPerson(graph: CitizenGraph, personId: string, edgeType: GraphEdge["type"]) {
  return graph.edges
    .filter(
      (edge) => edge.from === personId && edge.type === edgeType && edge.status === "active",
    )
    .map((edge) => edge.to);
}

export function getDocuments(graph: CitizenGraph, personId: string): DocumentNode[] {
  const ids = new Set(targetsForPerson(graph, personId, "holds"));
  return graph.nodes.filter(
    (node): node is DocumentNode => node.type === "document" && ids.has(node.id),
  );
}

export function getObligations(graph: CitizenGraph, personId: string): ObligationNode[] {
  const ids = new Set(targetsForPerson(graph, personId, "subjectOf"));
  return graph.nodes
    .filter((node): node is ObligationNode => node.type === "obligation" && ids.has(node.id))
    .sort((first, second) =>
      (first.attrs.dueDate ?? "9999-12-31").localeCompare(second.attrs.dueDate ?? "9999-12-31"),
    );
}

export function getApplications(graph: CitizenGraph, personId: string): ApplicationNode[] {
  const subjectIds = new Set(targetsForPerson(graph, personId, "subjectOf"));
  return graph.nodes
    .filter(
      (node): node is ApplicationNode =>
        node.type === "application" &&
        (subjectIds.has(node.id) || node.attrs.participants?.includes(personId) === true),
    )
    .sort((first, second) => second.attrs.createdOn.localeCompare(first.attrs.createdOn));
}

function mutationAffectsPerson(graph: CitizenGraph, mutation: GraphMutation, personId: string) {
  switch (mutation.type) {
    case "addNode":
      return mutation.node.id === personId || (mutation.node.type === "application" && mutation.node.attrs.participants?.includes(personId) === true);
    case "addEdge":
      return mutation.edge.from === personId || mutation.edge.to === personId;
    case "endEdge": {
      const edge = graph.edges.find((candidate) => candidate.id === mutation.edgeId);
      return edge?.from === personId || edge?.to === personId;
    }
    case "patchAttrs": {
      if (mutation.nodeId === personId) return true;
      const application = getNodeByType(graph, mutation.nodeId, "application");
      return application?.attrs.participants?.includes(personId) === true;
    }
    default: {
      const exhaustive: never = mutation;
      return exhaustive;
    }
  }
}

export function getActivityEvents(graph: CitizenGraph, personId: string): GraphEvent[] {
  return graph.events
    .filter((event) => event.actorId === personId || event.mutations.some((mutation) => mutationAffectsPerson(graph, mutation, personId)))
    .slice()
    .reverse();
}

export interface NoticeView {
  node: NoticeNode;
  read: boolean;
}

export function getNotices(graph: CitizenGraph, personId: string): NoticeView[] {
  const links = graph.edges.filter(
    (edge): edge is Extract<GraphEdge, { type: "subjectOf" }> =>
      edge.type === "subjectOf" && edge.from === personId && edge.status === "active",
  );
  const linkByTarget = new Map(links.map((edge) => [edge.to, edge]));
  return graph.nodes
    .filter(
      (node): node is NoticeNode => node.type === "notice" && linkByTarget.has(node.id),
    )
    .map((node) => ({ node, read: linkByTarget.get(node.id)?.attrs.read ?? false }))
    .sort((first, second) =>
      second.node.attrs.receivedOn.localeCompare(first.node.attrs.receivedOn),
    );
}

function ageFromDob(dob: string) {
  const today = new Date();
  const birth = new Date(`${dob}T00:00:00+05:30`);
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function getResidenceState(graph: CitizenGraph, personId: string) {
  const addressId = targetsForPerson(graph, personId, "residesAt").at(0);
  return addressId ? getNodeByType(graph, addressId, "address")?.attrs.state : undefined;
}

function getOwnedBusiness(graph: CitizenGraph, personId: string): BusinessNode | undefined {
  const businessId = targetsForPerson(graph, personId, "owns").find((id) => id.startsWith("biz:"));
  return businessId ? getNodeByType(graph, businessId, "business") : undefined;
}

function getSpouse(graph: CitizenGraph, personId: string): PersonNode | undefined {
  const spouseEdge = graph.edges.find(
    (edge) => edge.type === "spouseOf" && (edge.from === personId || edge.to === personId),
  );
  if (!spouseEdge) return undefined;
  const spouseId = spouseEdge.from === personId ? spouseEdge.to : spouseEdge.from;
  return getPerson(graph, spouseId);
}

function hasDocumentEvidence(graph: CitizenGraph, evidence: string) {
  if (graph.nodes.some((node) => node.type === "document" && node.id === evidence)) {
    return true;
  }
  if (evidence === "death-certificate") {
    return graph.nodes.some(
      (node) => node.type === "document" && node.attrs.kind === "death-certificate",
    );
  }
  return false;
}

function resolveFact(graph: CitizenGraph, person: PersonNode, field: string): unknown {
  const business = getOwnedBusiness(graph, person.id);
  const spouse = getSpouse(graph, person.id);
  const udyamRegistered = business
    ? graph.nodes.some(
        (node) =>
          node.type === "document" &&
          node.attrs.kind === "udyam-certificate" &&
          node.attrs.businessId === business.id,
      )
    : false;

  switch (field) {
    case "person.age":
      return ageFromDob(person.attrs.dob);
    case "person.hasBankAccount":
      return person.attrs.hasBankAccount;
    case "person.itrFiledLastYear":
      return person.attrs.itrFiledLastYear;
    case "person.residentState":
      return getResidenceState(graph, person.id);
    case "person.widowed":
      return person.attrs.maritalStatus === "widowed";
    case "business.entityType":
      return business?.attrs.entityType;
    case "business.udyamRegistered":
      return udyamRegistered;
    case "business.vintageYears":
      return business ? ageFromDob(business.attrs.registeredOn) : undefined;
    case "documents.deathCertificate":
      return hasDocumentEvidence(graph, "death-certificate");
    case "spouse.deceased":
      return Boolean(spouse?.attrs.deceasedOn);
    case "spouse.epsPension":
      return Boolean(spouse?.attrs.pension?.scheme.startsWith("EPS"));
    case "household.income":
      return undefined;
    default:
      return undefined;
  }
}

function rulePasses(fact: unknown, rule: EligibilityRule) {
  switch (rule.op) {
    case "==":
      return fact === rule.value;
    case ">=":
      return typeof fact === "number" && typeof rule.value === "number" && fact >= rule.value;
    case "<=":
      return typeof fact === "number" && typeof rule.value === "number" && fact <= rule.value;
    case "between":
      return (
        typeof fact === "number" &&
        Array.isArray(rule.value) &&
        rule.value.length === 2 &&
        typeof rule.value[0] === "number" &&
        typeof rule.value[1] === "number" &&
        fact >= rule.value[0] &&
        fact <= rule.value[1]
      );
    case "exists":
      return rule.value === true ? fact !== undefined && fact !== null && fact !== false : fact == null;
    case "in":
      return (
        typeof fact === "string" &&
        Array.isArray(rule.value) &&
        rule.value.some((value) => typeof value === "string" && value === fact)
      );
    default: {
      const exhaustive: never = rule.op;
      return exhaustive;
    }
  }
}

export type EligibilityStatus = "eligible" | "potentially-eligible" | "not-eligible";

export interface EligibilityResult {
  benefit: BenefitNode;
  status: EligibilityStatus;
  passedReasons: string[];
  failedReasons: string[];
  missingEvidence: string[];
}

export function evaluateBenefit(
  graph: CitizenGraph,
  person: PersonNode,
  benefit: BenefitNode,
): EligibilityResult {
  const details = benefit.attrs.rules.map((rule) => {
    const fact = resolveFact(graph, person, rule.field);
    return {
      rule,
      passed: rulePasses(fact, rule),
      missing: rule.missingEvidence && !hasDocumentEvidence(graph, rule.missingEvidence),
    };
  });
  const failedReasons = details
    .filter((detail) => !detail.passed && !detail.missing)
    .map((detail) => detail.rule.explanation);
  const missingEvidence = details
    .filter((detail) => detail.missing)
    .map((detail) => detail.rule.missingEvidence)
    .filter((evidence): evidence is string => Boolean(evidence));
  const status: EligibilityStatus =
    failedReasons.length > 0
      ? "not-eligible"
      : missingEvidence.length > 0
        ? "potentially-eligible"
        : "eligible";

  return {
    benefit,
    status,
    passedReasons: details.filter((detail) => detail.passed).map((detail) => detail.rule.explanation),
    failedReasons,
    missingEvidence,
  };
}

export function getEligibility(graph: CitizenGraph, personId: string): EligibilityResult[] {
  const person = getPerson(graph, personId);
  if (!person) return [];
  const benefitIds = new Set(
    graph.edges
      .filter(
        (edge) => edge.type === "subjectOf" && edge.from === personId && edge.status === "active",
      )
      .map((edge) => edge.to),
  );
  return graph.nodes
    .filter(
      (node): node is BenefitNode => node.type === "benefit" && benefitIds.has(node.id),
    )
    .map((benefit) => evaluateBenefit(graph, person, benefit));
}

export interface TaskView {
  id: string;
  title: string;
  meta: string;
  href: string;
  urgent: boolean;
}

export function getThingsToDo(graph: CitizenGraph, personId: string): TaskView[] {
  const obligationHrefs: Record<string, string> = {
    "obl:echallan-500": "/workflows/obligations",
    "obl:bbmp-property-tax": "/workflows/property-tax",
    "obl:gstr3b-sep": "/workflows/gstr3b",
    "obl:passport-renewal": "/workflows/passport-renewal",
    "obl:itr-refund": "/workflows/refund-track",
  };
  const obligationTasks = getObligations(graph, personId)
    .filter((node) => !["paid", "received", "completed"].includes(node.attrs.status ?? "due"))
    .map((node) => ({
      id: node.id,
      title: node.attrs.title,
      meta: node.attrs.dueDate ? `${daysUntil(node.attrs.dueDate)} days left` : node.attrs.authority,
      href: obligationHrefs[node.id] ?? "/#money",
      urgent: node.attrs.dueDate ? daysUntil(node.attrs.dueDate) <= 14 : false,
    }));
  const applicationTasks = getApplications(graph, personId)
    .filter((node) => node.attrs.status !== "completed")
    .map((node) => ({
      id: node.id,
      title: node.attrs.title,
      meta:
        node.attrs.status === "partner-consent-pending" && personId === "person:priya"
          ? "Your consent is needed"
          : `Status: ${node.attrs.status.replaceAll("-", " ")}`,
      href: getApplicationHref(node) ?? "/activity",
      urgent: node.attrs.status === "partner-consent-pending" && personId === "person:priya",
    }));
  const mismatchTasks = getDocuments(graph, personId)
    .filter((node) => node.verification.state === "mismatch")
    .map((node) => ({
      id: node.id,
      title: `${node.attrs.kind.toUpperCase()} record needs attention`,
      meta: node.verification.note ?? "Record mismatch",
      href: "/documents",
      urgent: false,
    }));
  return [...applicationTasks, ...obligationTasks, ...mismatchTasks].slice(0, 6);
}

export function getMoneySummary(graph: CitizenGraph, personId: string) {
  return getObligations(graph, personId).reduce(
    (summary, node) => {
      if (node.attrs.status === "paid" || node.attrs.status === "received") return summary;
      if (node.attrs.direction === "payable") summary.payable += node.attrs.amount ?? 0;
      if (node.attrs.direction === "receivable") summary.receivable += node.attrs.amount ?? 0;
      return summary;
    },
    { payable: 0, receivable: 0 },
  );
}

export function getProfileSummary(graph: CitizenGraph, personId: string) {
  const person = getPerson(graph, personId);
  if (!person) return undefined;
  const documents = getDocuments(graph, personId);
  const residence = getResidenceState(graph, personId);
  return {
    person,
    age: ageFromDob(person.attrs.dob),
    residence,
    documentCount: documents.length,
    verifiedDocumentCount: documents.filter((node) => node.verification.state === "verified").length,
    relationships: activeEdges(graph, personId, "childOf").length + activeEdges(graph, personId, "spouseOf").length,
  };
}

export interface RelationshipView {
  person: PersonNode;
  relationship: "parent" | "child" | "spouse" | "historical spouse";
}

export function getRelationshipViews(graph: CitizenGraph, personId: string): RelationshipView[] {
  const views = graph.edges
    .filter(
      (edge) =>
        (edge.type === "childOf" || edge.type === "spouseOf") &&
        (edge.from === personId || edge.to === personId),
    )
    .flatMap((edge): RelationshipView[] => {
      const relativeId = edge.from === personId ? edge.to : edge.from;
      const person = getPerson(graph, relativeId);
      if (!person) return [];
      const relationship = edge.type === "spouseOf"
        ? edge.status === "ended" ? "historical spouse" : "spouse"
        : edge.from === personId ? "parent" : "child";
      return [{ person, relationship }];
    });
  return views.filter(
    (view, index) => views.findIndex((candidate) => candidate.person.id === view.person.id) === index,
  );
}

export function getOwnedAssets(graph: CitizenGraph, personId: string) {
  const assetIds = new Set(targetsForPerson(graph, personId, "owns"));
  return graph.nodes.filter((node) => assetIds.has(node.id));
}

export function getEmployment(graph: CitizenGraph, personId: string) {
  const employmentId = targetsForPerson(graph, personId, "employedBy").at(0);
  return employmentId ? getNodeByType(graph, employmentId, "employment") : undefined;
}
