import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  action: "bg-action-soft text-action-strong",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  saffron: "bg-saffron-soft text-saffron-ink",
  success: "bg-success-soft text-success",
} as const;

interface ListRowProps {
  action?: ReactNode;
  icon: LucideIcon;
  meta: string;
  status?: ReactNode;
  title: string;
  tone?: keyof typeof tones;
}

export function ListRow({ action, icon: Icon, meta, status, title, tone = "action" }: ListRowProps) {
  return (
    <article className="grid gap-4 border-b border-line py-5 last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <span className={cn("grid size-10 place-items-center rounded-[11px]", tones[tone])}><Icon aria-hidden className="size-4.5" /></span>
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold leading-5 text-ink">{title}</h3>{status}</div><p className="mt-1 text-xs leading-5 text-ink-muted">{meta}</p></div>
      {action ? <div className="flex items-center sm:justify-end">{action}</div> : null}
    </article>
  );
}
