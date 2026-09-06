import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../components/Editorial";
import { bodyFont, displayFont } from "../fonts";
import { Sheet } from "../motion/Sheet";
import { Stamp } from "../motion/Stamp";

export const PROBLEM_SHEETS_AT = [20, 60, 100];
export const PROBLEM_COLLAPSE_AT = 215;
export const PROBLEM_STAMP_AT = 262;

/** Three portals, each holding one slice of the same person, none aware of the others. */
const portals = [
  { tab: "PAN PORTAL", rows: [["Name on record", "ARJUN KUMAR SHARMA"], ["Aadhaar name", "Arjun Sharma"], ["Status", "Mismatch · no action"]] },
  { tab: "CHALLAN PORTAL", rows: [["e-Challan", "KA05 ·· 4821"], ["Amount", "₹500"], ["Due", "4 Sep 2026"]] },
  { tab: "EPFO PORTAL", rows: [["UAN", "10XX XXXX 4821"], ["July contribution", "Missing"], ["Last login", "Never"]] },
];

function PortalRows({ rows }: { rows: string[][] }) {
  return (
    <div style={{ display: "grid", marginTop: 8 }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 40, padding: "18px 0", borderBottom: `1px solid ${colors.paperLine}`, fontSize: 26 }}>
          <span style={{ fontFamily: bodyFont, color: colors.inkMute }}>{label}</span>
          <span style={{ fontFamily: displayFont, fontWeight: 700, color: colors.ink, fontVariantNumeric: "tabular-nums" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

/** 0:00–0:12 — three portals that never talk, collapsing into one file. */
export function Problem() {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [PROBLEM_COLLAPSE_AT, PROBLEM_COLLAPSE_AT + 16], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headline = interpolate(frame, [PROBLEM_COLLAPSE_AT + 14, PROBLEM_COLLAPSE_AT + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", width: 1100, height: 600 }}>
        {portals.map((portal, index) => (
          <div key={portal.tab} style={{ position: "absolute", inset: 0 }}>
            <Sheet
              enterAt={PROBLEM_SHEETS_AT[index]}
              collapseAt={PROBLEM_COLLAPSE_AT}
              stackOffset={{ x: (index - 1) * 120, y: (index - 1) * 60, rotate: (index - 1) * 3.5 }}
              tab={portal.tab}
              style={{ height: "100%", boxSizing: "border-box", padding: "70px 80px" }}
            >
              <div style={{ opacity: index === portals.length - 1 ? 1 : fade }}>
                <div style={{ opacity: 1 - headline }}>
                  <PortalRows rows={portal.rows} />
                </div>
              </div>
              {index === portals.length - 1 ? (
                <div style={{ position: "absolute", left: 80, top: 120, right: 80, opacity: headline, translate: `0 ${(1 - headline) * 16}px`, fontFamily: displayFont, fontSize: 96, fontWeight: 800, lineHeight: 1.02, color: colors.ink, letterSpacing: "-0.01em" }}>
                  One record.
                  <br />
                  Not a portal hunt.
                </div>
              ) : null}
            </Sheet>
          </div>
        ))}
        <div style={{ position: "absolute", top: -39, left: -1, height: 39, padding: "6px 35px 0 18px", background: colors.saffron, clipPath: "polygon(0 0, 88% 0, 100% 100%, 0 100%)", fontFamily: displayFont, fontSize: 22, fontWeight: 700, letterSpacing: 2, color: colors.ink, opacity: headline }}>
          ONE FILE
        </div>
      </div>
      <div style={{ position: "absolute", right: 300, bottom: 200 }}>
        <Stamp text="Independent prototype" at={PROBLEM_STAMP_AT} fontSize={30} />
      </div>
    </AbsoluteFill>
  );
}
