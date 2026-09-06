import { interpolate, spring } from "remotion";
export const palette = {
  paper: "#FFFDF5",
  shade: "#F5EFE2",
  line: "#DED4C3",
  ink: "#261D16",
  mute: "#685D50",
  green: "#285944",
  brick: "#A9422C",
  indigoDeep: "#21347F",
  indigo: "#3150B5",
  saffron: "#ED8B3A",
};
export const ramp = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
export const settle = (frame: number, fps: number, duration = 22) =>
  spring({ frame, fps, durationInFrames: duration, config: { damping: 200 } });
