# Citizen motion + sound handoff

## Deliverables

- `src/motion/`: `Sheet.tsx`, `Stamp.tsx`, `LedgerRows.tsx`, `PhoneFrame.tsx`, `QuestionCard.tsx`, `GraphNative.tsx`, `TileGrid.tsx`, `Identity.tsx`, `Transitions.tsx`, `MotionShowcase.tsx`, `core.ts`, `index.ts`.
- `src/motion/audio/`: `Sfx.tsx`, `ducking.ts`, `beats.ts`, generated `voice-gain.json`.
- Tooling: `scripts/synth-sfx.mjs`, `voice-envelope.mjs`, `estimate-tempo.mjs`, `download-motion-fonts.mjs`, `check-motion.mjs`.
- Assets: `public/audio/sfx/*.wav`, `manifest.json`, `verification.json`; `public/audio/voice-envelope.json`, `tempo-analysis.json`; `public/fonts-anek-{devanagari,kannada}.woff2` and matching OFL notices.
- Append-only font-family registration in `src/fonts.ts`; second composition in `src/Root.tsx`. Existing composition retained. No dependencies added. No edits to protected scripts, scenes, captures, voiceovers, or film timeline.
- `out/motion-showcase.mp4`, `out/motion-showcase-contact.jpg`, `out/motion-showcase-probe.json`; static preview bundle in `out/motion-preview`.

The showcase is a **62-second component study**, not the assembled 120-second film. 1920×1080, 30 fps, 1,860 frames. Its graph labels and three-pane summary are illustrative component fixtures, not additional application data.

## API

Import from `src/motion`. Components return React elements. All frame props are relative to the enclosing Sequence, except `musicVolume`, which expects the film-absolute frame. Defaults below are part of the API. Colors use the supplied palette; no shadows or gradients. Circular graph discs/touch rings are intentional exceptions to rectangular corner rules.

```ts
type Point = {x: number; y: number};
type SheetProps = {
  children?: ReactNode; enterAt?: number; exitAt?: number;
  stackOffset?: {x: number; y: number; rotate?: number};
  collapseAt?: number; tab?: string; style?: CSSProperties;
};
Sheet({children, enterAt=0, exitAt, stackOffset={x:0,y:0}, collapseAt, tab, style}: SheetProps)
SheetStack({labels=['IDENTITY PORTAL','PAYMENT PORTAL','DOCUMENT PORTAL'],
  enterAt=0, collapseAt=75, children}: {
  labels?: string[]; enterAt?: number; collapseAt?: number; children?: ReactNode;
})
Stamp({text, at=0, liftAt, variant='green', fontSize=42}: {
  text: string; at?: number; liftAt?: number; variant?: 'green'|'brick'; fontSize?: number;
})
stampLandingFrame(at=0): number // at + 6

type LedgerRow = {label: string; value?: string; from?: number; to?: number;
  prefix?: string; suffix?: string; countFrames?: number};
LedgerRows({rows, at=0, stagger=8}: {rows: LedgerRow[]; at?: number; stagger?: number})
ledgerRowFrames(count: number, at=0, stagger=8): number[]
digitTickFrames(from: number, to: number, at=0, duration=30): {frame:number; digit:number}[]
// Integer interpolation; digit 0 is units. De-duplicate frames before playing one tick per frame.

PhoneFrame({children, scale=1, at=0}: {children:ReactNode; scale?:number; at?:number})
PhonePair({left, right, connector, scale=.92, gap=340}: {
  left:ReactNode; right:ReactNode; connector?:ReactNode; scale?:number; gap?:number;
})
TouchRipple({x,y,at=0}: {x:number; y:number; at?:number})
// Phone content is 390×844 logical; outer footprint 406×860, multiplied by scale.
// Put <Video objectFit="cover" style={{width:'100%',height:'100%'}} /> inside.

QuestionCard({question, at=0, hold=75, width=1500, fontSize=104}: {
  question:string; at?:number; hold?:number; width?:number; fontSize?:number;
}) // 22f enter, then hold, then 16f exit. Supply copy sized for <=2 lines.

type GraphRecord = {id:string; label:string; group:'identity'|'family'|'work'|'assets'};
GraphNative({nodes, name='YOU', at=0, stagger=3, highlight, scale=1.55}: {
  nodes:GraphRecord[]; name?:string; at?:number; stagger?:number; scale?:number;
  highlight?:{from:string; to:string; at?:number; endAt?:number; label?:string};
}) // 'center' addresses the centre node. Unknown highlight IDs produce no highlight.
spiralPositions<T extends GraphRecord>(nodes:T[]): (T & Point)[]
HighlightEdge({from,to,at=0,endAt,label='spouseOf',color=palette.brick}: {
  from:Point; to:Point; at?:number; endAt?:number; label?:string; color?:string;
}) // SVG <g>: place inside an SVG. endAt preserves the line and adds an ended tick.

TileGrid({at=0,gatherAt=45,fanAt=115,questions=[
  'What about UMANG?','Who gives consent?','What if it is wrong?','What stays on record?'
]}: {at?:number; gatherAt?:number; fanAt?:number; questions?:string[]})
// 249 tiles; first four questions used. Local canvas 1700×820.
LanguageMorph({at=0,hold=45,fontSize=118}: {at?:number; hold?:number; fontSize?:number})
// EN→HI→KN; transitions start at hold+15 and 2*(hold+15), each lasts 15f.
Ticker({items}: {items:string[]})
EndCard({at=0,liftAt=95,url='citizen-of-india.vercel.app',
  tagline='One record, carried forward'}: {
  at?:number; liftAt?:number; url?:string; tagline?:string;
}) // Stamp starts at at+35, lands at at+41; liftAt uses enclosing frame space.

type TransitionProps = {from:ReactNode; to:ReactNode; startFrame:number};
SheetWipe({from,to,startFrame}: TransitionProps) // 24f; children retain enclosing clock
StampCut({from,to,startFrame}: TransitionProps) // content changes at startFrame+6
MotionShowcase() // Registered id: MotionShowcase

type Sound = keyof typeof soundDurations; // All names in the table below
Hit({at,sound,gain=.8}: {at:number; sound:Sound; gain?:number})
Riser({endsAt,length,gain=.6}: {endsAt:number; length:'long'|'short'; gain?:number})
musicVolume(frame:number,base:number): number
sidechainDip(frame:number,hitFrames:readonly number[]): number
nearestBeatFrame(frame:number): number
```

