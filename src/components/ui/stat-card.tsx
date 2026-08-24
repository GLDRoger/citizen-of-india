import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const tones = {
  action: "bg-action-soft text-action-strong",
  info: "bg-info-soft text-info",
  saffron: "bg-saffron-soft text-saffron-ink",
  success: "bg-success-soft text-success",
} as const;

interface StatCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  value: string | number;
  detail: string;
  tone?: keyof typeof tones;
  showArrow?: boolean;
}

export function StatCard({ href, icon: Icon, title, value, detail, tone = "action", showArrow = true }: StatCardProps) {
  return (
    <Link className="group grid min-h-40 content-between gap-8 rounded-[20px] border border-line bg-surface p-5 transition-colors hover:border-action/35 sm:min-h-48" href={href}>
      <div className="flex items-start justify-between gap-4">
        <span className={cn("grid size-10 place-items-center rounded-[11px]", tones[tone])}><Icon aria-hidden className="size-4.5" /></span>
        {showArrow ? <ArrowUpRight aria-hidden className="size-4 text-ink-faint transition-colors group-hover:text-action" /> : null}
      </div>
      <div className="grid gap-2">
        <span className="text-xs font-bold text-ink-muted">{title}</span>
        <strong className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-ink">{value}</strong>
        <span className="line-clamp-2 text-xs leading-5 text-ink-muted">{detail}</span>
      </div>
    </Link>
  );
}
