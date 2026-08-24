import "server-only";

import OpenAI from "openai";
import { z } from "zod";

let client: OpenAI | null = null;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  client ??= new OpenAI({ apiKey, timeout: 12_000, maxRetries: 1 });
  return client;
}

interface StructuredRequest<T> {
  name: string;
  schema: z.ZodType<T>;
  instructions: string;
  input: string;
  maxOutputTokens?: number;
}

export async function generateStructured<T>({ name, schema, instructions, input, maxOutputTokens = 700 }: StructuredRequest<T>) {
  const openai = getClient();
  if (!openai) return null;
  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini",
    instructions,
    input,
    max_output_tokens: maxOutputTokens,
    reasoning: { effort: "low" },
    store: false,
    text: {
      verbosity: "low",
      format: {
        type: "json_schema",
        name,
        strict: true,
        schema: z.toJSONSchema(schema),
      },
    },
  });
  if (!response.output_text) throw new Error("OpenAI returned no text output.");
  const parsed: unknown = JSON.parse(response.output_text);
  return schema.parse(parsed);
}
