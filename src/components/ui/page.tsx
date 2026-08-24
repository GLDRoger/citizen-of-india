import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("page-enter mx-auto min-w-0 w-full max-w-[1180px] grid-cols-[minmax(0,1fr)] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-8", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid gap-5 border-b border-line pb-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div className="grid gap-2">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="font-display text-[2.35rem] font-semibold leading-[0.98] tracking-[-0.035em] text-ink sm:text-5xl">{title}</h1>
        {description ? <p className="max-w-2xl text-sm leading-6 text-ink-muted sm:text-base">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function SectionHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="grid gap-1">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="font-display text-2xl font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Rule({ className }: { className?: string }) {
  return <div aria-hidden className={cn("h-px bg-line", className)} />;
}
