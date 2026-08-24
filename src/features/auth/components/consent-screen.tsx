"use client";

import { ArrowRight, Database, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/use-i18n";
import { useAuthStore } from "../store";

export function ConsentScreen() {
  const { t } = useI18n();
  const giveConsent = useAuthStore((state) => state.giveConsent);
  const signOut = useAuthStore((state) => state.signOut);
  const points = [
    { icon: ShieldCheck, text: t("consentPointOne") },
    { icon: RotateCcw, text: t("consentPointTwo") },
    { icon: Database, text: t("consentPointThree") },
  ];

  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-5 py-10">
      <section className="grid w-full max-w-2xl gap-8 rounded-[28px] border border-line bg-surface p-6 sm:p-10">
        <div className="grid gap-4">
          <span className="grid size-12 place-items-center rounded-full bg-action-soft text-action"><ShieldCheck aria-hidden className="size-6" /></span>
          <h1 className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-ink sm:text-5xl">{t("consentTitle")}</h1>
          <p className="max-w-xl text-sm leading-6 text-ink-muted sm:text-base">{t("consentBody")}</p>
        </div>
        <div className="grid gap-3">
          {points.map(({ icon: Icon, text }) => (
            <div className="flex gap-3 border-t border-line pt-3" key={text}>
              <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-action" />
              <p className="text-sm leading-6 text-ink">{text}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button className="sm:flex-1" onClick={giveConsent}>{t("giveConsent")} <ArrowRight aria-hidden className="size-4" /></Button>
          <Button onClick={signOut} variant="quiet">{t("back")}</Button>
        </div>
      </section>
    </main>
  );
}
