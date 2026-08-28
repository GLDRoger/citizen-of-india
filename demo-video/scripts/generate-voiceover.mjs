import { execFile } from "node:child_process";
import { Buffer } from "node:buffer";
import { readFile, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { z } from "zod";

const execFileAsync = promisify(execFile);
const fps = 30;
const model = "gemini-3.1-flash-tts-preview";
const voice = "Sulafat";
const language = "en-IN";
const apiUrl = "https://generativelanguage.googleapis.com/v1beta/interactions";

const sceneSchema = z.object({
  id: z.string().min(1),
  startFrame: z.number().int().nonnegative(),
  durationInFrames: z.number().int().positive(),
  endPaddingInFrames: z.number().int().nonnegative().optional(),
  maximumTempo: z.number().min(1).max(1.5).optional(),
  direction: z.string().min(1),
  narration: z.string().min(1),
  captions: z.array(z.string().min(1)).min(1),
});
const scriptSchema = z
  .array(sceneSchema)
  .length(10)
  .superRefine((scenes, context) => {
    const frames = scenes.reduce((expectedStart, scene) => {
      if (scene.startFrame !== expectedStart) {
        context.addIssue({
          code: "custom",
          message: `${scene.id} must start at frame ${expectedStart}, received ${scene.startFrame}.`,
        });
      }
      if (
        scene.endPaddingInFrames !== undefined &&
        scene.endPaddingInFrames >= scene.durationInFrames
      ) {
        context.addIssue({
          code: "custom",
          message: `${scene.id} end padding must be shorter than the scene.`,
        });
      }
      return scene.startFrame + scene.durationInFrames;
    }, 0);
    if (frames !== 3600) {
      context.addIssue({
        code: "custom",
        message: `The script must end at frame 3599, received ${frames - 1}.`,
      });
    }
  });
const interactionSchema = z.object({
  id: z.string(),
  model: z.string(),
  status: z.string(),
  steps: z.array(
    z.object({
      content: z.array(
        z.object({
          type: z.string(),
          data: z.string().optional(),
          channels: z.number().int().positive().optional(),
          sample_rate: z.number().int().positive().optional(),
          mime_type: z.string().optional(),
        }),
      ),
    }),
  ),
});

const script = scriptSchema.parse(
  JSON.parse(
    await readFile(new URL("../content/script.json", import.meta.url), "utf8"),
  ),
);
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is required. Export it in your shell before running npm run voiceover.",
  );
}

const requestedIds = new Set(
  (process.env.VOICEOVER_ONLY ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
);
const knownIds = new Set(script.map(({ id }) => id));
for (const id of requestedIds) {
  if (!knownIds.has(id)) {
    throw new Error(`Unknown VOICEOVER_ONLY scene: ${id}`);
  }
}
const selectedScenes = requestedIds.size
  ? script.filter(({ id }) => requestedIds.has(id))
  : script;

const voiceDirectory = new URL("../public/audio/voiceover/", import.meta.url);
const captionPath = new URL("../public/captions.json", import.meta.url);
const metadataPath = new URL(
  "../public/audio/voiceover/voiceover-meta.json",
  import.meta.url,
);
const workingDirectory = new URL("../.voiceover-work/", import.meta.url);

const durationOf = async (path) => {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    path,
  ]);
  return Number(stdout.trim());
};

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const speechTargetFor = (scene) =>
  (scene.durationInFrames - (scene.endPaddingInFrames ?? 21)) / fps;

const promptFor = (
  scene,
) => `Perform a single-speaker voiceover. Speak only the transcript.

# Audio profile
A warm, thoughtful Indian product storyteller speaking contemporary Indian English. Intelligent, grounded and quietly optimistic. Human and conversational, never theatrical or sales-like.

# Scene
This is one chapter of a two-minute hackathon demo for judges watching a working public-service prototype. The performance should carry a coherent argument across chapters.

# Director's notes
Timing: finish naturally within ${speechTargetFor(scene).toFixed(1)} seconds. Do not add words.
Pace: calm, direct, and confident, with purposeful pauses and varied sentence energy.
Articulation: clear and natural. Pronounce product and technology names carefully.
Delivery: ${scene.direction}

# Transcript begins
${scene.narration}
# Transcript ends
Stop speaking at the end marker.`;

const generateAudio = async (scene) => {
  const body = {
    model,
    input: promptFor(scene),
    response_format: { type: "audio" },
    generation_config: {
      speech_config: [{ voice, language }],
    },
  };

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await globalThis.fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const interaction = interactionSchema.parse(await response.json());
      const audio = interaction.steps
        .flatMap(({ content }) => content)
        .find(({ type, data }) => type === "audio" && data);
      if (audio?.data && audio.sample_rate && audio.channels) {
        return {
          interactionId: interaction.id,
          pcm: Buffer.from(audio.data, "base64"),
          sampleRate: audio.sample_rate,
          channels: audio.channels,
          mimeType: audio.mime_type ?? "audio/l16",
        };
      }
    } else if (response.status < 500 && response.status !== 429) {
      const detail = (await response.text()).slice(0, 500);
      throw new Error(
        `Gemini TTS rejected ${scene.id} with HTTP ${response.status}: ${detail}`,
      );
    }

    if (attempt < 3) {
      await sleep(1000 * 2 ** (attempt - 1));
    }
  }

  throw new Error(`Gemini TTS did not return audio for ${scene.id}.`);
};

