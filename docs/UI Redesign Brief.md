# UI Redesign Brief — Top Nav + Breadcrumbs

Direction reference: five AI-generated mocks in `~/Downloads/citizen gov in/` (treat as mood, not spec — they contain rule violations we must NOT reproduce). This brief is the spec; where it disagrees with the mocks, the brief wins.

## What we take from the mocks

- **Top navigation** replacing the current sidebar/tab shell: logo left · nav center · bell + language pill + profile chip right. Underline indicator on the active item.
- **Breadcrumbs** on every inner page (`Home › Services › Marriage Registration`), plus a back-link on workflow pages.
- **Warm ivory canvas** (light, cream-tinted) with navy ink text — replaces any dark chrome. White cards, 16–24px radius, hairline borders, generous padding.
- **Conversational display headlines** as the anchor of every page: "What do you need?", "My father died", "What's the government waiting on me for?" — huge (clamp to ~4–7rem desktop), navy, tight leading.
- **Card system**: stat cards with a small tinted icon square + count badge; list rows with authority icon, status chip, due date, one action button; step-timeline strip with numbered circles and connective lines (marriage mock).
- **Teal/green primary actions**, saffron only as accent (badges, decorative arc). Status chips: action-needed (amber), payment-due (saffron), information (blue), done (green).

## What we must NOT take (compliance)

- No "citizen.gov.in" branding — wordmark is **Citizen**, with an "Independent prototype" pill next to it.
- No Digital India / india.gov.in / MeitY logos, no emblems, nothing official-looking.
- Footer trust strip becomes honest: "Independent hackathon prototype · All people and data are synthetic · Every government response is simulated" + link to /about. Never "Secure. Private. Official."
- Mock personas/figures (Delhi, Meera/Ananya/Rohit, ₹12,540) are wrong — all content comes from the seed graph (Bengaluru, Sunita/Kavita/Priya, ₹12,400). No "420+ services from 36 departments" overclaims; we have six guided services and say so.

## Navigation architecture

Top nav (4 items — the current 6 tabs are too many for this pattern):

| Item | Route | Content |
|---|---|---|
| Home | `/` | Hero "What do you need?" + intent bar + suggestion chips, then snapshot card row: My snapshot (persona + family/business/property counts, "View full profile" → /you) · Things to do · Documents · Benefits · Money · Inbox — each a compact stat card linking deeper |
| Services | `/services` (new, thin) | Index of the six guided workflows as large cards (title, one-line promise, status if in progress). Each card → `/workflows/[slug]` |
| Discover | `/discover` | Existing benefits/eligibility page restyled |
| Dashboard | `/dashboard` (new, merges Activity + Inbox) | "What's the government waiting on me for?" — 4 stat cards (deadlines, expiring docs, pending applications, money due/refundable), unified list of notices + obligations with per-row actions, documents rail on desktop (mock 5) |

- `/activity` and `/inbox` redirect to `/dashboard` (keep old links working). Their screens' logic gets absorbed, not duplicated.
- `/you` and `/documents` remain full pages, reached from profile menu + Home cards + Dashboard rail ("View wallet").
- Profile menu (avatar, top-right): full profile (/you), switch person, language, data saver, reset demo, about, sign out.
- Mobile (≤sm): top bar keeps logo + bell + avatar; nav collapses into a slide-down sheet from a menu button. Cards stack single-column. Breadcrumbs stay (they're small). Judges test at ~390px — that layout is the primary target.

## Page-level notes

- **Workflow pages**: keep ProcedureShell logic; restyle to the marriage mock — step-timeline strip across the top (numbered, connective lines, states), content cards below, participant cards for shared workflows (Arjun ↔ Priya with consent state), progress % chip. Breadcrumb `Home › Services › <name>`.
- **Death workflow** header: "My father died" tone — supportive line under the headline ("We're here for you. One step at a time."), no jargon.
- **Loan workflow**: adopt the "Should I take a ₹12 lakh business loan?" layout — recommendation card with verdict, affordability meter, two comparison cards (govt-backed vs standard), "why / risks / next steps" three-column strip. Data from existing selectors + mockGov.
- **Optional decorative art**: one lightweight inline SVG line-art skyline (Vidhana Soudha silhouette, single color, <10KB) in the hero corner. Skip entirely if it looks cheap — whitespace beats bad art. No raster images.

## Constraints that survive the redesign

- All chrome strings through the i18n dictionary (en/hi/kn) — new keys added in all three languages.
- Simulated chips stay visible on every mocked surface; the redesign must not bury them.
- No new dependencies. Framer Motion stays lazy. Bundle stays small; skeletons stay everywhere.
- ≤500 lines/file; extract components as needed (nav, breadcrumbs, stat card, list row, step timeline are obvious shared components).
- Zero changes to stores, selectors, mutations, API routes, or seed. This is a presentation refactor; if a data need is missing, add a selector, don't touch the graph.
- Verify: `npm run build`, `npx eslint .`, and hand-exercise login → intent → death → dashboard → services at 390px.
