"use client";

import { Compass, MoveLeft } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { useI18n } from "@/i18n/use-i18n";

export function ServiceUnavailable() {
  const { t } = useI18n();
  return (
    <Page className="grid min-h-[75vh] place-content-center justify-items-start gap-5">
      <Compass aria-hidden className="size-7 text-brick" />
      <p className="eyebrow">{t("serviceUnavailable")}</p>
      <h1 className="max-w-2xl font-display text-5xl font-semibold leading-[0.92] tracking-[-0.045em] text-ink sm:text-7xl">{t("unavailablePageTitle")}</h1>
      <p className="max-w-xl text-sm leading-6 text-ink-mute">{t("unavailablePageBody")}</p>
      <LinkButton href="/services"><MoveLeft aria-hidden className="size-4" />{t("unavailablePageAction")}</LinkButton>
    </Page>
  );
}
