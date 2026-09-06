import { useId } from "react";
import {
  MIRROR,
  MonumentFrame as Frame,
  type MonumentProps as Props,
} from "./monument-frame";
import {
  Charminar,
  HawaMahal,
  HowrahBridge,
  IndiaGate,
  KonarkWheel,
  MeenakshiGopuram,
  MysorePalace,
  SanchiStupa,
} from "./monuments-more";

/**
 * Inline line-art silhouettes of Indian monuments for faint decorative
 * backdrops. Callers control size, colour (via `currentColor`), opacity and
 * placement. Architecture only: no text, flags, emblems or insignia.
 */

export type MonumentName =
  | "taj-mahal"
  | "qutub-minar"
  | "vidhana-soudha"
  | "gateway-of-india"
  | "charminar"
  | "hawa-mahal"
  | "india-gate"
  | "sanchi-stupa"
  | "konark-wheel"
  | "howrah-bridge"
  | "mysore-palace"
  | "meenakshi-gopuram";

export const monumentNames: readonly MonumentName[] = [
  "taj-mahal",
  "qutub-minar",
  "vidhana-soudha",
  "gateway-of-india",
  "charminar",
  "hawa-mahal",
  "india-gate",
  "sanchi-stupa",
  "konark-wheel",
  "howrah-bridge",
  "mysore-palace",
  "meenakshi-gopuram",
];

export {
  Charminar,
  HawaMahal,
  HowrahBridge,
  IndiaGate,
  KonarkWheel,
  MeenakshiGopuram,
  MysorePalace,
  SanchiStupa,
};

export function TajMahal(props: Props) {
  const id = useId();
  const half = `${id}-h`;
  return (
    <Frame {...props}>
      <g id={half}>
        {/* front minaret with three balconies and a chhatri cap */}
        <path d="M63 190 L67 60 H73 L77 190" />
        <path d="M60 150 H80 M61 118 H79 M62 88 H78" />
        <path d="M64 150 L60 146 H80 L76 150 M65 118 L61 114 H79 L75 118 M66 88 L62 84 H78 L74 88" />
        <path d="M65 60 A5 5 0 0 1 75 60 M64 60 H76 M70 55 V50" />
        {/* rear minaret, shorter, set behind the facade corner */}
        <path d="M90 190 L93 76 H99 L102 190" />
        <path d="M88 156 H104 M89 128 H103 M90 100 H102" />
        <path d="M92 76 A4 4 0 0 1 100 76 M96 72 V68" />
        {/* facade block */}
        <path d="M112 190 V122 H172" />
        {/* side arches: recessed tiers within a framing panel */}
        <path d="M120 186 V130 H166 V186" />
        <path d="M126 186 V172 A17 17 0 0 1 160 172 V186" />
        <path d="M126 162 V148 A17 17 0 0 1 160 148 V162 M126 162 H160" />
        {/* corner chhatri */}
        <path d="M128 122 V108 H154 V122 M134 122 V108 M148 122 V108" />
        <path d="M130 108 C130 96 140 92 141 90 C142 92 152 96 152 108 M141 90 V85" />
        {/* corner pinnacle */}
        <path d="M115 122 V112 M113 112 H117" />
      </g>
      <use href={`#${half}`} transform={MIRROR} />
      {/* central pishtaq with iwan arch */}
      <path d="M172 190 V108 H228 V190" />
      <path d="M182 186 V150 A28 28 0 0 1 200 126 A28 28 0 0 1 218 150 V186" />
      <path d="M177 108 V100 M223 108 V100 M172 114 H228" />
      {/* drum and onion dome */}
      <path d="M170 108 V96 H230 V108" />
      <path d="M170 96 C160 88 156 74 166 62 C178 48 192 44 200 34 C208 44 222 48 234 62 C244 74 240 88 230 96" />
      <path d="M200 34 V24 M197 27 H203 M198 20 A2 2 0 1 0 202 20 A2 2 0 1 0 198 20" />
      {/* plinth */}
      <path d="M56 190 H344 M50 200 H350 M56 190 L50 200 M344 190 L350 200" />
      {/* reflecting pool axis */}
      <path d="M120 212 H280 M90 224 H310" />
    </Frame>
  );
}

