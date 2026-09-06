import { Img, staticFile, useCurrentFrame } from "remotion";
import { displayFont, devanagariFont, kannadaFont } from "../fonts";
import { palette as c, ramp } from "./core";
import { Stamp } from "./Stamp";
export function Ticker({ items }: { items: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        fontFamily: displayFont,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: 2,
        color: c.mute,
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: 32,
          height: 22,
          background: c.saffron,
          clipPath: "polygon(0 0,75% 0,100% 100%,0 100%)",
        }}
      />
      {items.map((s, i) => (
        <span key={i}>
          {i > 0 && <span style={{ marginRight: 20 }}>·</span>}
          {s}
        </span>
      ))}
    </div>
  );
}
export function LanguageMorph({
  at = 0,
  hold = 45,
  fontSize = 118,
}: {
  at?: number;
  hold?: number;
  fontSize?: number;
}) {
  const f = useCurrentFrame() - at;
  const entries = [
    ["EN", "What do you need?", displayFont],
    ["HI", "आपको क्या चाहिए?", devanagariFont],
    ["KN", "ನಿಮಗೆ ಏನು ಬೇಕು?", kannadaFont],
  ];
  return (
    <div style={{ position: "relative", width: 1600, height: 300 }}>
      {entries.map(([tag, text, font], i) => {
        const start = i * (hold + 15);
        const p = i === 0 ? 1 : ramp(f, start, start + 15);
        const out = i === 2 ? 0 : ramp(f, start + hold + 15, start + hold + 30);
        return (
          <div
            key={tag}
            style={{
              position: "absolute",
              inset: 0,
              opacity: f < 0 ? 0 : p * (1 - out),
              transform: `translateY(${(1 - p) * 14 - out * 14}px)`,
            }}
          >
            <div
              style={{
                fontFamily: displayFont,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
                color: c.mute,
                marginBottom: 35,
              }}
            >
              {tag}
            </div>
            <div
              lang={tag.toLowerCase()}
              style={{
                fontFamily: `${font}, ${displayFont}`,
                fontSize,
                fontWeight: 800,
                lineHeight: 1.4,
                color: c.ink,
              }}
            >
              {text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export function EndCard({
  at = 0,
  liftAt = 95,
  url = "citizen-of-india.vercel.app",
  tagline = "One record, carried forward",
}: {
  at?: number;
  liftAt?: number;
  url?: string;
  tagline?: string;
}) {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        textAlign: "center",
        opacity: ramp(f, at, at + 15),
        color: c.indigoDeep,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
        }}
      >
        <Img
          src={staticFile("brand/citizen-logo.png")}
          style={{ width: 130, height: 130, objectFit: "contain" }}
        />
        <span
          style={{
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: 148,
            letterSpacing: 4,
          }}
        >
          CITIZEN
        </span>
      </div>
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 55,
          marginTop: 30,
          color: c.ink,
        }}
      >
        {tagline}
      </div>
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 32,
          marginTop: 25,
          color: c.mute,
        }}
      >
        {url}
      </div>
      <div style={{ marginTop: 70 }}>
        <Stamp text="Independent prototype · fictional data" at={at + 35} liftAt={liftAt} fontSize={24} />
      </div>
    </div>
  );
}
