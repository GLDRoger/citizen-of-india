import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bodyFont, displayFont } from "../fonts";
import { palette as c } from "./core";
import { groupColors, spiralPositions, type GraphRecord } from "./GraphNative";

/**
 * The Citizen record map as it looks in the product (src/features/profile/record-map):
 * disc nodes with a bare icon, group-coloured edges to the centre, a dotted spiral
 * path, Anek labels, the centre disc in ink. Nodes fly in from the edges of the
 * canvas and settle on the exact spiral geometry the app uses.
 */

export type RecordNode = GraphRecord & { subtitle?: string; icon: IconName; warn?: boolean };

type IconName = "person" | "file" | "briefcase" | "building" | "car" | "house" | "pin";

/** Lucide icon paths (ISC), 24-unit box, stroke only. */
const iconPaths: Record<IconName, string[]> = {
  person: ["M19 21a7 7 0 0 0-14 0", "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  file: ["M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z", "M14 2v4a2 2 0 0 0 2 2h4"],
  briefcase: ["M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", "M2 8h20v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"],
  building: ["M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", "M10 6h4", "M10 10h4", "M10 14h4", "M10 18h4"],
  car: ["M19 17H5", "M14 17H9", "M5 11l2-5h10l2 5", "M3 11h18v6H3z", "M7 17a2 2 0 1 0 0 0", "M17 17a2 2 0 1 0 0 0"],
  house: ["M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  pin: ["M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
};

/** Arjun's record, in the order the product groups it: identity → family → work → assets. */
export const arjunRecord: RecordNode[] = [
  { id: "aadhaar", label: "Aadhaar", subtitle: "XXXX XXXX 4821", group: "identity", icon: "file" },
  { id: "pan", label: "PAN", subtitle: "AXXPS**21K", group: "identity", icon: "file", warn: true },
  { id: "passport", label: "Passport", subtitle: "S98***21", group: "identity", icon: "file" },
  { id: "dl", label: "Driving Licence", subtitle: "KA05 2016", group: "identity", icon: "file" },
  { id: "priya", label: "Priya Patel", subtitle: "Partner", group: "family", icon: "person" },
  { id: "sunita", label: "Sunita Sharma", subtitle: "Mother", group: "family", icon: "person" },
  { id: "rajesh", label: "Rajesh Sharma", subtitle: "Father", group: "family", icon: "person" },
  { id: "meridian", label: "Meridian Tech", subtitle: "Senior Engineer", group: "work", icon: "building" },
  { id: "sws", label: "Sharma Web Solutions", subtitle: "Proprietorship", group: "work", icon: "briefcase" },
  { id: "gst", label: "GST Registration", subtitle: "29AXXPS**21K", group: "work", icon: "file" },
  { id: "activa", label: "Honda Activa", subtitle: "KA05 ** 4821", group: "assets", icon: "car" },
  { id: "rc", label: "Vehicle RC", subtitle: "18 Feb 2022", group: "assets", icon: "file" },
  { id: "address", label: "Bengaluru", subtitle: "560078", group: "assets", icon: "pin" },
];

const NODE_RADIUS = 22;

function Icon({ name, color }: { name: IconName; color: string }) {
  return (
    <g transform="translate(-9 -9) scale(0.75)" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      {iconPaths[name].map((d) => <path d={d} key={d} />)}
    </g>
  );
}

export type RecordGraphProps = {
  nodes?: RecordNode[];
  name?: string;
  /** Frame the first node starts flying in. */
  at?: number;
  stagger?: number;
  scale?: number;
  /** Fly-in origin: nodes arrive from the canvas edge, in the direction of their final position. */
  width?: number;
  height?: number;
};

export function RecordGraph({ nodes = arjunRecord, name = "Arjun Sharma", at = 0, stagger = 4, scale = 1.35, width = 1920, height = 1080 }: RecordGraphProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const placed = spiralPositions(nodes);
  const spiral = placed.map((node, index) => `${index === 0 ? "M" : "L"}${node.x.toFixed(1)} ${node.y.toFixed(1)}`).join(" ");
  const lastSettle = at + (placed.length - 1) * stagger + 30;
  const centreIn = spring({ frame: frame - at + 6, fps, config: { damping: 200 }, durationInFrames: 20 });
  const pathIn = interpolate(frame, [lastSettle - 24, lastSettle + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <svg width={width} height={height} viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`} style={{ display: "block" }}>
      <g transform={`scale(${scale})`}>
        <path d={spiral} fill="none" stroke={c.line} strokeWidth={1.5} strokeDasharray="3 6" strokeLinecap="round" pathLength={1} style={{ strokeDashoffset: 0, opacity: pathIn }} />
        {placed.map((node, index) => {
          const start = at + index * stagger;
          const settle = spring({ frame: frame - start, fps, config: { damping: 26, mass: 0.9, stiffness: 120 }, durationInFrames: 34 });
          const angle = Math.atan2(node.y, node.x);
          const flyDistance = 900;
          const x = node.x + Math.cos(angle) * flyDistance * (1 - settle);
          const y = node.y + Math.sin(angle) * flyDistance * (1 - settle);
          const edge = interpolate(frame, [start + 12, start + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const colour = groupColors[node.group];
          const label = interpolate(frame, [start + 16, start + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g key={node.id}>
              <line x1={0} y1={0} x2={node.x} y2={node.y} stroke={colour} strokeWidth={1.5} opacity={0.55 * edge} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - edge} />
              <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} opacity={interpolate(frame, [start, start + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
                <circle r={NODE_RADIUS} fill={c.shade} stroke={colour} strokeWidth={2} />
                <Icon name={node.icon} color={colour} />
                {node.warn ? <circle cx={NODE_RADIUS - 6} cy={-NODE_RADIUS + 6} r={5} fill={c.brick} stroke={c.shade} strokeWidth={2} /> : null}
                <g opacity={label}>
                  <text y={NODE_RADIUS + 16} textAnchor="middle" style={{ fontFamily: bodyFont, fontSize: 12, fontWeight: 700, fill: c.ink }}>{node.label}</text>
                  {node.subtitle ? <text y={NODE_RADIUS + 29} textAnchor="middle" style={{ fontFamily: bodyFont, fontSize: 10.5, fontWeight: 500, fill: c.mute }}>{node.subtitle}</text> : null}
                </g>
              </g>
            </g>
          );
        })}
        <g transform={`scale(${centreIn})`}>
          <circle r={34} fill={c.ink} />
          <text y={4} textAnchor="middle" style={{ fontFamily: bodyFont, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", fill: c.paper }}>YOU</text>
          <text y={58} textAnchor="middle" style={{ fontFamily: displayFont, fontSize: 18, fontWeight: 700, fill: c.ink }}>{name}</text>
        </g>
      </g>
    </svg>
  );
}

/** Frame at which node `index` lands (for ticks). */
export const recordNodeLanding = (at: number, index: number, stagger = 4) => at + index * stagger + 18;
