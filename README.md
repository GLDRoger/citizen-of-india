<p align="center">
  <img src="public/citizen-logo.png" alt="Citizen" width="120" />
</p>

# Citizen of India

An independent, mobile-first product preview for handling life events, obligations, benefits, and public-service paperwork in plain language. Every person and record in the repository is fictional, and all authority integrations run in a clearly labelled simulated mode.

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

Citizen was built with Codex as a meaningful part of product design, implementation and verification. The [Builder Brief](https://buildwhatmovesindia.com/brief) accepts a prototype built with Codex or powered by an OpenAI model, so the submitted app does not need a paid runtime model or an exposed API key.

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

## Service boundaries

This is an independent product preview, not a government service. It makes no live authority API calls, accepts no real identity or payment data, and uses no government logos. Every simulated response is identified in the interface. See `/about` for the complete service-status disclosure.
