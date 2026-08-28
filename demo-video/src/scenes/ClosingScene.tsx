import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Footage } from "../components/Footage";
import { BrandLockup, colors, SceneWash } from "../components/Editorial";
import { bodyFont, displayFont } from "../fonts";

export function ClosingScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{ backgroundColor: colors.indigo, overflow: "hidden" }}
    >
      <Footage
        clip="01-problem-to-hero.mp4"
        playbackRate={0.62}
        trimBefore={120}
        scaleFrom={1.02}
        scaleTo={1.055}
      />
      <AbsoluteFill
        style={{
          backgroundColor: colors.indigo,
          opacity: interpolate(frame, [0, 90], [0, 0.96], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 100,
          right: 100,
          top: 290,
          display: "grid",
          justifyItems: "center",
          gap: 30,
          color: colors.paper,
          textAlign: "center",
          opacity: interpolate(frame, [72, 94], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: `0px ${interpolate(frame, [72, 94], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
        }}
      >
        <BrandLockup large />
        <div
          style={{
            maxWidth: 1050,
            fontFamily: displayFont,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 0.92,
          }}
        >
          Public services, in one place.
        </div>
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 24,
            color: "rgba(255,253,245,0.72)",
          }}
        >
          Independent prototype · Fictional data · Simulated services
        </div>
      </div>
      <SceneWash tone="indigo" />
    </AbsoluteFill>
  );
}
