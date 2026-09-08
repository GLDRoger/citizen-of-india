import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const FPS = 30;

const easeOut = (t) => 1 - (1 - t) ** 3;

export const addCaptureStyles = async (page) => {
  await page.addStyleTag({
    content: `
      html { scroll-behavior: auto !important; }
      * { caret-color: transparent !important; }
      ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
    `,
  });
};

/** A frame-by-frame recorder: every helper advances the clip clock. */
export class Recorder {
  constructor(page, directory, recording) {
    this.page = page;
    this.directory = directory;
    this.recording = recording;
    this.count = 0;
  }

  async frame() {
    if (!this.recording) return;
    const path = join(this.directory, `${String(this.count).padStart(5, "0")}.jpg`);
    await this.page.screenshot({ path, type: "jpeg", quality: 94 });
    this.count += 1;
  }

  /** Hold for `ms` of film time, taking a real screenshot for every frame. */
  async hold(ms) {
    const frames = Math.max(1, Math.round((ms / 1000) * FPS));
    for (let index = 0; index < frames; index += 1) {
      if (!this.recording) {
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
      await this.frame();
    }
  }

  /** Scroll the window to `targetY` over `ms`, one scroll step per frame. */
  async glide(targetY, ms) {
    const start = await this.page.evaluate(() => window.scrollY);
    const frames = Math.max(1, Math.round((ms / 1000) * FPS));
    for (let index = 1; index <= frames; index += 1) {
      const y = start + (targetY - start) * easeOut(index / frames);
      await this.page.evaluate((value) => window.scrollTo(0, value), y);
      await this.frame();
    }
  }

  async scrollTo(locator, offset = 96, ms = 1400) {
    const y = await locator.evaluate(
      (element, top) => element.getBoundingClientRect().top + window.scrollY - top,
      offset,
    );
    await this.glide(Math.max(0, y), ms);
  }

  async scrollBy(delta, ms = 1400) {
    const start = await this.page.evaluate(() => window.scrollY);
    await this.glide(start + delta, ms);
  }

  /** Type into a field, two frames per character. */
  async type(locator, text) {
    await locator.click();
    await this.hold(300);
    for (const character of text) {
      await this.page.keyboard.type(character);
      await this.hold(66);
    }
  }

  /** Click something and let the result settle for `afterMs`. */
  async click(locator, afterMs = 700) {
    await locator.scrollIntoViewIfNeeded();
    await this.hold(240);
    await locator.click();
    await this.hold(afterMs);
  }

  /** Pointer drag between two points over `ms`, for the record map. */
  async drag(from, to, ms = 1200) {
    const frames = Math.max(2, Math.round((ms / 1000) * FPS));
    await this.page.mouse.move(from.x, from.y);
    await this.page.mouse.down();
    for (let index = 1; index <= frames; index += 1) {
      const t = easeOut(index / frames);
      await this.page.mouse.move(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
      await this.frame();
    }
    await this.page.mouse.up();
  }
}

export const assemble = async (framesDirectory, outputPath) => {
  await execFileAsync("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-framerate",
    String(FPS),
    "-i",
    join(framesDirectory, "%05d.jpg"),
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "15",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
};

