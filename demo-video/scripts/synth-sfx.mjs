import console from "node:console";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
mkdirSync("public/audio/sfx", { recursive: true });
const sounds = [];
function render(name, duration, sources, filters) {
  const args = ["-hide_banner", "-loglevel", "error", "-y"];
  for (const src of sources) args.push("-f", "lavfi", "-i", src);
  args.push(
    "-filter_complex",
    `${filters};[mix]afade=t=out:st=${Math.max(0, duration - 0.018)}:d=0.018,alimiter=limit=0.95:level=false:latency=true[out]`,
    "-map",
    "[out]",
    "-t",
    String(duration),
    "-ar",
    "48000",
    "-ac",
    "1",
    "-c:a",
    "pcm_s24le",
    `public/audio/sfx/${name}.wav`,
  );
  execFileSync("ffmpeg", args);
  sounds.push({ name, duration });
}
const sine = (expr, d) => `aevalsrc='${expr}':s=48000:d=${d}`;
const noise = (d, seed = 42) =>
  `anoisesrc=color=pink:sample_rate=48000:duration=${d}:seed=${seed}`;
const sub = (amp, d) =>
  sine(
    `${amp}*sin(2*PI*(45*t+45*0.02*(1-exp(-t/0.02))))*(1-exp(-t/0.001))*exp(-t/0.085)`,
    d,
  );
for (const [name, amp, d] of [
  ["impact-sub-big", 0.88, 0.4],
  ["impact-sub-small", 0.53, 0.28],
])
  render(
    name,
    d,
    [sub(amp, d), noise(d)],
    "[1:a]highpass=f=1300,lowpass=f=6000,afade=t=out:st=0:d=0.022,volume=0.16[n];[0:a][n]amix=inputs=2:normalize=0[mix]",
  );
render(
  "stamp-thud",
  0.16,
  [sub(0.52, 0.16), noise(0.16)],
  "[1:a]highpass=f=200,lowpass=f=400,volume=2,afade=t=out:st=0:d=0.13[n];[0:a][n]amix=inputs=2:normalize=0[mix]",
);
render(
  "paper-slide",
  0.38,
  [noise(0.38)],
  "[0:a]highpass=f=500,lowpass=f=4200,volume=0.65,afade=t=in:st=0:d=0.13,afade=t=out:st=0.13:d=0.25[mix]",
);
for (const [name, d] of [
  ["riser-long", 1.2],
  ["riser-short", 0.6],
])
  render(
    name,
    d,
    [noise(d), sine(`0.13*sin(2*PI*(180*t+650*t*t/${d}))*(t/${d})`, d)],
    `[0:a]highpass=f=600,lowpass=f=6000,asendcmd=c='0 highpass frequency 600; ${d * 0.25} highpass frequency 1000; ${d * 0.5} highpass frequency 1800; ${d * 0.75} highpass frequency 3000',volume=0.5,afade=t=in:st=0:d=${d}[n];[n][1:a]amix=inputs=2:normalize=0[mix]`,
  );
for (const [name, gain] of [
  ["ledger-tick", 0.32],
  ["ledger-tick-soft", 0.13],
  ["tap", 0.18],
])
  render(
    name,
    name === "tap" ? 0.06 : 0.04,
    [noise(name === "tap" ? 0.06 : 0.04)],
    `[0:a]highpass=f=1100,lowpass=f=6500,volume=${gain},afade=t=in:st=0:d=0.0005[mix]`,
  );
render(
  "edge-draw",
  0.4,
  [noise(0.4)],
  "[0:a]highpass=f=1800,lowpass=f=7000,volume=0.35,afade=t=in:st=0:d=0.18,afade=t=out:st=0.22:d=0.18[mix]",
);
render(
  "consent-chime",
  0.5,
  [
    sine(
      ".18*(sin(2*PI*660*t)+sin(2*PI*990*t))*(1-exp(-t/0.006))*exp(-t/0.12)",
      0.5,
    ),
  ],
  "[0:a]anull[mix]",
);
render(
  "edge-end",
  0.3,
  [sine(".24*sin(2*PI*(220*t-180*t*t))*(1-exp(-t/0.008))*exp(-t/0.08)", 0.3)],
  "[0:a]anull[mix]",
);
writeFileSync(
  "public/audio/sfx/manifest.json",
  JSON.stringify([...JSON.parse(readFileSync("public/audio/sfx/manifest.json", "utf8")).filter(({ name }) => !sounds.some((sound) => sound.name === name)), ...sounds], null, 2) + "\n",
);
console.log(sounds);
