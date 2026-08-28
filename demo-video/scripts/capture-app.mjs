import { execFile } from "node:child_process";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { chromium } from "playwright";

const execFileAsync = promisify(execFile);
const appUrl = process.env.CITIZEN_APP_URL ?? "http://127.0.0.1:3100";
const captureOnly = new Set(
  (process.env.CAPTURE_ONLY ?? "").split(",").filter(Boolean),
);
const outputDirectory = new URL("../public/clips/", import.meta.url);
const tempDirectory = await mkdtemp(join(tmpdir(), "citizen-video-capture-"));
const browser = await chromium.launch({ headless: true });

const pause = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const seedAuth = (personId) => ({
  state: { personId, language: "en", dataSaver: false },
  version: 2,
});

const glideScroll = async (page, targetY, durationMs) => {
  await page.evaluate(
    ({ duration, destination }) =>
      new Promise((resolve) => {
        const start = window.scrollY;
        const distance = destination - start;
        const startedAt = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          window.scrollTo(0, start + distance * eased);
          if (progress < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      }),
    { destination: targetY, duration: durationMs },
  );
};

const addCaptureStyles = async (page) => {
  await page.addStyleTag({
    content: `
      html { scroll-behavior: auto !important; }
      * { caret-color: transparent !important; }
      ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
    `,
  });
};

const transcode = async (inputPath, outputPath) => {
  await execFileAsync("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    inputPath,
    "-vf",
    "fps=30",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "16",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
};

const record = async ({
  name,
  pathname,
  personId,
  run,
  viewport = { width: 1920, height: 1080 },
}) => {
  if (captureOnly.size > 0 && !captureOnly.has(name)) return;
  const recordDirectory = join(tempDirectory, name);
  await mkdir(recordDirectory, { recursive: true });
  const context = await browser.newContext({
    recordVideo: { dir: recordDirectory, size: viewport },
    viewport,
  });

  if (personId) {
    await context.addInitScript((auth) => {
      localStorage.setItem("citizen-of-india-auth", JSON.stringify(auth));
      localStorage.removeItem("citizen-of-india-graph");
    }, seedAuth(personId));
  } else {
    await context.addInitScript(() => {
      localStorage.removeItem("citizen-of-india-auth");
      localStorage.removeItem("citizen-of-india-graph");
    });
  }

  const page = await context.newPage();
  const video = page.video();
  await page.goto(`${appUrl}${pathname}`, { waitUntil: "networkidle" });
  await addCaptureStyles(page);
  await pause(450);
  await run(page);
  await pause(450);
  await page.close();
  const rawPath = await video.path();
  await context.close();

  const outputPath = new URL(`${name}.mp4`, outputDirectory);
  await transcode(rawPath, outputPath.pathname);
  process.stdout.write(`captured ${name}\n`);
};

await mkdir(outputDirectory, { recursive: true });

try {
  await record({
    name: "01-problem-to-hero",
    pathname: "/#problem",
    run: async (page) => {
      await pause(900);
      await glideScroll(page, 0, 6000);
      await pause(1400);
    },
  });

  await record({
    name: "02-citizen-graph",
    pathname: "/#origin",
    run: async (page) => {
      const heading = page.getByRole("heading", {
        name: "A service can exist and still be invisible.",
      });
      await heading.waitFor();
      await pause(1800);
      const lowerStory = await page.evaluate(() => window.scrollY + 440);
      await glideScroll(page, lowerStory, 3000);
      await pause(1800);
    },
  });

  await record({
    name: "03-home-brief",
    pathname: "/home",
    personId: "person:arjun",
    run: async (page) => {
      await page.getByRole("heading", { name: "What do you need?" }).waitFor();
      await pause(1000);
      const attentionY = await page
        .locator("#attention")
        .evaluate(
          (element) =>
            element.getBoundingClientRect().top + window.scrollY - 90,
        );
      await glideScroll(page, attentionY, 2700);
      await pause(2300);
      await glideScroll(page, attentionY + 650, 2800);
      await pause(1100);
    },
  });

  await record({
    name: "04-plain-language",
    pathname: "/home",
    personId: "person:arjun",
    run: async (page) => {
      const prompt = page.getByRole("textbox");
      await prompt.click();
      await prompt.pressSequentially("Check my EPFO passbook", { delay: 48 });
      await pause(550);
      await page.getByRole("button", { name: "Show next step" }).click();
      const open = page.getByRole("link", { name: "Open" });
      await open.waitFor();
      await pause(1800);
      await open.click();
      await page.waitForURL("**/workflows/epfo");
      await page.getByRole("heading", { name: "Check EPFO records" }).waitFor();
      await pause(1700);
    },
  });

  await record({
    name: "05-epfo-journey",
    pathname: "/workflows/epfo",
    personId: "person:arjun",
    run: async (page) => {
      await page.getByRole("heading", { name: "Your EPF account" }).waitFor();
      await pause(1100);
      await page
        .getByRole("button", { name: /Review latest contribution/ })
        .click();
      await pause(1200);
      await page.getByRole("button", { name: "Report a problem" }).click();
      await pause(1100);
      await page.getByLabel("The contribution is missing").check();
      await pause(650);
      await page
        .getByRole("button", { name: /Register EPFO grievance/ })
        .click();
      await page
        .getByRole("heading", { name: "EPFO grievance registered" })
        .waitFor();
      await pause(2100);
      await page.getByRole("link", { name: /Return home/ }).click();
      await page.waitForURL("**/home#attention");
      const task = page.locator("[id='task-app:arjun-epfo-grievance']");
      if (!(await task.isVisible())) {
        await page.getByText(/Show \d+ more/).click();
      }
      await task.waitFor();
      await pause(2700);
    },
  });

  await record({
    name: "06-records",
    pathname: "/you",
    personId: "person:arjun",
    run: async (page) => {
      await page.getByRole("heading", { name: "Arjun Sharma" }).waitFor();
      await pause(1300);
      await glideScroll(page, 920, 3300);
      await pause(1200);
      await glideScroll(page, 1730, 3000);
      await pause(900);
    },
  });

  await record({
    name: "07-services",
    pathname: "/services",
    personId: "person:arjun",
    run: async (page) => {
      await page.getByRole("heading", { name: "Choose a service" }).waitFor();
      await pause(1300);
      await glideScroll(page, 950, 3800);
      await pause(1400);
    },
  });

  await record({
    name: "08-benefits-and-loans",
    pathname: "/discover",
    personId: "person:arjun",
    run: async (page) => {
      await page.getByRole("heading", { name: "Benefits for you" }).waitFor();
      await pause(1900);
      await page.getByRole("link", { name: /business loans/i }).click();
      await page.waitForURL("**/workflows/loan");
      await pause(1200);
      await glideScroll(page, 540, 2200);
      await pause(1500);
    },
  });

  await record({
    name: "09-pan-comparison",
    pathname: "/workflows/record-correction",
    personId: "person:arjun",
    run: async (page) => {
      await page.getByRole("heading", { name: "Check both names" }).waitFor();
      await pause(5200);
    },
  });

  await record({
    name: "10-payment-receipt",
    pathname: "/workflows/obligations",
    personId: "person:arjun",
    run: async (page) => {
      await page.getByRole("heading", { name: "Pay a challan" }).waitFor();
      await pause(800);
      await page.getByRole("button", { name: "Review payment" }).click();
      await pause(650);
      await page.getByRole("button", { name: "Pay in demo" }).click();
      await page.getByRole("heading", { name: "Challan paid" }).waitFor();
      await pause(900);
      await page.getByRole("link", { name: "Return home" }).click();
      await page.waitForURL("**/home#attention");
      await page.getByText("Money", { exact: true }).waitFor();
      await pause(1200);
      await page.getByRole("link", { name: "View documents" }).click();
      await page.waitForURL("**/documents");
      await page.getByText("Payment receipt", { exact: true }).waitFor();
      await pause(1300);
      await page.getByRole("link", { name: "Home", exact: true }).click();
      await page.waitForURL("**/home");
      const activity = page.getByText("Recent activity", { exact: true });
      await activity.scrollIntoViewIfNeeded();
      await activity.click();
      await page.getByText("Traffic e-challan paid").waitFor();
      await pause(1600);
    },
  });

  await record({
    name: "11-gstr-acknowledgement",
    pathname: "/workflows/gstr3b",
    personId: "person:arjun",
    run: async (page) => {
      await page.getByRole("heading", { name: "August GST return" }).waitFor();
      await pause(900);
      await page.getByRole("checkbox").check();
      await pause(500);
      await page
        .getByRole("button", { name: "File GST return in demo" })
        .click();
      await page.getByRole("heading", { name: "GST return filed" }).waitFor();
      await pause(2400);
    },
  });

  await record({
    name: "12-revocable-access",
    pathname: "/you",
    personId: "person:sunita",
    run: async (page) => {
      await page
        .getByRole("heading", {
          name: "Share linked family paperwork with Arjun",
        })
        .waitFor();
      await pause(1200);
      await page.getByRole("button", { name: "Share with Arjun" }).click();
      await page
        .getByRole("heading", { name: "Linked family paperwork" })
        .waitFor();
      await pause(1800);
      await page.getByRole("button", { name: "Revoke" }).click();
      await page
        .getByRole("heading", { name: "Family paperwork access ended" })
        .waitFor();
      await pause(1700);
    },
  });

  await record({
    name: "13-mobile-multilingual",
    pathname: "/home",
    personId: "person:arjun",
    viewport: { width: 390, height: 844 },
    run: async (page) => {
      await page.getByRole("heading", { name: "What do you need?" }).waitFor();
      await pause(1100);
      await page.locator("summary").first().click();
      await pause(700);
      await page.getByRole("button", { name: "हिन्दी" }).click();
      await page.getByRole("heading", { name: "आपको क्या चाहिए?" }).waitFor();
      await pause(1600);
      await glideScroll(page, 760, 2400);
      await pause(1100);
    },
  });

  await record({
    name: "14-service-boundary",
    pathname: "/#problem",
    run: async (page) => {
      const heading = page.getByRole("heading", {
        name: "A better screen cannot clear a backlog.",
      });
      await heading.waitFor();
      await pause(7000);
    },
  });

  await record({
    name: "15-graph-assemble",
    pathname: "/",
    run: async (page) => {
      const graph = page.locator("#graph");
      const graphTop = await graph.evaluate(
        (element) => element.getBoundingClientRect().top + window.scrollY,
      );
      await glideScroll(page, graphTop, 1200);
      await pause(450);
      await glideScroll(page, graphTop + 1900, 6500);
      await pause(1600);
    },
  });

  await record({
    name: "16-simulated-response",
    pathname: "/workflows/obligations",
    personId: "person:arjun",
    run: async (page) => {
      await page.getByRole("heading", { name: "Pay a challan" }).waitFor();
      await pause(1200);
      await page.getByRole("button", { name: "Review payment" }).click();
      await page.getByText("Simulated", { exact: true }).last().waitFor();
      await pause(4200);
    },
  });

  await record({
    name: "17-about-boundary",
    pathname: "/about",
    run: async (page) => {
      const heading = page.getByRole("heading", {
        name: "A better screen cannot clear a backlog.",
      });
      await heading.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -110));
      await pause(4600);
    },
  });
} finally {
  await browser.close();
  await rm(tempDirectory, { recursive: true, force: true });
}
