"use client";

import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";
import { CitizenMark } from "@/components/citizen-mark";
import { useAuthStore } from "@/features/auth/store";
import { GitHubMark } from "@/features/landing/components/github-mark";
import { languageLabels, languages, type Language, type MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";

export const githubUrl = "https://github.com/GLDRoger/citizen-of-india";
export const musicUrl = "https://www.silvermansound.com/free-music/bombay-summer";

export interface HeaderLink {
  href: string;
  label: MessageKey;
}

export const landingLinks: HeaderLink[] = [
  { href: "/#why", label: "landingWhyNav" },
  { href: "/#origin", label: "landingOriginNav" },
  { href: "/#graph", label: "landingGraphNav" },
  { href: "/#project", label: "landingJourneyNav" },
  { href: "/manifesto", label: "landingManifestoNav" },
];

function chooseLanguage(value: string): Language | undefined {
  return value === "en" || value === "hi" || value === "kn" ? value : undefined;
}

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
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

export function LandingHeader({ links = landingLinks }: { links?: HeaderLink[] }) {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  return (
    <header className="sticky top-0 z-50 border-b border-paper/15 bg-indigo-deep/96 text-paper backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-[1180px] items-center justify-between gap-3 px-5 sm:px-8">
        <Link className="flex items-center gap-2 font-display text-xl font-extrabold tracking-[0.02em]" href="/">
          <CitizenMark className="size-7 text-saffron" />
          {t("brand").toUpperCase()}
        </Link>
        <nav aria-label={t("primaryNavigation")} className="hidden items-center gap-7 text-xs font-bold text-paper/65 lg:flex">
          {links.map((link) => <Link className="transition-colors hover:text-paper" href={link.href} key={link.href}>{t(link.label)}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link aria-label={t("information")} className="flex min-h-11 items-center gap-2 rounded-[4px] border border-paper/25 px-3 text-xs font-bold text-paper/72 transition-colors hover:bg-paper/10 hover:text-paper" href="/about">
            <Info aria-hidden className="size-4" />
            <span className="hidden xl:inline">{t("information")}</span>
          </Link>
          <LanguageSwitch compact />
          <LanguageSwitch />
          <Link className="hidden min-h-11 items-center gap-2 rounded-[4px] bg-saffron px-4 font-display text-xs font-semibold text-ink transition-colors hover:bg-paper sm:inline-flex" href={personId ? "/home" : "/start"}>
            {t(personId ? "manifestoOpenCitizen" : "landingStart")}
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function LandingFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-paper/15 bg-indigo-deep text-paper/65">
      <div className="mx-auto grid w-full max-w-[1040px] gap-4 px-5 py-7 text-xs sm:grid-cols-[1fr_auto] sm:items-end sm:px-8">
        <div className="grid gap-1">
          <p>{t("independentNotice")}</p>
          <p>{t("landingHackathonCredit")}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 font-bold text-paper">
          <Link className="underline decoration-paper/30 underline-offset-4" href="/manifesto">{t("landingManifestoNav")}</Link>
          <Link className="underline decoration-paper/30 underline-offset-4" href="/about">{t("landingServiceStatus")}</Link>
          <a className="inline-flex items-center gap-1.5 underline decoration-paper/30 underline-offset-4" href={githubUrl} rel="noreferrer" target="_blank">
            <GitHubMark aria-hidden className="size-3.5" />
            {t("landingSourceCode")}
          </a>
          <a className="underline decoration-paper/30 underline-offset-4" href={musicUrl} rel="noreferrer" target="_blank">{t("landingMusicCreditPrefix")}: Bombay Summer</a>
        </div>
      </div>
    </footer>
  );
}
