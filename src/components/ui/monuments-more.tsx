import { useId } from "react";
import {
  MIRROR,
  MonumentFrame as Frame,
  type MonumentProps as Props,
} from "./monument-frame";

/**
 * Second set of monument line drawings. Same rules as `monuments.tsx`:
 * 400 × 240 canvas, `currentColor` strokes only, architecture only.
 */

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Row of round-headed arches from x0 up to (not past) x1. */
function arcade(x0: number, x1: number, top: number, bottom: number, w: number, pitch: number) {
  let d = "";
  for (let x = x0; x + w <= x1; x += pitch) {
    d += `M${x} ${bottom} V${top + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${top + w / 2} V${bottom} `;
  }
  return d;
}

/** Row of pointed (cusped) arches, for Indo-Saracenic arcades. */
function pointedArcade(x0: number, x1: number, top: number, bottom: number, w: number, pitch: number) {
  let d = "";
  for (let x = x0; x + w <= x1; x += pitch) {
    d += `M${x} ${bottom} V${top + 7} Q${x} ${top} ${x + w / 2} ${top} Q${x + w} ${top} ${x + w} ${top + 7} V${bottom} `;
  }
  return d;
}

/** Vertical posts between two rails. */
function posts(x0: number, x1: number, step: number, y0: number, y1: number) {
  let d = "";
  for (let x = x0; x <= x1; x += step) d += `M${x} ${y0} V${y1} `;
  return d;
}

export function Charminar(props: Props) {
  const id = useId();
  const half = `${id}-h`;
  return (
    <Frame {...props}>
      <g id={half}>
        {/* front minaret: tapering shaft, three ring balconies, arched gallery, onion dome */}
        <path d="M90 200 L94 76 H108 L112 200" />
        <path d="M85 168 H117 V162 H87 Z M86 132 H116 V126 H88 Z M87 96 H115 V90 H89 Z" />
        <path d="M94 90 V76 M108 90 V76 M97 90 V82 A4 4 0 0 1 105 82 V90" />
        <path d="M87 76 H115 M91 76 C83 66 87 50 101 46 C115 50 119 66 111 76" />
        <path d="M101 46 V38 M98 41 H104" />
        {/* rear minaret, glimpsed between front minaret and facade */}
        <path d="M124 100 V80 M138 100 V80 M120 80 H142 M122 92 H140" />
        <path d="M124 80 C118 70 122 58 131 54 C140 58 144 70 138 80 M131 54 V47" />
        {/* facade: parapet, arcaded upper storey, balcony band */}
        <path d="M112 200 V100 H200 M112 106 H200 M112 132 H200 M112 138 H200" />
        <path d={arcade(118, 200, 114, 132, 10, 14)} />
        {/* great arch with outer moulding */}
        <path d="M150 200 V174 Q150 144 200 144" />
        <path d="M143 200 V172 Q143 136 200 136" />
        {/* niches on the pier */}
        <path d="M118 196 V180 A8 8 0 0 1 134 180 V196 M118 170 V154 A8 8 0 0 1 134 154 V170" />
      </g>
      <use href={`#${half}`} transform={MIRROR} />
      <path d="M40 200 H360" />
    </Frame>
  );
}

const HAWA_TIERS: ReadonlyArray<[top: number, bottom: number, xl: number]> = [
  [168, 200, 40],
  [138, 168, 48],
  [108, 138, 82],
  [80, 108, 118],
  [56, 80, 154],
];

function jharokhaRow(xl: number, top: number, bottom: number) {
  let d = "";
  for (let x = 176; x >= xl + 4; x -= 18) {
    d += `M${x} ${bottom - 4} V${top + 14} Q${x + 7} ${top + 6} ${x + 14} ${top + 14} V${bottom - 4} `;
    d += `M${x + 4} ${bottom - 4} V${top + 17} H${x + 10} V${bottom - 4} `;
  }
  return d;
}

