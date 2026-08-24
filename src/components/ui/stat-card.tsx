import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const tones = {
  action: "bg-green-tint text-green-deep",
  info: "bg-green-tint text-green-deep",
  saffron: "bg-brick-tint text-brick",
  success: "bg-green-tint text-green-deep",
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
    <Link className="group grid min-h-40 content-between gap-8 rounded-[8px] border border-paper-line bg-paper-shade p-5 transition-colors hover:border-green-deep/35 sm:min-h-48" href={href}>
      <div className="flex items-start justify-between gap-4">
        <span className={cn("grid size-10 place-items-center rounded-[8px]", tones[tone])}><Icon aria-hidden className="size-4.5" /></span>
        {showArrow ? <ArrowUpRight aria-hidden className="size-4 text-ink-mute transition-colors group-hover:text-green-deep" /> : null}
      </div>
      <div className="grid gap-2">
        <span className="text-xs font-bold text-ink-mute">{title}</span>
        <strong className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-ink">{value}</strong>
        <span className="line-clamp-2 text-xs leading-5 text-ink-mute">{detail}</span>
      </div>
    </Link>
  );
}
