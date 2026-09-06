"use client";

import { RichText } from "@/components/rich-text";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

interface Item {
  body: MessageKey;
  title: MessageKey;
}

const done: Item[] = [
  { body: "landingHereDoneOneBody", title: "landingHereDoneOne" },
  { body: "landingHereDoneTwoBody", title: "landingHereDoneTwo" },
  { body: "landingHereDoneThreeBody", title: "landingHereDoneThree" },
  { body: "landingHereDoneFourBody", title: "landingHereDoneFour" },
  { body: "landingHereDoneFiveBody", title: "landingHereDoneFive" },
];

const left: Item[] = [
  { body: "landingHereLeftOneBody", title: "landingHereLeftOne" },
  { body: "landingHereLeftTwoBody", title: "landingHereLeftTwo" },
  { body: "landingHereLeftThreeBody", title: "landingHereLeftThree" },
  { body: "landingHereLeftFourBody", title: "landingHereLeftFour" },
  { body: "landingHereLeftFiveBody", title: "landingHereLeftFive" },
  { body: "landingHereLeftSixBody", title: "landingHereLeftSix" },
  { body: "landingHereLeftSevenBody", title: "landingHereLeftSeven" },
  { body: "landingHereLeftEightBody", title: "landingHereLeftEight" },
  { body: "landingHereLeftNineBody", title: "landingHereLeftNine" },
  { body: "landingHereLeftTenBody", title: "landingHereLeftTen" },
];

function Column({ items, stamp, title, tone }: { items: Item[]; stamp: MessageKey; title: MessageKey; tone: "done" | "left" }) {
  const { t } = useI18n();
  const isDone = tone === "done";
  return (
    <div className={`grid content-start gap-4 rounded-[6px] border p-5 sm:p-6 ${isDone ? "border-green-deep/30 bg-green-deep/[0.06]" : "border-brick/30 bg-brick-tint/50"}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className={`font-display text-2xl font-semibold leading-none ${isDone ? "text-green-deep" : "text-brick"}`}>{t(title)}</h3>
        <span className={`stamp shrink-0 ${isDone ? "stamp--verified" : "border-brick/60 text-brick"}`}>{t(stamp)}</span>
      </div>
      <ul className={`grid ${isDone ? "divide-y divide-ink/10" : "gap-x-6 sm:grid-cols-2 [&>li]:border-t [&>li]:border-ink/10 [&>li:first-child]:border-t-0 sm:[&>li:nth-child(2)]:border-t-0"}`}>
        {items.map((item) => (
          <li className={`grid content-start gap-0.5 py-3 ${isDone ? "first:pt-0 last:pb-0" : ""}`} key={item.title}>
            <strong className="text-sm text-ink">{t(item.title)}</strong>
            <span className="text-sm leading-6 text-ink-mute">{t(item.body)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The public foundations that already won (Aadhaar sign-in, DigiLocker, UPI,
 * e-KYC) against the services that still live in separate portals. Citizen is
 * the connection for the second column, built on the first.
 */
export function AlreadyHere({ id }: { id?: string }) {
  const { t } = useI18n();
  return (
    <section className="scroll-mt-16 border-b border-paper-line bg-paper" id={id}>
      <div className="mx-auto grid w-full max-w-[1040px] gap-10 px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-5">
          <p className="text-sm font-bold text-indigo-deep">{t("landingHereKicker")}</p>
          <h2 className="max-w-[18ch] font-display text-[clamp(2.7rem,5.4vw,4.8rem)] font-semibold leading-[0.92] tracking-[-0.045em]"><RichText text={t("landingHereTitle")} /></h2>
          <p className="dropcap max-w-2xl text-base leading-8 text-ink-mute"><RichText text={t("landingHereBody")} /></p>
        </div>
        <div className="landing-reveal grid gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-start md:gap-6">
          <Column items={done} stamp="verified" title="landingHereDone" tone="done" />
          <Column items={left} stamp="landingHereNeeds" title="landingHereLeft" tone="left" />
        </div>
        <p className="max-w-3xl border-l-4 border-saffron pl-5 font-display text-xl font-semibold leading-snug text-indigo-deep sm:text-2xl"><RichText text={t("landingHereClosing")} /></p>
      </div>
    </section>
  );
}
