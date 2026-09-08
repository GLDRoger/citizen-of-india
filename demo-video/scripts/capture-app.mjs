import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import { Recorder, addCaptureStyles, assemble } from "./capture-recorder.mjs";

/**
 * Records every app clip for the two-minute film as stop-motion.
 *
 * Playwright's screencast records at CSS pixels, which is too soft for the
 * push-ins Remotion makes. Instead each clip is driven frame by frame: the
 * script advances its own 30 fps clock, sets scroll positions and types
 * characters per frame, and takes a real `page.screenshot()` for each frame at
 * the device scale (3× phone, 2× desktop). ffmpeg assembles the frames.
 *
 * Clips are recorded in story order and share ONE Citizen Graph: the graph
 * saved by each clip is injected into the next, so the challan Arjun pays in
 * clip 02 is still paid when the Timeline is recorded in clip 16.
 *
 * CAPTURE_ONLY=name,name records a subset; earlier story steps are replayed
 * without screenshots so the graph state is right.
 */

const appUrl = process.env.CITIZEN_APP_URL ?? "http://127.0.0.1:3177";
const captureOnly = new Set(
  (process.env.CAPTURE_ONLY ?? "").split(",").filter(Boolean),
);
const outputDirectory = new URL("../public/clips/", import.meta.url);
const stillsDirectory = new URL("../public/stills/", import.meta.url);
const tempDirectory = await mkdtemp(join(tmpdir(), "citizen-video-capture-"));
const browser = await chromium.launch({ headless: true });

const PHONE = { width: 390, height: 844, scale: 3 };
const DESKTOP = { width: 1920, height: 1080, scale: 2 };
const AUTH_KEY = "citizen-of-india-auth";
const GRAPH_KEY = "citizen-of-india-graph";

const seedAuth = (personId, language = "en") => ({
  state: { personId, actorId: null, language, dataSaver: false },
  version: 2,
});

/** The graph carried from clip to clip (serialized localStorage value). */
let graph = null;

const record = async ({
  name,
  pathname,
  personId,
  language = "en",
  device = DESKTOP,
  run,
  still = false,
}) => {
  const recording = captureOnly.size === 0 || captureOnly.has(name);
  const framesDirectory = join(tempDirectory, name);
  await mkdir(framesDirectory, { recursive: true });
  const context = await browser.newContext({
    deviceScaleFactor: device.scale,
    hasTouch: device === PHONE,
    isMobile: device === PHONE,
    viewport: { width: device.width, height: device.height },
  });
  await context.addInitScript(
    ({ authKey, graphKey, auth, graphValue }) => {
      if (auth) localStorage.setItem(authKey, JSON.stringify(auth));
      else localStorage.removeItem(authKey);
      if (graphValue) localStorage.setItem(graphKey, graphValue);
      else localStorage.removeItem(graphKey);
    },
    {
      authKey: AUTH_KEY,
      graphKey: GRAPH_KEY,
      auth: personId ? seedAuth(personId, language) : null,
      graphValue: graph,
    },
  );
  const page = await context.newPage();
  await page.goto(`${appUrl}${pathname}`, { waitUntil: "networkidle" });
  await addCaptureStyles(page);
  const rec = new Recorder(page, framesDirectory, recording);
  await rec.hold(400);
  await run(page, rec);
  await rec.hold(400);
  if (still && recording) {
    await mkdir(stillsDirectory, { recursive: true });
    await page.screenshot({ path: new URL(`${name}.png`, stillsDirectory).pathname });
  }
  graph = await page.evaluate((key) => localStorage.getItem(key), GRAPH_KEY);
  await context.close();
  if (recording) {
    await assemble(framesDirectory, new URL(`${name}.mp4`, outputDirectory).pathname);
    process.stdout.write(`captured ${name} (${rec.count} frames)\n`);
  } else {
    process.stdout.write(`replayed ${name}\n`);
  }
  await rm(framesDirectory, { recursive: true, force: true });
};

await mkdir(outputDirectory, { recursive: true });

