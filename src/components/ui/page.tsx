import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { MonumentName } from "./monuments";
import { IllustratedBackdrop } from "./illustrated-backdrop";

/**
 * One artwork path for the demo. Its inline SVG remains the data-saver,
 * loading and failed-image fallback; no imagery is generated at runtime.
 */
export function Backdrop({ name, className, variant }: { name: MonumentName; className?: string; variant?: "header" | "home" | "card" | "compact" }) {
  return <IllustratedBackdrop className={className} key={name} name={name} variant={variant} />;
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("page-enter mx-auto min-w-0 w-full max-w-[1180px] grid-cols-[minmax(0,1fr)] px-5 pb-14 pt-6 sm:px-8 lg:px-10 lg:pb-16 lg:pt-8", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  backdrop,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  backdrop?: MonumentName;
}) {
  return (
    <header className={cn("relative isolate grid gap-4 overflow-hidden border-b border-paper-line pb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end", backdrop && "min-h-[16rem] content-end pt-28 sm:pt-0")}>
      {backdrop ? <Backdrop name={backdrop} /> : null}
      <div className="grid gap-2">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="max-w-4xl font-display text-[clamp(2.4rem,5vw,4.35rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-ink">{title}</h1>
        {description ? <p className="max-w-2xl text-sm leading-6 text-ink-mute sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="justify-self-start sm:justify-self-end">{action}</div> : null}
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
        <h2 className="font-display text-[1.65rem] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function ContrastLine({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("max-w-3xl text-xs leading-5 text-ink-mute", className)}>{children}</p>;
}
