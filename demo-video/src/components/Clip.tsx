import { Video } from "@remotion/media";
import { Easing, interpolate, staticFile, useCurrentFrame } from "remotion";

type ClipProps = {
  clip: string;
  /** Source frame to start from. */
  trimBefore?: number;
  playbackRate?: number;
  /** Continue showing the last frame when the source ends. */
  style?: React.CSSProperties;
};

/** A muted, premounted app recording that fills its parent. */
export function Clip({ clip, trimBefore = 0, playbackRate = 1, style }: ClipProps) {
  const frame = useCurrentFrame();
  // Footage never pops in: an 8-frame settle, then a slow push-in so the shot is never static.
  const enter = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const push = interpolate(frame, [0, 420], [1, 1.035], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  return (
    <Video
      muted
      name={clip}
      onError={() => "fallback"}
      playbackRate={playbackRate}
      premountFor={30}
      src={staticFile(`clips/${clip}`)}
      trimBefore={trimBefore}
      objectFit="cover"
      style={{ width: "100%", height: "100%", display: "block", opacity: enter, scale: String(1.015 - 0.015 * enter + (push - 1)), ...style }}
    />
  );
}

/**
 * A 390×844 phone recording shown at a given height, centred, with a plain
 * dark bezel. Replaced by the motion kit's PhoneFrame where one is available.
 */
export function PhoneClip({
  height = 900,
  x = 0,
  y = 0,
  ...clip
}: ClipProps & { height?: number; x?: number; y?: number }) {
  const width = Math.round((height * 390) / 844);
  return (
    <div
      style={{
        position: "absolute",
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        translate: "-50% -50%",
        width: width + 24,
        height: height + 24,
        padding: 12,
        borderRadius: 34,
        backgroundColor: "#261d16",
      }}
    >
      <div style={{ width, height, borderRadius: 24, overflow: "hidden", backgroundColor: "#fffdf5" }}>
        <Clip {...clip} />
      </div>
    </div>
  );
}
