"use client";

import Link from "next/link";
import { ArrowRight, MessageSquareText, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SimulatedChip } from "@/components/ui/status";
import { FilePanel } from "@/components/ui/file-panel";
import { useAuthStore } from "@/features/auth/store";
import { useCitizenStore } from "@/features/graph/store";
import { getAvailableWorkflows } from "@/features/services/availability";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { rankServices } from "../aliases";
import { intentExamples } from "../examples";
import { buildIntentContext, classifyIntent } from "../intent-client";
import { planTitle } from "../intent-fallback";
import type { IntentResponse, RoutableIntent, WorkflowSlug } from "../schema";

type Suggestion = { label: MessageKey; href?: string };

function suggestionsFor(personId: string, available: Set<string>): Suggestion[] {
  if (personId === "person:priya") {
    return [
      { label: "suggestMarriage" },
      { label: "suggestDocuments", href: "/documents" },
      { label: "suggestProfile", href: "/you" },
      { label: "suggestBusiness" },
    ];
  }
  if (personId === "person:sunita") {
    return [
      { label: "suggestProfile", href: "/you" },
      { label: "suggestDocuments", href: "/documents" },
      { label: "suggestBusiness" },
    ];
  }
  return [
    ...(available.has("epfo") ? [{ label: "suggestEpfo" as const }] : []),
    ...(available.has("marriage") ? [{ label: "suggestMarriage" as const }] : []),
    ...(available.has("obligations") ? [{ label: "suggestPayments" as const }] : []),
    ...(available.has("loan") ? [{ label: "suggestLoan" as const }] : []),
    ...(available.has("record-correction") ? [{ label: "suggestRecordCorrection" as const }] : []),
  ];
}

/** Where a route lands in the app. Challan-flavoured payment requests open the challan flow; other payment talk lands on the Home ledger. */
function hrefForRoute(route: WorkflowSlug, text: string, hasBenefitApplication: boolean) {
  if (route === "service-unavailable") return "/services";
  if (route === "documents") return "/documents";
  if (route === "profile") return "/you";
  if (route === "benefit-application") return hasBenefitApplication ? "/workflows/benefit-application" : "/discover";
  if (route === "obligations") return /(challan|चालान|ಚಲನ್|ದಂಡ|fine|traffic)/iu.test(text) ? "/workflows/obligations" : "/home#attention";
  return `/workflows/${route}`;
}

