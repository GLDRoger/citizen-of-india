import { AbsoluteFill } from "remotion";
import { Footage } from "../components/Footage";
import { colors, SceneWash } from "../components/Editorial";
import { SceneCursor } from "../components/SceneCursor";

export function IntentScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, overflow: "hidden" }}>
      <Footage
        clip="04-plain-language.mp4"
        playbackRate={0.67}
        scaleFrom={1.005}
        scaleTo={1.035}
      />
      <SceneCursor
        clicks={[88, 184]}
        points={[
          { frame: 10, x: 1180, y: 185 },
          { frame: 75, x: 1420, y: 255 },
          { frame: 88, x: 1420, y: 255 },
          { frame: 155, x: 1420, y: 585 },
          { frame: 184, x: 1420, y: 585 },
          { frame: 238, x: 1500, y: 700 },
        ]}
      />
      <SceneWash />
    </AbsoluteFill>
  );
}
