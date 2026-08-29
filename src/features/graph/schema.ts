import { z } from "zod";

export const verificationSourceSchema = z.enum([
  "UIDAI",
  "NSDL",
  "IncomeTax",
  "EPFO",
  "RTO",
  "MCA",
  "Municipal",
  "Self",
]);

export const verificationStateSchema = z.enum([
  "verified",
  "self-declared",
  "mismatch",
  "expired",
  "pending",
]);

export const verificationSchema = z.object({
  source: verificationSourceSchema,
  state: verificationStateSchema,
  asOf: z.iso.date(),
  note: z.string().optional(),
});

const personNodeSchema = z.object({
  id: z.string().startsWith("person:"),
  type: z.literal("person"),
  attrs: z.object({
    name: z.string(),
    nameOnPan: z.string().optional(),
    maidenName: z.string().optional(),
    dob: z.iso.date(),
    gender: z.enum(["female", "male", "other"]),
    phone: z.string().optional(),
    email: z.email().optional(),
    maritalStatus: z.enum(["single", "married", "widowed", "divorced"]),
    preferredLanguage: z.enum(["en", "hi", "kn"]).optional(),
    deceasedOn: z.iso.date().optional(),
    hasBankAccount: z.boolean().optional(),
    itrFiledLastYear: z.boolean().optional(),
    pension: z
      .object({
        scheme: z.string(),
        monthlyAmount: z.number().nonnegative(),
        ppoNumber: z.string(),
        status: z.enum(["active", "ended"]).optional(),
      })
      .optional(),
    epf: z
      .object({
        uan: z.string(),
        balance: z.number().nonnegative(),
      })
      .optional(),
  }),
  verification: verificationSchema,
});

const addressNodeSchema = z.object({
  id: z.string().startsWith("addr:"),
  type: z.literal("address"),
  attrs: z.object({
    line1: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    since: z.iso.date(),
  }),
  verification: verificationSchema,
});

const employmentNodeSchema = z.object({
  id: z.string().startsWith("emp:"),
  type: z.literal("employment"),
  attrs: z.object({
    employer: z.string(),
    location: z.string(),
    designation: z.string(),
    uan: z.string().optional(),
    epfBalance: z.number().nonnegative().optional(),
    monthlyGross: z.number().nonnegative().optional(),
    since: z.iso.date().optional(),
    retiredOn: z.iso.date().optional(),
  }),
  verification: verificationSchema,
});

const businessNodeSchema = z.object({
  id: z.string().startsWith("biz:"),
  type: z.literal("business"),
  attrs: z.object({
    name: z.string(),
    entityType: z.enum(["proprietorship", "partnership", "company", "llp"]),
    udyamNumber: z.string().optional(),
    gstin: z.string().optional(),
    registeredOn: z.iso.date(),
    turnoverFY25: z.number().nonnegative(),
    sector: z.string(),
    state: z.string(),
  }),
  verification: verificationSchema,
});

const propertyNodeSchema = z.object({
  id: z.string().startsWith("prop:"),
  type: z.literal("property"),
  attrs: z.object({
    kind: z.string(),
    addressId: z.string().startsWith("addr:"),
    khataNumber: z.string(),
    authority: z.string(),
    areaSqft: z.number().positive(),
    acquiredOn: z.iso.date(),
    estimatedValue: z.number().nonnegative(),
  }),
  verification: verificationSchema,
});

const vehicleNodeSchema = z.object({
  id: z.string().startsWith("veh:"),
  type: z.literal("vehicle"),
  attrs: z.object({
    make: z.string(),
    model: z.string(),
    regNumber: z.string(),
    class: z.enum(["two-wheeler", "four-wheeler"]),
    registeredOn: z.iso.date(),
    rto: z.string(),
  }),
  verification: verificationSchema,
});

const documentNodeSchema = z.object({
  id: z.string().startsWith("doc:"),
  type: z.literal("document"),
  attrs: z.object({
    kind: z.string(),
    holderName: z.string(),
    numberMasked: z.string().optional(),
    issuedOn: z.iso.date(),
    expiresOn: z.iso.date().optional(),
    vehicleId: z.string().startsWith("veh:").optional(),
    businessId: z.string().startsWith("biz:").optional(),
    propertyId: z.string().startsWith("prop:").optional(),
    authority: z.string().optional(),
    downloaded: z.boolean().optional(),
  }),
  verification: verificationSchema,
});

export const ruleValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.tuple([z.number(), z.number()]),
]);

export const eligibilityRuleSchema = z.object({
  field: z.string(),
  op: z.enum(["==", ">=", "<=", "between", "exists", "in"]),
  value: ruleValueSchema,
  explanation: z.string(),
  missingEvidence: z.string().optional(),
});

