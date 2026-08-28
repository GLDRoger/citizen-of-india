import { execFile } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const sourcePath = new URL("../.media/audio/bgm/bgm_001.mp3", import.meta.url);
const outputPath = new URL("../public/audio/music-bed.mp3", import.meta.url);

await access(sourcePath);
await mkdir(new URL("../public/audio/", import.meta.url), { recursive: true });
await execFileAsync("ffmpeg", [
  "-hide_banner",
  "-loglevel",
  "error",
  "-y",
  "-i",
  sourcePath.pathname,
  "-t",
  "120",
  "-af",
  "highpass=f=70,lowpass=f=14000,equalizer=f=1900:t=q:w=1.15:g=-2.5,afade=t=in:st=0:d=1.8,afade=t=out:st=116:d=4,loudnorm=I=-23:TP=-3:LRA=7",
  "-ar",
  "48000",
  "-ac",
  "2",
  "-c:a",
  "libmp3lame",
  "-b:a",
  "256k",
  outputPath.pathname,
]);

process.stdout.write(
  "prepared 120s Indian instrumental music bed from bgm_001.mp3\n",
);
