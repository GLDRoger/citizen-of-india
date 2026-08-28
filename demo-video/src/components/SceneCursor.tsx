import { MacOSCursor } from "@remotion/mac-cursors";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { colors } from "./Editorial";

type CursorPoint = { frame: number; x: number; y: number };

export function SceneCursor({
  clicks,
  points,
}: {
  clicks: number[];
  points: CursorPoint[];
}) {
  const frame = useCurrentFrame();
  const frameRange = points.map((point) => point.frame);
  const xRange = points.map((point) => point.x);
  const yRange = points.map((point) => point.y);
  const visible =
    frame >= frameRange[0] && frame <= frameRange[frameRange.length - 1];
  const left = interpolate(frame, frameRange, xRange, {
    easing: Easing.bezier(0.45, 0, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const top = interpolate(frame, frameRange, yRange, {
    easing: Easing.bezier(0.45, 0, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {clicks.map((clickFrame) => (
        <div
          key={clickFrame}
          style={{
            position: "absolute",
            left,
            top,
            width: 54,
            height: 54,
            border: `4px solid ${colors.saffron}`,
            borderRadius: "50%",
            opacity: interpolate(
              frame,
              [clickFrame - 1, clickFrame + 10],
              [0.8, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
            scale: interpolate(
              frame,
              [clickFrame - 1, clickFrame + 10],
              [0.25, 1.4],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              },
            ),
            translate: "-27px -27px",
          }}
        />
      ))}
      <MacOSCursor
        cursor="pointer"
        style={{ left, top, opacity: visible ? 1 : 0, scale: 1.35 }}
      />
    </>
  );
}
