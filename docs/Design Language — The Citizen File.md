# Design Language — The Citizen File

Supersedes the palette/component sections of `UI Redesign Brief.md`. The updated structure from that brief (top nav, breadcrumbs, unified Home attention surface, Journeys index, routes) stays. This document replaces how everything looks. Where the two disagree, this wins.

The idea: Indian public-service material culture, especially the sarkari file, ledger and rubber stamp, redrawn as a precise modern instrument. The public entry adds a second reference: contemporary Indian product design that is confident with language, indigo and saffron without looking official.

## Kill list (all currently in the codebase)

- The black-and-cream editorial look and cold startup navy are gone.
- Icons inside tinted rounded squares — gone. Icons are bare or absent.
- Pill chips for statuses/labels (Verified, Pending, Done, counts) — gone. Status is text with a small tonal dot.
- Hairline gray borders on every box; big 18–26px radii; drop shadows — gone.
- Decorative lucide icons on stat cards, list rows, step cards — gone. Keep only functional glyphs: menu, bell, close, external-link, mic. Bare, ink-colored.
- Saffron decoration with no job is gone. Saffron now identifies the brand mark and physical file tab.
- "Independent prototype" pill — becomes plain small text beside the wordmark.

## Tokens

```css
--paper:        #FFFDF5;  /* clean unbleached paper, not beige */
--paper-shade:  #F5EFE2;  /* file and panel surface */
--paper-line:   #DED4C3;  /* rules and panel edges */
--ink:          #261D16;  /* warm near-black, all text */
--ink-mute:     #685D50;  /* secondary text */
--green-deep:   #285944;  /* functional actions and positive state */
--green-tint:   #E4EEDC;  /* selected and positive surface */
--brick:        #A9422C;  /* semantic danger and error state */
--brick-tint:   #F6DED2;
--indigo-deep:  #21347F;  /* public entry, wordmark and identity */
--indigo:       #3150B5;  /* numbered record steps */
--indigo-tint:  #E5E9FB;  /* selection and quiet indigo surface */
--saffron:      #ED8B3A;  /* brand mark and file tab only */
```

Rules: indigo carries identity and large public-entry surfaces. Saffron marks the citizen file; it is not sprayed over headings or buttons. Green remains the action color inside the working product. Brick remains semantic danger. Large areas use one hue at a time, so the palette never becomes a flag treatment.

## Type

- **Display + numbers: Anek** (Ek Type, Google Fonts) — `Anek Latin`, `Anek Devanagari`, `Anek Kannada`, self-hosted via `next/font/google`, weights 500/700/800. Chosen because it is an Indian foundry superfamily that renders our EN/HI/KN headlines natively — a brief-specific decision, not a default.
- Headlines: Anek 700–800, tight leading, normal width. The current huge scale stays (it's right); the face changes.
- **Body: keep Geist quietly** (already loaded). Body never carries the brand.
- All numerals (money, dates, counts): `font-variant-numeric: tabular-nums`; money in Anek 700.
- File metadata: 11px uppercase Anek 700. Use it only where the text behaves like a docket label, status or authority name.

## Containers

1. **Panels** (the card replacement): surface `--paper-shade`, radius 8px, border 1px in the panel's own color darkened ~7% (`--paper-line`), no shadow. Depth is tonal, not drawn.
2. **The file tab** (bespoke geometry, the signature): major panels (intent composer, workflow step panel, dashboard notice) get a saffron trapezoid tab rising from the top-left edge. It carries the file label and appears on at most 2–3 panels per screen.
3. **Ledger lists** (the stat-card replacement): no boxes. Rows separated by 1px `--paper-line` rules: label (ink-mute) left · value (Anek 700 tabular) right · action as underlined text link or small solid button. Home's six stat cards collapse into one "Your record" ledger + one "Things to do" ledger.
4. **Tables where data is tabular**: dashboard obligations become a real table on desktop (what · authority · due · amount · action), stacking to ledger rows at 390px.
5. **The stamp**: `SIMULATED` (and `VERIFIED` on documents) as an uppercase Anek 700 letterspaced text in a 1.5px double-bordered rectangle, rotated −2°, `--green-deep` at 70% opacity, stamp-like. Placed once per logical surface (composer corner, workflow header, document card), NOT on every element. This replaces every simulated/verified pill.
6. **Buttons**: rectangles, radius 4px. Primary: solid `--green-deep`, paper text, Anek 600. Secondary: plain underlined ink text link. Kill the icon-arrow-in-every-button habit; keep an arrow only on the single primary CTA of a screen.
7. **Inputs**: the intent textarea sits in a file-tabbed panel on `--paper`, 1px ink border at 20% opacity, no glow focus — focus is a 2px `--green-deep` left edge.

## Screen notes

- **Public entry**: deep indigo owns the hero and future-scope section. The shared file preview, Anek's three scripts, language controls and arch mark provide the Indian context. The rest of the page stays on paper rather than alternating generic marketing bands.
- **Nav**: paper, saffron Citizen mark, indigo `CITIZEN` wordmark and plain "independent prototype" text after it. Links remain ink with a green active state. Mobile navigation stays ledger-like.
- **Hero**: owns the first 390px viewport: greeting (ink-mute) → headline (Anek) → composer panel with tab `[ NEW REQUEST ]` and stamp. Suggestion chips become plain underlined text links in a row, separated by `·`.
- **Home attention surface**: tasks, money and snapshot become compact ledgers; inbox and activity stay collapsed until needed; documents remain a ruled rail.
- **Workflows**: step strip becomes a numbered ink line — numbers in small squares (4px radius), completed = solid `--green-deep`, connective 1px rules; step panels get the file tab with the step label.
- **Deferred death flow**: outside the current pitch and primary navigation; no redesign work is required for it in this version.
- **Footer**: three plain lines + underlined "Service status" link. No band, just a top rule.

## Guardrails

- Chrome strings keep flowing through the en/hi/kn dictionary; new strings added in all three.
- No new npm deps (Anek via `next/font/google` is config, not a dep). Motion stays in lightweight CSS with reduced-motion and data-saver fallbacks.
- Preserve the graph store, selector and mutation contracts, and keep `src/data/seed.json` as the only demo-data source.
- ≤500 lines/file. Mobile 390px first. Contrast: all text ≥ 4.5:1 on its surface.
- After implementing, re-check every kill-list item is actually gone (grep for `rounded-full`, pill classnames, icon-tile patterns) — leftovers in one screen defeat the whole repaint.
