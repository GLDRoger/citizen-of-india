import { AbsoluteFill, Sequence } from "remotion";
import { Clip } from "../components/Clip";
import { colors } from "../components/Editorial";
import { HighlightEdge } from "../motion/GraphNative";
import { PhonePair } from "../motion/PhoneFrame";

/** 1:18–1:31 — Arjun asks, Sunita grants, Arjun acts, Sunita revokes; the edge ends but stays. */
export const DELEGATION_GRANT_AT = 100;
export const DELEGATION_EDGE_AT = 142;
export const DELEGATION_ACT_AT = 150;
export const DELEGATION_REVOKE_AT = 262;
export const DELEGATION_EDGE_ENDS_AT = 315;

function Connector() {
  return (
    <svg width={300} height={860} viewBox="0 0 300 860" style={{ position: "absolute", inset: 0 }}>
      <HighlightEdge from={{ x: 300, y: 430 }} to={{ x: 0, y: 430 }} at={DELEGATION_EDGE_AT} endAt={DELEGATION_EDGE_ENDS_AT} label="delegateOf" color={colors.green} />
    </svg>
  );
}

export function Delegation() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}>
      <PhonePair
        gap={300}
        scale={0.98}
        connector={<Connector />}
        left={
          <>
            <Sequence durationInFrames={DELEGATION_ACT_AT} name="arjun asks">
              <Clip clip="11-delegation-arjun-request.mp4" playbackRate={1.6} />
            </Sequence>
            <Sequence from={DELEGATION_ACT_AT} name="arjun acts">
              <Clip clip="13-delegation-arjun-acts.mp4" playbackRate={1.7} />
            </Sequence>
          </>
        }
        right={
          <>
            <Sequence durationInFrames={DELEGATION_GRANT_AT} name="sunita waits">
              <Clip clip="12-delegation-sunita-grant.mp4" trimBefore={60} playbackRate={0.01} />
            </Sequence>
            <Sequence from={DELEGATION_GRANT_AT} durationInFrames={DELEGATION_REVOKE_AT - DELEGATION_GRANT_AT} name="sunita grants">
              <Clip clip="12-delegation-sunita-grant.mp4" trimBefore={60} playbackRate={1.3} />
            </Sequence>
            <Sequence from={DELEGATION_REVOKE_AT} name="sunita revokes">
              <Clip clip="14-delegation-sunita-revoke.mp4" trimBefore={50} playbackRate={1.4} />
            </Sequence>
          </>
        }
      />
    </AbsoluteFill>
  );
}
