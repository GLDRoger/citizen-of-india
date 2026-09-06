import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { palette as c, settle, ramp } from "./core";
import { Stamp, stampLandingFrame } from "./Stamp";
export type TransitionProps = {
  from: ReactNode;
  to: ReactNode;
  startFrame: number;
};
export function SheetWipe({ from, to, startFrame }: TransitionProps) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = settle(f - startFrame, fps, 24);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {from}
      <AbsoluteFill
        style={{
          background: c.paper,
          transform: `translateX(${(1 - p) * 2020}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -70,
            top: 120,
            width: 72,
            height: 180,
            background: c.saffron,
            clipPath: "polygon(30% 0,100% 0,100% 100%,0 85%,0 15%)",
          }}
        />
        {to}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
export function StampCut({ from, to, startFrame }: TransitionProps) {
  const f = useCurrentFrame();
  const land = stampLandingFrame(startFrame);
  const lift = ramp(f, startFrame + 12, startFrame + 23);
  return (
    <AbsoluteFill>
      {f < land ? from : to}
      {f >= startFrame && lift < 1 && (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            background: c.shade,
            opacity: 1 - lift,
            transform: `scale(${1 + lift * 0.05})`,
          }}
        >
          <Stamp text="ON RECORD" at={startFrame} fontSize={120} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}
