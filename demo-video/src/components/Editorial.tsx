import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { bodyFont, displayFont } from "../fonts";

export const colors = {
  paper: "#fffdf5",
  paperShade: "#f5efe2",
  paperLine: "#ded4c3",
  ink: "#261d16",
  inkMute: "#685d50",
  indigo: "#21347f",
  green: "#285944",
  saffron: "#ed8b3a",
};

export function SceneWash({ tone = "paper" }: { tone?: "indigo" | "paper" }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: tone === "indigo" ? colors.indigo : colors.paper,
        opacity: interpolate(frame, [0, 9], [0.92, 0], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    />
  );
}

export function PhaseTag({ index, label }: { index: string; label: string }) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 86,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "13px 18px 12px 14px",
        backgroundColor: colors.paper,
        borderLeft: `8px solid ${colors.saffron}`,
        color: colors.indigo,
        fontFamily: bodyFont,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        opacity: interpolate(frame, [0, 12, 70, 88], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: `${interpolate(frame, [0, 12], [-24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px 0px`,
      }}
    >
      <span style={{ color: colors.saffron }}>{index}</span>
      <span>{label}</span>
    </div>
  );
}

export function EditorialCard({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        right: 80,
        top: 88,
        width: 590,
        padding: "28px 30px 30px",
        backgroundColor: "rgba(255,253,245,0.96)",
        border: `1px solid ${colors.paperLine}`,
        boxShadow: "0 18px 50px rgba(33,52,127,0.16)",
        color: colors.ink,
        fontFamily: bodyFont,
        opacity: interpolate(frame, [6, 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: `0px ${interpolate(frame, [6, 20], [24, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
      }}
    >
      <div
        style={{
          color: colors.indigo,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "0.11em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: displayFont,
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 0.98,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 20,
          display: "grid",
          gap: 12,
          fontSize: 24,
          lineHeight: 1.25,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function BrandLockup({ large = false }: { large?: boolean }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: large ? 24 : 13 }}
    >
      <Img
        src={staticFile("brand/citizen-logo.png")}
        style={{ height: large ? 84 : 44, width: large ? 84 : 44 }}
      />
      <span
        style={{
          fontFamily: displayFont,
          fontSize: large ? 104 : 38,
          fontWeight: 800,
          letterSpacing: "0.02em",
          lineHeight: 0.8,
        }}
      >
        CITIZEN
      </span>
    </div>
  );
}
