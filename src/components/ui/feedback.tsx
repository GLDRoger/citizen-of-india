import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "./button";
import { useI18n } from "@/i18n/use-i18n";

export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <span aria-hidden className={`block animate-pulse rounded-lg bg-surface-strong ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <div className="grid gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <Skeleton className="h-48 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="grid justify-items-start gap-3 border-y border-line py-8">
      <span className="grid size-10 place-items-center rounded-full bg-surface-strong text-ink-muted">
        <Inbox aria-hidden className="size-5" />
      </span>
      <div className="grid gap-1">
        <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
        {body ? <p className="max-w-md text-sm leading-6 text-ink-muted">{body}</p> : null}
      </div>
    </div>
  );
}

export function ErrorState({ reset }: { reset?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-lg place-content-center justify-items-start gap-4 px-5">
      <span className="grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle aria-hidden className="size-6" />
      </span>
      <h1 className="font-display text-3xl font-semibold text-ink">{t("somethingWrong")}</h1>
      {reset ? <Button onClick={reset}>{t("tryAgain")}</Button> : null}
    </div>
  );
}
