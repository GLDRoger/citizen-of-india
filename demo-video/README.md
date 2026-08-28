# Citizen hackathon demo video

A 120-second Remotion edit for the Build What Moves India submission. It uses recordings of the working Citizen app, burned-in captions, a directed Indian-English Gemini voiceover, restrained cursor emphasis, an Indian instrumental music bed and two quiet chapter-transition accents.

The official brief asks for a citizen demo in minute one and build decisions in minute two. This edit follows that structure. The problem, Citizen Graph, EPFO journey, proof points and closing come from `../docs/Two-Minute Demo Video Script.md`; the submission narration lives in `content/script.json`.

## Preview and render

```bash
npm install
npm run dev
npm run render
```

The final file is `out/citizen-hackathon-demo.mp4`. The render script trims AAC padding so the container duration is exactly 120.000 seconds.

## Regenerate the source assets

Build and serve the Citizen app from the repository root:

```bash
npm run build
npm run start -- --port 3100
```

Then, from this directory:

```bash
npm run capture
export GEMINI_API_KEY="your-key"
npm run audio
npm run render
```

`npm run capture` records every app clip through Playwright. To recapture one clip:

```bash
CAPTURE_ONLY=05-epfo-journey npm run capture
```

`npm run music` prepares the 120-second dialogue mix of “Bombay Summer” by Shane Ivers from the frozen source under `.media/`. The track uses bansuri, sitar, harmonium, tanpura and tabla and is licensed under CC BY 4.0; copy the required publication credit from `MUSIC-CREDITS.md`. `npm run voiceover` uses `gemini-3.1-flash-tts-preview`, the warm `Sulafat` voice and `en-IN`; each scene carries its own performance direction from `content/script.json`. It also rebuilds `public/captions.json`. To regenerate one voice clip while tuning its direction:

```bash
VOICEOVER_ONLY=problem npm run voiceover
```

The click and transition effects are frozen local assets. Their provenance is recorded under `.media/`.

## Edit points

- `content/script.json`: narration, caption chunks and scene durations.
- `src/scenes/`: one component per chapter.
- `src/CitizenHackathonDemo.tsx`: the 3,600-frame master timeline and audio mix.
- `scripts/capture-app.mjs`: browser interactions used to record the real app.
- `scripts/prepare-music.mjs`: dialogue EQ, loudness and fades for the licensed Indian instrumental source.
- `scripts/generate-voiceover.mjs`: Gemini TTS direction, generation and timing.

Remotion is free for individuals, teams of three or fewer, and non-profits. A paid company licence is required when four or more people are involved across the engagement. See the [Remotion licence](https://www.remotion.dev/license).
