import { questionLandingFrames } from "./components/QuestionTrack";
import type { Sound } from "./motion/audio/Sfx";
import { at, scenes } from "./timeline";

/**
 * Every sound cue in the film, in absolute frames. Impact-only vocabulary:
 * sub hits, the stamp thud, ledger ticks, taps and the two-note consent chime.
 * No risers, sweeps or whooshes. Every cut, every card and every stamp lands on bass.
 */
export type Cue = { frame: number; sound: Sound; gain?: number };

const big = (frame: number, gain = 0.95): Cue => ({ frame, sound: "impact-sub-big", gain });
const small = (frame: number, gain = 0.85): Cue => ({ frame, sound: "impact-sub-small", gain });
const heavy = (frame: number, gain = 1): Cue => ({ frame, sound: "impact-heavy", gain });
const stamp = (frame: number): Cue[] => [{ frame, sound: "stamp-thud", gain: 1 }, small(frame, 0.7)];
const tap = (frame: number): Cue => ({ frame, sound: "tap", gain: 0.8 });
const pulse = (frame: number, gain = 0.9): Cue => ({ frame, sound: "pulse", gain });
const soft = (frame: number, gain = 0.8): Cue => ({ frame, sound: "pulse-soft", gain });
/** "pay my challan" in the desktop clip: typing starts at source frame 22, two frames per character, played at 1.75×. */
const typedCharacters = Array.from({ length: 14 }, (_, index) => Math.round((22 + index * 2) / 1.2));

export const cues: Cue[] = [
  // Every chapter cut lands on a heavy hit.
  ...scenes.slice(1).map((scene) => heavy(scene.startFrame)),
  // Problem: three portal sheets, the collapse, the stamp.
  small(at("problem", 26)), small(at("problem", 66)), small(at("problem", 106)),
  heavy(at("problem", 215)),
  ...stamp(at("problem", 268)),
  // Thesis: the centre lands, then one pulse per record settling, then the spiral rules in.
  ...Array.from({ length: 13 }, (_, index) => pulse(at("thesis", 8 + index * 4 + 18))),
  soft(at("thesis", 8 + 12 * 4 + 40)),
  // Home: the phone arrives, then the three findings rule in.
  pulse(at("home", 8)),
  pulse(at("home", 75)), pulse(at("home", 120)), pulse(at("home", 165)),
  // Challan: the tap, the payment, the split, the three panes, the PAID stamp.
  ...typedCharacters.map((frame) => soft(at("challan", frame), 0.9)),
  pulse(at("challan", 53)), pulse(at("challan", 83)), pulse(at("challan", 119)), pulse(at("challan", 150)),
  big(at("challan", 158)),
  heavy(at("challan", 275)),
  pulse(at("challan", 281)), pulse(at("challan", 287)), pulse(at("challan", 293)),
  ...stamp(at("challan", 326)),
  // Marriage: the phones, the invite tap, consent chime + stamp, the spouseOf edge, completion.
  pulse(at("marriage", 6)), pulse(at("marriage", 12)),
  tap(at("marriage", 61)), pulse(at("marriage", 70)),
  pulse(at("marriage", 90)), pulse(at("marriage", 120)),
  tap(at("marriage", 176)),
  { frame: at("marriage", 178), sound: "consent-chime", gain: 0.8 },
  ...stamp(at("marriage", 186)),
  small(at("marriage", 195)), big(at("marriage", 200)),
  pulse(at("marriage", 240)), pulse(at("marriage", 280)), big(at("marriage", 320)),
  // After round one: the gather, the surviving file.
  big(at("after-round-one", 4)),
  heavy(at("after-round-one", 120)),
  pulse(at("after-round-one", 148)), pulse(at("after-round-one", 156)), pulse(at("after-round-one", 164)), big(at("after-round-one", 172)),
  // The five question cards, wherever they land.
  ...questionLandingFrames.flatMap((frame) => [heavy(frame), ...stamp(frame)]),
  // UMANG: the map opens, the drag, the PAN detail, the cut to Home.
  pulse(at("umang", 14)), pulse(at("umang", 75)), pulse(at("umang", 160)),
  big(at("umang", 285)), pulse(at("umang", 293)),
  // Delegation: phones, the grant tap, the edge, acting, revoke, edge ends.
  pulse(at("delegation", 6)), pulse(at("delegation", 12)),
  tap(at("delegation", 81)), pulse(at("delegation", 90)),
  tap(at("delegation", 136)), pulse(at("delegation", 142)),
  big(at("delegation", 150)), tap(at("delegation", 220)), pulse(at("delegation", 226)),
  tap(at("delegation", 291)), pulse(at("delegation", 297)), heavy(at("delegation", 315)),
  // Wrong: the send, the "not yet".
  tap(at("wrong", 55)), big(at("wrong", 70)), tap(at("wrong", 182)), big(at("wrong", 192)),
  // Timeline: rows.
  pulse(at("timeline", 12)), pulse(at("timeline", 40)), pulse(at("timeline", 70)), pulse(at("timeline", 100)),
  // Close: the language switches, the end card and its stamp.
  pulse(at("close", 40)), pulse(at("close", 85)), pulse(at("close", 130)),
  heavy(at("close", 200)), pulse(at("close", 207)),
  ...stamp(at("close", 241)),
];

export const impactFrames = cues.filter((cue) => cue.sound.startsWith("impact") || cue.sound === "stamp-thud").map((cue) => cue.frame);
