import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Footage } from "../components/Footage";
import { colors, PhaseTag, SceneWash } from "../components/Editorial";
import { displayFont } from "../fonts";

export function ProblemScene() {
  const frame = useCurrentFrame();
  const firstQuestionOpacity = interpolate(
    frame,
    [8, 18, 72, 88],
    [0, 1, 1, 0],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const secondQuestionOpacity = interpolate(
    frame,
    [82, 98, 142, 160],
    [0, 1, 1, 0],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const questionStyle = {
    position: "absolute" as const,
    left: 100,
    right: 100,
    top: 210,
    color: colors.paper,
    fontFamily: displayFont,
    fontSize: 92,
    fontWeight: 700,
    letterSpacing: "-0.035em",
    lineHeight: 0.94,
  };

  const rise = interpolate(frame, [8, 22], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: colors.indigo, overflow: "hidden" }}
    >
      <Footage
        clip="01-problem-to-hero.mp4"
        playbackRate={0.9}
        scaleFrom={1.015}
        scaleTo={1.055}
      />
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(33,52,127,${interpolate(frame, [0, 60, 150, 210], [0.96, 0.96, 0.12, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
        }}
      />
      <div
        style={{
          ...questionStyle,
          opacity: firstQuestionOpacity,
          translate: `0px ${rise}px`,
        }}
      >
        What if public-service websites just worked?
      </div>
      <div
        style={{
          ...questionStyle,
          color: "#ffd4a8",
          opacity: secondQuestionOpacity,
          translate: `0px ${interpolate(frame, [82, 100], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
        }}
      >
        What if you could get the job done on your first attempt?
      </div>
      <PhaseTag index="01" label="Citizen journey" />
      <SceneWash tone="indigo" />
    </AbsoluteFill>
  );
}
