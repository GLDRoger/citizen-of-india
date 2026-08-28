import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import type { CitizenDemoProps } from "./Composition";
import { CaptionLayer } from "./components/CaptionLayer";
import { colors } from "./components/Editorial";
import { ArchitectureScene } from "./scenes/ArchitectureScene";
import { BoundaryScene } from "./scenes/BoundaryScene";
import { EpfoScene } from "./scenes/EpfoScene";
import { GraphScene } from "./scenes/GraphScene";
import { HomeScene } from "./scenes/HomeScene";
import { IntentScene } from "./scenes/IntentScene";
import { MutationsScene } from "./scenes/MutationsScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { ReachScene } from "./scenes/ReachScene";
import { SafetyScene } from "./scenes/SafetyScene";

function VoiceoverTrack({ volume }: { volume: number }) {
  return (
    <>
      <Sequence durationInFrames={300} premountFor={30}>
        <Audio
          src={staticFile("audio/voiceover/problem.wav")}
          volume={volume}
        />
      </Sequence>
      <Sequence from={300} durationInFrames={300} premountFor={30}>
        <Audio src={staticFile("audio/voiceover/graph.wav")} volume={volume} />
      </Sequence>
      <Sequence from={600} durationInFrames={300} premountFor={30}>
        <Audio src={staticFile("audio/voiceover/home.wav")} volume={volume} />
      </Sequence>
      <Sequence from={900} durationInFrames={300} premountFor={30}>
        <Audio src={staticFile("audio/voiceover/intent.wav")} volume={volume} />
      </Sequence>
      <Sequence from={1200} durationInFrames={420} premountFor={30}>
        <Audio src={staticFile("audio/voiceover/epfo.wav")} volume={volume} />
      </Sequence>
      <Sequence from={1620} durationInFrames={360} premountFor={30}>
        <Audio
          src={staticFile("audio/voiceover/boundary.wav")}
          volume={volume}
        />
      </Sequence>
      <Sequence from={1980} durationInFrames={300} premountFor={30}>
        <Audio
          src={staticFile("audio/voiceover/architecture.wav")}
          volume={volume}
        />
      </Sequence>
      <Sequence from={2280} durationInFrames={420} premountFor={30}>
        <Audio
          src={staticFile("audio/voiceover/mutations.wav")}
          volume={volume}
        />
      </Sequence>
      <Sequence from={2700} durationInFrames={360} premountFor={30}>
        <Audio src={staticFile("audio/voiceover/safety.wav")} volume={volume} />
      </Sequence>
      <Sequence from={3060} durationInFrames={540} premountFor={30}>
        <Audio src={staticFile("audio/voiceover/reach.wav")} volume={volume} />
      </Sequence>
    </>
  );
}

function ClickTrack() {
  return (
    <>
      <Sequence from={986} durationInFrames={15} premountFor={10}>
        <Audio src={staticFile("audio/interface-click.mp3")} volume={0.2} />
      </Sequence>
      <Sequence from={1082} durationInFrames={15} premountFor={10}>
        <Audio src={staticFile("audio/interface-click.mp3")} volume={0.2} />
      </Sequence>
      <Sequence from={1234} durationInFrames={15} premountFor={10}>
        <Audio src={staticFile("audio/interface-click.mp3")} volume={0.17} />
      </Sequence>
      <Sequence from={1275} durationInFrames={15} premountFor={10}>
        <Audio src={staticFile("audio/interface-click.mp3")} volume={0.17} />
      </Sequence>
      <Sequence from={1308} durationInFrames={15} premountFor={10}>
        <Audio src={staticFile("audio/interface-click.mp3")} volume={0.17} />
      </Sequence>
      <Sequence from={1332} durationInFrames={15} premountFor={10}>
        <Audio src={staticFile("audio/interface-click.mp3")} volume={0.17} />
      </Sequence>
    </>
  );
}

function TransitionSoundTrack() {
  return (
    <>
      <Sequence from={1620} durationInFrames={20} premountFor={10}>
        <Audio src={staticFile("audio/transition-soft.mp3")} volume={0.16} />
      </Sequence>
      <Sequence from={3060} durationInFrames={20} premountFor={10}>
        <Audio src={staticFile("audio/transition-soft.mp3")} volume={0.14} />
      </Sequence>
    </>
  );
}

export function CitizenHackathonDemo({
  musicVolume,
  showCaptions,
  voiceoverVolume,
}: CitizenDemoProps) {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <Sequence durationInFrames={300} premountFor={30} name="01 Problem">
        <ProblemScene />
      </Sequence>
      <Sequence
        from={300}
        durationInFrames={300}
        premountFor={30}
        name="02 Citizen Graph"
      >
        <GraphScene />
      </Sequence>
      <Sequence
        from={600}
        durationInFrames={300}
        premountFor={30}
        name="03 Home"
      >
        <HomeScene />
      </Sequence>
      <Sequence
        from={900}
        durationInFrames={300}
        premountFor={30}
        name="04 Plain language"
      >
        <IntentScene />
      </Sequence>
      <Sequence
        from={1200}
        durationInFrames={420}
        premountFor={30}
        name="05 EPFO journey"
      >
        <EpfoScene />
      </Sequence>
      <Sequence
        from={1620}
        durationInFrames={360}
        premountFor={30}
        name="06 Public-service boundary"
      >
        <BoundaryScene />
      </Sequence>
      <Sequence
        from={1980}
        durationInFrames={300}
        premountFor={30}
        name="07 Citizen Graph system"
      >
        <ArchitectureScene />
      </Sequence>
      <Sequence
        from={2280}
        durationInFrames={420}
        premountFor={30}
        name="08 Action becomes history"
      >
        <MutationsScene />
      </Sequence>
      <Sequence
        from={2700}
        durationInFrames={360}
        premountFor={30}
        name="09 Honest simulation"
      >
        <SafetyScene />
      </Sequence>
      <Sequence
        from={3060}
        durationInFrames={540}
        premountFor={30}
        name="10 Consent, languages and closing"
      >
        <ReachScene />
      </Sequence>
      {showCaptions ? <CaptionLayer /> : null}
      <Audio
        src={staticFile("audio/music-bed.mp3")}
        volume={(frame) =>
          interpolate(
            frame,
            [0, 45, 600, 1200, 1620, 1980, 2700, 3060, 3420, 3599],
            [
              0,
              musicVolume * 0.62,
              musicVolume * 0.78,
              musicVolume * 0.7,
              musicVolume * 0.86,
              musicVolume * 0.78,
              musicVolume * 0.9,
              musicVolume * 0.72,
              musicVolume * 0.5,
              0,
            ],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
      <VoiceoverTrack volume={voiceoverVolume} />
      <ClickTrack />
      <TransitionSoundTrack />
    </AbsoluteFill>
  );
}