Sheet entry/collapse and graph fly-in use damping 200. Stamp scale is explicitly keyframed 1.6 → 1.08 → .97 → 1.02 → 1 over ten frames, with landing on frame six. Tile springs use damping 14/mass .8 and clamp to 4% overshoot. Rules and edges necessarily animate SVG stroke/line reveal; other movement is transform/opacity. This is deterministic film motion, not interactive UI; no browser-preference-dependent render states.

## Showcase frame map (inclusive)

| Frames | Demonstration / useful inspection frame |
|---|---|
| 0–149 | Misaligned sheets; collapse at 75; inspect 45 and 100 |
| 150–299 | Exact product spiral geometry, edge draw, ended edge; 230 / 280 |
| 300–449 | Real Home footage, phone, tap, rows, count-up, stamp; 400 |
| 450–599 | Three simultaneous panes, count-down, paid stamp; 550 |
| 600–749 | Real marriage clips, spouseOf, consent chime/stamp; 700 |
| 750–959 | 249 tiles, three piles, surviving file, four-question fan; 835 / 910 |
| 960–1109 | Question enter, hold, exit; 1020 / 1080 |
| 1110–1259 | Real delegation clips, question interruption, retained ended edge; 1220 |
| 1260–1469 | EN / HI / KN, 15-frame crossfades; 1290 / 1350 / 1410 |
| 1470–1589 | SheetWipe begins 1500; inspect 1510 / 1550 |
| 1590–1709 | StampCut lands 1626; inspect 1626 / 1660 |
| 1710–1859 | Logo, URL, tagline; stamp lands 1751, lifts 1820; 1790 / 1840 |

## Sound

All new effects are deterministic procedural FFmpeg synthesis, 48 kHz mono PCM 24-bit WAV. Seeded pink noise; no samples or new licensed sound sources. Limiter latency compensation keeps 5 ms ticks audible and impacts on their cue frame.

| Sound | Duration |
|---|---:|
| impact-sub-big | .450 s |
| impact-sub-small | .350 s |
| stamp-thud | .180 s |
| paper-slide | .380 s |
| riser-long | 1.200 s |
| riser-short | .600 s |
| ledger-tick | .005 s |
| ledger-tick-soft | .005 s |
| edge-draw | .400 s |
| consent-chime | .500 s |
| edge-end | .300 s |
| tap | .035 s |