function chhatri(x: number, y: number, w: number) {
  const h = w * 0.8;
  const c = x + w / 2;
  return `M${x} ${y} V${y - h} M${x + w} ${y} V${y - h} M${x} ${y - h} C${x} ${y - h - w * 0.7} ${c} ${y - h - w * 0.9} ${c} ${y - h - w * 0.9} C${c} ${y - h - w * 0.9} ${x + w} ${y - h - w * 0.7} ${x + w} ${y - h} M${c} ${y - h - w * 0.9} V${y - h - w * 1.2}`;
}

export function HawaMahal(props: Props) {
  const id = useId();
  const half = `${id}-h`;
  return (
    <Frame {...props}>
      <g id={half}>
        {HAWA_TIERS.map(([top, bottom, xl]) => (
          <g key={top}>
            <path d={`M${xl} ${bottom} V${top} H200 M${xl} ${top + 5} H200`} />
            <path d={jharokhaRow(xl, top, bottom)} />
          </g>
        ))}
        {/* corner chhatris on each setback */}
        <path d={chhatri(42, 168, 12)} />
        <path d={chhatri(50, 138, 12)} />
        <path d={chhatri(84, 108, 12)} />
        <path d={chhatri(120, 80, 12)} />
      </g>
      <use href={`#${half}`} transform={MIRROR} />
      {/* crowning chhatri and entrance */}
      <path d={chhatri(190, 56, 20)} />
      <path d="M191 200 V184 A9 9 0 0 1 209 184 V200" />
      <path d="M24 200 H376" />
    </Frame>
  );
}

export function IndiaGate(props: Props) {
  const id = useId();
  const half = `${id}-h`;
  return (
    <Frame {...props}>
      <g id={half}>
        {/* leg with sunken panel and plinth */}
        <path d="M124 200 V80 H200" />
        <path d="M116 200 V192 H200 M120 192 V186 H200" />
        <path d="M132 180 V102 H148 V180 Z" />
        {/* arch with outer moulding */}
        <path d="M156 200 V138 A44 44 0 0 1 200 94" />
        <path d="M150 200 V138 A50 50 0 0 1 200 88" />
        {/* cornice with dentils */}
        <path d="M120 80 V72 H200 M120 72 V66 H200" />
        <path d={posts(128, 196, 8, 72, 66)} />
        {/* attic block */}
        <path d="M130 66 V40 H200 M126 40 V34 H200" />
        <path d="M138 60 V46 H162 V60 Z" />
        {/* low flanking wall and avenue */}
        <path d="M40 200 V184 H116 M40 184 V178 H52 V184 M60 192 H116" />
        <path d="M60 228 L124 200 M110 228 H200" />
      </g>
      <use href={`#${half}`} transform={MIRROR} />
      {/* shallow bowl dome */}
      <path d="M180 34 V26 H220 V34 M184 26 C184 14 192 10 200 10 C208 10 216 14 216 26 M200 10 V4" />
      <path d="M20 200 H380" />
    </Frame>
  );
}

function torana(y: number) {
  return `M200 ${y} H136 Q126 ${y} 128 ${y - 10} M200 ${y + 9} H138 Q132 ${y + 9} 131 ${y + 3} M131 ${y + 3} L128 ${y - 10}`;
}

export function SanchiStupa(props: Props) {
  const id = useId();
  const half = `${id}-h`;
  return (
    <Frame {...props}>
      {/* anda: hemispherical dome on a terraced drum */}
      <path d="M92 168 A108 108 0 0 1 308 168" />
      <path d="M84 168 H316 M80 184 H320 M84 168 V184 M316 168 V184" />
      <path d={posts(90, 310, 20, 168, 184)} />
      {/* harmika and three-tier chhatra */}
      <path d="M186 62 V48 H214 V62 M182 48 H218 M186 55 H214" />
      <path d="M200 48 V18 M174 44 Q200 38 226 44 M180 34 Q200 29 220 34 M186 25 Q200 21 214 25" />
      <g id={half}>
        {/* torana gateway: square pillars, three curved architraves */}
        <path d="M154 200 V84 M168 200 V84 M154 140 H168 M154 170 H168 M152 84 H170" />
        <path d={torana(86)} />
        <path d={torana(104)} />
        <path d={torana(122)} />
        <path d="M144 95 V104 M178 95 V104 M144 113 V122 M178 113 V122" />
        {/* ground vedika railing */}
        <path d="M56 190 H136 M56 196 H136" />
        <path d={posts(56, 136, 16, 186, 200)} />
      </g>
      <use href={`#${half}`} transform={MIRROR} />
      <path d="M30 200 H370" />
    </Frame>
  );
}

