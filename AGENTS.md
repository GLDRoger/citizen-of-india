# Citizen of India — Agent Instructions

Independent hackathon prototype for Build What Moves India (buildwhatmovesindia.com). Submission deadline: **August 28, 2026, 8:00 PM IST**. Judges test a live public link on a phone, then watch a 2-minute video. Ship the citizen experience; there is no admin panel and no real backend.

Read before building anything:
- `docs/Citizen of India — Feature Set.md` — what the product is, priority tiers, definition of done.
- `docs/Design — Stack, Graph, Seed.md` — stack decisions, Citizen Graph schema, seed family, workflow build order.
- `src/data/seed.json` — the synthetic Citizen Graph. It is the single source of truth for all demo data. Build screens from it; never invent parallel mock data inline in components.

## Hard rules (hackathon compliance)

- All data is synthetic. Never add real Aadhaar/PAN numbers, OTPs, payment details, or live government API calls. IDs stay masked (`XXXX XXXX 4821` style).
- Label the build as an independent prototype; no government logos or official-looking branding.
- Every simulated response is marked: `mockGov` service responses carry `{ simulated: true, authority }` and the UI shows a subtle "simulated" indicator. There is a `/about` page listing what is real vs. mocked.
- Anything reachable in the demo must actually work. If a feature can't be finished, route its intent to an honest "prototype scope" card rather than a broken screen.

## Architecture

- Next.js App Router + TypeScript + Tailwind, deployed on Vercel.
- Client state: Zustand store holding the graph (`nodes`, `edges`, `events`), hydrated from `seed.json`, persisted to `localStorage`. "Reset demo" restores the seed.
- Mutations: procedures emit `GraphMutation[]` (`addNode` | `addEdge` | `endEdge` | `patchAttrs`) applied by one reducer and appended to `events`. Never write to the graph directly from components. Nothing is ever deleted — end edges with `validTo`/`status: 'ended'`.
- Derived views (obligations, money, things-to-do, eligibility) are selector functions over the graph, recomputed after every mutation. Benefit eligibility evaluates the `rules` arrays in seed data.
- Simulated government: `src/lib/mockGov/` — async functions with 400–1200 ms latency and believable, deterministic responses.
- The only server code: `/api/intent`, `/api/explain`, `/api/scamcheck` route handlers proxying the OpenAI API (`OPENAI_API_KEY` env var, never in client code). Replies mirror the language of the input (English, Hindi, Hinglish, Kannada). Include the relevant graph slice in the prompt context, never the whole graph.
- Auth: mock OTP. Phones in `seed.json.logins` map to personas; any 6-digit OTP succeeds.

## Conventions

- Mobile-first. Design for a 360px phone; desktop is the adaptation.
- Keep the bundle small: no heavy media, lazy-load Framer Motion, subset fonts. Slow-3G users must never see a blank page — skeletons everywhere.
- UI copy in plain language — no departmental jargon on default surfaces. Static chrome strings live in one dictionary module (en/kn/hi); dynamic content comes from the model.
- ≤500 lines per file. Extract components when JSX nesting passes 3 levels or variants pile up.
- No test suite. Verify with `npm run build` and `npx eslint .` before declaring done, and state which demo paths you exercised by hand.
- Follow the design direction in the feature doc: huge typography, generous space, few choices per screen, navy/ivory foundation, teal/green actions, saffron sparingly.

## Build order

Tiered in `docs/Design — Stack, Graph, Seed.md`: death workflow and marriage workflow deep; obligations dashboard and business-loan decision medium; scam check and start-a-business cheap. Home + giant intent input first — every workflow is reached through it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
