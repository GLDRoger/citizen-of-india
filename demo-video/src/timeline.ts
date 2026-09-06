import { z } from "zod";
import rawScript from "../content/script.json";

/** The film's beats, read from the same script the voiceover was generated from. */
const sceneSchema = z.object({
  id: z.string(),
  startFrame: z.number().int(),
  durationInFrames: z.number().int(),
  narration: z.string(),
});

export const FPS = 30;
export const TOTAL_FRAMES = 3600;

export const scenes = z.array(sceneSchema).parse(rawScript);

export type SceneId = (typeof scenes)[number]["id"];

export const sceneById = Object.fromEntries(scenes.map((scene) => [scene.id, scene])) as Record<
  SceneId,
  (typeof scenes)[number]
>;

/** Absolute frame of a moment inside a scene. */
export const at = (id: SceneId, offset: number) => sceneById[id].startFrame + offset;