const captionWordCount = (text) => text.trim().split(/\s+/u).length;
const makeCaptions = (scene, speechDuration) => {
  const sceneStartMs = (scene.startFrame / fps) * 1000;
  const captionStartMs = sceneStartMs + 220;
  const captionWindowMs = speechDuration * 1000;
  const totalWords = scene.captions.reduce(
    (total, text) => total + captionWordCount(text),
    0,
  );
  let elapsedMs = 0;

  return scene.captions.map((text, index) => {
    const durationMs = (captionWordCount(text) / totalWords) * captionWindowMs;
    const caption = {
      text,
      startMs: Math.round(captionStartMs + elapsedMs),
      endMs: Math.round(captionStartMs + elapsedMs + durationMs),
      timestampMs: null,
      confidence: 1,
      pageBreakAfter: index < scene.captions.length - 1,
    };
    elapsedMs += durationMs;
    return caption;
  });
};

await mkdir(voiceDirectory, { recursive: true });
await rm(workingDirectory, { recursive: true, force: true });
await mkdir(workingDirectory, { recursive: true });

const metadata = [];

try {
  for (const scene of selectedScenes) {
    const rawPath = join(workingDirectory.pathname, `${scene.id}.pcm`);
    const sourcePath = join(
      workingDirectory.pathname,
      `${scene.id}-source.wav`,
    );
    const outputPath = join(voiceDirectory.pathname, `${scene.id}.wav`);
    const generated = await generateAudio(scene);
    await writeFile(rawPath, generated.pcm);
    await execFileAsync("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-f",
      "s16le",
      "-ar",
      String(generated.sampleRate),
      "-ac",
      String(generated.channels),
      "-i",
      rawPath,
      "-c:a",
      "pcm_s16le",
      sourcePath,
    ]);

    const rawDuration = await durationOf(sourcePath);
    const sceneDuration = scene.durationInFrames / fps;
    const speechTarget = speechTargetFor(scene);
    const tempo = Math.max(1, rawDuration / speechTarget);
    const maximumTempo = scene.maximumTempo ?? 1.18;
    if (tempo > maximumTempo) {
      throw new Error(
        `${scene.id} generated at ${rawDuration.toFixed(2)}s and would need ${tempo.toFixed(2)}x time compression. Shorten the copy or request a faster delivery.`,
      );
    }
    const speechDuration = rawDuration / tempo;
    await execFileAsync("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      sourcePath,
      "-af",
      `atempo=${tempo.toFixed(6)},adelay=220:all=1,apad,atrim=duration=${sceneDuration.toFixed(3)},afade=t=in:st=0:d=0.08,afade=t=out:st=${Math.max(0, 0.22 + speechDuration - 0.16).toFixed(3)}:d=0.16,loudnorm=I=-17:TP=-1.5:LRA=9`,
      "-ar",
      "48000",
      "-ac",
      "1",
      "-c:a",
      "pcm_s16le",
      outputPath,
    ]);

    metadata.push({
      id: scene.id,
      model,
      voice,
      language,
      interactionId: generated.interactionId,
      mimeType: generated.mimeType,
      sourceDurationSeconds: Number(rawDuration.toFixed(3)),
      finalSpeechDurationSeconds: Number(speechDuration.toFixed(3)),
      tempo: Number(tempo.toFixed(4)),
    });
    process.stdout.write(
      `${scene.id}: ${rawDuration.toFixed(2)}s source, ${tempo.toFixed(3)}x tempo\n`,
    );
  }

  const durationById = new Map(
    metadata.map(({ id, finalSpeechDurationSeconds }) => [
      id,
      finalSpeechDurationSeconds,
    ]),
  );
  const captions = script.flatMap((scene) =>
    makeCaptions(scene, durationById.get(scene.id) ?? speechTargetFor(scene)),
  );
  await writeFile(captionPath, `${JSON.stringify(captions, null, 2)}\n`);
  await writeFile(
    metadataPath,
    `${JSON.stringify(
      {
        provider: "Google Gemini API",
        model,
        voice,
        language,
        generatedAt: new Date().toISOString(),
        sceneIds: script.map(({ id }) => id),
      },
      null,
      2,
    )}\n`,
  );
  process.stdout.write(
    `generated ${selectedScenes.length} Gemini voiceover scenes and ${captions.length} captions\n`,
  );
} finally {
  await rm(workingDirectory, { recursive: true, force: true });
}
