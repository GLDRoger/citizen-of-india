"use client";

import Link from "next/link";
import { CircleHelp, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { RichText } from "@/components/rich-text";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

const topics: Array<{ question: MessageKey; answer?: MessageKey }> = [
  { question: "askSuggest1", answer: "landingFaqSevenA" },
  { question: "askSuggest2", answer: "landingFaqFourA" },
  { question: "askSuggest3", answer: "landingFaqOneA" },
  { question: "askSuggest4" },
];
const journeys: MessageKey[] = ["marriageService", "challanWorkflowTitle", "epfoService", "recordCorrectionService", "loanService", "startBusinessService"];

/** Direct FAQ choices, not a chatbot: no free-text interpretation or pretend typing. */
export function AskCitizen() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const launcher = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const close = () => { setOpen(false); requestAnimationFrame(() => launcher.current?.focus()); };
  useEffect(() => { if (open) closeButton.current?.focus(); }, [open]);
  const topic = topics[selected];
  const answer = topic.answer ? t(topic.answer) : t("askJourneys", { journeys: journeys.map((key) => t(key)).join(", ") });
  return (
    <>
      {open ? (
        <section aria-labelledby={`${id}-title`} className="fixed inset-x-0 bottom-0 z-[90] grid max-h-[75dvh] gap-4 overflow-y-auto border-t border-paper-line bg-paper p-5 shadow-[0_-8px_32px_rgba(19,28,75,0.18)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[24rem] sm:rounded-[3px] sm:border" onKeyDown={(event) => { if (event.key === "Escape") close(); }}>
          <header className="flex items-start justify-between gap-4">
            <div><h2 className="font-display text-xl font-semibold text-indigo-deep" id={`${id}-title`}>{t("askTitle")}</h2><p className="mt-1 text-xs leading-5 text-ink-mute">{t("askSubtitle")}</p></div>
            <button aria-label={t("askClose")} className="grid size-11 shrink-0 place-items-center rounded-[3px] hover:bg-paper-shade focus-visible:outline-2 focus-visible:outline-indigo-deep" onClick={close} ref={closeButton} type="button"><X aria-hidden className="size-5" /></button>
          </header>
          <div className="grid grid-cols-2 gap-2" aria-label={t("askTitle")}>
            {topics.map((item, index) => <button aria-controls={`${id}-answer`} aria-pressed={index === selected} className={`min-h-11 rounded-[3px] border p-3 text-left text-sm font-semibold leading-5 focus-visible:outline-2 focus-visible:outline-indigo-deep ${index === selected ? "border-indigo-deep bg-indigo-tint text-indigo-deep" : "border-paper-line text-ink hover:bg-paper-shade"}`} key={item.question} onClick={() => setSelected(index)} type="button">{t(item.question)}</button>)}
          </div>
          <div aria-live="polite" className="grid gap-3 border-t border-paper-line pt-4" id={`${id}-answer`}>
            <p className="text-sm leading-6 text-ink"><RichText entrance="load" text={answer} /></p>
            <Link className="min-h-11 content-center text-sm font-bold text-indigo-deep underline underline-offset-4" href={selected === 3 ? "/start" : "/about"}>{t(selected === 3 ? "askTryDemo" : "about")}</Link>
          </div>
        </section>
      ) : null}
      <button aria-expanded={open} className={`fixed bottom-4 right-4 z-[91] inline-flex min-h-12 items-center gap-2 rounded-[3px] bg-indigo-deep px-4 text-sm font-semibold text-paper shadow-lg hover:bg-indigo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-deep ${open ? "invisible" : ""}`} onClick={() => setOpen(true)} ref={launcher} type="button"><CircleHelp aria-hidden className="size-5" />{t("askTitle")}</button>
    </>
  );
}
