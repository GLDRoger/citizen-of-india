# Citizen of India — Build Plan (Aug 24–28, 2026)

Deadline: **August 28, 2026, 8:00 PM IST**, no grace period. Working model: sol (Codex) builds verticals (~1 hr each); Nishchay + Fable review from above; terra opens a second lane for independent verticals from Day 2. Effective throughput: build + review + one rework ≈ 1.5–2 hrs per vertical, ~20–24 reviewed verticals total.

Rules of the plan:
- The foundation (Day 0) is sequential and heavily reviewed — everything else stacks on it.
- Every day ends with a checkpoint we run by hand on a phone. A vertical isn't done until its demo path survives the checkpoint.
- Aug 28 is freeze + submission, not build. Feature freeze at 12:00 PM.
- When a slip happens, apply the cut lines below — never compress the checkpoint or the submission buffer.

---

## Day 0 — Sun Aug 24 (rest of today) · Foundation, single lane

| # | Vertical | Contents |
|---|----------|----------|
| V1 | Design system + app shell | Tokens (navy/ivory, teal/green actions, saffron sparingly), huge type scale, six-tab nav (Home · You · Activity · Inbox · Documents · Discover), mobile-first layout, EN/HI/KN dictionary module, "simulated" chip component, `/about` page skeleton |
| V2 | Graph store | Zustand store, seed hydration, localStorage persistence, `GraphMutation` reducer + event log, selectors module, Reset Demo |
| V3 | Mock auth | OTP screen (any 6 digits), three personas from `seed.json.logins`, persona switch, consent screen |
| V4 | mockGov layer | Service scaffolding, 400–1200 ms latency, deterministic responses, `{ simulated, authority }` on everything |
| V5 | Home | Citizen snapshot, Things to do, Money (due/receivable), pending applications, recommended actions — all selectors, no hardcoded data |

**Checkpoint:** log in as all three personas on a phone; Home reflects the seed exactly.

## Day 1 — Mon Aug 25 · Intelligence + flagship vertical

| # | Vertical | Contents |
|---|----------|----------|
| V6 | Universal Intent | `/api/intent` route (OpenAI, graph-slice context, replies in input language), giant input, suggested intents, clarification questions, routing |
| V7 | Procedure engine primitives | Procedure definition shape, step types (prefill form, consent, evidence, mock payment, mock appointment, mock submit), procedure timeline UI, completion animation, graph-mutation confirmation sheet |
| V8–V9 | **Death vertical** (two passes) | Report death → identify Rajesh → death registration → certificate issued (reusable document node) → pension stop / EPS family-pension start → EPF nominee claim → vehicle & property overview → legal-heir consent (Kavita async-simulated) |
| V10 | Eligibility + Discover | Rule evaluator over benefit `rules`, eligible / potentially / not-eligible cards with explanations and missing evidence, **Sunita's pensions flip when the death mutation lands**, Apply button |

**Checkpoint:** "papa ki death ho gayi, kya karna hoga?" → complete journey → Sunita's Discover shows family pension eligible. In English and Hinglish.

## Day 2 — Tue Aug 26 · Second deep vertical + breadth, dual lane

**Lane A (sol):**
| # | Vertical | Contents |
|---|----------|----------|
| V11–V12 | **Marriage vertical** (two passes) | Arjun invites Priya → Priya logs in, consents → identity verification → document reuse from both wallets → witness selection → mock appointment + payment → certificate → `spouseOf` mutation, visible on both graphs |
| V13 | Inbox + scam check | Inbox rows from seed notices, `/api/explain` (plain language, user's language), respond/view-source, paste-a-message scam check via `/api/scamcheck`, seeded scam SMS analysis, cybercrime workflow launch |

**Lane B (terra, separate worktree):**
| # | Vertical | Contents |
|---|----------|----------|
| V14 | Documents + provenance | Wallet from seed docs, expiry/verification states, search, "Why?" provenance drawer, PAN name-mismatch reconciliation flow (completes the seeded draft application) |
| V15 | Obligations dashboard | Unified deadline view in Activity, money due/receivable, challan mock payment mutating the graph, expiring-document nudges |

**Checkpoint:** six intents route to distinct working experiences; marriage completes end-to-end across two logins.

## Day 3 — Wed Aug 27 · Remaining verticals + hardening

| # | Vertical | Contents |
|---|----------|----------|
| V16 | Business loan decision | Reads business/tax/obligation state, Mudra eligibility off rules, loan comparison, LLM risk explanation, start application |
| V17 | Start a business | Intent capture (location/type), LLM-generated action plan from graph context, registrations/licences/schemes as plan cards |
| V18 | You page + delegation | Citizen Graph in human terms (relationship/property/business cards), Sunita delegates pension+property scope to Arjun (expiry, revoke) |
| V19 | Language + low-bandwidth pass | Complete KN/HI chrome dictionary, Kannada/Hindi journey QA, bundle audit, skeleton coverage, throttled-3G run, touch targets |
| V20 | Honesty pass | Simulated-label sweep, `/about` real-vs-mocked complete, reset-demo polish, independent-prototype labeling |

**Evening QA:** every demo path by hand on a phone, throttled network. Fix list to sol overnight.

## Day 4 — Thu Aug 28 · Freeze + submission

- **Morning:** overnight fixes verified; bugs only, no new surface.
- **12:00 PM — feature freeze.** Anything unfinished routes to an honest "prototype scope" card.
- **Afternoon:** 2-minute video — minute 1: citizen demo (Hinglish death intent → journey → eligibility flip); minute 2: how Codex built it (broker logs on screen, architecture in three sentences). 250-word summary. Mock credentials block.
- **~4:00 PM:** final production deploy; link tested in incognito and on a phone (no access prompts).
- **By 6:00 PM:** submitted. Two hours of buffer stays untouched.

---

## Cut lines (apply in order when a day slips)

1. Business loan: drop comparison UI, keep eligibility + risk explanation.
2. Delegation: seeded static delegation instead of the create/revoke flow.
3. You page: relationship cards without any visual graph.
4. Start a business: plan cards only, no follow-through into applications.
5. Scam check: seeded SMS analysis only, no free-paste input.

Never cut: death vertical, marriage vertical, universal intent, eligibility flip, simulated labeling, the checkpoint runs, the Day 4 buffer.

## Stretch (only if a day ends ahead)

- Visual Citizen Graph explorer on You.
- Voice input via Web Speech API (Kannada/Hindi).
- Proactive nudges strip on Home ("Your passport expires in 5 months").

## Post-deadline (top-250 mentorship round, resubmit by Sep 7)

Everything cut above, P2 vision features, Government Timeline from the event log.
