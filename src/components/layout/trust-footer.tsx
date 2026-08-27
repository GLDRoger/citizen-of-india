"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/use-i18n";

export function TrustFooter() {
  const { t } = useI18n();
  const statements = [t("footerPrototype"), t("footerSynthetic"), t("footerSimulated")];
  return (
    <footer className="border-t border-paper-line bg-paper-shade/65">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-5 py-7 text-xs leading-5 text-ink-mute sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5">{statements.map((statement) => <span key={statement}>{statement}</span>)}</div>
        <Link className="w-fit font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4 hover:decoration-indigo-deep" href="/about">{t("about")}</Link>
      </div>
    </footer>
  );
}