Sub phase starts at 90 Hz and drops toward 45 Hz over 60 ms. Stamp adds 200–400 Hz woody noise. Risers combine upward-filtered noise and sine glide; their file END aligns to `endsAt`. Chime uses 660/990 Hz. Effects retain tails, with short click-prevention fades.

Film mixing example (do not pass Sequence-local frames to the voice envelope):

```tsx
<Audio src={staticFile('audio/music-bed.mp3')}
  volume={f => musicVolume(f, .22) * sidechainDip(f, filmHitFrames)} />
<Riser endsAt={impactFrame} length="long" />
<Hit at={impactFrame} sound="impact-sub-big" gain={.8} />
<Hit at={stampLandingFrame(stampAt)} sound="stamp-thud" />
```

`voice-envelope.mjs` reads each script scene's WAV, analyzes 1,600 samples/frame, and writes all 3,600 RMS values. Speech threshold .012, six-frame lookahead/attack, twenty-frame release, −12 dB speech floor. Sidechain holds −9 dB for ten frames then recovers over fourteen. Overlapping hits take the strongest dip, not multiplied dips. The showcase uses its own cue-aligned sidechain and no voice track; the film envelope is intended for assembly.

Every supplied WAV was **four frames shorter** than its script scene. Analysis pads those tails with silence (and warns); source files are untouched. Missing files, overlapping scenes, or incomplete scene coverage fail the analysis.

Tempo: **73.1707 BPM**, beat-grid phase **0.17 s / 5.1 frames**. Low-band onset autocorrelation at 100 Hz; competing peaks 111.11 and 109.09 BPM. Confidence is low: the exported `FIRST_DOWNBEAT_SECONDS` is a pulse-grid anchor, **not an aurally verified bar downbeat**. Do not automatically retime the narration or mandatory scene boundaries from this estimate.

The existing music bed is unchanged. Keep the existing `MUSIC-CREDITS.md` attribution when publishing: **Music: Bombay Summer by Shane Ivers — https://www.silvermansound.com**. New font OFL notices accompany the two downloads.

## Verification and limits

- `npm run lint` (ESLint + TypeScript): passed after correcting Sequence premount typing and ES2018 string indexing.
- `node scripts/synth-sfx.mjs`, `node scripts/voice-envelope.mjs`, `node scripts/estimate-tempo.mjs`: ran successfully.
- `node scripts/check-motion.mjs`: passed exact spiral coordinates, landing frame, digit events, 3,600 gain bounds, sidechain recovery; checked all 12 WAVs for sample rate, channels, exact duration, non-silence, and peak below .96. Measurements in `public/audio/sfx/verification.json`.
- `npx remotion bundle --out-dir=out/motion-preview`: passed. Browser inspection verified real footage, question fan, graph, Kannada shaping, and corrected the overflowing Documents title. Contact sheet covers all twelve chapters.
- Requested CLI command was attempted: `npx remotion render MotionShowcase out/motion-showcase.mp4 --codec=h264`. Chromium launch failed with macOS `bootstrap_check_in ... Permission denied (1100)`. No security settings were changed. `npm run dev -- --port=3333` also hit `EMFILE` in the watcher.
- Fallback: rendered all frames with Remotion's browser-native H.264 export from the static bundle in the existing Chrome browser; normalized the browser export timestamps to constant 30 fps with FFmpeg (H.264 CRF 18; AAC trimmed/re-encoded to 62 seconds), and saved it in `out/`. This is not proof that the blocked CLI command succeeds.
- Final ffprobe: H.264 1920×1080, 30/1 fps, 1,860 video frames; AAC audio; 62.000-second container.
- Subjective speaker/headphone listening and a musically verified first downbeat remain unverified. Final 120-second assembly and its voice/SFX balance belong to the timeline engineer; this task does not certify that film.

### Motion review

| Before | After | Why |
|---|---|---|
| Documents heading clipped in the narrow pane | 56px pane heading, inspected at frame 550 | Preserve the title within the device |
| Limiter lookahead consumed the 5 ms tick | Latency-compensated limiter, non-silence assertion | Preserve sample-accurate clicks |
| SFX used unsupported premount + layout-none combination | Standard premounted Sequence | Match installed Remotion types |

Verdict: component study is build- and browser-verified; final-film mix and beat snapping still need editorial listening.
