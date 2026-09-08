import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Clip } from "../components/Clip";
import { colors } from "../components/Editorial";
import { bodyFont, displayFont } from "../fonts";

type Stage = "pending" | "followup" | "recovery" | "brief";
const stages = [
  { id: "pending", label: "The original issue", title: "Sent.\nNot solved.", body: "The PAN still carries the old name.", clip: "18-case-pending.mp4" },
  { id: "followup", label: "The connected follow-up", title: "Same matter.\nNext step.", body: "The reference and history travel with the grievance.", clip: "19-case-followup.mp4" },
  { id: "recovery", label: "The failure test", title: "A failed send.\nNot a restart.", body: "No submission on failure. One follow-up after retry.", clip: "20-case-recovery.mp4" },
  { id: "brief", label: "The record you keep", title: "One matter.\nThe whole story.", body: "Evidence, references and history in a printable case brief.", clip: "21-case-brief.mp4" },
] as const;

function Continuity({ stage }: { stage: Stage }) {
  const frame = useCurrentFrame();
  const index = stages.findIndex((item) => item.id === stage);
  const current = stages[index];
  const settle = interpolate(frame, [0, 14], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const recoveryState = frame < 106 ? "Nothing submitted" : frame < 197 ? "Draft retained after reload" : "One follow-up submitted";
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, color: colors.ink }}>
      <div style={{ position: "absolute", left: 80, top: 100, width: 530, transform: `translateY(${settle}px)` }}>
        <div style={{ fontFamily: bodyFont, fontSize: 22, fontWeight: 700, letterSpacing: "0.1em", color: colors.green }}>ROUND 2 · FOLLOW THROUGH</div>
        <div style={{ marginTop: 72, fontFamily: bodyFont, fontSize: 24, color: colors.inkMute }}>{String(index + 1).padStart(2, "0")} / {current.label}</div>
        <h1 style={{ whiteSpace: "pre-line", margin: "22px 0 28px", fontFamily: displayFont, fontSize: 80, fontWeight: 700, lineHeight: 0.99, letterSpacing: "-0.035em", color: colors.indigo }}>{current.title}</h1>
        <p style={{ maxWidth: 480, margin: 0, fontFamily: bodyFont, fontSize: 29, lineHeight: 1.4, color: colors.inkMute }}>{current.body}</p>
        {stage === "recovery" ? <div style={{ display: "inline-block", marginTop: 28, padding: "12px 15px", borderLeft: `5px solid ${colors.green}`, background: "#e5efdf", fontFamily: bodyFont, fontSize: 24, fontWeight: 700, color: colors.green }}>{recoveryState}</div> : null}
      </div>
      <div style={{ position: "absolute", left: 80, bottom: 168, width: 510 }}>
        {stages.map((item, itemIndex) => <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 15, padding: "10px 0", fontFamily: bodyFont, fontSize: 23, fontWeight: itemIndex === index ? 700 : 400, color: itemIndex <= index ? colors.green : colors.inkMute, opacity: itemIndex <= index ? 1 : 0.55 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", border: `2px solid ${itemIndex <= index ? colors.green : colors.paperLine}`, background: itemIndex <= index ? colors.green : "transparent" }} />
          {item.label}
        </div>)}
      </div>
      <div style={{ position: "absolute", left: 720, top: 56, width: 1120, border: `1px solid ${colors.paperLine}`, borderRadius: 5, overflow: "hidden", background: colors.paper }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 16px", fontFamily: bodyFont, fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", background: colors.indigo, color: colors.paper }}><span>CITIZEN · WORKING DEMO</span><span>SIMULATED</span></div>
        <div style={{ width: 1120, height: 1120 * 800 / 1060, overflow: "hidden" }}>
          <Clip clip={current.clip} style={{ opacity: 1, scale: "1" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

export const CasePending = () => <Continuity stage="pending" />;
export const CaseFollowup = () => <Continuity stage="followup" />;
export const CaseRecovery = () => <Continuity stage="recovery" />;
export const CaseBrief = () => <Continuity stage="brief" />;
