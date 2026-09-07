"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";

const beats = [
  { title: "continuityProblem", body: "continuityProblemBody" },
  { title: "continuityImprovement", body: "continuityImprovementBody" },
  { title: "continuityProof", body: "continuityProofBody" },
] as const;

export function ContinuitySection() {
  const { t } = useI18n();
  return (
    <section className="scroll-mt-16 border-b border-paper-line bg-paper-shade" id="continuity">
      <div className="mx-auto grid w-full max-w-[1040px] gap-8 px-5 py-14 sm:px-8 sm:py-20">
        <header className="grid gap-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-green-deep">{t("continuityKicker")}</p>
          <h2 className="max-w-[22ch] font-display text-[clamp(2.7rem,5.4vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-indigo-deep">{t("continuityTitle")}</h2>
          <p className="max-w-2xl text-base leading-8 text-ink-mute">{t("continuityIntro")}</p>
        </header>
        <ol className="grid gap-6 border-y border-paper-line py-6 md:grid-cols-3 md:gap-8">{beats.map((beat, index) => <li className="grid content-start gap-3" key={beat.title}>
          <span className="font-display text-sm font-bold text-green-deep">0{index + 1}</span>
          <h3 className="font-display text-xl font-semibold leading-tight text-ink">{t(beat.title)}</h3>
          <p className="text-sm leading-7 text-ink-mute">{t(beat.body)}</p>
        </li>)}</ol>
        <p className="max-w-3xl font-display text-2xl font-semibold leading-snug text-indigo-deep">{t("continuityFocus")}</p>
        <div className="grid gap-4 justify-items-start">
          <Link className="inline-flex min-h-12 items-center gap-3 rounded-[3px] bg-green-deep px-5 py-3 text-sm font-bold text-paper hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-deep" href="/start#routes">{t("continuityTry")}<ArrowRight aria-hidden className="size-4 shrink-0" /></Link>

        </div>
        <aside aria-labelledby="continuity-family-heading" className="grid gap-4 border-t border-paper-line pt-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8">
          <div className="grid gap-3">
            <h3 className="font-display text-2xl font-semibold leading-tight text-indigo-deep" id="continuity-family-heading">{t("continuityFamilyTitle")}</h3>
            <p className="max-w-2xl text-sm leading-7 text-ink-mute">{t("continuityFamilyBody")}</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-self-start gap-3 text-sm font-bold text-indigo-deep underline underline-offset-4 hover:text-green-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-deep" href="/start#route-family">{t("continuityFamilyTry")}<ArrowRight aria-hidden className="size-4 shrink-0" /></Link>
        </aside>
      </div>
    </section>
  );
}
