# Build What Moves India Top 250: competitive analysis

**Research date:** 2 September 2026

**Source:** [Build What Moves India Top 250](https://buildwhatmovesindia.com/top-250)

**Scope:** all 250 listed project URLs, including Citizen at directory position 166; comparisons use the other 249 projects.

## Executive verdict

**The closest project to Citizen overall is [SevaSetu](https://seva-setu-ka.web.app/) (#183).** It turns a natural-language life goal into an ordered, cross-department journey, reuses documents, tracks progress, and shows who currently has the work. Its demo even includes marriage registration.

The collision is real, but not fatal. SevaSetu models a connected **case**. Citizen models the citizen's persistent **record**: identity, relationships, work, assets, documents, benefits, applications, obligations, notices, consent, and history. Citizen's actions mutate that record and every derived view updates. No inspected peer combined that persistent graph, proactive personal brief, relationship-scoped consent, and visible downstream mutation.

Citizen should not pitch itself as another assistant, portal, dashboard, or document wallet. Those are crowded. The winning sentence is closer to:

> One living citizen record that knows what changed, what applies to you, what happens next, and carries every result forward.

## Coverage and method

- Extracted all 250 directory records: project name, builders, project URL, and demo URL.
- Opened every project URL in the in-app browser and captured its visible title, headings, and rendered text after initial load.
- Inspected the closest and most instructive products more deeply, including interactive flows in SevaSetu, ApplyOnce, and Jeevana.
- Classified every project into one primary problem area. Classification is an editorial judgment based on the visible product, not a category supplied by the organisers.
- Pattern counts are multi-label text signals. They show what projects visibly foreground, not a source-code audit or proof that every claimed feature works.
- Two project URLs timed out twice: UPI Recall (#32) and BhumiSetu (#214, listed as `bhumisetu`). Their page titles loaded, but their bodies did not. Twenty-seven more loaded with minimal/client-only content, and two stopped on a Render wake-up screen. Directory metadata supports their inventory/category rows. The user supplied summaries of both demo videos after the crawl; those summaries are recorded as supplemental evidence, not as website observations.

The full row-level dataset is in [`build-what-moves-india-top-250.csv`](./build-what-moves-india-top-250.csv). The untouched directory extraction is in [`build-what-moves-india-top-250-directory.json`](./build-what-moves-india-top-250-directory.json).

## Closest products to Citizen

| Rank | Project | What overlaps | Where Citizen is stronger | What to steal |
|---:|---|---|---|---|
| 1 | [SevaSetu](https://seva-setu-ka.web.app/) (#183) | Natural-language goal, ordered multi-service workflow, reusable documents, progress and current owner, marriage journey | Persistent citizen-wide graph, partner consent, derived home/inbox/money/benefits, mutations and history | Put **owner, prerequisite, and wait state** on every step. Make the cross-department sequence more visible. |
| 2 | [ApplyOnce](https://applyonce-silk.vercel.app/) (#113) | Verified reusable profile, explicit consent, field provenance, application history | Broader life record and workflows beyond form filling | Show a readiness percentage, “35 of 38 fields ready,” exact missing fields, source, purpose, and consent receipt. |
| 3 | [HeyGov](https://heygov-build-india.netlify.app/) (#204) | One plain-language interface across EPFO, tax, driving licence, and DigiLocker | Proactive home, structured rules, state mutation, non-chat navigation | Render answers as compact verified record cards; ask for sign-in only when private records are needed. |
| 4 | [Meri Pehchaan 2.0](https://meri-pehchaan-concept.vercel.app/) (#29) | One identity across services, consent scopes, access visibility, 12-language ambition | Connected life/context graph and service outcomes | Make consent show **what, why, until when**, with revocation and a clear access log. |
| 5 | [Unified Government Services](https://unified-gov-web-plum.vercel.app/) (#244) | One profile, reusable details/documents, many services | Much deeper workflows, rules, provenance, relationships, and history | Its proposition is instantly legible. Citizen's first screen should be equally plain before explaining the graph. |
| 6 | [Jeevana](https://jeevana-brown.vercel.app/) (#98) | Life-event-first framing, ordered dependencies, cross-department journeys | Actual stateful workflows and shared citizen record | Show the cascade after marriage: certificate first, then name/nominee/address/document updates, with blocked dependencies. |
| 7 | [Adayal](https://adayal.pages.dev/) (#54) | Verified identity, selective fact sharing, consent receipts | Far broader record and actions | Make every share produce a visible, revocable receipt. |
| 8 | [Public Service Atlas](https://public-service-atlas.vercel.app/) (#40) | Dependencies across life events and public services | Personalisation and completion workflows | Attach an official source, jurisdiction, last-checked date, and a visible “not documented” state to each requirement. |

## Supplemental findings for the two timed-out sites

These findings come from user-supplied summaries of the demo videos. The project websites still count as navigation timeouts in the availability data.

### UPI Recall (#32)

UPI Recall starts fraud recovery inside the payment app that already holds the transaction. It prefills the amount, transaction ID, bank, and recipient; asks the user to confirm the fraud reason and identity; then keeps evidence, bank reviews, protected funds, and case status in one place. The prototype distinguishes funds that the network has protected from money it has restored to the victim.

Citizen should reuse this pattern when the source record already contains the evidence. Opening a challan, notice, refund, or contribution should start the relevant action with the known facts already attached. The action screen should also separate `reported`, `protected`, `approved`, `paid`, and `resolved` instead of compressing them into one completion state.

### BhumiSetu (#214)

BhumiSetu combines land-record search, an interactive parcel map, a plot workspace, a linked 30-year ownership chain, satellite-derived field observations, verification requests, complaints, and consolidated report export. Each ownership change stays connected to the document that supports it.

Citizen already retains historical relationships instead of deleting them. The UI should make that history inspectable: who or what changed, effective date, source document, verification state, and the action that created the change. A downloadable, source-linked record history would make the Citizen Graph feel operational rather than illustrative.

## Primary theme distribution

Counts exclude Citizen, so the denominator is 249.

| Primary theme | Projects | Share |
|---|---:|---:|
| Road transport & vehicles | 28 | 11.2% |
| Cross-service platforms & infrastructure | 24 | 9.6% |
| Cybercrime, scams & public safety | 24 | 9.6% |
| Rail, transit & travel booking | 23 | 9.2% |
| Grievance & civic accountability | 21 | 8.4% |
| RTI, courts, law & elections | 20 | 8.0% |
| Identity, documents, passports & visas | 17 | 6.8% |
| EPFO, pensions & employment claims | 15 | 6.0% |
| Benefits, loans & financial inclusion | 14 | 5.6% |
| Tax, GST & filings | 14 | 5.6% |
| Land, housing, utilities & environment | 12 | 4.8% |
| Education, jobs & skills | 10 | 4.0% |
| Health, emergency & accessibility | 8 | 3.2% |
| Business, MSME & compliance | 7 | 2.8% |
| Life events, inheritance & family | 7 | 2.8% |
| Agriculture, ration & rural livelihoods | 5 | 2.0% |

The top six themes contain 140 of 249 projects, or 56.2%. Most entrants chose one broken portal or high-friction transaction. Citizen chose the harder platform problem. That creates a larger vision, but judges need one deep workflow to believe it. Marriage remains the right flagship.

### Repeated named problem families

These are conservative title-only counts, so broader primary-theme counts above are higher.

- Road/Parivahan/vehicle/licence/challan: **20**
- Rail/IRCTC/Tatkal/berth: **16**
- EPFO/PF/pension: **12**
- Tax/GST/ITR: **11**
- Grievance/complaint/CPGRAMS: **11**
- RTI: **10**
- Cybercrime/fraud/scam: **9**

Citizen already touches several saturated areas. It should present those as evidence that one record architecture generalises, not as separate mini portal redesigns.

## Visible product-pattern analytics

Multi-label counts exclude Citizen. These are strict visible-text matches and should be read as useful lower bounds.

| Visible signal | Projects | Share | Interpretation |
|---|---:|---:|---|
| Explicit prototype/mock/unofficial disclosure | 154 | 61.8% | Honesty is expected, not differentiating. Citizen's per-response simulated indicator is still stronger than a footer-only disclaimer. |
| Tracking/status/deadline/next step | 139 | 55.8% | A tracker is commodity. Citizen must show why its state is connected and what changed elsewhere. |
| Documents/evidence/records | 135 | 54.2% | A document wallet is commodity. Reuse, provenance, consent, and downstream mutation matter. |
| Multilingual controls or copy | 81 | 32.5% | Language support is common. Complete parity beats a long language menu with shallow routes. |
| AI/chat/copilot/assistant framing | 78 | 31.3% | “AI assistant for government” is crowded and weak positioning. |
| Plain-language or own-words entry | 60 | 24.1% | Citizen's giant intent input is useful but not unique. |
| Consent/privacy/sharing language | 54 | 21.7% | Citizen can lead by making the consent artefact concrete, scoped, expiring, and revocable. |
| Eligibility/rules/benefits | 44 | 17.7% | Explainable, data-backed rules still matter; generic “AI matched you” does not. |
| Voice/speech/audio | 36 | 14.5% | Voice claims are common enough that a fixed mock alone will not win points. |
| Accessibility signals | 36 | 14.5% | Accessibility is under-served and testable. Keep the 360 px, keyboard, contrast, and reduced-motion proof. |
| Life-event framing | 27 | 10.8% | This is less crowded and aligns with Citizen's graph. Lead with marriage and “what changed,” not departments. |
| Offline/low-data/weak-network | 12 | 4.8% | Citizen's data-saver and local persistence are rare. Demonstrate reload/resume on a throttled phone. |
| Strong provenance/source-boundary language | 11 | 4.4% | Direct sources and explicit unknowns can become a major trust differentiator. |
| Explicit actor/owner responsibility | 6 | 2.4% | This is the clearest open opportunity: say who has the ball, since when, and what happens if they do nothing. |

## Hosting and availability

| Host family | Projects | Share |
|---|---:|---:|
| Vercel | 148 | 59.4% |
| Other/custom | 41 | 16.5% |
| ChatGPT Sites | 22 | 8.8% |
| Netlify | 17 | 6.8% |
| Cloudflare Workers/Pages | 10 | 4.0% |
| GitHub Pages | 6 | 2.4% |
| Render | 5 | 2.0% |

Availability during this pass:

- **218** loaded with substantial visible content.
- **27** loaded but exposed minimal/client-only content during the initial inspection window.
- **2** stopped on a hosting wake-up screen.
- **2** timed out twice.

A live, fast, mobile path is a real competitive advantage because many submissions leak hosting or hydration friction before the product can speak.

## Naming analytics

- **27** peer names use a Saathi/Sathi/Sahayak/Sarathi-family word.
- **12** use “Setu.”
- **22** announce “reimagined,” “redesign,” “revamp,” “2.0,” “3.0,” “Neo,” or “Future.”
- **5** put “AI” in the project name, although 78 visibly foreground AI/chat/assistant behaviour.

“Citizen” avoids the Setu/Saathi thicket, which is good. It is also extremely generic. Keep the name, but always pair it with a searchable descriptor: **Citizen — one living record for every public service.**

## What the best projects teach Citizen

1. **Diagnosis before submission.** [Seven Gates](https://build-whatmovesindia.vercel.app/) shows all blockers at once, names who must fix each one, and estimates days saved. Citizen should add a compact pre-flight panel to marriage, EPFO, PAN correction, and loans.
2. **The citizen decides whether the outcome is real.** [Sunwai](https://m58nhkfn.insforge.site/) and Poora Hua? distinguish departmental “disposed/closed” from the person's problem actually being fixed. Add “Did this solve it?” after simulated completion; a “no” should preserve context and open the next route.
3. **Sequence beats a checklist.** Jeevana, SevaSetu, and [ACRES](https://acres.jantra.app/) show prerequisites and blocked steps in order. Citizen has the data model for this but should expose the dependency graph more directly.
4. **Start from the record that already holds the facts.** UPI Recall begins inside the original transaction and prefills the case. Citizen should launch actions from notices, obligations, documents, and payments with their evidence attached.
5. **Keep a source-linked history.** BhumiSetu's 30-year ownership chain connects each change to supporting records. Citizen should expose the same temporal logic for relationships, documents, applications, and permissions.
6. **Readiness is more useful than a document list.** ApplyOnce says exactly how much is ready and asks only for what is new. Use “5 of 6 ready,” source/freshness, and the one missing item.
7. **Name the current owner.** [Disha](https://disha-neon.vercel.app/) distinguishes citizen, institution, verification authority, PFMS, and bank. Citizen should show `Waiting on Priya`, `Waiting on registrar`, or `Waiting on you` on every application.
8. **Show unknowns as first-class states.** Public Service Atlas and [Parakh](https://build.parakh.biz/) explicitly say what public evidence cannot establish. Add “not documented / needs confirmation,” not confident filler.
9. **Make recovery part of the product.** [SevaRail](https://seva-rail.vercel.app/) centres zero-reset recovery; RailFlow exposes weak-2G/offline modes. Citizen should prove that a reload resumes the exact workflow and that slow network never loses entered data.
10. **Prepare files before portals reject them.** [DocBridge](https://incredible-taffy-db08a6.netlify.app/) converts portal-specific upload rules into one local preparation layer. A narrow document-readiness check is a good later extension, not a P0 detour.
11. **Use one sharp fact, not a feature cloud.** Kavach, Seven Gates, Seedha Kaam, and Sunwai each make one failure painfully concrete. Citizen's opening should reach Arjun's live record and one mutation faster.
12. **Keep authority boundaries visible.** ACRES says rules decide and a named officer signs. Citizen should state on decision surfaces: planner recommends, deterministic rules evaluate, citizen approves, authority decides.

## Ranked improvement plan

### P0: before the next judge opens the link

1. **Fix the live overdue label.** On 2 September 2026, Citizen Home rendered `-1 days left` for the challan. It must say `1 day overdue` and remain urgent. This is a small defect on the first authenticated screen.
2. **Add an owner-and-clock line to every active item.** Show owner, waiting since, due/escalation date, and next action. This copies the best part of SevaSetu, Disha, and Seven Gates and occupies a rare competitive gap.
3. **Turn the flagship into visible graph proof.** In the first 60 seconds, complete one marriage step, switch to Priya for consent, finish it, then show the spouse edge, certificate, Home nudge, Documents, and Activity update. Do not spend that minute explaining architecture.
4. **Add pre-flight readiness.** Before any simulated submission, show ready count, missing items, mismatches, dependencies, and estimated delay. The data mostly exists; the interface does not yet aggregate it into one diagnosis.
5. **Add direct official evidence.** Extend provenance from authority/date/linked record to source URL, jurisdiction, last verified date, and “unknown/not documented.” Never imply that mock authority labels are citations.
6. **Close the loop with the citizen.** Completion should create a receipt, then ask whether the real-world problem is resolved. A negative answer must reopen or escalate without restarting.

### P1: strengthens the moat

7. **Make consent a reviewable packet.** List every shared field, source, freshness, purpose, recipient, expiry, and revocation path. Store a consent receipt in Activity.
8. **Expose workflow dependencies.** Use a small prerequisite map for marriage and start-a-business, including downstream updates that become possible after a certificate is issued.
9. **Make resilience demonstrable.** Add a scripted judge moment: begin a workflow, reload, resume at the same step, toggle data saver, finish. Persistence should be proof, not copy.
10. **Create a “what changed because of this?” receipt.** After each action, list graph mutations in human language: obligation cleared, receipt added, application created, spouse relationship added, benefit re-evaluated.

### Do not copy

- Do not imitate official government branding. Several peers look official enough to create trust risk.
- Do not add dozens of shallow services. Breadth without a working mutation loop weakens Citizen.
- Do not let AI decide eligibility, authority, or legal effect. Keep deterministic rules and named human/authority ownership.
- Do not claim 20+ languages without complete interaction parity.
- Do not build an admin panel. Citizen's submission brief is citizen-only, and the strongest differentiation is the citizen record itself.

## Bottom line

Citizen is not alone in “one place for government services.” Twenty-four peers sit in the cross-service/platform category, and SevaSetu overlaps heavily. Citizen is still differentiated by the **persistent Citizen Graph plus action-driven state changes across the whole personal record**.

The current risk is not product sameness. It is demo sameness. If judges see chat, cards, documents, and status tracking, Citizen blends into dozens of entries. If they see one action change the citizen's relationships, obligations, documents, benefits, inbox, and history with consent and provenance, the distinction becomes obvious.
