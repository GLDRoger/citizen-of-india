# Citizen of India — Stack, Citizen Graph & Seed Design

Companion to `Citizen of India — Feature Set.md`. This is the spec Codex builds from.

---

# Stack Decision

**Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel.**

Why Next.js over Vite+React:

- The OpenAI API key cannot live in the browser. Intent classification, workflow generation, notice explanation and scam analysis all call an OpenAI model, so we need one server-side proxy. Next.js route handlers give us that inside the same framework; Vite would need separate serverless functions anyway.
- Vercel gives the required live public browser link with zero deploy work, plus env-var storage for the key.
- Codex is most fluent in Next.js — fewer review cycles.

Everything else stays client-side:

- **State**: Zustand store holding the Citizen Graph, persisted to `localStorage`. A "Reset demo" control restores the seed.
- **Simulated APIs**: a `mockGov` service layer — plain async functions with 400–1200 ms latency, believable government-shaped responses, and deterministic outcomes. Every response carries `{ simulated: true, authority: "..." }` so the UI can label mocks (Honesty criterion).
- **AI routes** (the only server code): `/api/intent` (classify + plan), `/api/explain` (notices, rules, provenance in the citizen's language), `/api/scamcheck`. All proxy the OpenAI Responses API with a small fast model; system prompts include the relevant graph slice as context. Language of the reply mirrors the language of the input — Hindi/Hinglish support falls out of the model, not a translation layer.
- **i18n**: lightweight homegrown dictionary for static chrome (English + Hindi); all dynamic content comes from the model in the user's language. No i18n framework.
- **Motion**: Framer Motion, used sparingly and lazy-loaded (design direction wants animated transitions; low-bandwidth story wants a small bundle — completion animations and sheet transitions only).
- **Auth**: mock OTP login. Three phone numbers map to three logins (any 6-digit OTP accepted): Arjun (primary demo), Priya (marriage partner), Sunita (delegation view). Credentials go in the submission form.

Non-goals: real backend, database, tests, service workers. "Offline wallet" means previously opened documents render from the localStorage cache.

---

# Citizen Graph Shape

One JSON graph: `{ nodes: GraphNode[], edges: GraphEdge[], events: GraphEvent[] }`.

```ts
type NodeType =
  | 'person' | 'address' | 'employment' | 'business' | 'property'
  | 'vehicle' | 'document' | 'benefit' | 'application' | 'obligation'
  | 'notice' | 'delegation'

interface Verification {
  source: 'UIDAI' | 'NSDL' | 'EPFO' | 'RTO' | 'MCA' | 'Municipal' | 'Self'
  state: 'verified' | 'self-declared' | 'mismatch' | 'expired' | 'pending'
  asOf: string          // ISO date
  note?: string         // e.g. "Name differs from Aadhaar record"
}

interface GraphNode {
  id: string            // 'person:arjun', 'doc:arjun-pan'
  type: NodeType
  attrs: Record<string, unknown>
  verification: Verification
}

type EdgeType =
  | 'childOf' | 'spouseOf' | 'residesAt' | 'owns' | 'employedBy'
  | 'holds'            // person → document
  | 'nomineeOf' | 'legalHeirOf' | 'delegateOf'
  | 'subjectOf'        // person → application | obligation | notice

interface GraphEdge {
  id: string
  type: EdgeType
  from: string
  to: string
  attrs: Record<string, unknown>   // e.g. { share: 0.33 } on legalHeirOf
  validFrom: string
  validTo?: string                 // set = historical, never deleted
  status: 'active' | 'ended' | 'pending'
}
```

## Design rules

1. **Nothing is deleted.** Death sets `person.attrs.deceasedOn` and ends edges (`validTo`, `status: 'ended'`); marriage adds a `spouseOf` edge. Historical relationships are just ended edges — the P2 timeline comes free.
2. **Every node and edge carries `verification`.** This single field powers verified-data indicators, the "Why?" provenance drawer, and record-reconciliation (a `mismatch` state *is* a discrepancy).
3. **Procedures mutate via events, not direct writes.** Completing a procedure step emits `GraphMutation[]` (`addNode` | `addEdge` | `endEdge` | `patchAttrs`), applied by one reducer and appended to `events`. This gives the graph-mutation confirmation UI, undo for demos, and an audit log.
4. **Everything else is derived.** Obligations view, "Money" (due/refundable), Things-to-do, and benefit eligibility are selector functions over the graph. Re-running eligibility selectors after every mutation *is* Continuous Eligibility — no extra machinery.
5. **Eligibility rules are data.** Each benefit node carries `rules: [{ field, op, value, explanation }]` evaluated against graph selectors, so the UI can show eligible / potentially-eligible / not-eligible *with reasons* and "missing evidence".

---

# Seed Family — the Sharmas of JP Nagar, Bengaluru

A migrant family settled in Bengaluru for two decades — itself the most Bengaluru story there is. Official surfaces are Karnataka (BBMP, KA registrations, Karnataka marriage registration); the family is Hindi-speaking at home, so Kannada, Hindi/Hinglish and English demos are all natural. One family reaches every demo workflow, and the inter-state edges (Ahmedabad, Delhi) show cross-state pain.

### Arjun Sharma — 29, primary demo login
Salaried software engineer at Meridian Tech Pvt Ltd, Bengaluru (EPFO member, UAN active). Runs a side proprietorship, **Sharma Web Solutions** (Udyam + Karnataka GST registered, FY25 turnover ₹18L). Unmarried. Owns a Honda Activa (KA-05).

- Documents: Aadhaar (verified) · PAN (**verified but name reads "ARJUN KUMAR SHARMA" vs Aadhaar "Arjun Sharma" — the reconciliation demo**) · Passport (**expires 2027-01-19 — proactive nudge**) · DL (valid) · Vehicle RC · Udyam certificate · GST registration.
- Money & obligations: ITR refund **₹12,400 pending** (money due *to* him) · GSTR-3B due Sep 20 · Bengaluru Traffic Police e-challan **₹500** (signal jump, Hosur Road, Aug 2) · BBMP property tax on the family house due Oct 31 (he pays it for his father).
- Drives: obligations dashboard, business loan (Mudra eligibility off real graph state), start-a-business, reconciliation, marriage.

### Priya Patel — 27, second demo login
UX designer in **Ahmedabad** (inter-state marriage = realistic complexity: domicile, address proofs from two states). Aadhaar + PAN verified, passport valid. Her own minimal graph: one address, one employment, three documents.

- Drives: marriage workflow — invite, consent, document reuse, witness selection, appointment, mock payment, certificate issuance, `spouseOf` mutation.

### Rajesh Sharma — 61, Arjun's father (the death demo)
Retired accountant from Karnataka State Warehousing Corporation. EPS pension **₹8,200/mo**, EPF balance ₹6.1L with **Sunita as nominee**. Owns the family house (JP Nagar, Bengaluru — BBMP khata) and a Maruti Dzire (KA-01).

- The demo: "papa ki death ho gayi, kya karna hoga?" → death registration → certificate → pension stops / family-pension starts → EPF nominee claim → vehicle & property mutation → legal-heir workflow across Sunita, Arjun, Kavita.

### Sunita Sharma — 56, mother, third demo login (delegation)
Homemaker. Nominee on Rajesh's EPF and policy. Post-death, the eligibility engine flips her to **eligible: family pension** and **potentially eligible: widow pension** — the Continuous Eligibility demo moment.

- She **delegates** paperwork to Arjun (scope: pension + property, expiry 90 days, revocable) — the delegation demo without a fourth full login.

### Kavita Verma (née Sharma) — 33, sister
Married (active `spouseOf` edge since 2019 — shows a pre-existing relationship with history), lives in Delhi. Not a login; participates as the third legal heir whose **consent arrives asynchronously** (simulated) in the legal-heir workflow — multi-citizen collaboration without another auth path.

### Inbox seed (Arjun)
1. ITR refund initiated — legitimate, links to refund status.
2. EPFO annual passbook statement — legitimate.
3. **"Dear customer your PAN card will be block in 24 hrs click http://pan-updat.info"** — the scam-check demo: sender/domain inspection, comparison against his real notice history, warning-sign explanation, cybercrime workflow launch.
4. RTO e-challan notice — links to the obligation.

### Benefit seed
- Arjun: eligible — PM Suraksha Bima; **potentially eligible — Mudra (Kishor) loan** (business vintage + turnover from graph; missing evidence: latest ITR-V).
- Sunita (post-death only): eligible — EPS family pension; potentially eligible — Karnataka widow pension (missing evidence: death certificate → resolved by completing the death workflow: document reuse across procedures).

---

# Workflow tiering (build order)

| Tier | Workflow | Cost driver |
|---|---|---|
| Deep | Death in family | Procedure chain + graph mutations + legal-heir consent |
| Deep | Marriage | Second login + consent + certificate + mutation |
| Medium | Obligations dashboard | Pure selectors over seed — no procedure engine needed |
| Medium | Business loan decision | Eligibility rules + comparison UI + LLM risk explanation |
| Cheap | Scam check | One screen + `/api/scamcheck` + seeded inbox |
| Cheap | Start a business | LLM-generated action plan from graph context + plan cards |

Six intents, six distinct working experiences — matching the Definition of Done without six deep builds.
