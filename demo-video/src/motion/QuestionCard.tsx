import { displayFont } from "../fonts";
import { palette as c } from "./core";
import { Sheet } from "./Sheet";
export type QuestionCardProps = {
  question: string;
  at?: number;
  hold?: number;
  width?: number;
  fontSize?: number;
};
export function QuestionCard({
  question,
  at = 0,
  hold = 75,
  width = 1500,
  fontSize = 104,
}: QuestionCardProps) {
  return (
    <Sheet
      enterAt={at}
      exitAt={at + 22 + hold}
      style={{ width, boxSizing: "border-box", padding: "55px 65px" }}
    >
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 3,
          color: c.mute,
          marginBottom: 30,
        }}
      >
        FAIR QUESTION
      </div>
      <div
        style={{
          fontFamily: displayFont,
          fontSize,
          fontWeight: 800,
          lineHeight: 1.05,
          color: c.ink,
          textWrap: "balance",
        }}
      >
        {question}
      </div>
    </Sheet>
  );
}
