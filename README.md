# Citizen of India

An independent, mobile-first product preview for handling life events, obligations, benefits, and public-service paperwork in plain language. Every person and record in the repository is fictional, and all authority integrations run in a clearly labelled simulated mode.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use any available sample profile:

- Arjun Sharma: `9800000001`
- Priya Patel: `9800000002`
- Sunita Sharma: `9800000003`

Any six-digit access code succeeds. Every guided flow remains usable without an API key through deterministic local fallbacks.

To enable model-assisted intent routing, notice explanations, and scam checks, set:

```bash
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-5.4-mini # optional
```

## Architecture

- **Next.js App Router** for pages and three validated model proxy routes
- **Zustand** for the persisted Citizen Graph and local profile-access state
- **Zod** for seed, mutation, request, and model-response validation
- **Tailwind CSS** for the mobile-first design system
- **OpenAI Responses API** for bounded, structured assistance with deterministic fallbacks

`src/data/seed.json` is the sole source of sample profile data. Components never mutate the graph directly: workflow procedures emit typed mutations through `src/features/graph/mutations.ts`, and selector functions derive every citizen-facing view from the graph.

## Verification

```bash
npx tsc --noEmit --incremental false
npx eslint .
npm run build
```

## Service boundaries

This is an independent product preview, not a government service. It makes no live authority API calls, accepts no real identity or payment data, and uses no government logos. Every simulated response is identified in the interface. See `/about` for the complete service-status disclosure.
