"use client";

import Link from "next/link";
import { MessageCircleQuestion, SendHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { RichText } from "@/components/rich-text";
import { Button } from "@/components/ui/button";
import { SimulatedChip } from "@/components/ui/status";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";
import { answerQuestion, type Answer } from "./knowledge";

interface Message { id: number; from: "bot" | "user"; text: string; href?: string; hrefLabel?: string }

const suggestionKeys: MessageKey[] = ["askSuggest1", "askSuggest2", "askSuggest3", "askSuggest4"];
const replyDelay = () => 400 + Math.round(Math.random() * 300);

function Bubble({ message }: { message: Message }) {
  const isUser = message.from === "user";
  return (
    <li className={cn("grid gap-2", isUser ? "justify-items-end" : "justify-items-start")}>
      <div className={cn("max-w-[88%] rounded-[3px] px-3.5 py-2.5 text-sm leading-6", isUser ? "bg-indigo-deep text-paper" : "bg-paper-shade text-ink")}>
        {isUser ? message.text : <RichText entrance="load" text={message.text} />}
      </div>
      {message.href ? (
        <Link className="inline-flex min-h-9 items-center gap-1 rounded-[3px] border border-indigo-deep/35 px-3 text-xs font-bold text-indigo-deep transition-colors hover:bg-indigo-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-deep" href={message.href}>
          {message.hrefLabel}
        </Link>
      ) : null}
    </li>
  );
}

function Typing({ reduced }: { reduced: boolean }) {
  return (
    <li aria-hidden className="flex">
      <span className="inline-flex min-h-10 items-center gap-1 rounded-[3px] bg-paper-shade px-3.5">
        {[0, 1, 2].map((dot) => <span className={cn("size-1.5 rounded-full bg-ink-mute", !reduced && "animate-bounce")} key={dot} style={reduced ? undefined : { animationDelay: `${dot * 120}ms` }} />)}
      </span>
    </li>
  );
}

function AskPanel({ onClose, titleId }: { onClose: () => void; titleId: string }) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>(() => [{ id: 0, from: "bot", text: t("askIntro") }]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // The panel only mounts after a tap, so the media query is safe to read here.
  const [reduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const nextId = useRef(1);
  const showSuggestions = messages.length === 1 && !isTyping;

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(timer.current); };
  }, [onClose]);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" }); }, [messages, isTyping, reduced]);

  const send = useCallback((text: string) => {
    const question = text.trim();
    if (!question || isTyping) return;
    const reply: Answer = answerQuestion(question, t);
    setMessages((current) => [...current, { id: nextId.current++, from: "user", text: question }]);
    setDraft("");
    setIsTyping(true);
    timer.current = setTimeout(() => {
      setMessages((current) => [...current, { id: nextId.current++, from: "bot", text: reply.answer, href: reply.href, hrefLabel: reply.hrefLabel }]);
      setIsTyping(false);
    }, replyDelay());
  }, [isTyping, t]);

  return (
    <section aria-labelledby={titleId} className="fixed inset-x-0 bottom-0 z-[90] flex max-h-[70dvh] flex-col border-t border-paper-line bg-paper shadow-[0_-8px_32px_rgba(19,28,75,0.18)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[22rem] sm:rounded-[3px] sm:border" role="dialog">
      <header className="flex items-start justify-between gap-3 border-b border-paper-line px-4 py-3">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold leading-none text-indigo-deep" id={titleId}>{t("askTitle")}</h2>
            <SimulatedChip authority="Citizen" />
          </div>
          <p className="text-xs leading-5 text-ink-mute">{t("askSubtitle")}</p>
        </div>
        <button aria-label={t("askClose")} className="grid size-10 shrink-0 place-items-center rounded-[3px] text-ink-mute transition-colors hover:bg-paper-shade hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-deep" onClick={onClose} type="button"><X aria-hidden className="size-5" /></button>
      </header>
      <ol aria-live="polite" className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto px-4 py-4" ref={listRef}>
        {messages.map((message) => <Bubble key={message.id} message={message} />)}
        {isTyping ? <Typing reduced={reduced} /> : null}
        {showSuggestions ? (
          <li className="flex flex-wrap gap-2">
            {suggestionKeys.map((key) => (
              <button className="min-h-9 rounded-[3px] border border-paper-line bg-paper px-3 text-left text-xs font-bold text-indigo-deep transition-colors hover:border-indigo/45 hover:bg-indigo-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-deep" key={key} onClick={() => send(t(key))} type="button">{t(key)}</button>
            ))}
          </li>
        ) : null}
      </ol>
      <form className="flex items-center gap-2 border-t border-paper-line p-3 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]" onSubmit={(event) => { event.preventDefault(); send(draft); }}>
        <input aria-label={t("askPlaceholder")} autoComplete="off" className="min-h-11 min-w-0 flex-1 rounded-[3px] border border-paper-line bg-paper px-3 text-sm text-ink placeholder:text-ink-mute focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-deep" onChange={(event) => setDraft(event.target.value)} placeholder={t("askPlaceholder")} ref={inputRef} value={draft} />
        <Button aria-label={t("askSend")} className="px-3" disabled={!draft.trim() || isTyping} type="submit"><SendHorizontal aria-hidden className="size-4" /></Button>
      </form>
    </section>
  );
}

/**
 * A modest floating helper for the landing page. Scripted, and says so: it
 * matches keywords against the FAQ and journey list, then replies after a
 * short pause so it reads as a conversation rather than a lookup.
 */
export function AskCitizen() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const close = useCallback(() => { setIsOpen(false); requestAnimationFrame(() => launcherRef.current?.focus()); }, []);

  return (
    <>
      {isOpen ? <AskPanel onClose={close} titleId={titleId} /> : null}
      <button
        aria-expanded={isOpen}
        aria-label={t("askOpen")}
        className={cn("fixed bottom-4 right-4 z-[91] inline-flex min-h-12 items-center gap-2 rounded-[3px] bg-indigo-deep px-4 font-display text-sm font-semibold text-paper shadow-[0_4px_16px_rgba(19,28,75,0.28)] transition-colors hover:bg-indigo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-deep sm:bottom-5 sm:right-5", isOpen && "invisible")}
        onClick={() => setIsOpen(true)}
        ref={launcherRef}
        type="button"
      >
        <MessageCircleQuestion aria-hidden className="size-5" />
        {t("askTitle")}
      </button>
    </>
  );
}
