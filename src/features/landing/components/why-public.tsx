"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RichText } from "@/components/rich-text";
import { CroreGrid } from "./figures/crore-grid";
import { DataFlowFigure } from "./figures/data-flow";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

interface Contrast {
  label: MessageKey;
  privateSide: MessageKey;
  publicSide: MessageKey;
}

const contrasts: Contrast[] = [
  { label: "landingWhyEarnsLabel", privateSide: "landingWhyEarnsPrivate", publicSide: "landingWhyEarnsPublic" },
  { label: "landingWhyKnowsLabel", privateSide: "landingWhyKnowsPrivate", publicSide: "landingWhyKnowsPublic" },
  { label: "landingWhyRecordLabel", privateSide: "landingWhyRecordPrivate", publicSide: "landingWhyRecordPublic" },
  { label: "landingWhyDoneLabel", privateSide: "landingWhyDonePrivate", publicSide: "landingWhyDonePublic" },
];

/**
 * The argument for a public super app, as a ledger: the same four questions
 * answered by a private super app and by Citizen. Two columns, one rule per
 * row, no cards. The public column is set in indigo so the eye lands on it.
 */
export function WhyPublic({ id }: { id?: string }) {
  const { t } = useI18n();
  return (
    <section className="scroll-mt-16 border-b border-paper-line bg-paper" id={id}>
      <div className="mx-auto grid w-full max-w-[1040px] gap-10 px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-center lg:gap-14">
          <div className="grid gap-5">
            <p className="text-sm font-bold text-indigo-deep">{t("landingWhyKicker")}</p>
            <h2 className="max-w-[16ch] font-display text-[clamp(2.7rem,5.4vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.045em]"><RichText text={t("landingWhyTitle")} /></h2>
            <p className="dropcap max-w-2xl text-base leading-8 text-ink-mute"><RichText text={t("landingWhyBody")} /></p>
          </div>
          <div className="landing-reveal"><DataFlowFigure /></div>
        </div>

        <div className="landing-reveal grid" role="table">
          <div className="hidden grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)] gap-6 border-b-2 border-ink pb-3 text-xs font-extrabold uppercase tracking-[0.12em] sm:grid" role="row">
            <span aria-hidden />
            <span className="text-brick" role="columnheader">{t("landingWhyPrivate")}</span>
            <span className="text-green-deep" role="columnheader">{t("landingWhyPublic")}</span>
          </div>
          {contrasts.map((row) => (
            <div className="grid gap-2 border-b border-paper-line py-5 sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-6" key={row.label} role="row">
              <span className="text-sm font-bold text-ink" role="rowheader">{t(row.label)}</span>
              <span className="grid gap-0.5 text-base leading-7 text-ink-mute" role="cell">
                <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-brick sm:hidden">{t("landingWhyPrivateShort")}</span>
                {t(row.privateSide)}
              </span>
              <span className="grid gap-0.5 font-display text-xl font-semibold leading-7 text-indigo-deep" role="cell">
                <span className="font-sans text-xs font-extrabold uppercase tracking-[0.12em] text-green-deep sm:hidden">{t("landingWhyPublic")}</span>
                {t(row.publicSide)}
              </span>
            </div>
          ))}
        </div>

        <div className="grid gap-6 border-l-4 border-saffron pl-5 sm:pl-7">
          <p className="max-w-4xl font-display text-[1.7rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[2.6rem]"><RichText text={t("landingWhyUpi")} /></p>
          <CroreGrid />
          <p className="max-w-3xl font-display text-xl font-semibold leading-tight text-indigo-deep sm:text-2xl"><RichText text={t("landingWhyClosing")} /></p>
          <Link className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4" href="/manifesto">
            {t("landingWhyManifesto")}
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
