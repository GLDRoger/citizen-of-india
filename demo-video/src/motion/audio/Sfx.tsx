import { Audio } from "@remotion/media";
import { Sequence, staticFile, useVideoConfig } from "remotion";
export const soundDurations = {
  "impact-heavy": 0.62,
  pulse: 0.18,
  "pulse-soft": 0.12,
  "impact-sub-big": 0.4,
  "impact-sub-small": 0.28,
  "stamp-thud": 0.16,
  "paper-slide": 0.38,
  "riser-long": 1.2,
  "riser-short": 0.6,
  "ledger-tick": 0.04,
  "ledger-tick-soft": 0.04,
  "edge-draw": 0.4,
  "consent-chime": 0.5,
  "edge-end": 0.3,
  tap: 0.06,
} as const;
export type Sound = keyof typeof soundDurations;
export function Hit({
  at,
  sound,
  gain = 0.8,
}: {
  at: number;
  sound: Sound;
  gain?: number;
}) {
  const { fps } = useVideoConfig();
  return (
    <Sequence
      from={at}
      durationInFrames={Math.ceil(soundDurations[sound] * fps)}
      premountFor={30}
    >
      <Audio src={staticFile(`audio/sfx/${sound}.wav`)} volume={gain} />
    </Sequence>
  );
}
export function Riser({
  endsAt,
  length,
  gain = 0.6,
}: {
  endsAt: number;
  length: "long" | "short";
  gain?: number;
}) {
  const { fps } = useVideoConfig();
  return (
    <Hit
      at={endsAt - Math.round((length === "long" ? 1.2 : 0.6) * fps)}
      sound={`riser-${length}`}
      gain={gain}
    />
  );
}
