import { spawn } from "node:child_process";
import { mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";

const outputName = process.env.VIDEO_OUTPUT_NAME ?? "citizen-hackathon-demo";
if (!/^[a-z0-9-]+$/i.test(outputName)) throw new Error("VIDEO_OUTPUT_NAME must be a simple filename without an extension.");
const outputDirectory = new URL("../out/", import.meta.url);
const untrimmedPath = join(
  outputDirectory.pathname,
  `${outputName}.untrimmed.mp4`,
);
const finalPath = join(outputDirectory.pathname, `${outputName}.mp4`);

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else
        reject(new Error(`${command} exited with code ${code ?? "unknown"}.`));
    });
  });

await mkdir(outputDirectory, { recursive: true });
await run("npx", [
  "remotion",
  "render",
  "CitizenHackathonDemo",
  untrimmedPath,
  "--codec=h264",
  "--audio-codec=aac",
  "--crf=16",
  "--log=warn",
]);
await run("ffmpeg", [
  "-hide_banner",
  "-loglevel",
  "error",
  "-y",
  "-i",
  untrimmedPath,
  "-t",
  "120",
  "-c:v",
  "copy",
  "-af",
  "loudnorm=I=-16:TP=-1.5:LRA=9",
  "-c:a",
  "aac",
  "-b:a",
  "192k",
  "-ar",
  "48000",
  "-movflags",
  "+faststart",
  finalPath,
]);
await unlink(untrimmedPath);
process.stdout.write(`rendered ${finalPath}\n`);
