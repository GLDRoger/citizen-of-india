"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CitizenGraphExplainer } from "@/components/citizen-graph-explainer";
import { CitizenGraphMap } from "@/components/citizen-graph-map";
import { CitizenMark } from "@/components/citizen-mark";
import { PublicServiceBoundary } from "@/components/public-service-boundary";
import { useAuthStore } from "@/features/auth/store";
import { languageLabels, languages, type MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

interface GuideItem {
  body: MessageKey;
  outcome: MessageKey;
  title: MessageKey;
}

const guideItems: GuideItem[] = [
  { body: "aboutHomeBody", outcome: "aboutHomeOutcome", title: "aboutHomeTitle" },
  { body: "aboutRecordsBody", outcome: "aboutRecordsOutcome", title: "aboutRecordsTitle" },
  { body: "aboutServicesBody", outcome: "aboutServicesOutcome", title: "aboutServicesTitle" },
  { body: "aboutBenefitsBody", outcome: "aboutBenefitsOutcome", title: "aboutBenefitsTitle" },
];

const proofItems: MessageKey[] = ["aboutProofEpfo", "aboutProofDocuments", "aboutProofMoney", "aboutProofConsent"];
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
      <header className="border-b border-paper/15 bg-indigo-deep text-paper"><div className="mx-auto flex min-h-16 w-full max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10"><Link className="flex items-center gap-2 font-display text-xl font-extrabold tracking-[0.02em]" href={returnHref}><CitizenMark className="size-7 text-saffron" />{t("brand").toUpperCase()}</Link><div className="flex items-center gap-2"><select aria-label={t("language")} className="min-h-11 w-[5.25rem] rounded-[4px] border border-paper/20 bg-indigo-deep px-2 text-xs font-bold text-paper" onChange={(event) => { const next = languages.find((option) => option === event.target.value); if (next) setLanguage(next); }} value={language}>{languages.map((option) => <option key={option} value={option}>{languageLabels[option]}</option>)}</select><Link aria-label={t("aboutReturn")} className="flex min-h-11 items-center gap-2 rounded-[4px] border border-paper/20 px-3 text-xs font-bold text-paper/72 transition-colors hover:bg-paper/10 hover:text-paper" href={returnHref}><span className="hidden sm:inline">{t("aboutReturn")}</span><ArrowRight aria-hidden className="size-4" /></Link></div></div></header>

      <section className="mx-auto grid w-full max-w-[1120px] gap-6 px-5 py-14 sm:px-10 sm:py-20">
        <p className="text-sm font-bold text-indigo-deep">{t("aboutEyebrow")}</p>
        <h1 className="max-w-5xl font-display text-[clamp(3.4rem,8.5vw,7.4rem)] font-semibold leading-[0.88] tracking-[-0.055em]">{t("aboutTitle")} {t("aboutTitleAccent")}</h1>
        <p className="max-w-3xl text-lg leading-8 text-ink-mute sm:text-xl sm:leading-9">{t("aboutBody")}</p>
      </section>

      <CitizenGraphMap id="citizen-graph" />
      <PublicServiceBoundary />

      <div className="mx-auto grid w-full max-w-[1120px] gap-16 px-5 pb-16 sm:gap-24 sm:px-10 sm:pb-20">
        <CitizenGraphExplainer />

        <section className="grid gap-8">
          <div className="grid max-w-4xl gap-3"><p className="text-sm font-bold text-indigo-deep">{t("aboutGuideEyebrow")}</p><h2 className="font-display text-[clamp(2.8rem,5.5vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.045em]">{t("aboutGuideTitle")}</h2><p className="max-w-3xl text-base leading-8 text-ink-mute">{t("aboutGuideBody")}</p></div>
          <ol className="border-y border-paper-line">{guideItems.map(({ body, outcome, title }, index) => <li className="grid gap-3 border-b border-paper-line py-5 last:border-b-0 lg:grid-cols-[3rem_11rem_minmax(0,1fr)_minmax(14rem,0.7fr)] lg:items-baseline lg:gap-5" key={title}><span className="font-display text-sm font-bold text-saffron">0{index + 1}</span><h3 className="font-display text-2xl font-semibold">{t(title)}</h3><p className="text-sm leading-6 text-ink-mute">{t(body)}</p><p className="text-sm font-bold leading-6 text-indigo-deep">{t(outcome)}</p></li>)}</ol>
          <div className="grid gap-3 bg-indigo-tint p-5 sm:grid-cols-[11rem_minmax(0,1fr)_minmax(14rem,0.7fr)] sm:items-baseline sm:gap-5"><h3 className="font-display text-2xl font-semibold text-indigo-deep">{t("aboutAskTitle")}</h3><p className="text-sm leading-6 text-ink-mute">{t("aboutAskBody")}</p><p className="text-sm font-bold leading-6 text-indigo-deep">{t("aboutAskOutcome")}</p></div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] lg:gap-14"><div className="grid content-start gap-5"><p className="text-sm font-bold text-indigo-deep">{t("aboutProofEyebrow")}</p><h2 className="font-display text-[clamp(2.8rem,5.5vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.045em]">{t("aboutProofTitle")}</h2><p className="max-w-2xl text-base leading-8 text-ink-mute">{t("aboutProofBody")}</p></div><ol className="border-y border-paper-line">{proofItems.map((key, index) => <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-paper-line py-4 text-sm font-semibold leading-6 last:border-b-0" key={key}><span className="font-display font-bold text-saffron">0{index + 1}</span><span>{t(key)}</span></li>)}</ol></section>

        <section className="grid gap-8 border-y-4 border-indigo-deep py-10"><div className="grid max-w-4xl gap-4"><p className="text-sm font-bold text-indigo-deep">{t("aboutWhyEyebrow")}</p><h2 className="font-display text-[clamp(3rem,6vw,5.4rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-indigo-deep">{t("aboutWhyTitle")}</h2><p className="text-base leading-8 text-ink-mute">{t("aboutWhyBody")}</p></div><ol className="grid gap-0 md:grid-cols-3">{whyItems.map(({ body, title }, index) => <li className="grid content-start gap-3 border-t border-paper-line py-5 md:border-l md:border-t-0 md:px-6 md:first:border-l-0 md:first:pl-0" key={title}><span className="font-display text-sm font-bold text-saffron">0{index + 1}</span><h3 className="font-display text-2xl font-semibold leading-tight">{t(title)}</h3><p className="text-sm leading-6 text-ink-mute">{t(body)}</p></li>)}</ol></section>

        <section className="grid gap-5 bg-paper-shade p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-8"><div className="grid gap-3"><h2 className="font-display text-3xl font-semibold leading-none text-indigo-deep sm:text-4xl">{t("aboutClosingTitle")}</h2><p className="max-w-2xl text-sm leading-7 text-ink-mute">{t("aboutClosingBody")}</p></div><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] bg-indigo-deep px-5 text-sm font-bold text-paper transition-colors hover:bg-indigo" href={openHref}>{t("aboutClosingAction")}<ArrowRight aria-hidden className="size-4" /></Link></section>

        <footer className="flex flex-col justify-between gap-3 border-t border-paper-line py-6 text-xs leading-5 text-ink-mute sm:flex-row"><p>{t("aboutBoundary")}</p><p>{t("independentNotice")}</p></footer>
      </div>
    </main>
  );
}
