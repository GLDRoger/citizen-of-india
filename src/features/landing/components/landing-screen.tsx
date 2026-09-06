"use client";

import Link from "next/link";
import { ArrowUpRight, Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CitizenGraphMap } from "@/components/citizen-graph-map";
import { PublicServiceBoundary } from "@/components/public-service-boundary";
import { GitHubMark } from "@/features/landing/components/github-mark";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { RichText } from "@/components/rich-text";
import { AskCitizen } from "@/features/landing/ask/ask-citizen";
import { AlreadyHere } from "./already-here";
import { CitizenFileObject } from "./citizen-file-object";
import { Faq } from "./faq";
import { BriefPreview } from "./figures/brief-preview";
import { LandingFooter, LandingHeader, githubUrl, musicUrl } from "./landing-header";
import { WhyPublic } from "./why-public";

const proofKeys: MessageKey[] = ["landingCurrentOne", "landingCurrentTwo", "landingCurrentThree", "landingCurrentFour"];
const visionKeys: MessageKey[] = ["landingVisionOne", "landingVisionTwo", "landingVisionThree", "landingVisionFour"];
const originItems: Array<{ body: MessageKey; title: MessageKey }> = [
  { body: "landingOriginChangedBody", title: "landingOriginChangedTitle" },
  { body: "landingOriginAppliesBody", title: "landingOriginAppliesTitle" },
  { body: "landingOriginNextBody", title: "landingOriginNextTitle" },
];
const surfaceItems: Array<{ body: MessageKey; title: MessageKey }> = [
  { body: "landingSurfaceOneBody", title: "landingSurfaceOneTitle" },
  { body: "landingSurfaceFourBody", title: "landingSurfaceFourTitle" },
  { body: "landingSurfaceTwoBody", title: "landingSurfaceTwoTitle" },
  { body: "landingSurfaceThreeBody", title: "landingSurfaceThreeTitle" },
];

const demoVideoUrl = "https://www.youtube-nocookie.com/embed/OuqARZ-FIg4?autoplay=1&rel=0";

function Hero({ onWatch }: { onWatch: () => void }) {
  const { t } = useI18n();
  return (
    <section className="overflow-hidden bg-indigo-deep text-paper">
      <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-center lg:gap-16 lg:pt-20">
        <div className="grid content-center gap-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-saffron"><RichText entrance="load" text={t("landingHeroKicker")} /></p>
          <h1 className="landing-hero-title max-w-[13ch] break-words font-display text-[3.1rem] font-semibold leading-[0.88] tracking-[-0.05em] sm:text-[clamp(3.8rem,6.6vw,6.4rem)]"><RichText entrance="load" text={t("landingHeroTitle")} /></h1>
          <p className="max-w-2xl text-base leading-8 text-paper/80 sm:text-lg sm:leading-8"><RichText entrance="load" text={t("landingHeroBody")} /></p>
          <div className="flex flex-wrap gap-3">
            <Link className="inline-flex min-h-12 items-center gap-2 rounded-[4px] bg-paper px-5 font-display text-sm font-semibold text-indigo-deep transition-colors hover:bg-saffron hover:text-ink" href="/start">
              {t("landingStart")}
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
            <button className="inline-flex min-h-12 items-center gap-2 rounded-[4px] border border-paper/35 px-5 font-display text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper/10" onClick={onWatch} type="button">
              <Play aria-hidden className="size-4 fill-current" />
              {t("landingWatchDemo")}
            </button>
            <a className="inline-flex min-h-12 items-center gap-2 rounded-[4px] border border-paper/35 px-5 font-display text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper/10" href={githubUrl} rel="noreferrer" target="_blank">
              <GitHubMark aria-hidden className="size-4" />
              {t("landingSourceCode")}
            </a>
          </div>
        </div>
        <div className="pt-6 lg:pt-0">
          <CitizenFileObject />
        </div>
      </div>
    </section>
  );
}

