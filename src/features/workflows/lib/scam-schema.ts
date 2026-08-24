import { z } from "zod";

export const scamCheckRequestSchema = z.object({
  message: z.string().trim().min(5).max(2_000),
  language: z.enum(["en", "hi", "kn"]),
  knownInteractions: z.array(z.object({ sender: z.string().max(200), subject: z.string().max(300), legitimacy: z.enum(["legitimate", "scam", "unknown"]) })).max(12),
});

export const scamCheckResponseSchema = z.object({
  verdict: z.enum(["likely-legitimate", "suspicious", "unclear"]),
  confidence: z.enum(["high", "medium", "low"]),
  summary: z.string().max(1_200),
  signals: z.array(z.string().max(400)).min(1).max(8),
  nextActions: z.array(z.string().max(400)).min(1).max(5),
  simulated: z.literal(true),
  authority: z.string().max(120),
});

export type ScamCheckResponse = z.infer<typeof scamCheckResponseSchema>;
