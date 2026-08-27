"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  FolderKanban,
  House,
  Link2,
  ListChecks,
  MessageSquareText,
  Network,
  RefreshCcw,
} from "lucide-react";
import type { ComponentType } from "react";
import { CitizenMark } from "@/components/citizen-mark";
import { useAuthStore } from "@/features/auth/store";
import { languageLabels, languages, type MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

interface GuideItem {
  body: MessageKey;
  icon: ComponentType<{ "aria-hidden"?: boolean; className?: string }>;
  outcome: MessageKey;
  title: MessageKey;
}

const guideItems: GuideItem[] = [
  { body: "aboutHomeBody", icon: House, outcome: "aboutHomeOutcome", title: "aboutHomeTitle" },
  { body: "aboutRecordsBody", icon: FolderKanban, outcome: "aboutRecordsOutcome", title: "aboutRecordsTitle" },
  { body: "aboutServicesBody", icon: ListChecks, outcome: "aboutServicesOutcome", title: "aboutServicesTitle" },
  { body: "aboutBenefitsBody", icon: BadgeIndianRupee, outcome: "aboutBenefitsOutcome", title: "aboutBenefitsTitle" },
  { body: "aboutAskBody", icon: MessageSquareText, outcome: "aboutAskOutcome", title: "aboutAskTitle" },
];

const graphItems: GuideItem[] = [
  { body: "aboutGraphLinksBody", icon: Link2, outcome: "aboutGraphLinksOutcome", title: "aboutGraphLinksTitle" },
  { body: "aboutGraphUpdatesBody", icon: RefreshCcw, outcome: "aboutGraphUpdatesOutcome", title: "aboutGraphUpdatesTitle" },
  { body: "aboutGraphContextBody", icon: Network, outcome: "aboutGraphContextOutcome", title: "aboutGraphContextTitle" },
];

const proofItems: MessageKey[] = [
  "aboutProofEpfo",
  "aboutProofDocuments",
  "aboutProofMoney",
  "aboutProofConsent",
];

const whyItems: Array<{ body: MessageKey; title: MessageKey }> = [
  { body: "aboutWhyCitizenBody", title: "aboutWhyCitizenTitle" },
  { body: "aboutWhyGraphBody", title: "aboutWhyGraphTitle" },
  { body: "aboutWhyProofBody", title: "aboutWhyProofTitle" },
];

export default function AboutPage() {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const setLanguage = useAuthStore((state) => state.setLanguage);
  const returnHref = personId ? "/home" : "/";
  const openHref = personId ? "/home" : "/start";

  return (
    <main className="min-h-dvh break-words bg-paper text-ink">
      <header className="border-b border-paper-line bg-indigo-deep text-paper">
        <div className="mx-auto flex min-h-16 w-full max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <Link className="flex items-center gap-2 font-display text-xl font-extrabold tracking-[0.02em]" href={returnHref}><CitizenMark className="size-7 text-saffron" />{t("brand").toUpperCase()}</Link>
          <div className="flex items-center gap-2"><select aria-label={t("language")} className="min-h-11 w-[5.25rem] rounded-[4px] border border-paper/20 bg-indigo-deep px-2 text-xs font-bold text-paper" onChange={(event) => { const next = languages.find((option) => option === event.target.value); if (next) setLanguage(next); }} value={language}>{languages.map((option) => <option key={option} value={option}>{languageLabels[option]}</option>)}</select><Link aria-label={t("aboutReturn")} className="flex min-h-11 items-center gap-2 rounded-[4px] border border-paper/20 px-3 text-xs font-bold text-paper/72 transition-colors hover:bg-paper/10 hover:text-paper" href={returnHref}><span className="hidden sm:inline">{t("aboutReturn")}</span><ArrowRight aria-hidden className="size-4" /></Link></div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1120px] gap-14 px-5 py-12 sm:gap-20 sm:px-10 sm:py-16 lg:py-20">
        <section className="grid max-w-5xl gap-5">
          <p className="eyebrow text-indigo-deep">{t("aboutEyebrow")}</p>
          <h1 className="font-display text-[clamp(3.2rem,8vw,6.8rem)] font-semibold leading-[0.88] tracking-[-0.055em]">{t("aboutTitle")}<br />{t("aboutTitleAccent")}</h1>
          <p className="max-w-3xl text-base leading-8 text-ink-mute sm:text-lg">{t("aboutBody")}</p>
        </section>

        <section className="grid gap-7">
          <div className="grid max-w-3xl gap-3"><p className="eyebrow">{t("aboutGuideEyebrow")}</p><h2 className="font-display text-[clamp(2.5rem,5vw,4.4rem)] font-semibold leading-[0.94] tracking-[-0.04em] text-indigo-deep">{t("aboutGuideTitle")}</h2><p className="text-sm leading-7 text-ink-mute sm:text-base">{t("aboutGuideBody")}</p></div>
          <ol className="grid border-y border-paper-line md:grid-cols-2">
            {guideItems.map(({ body, icon: Icon, outcome, title }, index) => <li className="grid content-start gap-5 border-b border-paper-line py-6 last:border-b-0 md:min-h-72 md:border-r md:px-6 md:odd:pl-0 md:even:border-r-0 md:last:col-span-2 md:last:min-h-0 md:last:border-r-0 md:last:px-0" key={title}><div className="flex items-center justify-between gap-4"><Icon aria-hidden className="size-5 text-indigo-deep" /><span className="font-display text-sm font-bold tabular-nums text-saffron">{index < 4 ? `0${index + 1}` : "→"}</span></div><div className="grid gap-3"><h3 className="font-display text-3xl font-semibold leading-none">{t(title)}</h3><p className="text-sm leading-6 text-ink-mute">{t(body)}</p></div><p className="mt-auto border-t border-paper-line pt-4 text-sm font-bold leading-6 text-indigo-deep">{t(outcome)}</p></li>)}
          </ol>
        </section>

        <section className="grid gap-10 rounded-[8px] bg-indigo-deep p-6 text-paper sm:p-9 lg:grid-cols-[minmax(26rem,0.95fr)_minmax(0,1.05fr)] lg:p-12">
          <div className="grid content-start gap-4"><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-paper">{t("aboutGraphEyebrow")}</p><h2 className="break-words font-display text-[clamp(2.5rem,4vw,4rem)] font-semibold leading-[0.94] tracking-[-0.04em] lg:break-normal">{t("aboutGraphTitle")}</h2><p className="text-sm leading-7 text-paper/80 sm:text-base">{t("aboutGraphBody")}</p></div>
          <ol className="divide-y divide-paper/25 border-y border-paper/25">{graphItems.map(({ body, icon: Icon, outcome, title }, index) => <li className="grid gap-3 py-5 sm:grid-cols-[2rem_minmax(0,1fr)]" key={title}><Icon aria-hidden className="mt-1 size-5 text-saffron" /><div className="grid gap-2"><h3 className="font-display text-2xl font-semibold">{t(title)}</h3><p className="text-sm leading-6 text-paper/80">{t(body)}</p><p className="text-sm font-bold leading-6 text-paper">{String(index + 1).padStart(2, "0")} · {t(outcome)}</p></div></li>)}</ol>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:gap-12">
          <div className="grid content-start gap-5"><p className="eyebrow">{t("aboutProofEyebrow")}</p><h2 className="font-display text-[clamp(2.5rem,5vw,4.4rem)] font-semibold leading-[0.94] tracking-[-0.04em]">{t("aboutProofTitle")}</h2><p className="max-w-2xl text-sm leading-7 text-ink-mute sm:text-base">{t("aboutProofBody")}</p></div>
          <ol className="border-y border-paper-line">{proofItems.map((key, index) => <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-paper-line py-4 text-sm font-semibold leading-6 last:border-b-0" key={key}><span className="font-display font-bold text-indigo-deep">0{index + 1}</span><span>{t(key)}</span></li>)}</ol>
        </section>

        <section className="grid gap-8 border-y-4 border-indigo-deep py-9">
          <div className="grid max-w-3xl gap-4"><p className="eyebrow text-indigo-deep">{t("aboutWhyEyebrow")}</p><h2 className="font-display text-[clamp(2.7rem,5.5vw,5rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-indigo-deep">{t("aboutWhyTitle")}</h2><p className="text-base leading-8 text-ink-mute">{t("aboutWhyBody")}</p></div>
          <ol className="grid gap-0 md:grid-cols-3">{whyItems.map(({ body, title }, index) => <li className="grid content-start gap-3 border-t border-paper-line py-5 md:border-l md:border-t-0 md:px-6 md:first:border-l-0 md:first:pl-0" key={title}><span className="font-display text-sm font-bold text-saffron">0{index + 1}</span><h3 className="font-display text-2xl font-semibold leading-tight">{t(title)}</h3><p className="text-sm leading-6 text-ink-mute">{t(body)}</p></li>)}</ol>
        </section>

        <section className="grid gap-5 bg-paper-shade p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-8"><div className="grid gap-3"><h2 className="font-display text-3xl font-semibold leading-none text-indigo-deep sm:text-4xl">{t("aboutClosingTitle")}</h2><p className="max-w-2xl text-sm leading-7 text-ink-mute">{t("aboutClosingBody")}</p></div><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] bg-indigo-deep px-5 text-sm font-bold text-paper transition-colors hover:bg-indigo" href={openHref}>{t("aboutClosingAction")}<ArrowRight aria-hidden className="size-4" /></Link></section>

        <footer className="flex flex-col justify-between gap-3 border-t border-paper-line py-6 text-xs leading-5 text-ink-mute sm:flex-row"><p>{t("aboutBoundary")}</p><p>{t("independentNotice")}</p></footer>
      </div>
    </main>
  );
}