const CX = 200;
const CY = 128;
const R_OUT = 88;
const R_IN = 70;

function konarkSpokes() {
  let major = "";
  let minor = "";
  let dots = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const [dx, dy] = [Math.cos(a), Math.sin(a)];
    const [px, py] = [-dy * 3, dx * 3];
    const x0 = CX + dx * 16;
    const y0 = CY + dy * 16;
    const x1 = CX + dx * R_IN;
    const y1 = CY + dy * R_IN;
    major += `M${r1(x0 + px)} ${r1(y0 + py)} L${r1(x1 + px)} ${r1(y1 + py)} M${r1(x0 - px)} ${r1(y0 - py)} L${r1(x1 - px)} ${r1(y1 - py)} `;
    const b = a + Math.PI / 8;
    minor += `M${r1(CX + Math.cos(b) * 24)} ${r1(CY + Math.sin(b) * 24)} L${r1(CX + Math.cos(b) * R_IN)} ${r1(CY + Math.sin(b) * R_IN)} `;
  }
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 + Math.PI / 16;
    const x = r1(CX + Math.cos(a) * 79);
    const y = r1(CY + Math.sin(a) * 79);
    dots += `M${x - 4} ${y} A4 4 0 1 0 ${x + 4} ${y} A4 4 0 1 0 ${x - 4} ${y} `;
  }
  return { major, minor, dots };
}

/** Horizontal plinth courses that stop at the wheel's edge. */
function plinthCourse(y: number) {
  const dy = y - CY;
  const x = Math.abs(dy) < R_OUT ? r1(Math.sqrt(R_OUT * R_OUT - dy * dy)) : 0;
  return `M16 ${y} H${CX - x - 4} M${CX + x + 4} ${y} H384`;
}

export function KonarkWheel(props: Props) {
  const { major, minor, dots } = konarkSpokes();
  return (
    <Frame {...props}>
      {/* temple plinth behind the wheel */}
      <path d={[176, 192, 208, 224].map(plinthCourse).join(" ")} />
      <path d={posts(24, 104, 16, 192, 208) + posts(296, 376, 16, 192, 208)} />
      <path d="M16 232 H384" />
      {/* rim, medallions, hub */}
      <circle cx={CX} cy={CY} r={R_OUT} />
      <circle cx={CX} cy={CY} r={R_IN} />
      <path d={dots} />
      <circle cx={CX} cy={CY} r={16} />
      <circle cx={CX} cy={CY} r={7} />
      <path d={major} />
      <path d={minor} />
    </Frame>
  );
}

function waves() {
  let d = "";
  for (let x = 20; x < 380; x += 40) d += `M${x} 214 Q${x + 10} 208 ${x + 20} 214 T${x + 40} 214 `;
  return d;
}

export function HowrahBridge(props: Props) {
  const id = useId();
  const half = `${id}-h`;
  return (
    <Frame {...props}>
      <g id={half}>
        {/* deck and tower */}
        <path d="M16 152 H200 M16 160 H200" />
        <path d="M100 152 L105 44 H117 L122 152 M103 44 H119" />
        <path d="M104 120 H118 M104 96 H118 M105 72 H117 M104 120 L118 96 M118 120 L104 96 M104 96 L118 72 M118 96 L104 72 M105 72 L117 50 M117 72 L105 50" />
        {/* anchor arm to the shore */}
        <path d="M28 152 L105 44" />
        <path d="M48 152 V124 M66 152 V99 M84 152 V74 M48 124 L66 152 M66 99 L84 152 M84 74 L100 152" />
        {/* cantilever arm dropping toward the suspended span */}
        <path d="M117 44 L200 104" />
        <path d="M140 152 V61 M160 152 V75 M180 152 V90 M200 152 V104" />
        <path d="M140 61 L160 152 M160 75 L180 152 M180 90 L200 152 M122 152 L140 61" />
        {/* pier into the river and shore */}
        <path d="M96 160 V204 M126 160 V204 M92 204 H130 M16 160 V200 H92" />
      </g>
      <use href={`#${half}`} transform={MIRROR} />
      <path d={waves()} />
    </Frame>
  );
}

