import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont } from "../fonts";
import { palette as c, ramp, settle } from "./core";
export type SheetProps = {
  children?: ReactNode;
  enterAt?: number;
  exitAt?: number;
  stackOffset?: { x: number; y: number; rotate?: number };
  collapseAt?: number;
  tab?: string;
  style?: CSSProperties;
};
export function Sheet({
  children,
  enterAt = 0,
  exitAt,
  stackOffset = { x: 0, y: 0 },
  collapseAt,
  tab,
  style,
}: SheetProps) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = settle(f - enterAt, fps);
  const out = exitAt === undefined ? 0 : settle(f - exitAt, fps, 16);
  const stack = collapseAt === undefined ? 1 : 1 - settle(f - collapseAt, fps);
  return (
    <div
      style={{
        position: "relative",
        background: c.shade,
        border: `1px solid ${c.line}`,
        borderRadius: 3,
        padding: 54,
        ...style,
        opacity: f < enterAt ? 0 : 1 - out,
        transform: `translate(${(1 - p) * 2100 + out * 2100 + stackOffset.x * stack}px,${stackOffset.y * stack}px) rotate(${(stackOffset.rotate ?? 0) * stack}deg)`,
      }}
    >
      {tab && (
        <div
          style={{
            position: "absolute",
            top: -39,
            left: -1,
            height: 39,
            padding: "6px 35px 0 18px",
            background: c.saffron,
            clipPath: "polygon(0 0, 88% 0, 100% 100%, 0 100%)",
            fontFamily: displayFont,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 2,
            color: c.ink,
          }}
        >
          {tab}
        </div>
      )}
      {children}
    </div>
  );
}
export function SheetStack({
  labels = ["IDENTITY PORTAL", "PAYMENT PORTAL", "DOCUMENT PORTAL"],
  enterAt = 0,
  collapseAt = 75,
  children,
}: {
  labels?: string[];
  enterAt?: number;
  collapseAt?: number;
  children?: ReactNode;
}) {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: 1100, height: 620 }}>
      {labels.map((label, i) => (
        <div key={label} style={{ position: "absolute", inset: 0 }}>
          <Sheet
            enterAt={enterAt + i * 8}
            collapseAt={collapseAt}
            stackOffset={{
              x: (i - 1) * 100,
              y: (i - 1) * 55,
              rotate: (i - 1) * 4,
            }}
            tab={label}
            style={{ height: "100%", boxSizing: "border-box" }}
          >
            <div
              style={{
                opacity:
                  i === labels.length - 1
                    ? 1
                    : 1 - ramp(f, collapseAt, collapseAt + 18),
              }}
            >
              {children ?? (
                <>
                  <h1
                    style={{
                      fontFamily: displayFont,
                      fontSize: 94,
                      lineHeight: 1,
                      margin: "60px 0 35px",
                    }}
                  >
                    One record.
                    <br />
                    Carried forward.
                  </h1>
                  <div style={{ height: 1, background: c.line }} />
                </>
              )}
            </div>
          </Sheet>
        </div>
      ))}
    </div>
  );
}
