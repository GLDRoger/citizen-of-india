import { AbsoluteFill, Sequence } from "remotion";
import { Clip } from "../components/Clip";
import { colors } from "../components/Editorial";
import { HighlightEdge } from "../motion/GraphNative";
import { PhonePair } from "../motion/PhoneFrame";
import { Stamp } from "../motion/Stamp";

/** 0:44–0:54 — two phones: Arjun invites, Priya consents, both records update. */
export const MARRIAGE_CONSENT_AT = 90;
export const MARRIAGE_COMPLETE_AT = 200;
export const MARRIAGE_EDGE_AT = 195;
export const MARRIAGE_STAMP_AT = 180;

function Connector() {
  return (
    <svg width={300} height={860} viewBox="0 0 300 860" style={{ position: "absolute", inset: 0 }}>
      <HighlightEdge from={{ x: 0, y: 430 }} to={{ x: 300, y: 430 }} at={MARRIAGE_EDGE_AT} label="spouseOf" />
    </svg>
  );
}

export function Marriage() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}>
      <PhonePair
        gap={300}
        scale={0.98}
        connector={<Connector />}
        left={
          <>
            <Sequence durationInFrames={MARRIAGE_COMPLETE_AT} name="arjun invites">
              <Clip clip="06-marriage-arjun-invite.mp4" />
            </Sequence>
            <Sequence from={MARRIAGE_COMPLETE_AT} name="arjun completes">
              <Clip clip="08-marriage-arjun-complete.mp4" playbackRate={2.2} />
            </Sequence>
          </>
        }
        right={
          <>
            <Sequence durationInFrames={MARRIAGE_CONSENT_AT} name="priya waits">
              <Clip clip="07-marriage-priya-consent.mp4" playbackRate={0.01} />
            </Sequence>
            <Sequence from={MARRIAGE_CONSENT_AT} name="priya consents">
              <Clip clip="07-marriage-priya-consent.mp4" playbackRate={2.2} />
            </Sequence>
          </>
        }
      />
      <div style={{ position: "absolute", left: "50%", top: 150, translate: "-50% 0" }}>
        <Stamp text="Consented" at={MARRIAGE_STAMP_AT} fontSize={40} />
      </div>
    </AbsoluteFill>
  );
}
