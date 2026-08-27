import type { ReactNode } from "react";

interface ListRowProps {
  action?: ReactNode;
  meta: string;
  status?: ReactNode;
  title: string;
  tone?: "action" | "danger" | "info" | "saffron" | "success";
}

export function ListRow({ action, meta, status, title }: ListRowProps) {
  return (
    <article className="grid gap-4 border-b border-paper-line py-5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold leading-5 text-ink">{title}</h3>{status}</div><p className="mt-1 text-xs leading-5 text-ink-mute">{meta}</p></div>
      {action ? <div className="flex items-center sm:justify-end">{action}</div> : null}
    </article>
  );
}
