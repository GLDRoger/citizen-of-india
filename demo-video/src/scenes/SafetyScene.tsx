import { AbsoluteFill, Sequence } from "remotion";
import { Footage } from "../components/Footage";
import { EditorialCard, SceneWash, colors } from "../components/Editorial";

export function SafetyScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, overflow: "hidden" }}>
      <Sequence
        durationInFrames={180}
        premountFor={30}
        name="Simulated response"
      >
        <Footage
          clip="16-simulated-response.mp4"
          playbackRate={0.9}
          scaleFrom={1.005}
          scaleTo={1.03}
        />
      </Sequence>
      <Sequence
        from={180}
        durationInFrames={180}
        premountFor={30}
        name="Public-service boundary"
      >
        <Footage
          clip="17-about-boundary.mp4"
          playbackRate={0.85}
          trimBefore={18}
          scaleFrom={1.005}
          scaleTo={1.03}
        />
      </Sequence>
      <EditorialCard
        eyebrow="Honest simulation"
        title="No live government call."
      >
        <div>active profile only</div>
        <div>
          <code style={{ color: colors.indigo }}>
            {"{ simulated: true, authority }"}
          </code>
        </div>
        <div>deterministic latency + references</div>
      </EditorialCard>
      <SceneWash />
    </AbsoluteFill>
  );
}
