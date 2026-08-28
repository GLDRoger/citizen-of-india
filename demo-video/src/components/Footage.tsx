import { Video } from "@remotion/media";
import {
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type FootageProps = {
  clip: string;
  playbackRate?: number;
  scaleFrom?: number;
  scaleTo?: number;
  trimBefore?: number;
  xFrom?: number;
  xTo?: number;
  yFrom?: number;
  yTo?: number;
};

export function Footage({
  clip,
  playbackRate = 1,
  scaleFrom = 1,
  scaleTo = 1.035,
  trimBefore = 0,
  xFrom = 0,
  xTo = 0,
  yFrom = 0,
  yTo = 0,
}: FootageProps) {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <Video
      muted
      name={clip}
      onError={() => "fallback"}
      playbackRate={playbackRate}
      premountFor={fps}
      src={staticFile(`clips/${clip}`)}
      trimBefore={trimBefore}
      objectFit="cover"
      style={{
        height: "100%",
        width: "100%",
        scale: interpolate(
          frame,
          [0, durationInFrames - 1],
          [scaleFrom, scaleTo],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          },
        ),
        translate: `${interpolate(frame, [0, durationInFrames - 1], [xFrom, xTo], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px ${interpolate(frame, [0, durationInFrames - 1], [yFrom, yTo], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
      }}
    />
  );
}
