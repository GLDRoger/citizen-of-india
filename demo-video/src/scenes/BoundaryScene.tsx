import { AbsoluteFill } from "remotion";
import { Footage } from "../components/Footage";
import { PhaseTag, SceneWash, colors } from "../components/Editorial";

export function BoundaryScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, overflow: "hidden" }}>
      <Footage
        clip="14-service-boundary.mp4"
        playbackRate={0.68}
        scaleFrom={1.005}
        scaleTo={1.035}
      />
      <PhaseTag index="02" label="Where software stops" />
      <SceneWash />
    </AbsoluteFill>
  );
}