function OriginStory() {
  const { t } = useI18n();
  return (
    <section className="scroll-mt-16 border-b border-paper-line bg-paper-shade" id="origin">
      <div className="mx-auto grid w-full max-w-[1040px] gap-10 px-5 py-14 sm:px-8 lg:gap-14 lg:py-20">
        <div className="grid gap-4">
          <p className="text-sm font-bold text-indigo-deep">{t("landingOriginKicker")}</p>
          <h2 className="max-w-[18ch] font-display text-[clamp(2.7rem,5.4vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.045em]">{t("landingOriginTitle")}</h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-14">
          <div className="landing-reveal grid content-start gap-5">
            <p className="dropcap dropcap--indigo font-display text-2xl font-semibold leading-tight text-indigo-deep sm:text-3xl">{t("landingOriginBodyOne")}</p>
            <p className="border-l-4 border-saffron pl-5 text-lg font-bold leading-8 text-ink">{t("landingOriginDefinition")}</p>
          </div>
          <div className="grid content-start gap-5">
            <p className="text-base leading-8 text-ink-mute lg:pt-2">{t("landingOriginBodyTwo")}</p>
            <div className="landing-reveal grid gap-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-saffron">{t("landingBriefKicker")}</p>
              <BriefPreview />
            </div>
          </div>
        </div>
        <ol className="landing-reveal grid border-y border-paper-line md:grid-cols-3">
          {originItems.map(({ body, title }, index) => (
            <li className="grid content-start gap-3 border-b border-paper-line py-5 last:border-b-0 md:border-b-0 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0" key={title}>
              <span className="font-display text-sm font-bold text-saffron">0{index + 1}</span>
              <h3 className="font-display text-2xl font-semibold leading-tight">{t(title)}</h3>
              <p className="text-sm leading-6 text-ink-mute">{t(body)}</p>
            </li>
          ))}
        </ol>
        <p className="border-t border-paper-line pt-5 text-base font-bold leading-7 text-indigo-deep">{t("landingOriginProof")}</p>
        <div className="grid gap-3 text-xs leading-5 text-ink-mute sm:grid-cols-2 sm:gap-8">
          <p>{t("landingOriginNote")}</p>
          <p>{t("landingOriginDisclaimer")}</p>
        </div>
      </div>
    </section>
  );
}

