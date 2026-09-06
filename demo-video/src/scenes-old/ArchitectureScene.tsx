import { AbsoluteFill } from "remotion";
import { Footage } from "../components/Footage";
import { SceneWash, colors } from "../components/Editorial";

export function ArchitectureScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, overflow: "hidden" }}>
      <Footage
        clip="15-graph-assemble.mp4"
        playbackRate={1}
        scaleFrom={1.005}
        scaleTo={1.025}
      />
      <SceneWash />
    </AbsoluteFill>
  );
}
