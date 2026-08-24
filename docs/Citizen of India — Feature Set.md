# Citizen of India

**Independent hackathon prototype — not an official government product.** Built for the Build What Moves India hackathon. All data is synthetic; all government integrations are simulated.

## Build Constraints

- Responsive frontend only — no real backend, no test suite.
- Simulated API layer: mock services with realistic latency, believable government responses, and synthetic citizen state that mutates and persists across the session.
- Code written by Codex (gpt-5.6); design and review direction from above. Broker chat logs kept as evidence of how Codex built it.
- Every feature shown in the demo must actually work; anything unfinished stays out of the demo path.

# Feature Set

## P0 — Core Hackathon Product

These features define Citizen. The prototype should feel broken without them.

### Identity
- Synthetic Aadhaar authentication
- PAN linking
- OTP login
- Citizen profile
- Verified-data indicators
- Consent screen

### Citizen Graph
- Person node
- Parent/child relationships
- Spouse relationships
- Address
- Employment
- Business
- Property
- Vehicle
- Documents
- Benefits
- Tax status
- Applications
- Obligations
- Delegations
- Historical relationships

### Universal Intent
- Large “What do you need?” input
- Natural-language requests
- Suggested intents
- Voice-entry UI
- Intent classification
- Context retrieval
- Workflow generation
- Clarification questions
- Action-oriented responses

### Home
- Citizen snapshot
- Things to do
- Documents
- Benefits
- Money
- Government Inbox
- Pending applications
- Recommended actions

### Procedure Engine
- Procedure definitions
- Dependencies
- Required documents
- Eligibility rules
- Participants
- Fees
- deadlines
- workflow state
- outcomes
- graph mutations

### Action Engine
- Prefill form
- Generate document
- Request consent
- Upload/request evidence
- Mock submit
- Mock payment
- Mock appointment
- Complete workflow
- Update Citizen Graph

### Provenance
- “Why?” on requirements
- Source authority
- Verification state
- Rule explanation

### Language & Inclusion
- Intent input understands any Indian language, including romanized Hinglish (“papa ki death ho gayi, kya karna hoga?”) and Kannada (“ಅಪ್ಪ ತೀರಿಕೊಂಡರು, ಮುಂದೇನು ಮಾಡಬೇಕು?”)
- UI language toggle: English + Kannada + Hindi at minimum; Tamil, Telugu, Marathi as stretch
- Replies, action plans and clarification questions come back in the language the citizen used
- “Explain in my language” on every notice, requirement and eligibility rule
- Voice entry in Indian languages (UI + transcription mock)
- Plain-language mode: no legal or departmental jargon anywhere in the default experience

### Low-Bandwidth & Access
- Mobile-first responsive layout — assume judges open the link on a phone
- Small bundle, no heavy media; system fonts or one subset font; illustrations as lightweight SVG
- Skeleton states and progressive loading so slow connections never see a blank page
- Document wallet cached locally — previously opened documents open offline
- Data-saver mode toggle (demo moment: journey completes on a throttled 3G profile)
- SMS-fallback narrative for status updates (mocked, shown in the design)
- Large touch targets and readable type for first-time smartphone users

---

# P0 Demo Workflows

### Death in family
- Report death
- Identify deceased relative
- Update family graph
- Death registration
- Death certificate
- EPFO/pension check
- Nominee actions
- Legal-heir workflow
- Property/succession overview

### Marriage registration
- Invite partner
- Partner consent
- Identity verification
- Document reuse
- Witness selection
- Appointment
- Mock payment
- Certificate issuance
- `spouseOf` graph mutation

### Government obligations
- Unified deadline view
- Expiring documents
- Pending responses
- Government money due/refundable
- Active applications

### Business loan decision
- Read business state
- Read income/tax state
- Existing obligations
- Government-backed scheme eligibility
- Loan comparison
- Risk explanation
- Start application

### Scam check
- Paste suspicious message
- Sender/domain inspection
- Compare against known interactions
- Explain warning signs
- Mark likely legitimate/suspicious
- Launch cybercrime workflow

### Start a business
- Business intent capture
- Location
- Business type
- Entity suggestion
- Required registrations
- Required licences
- Government schemes
- Financing opportunities
- Generated action plan

---

# P1 — Makes the Product Feel Complete

### Document Wallet
- Aadhaar
- PAN
- Passport
- DL
- Birth certificate
- Marriage certificate
- Tax documents
- Business documents
- Property records
- Search
- Expiry states
- Verification states

### Record Reconciliation
- Name mismatch detection
- Address mismatch
- DOB mismatch
- Relationship mismatch
- Expired documents
- Missing prerequisite
- Resolve discrepancy flow

### Benefits
- Eligible
- Potentially eligible
- Not eligible
- Eligibility explanation
- Missing evidence
- Expected value
- Apply button

### Government Inbox
- Notices
- Requests
- Decisions
- Refunds
- Payment reminders
- Application updates
- Explain
- Respond
- Delegate
- View source

