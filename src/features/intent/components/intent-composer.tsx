"use client";

import Link from "next/link";
import { ArrowRight, Mic, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SimulatedChip } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";
import { buildIntentContext, classifyIntent } from "../intent-client";
import type { IntentResponse } from "../schema";

const suggestions = {
  en: ["My father passed away", "Register my marriage", "What payments are due?", "Can my business get a loan?", "Check a suspicious message", "Start a business"],
  hi: ["पापा की मृत्यु हो गई", "मेरी शादी रजिस्टर करें", "कौन से भुगतान बाकी हैं?", "क्या मेरे व्यवसाय को लोन मिल सकता है?", "संदिग्ध संदेश जाँचें", "व्यवसाय शुरू करें"],
  kn: ["ಅಪ್ಪ ತೀರಿಕೊಂಡರು", "ನನ್ನ ವಿವಾಹ ನೋಂದಾಯಿಸಿ", "ಯಾವ ಪಾವತಿಗಳು ಬಾಕಿ?", "ನನ್ನ ವ್ಯವಹಾರಕ್ಕೆ ಸಾಲ ಸಿಗಬಹುದೇ?", "ಅನುಮಾನಾಸ್ಪದ ಸಂದೇಶ ಪರಿಶೀಲಿಸಿ", "ವ್ಯವಹಾರ ಪ್ರಾರಂಭಿಸಿ"],
};

export function IntentComposer() {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const personId = useAuthStore((state) => state.personId);
  const [text, setText] = useState("");
  const [result, setResult] = useState<IntentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [result]);

  const submit = async (nextText = text) => {
    const trimmed = nextText.trim();
    if (!personId || trimmed.length < 3) return;
    setText(trimmed);
    setLoading(true);
    setResult(null);
    const response = await classifyIntent(trimmed, buildIntentContext(graph, personId));
    setResult(response);
    setLoading(false);
  };

  const mockVoice = () => {
    setListening(true);
    window.setTimeout(() => {
      const transcript = language === "kn" ? "ಅಪ್ಪ ತೀರಿಕೊಂಡರು, ಮುಂದೇನು ಮಾಡಬೇಕು?" : language === "hi" ? "पापा की मृत्यु हो गई, अब क्या करना होगा?" : "papa ki death ho gayi, kya karna hoga?";
      setText(transcript);
      setListening(false);
    }, 900);
  };

  return (
    <section className="grid min-w-0 gap-4">
      <div className="grid gap-4 rounded-[24px] border border-line bg-surface p-4 shadow-[0_20px_70px_oklch(0.28_0.03_85/0.08)] sm:p-5">
        <div className="flex justify-end"><SimulatedChip authority="Citizen intent assistant" /></div>
        <label>
          <span className="sr-only">{t("needPrompt")}</span>
          <textarea className="min-h-24 w-full resize-none border-0 bg-transparent font-display text-[1.75rem] font-medium leading-[1.05] tracking-[-0.035em] text-ink outline-none placeholder:text-ink-faint sm:min-h-28 sm:text-[2.35rem]" maxLength={800} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") void submit(); }} placeholder={t("intentPlaceholder")} value={text} />
        </label>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
          <button className="flex min-h-11 items-center gap-2 rounded-full px-2 text-xs font-bold text-ink-muted transition hover:bg-surface-strong hover:text-ink" onClick={mockVoice} type="button"><Mic aria-hidden className={cn("size-4", listening && "animate-pulse text-saffron")} />{listening ? t("listening") : t("voiceInput")}</button>
          <Button className="min-h-11 shrink-0 px-4" loading={loading} onClick={() => void submit()}>{t("send")} <Send aria-hidden className="size-4" /></Button>
        </div>
      </div>

      <div className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible" aria-label={t("suggested")}>
        {suggestions[language].map((suggestion) => (
          <button key={suggestion} className="min-h-10 shrink-0 rounded-full border border-line bg-surface px-4 text-xs font-bold text-ink-muted transition hover:border-action/40 hover:text-action-strong" onClick={() => void submit(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      {result ? (
        <article className="page-enter grid gap-5 rounded-[22px] border border-action/25 bg-action-soft p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-6" ref={resultRef}>
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2"><Sparkles aria-hidden className="size-4 text-action" /><p className="eyebrow">{result.title}</p><SimulatedChip authority={result.authority} /></div>
            <p className="max-w-2xl text-sm leading-6 text-ink sm:text-base">{result.reply}</p>
            <ol className="grid gap-1.5">
              {result.steps.map((step, index) => <li className="flex gap-2 text-xs font-semibold text-ink-muted" key={step}><span className="text-action">{index + 1}.</span>{step}</li>)}
            </ol>
            {result.clarification ? <p className="text-sm font-bold text-ink">{result.clarification}</p> : null}
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-action px-5 text-sm font-bold text-action-ink transition hover:bg-action-strong" href={`/workflows/${result.route}`}>
            {result.route === "service-unavailable" ? t("view") : t("start")} <ArrowRight aria-hidden className="size-4" />
          </Link>
        </article>
      ) : null}
    </section>
  );
}
