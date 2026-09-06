import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont } from "../fonts";
import { palette as c, ramp } from "./core";
import { QuestionCard } from "./QuestionCard";
export type TileGridProps = {
  at?: number;
  gatherAt?: number;
  fanAt?: number;
  questions?: string[];
};
export function TileGrid({
  at = 0,
  gatherAt = 45,
  fanAt = 115,
  questions = [
    "What about UMANG?",
    "Who gives consent?",
    "What if it is wrong?",
    "What stays on record?",
  ],
}: TileGridProps) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ width: 1700, height: 820, position: "relative" }}>
      {Array.from({ length: 249 }, (_, i) => {
        const lit = i === 248;
        const group = i % 3;
        const p = Math.min(
          1.04,
          spring({
            frame: f - gatherAt - (i % 13),
            fps,
            durationInFrames: 30,
            config: { damping: 14, mass: 0.8 },
          }),
        );
        const x = (i % 25) * 56 + 150,
          y = Math.floor(i / 25) * 42 + 70;
        const slot = Math.floor(i / 3);
        // Three piles centred in the 1700px canvas: 9 columns × 44px each, 500px apart.
        const tx = lit ? 831 : 152 + group * 500 + (slot % 9) * 44,
          ty = lit ? 150 : 400 + Math.floor(slot / 9) * 34;
        const fan = ramp(f, fanAt, fanAt + 18);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 38,
              height: 28,
              border: `1px solid ${c.line}`,
              borderRadius: 3,
              background: lit ? c.indigo : c.shade,
              opacity: ramp(f, at, at + 10) * (lit ? 1 : 1 - fan * 0.72),
              transform: `translate(${x + (tx - x) * p}px,${y + (ty - y) * p}px) scale(${lit ? 1 + p * 2 : 1})`,
            }}
          >
            {lit && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: -4,
                  width: 15,
                  height: 5,
                  background: c.saffron,
                  clipPath: "polygon(0 0,80% 0,100% 100%,0 100%)",
                }}
              />
            )}
          </div>
        );
      })}
      {["assistants", "portals", "wallets"].map((s, i) => (
        <div
          key={s}
          style={{
            position: "absolute",
            top: 720,
            left: 152 + i * 500,
            width: 396,
            textAlign: "center",
            fontFamily: displayFont,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: c.mute,
            opacity:
              ramp(f, gatherAt + 20, gatherAt + 35) *
              (1 - ramp(f, fanAt, fanAt + 15)),
          }}
        >
          {s}
        </div>
      ))}
      {questions.slice(0, 4).map((q, i) => {
        const p = ramp(f, fanAt + i * 4, fanAt + 22 + i * 4);
        return (
          <div
            key={q}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              opacity: p,
              transform: `translate(${830 + ((i % 2) * 790 + 35 - 830) * p}px,${180 + (Math.floor(i / 2) * 270 + 200 - 180) * p}px) rotate(${(i % 2 === 0 ? -2 : 2) * p}deg) scale(${0.9 + 0.1 * p})`,
              transformOrigin: "top left",
            }}
          >
            <QuestionCard
              question={q}
              at={fanAt + i * 4}
              hold={9999}
              width={740}
              fontSize={52}
            />
          </div>
        );
      })}
    </div>
  );
}
