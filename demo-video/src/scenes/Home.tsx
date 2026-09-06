import { AbsoluteFill } from "remotion";
import { Clip } from "../components/Clip";
import { colors } from "../components/Editorial";
import { displayFont } from "../fonts";
import { LedgerRows } from "../motion/LedgerRows";
import { PhoneFrame } from "../motion/PhoneFrame";

/** 0:22–0:35 — Arjun's Home already knows three things. */
export function Home() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <div style={{ position: "absolute", left: 250, top: 100 }}>
        <PhoneFrame at={0} scale={1.02}>
          <Clip clip="01-home-nudges.mp4" playbackRate={0.8} />
        </PhoneFrame>
      </div>
      <div style={{ position: "absolute", left: 800, top: 250, width: 900 }}>
        <div style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: colors.inkMute, marginBottom: 12 }}>What the record already knows</div>
        <LedgerRows at={75} stagger={45} rows={[
          { label: "PAN name vs Aadhaar", value: "Mismatch" },
          { label: "Traffic challan", value: "₹500 due" },
          { label: "Mother's property papers", value: "Needs a hand" },
        ]} />
      </div>
    </AbsoluteFill>
  );
}
