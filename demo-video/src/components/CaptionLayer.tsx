import { z } from "zod";
import rawCaptions from "../../public/captions.json";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont } from "../fonts";
import { colors } from "./Editorial";

const captionSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
  timestampMs: z.number().nullable(),
  confidence: z.number().nullable(),
  pageBreakAfter: z.boolean().optional(),
});

const captions = z.array(captionSchema).parse(rawCaptions);

export function CaptionLayer() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < 96 || frame >= 3510) return null;
  const timeMs = (frame / fps) * 1000;
  const caption = captions.find(
    (candidate) => candidate.startMs <= timeMs && candidate.endMs > timeMs,
  );
  if (!caption) return null;
  const startFrame = (caption.startMs / 1000) * fps;
  const endFrame = (caption.endMs / 1000) * fps;

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom: 74,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        opacity: interpolate(
          frame,
          [startFrame, startFrame + 6, endFrame - 6, endFrame],
          [0, 1, 1, 0],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
        translate: `0px ${interpolate(frame, [startFrame, startFrame + 8], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
      }}
    >
      <div
        style={{
          maxWidth: 1600,
          padding: "18px 28px 20px 30px",
          backgroundColor: "rgba(255,253,245,0.97)",
          borderLeft: `9px solid ${colors.saffron}`,
          boxShadow: "0 12px 42px rgba(24,31,67,0.20)",
          color: colors.ink,
          fontFamily: displayFont,
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 1.04,
          textAlign: "center",
          textWrap: "balance",
        }}
      >
        {caption.text}
      </div>
    </div>
  );
}
