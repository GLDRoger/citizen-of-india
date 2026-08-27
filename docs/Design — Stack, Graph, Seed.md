# Citizen of India — Stack, Citizen Graph & Seed Design

Companion to `Citizen of India — Feature Set.md`. This is the spec Codex builds from.

---

# Stack Decision

**Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel.**

Why Next.js over Vite+React:

- The App Router gives the prototype a clear page structure while keeping the product frontend-only.
- Vercel gives the required live public browser link with a small deployment surface.
- Codex is most fluent in Next.js — fewer review cycles.

Everything else stays client-side:

- **State**: Zustand store holding the Citizen Graph, persisted to `localStorage`. A "Reset demo" control restores the seed.
- **Simulated APIs**: a `mockGov` service layer — plain async functions with 400–1200 ms latency, believable government-shaped responses, and deterministic outcomes. Every response carries `{ simulated: true, authority: "..." }` so the UI can label mocks (Honesty criterion).
- **Local planners**: deterministic TypeScript modules classify intents and explain notices. They use only the active profile slice and make no external model call.
- **i18n**: lightweight homegrown dictionary for English, Hindi and Kannada chrome and generated plan copy. No i18n framework.
- **Motion**: small CSS transitions with reduced-motion and data-saver fallbacks.
- **Profile access**: three fictional profiles from `seed.json` open with one tap. Arjun is the primary demo; Priya drives shared marriage consent; Sunita drives delegation and benefits.

Non-goals: real backend, database, external model calls, tests, service workers. "Offline wallet" means previously opened documents render from the localStorage cache.

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

### Rajesh Sharma — 61, Arjun's father (deferred seed context)
Retired accountant from Karnataka State Warehousing Corporation. EPS pension **₹8,200/mo**, EPF balance ₹6.1L with **Sunita as nominee**. Owns the family house (JP Nagar, Bengaluru — BBMP khata) and a Maruti Dzire (KA-01).

- This data supports a possible later family-record workflow. It is not part of the current pitch, primary navigation, or judged demo path.

### Sunita Sharma — 56, mother, third demo login (delegation)
Homemaker. Nominee on Rajesh's EPF and policy. Those family-record relationships remain in the seed for later use; the current demo does not trigger the deferred death workflow.

- She **delegates** paperwork to Arjun (scope: pension + property, expiry 90 days, revocable) — the delegation demo without a fourth full login.

### Kavita Verma (née Sharma) — 33, sister
Married (active `spouseOf` edge since 2019 — shows a pre-existing relationship with history), lives in Delhi. Not a login; participates as the third legal heir whose **consent arrives asynchronously** (simulated) in the legal-heir workflow — multi-citizen collaboration without another auth path.

### Inbox seed (Arjun)
1. ITR refund initiated — legitimate, links to refund status.
2. EPFO annual passbook statement — legitimate.
3. RTO e-challan notice — links to the obligation.

### Benefit seed
- Arjun: eligible — PM Suraksha Bima; **potentially eligible — Mudra (Kishor) loan** (business vintage + turnover from graph; missing evidence: latest ITR-V).
- Sunita: the seed retains family-pension and widow-pension rules for future work, but they are not presented as current demo actions.

---

# Workflow tiering (build order)

| Tier | Workflow | Cost driver |
|---|---|---|
| Deep | Marriage | Second login + consent + certificate + mutation |
| Medium | Obligations dashboard | Selectors plus one simulated payment mutation |
| Medium | Business loan decision | Eligibility rules + comparison UI + local risk explanation |
| Cheap | Record correction | Compare the seeded PAN mismatch and submit a simulated correction request |
| Cheap | Start a business | Local action plan from profile context + plan cards |
| Deferred | Death in family | Kept outside the current pitch and primary navigation |

The marriage journey proves the product deeply; the other visible journeys show how the same record-first model extends.
