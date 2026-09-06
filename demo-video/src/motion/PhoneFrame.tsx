import type { ReactNode } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { palette as c, ramp, settle } from "./core";
export function PhoneFrame({
  children,
  scale = 1,
  at = 0,
}: {
  children: ReactNode;
  scale?: number;
  at?: number;
}) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = settle(f - at, fps);
  return (
    <div
      style={{
        width: 406 * scale,
        height: 860 * scale,
        position: "relative",
        opacity: p,
        transform: `translateY(${(1 - p) * 60}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 390,
          height: 844,
          border: `8px solid ${c.ink}`,
          borderRadius: 4,
          overflow: "hidden",
          background: c.paper,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
export function PhonePair({
  left,
  right,
  connector,
  scale = 0.92,
  gap = 340,
}: {
  left: ReactNode;
  right: ReactNode;
  connector?: ReactNode;
  scale?: number;
  gap?: number;
}) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", position: "relative" }}
    >
      <PhoneFrame scale={scale}>{left}</PhoneFrame>
      <div style={{ width: gap, position: "relative", alignSelf: "stretch" }}>
        {connector}
      </div>
      <PhoneFrame scale={scale}>{right}</PhoneFrame>
    </div>
  );
}
export function TouchRipple({
  x,
  y,
  at = 0,
}: {
  x: number;
  y: number;
  at?: number;
}) {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 14);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 22,
        top: y - 22,
        width: 44,
        height: 44,
        border: `2px solid ${c.saffron}`,
        borderRadius: "50%",
        opacity: f < at ? 0 : 1 - p,
        transform: `scale(${0.5 + p * 1.4})`,
        pointerEvents: "none",
      }}
    />
  );
}
