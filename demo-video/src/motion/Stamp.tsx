import { useCurrentFrame, interpolate } from "remotion";
import { displayFont } from "../fonts";
import { palette as c, ramp } from "./core";
export const stampLandingFrame = (at = 0) => at + 6;
export type StampProps = {
  text: string;
  at?: number;
  liftAt?: number;
  variant?: "green" | "brick";
  fontSize?: number;
};
export function Stamp({
  text,
  at = 0,
  liftAt,
  variant = "green",
  fontSize = 42,
}: StampProps) {
  const f = useCurrentFrame() - at;
  const lift = liftAt === undefined ? 0 : ramp(f + at, liftAt, liftAt + 10);
  const scale = interpolate(f, [0, 5, 6, 7, 10], [1.6, 1.08, 0.97, 1.02, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        display: "inline-block",
        opacity: f < 0 ? 0 : (f === 7 ? 0.55 : 0.7) * (1 - lift),
        transform: `translateY(${-lift * 70}px) rotate(-2deg) scale(${scale + lift * 0.15})`,
        color: variant === "brick" ? c.brick : c.green,
        border: "1.5px solid currentColor",
        padding: 4,
        fontFamily: displayFont,
        fontWeight: 700,
        fontSize,
        letterSpacing: 3,
        textTransform: "uppercase",
      }}
    >
      <div style={{ border: "1.5px solid currentColor", padding: "8px 22px" }}>
        {text}
      </div>
    </div>
  );
}
