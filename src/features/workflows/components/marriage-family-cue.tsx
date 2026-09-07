"use client";

import { useI18n } from "@/i18n/use-i18n";
import { getInitials } from "@/lib/format";

/** One recorded relationship, with both people's identities kept visible. */
export function MarriageFamilyCue({ names }: { names: [string, string] }) {
  const { t } = useI18n();
  return (
    <section aria-label={t("marriageFamilyRecorded")} className="flex flex-col items-start gap-4 rounded-[3px] border border-green-deep/20 bg-green-tint p-5 sm:flex-row sm:items-center">
      <div aria-hidden className="isolate flex shrink-0 -space-x-3">
        {names.map((name, index) => <span className={`grid size-12 place-items-center rounded-full border-4 border-green-tint font-display text-sm font-bold ${index === 0 ? "z-10 bg-indigo-deep text-paper" : "bg-paper text-indigo-deep"}`} key={name}>{getInitials(name)}</span>)}
      </div>
      <div className="grid min-w-0 gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-green-deep">{t("marriageFamilyRecorded")}</p>
        <h2 className="font-display text-2xl font-semibold leading-tight text-indigo-deep">{names[0]} <span className="text-green-deep">&amp;</span> {names[1]}</h2>
      </div>
    </section>
  );
}
