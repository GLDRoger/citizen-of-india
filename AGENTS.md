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
- Local planners classify intents and explain notices in deterministic TypeScript. Use only the active profile slice. Do not add external model calls or an API key to this frontend prototype.
- Public entry: `/` is always the project landing page; `/start` is the focused profile picker; `/home` is the authenticated citizen workspace. Phones in `seed.json.logins` identify fictional personas, which open with one tap. Shared-workflow consent remains inside the workflow that needs it.

## Conventions

- Mobile-first. Design for a 360px phone; desktop is the adaptation.
- Keep the bundle small: no heavy media, subset fonts, and CSS motion only where it clarifies state. Slow-3G users must never see a blank page — skeletons everywhere.
- UI copy in plain language — no departmental jargon on default surfaces. Static chrome and local planner copy live in the en/kn/hi dictionaries; record content comes from `seed.json`.
- ≤500 lines per file. Extract components when JSX nesting passes 3 levels or variants pile up.
- No test suite. Verify with `npm run build` and `npx eslint .` before declaring done, and state which demo paths you exercised by hand.
- Follow the current design language: huge typography, generous space, few choices per screen, paper and indigo for identity, deep green actions, and saffron only on the brand mark and file tab.

## Build order

Tiered in `docs/Design — Stack, Graph, Seed.md`: marriage is the deep flagship; obligations and the business-loan decision are medium; record correction and start-a-business are cheap. Death stays deferred and outside the current pitch. Home + giant intent input comes first — every visible journey is reached through it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