function TheField() {
  const { t } = useI18n();
  return (
    <section className="scroll-mt-16 bg-paper-shade" id="field">
      <div className="mx-auto grid w-full max-w-[1040px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)] lg:gap-14 lg:py-20">
        <div className="grid content-start gap-4">
          <p className="text-sm font-bold text-indigo-deep">{t("landingFieldKicker")}</p>
          <h2 className="font-display text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.045em]">{t("landingBeyondTitle")}</h2>
          <p className="dropcap max-w-xl text-base leading-8 text-ink-mute">{t("landingBeyondBody")}</p>
        </div>
        <div className="landing-reveal grid content-start gap-6">
          <div className="border-y border-paper-line">
            {surfaceItems.map(({ body, title }) => (
              <div className="grid gap-1 border-b border-paper-line py-4 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-5" key={title}>
                <strong className="text-sm text-ink">{t(title)}</strong>
                <span className="text-sm leading-6 text-ink-mute">{t(body)}</span>
              </div>
            ))}
          </div>
          <p className="border-l-4 border-saffron pl-5 font-display text-xl font-semibold leading-snug text-indigo-deep sm:text-2xl"><RichText text={t("landingFieldClosing")} /></p>
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  const { t } = useI18n();
  return (
    <section className="mx-auto w-full max-w-[1040px] scroll-mt-16 px-5 py-14 sm:px-8 lg:py-20" id="project">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end lg:gap-14">
        <h2 className="font-display text-[clamp(3rem,6.5vw,5.7rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-indigo-deep">{t("landingProjectTitle")}</h2>
        <p className="text-base leading-8 text-ink-mute">{t("landingProjectBody")}</p>
      </div>
      <ol className="landing-reveal mt-10 border-y border-paper-line">
        {proofKeys.map((key, index) => (
          <li className="grid gap-2 border-b border-paper-line py-5 last:border-b-0 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-baseline" key={key}>
            <span className="font-display text-sm font-bold text-saffron">0{index + 1}</span>
            <span className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{t(key)}</span>
          </li>
        ))}
      </ol>
      <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-7 text-ink-mute">{t("landingBoundary")}</p>
        <Link className="inline-flex min-h-12 items-center gap-2 rounded-[4px] bg-indigo-deep px-5 font-display text-sm font-semibold text-paper transition-colors hover:bg-indigo" href="/start">
          {t("landingStart")}
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function VisionSection() {
  const { t } = useI18n();
  return (
    <section className="scroll-mt-16 bg-indigo-deep text-paper" id="vision">
      <div className="mx-auto w-full max-w-[1040px] px-5 py-16 sm:px-8 lg:py-20">
        <h2 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,5.25rem)] font-semibold leading-[0.92] tracking-[-0.045em]">{t("landingVisionTitle")}</h2>
        <p className="dropcap mt-7 max-w-3xl text-base leading-8 text-paper/80">{t("landingVisionBody")}</p>
        <ul className="landing-reveal mt-12 divide-y divide-paper/25 border-y border-paper/25">
          {visionKeys.map((key) => <li className="py-5 font-display text-xl font-semibold leading-7 sm:text-2xl" key={key}>{t(key)}</li>)}
        </ul>
        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]">{t("landingClosingTitle")}</p>
            <p className="mt-3 text-sm text-paper/65">{t("landingClosingBody")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="inline-flex min-h-12 items-center gap-2 rounded-[4px] bg-saffron px-5 font-display text-sm font-semibold text-ink transition-colors hover:bg-paper" href="/start">
              {t("landingStart")}
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
            <Link className="inline-flex min-h-12 items-center gap-2 rounded-[4px] border border-paper/35 px-5 font-display text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper/10" href="/manifesto">
              {t("landingWhyManifesto")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoVideoModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div aria-label={t("landingWatchDemoTitle")} aria-modal="true" className="fixed inset-0 z-[100] grid place-items-center bg-ink/85 p-3 backdrop-blur-sm sm:p-8" onClick={onClose} role="dialog">
      <div className="w-full max-w-5xl overflow-hidden rounded-[4px] bg-paper shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex min-h-14 items-center justify-between gap-4 border-b border-paper-line px-4 sm:px-5">
          <h2 className="font-display text-lg font-semibold text-indigo-deep sm:text-xl">{t("landingWatchDemoTitle")}</h2>
          <button aria-label={t("close")} className="grid size-11 shrink-0 place-items-center text-ink-mute transition-colors hover:bg-paper-shade hover:text-ink" onClick={onClose} type="button"><X aria-hidden className="size-5" /></button>
        </div>
        <div className="aspect-video bg-ink"><iframe allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen className="size-full border-0" src={demoVideoUrl} title={t("landingWatchDemoTitle")} /></div>
        <p className="px-4 py-3 text-xs leading-5 text-ink-mute sm:px-5">
          {t("landingMusicCreditPrefix")}{" "}
          <a className="font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4" href={musicUrl} rel="noreferrer" target="_blank">Bombay Summer by Shane Ivers</a>
          {" · "}
          <a className="font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4" href="https://creativecommons.org/licenses/by/4.0/" rel="noreferrer" target="_blank">CC BY 4.0</a>
        </p>
      </div>
    </div>
  );
}

export function LandingScreen() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  return (
    <main className="break-words bg-paper text-ink">
      <LandingHeader />
      <Hero onWatch={() => setIsVideoOpen(true)} />
      <ProofSection />
      <CitizenGraphMap id="graph" mode="journey" />
      <OriginStory />
      <WhyPublic id="why" />
      <AlreadyHere id="here" />
      <TheField />
      <PublicServiceBoundary id="problem" />
      <Faq id="faq" />
      <VisionSection />
      <LandingFooter />
      {isVideoOpen ? <DemoVideoModal onClose={() => setIsVideoOpen(false)} /> : null}
      <AskCitizen />
    </main>
  );
}
