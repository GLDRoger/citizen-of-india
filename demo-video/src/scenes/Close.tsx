import { AbsoluteFill, Sequence } from "remotion";
import { colors } from "../components/Editorial";
import { EndCard, LanguageMorph } from "../motion/Identity";

/** 1:48–2:00 — the last question, three scripts, the end card. */
export const CLOSE_MORPH_AT = 40;
export const CLOSE_END_CARD_AT = 200;

export function Close() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}>
      <Sequence from={CLOSE_MORPH_AT} durationInFrames={CLOSE_END_CARD_AT - CLOSE_MORPH_AT} name="three scripts">
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <LanguageMorph at={0} hold={30} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={CLOSE_END_CARD_AT} name="end card">
        <AbsoluteFill style={{ backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}>
          <EndCard at={0} liftAt={9999} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}
