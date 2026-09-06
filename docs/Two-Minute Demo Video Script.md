# Citizen — Two-Minute Demo Video Script (round 2)

Shipped 6 September 2026 for the top-250 mentorship round. Minute one states the problem and shows Citizen working; minute two is what changed after round one, told as the fair questions we put to ourselves and the answers we built.

## Production format

- **Canvas:** 1920 × 1080, 16:9, 30 fps, 3,600 frames, exactly 120.000 s
- **Voice:** Gemini `gemini-3.1-flash-tts-preview`, voice Sulafat, en-IN. Direction: low register, unhurried, polished urban Indian English with lightly American vowels; warm, a little amused; ~150–165 words per minute. 299 spoken words.
- **Footage:** stop-motion captures of the working app (`demo-video/scripts/capture-app.mjs`): phone clips at 1170 × 2532, desktop at 3840 × 2160, one shared Citizen Graph across all clips so the Timeline at the end lists everything the film did.
- **Motion:** the file, the ledger and the stamp — paper sheets, saffron file tabs, rubber stamps, ledger rows, a native record map on the product's spiral geometry, question cards on their own track so each lands before the voice answers it.
- **Sound:** *Bombay Summer* by Shane Ivers (CC BY 4.0; credit in `demo-video/MUSIC-CREDITS.md`) ducked −12 dB under speech and dipping on every hit. Every non-text element that appears — and every typed character — lands on a clean sine sub pulse; cuts on a heavy sub; stamps on a thud; consent on a two-note chime. No risers, sweeps or whooshes. All effects are synthesised with ffmpeg (`demo-video/public/audio/sfx`).
- **Text tracks:** the big question cards carry the FAQ; the small subtitle at the bottom is the voice transcript for muted viewing.

## Timed script

| Time / frames | Spoken dialogue | On screen |
|---|---|---|
| **0:00–0:10**<br>`0–300` | “Your government record already exists — split across portals that never talk. Fix a name here, pay a fine there; nothing remembers what you did last week.” | Three portal sheets (PAN, challan, EPFO) stack misaligned, each holding one slice of Arjun; they collapse into one file tabbed ONE FILE with "One record. Not a portal hunt." Stamp: Independent prototype. |
| **0:10–0:17**<br>`301–522` | “Citizen is one living record. It knows what changed, what applies to you, and what to do next.” | Native record map: 13 records fly onto the product's spiral geometry around Arjun; group-coloured edges; one bass pulse per record. Ticker: 3 profiles · 11 journeys · EN · HI · KN. |
| **0:17–0:27**<br>`523–813` | “Arjun opens Home. It already knows: his PAN doesn't match Aadhaar, a challan is due, and his mother may need help with her property papers.” | Phone: Arjun's Home (real clip). Ledger on the right rules in the three findings on their words. |
| **0:27–0:41**<br>`814–1240` | “He types 'pay my challan'. Citizen finds the fine on his record, matches it to his scooter, and he pays in one tap. Money, Documents and History update together — one write, no copies.” | Desktop: "pay my challan" typed (one pulse per character), Citizen matches the fine, Review payment, Pay in demo, Challan paid. Split into three phone panes at once: Money −₹500, receipt in Documents, History row. Stamp: PAID · SIMULATED. |
| **0:41–0:52**<br>`1241–1588` | “Say Arjun and Priya want to register their marriage. He invites her from the app; on her own phone, Priya sees exactly what she is sharing, and consents. Both records update.” | Two phones: Arjun invites; Priya's phone shows the consent packet; she taps I consent (chime + CONSENTED stamp); the spouseOf edge draws between the phones; Arjun completes to Marriage registered. |
| **0:52–1:08**<br>`1589–2054` | “After round one we read the rest of the top two-fifty: mostly assistants, portals and wallets. None keep a living record with consent and consequences. That is where we went deeper — and put the hard questions to ourselves.” | 249 tiles gather into three labelled piles (assistants · portals · wallets); the Citizen tile stays lit. The first question card slams in on the last words. |
| **1:08–1:21**<br>`2055–2458` | “No. Those are a directory and a wallet. Citizen connects records to the work: every document, relative, job and asset on one map — and Home speaks first, from rules, not a chatbot.” | Card: "Isn't this just UMANG or DigiLocker again?" Desktop record map: drag, tap PAN, Fix name mismatch. Cut to the Home nudges on a phone on "Home speaks first". |
| **1:21–1:36**<br>`2459–2899` | “Sunita never fills a form. Arjun asks for access, she approves, and he sees only her property papers — nothing else. When the permission is revoked, the link ends — never deleted, so the history stays.” | Card: "What about a shared phone, and a grandmother who never typed?" Two phones: Arjun asks, Sunita approves, delegateOf edge draws, Arjun acts for Sunita and sees only the khata. Card: "One record of everything — what about privacy?" Sunita revokes; the edge greys but stays. |
| **1:36–1:44**<br>`2900–3122` | “The old PAN stays until the authority answers. A bad result can be marked unresolved, without losing what happened.” | Card: "What happens when a department gets it wrong?" Desktop: Send correction request → Correction request sent → Did this solve it? → No, not yet → Kept open. Nothing restarts. |
| **1:44–1:50**<br>`3123–3306` | “Every change names who made it. One log holds the whole story you just watched.” | Desktop Timeline scrolling the events of the film: challan paid, marriage registered, access asked/shared/ended, correction kept open — each attributed. |
| **1:50–2:00**<br>`3307–3599` | “Ukraine has one. Estonia has one. Nobody has built it for one point four billion people. Why can't India be the first?” | Card: "Isn't this too big to build?" Home headline re-sets EN → HI → KN in place. End card: logo, One record, carried forward, URL, stamp Independent prototype · fictional data. |

## Claims and their sources

- "the rest of the top two-fifty … mostly assistants, portals and wallets. None keep a living record with consent and consequences" — `docs/research/top-250/competitive-analysis.md` (all 249 other project URLs inspected on 2 September 2026).
- "Ukraine has one. Estonia has one." — Diia (Ukraine, 2020) and Estonia's state portal; both are state-run citizen apps. "Nobody has built it for one point four billion people" is a scale claim, not a capability claim.
- Everything shown is the working prototype at the commit this was rendered from; nothing on screen is fabricated product.

## Reproduce

```bash
npm run build && npm run start -- --port 3177      # repo root
cd demo-video
npm run capture                                     # stop-motion clips (≈8 min)
npm run voiceover                                   # needs GEMINI_API_KEY in demo-video/.env
node scripts/voice-envelope.mjs                     # ducking curve
npm run render                                      # out/citizen-hackathon-demo.mp4
```
