import console from "node:console";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
const script = JSON.parse(readFileSync("content/script.json", "utf8"));
const rms = Array(3600).fill(0);
const occupied = new Set();
for (const scene of script) {
  const pcm = execFileSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-i",
      `public/audio/voiceover/${scene.id}.wav`,
      "-f",
      "f32le",
      "-ar",
      "48000",
      "-ac",
      "1",
      "pipe:1",
    ],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  const samples = pcm.length / 4;
  if (Math.abs(samples / 1600 - scene.durationInFrames) > 2)
    console.warn(
      `${scene.id}: WAV has ${(samples / 1600).toFixed(1)} frames; scene has ${scene.durationInFrames}; analysis pads/trims only, source untouched`,
    );
  for (let f = 0; f < scene.durationInFrames; f++) {
    const global = scene.startFrame + f;
    if (global >= 3600 || occupied.has(global))
      throw new Error("Invalid scene coverage");
    occupied.add(global);
    let sum = 0;
    for (let j = f * 1600; j < Math.min((f + 1) * 1600, samples); j++) {
      const v = pcm.readFloatLE(j * 4);
      sum += v * v;
    }
    rms[global] = Number(Math.sqrt(sum / 1600).toFixed(6));
  }
}
if (occupied.size !== 3600) throw new Error("Incomplete film coverage");
writeFileSync(
  "public/audio/voice-envelope.json",
  JSON.stringify({ fps: 30, frames: 3600, rms }) + "\n",
);
// Precompute deterministic attack/release with six-frame lookahead.
let envelope = 0;
const duck = rms.map((_, f) => {
  const target = Math.max(...rms.slice(f, f + 7)) > 0.012 ? 1 : 0;
  envelope =
    target > envelope
      ? Math.min(1, envelope + 1 / 6)
      : Math.max(0, envelope - 1 / 20);
  return Number((1 - envelope * (1 - 10 ** (-12 / 20))).toFixed(6));
});
writeFileSync("src/motion/audio/voice-gain.json", JSON.stringify(duck) + "\n");
console.log(
  `Wrote ${rms.length} RMS frames; ${rms.filter((v) => v > 0.012).length} speech frames`,
);
