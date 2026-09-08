# Continuity revision

The submitted film remains at `out/citizen-hackathon-demo.mp4`. The current review copy is `out/citizen-hackathon-demo-continuity-final.mp4`; earlier continuity and closing review cuts are retained alongside it. Nothing in this revision uploads to YouTube or changes a submission form.

## Edit

- Retain the opening, Home, challan and marriage scenes through frame 1588.
- Correct the marriage narration to say **own profile**, not **own phone**.
- Replace the competitor-comparison and UMANG scenes, and absorb the former short PAN scene, into four continuity beats (frames 1589–2681).
- Show a submitted correction with the unchanged PAN, an unresolved answer carried into a grievance, a failed send/reload/retry, and the case brief.
- Retain family access/revocation, now at frames 2682–3122; clarify that access is to shared records, not the entire profile.
- Refresh the Timeline capture to include the new follow-up.
- Close with “India built UPI for payments. Why not do the same for public services? One country. A billion lives. One connected record.” and a quiet end-card hold, without a world-first claim.

The film remains **3600 frames, 30 fps, 1920×1080**. All animated scene values come from frame-driven Remotion primitives. Source footage is frozen local media from the working app, not reconstructed UI.

## Reproduce

Run the app from the repository root with `npm start -- --port 3177` after a successful app build. From this directory:

```sh
node scripts/capture-continuity.mjs
VOICEOVER_ONLY=marriage,case-pending,case-followup,case-recovery,case-brief,delegation,close npm run voiceover
node scripts/voice-envelope.mjs
npm run lint
node scripts/check-motion.mjs
VIDEO_OUTPUT_NAME=citizen-hackathon-demo-continuity-final npm run render
```

The capture runs a fresh isolated browser session and performs the film's preceding challan/marriage actions through the UI. It asserts that failure creates no graph change, reload preserves the same draft/record, retry creates exactly one grievance, and the original matter remains unresolved. `CAPTURE_ONLY` can replay preceding steps without recapturing them.

Voice generation uses the existing Gemini TTS/Sulafat setup and reads credentials only from the environment or ignored `.env`. The unrelated transcript and embedded key in a supplied example are not copied into the project.

For this review, the full narration track was transcribed locally with Whisper and approved caption text was aligned using `scripts/align-captions.mjs`. The alignment report, capture assertions, rendered stills, exported case brief and verification logs are in `out/continuity-review/`. Regenerating voice changes timings: re-transcribe and run alignment again before final rendering.

The final render masters the mix to -16 LUFS with a -1.5 dBTP target, keeps 48 kHz AAC audio, and writes a fast-start MP4. Validate the encoded output rather than relying only on those settings.

## Audio maintenance

The pre-existing SFX manifest described an older 12-sound pack; the runtime uses 15 sounds with several different durations. This revision reconciles the manifest with that runtime contract, pads the soft tick's silent tail, and gives the heavy impact a little headroom. The motion check now verifies all 15 declared assets against the runtime as well as their duration, format, non-silence and peak limits.
