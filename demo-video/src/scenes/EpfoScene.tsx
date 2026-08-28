import { AbsoluteFill } from "remotion";
import { Footage } from "../components/Footage";
import { colors, SceneWash } from "../components/Editorial";
import { SceneCursor } from "../components/SceneCursor";

export function EpfoScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, overflow: "hidden" }}>
      <Footage
        clip="05-epfo-journey.mp4"
        playbackRate={0.93}
        scaleFrom={1.005}
        scaleTo={1.028}
      />
      <SceneCursor
        clicks={[34, 75, 108, 132]}
        points={[
          { frame: 20, x: 960, y: 735 },
          { frame: 34, x: 960, y: 735 },
          { frame: 75, x: 715, y: 735 },
          { frame: 108, x: 455, y: 772 },
          { frame: 132, x: 960, y: 900 },
          { frame: 230, x: 555, y: 665 },
          { frame: 320, x: 1090, y: 450 },
          { frame: 390, x: 1280, y: 460 },
        ]}
      />
      <SceneWash />
    </AbsoluteFill>
  );
}
