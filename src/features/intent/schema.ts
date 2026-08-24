import { z } from "zod";

export const workflowSlugSchema = z.enum([
  "death",
  "marriage",
  "obligations",
  "loan",
  "scam-check",
  "start-business",
  "service-unavailable",
]);

export const intentContextSchema = z.object({
  person: z.object({
    id: z.string().startsWith("person:"),
    name: z.string().max(120),
    maritalStatus: z.string().max(40),
    preferredLanguage: z.string().max(40).optional(),
  }),
  relationships: z.array(z.object({ name: z.string().max(120), relationship: z.string().max(40) })).max(8),
  obligations: z.array(z.object({ id: z.string().max(120), title: z.string().max(300), direction: z.string().max(40), status: z.string().max(40).optional() })).max(12),
  applications: z.array(z.object({ id: z.string().max(120), title: z.string().max(300), status: z.string().max(40) })).max(10),
  businesses: z.array(z.object({ id: z.string().max(120), name: z.string().max(200), entityType: z.string().max(80) })).max(4),
});

export const intentRequestSchema = z.object({
  text: z.string().trim().min(3).max(800),
  context: intentContextSchema,
});

export const intentResponseSchema = z.object({
  route: workflowSlugSchema,
  language: z.enum(["en", "hi", "kn", "hinglish"]),
  title: z.string().max(300),
  reply: z.string().max(1_200),
  steps: z.array(z.string().max(300)).min(1).max(6),
  clarification: z.string().max(400).nullable(),
  simulated: z.literal(true),
  authority: z.string().max(120),
});

export type WorkflowSlug = z.infer<typeof workflowSlugSchema>;
export type IntentContext = z.infer<typeof intentContextSchema>;
export type IntentResponse = z.infer<typeof intentResponseSchema>;
