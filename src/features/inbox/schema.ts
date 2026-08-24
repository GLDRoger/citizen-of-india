import { z } from "zod";

export const explainRequestSchema = z.object({
  content: z.string().trim().min(5).max(2_000),
  language: z.enum(["en", "hi", "kn"]),
  context: z.object({
    subject: z.string().max(300),
    sender: z.string().max(200),
    legitimacy: z.enum(["legitimate", "scam", "unknown"]),
    relatedTitle: z.string().max(300).optional(),
  }),
});

export const explainResponseSchema = z.object({
  plainLanguage: z.string().max(1_000),
  whatItMeans: z.string().max(1_000),
  nextAction: z.string().max(1_000),
  simulated: z.literal(true),
  authority: z.string().max(120),
});

export type ExplainResponse = z.infer<typeof explainResponseSchema>;
