"use client";

import Link from "next/link";
import { ArrowUpRight, Info, Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CitizenGraphExplainer } from "@/components/citizen-graph-explainer";
import { CitizenGraphMap } from "@/components/citizen-graph-map";
import { CitizenMark } from "@/components/citizen-mark";
import { PublicServiceBoundary } from "@/components/public-service-boundary";
import { useAuthStore } from "@/features/auth/store";
import { GitHubMark } from "@/features/landing/components/github-mark";
import {
  languageLabels,
  languages,
  type Language,
  type MessageKey,
} from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";

const proofKeys: MessageKey[] = [
  "landingCurrentOne",
  "landingCurrentTwo",
  "landingCurrentThree",
  "landingCurrentFour",
];
const visionKeys: MessageKey[] = [
  "landingVisionOne",
  "landingVisionTwo",
  "landingVisionThree",
  "landingVisionFour",
];
const originItems: Array<{ body: MessageKey; title: MessageKey }> = [
  { body: "landingOriginChangedBody", title: "landingOriginChangedTitle" },
  { body: "landingOriginAppliesBody", title: "landingOriginAppliesTitle" },
  { body: "landingOriginNextBody", title: "landingOriginNextTitle" },
];

const demoVideoUrl = "https://www.youtube-nocookie.com/embed/OuqARZ-FIg4?autoplay=1&rel=0";
const githubUrl = "https://github.com/GLDRoger/citizen-of-india";
const musicUrl = "https://www.silvermansound.com/free-music/bombay-summer";

function chooseLanguage(value: string): Language | undefined {
  return value === "en" || value === "hi" || value === "kn" ? value : undefined;
}

function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { language, t } = useI18n();
  const setLanguage = useAuthStore((state) => state.setLanguage);
  if (compact) {
    return (
      <select
        aria-label={t("language")}
        className="min-h-11 w-[5.25rem] rounded-[4px] border border-paper/25 bg-indigo-deep px-2 text-xs font-bold text-paper sm:hidden"
        onChange={(event) => {
          const next = chooseLanguage(event.target.value);
          if (next) setLanguage(next);
        }}
        value={language}
      >
        {languages.map((option) => (
          <option key={option} value={option}>
            {languageLabels[option]}
          </option>
        ))}
      </select>
    );
  }
  return (
    <div
      aria-label={t("language")}
      className="hidden items-center gap-1 sm:flex"
    >
      {languages.map((option) => (
        <button
          aria-pressed={language === option}
          className={cn(
            "min-h-11 rounded-[4px] px-2.5 text-xs font-bold transition-colors",
            language === option
              ? "bg-paper text-indigo-deep"
              : "text-paper/65 hover:text-paper",
          )}
          key={option}
          onClick={() => setLanguage(option)}
          type="button"
        >
          {languageLabels[option]}
        </button>
      ))}
    </div>
  );
}

function LandingHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-50 border-b border-paper/15 bg-indigo-deep/96 text-paper backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-[1180px] items-center justify-between gap-3 px-5 sm:px-8">
        <Link
          className="flex items-center gap-2 font-display text-xl font-extrabold tracking-[0.02em]"
          href="/"
        >
          <CitizenMark className="size-7 text-saffron" />
          {t("brand").toUpperCase()}
        </Link>
        <nav
          aria-label={t("primaryNavigation")}
          className="hidden items-center gap-8 text-xs font-bold text-paper/65 lg:flex"
        >
          <a className="hover:text-paper" href="#graph">
            {t("landingGraphNav")}
          </a>
          <a className="hover:text-paper" href="#problem">
            {t("landingProblemNav")}
          </a>
          <a className="hover:text-paper" href="#project">
            {t("landingJourneyNav")}
          </a>
          <a className="hover:text-paper" href="#vision">
            {t("landingVisionNav")}
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            aria-label={t("information")}
            className="flex min-h-11 items-center gap-2 rounded-[4px] border border-paper/25 px-3 text-xs font-bold text-paper/72 transition-colors hover:bg-paper/10 hover:text-paper"
            href="/about"
          >
            <Info aria-hidden className="size-4" />
            <span className="hidden xl:inline">{t("information")}</span>
          </Link>
          <LanguageSwitch compact />
          <LanguageSwitch />
          <Link
            className="hidden min-h-11 items-center gap-2 rounded-[4px] bg-saffron px-4 font-display text-xs font-semibold text-ink transition-colors hover:bg-paper sm:inline-flex"
            href="/start"
          >
            {t("landingStart")}
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function OriginStory() {
  const { t } = useI18n();
  return (
    <section className="scroll-mt-16 border-b border-paper-line bg-paper-shade" id="origin">
      <div className="mx-auto grid w-full max-w-[1040px] gap-10 px-5 py-14 sm:px-8 lg:gap-14 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)] lg:gap-14">
          <div className="grid content-start gap-4">
            <p className="text-sm font-bold text-indigo-deep">
              {t("landingOriginKicker")}
            </p>
            <h2 className="font-display text-[clamp(2.9rem,6vw,5.4rem)] font-semibold leading-[0.9] tracking-[-0.05em]">
              {t("landingOriginTitle")}
            </h2>
          </div>
          <div className="grid content-start gap-5">
            <p className="font-display text-2xl font-semibold leading-tight text-indigo-deep sm:text-3xl">
              {t("landingOriginBodyOne")}
            </p>
            <p className="text-base leading-8 text-ink-mute">
              {t("landingOriginBodyTwo")}
            </p>
            <p className="border-l-4 border-saffron pl-5 text-lg font-bold leading-8 text-ink">
              {t("landingOriginDefinition")}
            </p>
          </div>
        </div>
        <ol className="grid border-y border-paper-line md:grid-cols-3">
          {originItems.map(({ body, title }, index) => (
            <li
              className="grid content-start gap-3 border-b border-paper-line py-5 last:border-b-0 md:border-b-0 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0"
              key={title}
            >
              <span className="font-display text-sm font-bold text-saffron">
                0{index + 1}
              </span>
              <h3 className="font-display text-2xl font-semibold leading-tight">
                {t(title)}
              </h3>
              <p className="text-sm leading-6 text-ink-mute">{t(body)}</p>
            </li>
          ))}
        </ol>
        <div className="grid gap-3 border-t border-paper-line pt-5 text-xs leading-5 text-ink-mute sm:grid-cols-2 sm:gap-8">
          <p>{t("landingOriginNote")}</p>
          <p>{t("landingOriginDisclaimer")}</p>
        </div>
      </div>
    </section>
  );
}

