"use client";

import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

const additions: MessageKey[] = [
  "roundTwoBrief", "roundTwoReady", "roundTwoOwner", "roundTwoConsent",
  "roundTwoFamily", "roundTwoOutcome", "roundTwoRedress", "roundTwoHistory",
  "roundTwoRecords", "roundTwoRecovery", "roundTwoClarity", "roundTwoStory", "roundTwoContinuity",
];
const lessons: MessageKey[] = [
  "roundTwoLessonRecord", "roundTwoLessonReady", "roundTwoLessonTrust",
  "roundTwoLessonOutcome", "roundTwoLessonDepth",
];

function UpdateList({ items }: { items: MessageKey[] }) {
  const { t } = useI18n();
  return (
    <ul className="list-disc space-y-4 pl-5 text-sm leading-6 text-ink marker:text-indigo-deep sm:text-base sm:leading-7">
      {items.map((key) => <li className="pl-1" key={key}>{t(key)}</li>)}
    </ul>
  );
}

export function RoundTwoUpdate() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = triggerRef.current;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    dialog.scrollTop = 0;
    titleRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <button aria-haspopup="dialog" className="inline-flex min-h-11 w-fit items-center gap-2 text-left text-sm font-semibold text-paper/85 underline decoration-paper/40 underline-offset-4 transition-colors hover:text-paper hover:decoration-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper active:opacity-75" onClick={() => setOpen(true)} ref={triggerRef} type="button">
        {t("roundTwoButton")}<ArrowUpRight aria-hidden className="size-4 shrink-0" />
      </button>
      <dialog aria-labelledby="round-two-title" className="fixed inset-0 m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-[4px] border border-paper-line bg-paper p-0 text-ink backdrop:bg-ink/80 sm:max-h-[calc(100dvh-4rem)]" onCancel={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }} onClose={() => setOpen(false)} ref={dialogRef}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-paper-line bg-paper px-5 py-3 sm:px-8">
          <p className="text-xs font-bold tracking-wide text-ink-mute">{t("roundTwoDates")}</p>
          <button aria-label={t("close")} className="grid size-11 shrink-0 place-items-center rounded-sm text-ink-mute hover:bg-paper-shade hover:text-ink focus-visible:outline-2 focus-visible:outline-indigo-deep active:bg-paper-line" onClick={() => setOpen(false)} type="button"><X aria-hidden className="size-5" /></button>
        </div>
        <div className="grid gap-8 px-5 py-6 sm:gap-10 sm:px-8 sm:py-8">
          <header className="grid gap-3">
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-indigo-deep outline-none sm:text-5xl" id="round-two-title" ref={titleRef} tabIndex={-1}>{t("roundTwoTitle")}</h2>
            <p className="max-w-[65ch] text-base leading-7 text-ink-mute">{t("roundTwoIntro")}</p>
          </header>
          <section aria-labelledby="round-two-added" className="grid gap-5">
            <h3 className="font-display text-2xl font-semibold leading-tight text-indigo-deep" id="round-two-added">{t("roundTwoAdded")}</h3>
            <UpdateList items={additions} />
          </section>
          <section aria-labelledby="round-two-learned" className="grid gap-5 border-t border-paper-line pt-7">
            <h3 className="font-display text-2xl font-semibold leading-tight text-indigo-deep" id="round-two-learned">{t("roundTwoLearned")}</h3>
            <p className="text-sm leading-6 text-ink-mute">{t("roundTwoResearchNote")}</p>
            <UpdateList items={lessons} />
          </section>
          <p className="border-t border-paper-line pt-5 text-xs leading-5 text-ink-mute">{t("roundTwoBoundary")}</p>
        </div>
      </dialog>
    </>
  );
}
