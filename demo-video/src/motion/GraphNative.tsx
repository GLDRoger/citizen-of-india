import { useCurrentFrame, useVideoConfig } from "remotion";
import { displayFont } from "../fonts";
import { palette as c, ramp, settle } from "./core";
export type Point = { x: number; y: number };
export type GraphRecord = {
  id: string;
  label: string;
  group: "identity" | "family" | "work" | "assets";
};
export const groupColors = {
  identity: c.indigo,
  family: c.brick,
  work: c.green,
  assets: c.saffron,
};
// Exact layout from the product's record-map/model.ts; no fit-dependent geometry.
export function spiralPositions<T extends GraphRecord>(nodes: T[]) {
  const count = Math.max(nodes.length, 1);
  const step = (Math.PI * 2 * 1.55) / count;
  return nodes.map((node, i) => {
    const angle = -Math.PI / 2 + i * step;
    const radius = 120 + i * 11 * (14 / count);
    return {
      ...node,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });
}
export type HighlightEdgeProps = {
  from: Point;
  to: Point;
  at?: number;
  endAt?: number;
  label?: string;
  color?: string;
};
export function HighlightEdge({
  from,
  to,
  at = 0,
  endAt,
  label = "spouseOf",
  color = c.brick,
}: HighlightEdgeProps) {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 18);
  const ended = endAt !== undefined && f >= endAt;
  const x = (from.x + to.x) / 2,
    y = (from.y + to.y) / 2;
  return (
    <g opacity={f < at ? 0 : 1}>
      <path
        d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
        pathLength={1}
        stroke={ended ? c.line : color}
        strokeWidth={3}
        fill="none"
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
      <g opacity={p}>
        <rect x={x - 92} y={y - 42} width={184} height={34} fill={c.paper} />
        <text
          x={x}
          y={y - 18}
          textAnchor="middle"
          fill={ended ? c.mute : color}
          fontFamily={displayFont}
          fontSize={23}
          fontWeight={700}
        >
          {label}
        </text>
      </g>
      {ended && (
        <g opacity={ramp(f, endAt, endAt + 8)}>
          <path
            d={`M ${x - 5} ${y + 6} l 10 -12`}
            stroke={c.mute}
            strokeWidth={2}
          />
          <text
            x={x}
            y={y + 35}
            textAnchor="middle"
            fill={c.mute}
            fontSize={19}
            fontFamily={displayFont}
          >
            ended
          </text>
        </g>
      )}
    </g>
  );
}
export type GraphNativeProps = {
  nodes: GraphRecord[];
  name?: string;
  at?: number;
  stagger?: number;
  highlight?: {
    from: string;
    to: string;
    at?: number;
    endAt?: number;
    label?: string;
  };
  scale?: number;
};
export function GraphNative({
  nodes,
  name = "YOU",
  at = 0,
  stagger = 3,
  highlight,
  scale = 1.55,
}: GraphNativeProps) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const placed = spiralPositions(nodes);
  const find = (id: string) =>
    id === "center" ? { x: 0, y: 0 } : placed.find((n) => n.id === id);
  const a = highlight && find(highlight.from),
    b = highlight && find(highlight.to);
  return (
    <svg width={1300} height={940} viewBox="-650 -470 1300 940">
      <g transform={`scale(${scale})`}>
        {placed.map((n, i) => {
          const start = at + i * stagger;
          const p = settle(f - start, fps, 26);
          const angle = i * 2.399;
          const x = n.x + (1 - p) * Math.cos(angle) * 900,
            y = n.y + (1 - p) * Math.sin(angle) * 700;
          return (
            <g key={n.id}>
              <path
                d={`M 0 0 L ${n.x} ${n.y}`}
                stroke={c.line}
                fill="none"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - ramp(f, start + 8, start + 26)}
              />
              <g
                style={{
                  transform: `translate(${x}px,${y}px)`,
                  opacity: ramp(f, start, start + 5),
                }}
              >
                <rect
                  x={-23}
                  y={-17}
                  width={46}
                  height={34}
                  rx={3}
                  fill={c.shade}
                  stroke={groupColors[n.group]}
                />
                <path
                  d="M -14 -6 H 12 M -14 1 H 12 M -14 8 H 4"
                  stroke={groupColors[n.group]}
                />
                <text
                  textAnchor="middle"
                  y={37}
                  fill={c.ink}
                  fontFamily={displayFont}
                  fontWeight={600}
                  fontSize={14}
                >
                  {n.label}
                </text>
              </g>
            </g>
          );
        })}
        <circle r={48} fill={c.ink} />
        <text
          textAnchor="middle"
          y={8}
          fill={c.paper}
          fontFamily={displayFont}
          fontWeight={700}
          fontSize={23}
        >
          {name}
        </text>
        {highlight && a && b && (
          <HighlightEdge
            from={a}
            to={b}
            at={highlight.at}
            endAt={highlight.endAt}
            label={highlight.label}
          />
        )}
      </g>
    </svg>
  );
}
