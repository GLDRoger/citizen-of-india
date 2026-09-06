"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RichText } from "@/components/rich-text";
import { useAuthStore } from "@/features/auth/store";
import { githubUrl } from "@/features/landing/components/landing-header";
import { demoLogins } from "@/features/graph/seed-facts";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

interface Item {
  body: MessageKey;
  title: MessageKey;
}

const realItems: Item[] = [
  { body: "aboutRealOneBody", title: "aboutRealOne" },
  { body: "aboutRealTwoBody", title: "aboutRealTwo" },
  { body: "aboutRealThreeBody", title: "aboutRealThree" },
  { body: "aboutRealFourBody", title: "aboutRealFour" },
  { body: "aboutRealFiveBody", title: "aboutRealFive" },
  { body: "aboutRealSixBody", title: "aboutRealSix" },
];

const simulatedItems: Item[] = [
  { body: "aboutSimOneBody", title: "aboutSimOne" },
  { body: "aboutSimTwoBody", title: "aboutSimTwo" },
  { body: "aboutSimThreeBody", title: "aboutSimThree" },
  { body: "aboutSimFourBody", title: "aboutSimFour" },
  { body: "aboutSimFiveBody", title: "aboutSimFive" },
  { body: "aboutSimSixBody", title: "aboutSimSix" },
  { body: "aboutSimSevenBody", title: "aboutSimSeven" },
  { body: "aboutSimEightBody", title: "aboutSimEight" },
];

const neverItems: MessageKey[] = ["aboutNeverOne", "aboutNeverTwo", "aboutNeverThree", "aboutNeverFour", "aboutNeverFive", "aboutNeverSix"];

const guideItems: Array<Item & { outcome: MessageKey }> = [
  { body: "aboutHomeBody", outcome: "aboutHomeOutcome", title: "aboutHomeTitle" },
  { body: "aboutRecordsBody", outcome: "aboutRecordsOutcome", title: "aboutRecordsTitle" },
  { body: "aboutServicesBody", outcome: "aboutServicesOutcome", title: "aboutServicesTitle" },
  { body: "aboutBenefitsBody", outcome: "aboutBenefitsOutcome", title: "aboutBenefitsTitle" },
  { body: "aboutAskBody", outcome: "aboutAskOutcome", title: "aboutAskTitle" },
];

const sectionTitle = "font-display text-[clamp(2.4rem,4.8vw,4rem)] font-semibold leading-[0.94] tracking-[-0.045em]";

