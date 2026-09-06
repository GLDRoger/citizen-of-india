import { AbsoluteFill, Sequence } from "remotion";
import { Clip } from "../components/Clip";
import { colors } from "../components/Editorial";

/** 1:31–1:42 — PAN correction sent; "No, not yet" keeps it open without losing history. */
export const WRONG_FOOTAGE_AT = 0;

export function Wrong() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <Sequence from={WRONG_FOOTAGE_AT} name="correction">
        <Clip clip="15-correction-unresolved.mp4" trimBefore={30} />
      </Sequence>
    </AbsoluteFill>
  );
}
