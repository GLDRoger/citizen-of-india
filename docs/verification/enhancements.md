# Enhancements verification

The Family Centre, attention filters and Notice Lens build on the same persisted Citizen Graph. They do not add accounts, a backend or government API calls.

## Repeatable browser checks

Use a fresh demo in one browser. All names and messages below are synthetic. Switch people through the account menu or `/start`.

1. **Notice recognition:** As Arjun, open `/inbox`. Try each of the three samples in English, Hindi and Kannada. Each has a local-language explanation; the challan remains ₹500 with the 1 September deadline. Confirm its linked record before saving.
2. **Conflicting input:** Change the challan amount or reference, paste an unrelated message containing “traffic challan”, or use “Pay by 99-99-2026”. The result must remain uncertain, without a guessed fine, deadline, government instruction or workflow. The page must not crash.
3. **Save and read:** Save an unknown message and choose **View saved notice**. Its own detail opens and the notice becomes **Read**, not a completed government task. Reload its URL and check the same record. Repeat the save: no duplicate notice or save event is created.
4. **Separate profiles:** Save the same unknown message as Priya. Her own copy must save successfully; she must not see Arjun's copy or its history. Arjun's sample notices must not appear in her sample picker.
5. **Connection consent:** Invite Sunita from Priya's Family Centre as **Parent**. Sunita sees Priya as **Child**. Accepting the invitation adds the relationship but shares no records. Cancel and decline separate invitations, then verify a new invitation can be sent. Only interactive demo profiles are offered.
6. **Scope change:** Sunita shares Documents with Priya, then changes the permission to Property. Priya's shared view shows the property and authorised property alert. A direct visit to `/documents` or a payment workflow must not reveal the removed documents or mount the payment screen.
7. **Independent permissions:** With Sunita → Priya sharing active, open Sunita's **My records**. The guided **Share with Arjun** permission must still be separate. Grant, revoke and grant Arjun's permission again. Priya's permission must remain unchanged. Revoke Priya's permission separately and verify Arjun still has his own access.
8. **Revocation feedback:** Revoke sharing from Family Centre. Access disappears, a confirmation appears, and focus returns to the permission disclosure control. Reopening it starts with no scopes selected.
9. **Other scopes:** Arjun can explicitly share pension or tax updates with Sunita. Pension access must not reveal tax notices or identity documents; tax access must not reveal the EPF notice. A valid permission with no matching records has an explicit empty state.
10. **Attention filters:** Check All, Personal, Business, Family and Financial. Empty categories explain that nothing needs attention. Unknown saved messages remain information, not payment demands. A submitted application marked unresolved remains a citizen action rather than a waiting item.
11. **Layout:** Inspect the notice review/save controls and family permission controls at 360px and at desktop width. Check Hindi and Kannada wrapping, visible focus, readable buttons and the six-item mobile navigation.

## Verification performed

- `npm run build`
- `npx eslint .`
- `npx tsc --noEmit --incremental false`
- Nineteen one-off executable regression groups against the real graph, selectors and procedure builders: multilingual recognition, conflicting input, record confirmation, profile-local deduplication, reload parsing, invitation permissions/cancellation, reciprocal relationships, scope updates, owner-only revocation, legacy permission isolation, expiry/edge pairing, attention ownership, pension/tax boundaries, settled/processing notice actions, local-save provenance, pair-specific nudges, and exact saved-notice attention links.
- Browser verification of the core notice and family flows, including the previously failing saved-notice navigation and legacy wrong-recipient revoke/regrant scenarios.
- Existing continuity checks for case-brief ownership, linked follow-ups, cycles, navigation, simulated failure and deterministic retry.

## PR-review follow-up

- Pay the challan, then explain its original notice: it must say the challan is already paid, with no payment CTA or overdue consequence. The saved-notice detail must agree. Processing payments must not prompt a retry payment; an explicitly unresolved matter must link to its grievance instead.
- Saving a seeded notice must produce a citizen-sourced Timeline event without changing the notice issuer's verification.
- A Sunita → Priya permission must not suppress the separate guided Sunita → Arjun share/request nudges. Expired guided permission restores those nudges.
- Open a saved-notice attention row from Home: the exact notice must open and become read. Timeline notice links use the same destination.

## Deliberate boundaries

Notice Lens recognises the canonical seed samples, including their existing translations and harmless whitespace/case variations. It does not infer arbitrary government instructions from keyword overlap. Other messages are kept as uncertain, profile-owned records. Other family members without interactive profiles remain read-only context. Shared access remains a scoped, local prototype view; it is not real authentication or cross-device synchronisation.
