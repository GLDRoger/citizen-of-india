import { AbsoluteFill } from "remotion";
import { colors } from "../components/Editorial";
import { Ticker } from "../motion/Identity";
import { TileGrid } from "../motion/TileGrid";

/** 0:54–1:03 — the rest of the top 250 grey into piles; four fair questions fan out. */
export function AfterRoundOne() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", left: 80, top: 64 }}>
        <Ticker items={["After round one", "249 other projects"]} />
      </div>
      <TileGrid at={0} gatherAt={120} fanAt={9999} questions={[
        "Isn't this just UMANG again?",
        "What about a shared phone?",
        "What if a department gets it wrong?",
        "Isn't this too big to build?",
      ]} />
    </AbsoluteFill>
  );
}
