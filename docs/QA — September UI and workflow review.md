# September UI and workflow review

Local verification on 6 September 2026. This remains a frontend-only prototype with fictional records, not production authentication or government integration.

## Behaviour corrected

- Outcome feedback receives the workflow's explicit record ID and checks that the active profile owns or participates in that record. Benefit links identify the exact application, including when a person has multiple drafts.
- An unresolved result stays in Home once, retains its payment/application history, and can later be marked solved or reopened. The follow-up names the relevant authority and explicitly says no grievance was sent.
- Marriage consent ownership follows the ordered participants, including Priya-initiated invitations. Only the recipient sees the consent packet before consenting. Witness selection persists across reloads; both demo witnesses are required.
- Delegated mode exposes shared property/document records only. Benefits, business applications and other direct URLs do not mount their unrestricted screens. The graph store permits only owned-document caching under active, unexpired document access and attributes the event to the delegate. Both people can see delegation and document-save events in their history.
- Existing saved graphs are preserved and offered an explicit latest-demo reset. Reset also clears local workflow drafts and exits delegated mode. Malformed draft storage cannot replace store methods.
- APY no longer treats age and a bank account as sufficient eligibility. Missing income-tax payer history remains unknown, not false; drafts with incomplete eligibility cannot be submitted.

## Presentation corrected

- Service titles use solid ink and script-appropriate line spacing. Monument artwork remains secondary; exported poster assets are retained as artwork, not loaded inside service text.
- My records opens as a list, with documents before the health summary on phones. The map remains an optional explorer.
- The landing page puts working proof before the longer public-infrastructure argument. Unsubstantiated claims about named companies and universal UPI adoption were removed.
- Quick answers uses four explicit FAQ choices, with no free-text matching or simulated typing. The first answer clearly identifies the independent prototype.
- Public privacy and integration copy distinguishes implemented behaviour from proposed safeguards.

## Checks

- `npm run build`, including TypeScript and static route generation.
- `npx eslint .` and `git diff --check`.
- Seventeen focused, in-memory regression checks against the actual TypeScript functions: explicit outcome ownership; benefit URLs; unresolved/solved transitions; both marriage initiators; delegation allow/deny cases, expiry and scope intersection; store attribution; saved-seed preservation and reset; malformed draft storage; APY unknown/known tax history; challan-to-vehicle matching; visibility of delegation requests to the recipient. No persistent test suite or additional dependency was introduced.
- Rendered checks use the local production build and isolated browser origins, not the deployed service. The core checks cover 360px phones and desktop, English and Kannada service typography, Priya-initiated marriage through certificate issuance, witness reload, two separate benefit applications and cross-profile URL denial, challan payment/reload/resolution, delegated request/grant/document-save/revoke, a Hindi EPFO grievance through submission and reload, and keeping/resetting an older saved demo.

## Evidence boundaries

No deployment or live government request was made. Offline boot, a full slow-3G run, exhaustive accessibility testing and native-language editorial review remain unverified. Ration card e-KYC, authority follow-up and marriage-consent withdrawal are explicitly outside prototype scope rather than presented as working actions.

## Public-fact sources

- [Ministry of Finance / NPCI: 55.49 crore UPI users onboarded as of June 2026](https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2286608&lang=2&reg=48).
- [PFRDA APY eligibility: people who are or have been income-tax payers cannot newly join from 1 October 2022](https://pfrda.org.in/web/pfrda/schemes/atal-pension-yojana-apy).
