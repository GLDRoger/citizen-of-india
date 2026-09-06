/**
 * The demo world is frozen on 28 August 2026 (IST). Seed records, simulated
 * receipts and "days left" all count from this date, so the story never drifts
 * as real time passes. The real wall-clock time of day is kept so events that
 * happen during one session still sort in the order they occurred.
 */
export const DEMO_TODAY = "2026-08-28";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function demoNow(): Date {
  const real = new Date();
  const ist = new Date(real.getTime() + IST_OFFSET_MS);
  const hh = String(ist.getUTCHours()).padStart(2, "0");
  const mm = String(ist.getUTCMinutes()).padStart(2, "0");
  const ss = String(ist.getUTCSeconds()).padStart(2, "0");
  return new Date(`${DEMO_TODAY}T${hh}:${mm}:${ss}+05:30`);
}

export function demoTimestamp() {
  return demoNow().toISOString();
}
