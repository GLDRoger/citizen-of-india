import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors } from "./Editorial";
import { scenes } from "../timeline";

/** A six-frame paper flash on every chapter cut, so each hit has something to land on. */
export function CutFlash() {
  const frame = useCurrentFrame();
  const cut = scenes.slice(1).find((scene) => frame >= scene.startFrame && frame < scene.startFrame + 8);
  if (!cut) return null;
  const opacity = interpolate(frame - cut.startFrame, [0, 7], [0.85, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  return <AbsoluteFill style={{ backgroundColor: colors.paper, opacity, pointerEvents: "none" }} />;
}
