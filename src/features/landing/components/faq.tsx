"use client";

import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { RichText } from "@/components/rich-text";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

const questions: Array<{ answer: MessageKey; question: MessageKey }> = [
  { answer: "landingFaqOneA", question: "landingFaqOneQ" },
  { answer: "landingFaqTwoA", question: "landingFaqTwoQ" },
  { answer: "landingFaqThreeA", question: "landingFaqThreeQ" },
  { answer: "landingFaqFourA", question: "landingFaqFourQ" },
  { answer: "landingFaqFiveA", question: "landingFaqFiveQ" },
  { answer: "landingFaqSixA", question: "landingFaqSixQ" },
  { answer: "landingFaqSevenA", question: "landingFaqSevenQ" },
  { answer: "landingFaqEightA", question: "landingFaqEightQ" },
];

/**
 * The objections judges and engineers raise first, answered as a ledger of
 * native disclosure rows. The first one is open so the section never reads as
 * a wall of closed drawers.
 */
export function Faq({ id }: { id?: string }) {
  const { t } = useI18n();
  return (
    <section className="scroll-mt-16 border-t border-paper-line bg-paper-shade" id={id}>
      <div className="mx-auto grid w-full max-w-[1040px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)] lg:gap-14 lg:py-20">
        <div className="grid content-start gap-4 lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm font-bold text-indigo-deep">{t("landingFaqKicker")}</p>
          <h2 className="font-display text-[clamp(2.7rem,5vw,4.2rem)] font-semibold leading-[0.95] tracking-[-0.045em]"><RichText text={t("landingFaqTitle")} /></h2>
          <p className="max-w-sm text-base leading-8 text-ink-mute">{t("landingFaqBody")}</p>
          <Link className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4" href="/about">
            {t("landingFaqAbout")}
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>
        <div className="landing-reveal border-t-2 border-ink">
          {questions.map(({ answer, question }, index) => (
            <details className="group border-b border-paper-line" key={question} open={index === 0}>
              <summary className="grid min-h-14 cursor-pointer list-none grid-cols-[2.4rem_minmax(0,1fr)_2rem] items-baseline gap-3 py-5 font-display text-xl font-semibold leading-tight text-ink marker:content-none sm:text-2xl [&::-webkit-details-marker]:hidden">
                <span className="font-sans text-sm font-bold text-saffron">0{index + 1}</span>
                <span>{t(question)}</span>
                <Plus aria-hidden className="size-5 justify-self-end self-center text-indigo-deep transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="pb-6 pr-2 text-base leading-8 text-ink-mute sm:pl-[3.15rem] sm:pr-10"><RichText text={t(answer)} /></p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