const benefitNodeSchema = z.object({
  id: z.string().startsWith("ben:"),
  type: z.literal("benefit"),
  attrs: z.object({
    name: z.string(),
    authority: z.string(),
    valuePerYear: z.string(),
    rules: z.array(eligibilityRuleSchema).min(1),
  }),
  verification: verificationSchema,
});

export const applicationStatusSchema = z.enum([
  "draft",
  "partner-consent-pending",
  "documents-ready",
  "appointment-booked",
  "submitted",
  "processing",
  "completed",
]);

const applicationNodeSchema = z.object({
  id: z.string().startsWith("app:"),
  type: z.literal("application"),
  attrs: z.object({
    title: z.string(),
    authority: z.string(),
    status: applicationStatusSchema,
    createdOn: z.iso.date(),
    relatedTo: z.string().optional(),
    note: z.string().optional(),
    kind: z.string().optional(),
    participants: z.array(z.string().startsWith("person:")).optional(),
    witnesses: z.array(z.string().startsWith("person:")).max(3).optional(),
    appointmentOn: z.iso.datetime({ offset: true }).optional(),
    reference: z.string().optional(),
    currentStep: z.number().int().min(0).max(20).optional(),
    submittedOn: z.iso.date().optional(),
    amountPaid: z.number().nonnegative().optional(),
    businessType: z.string().min(1).max(100).optional(),
    city: z.string().min(1).max(80).optional(),
  }),
  verification: verificationSchema,
});

const obligationNodeSchema = z.object({
  id: z.string().startsWith("obl:"),
  type: z.literal("obligation"),
  attrs: z.object({
    title: z.string(),
    authority: z.string(),
    direction: z.enum(["action", "payable", "receivable"]),
    amount: z.number().nonnegative().optional(),
    dueDate: z.iso.date().optional(),
    issuedOn: z.iso.date().optional(),
    initiatedOn: z.iso.date().optional(),
    relatedTo: z.string().optional(),
    consequence: z.string().optional(),
    status: z.enum(["due", "processing", "paid", "received", "completed"]).optional(),
    note: z.string().optional(),
  }),
  verification: verificationSchema,
});

const noticeNodeSchema = z.object({
  id: z.string().startsWith("ntc:"),
  type: z.literal("notice"),
  attrs: z.object({
    channel: z.enum(["email", "sms", "letter"]),
    sender: z.string(),
    receivedOn: z.iso.date(),
    subject: z.string(),
    body: z.string(),
    amount: z.number().nonnegative().optional(),
    period: z.string().optional(),
    legitimacy: z.enum(["legitimate", "unknown"]),
    relatedTo: z.string().optional(),
  }),
  verification: verificationSchema,
});

const delegationNodeSchema = z.object({
  id: z.string().startsWith("dlg:"),
  type: z.literal("delegation"),
  attrs: z.object({
    title: z.string(),
    delegateId: z.string().startsWith("person:"),
    delegatorId: z.string().startsWith("person:"),
    scopes: z.array(z.enum(["pension", "property", "documents", "tax"])),
    expiresOn: z.iso.date(),
    status: z.enum(["active", "revoked", "expired"]),
  }),
  verification: verificationSchema,
});

export const graphNodeSchema = z.discriminatedUnion("type", [
  personNodeSchema,
  addressNodeSchema,
  employmentNodeSchema,
  businessNodeSchema,
  propertyNodeSchema,
  vehicleNodeSchema,
  documentNodeSchema,
  benefitNodeSchema,
  applicationNodeSchema,
  obligationNodeSchema,
  noticeNodeSchema,
  delegationNodeSchema,
]);

const emptyEdgeAttrsSchema = z.object({});
const spouseEdgeAttrsSchema = z.object({ marriageRegisteredAt: z.string().optional() });
const employmentEdgeAttrsSchema = z.object({ endReason: z.string().optional() });
const nomineeEdgeAttrsSchema = z.object({ instrument: z.string(), share: z.number().min(0).max(1) });
const legalHeirEdgeAttrsSchema = z.object({ share: z.number().min(0).max(1), consent: z.enum(["pending", "granted"]) });
const delegateEdgeAttrsSchema = z.object({ scopes: z.array(z.string()), expiresOn: z.iso.date() });
const subjectEdgeAttrsSchema = z.object({
  role: z.string().optional(),
  read: z.boolean().optional(),
  eligibility: z.enum(["eligible", "potentially-eligible", "not-eligible"]).optional(),
  note: z.string().optional(),
});

const edgeBaseSchema = z.object({
  id: z.string().startsWith("e:"),
  from: z.string(),
  to: z.string(),
  validFrom: z.iso.date(),
  validTo: z.iso.date().optional(),
  status: z.enum(["active", "ended", "pending"]),
  verification: verificationSchema,
});

