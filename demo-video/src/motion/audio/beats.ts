/** Low-band onset autocorrelation estimate; phase is a beat-grid anchor, not verified musical bar position. */
export const BPM = 73.1707;
export const FIRST_DOWNBEAT_SECONDS = 0.17;
export const FIRST_DOWNBEAT_FRAME = 5.1000000000000005;
export const BEAT_FRAMES = 1800 / BPM;
export const nearestBeatFrame = (frame: number) =>
  Math.round(
    FIRST_DOWNBEAT_FRAME +
      Math.round((frame - FIRST_DOWNBEAT_FRAME) / BEAT_FRAMES) * BEAT_FRAMES,
  );
