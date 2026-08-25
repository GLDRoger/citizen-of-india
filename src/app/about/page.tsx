"use client";

import Link from "next/link";
import { ArrowLeft, Check, FlaskConical, ShieldAlert, X } from "lucide-react";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

const realItems: MessageKey[] = ["aboutRealOne", "aboutRealTwo", "aboutRealThree", "aboutRealFour"];
const simulatedItems: MessageKey[] = ["aboutMockOne", "aboutMockTwo", "aboutMockThree", "aboutMockFour"];

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto grid min-h-dvh max-w-[1120px] gap-14 px-5 py-7 sm:px-10 sm:py-12">
        <header className="flex items-center justify-between gap-4"><Link className="flex min-h-11 items-center gap-2 text-sm font-bold text-ink-mute hover:text-ink" href="/"><ArrowLeft aria-hidden className="size-4" />Citizen</Link><span className="rounded-[4px] border border-brick bg-brick-tint px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-brick">{t("independentPrototype")}</span></header>
        <section className="grid max-w-4xl gap-5"><p className="eyebrow">{t("aboutEyebrow")}</p><h1 className="font-display text-[clamp(3.2rem,8vw,6.8rem)] font-semibold leading-[0.86] tracking-[-0.055em]">{t("aboutTitle")}<br /><span className="text-green-deep">{t("aboutTitleAccent")}</span></h1><p className="max-w-2xl text-sm leading-7 text-ink-mute sm:text-base">{t("aboutBody")}</p></section>
        <section className="grid gap-5 lg:grid-cols-2"><article className="grid content-start gap-6 border-t border-green-deep pt-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-[4px] bg-green-tint text-green-deep"><Check aria-hidden className="size-5" /></span><h2 className="font-display text-3xl font-semibold">{t("aboutAvailable")}</h2></div><ul className="grid gap-4">{realItems.map((key) => <li className="flex gap-3 text-sm leading-6 text-ink-mute" key={key}><Check aria-hidden className="mt-1 size-4 shrink-0 text-green-deep" />{t(key)}</li>)}</ul></article><article className="grid content-start gap-6 border-t border-brick pt-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-[4px] bg-brick-tint text-brick"><FlaskConical aria-hidden className="size-5" /></span><h2 className="font-display text-3xl font-semibold">{t("aboutSimulated")}</h2></div><ul className="grid gap-4">{simulatedItems.map((key) => <li className="flex gap-3 text-sm leading-6 text-ink-mute" key={key}><X aria-hidden className="mt-1 size-4 shrink-0 text-brick" />{t(key)}</li>)}</ul></article></section>
        <section className="grid gap-6 rounded-[8px] bg-ink p-6 text-paper sm:grid-cols-[auto_minmax(0,1fr)] sm:p-8"><ShieldAlert aria-hidden className="size-8 text-brick" /><div className="grid gap-3"><h2 className="font-display text-3xl font-semibold">{t("aboutSafety")}</h2><p className="max-w-3xl text-sm leading-6 text-paper/70">{t("aboutSafetyBody")}</p></div></section>
        <footer className="flex flex-col justify-between gap-4 border-t border-paper-line py-6 text-xs text-ink-mute sm:flex-row"><p>{t("independentNotice")}</p><Link className="font-bold text-green-deep hover:underline" href="/">{t("aboutReturn")}</Link></footer>
      </div>
    </main>
  );
}
