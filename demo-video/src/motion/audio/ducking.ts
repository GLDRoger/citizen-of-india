import gains from "./voice-gain.json";
/** Film-absolute frame; -12dB speech floor, 6f anticipatory attack / 20f release. */
export const musicVolume = (frame: number, base: number) =>
  base * (gains[Math.floor(frame)] ?? 1);
/** Multiplicative gain: -9dB for ten frames, then a fourteen-frame recovery. */
export function sidechainDip(frame: number, hitFrames: readonly number[]) {
  const floor = 10 ** (-9 / 20);
  return hitFrames.reduce((gain, hit) => {
    const d = frame - hit;
    return d < 0 || d >= 24
      ? gain
      : Math.min(gain, d < 10 ? floor : floor + ((1 - floor) * (d - 10)) / 14);
  }, 1);
}
