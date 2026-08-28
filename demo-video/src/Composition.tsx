import { Composition } from "remotion";
import { z } from "zod";
import { CitizenHackathonDemo } from "./CitizenHackathonDemo";

export const citizenDemoSchema = z.object({
  showCaptions: z.boolean(),
  voiceoverVolume: z.number().min(0).max(1),
  musicVolume: z.number().min(0).max(1),
});

export type CitizenDemoProps = z.infer<typeof citizenDemoSchema>;

export function CitizenDemoComposition() {
  return (
    <Composition
      id="CitizenHackathonDemo"
      component={CitizenHackathonDemo}
      durationInFrames={3600}
      fps={30}
      width={1920}
      height={1080}
      schema={citizenDemoSchema}
      defaultProps={{
        showCaptions: true,
        voiceoverVolume: 1,
        musicVolume: 0.62,
      }}
    />
  );
}
