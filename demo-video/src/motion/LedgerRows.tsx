import { useCurrentFrame } from "remotion";
import { bodyFont, displayFont } from "../fonts";
import { palette as c, ramp } from "./core";
export type LedgerRow = {
  label: string;
  value?: string;
  from?: number;
  to?: number;
  prefix?: string;
  suffix?: string;
  countFrames?: number;
};
export const ledgerRowFrames = (count: number, at = 0, stagger = 8) =>
  Array.from({ length: count }, (_, i) => at + i * stagger);
export function digitTickFrames(
  from: number,
  to: number,
  at = 0,
  duration = 30,
) {
  const result: { frame: number; digit: number }[] = [];
  let prev = String(Math.round(from));
  for (let f = 1; f <= duration; f++) {
    const next = String(Math.round(from + ((to - from) * f) / duration));
    const n = Math.max(prev.length, next.length);
    for (let d = 0; d < n; d++)
      if (prev[prev.length - 1 - d] !== next[next.length - 1 - d])
        result.push({ frame: at + f, digit: d });
    prev = next;
  }
  return result;
}
export function LedgerRows({
  rows,
  at = 0,
  stagger = 8,
}: {
  rows: LedgerRow[];
  at?: number;
  stagger?: number;
}) {
  const f = useCurrentFrame();
  return (
    <div>
      {rows.map((row, i) => {
        const p = ramp(f, at + i * stagger, at + i * stagger + 8);
        const v = Math.round(
          (row.from ?? 0) +
            ((row.to ?? 0) - (row.from ?? 0)) *
              ramp(
                f,
                at + i * stagger,
                at + i * stagger + (row.countFrames ?? 30),
              ),
        );
        return (
          <div
            key={i}
            style={{
              position: "relative",
              padding: "26px 0",
              display: "flex",
              justifyContent: "space-between",
              gap: 30,
              alignItems: "baseline",
              opacity: p,
              transform: `translateY(${(1 - p) * 12}px)`,
            }}
          >
            <span style={{ fontFamily: bodyFont, color: c.mute, fontSize: 28 }}>
              {row.label}
            </span>
            <span
              style={{
                fontFamily: displayFont,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                fontSize: 42,
                color: c.ink,
              }}
            >
              {row.to === undefined
                ? row.value
                : `${row.prefix ?? ""}${v.toLocaleString("en-IN")}${row.suffix ?? ""}`}
            </span>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 1,
                background: c.line,
                transform: `scaleX(${p})`,
                transformOrigin: "left",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