try {
  // ───────────────────────── Minute 1 ─────────────────────────

  // 0:15 Home on a phone: the nudges are what the record already knows.
  await record({
    name: "01-home-nudges",
    pathname: "/home",
    personId: "person:arjun",
    device: PHONE,
    run: async (page, rec) => {
      await page.getByRole("heading", { name: "What do you need?" }).waitFor();
      await rec.hold(1200);
      await rec.scrollTo(page.getByText("Before you ask", { exact: true }), 80, 1800);
      await rec.hold(2600);
      await rec.scrollBy(520, 1800);
      await rec.hold(1800);
    },
  });

  // 0:27 Plain language → the challan → paid. Desktop for legibility.
  await record({
    name: "02-intent-challan",
    pathname: "/home",
    personId: "person:arjun",
    run: async (page, rec) => {
      await rec.type(page.getByRole("textbox"), "pay my challan");
      await rec.hold(400);
      await rec.click(page.getByRole("button", { name: "Show next step" }), 900);
      const open = page.getByRole("link", { name: "View", exact: true }).first();
      await open.waitFor();
      await rec.hold(1000);
      await rec.click(open, 300);
      await page.waitForURL("**/workflows/obligations");
      await page.getByRole("heading", { name: "Pay a challan" }).waitFor();
      await rec.hold(1200);
      await rec.click(page.getByRole("button", { name: "Review payment" }), 1000);
      await rec.click(page.getByRole("button", { name: "Pay in demo" }), 200);
      await page.getByRole("heading", { name: "Challan paid" }).waitFor();
      await rec.hold(2400);
    },
  });

  // 0:33 The ripple, three phone panes recorded separately so they play at once.
  await record({
    name: "03-ripple-money",
    pathname: "/home",
    personId: "person:arjun",
    device: PHONE,
    run: async (page, rec) => {
      const money = page.getByText("Money", { exact: true }).first();
      await money.waitFor();
      await rec.scrollTo(money, 72, 1200);
      await rec.hold(3200);
    },
  });
  await record({
    name: "04-ripple-documents",
    pathname: "/documents",
    personId: "person:arjun",
    device: PHONE,
    run: async (page, rec) => {
      const receipt = page.getByText(/payment receipt/i).first();
      await receipt.waitFor();
      await rec.scrollTo(receipt, 120, 1400);
      await rec.hold(3000);
    },
  });
  await record({
    name: "05-ripple-activity",
    pathname: "/activity",
    personId: "person:arjun",
    device: PHONE,
    run: async (page, rec) => {
      const during = page.getByRole("heading", { name: /during this demo/i });
      await during.waitFor();
      await rec.scrollTo(during, 88, 1400);
      await rec.hold(3000);
    },
  });

  // 0:41 Marriage as two phones. Arjun invites…
  await record({
    name: "06-marriage-arjun-invite",
    pathname: "/workflows/marriage",
    personId: "person:arjun",
    device: PHONE,
    run: async (page, rec) => {
      await page.getByRole("heading", { name: "Invite Priya" }).waitFor();
      await rec.hold(1400);
      await rec.click(page.getByRole("button", { name: "Invite Priya" }), 300);
      await page.getByText("Waiting for Priya").first().waitFor();
      await rec.hold(2600);
    },
  });
  // …Priya reads the packet and consents on her own phone…
  await record({
    name: "07-marriage-priya-consent",
    pathname: "/workflows/marriage",
    personId: "person:priya",
    device: PHONE,
    run: async (page, rec) => {
      await page.getByRole("heading", { name: "Priya, do you consent?" }).waitFor();
      await rec.hold(1200);
      await rec.scrollTo(page.getByText("What Priya shares, exactly", { exact: true }), 96, 1500);
      await rec.hold(1800);
      const consent = page.getByRole("button", { name: "I consent" });
      await rec.scrollTo(consent, 420, 1200);
      await rec.click(consent, 300);
      await rec.hold(2400);
    },
  });
  // …and Arjun finishes: witnesses, appointment, registration, certificate.
  await record({
    name: "08-marriage-arjun-complete",
    pathname: "/workflows/marriage",
    personId: "person:arjun",
    device: PHONE,
    run: async (page, rec) => {
      await page.getByRole("heading", { name: "Choose witnesses" }).waitFor();
      await rec.hold(900);
      const witnesses = page.getByRole("main").locator('button[aria-pressed="false"]');
      await rec.click(witnesses.nth(0), 500);
      await rec.click(witnesses.nth(0), 500);
      await rec.click(page.getByRole("button", { name: "Continue with these records" }), 500);
      await page.getByRole("heading", { name: "Book the appointment" }).waitFor();
      await rec.hold(900);
      await rec.click(page.getByRole("button", { name: "Book and pay" }), 500);
      await page.getByRole("heading", { name: "Register the marriage" }).waitFor();
      await rec.hold(900);
      await rec.click(page.getByRole("button", { name: "Register marriage" }), 500);
      await page.getByRole("heading", { name: "Marriage registered" }).waitFor();
      await rec.hold(2600);
    },
  });

  // ───────────────────────── Minute 2 ─────────────────────────

  // 1:05 The record map: drag through it, tap the PAN, get the fix.
  await record({
    name: "10-record-map",
    pathname: "/you",
    personId: "person:arjun",
    run: async (page, rec) => {
      await page.getByRole("heading", { name: "Arjun Sharma" }).waitFor();
      await page.getByRole("button", { name: "Map", exact: true }).click();
      const stage = page.locator("[data-dragging]");
      await stage.waitFor();
      await rec.scrollTo(stage, 120, 1400);
      await rec.hold(1200);
      const box = await stage.boundingBox();
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      await rec.drag({ x: cx + 120, y: cy + 80 }, { x: cx - 140, y: cy + 40 }, 1300);
      await rec.hold(900);
      await rec.click(page.getByRole("button", { name: /^PAN,/ }).first(), 300);
      await page.getByRole("link", { name: "Fix name mismatch" }).waitFor();
      await rec.hold(2600);
    },
  });

  // 1:19 Delegation as two phones. Arjun asks…
  await record({
    name: "11-delegation-arjun-request",
    pathname: "/home",
    personId: "person:arjun",
    device: PHONE,
    run: async (page, rec) => {
      const nudge = page.getByText("Your mother may need help with the JP Nagar property records");
      await nudge.waitFor();
      await rec.scrollTo(nudge, 140, 1400);
      await rec.hold(1400);
      await rec.click(nudge, 300);
      await page.waitForURL("**/you**");
      const ask = page.getByRole("button", { name: "Ask Sunita for access" });
      await ask.waitFor();
      await rec.scrollTo(ask, 360, 1200);
      await rec.hold(600);
      await rec.click(ask, 300);
      await page.getByText("Request sent to Sunita").waitFor();
      await rec.hold(2200);
    },
  });
  // …Sunita sees the request and grants…
  await record({
    name: "12-delegation-sunita-grant",
    pathname: "/you",
    personId: "person:sunita",
    device: PHONE,
    run: async (page, rec) => {
      const title = page.getByText("Arjun asked to help");
      await title.waitFor();
      await rec.scrollTo(title, 120, 1400);
      await rec.hold(1600);
      await rec.click(page.getByRole("button", { name: "Share with Arjun" }), 300);
      await page.getByText("Shared with Arjun").first().waitFor();
      await rec.hold(2400);
    },
  });
  // …Arjun acts for her and sees only the shared records…
  await record({
    name: "13-delegation-arjun-acts",
    pathname: "/home",
    personId: "person:arjun",
    device: PHONE,
    run: async (page, rec) => {
      const nudge = page.getByText("Handle Sunita's paperwork");
      await nudge.waitFor();
      await rec.scrollTo(nudge, 140, 1200);
      await rec.hold(1200);
      await rec.click(nudge, 300);
      await page.waitForURL("**/you**");
      const act = page.getByRole("button", { name: "Act for Sunita" });
      await act.waitFor();
      await rec.scrollTo(act, 360, 1000);
      await rec.click(act, 300);
      await page.waitForURL("**/home**");
      await page.getByText("You are acting for Sunita").waitFor();
      await rec.hold(1400);
      await rec.glide(560, 1800);
      await rec.hold(2200);
    },
  });
  // …and Sunita revokes. The edge ends; nothing is deleted.
  await record({
    name: "14-delegation-sunita-revoke",
    pathname: "/you",
    personId: "person:sunita",
    device: PHONE,
    run: async (page, rec) => {
      const title = page.getByText("Shared with Arjun").first();
      await title.waitFor();
      await rec.scrollTo(title, 120, 1200);
      await rec.hold(1200);
      await rec.click(page.getByRole("button", { name: "Revoke" }), 300);
      await page.getByText("Access for Arjun ended").waitFor();
      await rec.hold(2600);
    },
  });

  // 1:35 When a department gets it wrong: PAN correction, then "not yet".
  await record({
    name: "15-correction-unresolved",
    pathname: "/workflows/record-correction",
    personId: "person:arjun",
    run: async (page, rec) => {
      await page.getByRole("heading", { name: "Check both names" }).waitFor();
      await rec.hold(2200);
      await rec.click(page.getByRole("button", { name: "Send correction request" }), 200);
      await page.getByRole("heading", { name: "Correction request sent" }).waitFor();
      await rec.hold(1800);
      const prompt = page.getByText("Did this solve it?");
      if (await prompt.isVisible().catch(() => false)) {
        await rec.scrollTo(prompt, 160, 1200);
        await rec.hold(800);
        await rec.click(page.getByRole("button", { name: "No, not yet" }), 300);
        await page.getByText("Still unresolved", { exact: true }).waitFor();
        await rec.hold(2200);
      } else {
        await rec.hold(1500);
      }
    },
  });

  // 1:46 The Timeline: the whole film as one ledger.
  await record({
    name: "16-timeline",
    pathname: "/activity",
    personId: "person:arjun",
    run: async (page, rec) => {
      const during = page.getByRole("heading", { name: /during this demo/i });
      await during.waitFor();
      await rec.hold(1200);
      await rec.scrollTo(during, 96, 1600);
      await rec.hold(1600);
      await rec.scrollBy(700, 3200);
      await rec.hold(1600);
    },
  });

  // 1:53 Stills of Home in three scripts for the language morph.
  for (const language of ["en", "hi", "kn"]) {
    await record({
      name: `17-home-${language}`,
      pathname: "/home",
      personId: "person:arjun",
      language,
      device: PHONE,
      still: true,
      run: async (page, rec) => {
        await page.getByRole("textbox").waitFor();
        await rec.hold(600);
      },
    });
  }

  await writeFile(
    new URL("../public/clips/graph-after-story.json", import.meta.url),
    `${graph ?? "null"}\n`,
  );
} finally {
  await browser.close();
  await rm(tempDirectory, { recursive: true, force: true });
}
