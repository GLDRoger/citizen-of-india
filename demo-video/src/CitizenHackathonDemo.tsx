import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import type { CitizenDemoProps } from "./Composition";
import { CaptionLayer } from "./components/CaptionLayer";
import { CutFlash } from "./components/CutFlash";
import { QuestionTrack } from "./components/QuestionTrack";
import { colors } from "./components/Editorial";
import { AfterRoundOne } from "./scenes/AfterRoundOne";
import { Challan } from "./scenes/Challan";
import { Close } from "./scenes/Close";
import { Delegation } from "./scenes/Delegation";
import { Home } from "./scenes/Home";
import { Marriage } from "./scenes/Marriage";
import { Problem } from "./scenes/Problem";
import { Thesis } from "./scenes/Thesis";
import { Timeline } from "./scenes/Timeline";
import { Umang } from "./scenes/Umang";
import { Wrong } from "./scenes/Wrong";
import { cues, impactFrames } from "./cues";
import { Hit } from "./motion/audio/Sfx";
import { musicVolume, sidechainDip } from "./motion/audio/ducking";
import { scenes, TOTAL_FRAMES } from "./timeline";

const sceneComponents: Record<string, React.FC> = {
  problem: Problem,
  thesis: Thesis,
  home: Home,
  challan: Challan,
  marriage: Marriage,
  "after-round-one": AfterRoundOne,
  umang: Umang,
  delegation: Delegation,
  wrong: Wrong,
  timeline: Timeline,
  close: Close,
};

function VoiceoverTrack({ volume }: { volume: number }) {
  return (
    <>
      {scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationInFrames}
          premountFor={30}
          name={`vo ${scene.id}`}
        >
          <Audio src={staticFile(`audio/voiceover/${scene.id}.wav`)} volume={volume} />
        </Sequence>
      ))}
    </>
  );
}

export function CitizenHackathonDemo({ musicVolume: musicVolumeBase, showCaptions, voiceoverVolume }: CitizenDemoProps) {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      {scenes.map((scene, index) => {
        const Scene = sceneComponents[scene.id];
        return (
          <Sequence
            key={scene.id}
            from={scene.startFrame}
            durationInFrames={scene.durationInFrames}
            premountFor={30}
            name={`${String(index + 1).padStart(2, "0")} ${scene.id}`}
          >
            <Scene />
          </Sequence>
        );
      })}
      <QuestionTrack />
      <CutFlash />
      {showCaptions ? <CaptionLayer /> : null}
      <Audio
        src={staticFile("audio/music-bed.mp3")}
        volume={(frame) =>
          interpolate(frame, [0, 45, TOTAL_FRAMES - 150, TOTAL_FRAMES - 1], [0, 1, 0.7, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }) * musicVolume(frame, musicVolumeBase) * sidechainDip(frame, impactFrames)
        }
      />
      <VoiceoverTrack volume={voiceoverVolume} />
      {cues.map((cue, index) => <Hit at={cue.frame} gain={cue.gain} key={`${cue.sound}-${index}`} sound={cue.sound} />)}
    </AbsoluteFill>
  );
}
