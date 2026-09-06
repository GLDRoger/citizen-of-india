import "./index.css";
import { Composition } from "remotion";
import { MotionShowcase, SHOWCASE_FRAMES } from "./motion/MotionShowcase";
import { CitizenDemoComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <CitizenDemoComposition />
      <Composition
        id="MotionShowcase"
        component={MotionShowcase}
        durationInFrames={SHOWCASE_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
