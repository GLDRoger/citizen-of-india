import { AbsoluteFill, Sequence } from "remotion";
import { QuestionCard } from "../motion/QuestionCard";
import { at } from "../timeline";

/**
 * The five fair questions, on their own track so each card slams in during the
 * tail of the previous line and is already standing when the voice answers it.
 * Frames are absolute. A card takes 22 frames to enter, holds, then exits in 16.
 */
export const questions = [
  { id: "umang", frame: at("after-round-one", 440), hold: 40, text: "Isn't this just UMANG or DigiLocker again?" },
  { id: "shared-phone", frame: at("umang", 386), hold: 40, text: "What about a shared phone, and a grandmother who never typed?" },
  { id: "privacy", frame: at("delegation", 262), hold: 36, text: "One record of everything — what about privacy?" },
  { id: "wrong", frame: at("delegation", 420), hold: 30, text: "What happens when a department gets it wrong?" },
  { id: "too-big", frame: at("timeline", 166), hold: 44, text: "Isn't this too big to build?" },
] as const;

/** Frame at which each card lands (for the hit). */
export const questionLandingFrames = questions.map((question) => question.frame + 20);

export function QuestionTrack() {
  return (
    <>
      {questions.map((question) => (
        <Sequence key={question.id} from={question.frame} durationInFrames={question.hold + 60} name={`question ${question.id}`}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <QuestionCard question={question.text} at={0} hold={question.hold} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </>
  );
}