### Search
- Search documents
- Search notices
- Search applications
- Search benefits
- Search government records
- Natural-language filtering

### Multi-Citizen Collaboration
- Invite citizen
- Shared workflow
- Per-person tasks
- Consent
- Documents
- Notifications
- Shared progress

### Delegation
- CA
- Lawyer
- Guardian
- Family member
- Power-of-attorney holder
- Scope access
- Expiry
- Revoke

---

# P1 Service Areas

### Identity
- Name correction
- Address update
- PAN
- Aadhaar-related actions
- Domicile
- Birth/death certificates

### Family
- Marriage
- Divorce
- Birth
- Death
- Adoption
- Guardianship
- Legal heir
- Nominee
- Power of attorney

### Tax
- File ITR
- Tax summary
- Refund
- Respond to notice
- Property tax
- GST guidance

### Employment
- EPFO
- Pension
- Employer contribution issue
- Job change
- Retirement

### Business
- Incorporation
- GST
- Udyam
- licences
- compliance
- tenders
- schemes
- financing
- closure

### Property
- Purchase
- Sale
- Registration
- Mutation
- Inheritance
- Property tax
- Building permission

### Transport
- Driving licence
- RC
- Transfer vehicle
- Challans
- Road tax

### Legal
- Legal-aid discovery
- Consumer complaint
- POA
- Affidavit
- Succession
- Notice response
- Court process guidance

### Safety
- Crime reporting
- Cybercrime
- Financial fraud
- Lost property
- Missing person
- Emergency-routing UI

---

# P2 — Vision Features

### Proactive Citizen
Citizen acts before the citizen asks.

Examples:

- “Your passport expires in six months.”
- “You became eligible for this scheme.”
- “Your company crossed a compliance threshold.”
- “Your father’s death creates three unfinished procedures.”
- “Your employer appears to have missed two PF deposits.”

### Government Timeline
A chronological history of the citizen's relationship with government.

### Life Timeline
Birth, education, employment, marriage, property, business, retirement and other events presented as one coherent timeline.

### Citizen Graph Explorer
Visual graph showing people, property, businesses, documents and government relationships.

### Government Relationship Health
A high-level view of:

- unresolved obligations;
- document conflicts;
- overdue payments;
- pending responses;
- expiring credentials;
- benefits left unclaimed.

### Personal Government Inbox AI
Turns notices into plain language and suggested actions.

### Universal Government Wallet
Documents, licences, certificates, benefits, applications and permissions in one place.

### Family View
Manage government-relevant family relationships and shared obligations.

### Business View
One government relationship for each business owned or managed by the citizen.

### Property View
Ownership, taxes, registrations, permissions, disputes and documents for each property.

### “Should I?” Mode
Decision support across:

- loans;
- schemes;
- chit funds;
- business registration;
- tax registration;
- property actions;
- legal actions;
- government notices.

### Continuous Eligibility
Automatically reevaluate schemes whenever the Citizen Graph changes.

### Cross-Government Automation
One event automatically proposes all downstream government actions.

---

# Product Navigation

Primary navigation should stay small.

### Home
What do you need?

### You
Citizen Graph represented in human terms.

### Activity
Applications, procedures and completed actions.

### Inbox
Government communications.

### Documents
Unified document wallet.

### Discover
Benefits, schemes, useful government opportunities.

Traditional “Services” may exist but should be intentionally de-emphasised.

---

# Core UI Components

- Giant intent input
- Citizen context cards
- Action-plan cards
- Procedure timeline
- Status chips
- Verified-data indicators
- Relationship cards
- Citizen invite card
- Eligibility cards
- Notice cards
- Document cards
- Consent request
- Permission editor
- “Why?” provenance drawer
- Smart warning/banner
- Comparison interface
- Government inbox row
- Action confirmation sheet
- Event completion animation
- Graph mutation confirmation

---

# Design Direction

Citizen should feel nothing like a legacy government portal.

- Huge typography
- Large empty areas
- Strong hierarchy
- Few choices per screen
- Natural-language labels
- Minimal form exposure
- Animated state transitions
- Soft, human illustrations
- Restrained Indian visual references
- Navy/ivory foundation
- Teal/green actions
- Saffron used sparingly
- Clear progress
- No walls of instructions
- No visible department complexity unless requested

The interface should feel closer to a premium consumer product than an administrative portal.

---

# Prototype Definition of Done

The prototype is done when:

- the entire home experience is functional;
- the synthetic Citizen Graph is populated;
- at least six intents route into distinct experiences;
- death and marriage workflows can be completed end-to-end;
- shared citizen workflows work;
- documents are reused automatically;
- at least one eligibility engine experience works;
- at least one record conflict is detected;
- inbox actions work;
- obligations update;
- completing a procedure mutates the synthetic citizen state;
- every important flow contains believable mocked government responses;
- at least one full journey works in Hindi (input, plan, and replies);
- the main journey completes on a phone over a throttled connection;
- mocked data and simulated integrations are labeled in the UI, with an “what’s real vs. mocked” page;
- the product never requires the judge to understand which department they need first.