export const graphEdgeSchema = z.discriminatedUnion("type", [
  edgeBaseSchema.extend({ type: z.literal("childOf"), attrs: emptyEdgeAttrsSchema }),
  edgeBaseSchema.extend({ type: z.literal("spouseOf"), attrs: spouseEdgeAttrsSchema }),
  edgeBaseSchema.extend({ type: z.literal("residesAt"), attrs: emptyEdgeAttrsSchema }),
  edgeBaseSchema.extend({ type: z.literal("owns"), attrs: emptyEdgeAttrsSchema }),
  edgeBaseSchema.extend({ type: z.literal("employedBy"), attrs: employmentEdgeAttrsSchema }),
  edgeBaseSchema.extend({ type: z.literal("holds"), attrs: emptyEdgeAttrsSchema }),
  edgeBaseSchema.extend({ type: z.literal("nomineeOf"), attrs: nomineeEdgeAttrsSchema }),
  edgeBaseSchema.extend({ type: z.literal("legalHeirOf"), attrs: legalHeirEdgeAttrsSchema }),
  edgeBaseSchema.extend({ type: z.literal("delegateOf"), attrs: delegateEdgeAttrsSchema }),
  edgeBaseSchema.extend({ type: z.literal("subjectOf"), attrs: subjectEdgeAttrsSchema }),
]);

export type Verification = z.infer<typeof verificationSchema>;
export type GraphNode = z.infer<typeof graphNodeSchema>;
export type GraphEdge = z.infer<typeof graphEdgeSchema>;
export type NodeType = GraphNode["type"];
export type EligibilityRule = z.infer<typeof eligibilityRuleSchema>;

type PartialUnion<T> = T extends object ? Partial<T> : never;
export type GraphAttrsPatch = PartialUnion<GraphNode["attrs"]>;
export type GraphEdgeAttrsPatch = PartialUnion<GraphEdge["attrs"]>;

export type GraphMutation =
  | { type: "addNode"; node: GraphNode }
  | { type: "addEdge"; edge: GraphEdge }
  | { type: "endEdge"; edgeId: string; validTo: string }
  | { type: "patchEdgeAttrs"; edgeId: string; attrs: GraphEdgeAttrsPatch }
  | {
      type: "patchAttrs";
      nodeId: string;
      attrs: GraphAttrsPatch;
      verification?: Verification;
    };

const graphMutationRuntimeSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("addNode"), node: graphNodeSchema }),
  z.object({ type: z.literal("addEdge"), edge: graphEdgeSchema }),
  z.object({ type: z.literal("endEdge"), edgeId: z.string().startsWith("e:"), validTo: z.iso.date() }),
  z.object({ type: z.literal("patchEdgeAttrs"), edgeId: z.string().startsWith("e:"), attrs: z.record(z.string(), z.unknown()) }),
  z.object({
    type: z.literal("patchAttrs"),
    nodeId: z.string(),
    attrs: z.record(z.string(), z.unknown()),
    verification: verificationSchema.optional(),
  }),
]);

export interface GraphEvent {
  id: string;
  actorId: string;
  occurredAt: string;
  label?: string;
  labelKey?: string;
  labelParams?: Record<string, string | number>;
  procedureId?: string;
  mutations: GraphMutation[];
}

export interface CitizenGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  events: GraphEvent[];
}

const graphEventRuntimeSchema = z.object({
  id: z.string().startsWith("evt:"),
  actorId: z.string().startsWith("person:"),
  occurredAt: z.iso.datetime({ offset: true }),
  label: z.string().min(1).max(300).optional(),
  labelKey: z.string().min(1).max(120).optional(),
  labelParams: z.record(z.string().max(80), z.union([z.string().max(300), z.number()])).optional(),
  procedureId: z.string().max(120).optional(),
  mutations: z.array(graphMutationRuntimeSchema).min(1).max(100),
}).refine((event) => Boolean(event.label || event.labelKey), { message: "Event requires a label or label key." });

export const citizenGraphSchema = z.object({
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
  events: z.array(graphEventRuntimeSchema).max(1_000),
});

export const loginSchema = z.object({
  phone: z.string().regex(/^\d{10}$/),
  personId: z.string().startsWith("person:"),
  label: z.string(),
});

export const seedSchema = z.object({
  meta: z.object({
    seedVersion: z.number().int().positive(),
    disclaimer: z.string(),
    seedDate: z.iso.date(),
  }),
  logins: z.array(loginSchema).min(1),
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
  events: z.array(graphEventRuntimeSchema),
});

export type Login = z.infer<typeof loginSchema>;
