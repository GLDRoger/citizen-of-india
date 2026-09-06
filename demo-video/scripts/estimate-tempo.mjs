import console from "node:console";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const pcm = execFileSync(
  "ffmpeg",
  [
    "-v",
    "error",
    "-i",
    "public/audio/music-bed.mp3",
    "-af",
    "lowpass=f=180",
    "-f",
    "f32le",
    "-ac",
    "1",
    "-ar",
    "12000",
    "pipe:1",
  ],
  { maxBuffer: 64 * 1024 * 1024 },
);
const hop = 120,
  energy = [];
for (let n = 0; n + hop * 4 <= pcm.length; n += hop * 4) {
  let s = 0;
  for (let j = 0; j < hop; j++) {
    const v = pcm.readFloatLE(n + j * 4);
    s += v * v;
  }
  energy.push(Math.sqrt(s / hop));
}
const onset = energy.map((e, i) => Math.max(0, e - (energy[i - 1] ?? e)));
const candidates = [];
for (let lag = 33; lag <= 100; lag++) {
  let score = 0;
  for (let i = lag; i < onset.length; i++) score += onset[i] * onset[i - lag];
  candidates.push({ lag, bpm: 6000 / lag, score });
}
candidates.sort((a, b) => b.score - a.score);
const best = candidates[0];
let phase = 0,
  max = -1;
for (let p = 0; p < best.lag; p++) {
  let s = 0;
  for (let j = p; j < onset.length; j += best.lag) s += onset[j];
  if (s > max) {
    max = s;
    phase = p;
  }
}
const bpm = Number(best.bpm.toFixed(4)),
  offset = phase / 100;
writeFileSync(
  "src/motion/audio/beats.ts",
  `/** Low-band onset autocorrelation estimate; phase is a beat-grid anchor, not verified musical bar position. */\nexport const BPM = ${bpm};\nexport const FIRST_DOWNBEAT_SECONDS = ${offset};\nexport const FIRST_DOWNBEAT_FRAME = ${offset * 30};\nexport const BEAT_FRAMES = 1800 / BPM;\nexport const nearestBeatFrame = (frame:number) => Math.round(FIRST_DOWNBEAT_FRAME + Math.round((frame-FIRST_DOWNBEAT_FRAME)/BEAT_FRAMES)*BEAT_FRAMES);\n`,
);
writeFileSync(
  "public/audio/tempo-analysis.json",
  JSON.stringify(
    {
      bpm,
      firstDownbeatSeconds: offset,
      method:
        "100 Hz low-band onset autocorrelation, 60–182 BPM; phase not bar-verified",
      candidates: candidates.slice(0, 8),
    },
    null,
    2,
  ),
);
console.log({ bpm, offset, candidates: candidates.slice(0, 4) });
