<p align="center">
  <img src="public/citizen-logo.png" alt="Citizen" width="120" />
</p>

# Citizen of India

An independent, mobile-first prototype for handling life events, bills and deadlines, benefits, and government paperwork in plain language. Every person and record in the repository is fictional, and all government responses run in a clearly labelled simulated mode.

[Try Citizen](https://citizen-of-india.vercel.app) · [Watch the two-minute demo](https://youtu.be/OuqARZ-FIg4)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to read the project overview, then choose **Start the demo** to open a sample profile:

- Arjun Sharma: main citizen journey
- Priya Patel: partner-consent journey
- Sunita Sharma: delegated-access journey

No access code or API key is required. Intent routing and notice explanations run deterministically in the browser.

The public landing page always lives at `/`. Profile selection lives at `/start`; after selection, the signed-in Home and dashboard open at `/home`.

## Hackathon fit

Codex (gpt-5.6) wrote the code, working from design and review direction by the team. The [Builder Brief](https://buildwhatmovesindia.com/brief) accepts a prototype built with Codex or powered by an OpenAI model, so the submitted app needs no paid runtime model and exposes no API key.

## Architecture

- **Next.js App Router** for the browser application
- **Zustand** for the persisted Citizen Graph and local profile-access state
- **Zod** for seed and mutation validation
- **Tailwind CSS** for the mobile-first design system
- **Local planners** for multilingual intent routing and notice explanations

`src/data/seed.json` is the sole source of sample profile data. Components never mutate the graph directly: workflow procedures emit typed mutations through `src/features/graph/mutations.ts`, and selector functions derive every citizen-facing view from the graph.

## Verification

```bash
npx tsc --noEmit --incremental false
npx eslint .
npm run build
```

## Demo video

The complete Remotion project lives in [`demo-video`](demo-video). It includes the timed script, app recordings, captions, Gemini voiceover clips, music mix and deterministic render command.

```bash
cd demo-video
npm install
npm run lint
npm run render
```

The rendered MP4 is excluded from Git. You can watch the published edit on [YouTube](https://youtu.be/OuqARZ-FIg4).

Music: [“Bombay Summer” by Shane Ivers](https://www.silvermansound.com/free-music/bombay-summer), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See [`demo-video/MUSIC-CREDITS.md`](demo-video/MUSIC-CREDITS.md) for the full attribution.

## Service boundaries

This is an independent prototype, not a government service. It makes no live government API calls, accepts no real identity or payment data, and uses no government logos. Every simulated response is identified in the interface. See `/about` for the complete service-status disclosure.

## Licence

Citizen is open source under the [MIT Licence](LICENSE). Third-party media retains its original licence and attribution requirements.
