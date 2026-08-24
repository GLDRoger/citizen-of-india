import { NextResponse } from "next/server";

export const noStoreHeaders = {
  "cache-control": "no-store, max-age=0",
  "x-content-type-options": "nosniff",
};

export function invalidRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: noStoreHeaders });
}

export function rejectCrossSiteRequest(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return invalidRequest("Cross-site requests are not allowed.", 403);
  }
  const origin = request.headers.get("origin");
  if (!origin) return null;
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const expectedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? requestUrl.host;
    return originUrl.host === expectedHost ? null : invalidRequest("Cross-site requests are not allowed.", 403);
  } catch {
    return invalidRequest("Request origin is invalid.", 403);
  }
}

export async function readJsonBody(request: Request, maxBytes = 24_000): Promise<
  | { ok: true; value: unknown }
  | { ok: false; response: NextResponse }
> {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return { ok: false, response: invalidRequest("Content-Type must be application/json.", 415) };
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { ok: false, response: invalidRequest("Request is too large.", 413) };
  }

  if (!request.body) {
    return { ok: false, response: invalidRequest("Request body must be valid JSON.") };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let text = "";

  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    receivedBytes += chunk.value.byteLength;
    if (receivedBytes > maxBytes) {
      await reader.cancel();
      return { ok: false, response: invalidRequest("Request is too large.", 413) };
    }
    text += decoder.decode(chunk.value, { stream: true });
  }

  text += decoder.decode();
  try {
    const value: unknown = JSON.parse(text);
    return { ok: true, value };
  } catch {
    return { ok: false, response: invalidRequest("Request body must be valid JSON.") };
  }
}