function Ledger({ items, stamp, title, tone }: { items: Item[]; stamp: string; title: MessageKey; tone: "real" | "simulated" }) {
  const { t } = useI18n();
  const isReal = tone === "real";
  return (
    <div className={`grid content-start gap-4 rounded-[6px] border p-5 sm:p-6 ${isReal ? "border-green-deep/30 bg-green-deep/[0.06]" : "border-indigo/30 bg-indigo-tint/60"}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className={`font-display text-2xl font-semibold leading-none ${isReal ? "text-green-deep" : "text-indigo-deep"}`}>{t(title)}</h3>
        <span className={`stamp shrink-0 ${isReal ? "stamp--verified" : "stamp--simulated"}`}>{stamp}</span>
      </div>
      <ul className="grid divide-y divide-ink/10">
        {items.map((item) => (
          <li className="grid gap-0.5 py-3 first:pt-0 last:pb-0" key={item.title}>
            <strong className="text-sm text-ink">{t(item.title)}</strong>
            <span className="text-sm leading-6 text-ink-mute">{t(item.body)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The About page is the honest ledger: what runs for real in the browser,
 * what is simulated and how it is labelled, what is never here, who the
 * fictional people are, and how the screens fit together.
 */
export function AboutScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const openHref = personId ? "/home" : "/start";

  return (
    <>
      <section className="border-b border-paper-line">
        <div className="mx-auto grid w-full max-w-[1040px] gap-5 px-5 py-14 sm:px-8 lg:py-20">
          <p className="text-sm font-bold text-indigo-deep">{t("aboutRealKicker")}</p>
          <h1 className="max-w-[16ch] font-display text-[clamp(2.9rem,6.4vw,5.8rem)] font-semibold leading-[0.9] tracking-[-0.05em]"><RichText entrance="load" text={t("aboutRealTitle")} /></h1>
          <p className="max-w-2xl text-base leading-8 text-ink-mute sm:text-lg">{t("aboutRealBody")}</p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1040px] gap-6 px-5 py-14 sm:px-8 lg:py-20" id="ledger">
        <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-6">
          <Ledger items={realItems} stamp={t("verified")} title="aboutRealHead" tone="real" />
          <div className="grid gap-4">
            <Ledger items={simulatedItems} stamp={t("simulated")} title="aboutSimHead" tone="simulated" />
            <p className="text-sm leading-6 text-ink-mute">{t("aboutSimBody")}</p>
          </div>
        </div>
      </section>

      <section className="border-y border-paper-line bg-indigo-deep text-paper">
        <div className="mx-auto grid w-full max-w-[1040px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(14rem,0.6fr)_minmax(0,1.4fr)] lg:gap-14 lg:py-20">
          <h2 className={`${sectionTitle} text-paper`}>{t("aboutNeverTitle")}</h2>
          <ol className="landing-reveal grid border-t border-paper/25">
            {neverItems.map((key, index) => (
              <li className="grid grid-cols-[2.4rem_minmax(0,1fr)] gap-3 border-b border-paper/25 py-4 text-base leading-7" key={key}>
                <span className="font-display text-sm font-bold text-saffron">0{index + 1}</span>
                <span>{t(key)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1040px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(14rem,0.6fr)_minmax(0,1.4fr)] lg:gap-14 lg:py-20">
        <div className="grid content-start gap-4">
          <h2 className={sectionTitle}>{t("aboutPeopleTitle")}</h2>
          <p className="text-base leading-8 text-ink-mute">{t("aboutPeopleBody")}</p>
        </div>
        <ul className="landing-reveal grid border-t-2 border-ink">
          {demoLogins.map((login) => (
            <li className="grid gap-1 border-b border-paper-line py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline" key={login.personId}>
              <span className="font-display text-xl font-semibold">{login.label}</span>
              <span className="text-sm text-ink-mute"><span className="text-xs font-bold uppercase tracking-[0.1em]">{t("aboutPeoplePhone")}</span> <span className="tabular-nums">{login.phone}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-paper-line bg-paper-shade">
        <div className="mx-auto grid w-full max-w-[1040px] gap-8 px-5 py-14 sm:px-8 lg:py-20">
          <div className="grid max-w-3xl gap-3">
            <p className="text-sm font-bold text-indigo-deep">{t("aboutGuideEyebrow")}</p>
            <h2 className={sectionTitle}>{t("aboutGuideTitle")}</h2>
            <p className="text-base leading-8 text-ink-mute">{t("aboutGuideBody")}</p>
          </div>
          <ol className="landing-reveal border-y border-paper-line">
            {guideItems.map(({ body, outcome, title }, index) => (
              <li className="grid gap-2 border-b border-paper-line py-5 last:border-b-0 lg:grid-cols-[3rem_11rem_minmax(0,1fr)_minmax(14rem,0.7fr)] lg:items-baseline lg:gap-5" key={title}>
                <span className="font-display text-sm font-bold text-saffron">0{index + 1}</span>
                <h3 className="font-display text-2xl font-semibold">{t(title)}</h3>
                <p className="text-sm leading-6 text-ink-mute">{t(body)}</p>
                <p className="text-sm font-bold leading-6 text-indigo-deep">{t(outcome)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1040px] gap-8 px-5 py-14 sm:px-8 lg:py-20">
        <h2 className={sectionTitle}>{t("aboutScopeTitle")}</h2>
        <div className="grid gap-6 border-y border-paper-line py-6 md:grid-cols-2 md:gap-10">
          <div className="grid content-start gap-2">
            <h3 className="font-display text-2xl font-semibold text-green-deep">{t("aboutScopeBuilt")}</h3>
            <p className="text-base leading-7 text-ink-mute">{t("aboutScopeBuiltBody")}</p>
          </div>
          <div className="grid content-start gap-2">
            <h3 className="font-display text-2xl font-semibold text-brick">{t("aboutScopeNotBuilt")}</h3>
            <p className="text-base leading-7 text-ink-mute">{t("aboutScopeNotBuiltBody")}</p>
          </div>
        </div>
        <p className="text-sm leading-7 text-ink-mute">
          {t("aboutStack")}{" "}
          <a className="inline-flex items-center gap-1 font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4" href={githubUrl} rel="noreferrer" target="_blank">GitHub<ArrowUpRight aria-hidden className="size-3.5" /></a>
        </p>
        <div className="grid gap-5 bg-indigo-tint p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-8">
          <div className="grid gap-2">
            <h2 className="font-display text-3xl font-semibold leading-none text-indigo-deep sm:text-4xl">{t("aboutClosingTitle")}</h2>
            <p className="max-w-2xl text-sm leading-7 text-ink-mute">{t("aboutClosingBody")}</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] bg-indigo-deep px-5 font-display text-sm font-semibold text-paper transition-colors hover:bg-indigo" href={openHref}>
            {t("aboutClosingAction")}<ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
