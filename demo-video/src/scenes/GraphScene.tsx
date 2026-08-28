import { AbsoluteFill } from "remotion";
import { Footage } from "../components/Footage";
import { PhaseTag, SceneWash, colors } from "../components/Editorial";

export function GraphScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, overflow: "hidden" }}>
      <Footage
        clip="02-citizen-graph.mp4"
        playbackRate={0.75}
        scaleFrom={1.005}
        scaleTo={1.03}
      />
      <PhaseTag index="02" label="How this started" />
      <SceneWash />
    </AbsoluteFill>
  );
}
