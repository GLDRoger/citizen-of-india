"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { CitizenMark } from "@/components/citizen-mark";
import { useAuthStore } from "@/features/auth/store";
import { languageLabels, languages, type Language, type MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";

const journeyKeys: MessageKey[] = [
  "landingJourneyInvite",
  "landingJourneyConsent",
  "landingJourneyReuse",
  "landingJourneyFinish",
];

const currentKeys: MessageKey[] = [
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
        {languages.map((option) => <option key={option} value={option}>{languageLabels[option]}</option>)}
      </select>
    );
  }

  return (
    <div aria-label={t("language")} className="hidden items-center gap-1 sm:flex">
      {languages.map((option) => (
        <button
          aria-pressed={language === option}
          className={cn("min-h-11 rounded-[4px] px-2.5 text-xs font-bold transition-colors", language === option ? "bg-paper text-indigo-deep" : "text-paper/65 hover:text-paper")}
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

function DemoFile() {
  const { t } = useI18n();
  return (
    <article className="relative mx-auto -mb-28 mt-16 w-full max-w-[1040px] bg-paper px-5 pb-7 pt-12 text-ink sm:-mb-36 sm:px-8 sm:pb-9 sm:pt-14">
      <div className="absolute left-0 top-0 bg-saffron px-5 py-2 font-display text-xs font-bold text-ink sm:px-8">{t("landingFileLabel")}</div>
      <div className="border-b border-paper-line pb-7">
        <div>
          <p className="text-xs font-bold text-ink-mute">{t("landingFileStatus")}</p>
          <h2 className="mt-2 max-w-3xl font-display text-[clamp(2.2rem,5vw,4.7rem)] font-semibold leading-[0.9] tracking-[-0.04em]">{t("landingFileTitle")}</h2>
        </div>
      </div>
      <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
        {journeyKeys.map((key, index) => (
          <li className="grid min-h-28 content-start gap-3 border-b border-paper-line py-5 sm:px-5 sm:odd:border-r sm:first:pl-0 lg:border-b-0 lg:border-r lg:odd:border-r lg:last:border-r-0" key={key}>
            <span className="font-display text-sm font-bold tabular-nums text-indigo">0{index + 1}</span>
            <span className="text-sm font-semibold leading-6">{t(key)}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}

function RecordFlow() {
  const { t } = useI18n();
  const keys: MessageKey[] = [
    "landingApproachSituation",
    "landingApproachRecord",
    "landingApproachConsent",
    "landingApproachAction",
    "landingApproachReceipt",
  ];

  return <ol className="overflow-hidden border-y border-paper-line sm:grid sm:grid-cols-5">{keys.map((key, index) => <li className="flex min-h-16 items-center gap-4 border-b border-paper-line py-3 last:border-b-0 sm:grid sm:min-h-28 sm:content-between sm:border-b-0 sm:border-r sm:px-4 sm:py-4 sm:last:border-r-0" key={key}><span className="font-display text-xs font-bold tabular-nums text-saffron">0{index + 1}</span><strong className="font-display text-xl font-semibold leading-tight text-indigo-deep sm:text-[1.35rem]">{t(key)}</strong></li>)}</ol>;
}

const graphPrinciples: Array<{ body: MessageKey; title: MessageKey }> = [
  { body: "landingGraphOneBody", title: "landingGraphOneTitle" },
  { body: "landingGraphTwoBody", title: "landingGraphTwoTitle" },
  { body: "landingGraphThreeBody", title: "landingGraphThreeTitle" },
];

function GraphStory() {
  const { t } = useI18n();
  return (
    <section className="border-y border-paper-line bg-paper-shade" id="graph">
      <div className="mx-auto grid w-full max-w-[1040px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)] lg:gap-14 lg:py-18">
        <div className="grid content-start gap-4"><p className="eyebrow text-indigo-deep">{t("landingGraphEyebrow")}</p><h2 className="font-display text-[clamp(2.8rem,5.5vw,5rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-indigo-deep">{t("landingGraphTitle")}</h2><p className="text-base leading-8 text-ink-mute">{t("landingGraphBody")}</p></div>
        <ol className="divide-y divide-paper-line border-y border-paper-line">{graphPrinciples.map(({ body, title }, index) => <li className="grid gap-3 py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)]" key={title}><span className="font-display text-sm font-bold text-saffron">0{index + 1}</span><div className="grid gap-2"><h3 className="font-display text-2xl font-semibold leading-tight">{t(title)}</h3><p className="text-sm leading-6 text-ink-mute">{t(body)}</p></div></li>)}</ol>
      </div>
    </section>
  );
}

function HackathonStory() {
  const { t } = useI18n();
  return (
    <article className="mb-12 grid gap-7 border-y border-paper-line py-8 lg:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.28fr)] lg:gap-12 lg:py-10">
      <div className="grid content-start gap-3"><p className="eyebrow text-indigo-deep">{t("landingHackathonEyebrow")}</p><h2 className="font-display text-[clamp(2.35rem,4.5vw,4rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-indigo-deep">{t("landingHackathonTitle")}</h2></div>
      <div className="grid gap-4 text-base leading-7 text-ink-mute"><p>{t("landingHackathonBodyOne")}</p><p className="font-semibold text-ink">{t("landingHackathonBodyThree")}</p><a className="mt-1 inline-flex min-h-11 w-fit items-center text-sm font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4" href="https://buildwhatmovesindia.com/brief" rel="noreferrer" target="_blank">{t("landingHackathonLink")} <span aria-hidden className="ml-2">↗</span></a></div>
    </article>
  );
}

function StatementList({ keys }: { keys: MessageKey[] }) {
  const { t } = useI18n();
  return (
    <ul className="mt-10 divide-y divide-paper-line border-y border-paper-line">
      {keys.map((key) => <li className="py-5 text-base font-semibold leading-7 sm:text-lg" key={key}>{t(key)}</li>)}
    </ul>
  );
}

export function LandingScreen() {
  const { t } = useI18n();

  return (
    <main className="break-words bg-paper text-ink">
      <section className="overflow-x-clip bg-indigo-deep text-paper">
        <header className="mx-auto flex min-h-16 w-full max-w-[1180px] items-center justify-between gap-3 px-5 sm:px-8">
          <Link className="flex items-center gap-2 font-display text-xl font-extrabold tracking-[0.02em]" href="/">
            <CitizenMark className="size-7 text-saffron" />
            {t("brand").toUpperCase()}
          </Link>
          <nav aria-label={t("primaryNavigation")} className="hidden items-center gap-8 text-xs font-bold text-paper/65 lg:flex">
            <a className="hover:text-paper" href="#problem">{t("landingProblemNav")}</a>
            <a className="hover:text-paper" href="#graph">{t("landingGraphNav")}</a>
            <a className="hover:text-paper" href="#project">{t("landingJourneyNav")}</a>
            <a className="hover:text-paper" href="#vision">{t("landingVisionNav")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link aria-label={t("information")} className="flex min-h-11 items-center gap-2 rounded-[4px] border border-paper/25 px-3 text-xs font-bold text-paper/72 transition-colors hover:bg-paper/10 hover:text-paper" href="/about"><Info aria-hidden className="size-4" /><span className="hidden xl:inline">{t("information")}</span></Link>
            <LanguageSwitch compact />
            <LanguageSwitch />
            <Link className="hidden min-h-11 items-center rounded-[4px] bg-saffron px-4 font-display text-xs font-semibold text-ink transition-colors hover:bg-paper sm:inline-flex" href="/start">{t("landingStart")} <span aria-hidden className="ml-2">↗</span></Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1180px] px-5 pb-0 pt-14 sm:px-8 sm:pt-20 lg:pt-24">
          <h1 className="landing-hero-title max-w-[1080px] break-words font-display text-[3rem] font-semibold leading-[0.9] tracking-[-0.045em] sm:text-balance sm:text-[clamp(3.7rem,7vw,6.6rem)]">{t("landingHeroTitle")}</h1>
          <div className="mt-9 max-w-2xl lg:mt-10">
            <p className="text-base leading-7 text-paper/72 sm:text-xl sm:leading-8">{t("landingHeroBody")}</p>
            <Link className="mt-6 inline-flex min-h-12 items-center rounded-[4px] bg-paper px-5 font-display text-sm font-semibold text-indigo-deep transition-colors hover:bg-saffron hover:text-ink" href="/start">{t("landingStart")} <span aria-hidden className="ml-2">↗</span></Link>
          </div>
          <DemoFile />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1040px] px-5 pb-8 pt-40 sm:px-8 sm:pb-10 sm:pt-48" id="problem">
        <h2 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,5.25rem)] font-semibold leading-[0.92] tracking-[-0.045em]">{t("landingProblemTitle")}</h2>
        <div className="my-10 border-y-4 border-indigo-deep py-7 font-display text-[clamp(2.15rem,5vw,4.6rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-indigo-deep">
          <p>{t("landingProblemExampleOne")}</p>
          <p>{t("landingProblemExampleTwo")}</p>
          <p>{t("landingProblemExampleThree")}</p>
        </div>
        <p className="max-w-3xl text-base leading-8 text-ink-mute">{t("landingProblemAfter")}</p>
      </section>

      <section className="mx-auto grid w-full max-w-[1040px] gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-10 lg:py-9" id="approach">
        <div className="grid gap-3"><p className="text-lg font-semibold leading-7 text-indigo-deep sm:text-2xl">{t("landingApproachTitle")}</p><p className="text-sm leading-6 text-ink-mute">{t("landingApproachBody")}</p></div>
        <RecordFlow />
      </section>

      <GraphStory />

      <section className="mx-auto w-full max-w-[1040px] px-5 py-10 sm:px-8 lg:py-12" id="project">
        <HackathonStory />
        <h2 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,5.25rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-indigo-deep">{t("landingProjectTitle")}</h2>
        <p className="mt-7 max-w-3xl text-base leading-8 text-ink-mute">{t("landingProjectBody")}</p>
        <StatementList keys={currentKeys} />
        <p className="mt-8 max-w-3xl text-sm leading-7 text-ink-mute">{t("landingBoundary")}</p>
        <Link className="mt-4 inline-flex min-h-11 items-center font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4" href="/about">{t("landingServiceStatus")}</Link>
      </section>

      <section className="bg-indigo-deep text-paper" id="vision">
        <div className="mx-auto w-full max-w-[1040px] px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,5.25rem)] font-semibold leading-[0.92] tracking-[-0.045em]">{t("landingVisionTitle")}</h2>
          <p className="mt-7 max-w-3xl text-base leading-8 text-paper/72">{t("landingVisionBody")}</p>
          <ul className="mt-12 divide-y divide-paper/20 border-y border-paper/20">
            {visionKeys.map((key) => <li className="py-5 font-display text-xl font-semibold leading-7 sm:text-2xl" key={key}>{t(key)}</li>)}
          </ul>
          <div className="mt-14 max-w-3xl">
            <p className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]">{t("landingClosingTitle")}</p>
            <Link className="mt-8 inline-flex min-h-12 items-center rounded-[4px] bg-saffron px-5 font-display text-sm font-semibold text-ink transition-colors hover:bg-paper" href="/start">{t("landingStart")} <span aria-hidden className="ml-2">↗</span></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-paper/15 bg-indigo-deep text-paper/65">
        <div className="mx-auto grid w-full max-w-[1040px] gap-3 px-5 py-7 text-xs sm:grid-cols-[1fr_auto] sm:items-end sm:px-8">
          <p>{t("independentNotice")}</p>
          <Link className="font-bold text-paper underline decoration-paper/30 underline-offset-4" href="/about">{t("landingServiceStatus")}</Link>
        </div>
      </footer>
    </main>
  );
}