export function QutubMinar(props: Props) {
  const id = useId();
  const half = `${id}-h`;
  const cx = 150;
  return (
    <Frame {...props}>
      <g id={half}>
        {/* tapering shaft, five storeys */}
        <path d={`M${cx - 25} 200 L${cx - 18} 134`} />
        <path d={`M${cx - 17} 128 L${cx - 14} 99`} />
        <path d={`M${cx - 13} 93 L${cx - 11} 72`} />
        <path d={`M${cx - 10} 66 L${cx - 8.5} 50`} />
        <path d={`M${cx - 7.5} 45 L${cx - 6.5} 30`} />
        {/* balconies: projecting ring with corbel brackets */}
        <path d={`M${cx - 18} 141 L${cx - 25} 134 V129 H${cx} M${cx - 25} 134 H${cx}`} />
        <path d={`M${cx - 14} 105 L${cx - 20} 99 V94 H${cx} M${cx - 20} 99 H${cx}`} />
        <path d={`M${cx - 11} 77 L${cx - 16} 72 V67 H${cx} M${cx - 16} 72 H${cx}`} />
        <path d={`M${cx - 8.5} 54 L${cx - 13} 50 V46 H${cx} M${cx - 13} 50 H${cx}`} />
        {/* fluting on the three lower storeys */}
        <path d={`M${cx - 17} 196 L${cx - 12} 143 M${cx - 8.5} 196 L${cx - 6} 143`} />
        <path d={`M${cx - 11} 126 L${cx - 9} 107 M${cx - 5} 126 L${cx - 4.5} 107`} />
        <path d={`M${cx - 8} 91 L${cx - 7} 79 M${cx - 3} 91 L${cx - 2.5} 79`} />
        {/* base band */}
        <path d={`M${cx - 29} 200 V196 H${cx}`} />
      </g>
      <use href={`#${half}`} transform={`scale(-1 1) translate(${-2 * cx} 0)`} />
      {/* cupola */}
      <path d={`M${cx - 8} 30 H${cx + 8} M${cx - 6} 30 A6 6 0 0 1 ${cx + 6} 30 M${cx} 24 V19`} />
      {/* ruined arch of the Quwwat-ul-Islam screen */}
      <path d="M228 200 V160 L240 148 H252 L262 128 H302 L314 140 V152 L328 166 V200" />
      <path d="M252 200 V168 A32 32 0 0 1 282 138 A32 32 0 0 1 312 168 V200" />
      <path d="M258 200 V168 A26 26 0 0 1 282 145 A26 26 0 0 1 306 168 V200" />
      <path d="M236 168 H252 M312 168 H322 M236 182 H252 M312 182 H326 M262 136 H302" />
      {/* ground */}
      <path d="M40 200 H360" />
    </Frame>
  );
}

export function VidhanaSoudha(props: Props) {
  const id = useId();
  const half = `${id}-h`;
  return (
    <Frame {...props}>
      <g id={half}>
        {/* wing outline: two storeys with cornice and parapet */}
        <path d="M40 200 V132 H150 M40 132 V124 H150" />
        <path d="M44 124 V118 H144" />
        {/* wing pilasters and windows */}
        <path d="M54 132 V200 M68 132 V200 M82 132 V200 M96 132 V200 M110 132 V200 M124 132 V200 M138 132 V200" />
        <path d="M58 140 H64 V156 H58 Z M72 140 H78 V156 H72 Z M86 140 H92 V156 H86 Z M100 140 H106 V156 H100 Z M114 140 H120 V156 H114 Z M128 140 H134 V156 H128 Z" />
        <path d="M58 168 H64 V192 H58 Z M72 168 H78 V192 H72 Z M86 168 H92 V192 H86 Z M100 168 H106 V192 H100 Z M114 168 H120 V192 H114 Z M128 168 H134 V192 H128 Z" />
        <path d="M40 166 H150" />
        {/* wing end dome */}
        <path d="M44 118 V110 H60 V118 M46 110 C46 100 52 96 52 96 C52 96 58 100 58 110 M52 96 V90" />
        {/* central block: portico columns, entablature, corner domes */}
        <path d="M150 200 V104 H200 M150 96 H200 M150 104 V96" />
        <path d="M160 104 V172 M172 104 V172 M184 104 V172 M196 104 V172" />
        <path d="M160 108 H196 M158 172 H200" />
        <path d="M154 96 V84 H172 V96 M156 84 C156 74 163 70 163 70 C163 70 170 74 170 84 M163 70 V64" />
        {/* grand staircase */}
        <path d="M166 172 L150 200 M166 178 H200 M162 184 H200 M158 190 H200 M154 196 H200" />
      </g>
      <use href={`#${half}`} transform={MIRROR} />
      {/* central square base and Dravidian dome */}
      <path d="M174 96 V78 H226 V96 M170 78 H230 M178 78 V70 H222 V78" />
      <path d="M178 70 C178 52 190 44 200 44 C210 44 222 52 222 70" />
      <path d="M200 44 V34 M197 37 H203 M198 31 A2 2 0 1 0 202 31 A2 2 0 1 0 198 31" />
      <path d="M182 84 H218 M186 90 H214" />
      {/* doorway */}
      <path d="M190 172 V148 H210 V172" />
      {/* ground */}
      <path d="M24 200 H376" />
    </Frame>
  );
}

