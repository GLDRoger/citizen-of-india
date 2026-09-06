import type { ReactNode } from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio, Video } from "@remotion/media";
import { displayFont } from "../fonts";
import { palette as c, ramp } from "./core";
import {
  Sheet,
  SheetStack,
  Stamp,
  LedgerRows,
  PhoneFrame,
  PhonePair,
  TouchRipple,
  QuestionCard,
  GraphNative,
  HighlightEdge,
  TileGrid,
  LanguageMorph,
  Ticker,
  EndCard,
  SheetWipe,
  StampCut,
  Hit,
  Riser,
  sidechainDip,
  ledgerRowFrames,
  stampLandingFrame,
} from "./index";
const Clip = ({ name }: { name: string }) => (
  <Video
    muted
    src={staticFile(`clips/${name}.mp4`)}
    objectFit="cover"
    style={{ width: "100%", height: "100%" }}
  />
);
const Center = ({ children }: { children: ReactNode }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    {children}
  </AbsoluteFill>
);
const Heading = ({ children }: { children: ReactNode }) => (
  <h1
    style={{
      fontFamily: displayFont,
      fontSize: 100,
      fontWeight: 800,
      lineHeight: 1.04,
      margin: "0 0 40px",
      color: c.ink,
    }}
  >
    {children}
  </h1>
);
function Slate({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AbsoluteFill style={{ background: c.paper }}>
      <div style={{ position: "absolute", top: 44, left: 65 }}>
        <Ticker items={["Citizen motion study", title, "30 FPS"]} />
      </div>
      <Center>{children}</Center>
    </AbsoluteFill>
  );
}
function LedgerDemo() {
  return (
    <div style={{ display: "flex", gap: 150, alignItems: "center" }}>
      <PhoneFrame scale={0.88}>
        <Clip name="01-home-nudges" />
        <TouchRipple x={190} y={320} at={42} />
      </PhoneFrame>
      <div style={{ width: 760 }}>
        <Heading>The record rules in.</Heading>
        <LedgerRows
          at={15}
          stagger={12}
          rows={[
            { label: "Challan due", from: 0, to: 500, prefix: "₹" },
            { label: "Identity", value: "Needs a correction" },
            { label: "Family", value: "Permission first" },
          ]}
        />
        <Stamp text="Simulated" at={75} />
      </div>
      <Hit at={42} sound="tap" />
      <Hit at={stampLandingFrame(75)} sound="stamp-thud" />
      {ledgerRowFrames(3, 15, 12).map((f) => (
        <Hit key={f} at={f} sound="ledger-tick" />
      ))}
    </div>
  );
}
function SplitDemo() {
  const f = useCurrentFrame();
  const p = ramp(f, 15, 40);
  return (
    <div
      style={{ display: "flex", gap: 65, transform: `scale(${1 - 0.05 * p})` }}
    >
      {["Money", "Documents", "Activity"].map((label, i) => (
        <div
          key={label}
          style={{
            transform: `translateX(${(1 - p) * (1 - i) * 430}px)`,
            opacity: i === 1 ? 1 : p,
          }}
        >
          <div
            style={{
              fontFamily: displayFont,
              fontSize: 32,
              color: c.mute,
              marginBottom: 18,
            }}
          >
            {label}
          </div>
          <PhoneFrame scale={0.77}>
            <div style={{ padding: 25 }}>
              <h2
                style={{
                  fontFamily: displayFont,
                  fontSize: 56,
                  lineHeight: 1.05,
                  margin: "12px 0 35px",
                  color: c.ink,
                }}
              >
                {label}
              </h2>
              <LedgerRows
                at={40}
                rows={
                  i === 0
                    ? [
                        {
                          label: "Challan",
                          from: 0,
                          to: -500,
                          prefix: "₹",
                          countFrames: 30,
                        },
                      ]
                    : [
                        {
                          label: i === 1 ? "Receipt" : "Challan paid",
                          value: i === 1 ? "On record" : "Today",
                        },
                      ]
                }
              />
              <div style={{ marginTop: 45 }}>
                <Stamp
                  text={i === 1 ? "PAID · SIMULATED" : "ON RECORD"}
                  at={76}
                  fontSize={20}
                />
              </div>
            </div>
          </PhoneFrame>
        </div>
      ))}
      <Hit at={40} sound="impact-sub-big" />
      <Hit at={82} sound="stamp-thud" />
      {[42, 47, 52, 57, 62, 67].map((f) => (
        <Hit key={f} at={f} sound="ledger-tick-soft" />
      ))}
    </div>
  );
}
function PairDemo({ ended = false }: { ended?: boolean }) {
  return (
    <>
      <PhonePair
        left={
          <Clip
            name={
              ended ? "11-delegation-arjun-request" : "06-marriage-arjun-invite"
            }
          />
        }
        right={
          <Clip
            name={
              ended
                ? "14-delegation-sunita-revoke"
                : "07-marriage-priya-consent"
            }
          />
        }
        connector={
          <svg
            width="340"
            height="800"
            style={{ position: "absolute", inset: 0 }}
          >
            <HighlightEdge
              from={{ x: 0, y: 390 }}
              to={{ x: 340, y: 390 }}
              at={20}
              endAt={ended ? 80 : undefined}
              label={ended ? "sharedAccess" : "spouseOf"}
            />
          </svg>
        }
      />
      {!ended && (
        <div style={{ position: "absolute", top: 740 }}>
          <Stamp text="CONSENTED" at={65} fontSize={30} />
        </div>
      )}
      {ended && (
        <div style={{ position: "absolute", top: 690 }}>
          <QuestionCard
            question="And when permission ends?"
            at={65}
            hold={60}
            width={1120}
            fontSize={58}
          />
        </div>
      )}
      <Hit at={20} sound="edge-draw" />
      <Hit at={ended ? 80 : 71} sound={ended ? "edge-end" : "consent-chime"} />
      {!ended && <Hit at={71} sound="stamp-thud" />}
    </>
  );
}
const graphNodes = Array.from({ length: 14 }, (_, i) => ({
  id: String(i),
  label: [
    "Aadhaar",
    "PAN",
    "Passport",
    "Voter ID",
    "Priya",
    "Sunita",
    "Family",
    "Employment",
    "Business",
    "Registration",
    "Home",
    "Vehicle",
    "Property",
    "Address",
  ][i],
  group: (i < 4
    ? "identity"
    : i < 7
      ? "family"
      : i < 10
        ? "work"
        : "assets") as "identity" | "family" | "work" | "assets",
}));
export const showcaseChapters = [
  ["Sheets → one file", 150],
  ["Native spiral", 150],
  ["Phone / ledger / touch", 150],
  ["One write / three panes", 150],
  ["Consent / edge / stamp", 150],
  ["249 → three piles → four questions", 210],
  ["Question enter / hold / exit", 150],
  ["Revocation keeps the edge", 150],
  ["Three scripts / one headline", 210],
  ["Sheet wipe", 120],
  ["Stamp cut", 120],
  ["End card / stamp lift", 150],
] as const;
const starts = showcaseChapters.map((_, i) =>
  showcaseChapters.slice(0, i).reduce((s, c) => s + c[1], 0),
);
export const SHOWCASE_FRAMES = showcaseChapters.reduce((s, c) => s + c[1], 0);
const impacts = [75, 156, 381, 490, 532, 671, 795, 1175, 1518, 1626, 1751];
export function MotionShowcase() {
  return (
    <AbsoluteFill style={{ background: c.paper }}>
      {showcaseChapters.map(([title, duration], i) => (
        <Sequence
          key={title}
          from={starts[i]}
          durationInFrames={duration}
          name={title}
          premountFor={30}
        >
          <Slate title={title}>
            {i === 0 ? (
              <>
                <SheetStack />
                <Riser endsAt={75} length="long" />
                <Hit at={75} sound="impact-sub-big" />
                {[0, 8, 16].map((f) => (
                  <Hit key={f} at={f} sound="paper-slide" />
                ))}
              </>
            ) : i === 1 ? (
              <>
                <GraphNative
                  nodes={graphNodes}
                  name="ARJUN"
                  highlight={{
                    from: "4",
                    to: "center",
                    at: 70,
                    endAt: 115,
                    label: "spouseOf",
                  }}
                />
                <Hit at={6} sound="impact-sub-small" />
                <Hit at={70} sound="edge-draw" />
                <Hit at={115} sound="edge-end" />
              </>
            ) : i === 2 ? (
              <LedgerDemo />
            ) : i === 3 ? (
              <SplitDemo />
            ) : i === 4 ? (
              <PairDemo />
            ) : i === 5 ? (
              <>
                <TileGrid />
                <Riser endsAt={45} length="short" />
                <Hit at={45} sound="impact-sub-big" />
                {[115, 119, 123, 127].map((f) => (
                  <Hit key={f} at={f} sound="paper-slide" />
                ))}
              </>
            ) : i === 6 ? (
              <>
                <QuestionCard
                  question="A new portal—or a record that remembers?"
                  at={10}
                  hold={65}
                />
                <Hit at={10} sound="paper-slide" />
                <Hit at={97} sound="paper-slide" />
              </>
            ) : i === 7 ? (
              <PairDemo ended />
            ) : i === 8 ? (
              <LanguageMorph hold={45} />
            ) : i === 9 ? (
              <SheetWipe
                startFrame={30}
                from={
                  <Center>
                    <Heading>Scattered sheets.</Heading>
                  </Center>
                }
                to={
                  <Center>
                    <Sheet tab="ONE FILE">
                      <Heading>One living record.</Heading>
                    </Sheet>
                  </Center>
                }
              />
            ) : i === 10 ? (
              <StampCut
                startFrame={30}
                from={
                  <Center>
                    <Heading>Action.</Heading>
                  </Center>
                }
                to={
                  <Center>
                    <Heading>History.</Heading>
                  </Center>
                }
              />
            ) : (
              <EndCard liftAt={110} />
            )}
          </Slate>
          {i === 9 && (
            <>
              <Riser endsAt={30} length="short" />
              <Hit at={30} sound="paper-slide" />
              <Hit at={48} sound="impact-sub-small" />
            </>
          )}
          {i === 10 && <Hit at={36} sound="stamp-thud" />}
          {i === 11 && (
            <>
              <Hit at={41} sound="stamp-thud" />
              <Hit at={110} sound="paper-slide" />
            </>
          )}
        </Sequence>
      ))}
      <Audio
        src={staticFile("audio/music-bed.mp3")}
        volume={(f) =>
          0.2 *
          sidechainDip(f, impacts) *
          ramp(f, 0, 30) *
          (1 - ramp(f, SHOWCASE_FRAMES - 45, SHOWCASE_FRAMES))
        }
      />
    </AbsoluteFill>
  );
}