function domedTurret(x: number, base: number, w: number, h: number) {
  const c = x + w / 2;
  const top = base - h;
  const d = w * 0.9;
  return `M${x} ${base} V${top} M${x + w} ${base} V${top} M${x - 3} ${top} H${x + w + 3} M${x + 1} ${top} C${x - 1} ${top - d * 0.7} ${c} ${top - d} ${c} ${top - d} C${c} ${top - d} ${x + w + 1} ${top - d * 0.7} ${x + w - 1} ${top} M${c} ${top - d} V${top - d - 8}`;
}

export function MysorePalace(props: Props) {
  const id = useId();
  const half = `${id}-h`;
  return (
    <Frame {...props}>
      <g id={half}>
        {/* long wing: cornice, parapet, two arcaded storeys */}
        <path d="M32 200 V126 H160 M32 126 V118 H160 M36 118 V112 H160 M32 164 H160" />
        <path d={pointedArcade(40, 158, 134, 160, 16, 22)} />
        <path d={pointedArcade(40, 158, 170, 196, 16, 22)} />
        {/* corner turret and mid turret */}
        <path d={domedTurret(28, 200, 26, 100)} />
        <path d="M32 140 H52 M32 168 H52 M36 196 V182 A4 4 0 0 1 44 182 V196 M36 158 V148 A4 4 0 0 1 44 148 V158" />
        <path d={domedTurret(104, 118, 18, 22)} />
        {/* central tower with tall arch, windows, drum */}
        <path d="M160 200 V92 H200 M156 92 H200 M160 84 H200 M160 92 V84 M172 84 V72 H200" />
        <path d="M168 200 V150 Q168 134 200 134 M172 126 V110 H186 V126" />
      </g>
      <use href={`#${half}`} transform={MIRROR} />
      {/* gilded dome */}
      <path d="M172 72 C166 58 178 46 200 40 C222 46 234 58 228 72 M200 40 V30 M197 33 H203" />
      <path d="M16 200 H384" />
    </Frame>
  );
}

function gopuramTiers() {
  let d = "";
  for (let i = 0; i < 9; i++) {
    const y = 166 - (i + 1) * 14;
    const hw = 76 - i * 5.5;
    const xl = r1(200 - hw);
    d += `M${xl} ${y + 14} V${y + 2} H200 M${r1(xl - 3)} ${y + 2} H200 `;
    for (let x = 193; x >= xl + 3; x -= 9) {
      d += `M${r1(x)} ${y + 12} V${y + 8} A3 3 0 0 1 ${r1(x + 6)} ${y + 8} V${y + 12} `;
    }
  }
  return d;
}

export function MeenakshiGopuram(props: Props) {
  const id = useId();
  const half = `${id}-h`;
  return (
    <Frame {...props}>
      <g id={half}>
        {/* stone base with doorway */}
        <path d="M118 200 V166 H200 M114 166 H200 M118 182 H186 M188 200 V150 H200" />
        <path d={gopuramTiers()} />
        {/* barrel-vault crown with horn ends and finials */}
        <path d="M162 40 V30 Q162 22 172 22 H200 M158 40 H200 M162 30 L154 24 M170 22 V12 M184 22 V12" />
      </g>
      <use href={`#${half}`} transform={MIRROR} />
      <path d="M200 22 V10 M196 12 H204 M166 12 H174 M180 12 H188" />
      <path d="M40 200 H360" />
    </Frame>
  );
}
