"use client";

import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";
import { CitizenGraphExplainer } from "@/components/citizen-graph-explainer";
import { CitizenGraphMap } from "@/components/citizen-graph-map";
import { CitizenMark } from "@/components/citizen-mark";
import { PublicServiceBoundary } from "@/components/public-service-boundary";
import { useAuthStore } from "@/features/auth/store";
import { languageLabels, languages, type Language, type MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";

const proofKeys: MessageKey[] = ["landingCurrentOne", "landingCurrentTwo", "landingCurrentThree", "landingCurrentFour"];
const visionKeys: MessageKey[] = ["landingVisionOne", "landingVisionTwo", "landingVisionThree", "landingVisionFour"];

function chooseLanguage(value: string): Language | undefined {
  return value === "en" || value === "hi" || value === "kn" ? value : undefined;
}

function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { language, t } = useI18n();
  const setLanguage = useAuthStore((state) => state.setLanguage);
  if (compact) {
    return <select aria-label={t("language")} className="min-h-11 w-[5.25rem] rounded-[4px] border border-paper/25 bg-indigo-deep px-2 text-xs font-bold text-paper sm:hidden" onChange={(event) => { const next = chooseLanguage(event.target.value); if (next) setLanguage(next); }} value={language}>{languages.map((option) => <option key={option} value={option}>{languageLabels[option]}</option>)}</select>;
  }
  return <div aria-label={t("language")} className="hidden items-center gap-1 sm:flex">{languages.map((option) => <button aria-pressed={language === option} className={cn("min-h-11 rounded-[4px] px-2.5 text-xs font-bold transition-colors", language === option ? "bg-paper text-indigo-deep" : "text-paper/65 hover:text-paper")} key={option} onClick={() => setLanguage(option)} type="button">{languageLabels[option]}</button>)}</div>;
}

function LandingHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-50 border-b border-paper/15 bg-indigo-deep/96 text-paper backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-[1180px] items-center justify-between gap-3 px-5 sm:px-8">
        <Link className="flex items-center gap-2 font-display text-xl font-extrabold tracking-[0.02em]" href="/"><CitizenMark className="size-7 text-saffron" />{t("brand").toUpperCase()}</Link>
        <nav aria-label={t("primaryNavigation")} className="hidden items-center gap-8 text-xs font-bold text-paper/65 lg:flex"><a className="hover:text-paper" href="#graph">{t("landingGraphNav")}</a><a className="hover:text-paper" href="#problem">{t("landingProblemNav")}</a><a className="hover:text-paper" href="#project">{t("landingJourneyNav")}</a><a className="hover:text-paper" href="#vision">{t("landingVisionNav")}</a></nav>
        <div className="flex items-center gap-2"><Link aria-label={t("information")} className="flex min-h-11 items-center gap-2 rounded-[4px] border border-paper/25 px-3 text-xs font-bold text-paper/72 transition-colors hover:bg-paper/10 hover:text-paper" href="/about"><Info aria-hidden className="size-4" /><span className="hidden xl:inline">{t("information")}</span></Link><LanguageSwitch compact /><LanguageSwitch /><Link className="hidden min-h-11 items-center gap-2 rounded-[4px] bg-saffron px-4 font-display text-xs font-semibold text-ink transition-colors hover:bg-paper sm:inline-flex" href="/start">{t("landingStart")}<ArrowUpRight aria-hidden className="size-4" /></Link></div>
      </div>
    </header>
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
        <div className="grid content-start gap-4"><p className="text-sm font-bold text-indigo-deep">{t("landingBeyondKicker")}</p><h2 className="font-display text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.045em]">{t("landingBeyondTitle")}</h2><p className="max-w-xl text-base leading-8 text-ink-mute">{t("landingBeyondBody")}</p></div>
        <div className="grid content-start gap-0">
          <div className="border-y border-paper-line">{surfaceItems.map(({ body, title }) => <div className="grid gap-1 border-b border-paper-line py-4 last:border-b-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-5" key={title}><strong className="text-sm text-ink">{t(title)}</strong><span className="text-sm leading-6 text-ink-mute">{t(body)}</span></div>)}</div>
          <div className="mt-5 bg-indigo-deep p-6 text-paper"><span className="text-xs font-extrabold uppercase tracking-[0.12em] text-saffron">{t("landingSystemKicker")}</span><h3 className="mt-3 font-display text-4xl font-semibold leading-none">{t("landingSystemTitle")}</h3><p className="mt-4 text-sm leading-7 text-paper/80">{t("landingSystemBody")}</p></div>
          <a className="mt-4 inline-flex min-h-11 w-fit items-center gap-2 text-sm font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4" href="https://buildwhatmovesindia.com/" rel="noreferrer" target="_blank">{t("landingHackathonLink")}<ArrowUpRight aria-hidden className="size-4 shrink-0" /></a>
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  const { t } = useI18n();
  return (
    <section className="mx-auto w-full max-w-[1040px] px-5 py-14 sm:px-8 lg:py-20" id="project">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end lg:gap-14"><h2 className="font-display text-[clamp(3rem,6.5vw,5.7rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-indigo-deep">{t("landingProjectTitle")}</h2><p className="text-base leading-8 text-ink-mute">{t("landingProjectBody")}</p></div>
      <ol className="mt-10 border-y border-paper-line">{proofKeys.map((key, index) => <li className="grid gap-2 border-b border-paper-line py-5 last:border-b-0 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-baseline" key={key}><span className="font-display text-sm font-bold text-saffron">0{index + 1}</span><span className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{t(key)}</span></li>)}</ol>
      <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-2xl text-sm leading-7 text-ink-mute">{t("landingBoundary")}</p><Link className="min-h-11 content-center font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4" href="/about">{t("landingServiceStatus")}</Link></div>
    </section>
  );
}

export function LandingScreen() {
  const { t } = useI18n();
  return (
    <main className="break-words bg-paper text-ink">
      <LandingHeader />
      <section className="bg-indigo-deep text-paper">
        <div className="mx-auto w-full max-w-[1180px] px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:pt-24">
          <h1 className="landing-hero-title max-w-[1100px] break-words font-display text-[3.2rem] font-semibold leading-[0.88] tracking-[-0.05em] sm:text-[clamp(4rem,7.5vw,7rem)]">{t("landingHeroTitle")}</h1>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><p className="max-w-3xl text-base leading-8 text-paper/80 sm:text-xl sm:leading-9">{t("landingHeroBody")}</p><Link className="inline-flex min-h-12 w-fit items-center gap-2 rounded-[4px] bg-paper px-5 font-display text-sm font-semibold text-indigo-deep transition-colors hover:bg-saffron hover:text-ink" href="/start">{t("landingStart")}<ArrowUpRight aria-hidden className="size-4" /></Link></div>
        </div>
      </section>

      <CitizenGraphMap id="graph" mode="journey" />
      <PublicServiceBoundary id="problem" />
      <BeyondTheSurface />
      <section className="mx-auto w-full max-w-[1120px] scroll-mt-16 px-5 py-16 sm:px-8 lg:py-20"><CitizenGraphExplainer /></section>
      <ProofSection />

      <section className="bg-indigo-deep text-paper" id="vision">
        <div className="mx-auto w-full max-w-[1040px] px-5 py-16 sm:px-8 lg:py-20"><h2 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,5.25rem)] font-semibold leading-[0.92] tracking-[-0.045em]">{t("landingVisionTitle")}</h2><p className="mt-7 max-w-3xl text-base leading-8 text-paper/80">{t("landingVisionBody")}</p><ul className="mt-12 divide-y divide-paper/25 border-y border-paper/25">{visionKeys.map((key) => <li className="py-5 font-display text-xl font-semibold leading-7 sm:text-2xl" key={key}>{t(key)}</li>)}</ul><div className="mt-14 max-w-3xl"><p className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]">{t("landingClosingTitle")}</p><Link className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[4px] bg-saffron px-5 font-display text-sm font-semibold text-ink transition-colors hover:bg-paper" href="/start">{t("landingStart")}<ArrowUpRight aria-hidden className="size-4" /></Link></div></div>
      </section>

      <footer className="border-t border-paper/15 bg-indigo-deep text-paper/65"><div className="mx-auto grid w-full max-w-[1040px] gap-3 px-5 py-7 text-xs sm:grid-cols-[1fr_auto] sm:items-end sm:px-8"><p>{t("independentNotice")}</p><Link className="font-bold text-paper underline decoration-paper/30 underline-offset-4" href="/about">{t("landingServiceStatus")}</Link></div></footer>
    </main>
  );
}
