import { AbsoluteFill } from "remotion";
import { Footage } from "../components/Footage";
import { EditorialCard, SceneWash, colors } from "../components/Editorial";

export function MutationsScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, overflow: "hidden" }}>
      <Footage
        clip="10-payment-receipt.mp4"
        playbackRate={0.7}
        scaleFrom={1.005}
        scaleTo={1.03}
      />
      <EditorialCard
        eyebrow="One action · one record"
        title="Money, receipt and history move together."
      >
        <div style={{ color: colors.indigo }}>₹500 paid</div>
        <div>Receipt saved in Documents</div>
        <div>Activity records the payment</div>
      </EditorialCard>
      <SceneWash />
    </AbsoluteFill>
  );
}
