import { Video } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { colors, SceneWash } from "../components/Editorial";
import { bodyFont, displayFont } from "../fonts";
import { ClosingScene } from "./ClosingScene";

function ConsentAndLanguagePanels() {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.indigo,
        color: colors.paper,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 72, top: 80, width: 1130 }}>
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: colors.saffron,
          }}
        >
          Specific. Reversible.
        </div>
        <div
          style={{
            marginTop: 7,
            fontFamily: displayFont,
            fontSize: 54,
            fontWeight: 700,
            lineHeight: 0.95,
          }}
        >
          Shared access stays under the citizen&apos;s control.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 245,
          width: 1260,
          height: 710,
          overflow: "hidden",
          border: `10px solid ${colors.paper}`,
          boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
        }}
      >
        <Video
          muted
          onError={() => "fallback"}
          playbackRate={0.66}
          premountFor={30}
          src={staticFile("clips/12-revocable-access.mp4")}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 82,
          top: 105,
          width: 400,
          height: 865,
          overflow: "hidden",
          border: `10px solid ${colors.paper}`,
          borderRadius: 34,
          backgroundColor: colors.paper,
          boxShadow: "0 22px 60px rgba(0,0,0,0.32)",
        }}
      >
        <Video
          muted
          onError={() => "fallback"}
          playbackRate={0.72}
          premountFor={30}
          src={staticFile("clips/13-mobile-multilingual.mp4")}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 116,
          top: 76,
          padding: "10px 14px",
          backgroundColor: colors.saffron,
          color: colors.ink,
          fontFamily: bodyFont,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "0.08em",
        }}
      >
        EN · हिन्दी · ಕನ್ನಡ
      </div>
      <SceneWash tone="indigo" />
    </AbsoluteFill>
  );
}

export function ReachScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.indigo }}>
      <Sequence durationInFrames={360} premountFor={30}>
        <ConsentAndLanguagePanels />
      </Sequence>
      <Sequence from={360} durationInFrames={180} premountFor={30}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
}
