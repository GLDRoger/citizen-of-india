"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, ExternalLink, MessageSquareText, SearchCheck } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Page, PageHeader } from "@/components/ui/page";
import { SimulatedChip, VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getNotices } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { createFallbackExplanation } from "../fallback";
import { explainResponseSchema, type ExplainResponse } from "../schema";

export function InboxScreen() {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const notices = personId ? getNotices(graph, personId) : [];
  const [selectedId, setSelectedId] = useState(notices[0]?.node.id ?? "");
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const selected = notices.find((notice) => notice.node.id === selectedId) ?? notices[0];

  const explain = async () => {
    if (!selected) return;
    setLoading(true);
    setExplanation(null);
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: selected.node.attrs.body,
          language,
          context: {
            subject: selected.node.attrs.subject,
            sender: selected.node.attrs.sender,
            legitimacy: selected.node.attrs.legitimacy,
          },
        }),
      });
      if (!response.ok) throw new Error("Explanation unavailable");
      setExplanation(explainResponseSchema.parse(await response.json()));
    } catch {
      setExplanation(createFallbackExplanation(selected.node.attrs.legitimacy, language));
    } finally {
      setLoading(false);
    }
  };

  if (!selected) return <Page><EmptyState title={t("noItems")} /></Page>;
  const suspicious = selected.node.attrs.legitimacy === "scam";

  return (
    <Page className="grid gap-8">
      <PageHeader eyebrow={`${notices.filter((notice) => !notice.read).length} ${t("unread").toLowerCase()}`} title={t("inbox")} description="Messages linked to the records they refer to, with plain-language explanations and safety checks." action={<LinkButton href="/workflows/scam-check" variant="secondary"><SearchCheck aria-hidden className="size-4" /> {t("checkMessage")}</LinkButton>} />
      <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="divide-y divide-line border-y border-line">
          {notices.map((notice) => (
            <button
              key={notice.node.id}
              className={cn("grid w-full grid-cols-[auto_minmax(0,1fr)] gap-3 px-2 py-4 text-left transition hover:bg-surface-strong", selected.node.id === notice.node.id && "bg-action-soft")}
              onClick={() => { setSelectedId(notice.node.id); setExplanation(null); }}
            >
              <span className={cn("mt-1 size-2 rounded-full", notice.read ? "bg-line" : notice.node.attrs.legitimacy === "scam" ? "bg-danger" : "bg-action")} />
              <span className="min-w-0"><strong className="block truncate text-sm text-ink">{notice.node.attrs.subject}</strong><span className="mt-1 block truncate text-xs text-ink-muted">{notice.node.attrs.sender} · {formatDate(notice.node.attrs.receivedOn)}</span></span>
            </button>
          ))}
        </div>

        <article className="grid content-start gap-6 rounded-[22px] border border-line bg-surface p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={cn("grid size-9 place-items-center rounded-full", suspicious ? "bg-danger-soft text-danger" : "bg-success-soft text-success")}>{suspicious ? <AlertTriangle aria-hidden className="size-4" /> : <CheckCircle2 aria-hidden className="size-4" />}</span>
              <span className="text-xs font-bold capitalize text-ink-muted">{selected.node.attrs.channel}</span>
            </div>
            <VerificationBadge verification={selected.node.verification} />
          </div>
          <div className="grid gap-2"><p className="eyebrow">{selected.node.attrs.sender}</p><h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-ink">{selected.node.attrs.subject}</h2><p className="text-xs text-ink-faint">{formatDate(selected.node.attrs.receivedOn)}</p></div>
          <blockquote className="border-y border-line py-5 text-sm leading-7 text-ink-muted">{selected.node.attrs.body}</blockquote>

          {selected.node.attrs.scamSignals ? (
            <div className="grid gap-2"><p className="eyebrow">Warning signs</p><ul className="grid gap-2">{selected.node.attrs.scamSignals.map((signal) => <li className="flex gap-2 text-xs leading-5 text-danger" key={signal}><AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0" />{signal}</li>)}</ul></div>
          ) : null}

          {explanation ? (
            <div className="page-enter grid gap-4 rounded-[18px] bg-action-soft p-5">
              <div className="flex items-center justify-between gap-3"><p className="eyebrow">{t("explain")}</p><SimulatedChip authority={explanation.authority} /></div>
              <p className="font-display text-xl font-semibold leading-snug text-ink">{explanation.plainLanguage}</p>
              <div className="grid gap-1 text-xs leading-5 text-ink-muted"><strong className="text-ink">What it means</strong>{explanation.whatItMeans}</div>
              <div className="grid gap-1 text-xs leading-5 text-ink-muted"><strong className="text-ink">Next action</strong>{explanation.nextAction}</div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button loading={loading} onClick={() => void explain()} variant="secondary"><MessageSquareText aria-hidden className="size-4" /> {t("explain")}</Button>
            {suspicious ? <LinkButton href="/workflows/scam-check">{t("respond")} <ArrowRight aria-hidden className="size-4" /></LinkButton> : selected.node.attrs.relatedTo === "obl:echallan-500" ? <LinkButton href="/workflows/obligations">{t("respond")} <ArrowRight aria-hidden className="size-4" /></LinkButton> : null}
          </div>

          <details className="border-t border-line pt-4">
            <summary className="flex min-h-10 items-center justify-between text-xs font-bold text-ink-muted">{t("source")} <ExternalLink aria-hidden className="size-3.5" /></summary>
            <div className="grid gap-1 pb-2 pt-3 text-xs leading-5 text-ink-muted"><span><strong className="text-ink">{t("authority")}:</strong> {selected.node.verification.source}</span><span><strong className="text-ink">Checked:</strong> {formatDate(selected.node.verification.asOf)}</span><span><strong className="text-ink">Linked record:</strong> {selected.node.attrs.relatedTo ?? "No linked record"}</span></div>
          </details>
        </article>
      </div>
    </Page>
  );
}
