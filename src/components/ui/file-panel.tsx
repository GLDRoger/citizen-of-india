import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PanelTone = "paper" | "ink";

/**
 * A panel in the gazette register: a small kicker sitting on a heavy rule,
 * then the content. `tone="ink"` inverts the panel for the surfaces that ask
 * the citizen to act (the request box, next actions); everything else stays
 * white on the paper page. `aside` renders on the right of the kicker row.
 */
export function FilePanel({ label, children, className, aside, tone = "paper" }: { label: string; children: ReactNode; className?: string; aside?: ReactNode; tone?: PanelTone }) {
  const ink = tone === "ink";
  return (
    <section className={cn("rounded-[3px] border p-5", ink ? "border-ink bg-ink text-paper" : "border-paper-line bg-panel text-ink", className)} data-tone={tone}>
      <div className={cn("mb-3 flex items-end justify-between gap-3 border-b-2 pb-2", ink ? "border-paper/70" : "border-ink")}><span className={cn("eyebrow block", ink ? "text-saffron" : "text-indigo-deep")}>{label}</span>{aside}</div>
      {children}
    </section>
  );
}

export function LedgerRow({ label, value, action, tone }: { label: string; value: ReactNode; action?: ReactNode; tone?: "brick" | "green" | "ink" }) {
  const colour = tone === "brick" ? "text-brick" : tone === "green" ? "text-green-deep" : "text-ink";
  return (
    <div className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-paper-line py-3 last:border-b-0">
      <span className="text-sm text-ink-mute">{label}</span>
      <div className="flex items-center gap-4"><strong className={cn("font-display text-2xl font-bold tabular-nums", colour)}>{value}</strong>{action}</div>
    </div>
  );
}
