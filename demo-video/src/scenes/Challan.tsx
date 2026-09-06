import { AbsoluteFill, Sequence } from "remotion";
import { Clip } from "../components/Clip";
import { colors } from "../components/Editorial";
import { displayFont } from "../fonts";
import { PhoneFrame } from "../motion/PhoneFrame";
import { Stamp } from "../motion/Stamp";

/** 0:35–0:44 — "pay my challan" on desktop, then one write ripples into three panes. */
export const CHALLAN_SPLIT = 275;
export const CHALLAN_STAMP_AT = 320;

const panes = [
  { clip: "03-ripple-money.mp4", label: "Money" },
  { clip: "04-ripple-documents.mp4", label: "Documents" },
  { clip: "05-ripple-activity.mp4", label: "History" },
];

export function Challan() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <Sequence durationInFrames={CHALLAN_SPLIT} name="desktop">
        <Clip clip="02-intent-challan.mp4" playbackRate={1.2} />
      </Sequence>
      <Sequence from={CHALLAN_SPLIT} name="ripple">
        <AbsoluteFill style={{ backgroundColor: colors.paper, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 90 }}>
          {panes.map((pane, index) => (
            <div key={pane.clip} style={{ display: "grid", gap: 18, justifyItems: "center" }}>
              <div style={{ fontFamily: displayFont, fontSize: 24, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: colors.inkMute }}>{pane.label}</div>
              <PhoneFrame at={index * 6} scale={0.9}>
                <Clip clip={pane.clip} />
              </PhoneFrame>
            </div>
          ))}
        </AbsoluteFill>
      </Sequence>
      <div style={{ position: "absolute", left: "50%", top: "50%", translate: "-50% -50%", rotate: "-2deg" }}>
        <Stamp text="Paid · simulated" at={CHALLAN_STAMP_AT} fontSize={56} />
      </div>
    </AbsoluteFill>
  );
}
