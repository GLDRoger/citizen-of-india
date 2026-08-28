"use client";

import { ArrowRight, X } from "lucide-react";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

const cannotKeys: MessageKey[] = ["boundaryCannotOne", "boundaryCannotTwo", "boundaryCannotThree", "boundaryCannotFour"];
const canKeys: MessageKey[] = ["boundaryCanOne", "boundaryCanTwo", "boundaryCanThree", "boundaryCanFour"];

export function PublicServiceBoundary({ id }: { id?: string }) {
  const { t } = useI18n();
  return (
    <section className="mx-auto grid w-full max-w-[1040px] scroll-mt-16 gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:gap-14 lg:py-20" id={id}>
      <div className="grid content-start gap-4">
        <p className="text-sm font-bold text-indigo-deep">{t("boundaryKicker")}</p>
        <p className="font-display text-[clamp(4.8rem,12vw,9rem)] font-semibold leading-[0.74] tracking-[-0.055em] text-brick">{t("boundaryMetric")}</p>
        <p className="max-w-sm text-base font-semibold leading-7 text-ink">{t("boundaryMetricBody")}</p>
      </div>
      <div className="grid content-start gap-6">
        <div className="grid gap-3"><h2 className="font-display text-[clamp(2.6rem,5vw,4.5rem)] font-semibold leading-[0.92] tracking-[-0.04em]">{t("boundaryTitle")}</h2><p className="max-w-2xl text-base leading-8 text-ink-mute">{t("boundaryBody")}</p></div>
        <div className="grid border-y border-paper-line sm:grid-cols-2">
          <div className="py-5 sm:pr-6"><h3 className="mb-3 text-sm font-extrabold text-brick">{t("boundaryCannotTitle")}</h3><ul className="grid gap-3">{cannotKeys.map((key) => <li className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2 text-sm leading-6 text-ink-mute" key={key}><X aria-hidden className="mt-1 size-4 text-brick" /><span>{t(key)}</span></li>)}</ul></div>
          <div className="border-t border-paper-line py-5 sm:border-l sm:border-t-0 sm:pl-6"><h3 className="mb-3 text-sm font-extrabold text-indigo-deep">{t("boundaryCanTitle")}</h3><ul className="grid gap-3">{canKeys.map((key) => <li className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2 text-sm leading-6 text-ink" key={key}><ArrowRight aria-hidden className="mt-1 size-4 text-saffron" /><span>{t(key)}</span></li>)}</ul></div>
        </div>
      </div>
    </section>
  );
}
