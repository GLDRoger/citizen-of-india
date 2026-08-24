# Design Language — The Citizen File

Supersedes the palette/component sections of `UI Redesign Brief.md`. The structure from that brief (top nav, breadcrumbs, dashboard merge, services index, routes) stays. This document replaces how everything looks. Where the two disagree, this wins.

The idea: Indian government material culture — the sarkari file, the ledger, the rubber stamp — redrawn as a precise, modern instrument. Ink on paper. Records, not cards. One deep green, used tonally, never bright.

## Kill list (all currently in the codebase)

- Cream/ivory canvas, teal actions, navy surfaces — gone entirely.
- Icons inside tinted rounded squares — gone. Icons are bare or absent.
- Pill chips for statuses/labels (Verified, Pending, Done, counts) — gone. Status is text with a small tonal dot.
- Hairline gray borders on every box; big 18–26px radii; drop shadows — gone.
- Decorative lucide icons on stat cards, list rows, step cards — gone. Keep only functional glyphs: menu, bell, close, external-link, mic. Bare, ink-colored.
- The saffron decorative arc in the intent composer — gone.
- "Independent prototype" pill — becomes plain small text beside the wordmark.

## Tokens

```css
--paper:        #FAFAF7;  /* page base — barely-warm white, not cream */
--paper-shade:  #F1F0EA;  /* tonal panel surface */
--paper-line:   #E3E1D8;  /* rules; also panel border = shade darkened, not gray */
--ink:          #191813;  /* warm near-black, all text */
--ink-mute:     #5A594F;  /* secondary text */
--green-deep:   #21402C;  /* THE accent: primary buttons, active states, stamp */
--green-tint:   #E7ECE4;  /* quiet selected/positive surface */
--brick:        #7A2E28;  /* semantic danger/scam only, desaturated */
--brick-tint:   #F2E7E4;
```

Rules: `green-deep` appears as solid fills (buttons, active nav underline) and small dots — never as bright text on paper except links. No other hues. Positive/negative money and statuses rank by weight and position first, color second.

## Type

- **Display + numbers: Anek** (Ek Type, Google Fonts) — `Anek Latin`, `Anek Devanagari`, `Anek Kannada`, self-hosted via `next/font/google`, weights 500/700/800. Chosen because it is an Indian foundry superfamily that renders our EN/HI/KN headlines natively — a brief-specific decision, not a default.
- Headlines: Anek 700–800, tight leading, normal width. The current huge scale stays (it's right); the face changes.
- **Body: keep Geist quietly** (already loaded). Body never carries the brand.
- All numerals (money, dates, counts): `font-variant-numeric: tabular-nums`; money in Anek 700.
- Section labels: 11px uppercase letterspaced Anek 700 ink-mute, with a short 24px rule to their left (one treatment, used consistently, only on true section heads).

## Containers

1. **Panels** (the card replacement): surface `--paper-shade`, radius 8px, border 1px in the panel's own color darkened ~7% (`--paper-line`), no shadow. Depth is tonal, not drawn.
2. **The file tab** (bespoke geometry, the signature): major panels (intent composer, workflow step panel, dashboard notice) get a small trapezoid tab rising from the top-left edge — CSS clip-path on a ::before, same fill as the panel, containing the panel's label in the section-label style. This is the one piece of invented geometry; use it on at most 2–3 panels per screen.
3. **Ledger lists** (the stat-card replacement): no boxes. Rows separated by 1px `--paper-line` rules: label (ink-mute) left · value (Anek 700 tabular) right · action as underlined text link or small solid button. Home's six stat cards collapse into one "Your record" ledger + one "Things to do" ledger.
4. **Tables where data is tabular**: dashboard obligations become a real table on desktop (what · authority · due · amount · action), stacking to ledger rows at 390px.
5. **The stamp**: `SIMULATED` (and `VERIFIED` on documents) as an uppercase Anek 700 letterspaced text in a 1.5px double-bordered rectangle, rotated −2°, `--green-deep` at 70% opacity, stamp-like. Placed once per logical surface (composer corner, workflow header, document card), NOT on every element. This replaces every simulated/verified pill.
6. **Buttons**: rectangles, radius 4px. Primary: solid `--green-deep`, paper text, Anek 600. Secondary: plain underlined ink text link. Kill the icon-arrow-in-every-button habit; keep an arrow only on the single primary CTA of a screen.
7. **Inputs**: the intent textarea sits in a file-tabbed panel on `--paper`, 1px ink border at 20% opacity, no glow focus — focus is a 2px `--green-deep` left edge.

## Screen notes

- **Nav**: paper, wordmark `CITIZEN` Anek 800 + "independent prototype" plain 11px text after it; links in ink, active = 2px `--green-deep` underline; single 1px rule under the whole bar. Mobile sheet: paper, ledger-style links.
- **Hero**: owns the first 390px viewport: greeting (ink-mute) → headline (Anek) → composer panel with tab `[ NEW REQUEST ]` and stamp. Suggestion chips become plain underlined text links in a row, separated by `·`.
- **Dashboard**: 4 stat cards → one summary ledger; notices/obligations as the table/ledger; documents rail as a ruled list (name · masked no. · status dot + text).
- **Workflows**: step strip becomes a numbered ink line — numbers in small squares (4px radius), completed = solid `--green-deep`, connective 1px rules; step panels get the file tab with the step label.
- **Death flow tone**: unchanged (supportive), restyled.
- **Footer**: three plain lines + underlined "Service status" link. No band, just a top rule.

## Guardrails

- Chrome strings keep flowing through the en/hi/kn dictionary; new strings added in all three.
- No new npm deps (Anek via `next/font/google` is config, not a dep). Framer Motion stays lazy; completion animation kept, everything else minimal.
- Zero logic changes: stores, selectors, mutations, API routes, seed untouched.
- ≤500 lines/file. Mobile 390px first. Contrast: all text ≥ 4.5:1 on its surface.
- After implementing, re-check every kill-list item is actually gone (grep for `rounded-full`, pill classnames, icon-tile patterns) — leftovers in one screen defeat the whole repaint.