export function IntentComposer() {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const personId = useAuthStore((state) => state.personId);
  const [text, setText] = useState("");
  const [result, setResult] = useState<IntentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const resultRef = useRef<HTMLElement>(null);
  const available = new Set(personId ? getAvailableWorkflows(graph, personId) : []);
  const suggestions = personId ? suggestionsFor(personId, available) : [];
  const routes: RoutableIntent[] = personId ? buildIntentContext(graph, personId).availableWorkflows : [];
  const hasBenefitApplication = graph.nodes.some((node) => node.type === "application" && node.attrs.kind === "benefit" && node.attrs.participants?.includes(personId ?? "") === true);
  const liveMatches = result || loading ? [] : rankServices(text, routes).slice(0, 3);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ block: "center" });
  }, [result]);

  const submit = async (nextText = text) => {
    const trimmed = nextText.trim();
    if (!personId) return;
    if (trimmed.length < 3) {
      setError(t("intentRequired"));
      return;
    }
    setError("");
    setText(trimmed);
    setLoading(true);
    setResult(null);
    const response = await classifyIntent(trimmed, buildIntentContext(graph, personId));
    setResult(response);
    setLoading(false);
  };

  const fillExample = () => {
    const examples = intentExamples[language];
    setText(examples[exampleIndex % examples.length]);
    setExampleIndex((index) => index + 1);
    setResult(null);
    setError("");
  };
  const resultHref = result ? hrefForRoute(result.route, text, hasBenefitApplication) : "/home";

  return (
    <section className="grid min-w-0 gap-4">
      <FilePanel className="grid gap-4" label={t("newRequest")}>
        <label>
          <span className="sr-only">{t("needPrompt")}</span>
          <textarea aria-describedby={error ? "intent-error" : undefined} aria-invalid={Boolean(error)} className="min-h-28 w-full resize-none rounded-[3px] border border-paper-line bg-paper p-4 font-display text-[1.65rem] font-medium leading-[1.08] text-ink outline-none placeholder:text-ink-mute focus:border-indigo-deep focus:ring-4 focus:ring-indigo-tint sm:text-[1.9rem]" maxLength={800} onChange={(event) => { setText(event.target.value); setError(""); setResult(null); }} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") void submit(); }} placeholder={t("intentPlaceholder")} value={text} />
        </label>
        {error ? <p className="text-sm font-bold text-brick" id="intent-error" role="alert">{error}</p> : null}
        {liveMatches.length ? (
          <div aria-live="polite" className="grid gap-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-mute">{t("intentMatches")}</p>
            <ul className="grid gap-1 sm:flex sm:flex-wrap sm:gap-2">
              {liveMatches.map((match) => (
                <li key={match.route}><Link className="inline-flex min-h-11 items-center gap-2 rounded-[2px] border border-paper-line px-3 text-sm font-bold text-indigo-deep transition-colors hover:border-indigo-deep" href={hrefForRoute(match.route, text, hasBenefitApplication)}>{planTitle(language, match.route)}<ArrowRight aria-hidden className="size-3.5" /></Link></li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-col items-stretch gap-2 border-t border-paper-line pt-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
          <button className="flex min-h-11 items-center justify-center gap-2 rounded-[2px] px-2 text-xs font-bold text-ink-mute transition-colors hover:bg-paper hover:text-ink min-[380px]:justify-start" onClick={fillExample} type="button"><MessageSquareText aria-hidden className="size-4" />{t("demoVoice")}</button>
          <Button className="min-h-11 px-4" loading={loading} onClick={() => void submit()}>{t("send")} <Send aria-hidden className="size-4" /></Button>
        </div>
      </FilePanel>

      <div className="flex flex-wrap gap-x-5 gap-y-1" aria-label={t("suggested")}>
        {suggestions.map((suggestion) => suggestion.href ? (
          <Link className="min-h-11 content-center text-sm font-bold leading-5 text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4 transition-colors hover:decoration-indigo-deep" href={suggestion.href} key={suggestion.label}>{t(suggestion.label)}</Link>
        ) : (
          <button className="min-h-11 text-left text-sm font-bold leading-5 text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4 transition-colors hover:decoration-indigo-deep" key={suggestion.label} onClick={() => void submit(t(suggestion.label))} type="button">{t(suggestion.label)}</button>
        ))}
      </div>

      {result ? (
        <article className="page-enter grid gap-5 rounded-[3px] border border-indigo/25 bg-indigo-tint p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-6" ref={resultRef}>
          <div className="grid gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-display text-2xl font-semibold leading-tight text-ink">{result.title}</h2><SimulatedChip authority={result.authority} /></div>
            <p className="max-w-2xl text-sm leading-6 text-ink sm:text-base">{result.reply}</p>
            <ol className="grid gap-1.5">
              {result.steps.map((step, index) => <li className="flex gap-2 text-xs font-semibold text-ink-mute" key={step}><span className="text-indigo-deep">{index + 1}.</span>{step}</li>)}
            </ol>
            {result.clarification ? <p className="text-sm font-bold text-ink">{result.clarification}</p> : null}
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] bg-indigo-deep px-5 text-sm font-bold text-paper transition-colors hover:bg-indigo" href={resultHref}>
            {result.route === "service-unavailable" ? t("unavailablePageAction") : result.route === "obligations" ? t("view") : t("continueAction")} <ArrowRight aria-hidden className="size-4" />
          </Link>
        </article>
      ) : null}
    </section>
  );
}
