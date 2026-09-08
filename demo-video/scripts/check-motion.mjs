import assert from "node:assert/strict";
import console from "node:console";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
const require = createRequire(import.meta.url);
function moduleFrom(path, stubs = {}) {
  const source = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require: (id) => (id in stubs ? stubs[id] : require(id)),
    Math,
  });
  return exports;
}
const stamp = moduleFrom("src/motion/Stamp.tsx", {
  "../fonts": {},
  "./core": {},
});
assert.equal(stamp.stampLandingFrame(100), 106);
const ledger = moduleFrom("src/motion/LedgerRows.tsx", {
  "../fonts": {},
  "./core": { palette: {} },
});
assert.deepEqual(Array.from(ledger.ledgerRowFrames(3, 10, 8)), [10, 18, 26]);
const ticks = ledger.digitTickFrames(99, 100, 20, 1);
assert.equal(ticks.length, 3);
assert(ticks.every((t) => t.frame === 21));
assert.equal(ledger.digitTickFrames(5, 5).length, 0);
const graph = moduleFrom("src/motion/GraphNative.tsx", {
  "../fonts": {},
  "./core": { palette: {} },
});
const nodes = graph.spiralPositions(
  Array.from({ length: 14 }, (_, i) => ({ id: String(i) })),
);
assert.equal(nodes.length, 14);
assert(Math.abs(nodes[0].x) < 1e-10);
assert.equal(nodes[0].y, -120);
assert(Math.abs(Math.hypot(nodes[13].x, nodes[13].y) - 263) < 1e-9);
assert.equal(graph.spiralPositions([]).length, 0);
const gains = JSON.parse(readFileSync("src/motion/audio/voice-gain.json"));
const duck = moduleFrom("src/motion/audio/ducking.ts", {
  "./voice-gain.json": gains,
});
assert.equal(gains.length, 3600);
assert(gains.every((v) => v >= 0.25118 && v <= 1));
assert.equal(duck.sidechainDip(99, [100]), 1);
assert(Math.abs(duck.sidechainDip(100, [100]) - 10 ** (-9 / 20)) < 1e-10);
assert.equal(duck.sidechainDip(124, [100]), 1);
assert.equal(duck.musicVolume(3600, 0.5), 0.5);
const sounds = JSON.parse(readFileSync("public/audio/sfx/manifest.json"));
const runtimeDurations = moduleFrom("src/motion/audio/Sfx.tsx", { "@remotion/media": await import("@remotion/media") }).soundDurations;
assert.deepEqual(Object.fromEntries(sounds.map(({ name, duration }) => [name, duration])), JSON.parse(JSON.stringify(runtimeDurations)));
const checks = [];
for (const { name, duration } of sounds) {
  const file = `public/audio/sfx/${name}.wav`;
  const probe = JSON.parse(
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-show_streams",
      "-of",
      "json",
      file,
    ]),
  );
  assert.equal(probe.streams[0].sample_rate, "48000");
  assert.equal(probe.streams[0].channels, 1);
  assert(Math.abs(Number(probe.streams[0].duration) - duration) < 1 / 48000);
  const pcm = execFileSync("ffmpeg", [
    "-v",
    "error",
    "-i",
    file,
    "-f",
    "f32le",
    "pipe:1",
  ]);
  let peak = 0,
    sum = 0;
  for (let n = 0; n < pcm.length; n += 4) {
    const v = pcm.readFloatLE(n);
    peak = Math.max(peak, Math.abs(v));
    sum += v * v;
  }
  assert(peak > 0 && peak < 0.96, `${name}: peak ${peak}`);
  checks.push({
    name,
    seconds: duration,
    peak,
    rms: Math.sqrt(sum / (pcm.length / 4)),
  });
}
writeFileSync(
  "public/audio/sfx/verification.json",
  JSON.stringify(checks, null, 2),
);
console.log(
  "PASS: stamp landing, digit events, exact spiral, gain bounds/recovery; 15 WAV formats, durations, non-silence and peak limits.",
);