function BeyondTheSurface() {
  const { t } = useI18n();
  const surfaceItems: Array<{ body: MessageKey; title: MessageKey }> = [
    { body: "landingSurfaceOneBody", title: "landingSurfaceOneTitle" },
    { body: "landingSurfaceTwoBody", title: "landingSurfaceTwoTitle" },
    { body: "landingSurfaceThreeBody", title: "landingSurfaceThreeTitle" },
  ];
  return (
    <section className="bg-paper-shade" id="approach">
      <div className="mx-auto grid w-full max-w-[1040px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)] lg:gap-14 lg:py-20">
        <div className="grid content-start gap-4">
          <p className="text-sm font-bold text-indigo-deep">
            {t("landingBeyondKicker")}
          </p>
          <h2 className="font-display text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.045em]">
            {t("landingBeyondTitle")}
          </h2>
          <p className="max-w-xl text-base leading-8 text-ink-mute">
            {t("landingBeyondBody")}
          </p>
        </div>
        <div className="grid content-start gap-0">
          <div className="border-y border-paper-line">
            {surfaceItems.map(({ body, title }) => (
              <div
                className="grid gap-1 border-b border-paper-line py-4 last:border-b-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-5"
                key={title}
              >
                <strong className="text-sm text-ink">{t(title)}</strong>
                <span className="text-sm leading-6 text-ink-mute">
                  {t(body)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 bg-indigo-deep p-6 text-paper">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-saffron">
              {t("landingSystemKicker")}
            </span>
            <h3 className="mt-3 font-display text-4xl font-semibold leading-none">
              {t("landingSystemTitle")}
            </h3>
            <p className="mt-4 text-sm leading-7 text-paper/80">
              {t("landingSystemBody")}
            </p>
          </div>
          <a
            className="mt-4 inline-flex min-h-11 w-fit items-center gap-2 text-sm font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4"
            href="https://buildwhatmovesindia.com/"
            rel="noreferrer"
            target="_blank"
          >
            {t("landingHackathonLink")}
            <ArrowUpRight aria-hidden className="size-4 shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  const { t } = useI18n();
  return (
    <section
      className="mx-auto w-full max-w-[1040px] px-5 py-14 sm:px-8 lg:py-20"
      id="project"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end lg:gap-14">
        <h2 className="font-display text-[clamp(3rem,6.5vw,5.7rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-indigo-deep">
          {t("landingProjectTitle")}
        </h2>
        <p className="text-base leading-8 text-ink-mute">
          {t("landingProjectBody")}
        </p>
      </div>
      <ol className="mt-10 border-y border-paper-line">
        {proofKeys.map((key, index) => (
          <li
            className="grid gap-2 border-b border-paper-line py-5 last:border-b-0 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-baseline"
            key={key}
          >
            <span className="font-display text-sm font-bold text-saffron">
              0{index + 1}
            </span>
            <span className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
              {t(key)}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-7 text-ink-mute">
          {t("landingBoundary")}
        </p>
        <Link
          className="min-h-11 content-center font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4"
          href="/about"
        >
          {t("landingServiceStatus")}
        </Link>
      </div>
    </section>
  );
}

function DemoVideoModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      aria-label={t("landingWatchDemoTitle")}
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-ink/85 p-3 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="w-full max-w-5xl overflow-hidden rounded-[4px] bg-paper shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-h-14 items-center justify-between gap-4 border-b border-paper-line px-4 sm:px-5">
          <h2 className="font-display text-lg font-semibold text-indigo-deep sm:text-xl">
            {t("landingWatchDemoTitle")}
          </h2>
          <button
            aria-label={t("close")}
            className="grid size-11 shrink-0 place-items-center text-ink-mute transition-colors hover:bg-paper-shade hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <div className="aspect-video bg-ink">
          <iframe
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            className="size-full border-0"
            src={demoVideoUrl}
            title={t("landingWatchDemoTitle")}
          />
        </div>
        <p className="px-4 py-3 text-xs leading-5 text-ink-mute sm:px-5">
          {t("landingMusicCreditPrefix")} {" "}
          <a
            className="font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4"
            href={musicUrl}
            rel="noreferrer"
            target="_blank"
          >
            Bombay Summer by Shane Ivers
          </a>
          {" · "}
          <a
            className="font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4"
            href="https://creativecommons.org/licenses/by/4.0/"
            rel="noreferrer"
            target="_blank"
          >
            CC BY 4.0
          </a>
        </p>
      </div>
    </div>
  );
}

export function LandingScreen() {
  const { t } = useI18n();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  return (
    <main className="break-words bg-paper text-ink">
      <LandingHeader />
      <section className="bg-indigo-deep text-paper">
        <div className="mx-auto w-full max-w-[1180px] px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:pt-24">
          <h1 className="landing-hero-title max-w-[1100px] break-words font-display text-[3.2rem] font-semibold leading-[0.88] tracking-[-0.05em] sm:text-[clamp(4rem,7.5vw,7rem)]">
            {t("landingHeroTitle")}
          </h1>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <p className="max-w-3xl text-base leading-8 text-paper/80 sm:text-xl sm:leading-9">
              {t("landingHeroBody")}
            </p>
            <div className="flex flex-wrap gap-3 lg:max-w-[30rem] lg:justify-end">
              <Link
                className="inline-flex min-h-12 items-center gap-2 rounded-[4px] bg-paper px-5 font-display text-sm font-semibold text-indigo-deep transition-colors hover:bg-saffron hover:text-ink"
                href="/start"
              >
                {t("landingStart")}
                <ArrowUpRight aria-hidden className="size-4" />
              </Link>
              <button
                className="inline-flex min-h-12 items-center gap-2 rounded-[4px] border border-paper/35 px-5 font-display text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper/10"
                onClick={() => setIsVideoOpen(true)}
                type="button"
              >
                <Play aria-hidden className="size-4 fill-current" />
                {t("landingWatchDemo")}
              </button>
              <a
                className="inline-flex min-h-12 items-center gap-2 rounded-[4px] border border-paper/35 px-5 font-display text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper/10"
                href={githubUrl}
                rel="noreferrer"
                target="_blank"
              >
                <GitHubMark aria-hidden className="size-4" />
                {t("landingSourceCode")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <OriginStory />
      <CitizenGraphMap id="graph" mode="journey" />
      <PublicServiceBoundary id="problem" />
      <BeyondTheSurface />
      <section className="mx-auto w-full max-w-[1120px] scroll-mt-16 px-5 py-16 sm:px-8 lg:py-20">
        <CitizenGraphExplainer />
      </section>
      <ProofSection />

      <section className="bg-indigo-deep text-paper" id="vision">
        <div className="mx-auto w-full max-w-[1040px] px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,5.25rem)] font-semibold leading-[0.92] tracking-[-0.045em]">
            {t("landingVisionTitle")}
          </h2>
          <p className="mt-7 max-w-3xl text-base leading-8 text-paper/80">
            {t("landingVisionBody")}
          </p>
          <ul className="mt-12 divide-y divide-paper/25 border-y border-paper/25">
            {visionKeys.map((key) => (
              <li
                className="py-5 font-display text-xl font-semibold leading-7 sm:text-2xl"
                key={key}
              >
                {t(key)}
              </li>
            ))}
          </ul>
          <div className="mt-14 max-w-3xl">
            <p className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              {t("landingClosingTitle")}
            </p>
            <Link
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[4px] bg-saffron px-5 font-display text-sm font-semibold text-ink transition-colors hover:bg-paper"
              href="/start"
            >
              {t("landingStart")}
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-paper/15 bg-indigo-deep text-paper/65">
        <div className="mx-auto grid w-full max-w-[1040px] gap-4 px-5 py-7 text-xs sm:grid-cols-[1fr_auto] sm:items-end sm:px-8">
          <p>{t("independentNotice")}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-3 font-bold text-paper">
            <Link
              className="underline decoration-paper/30 underline-offset-4"
              href="/about"
            >
              {t("landingServiceStatus")}
            </Link>
            <a
              className="inline-flex items-center gap-1.5 underline decoration-paper/30 underline-offset-4"
              href={githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              <GitHubMark aria-hidden className="size-3.5" />
              {t("landingSourceCode")}
            </a>
            <a
              className="underline decoration-paper/30 underline-offset-4"
              href={musicUrl}
              rel="noreferrer"
              target="_blank"
            >
              {t("landingMusicCreditPrefix")}: Bombay Summer
            </a>
          </div>
        </div>
      </footer>
      {isVideoOpen ? (
        <DemoVideoModal onClose={() => setIsVideoOpen(false)} />
      ) : null}
    </main>
  );
}
