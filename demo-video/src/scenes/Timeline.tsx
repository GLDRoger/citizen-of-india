import { AbsoluteFill } from "remotion";
import { Clip } from "../components/Clip";
import { colors } from "../components/Editorial";
import { Ticker } from "../motion/Identity";

/** 1:44–1:50 — the Timeline: the whole film as one ledger. */
export function Timeline() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <Clip clip="22-continuity-timeline.mp4" playbackRate={1.15} />
      <div style={{ position: "absolute", left: 80, bottom: 120, padding: "10px 16px", background: colors.paper }}>
        <Ticker items={["Every change names who made it", "One log"]} />
      </div>
    </AbsoluteFill>
  );
}
