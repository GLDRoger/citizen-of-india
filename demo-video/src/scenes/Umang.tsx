import { AbsoluteFill, Sequence } from "remotion";
import { Clip } from "../components/Clip";
import { colors } from "../components/Editorial";
import { PhoneFrame } from "../motion/PhoneFrame";

/** 1:03–1:18 — the question, the record map, then Home speaking first. */
export const UMANG_FOOTAGE_AT = 0;
export const UMANG_NUDGES_AT = 285;

export function Umang() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <Sequence from={UMANG_FOOTAGE_AT} durationInFrames={UMANG_NUDGES_AT - UMANG_FOOTAGE_AT} name="record map">
        <Clip clip="10-record-map.mp4" />
      </Sequence>
      <Sequence from={UMANG_NUDGES_AT} name="home nudges">
        <AbsoluteFill style={{ backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}>
          <PhoneFrame at={0} scale={1.05}>
            <Clip clip="01-home-nudges.mp4" trimBefore={110} />
          </PhoneFrame>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}