export function GatewayOfIndia(props: Props) {
  const id = useId();
  const half = `${id}-h`;
  return (
    <Frame {...props}>
      <g id={half}>
        {/* side hall block */}
        <path d="M92 200 V84 H152" />
        <path d="M98 84 V78 H152" />
        {/* side arch opening */}
        <path d="M104 200 V156 A24 24 0 0 1 122 138 A24 24 0 0 1 140 156 V200" />
        <path d="M100 200 V154 A28 28 0 0 1 122 132 A28 28 0 0 1 144 154 V200" />
        {/* lattice panel above the side arch */}
        <path d="M102 90 H142 V114 H102 Z" />
        <path d="M110 90 V114 M118 90 V114 M126 90 V114 M134 90 V114 M102 98 H142 M102 106 H142" />
        {/* outer corner turret */}
        <path d="M88 84 V70 H100 V84 M89 70 A5 5 0 0 1 99 70 M94 65 V61" />
        {/* central block corner turret */}
        <path d="M150 58 V44 H164 V58 M151 44 A6 6 0 0 1 163 44 M157 38 V33" />
        {/* parapet merlons */}
        <path d="M108 78 V74 H116 V78 M128 78 V74 H136 V78" />
        <path d="M172 58 V54 H180 V58 M190 58 V54 H198 V58" />
        {/* chajja and string courses */}
        <path d="M92 120 H152 M92 126 H152 M96 120 L98 126 M108 120 L110 126 M120 120 L122 126 M132 120 L134 126 M144 120 L146 126" />
      </g>
      <use href={`#${half}`} transform={MIRROR} />
      {/* central block and great arch */}
      <path d="M150 200 V58 H250 V200" />
      <path d="M168 200 V132 A42 42 0 0 1 200 98 A42 42 0 0 1 232 132 V200" />
      <path d="M162 200 V130 A48 48 0 0 1 200 90 A48 48 0 0 1 238 130 V200" />
      {/* band above the arch */}
      <path d="M160 68 H240 V80 H160 Z M172 68 V80 M186 68 V80 M200 68 V80 M214 68 V80 M228 68 V80" />
      {/* waterline */}
      <path d="M60 200 H340 M40 214 H360 M70 224 H120 M180 224 H240 M290 224 H330" />
    </Frame>
  );
}

export function Monument({
  name,
  ...props
}: { name: MonumentName } & Props) {
  switch (name) {
    case "taj-mahal":
      return <TajMahal {...props} />;
    case "qutub-minar":
      return <QutubMinar {...props} />;
    case "vidhana-soudha":
      return <VidhanaSoudha {...props} />;
    case "gateway-of-india":
      return <GatewayOfIndia {...props} />;
    case "charminar":
      return <Charminar {...props} />;
    case "hawa-mahal":
      return <HawaMahal {...props} />;
    case "india-gate":
      return <IndiaGate {...props} />;
    case "sanchi-stupa":
      return <SanchiStupa {...props} />;
    case "konark-wheel":
      return <KonarkWheel {...props} />;
    case "howrah-bridge":
      return <HowrahBridge {...props} />;
    case "mysore-palace":
      return <MysorePalace {...props} />;
    case "meenakshi-gopuram":
      return <MeenakshiGopuram {...props} />;
  }
}
