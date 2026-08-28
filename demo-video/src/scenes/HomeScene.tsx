import { AbsoluteFill } from "remotion";
import { Footage } from "../components/Footage";
import { colors, SceneWash } from "../components/Editorial";

export function HomeScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, overflow: "hidden" }}>
      <Footage
        clip="03-home-brief.mp4"
        playbackRate={1.05}
        scaleFrom={1.01}
        scaleTo={1.04}
        yFrom={0}
        yTo={-12}
      />
      <SceneWash />
    </AbsoluteFill>
  );
}
