# UI Redesign Brief — Top Nav + Breadcrumbs

Direction reference: five AI-generated mocks in `~/Downloads/citizen gov in/` (treat as mood, not spec). `Design Language — The Citizen File.md` now supersedes this brief's visual rules; this file remains the route and workflow specification.

## What we take from the mocks

- **Top navigation** replacing the sidebar shell: Citizen mark and wordmark left, primary routes in the centre, language and profile controls right.
- **Breadcrumbs** on every inner page (`Home › Services › Marriage Registration`), plus a back-link on workflow pages.
- **Paper and indigo identity** with warm ink, deep green actions and brick reserved for danger.
- **Anek display headlines** in Latin, Devanagari and Kannada, set large with script-specific line height.
- **Record surfaces instead of cards**: ruled ledgers, file panels, real tables and visible mutation receipts.
- **Saffron has one structural job**: the Citizen mark and trapezoid file tab.

## What we must NOT take (compliance)

- No "citizen.gov.in" branding. The wordmark is **Citizen**, with "Independent prototype" as plain supporting text.
- No Digital India / india.gov.in / MeitY logos, no emblems, nothing official-looking.
- Footer trust strip becomes honest: "Independent hackathon prototype · All people and data are synthetic · Every government response is simulated" + link to /about. Never "Secure. Private. Official."
- Mock personas/figures (Delhi, Meera/Ananya/Rohit, ₹12,540) are wrong — all content comes from the seed graph (Bengaluru, Sunita/Kavita/Priya, ₹12,400). No "420+ services from 36 departments" overclaims; Journeys shows only what works for the active profile.

## Navigation architecture

Public entry:

| Surface | Route | Content |
|---|---|---|
| Landing | `/` | Public project story: problem, hackathon and idea selection, working marriage journey, current boundaries, future vision and Start the demo CTA |
| Profile entry | `/start` | Focused one-tap selection for the three fictional profiles |

Top nav (4 items):

| Item | Route | Content |
|---|---|---|
| Home | `/home` | Hero intent composer, then the unified attention surface: top tasks, money, deadlines, inbox, recent activity and a documents rail |
| Journeys | `/services` | Compact list of working journeys supported by the active sample profile |
| You | `/you` | Citizen Graph in human terms: family, work, assets, delegation and record health |
| Discover | `/discover` | Benefits and eligibility derived from the active profile |

- `/dashboard`, `/activity` and `/inbox` redirect to `/home`. Home is the canonical dashboard surface; their logic is not duplicated.
- `/documents` remains a full page reached from Home and the profile menu.
- Profile menu (avatar, top-right): full profile (/you), switch person, language, data saver, reset demo, about, sign out.
- Mobile (≤sm): top bar keeps logo + bell + avatar; nav collapses into a slide-down sheet from a menu button. Cards stack single-column. Breadcrumbs stay (they're small). Judges test at ~390px — that layout is the primary target.

## Page-level notes

- **Workflow pages**: keep ProcedureShell logic; restyle to the marriage mock — step-timeline strip across the top (numbered, connective lines, states), content cards below, participant cards for shared workflows (Arjun ↔ Priya with consent state), progress % chip. Breadcrumb `Home › Services › <name>`.
- **Deferred death workflow**: keep it outside the current pitch and primary navigation. Do not use it as a visible suggestion or demo path.
- **Loan workflow**: adopt the "Should I take a ₹12 lakh business loan?" layout — recommendation card with verdict, affordability meter, two comparison cards (govt-backed vs standard), "why / risks / next steps" three-column strip. Data from existing selectors + mockGov.
- **Optional decorative art**: one lightweight inline SVG line-art skyline (Vidhana Soudha silhouette, single color, <10KB) in the hero corner. Skip entirely if it looks cheap — whitespace beats bad art. No raster images.

## Constraints that survive the redesign

- All chrome strings through the i18n dictionary (en/hi/kn) — new keys added in all three languages.
- Simulated chips stay visible on every mocked surface; the redesign must not bury them.
- No new dependencies. Motion stays in lightweight CSS. Bundle stays small; skeletons stay everywhere.
- ≤500 lines/file; extract components as needed (nav, breadcrumbs, stat card, list row, step timeline are obvious shared components).
- Zero changes to stores, selectors, mutations, API routes, or seed. This is a presentation refactor; if a data need is missing, add a selector, don't touch the graph.
- Verify: `npm run build`, `npx eslint .`, and hand-exercise landing → profile entry → intent → marriage → Home → Journeys at 390px.
