import { AbsoluteFill } from "remotion";
import { colors } from "../components/Editorial";
import { RecordGraph } from "../motion/RecordGraph";
import { Ticker } from "../motion/Identity";

export const THESIS_GRAPH_AT = 8;

/** 0:12–0:22 — documents, family, work and assets fly onto Arjun's spiral. */
export function Thesis() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <RecordGraph at={THESIS_GRAPH_AT} scale={1.9} />
      <div style={{ position: "absolute", left: 80, top: 64 }}>
        <Ticker items={["3 profiles", "11 journeys", "EN · HI · KN"]} />
      </div>
    </AbsoluteFill>
  );
}
