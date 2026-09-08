"use client";

import { useCitizenStore } from "./store";

const PENDING_UPDATE_KEY = "citizen-of-india-pending-seed-update";
const REQUEST_LIFETIME_MS = 15 * 60 * 1000;

/** Record explicit consent, then leave the old JavaScript document behind. */
export function requestSeedUpdate() {
  window.sessionStorage.setItem(PENDING_UPDATE_KEY, JSON.stringify({
    requestedAt: Date.now(),
    sourceDocument: window.performance.timeOrigin,
  }));
  window.location.replace("/home");
}

/** Run only after graph, auth and workflow persistence have hydrated. */
export function applyPendingSeedUpdate() {
  let raw: string | null;
  try {
    raw = window.sessionStorage.getItem(PENDING_UPDATE_KEY);
  } catch {
    // Unavailable session storage must not stop an ordinary visit or erase data.
    return false;
  }
  if (!raw) return false;

  let request: { requestedAt?: unknown; sourceDocument?: unknown } | null;
  try {
    request = JSON.parse(raw);
  } catch {
    window.sessionStorage.removeItem(PENDING_UPDATE_KEY);
    return false;
  }
  const age = typeof request?.requestedAt === "number" ? Date.now() - request.requestedAt : NaN;
  if (!Number.isFinite(age) || age < 0 || age > REQUEST_LIFETIME_MS || typeof request?.sourceDocument !== "number") {
    window.sessionStorage.removeItem(PENDING_UPDATE_KEY);
    return false;
  }
  // A remount in the old document is not the requested full-page navigation.
  if (request.sourceDocument === window.performance.timeOrigin) return false;

  useCitizenStore.getState().resetDemo();
  // Clear only after the fresh seed and cleared workflow drafts are persisted.
  window.sessionStorage.removeItem(PENDING_UPDATE_KEY);
  return true;
}
