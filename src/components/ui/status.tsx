import { AlertCircle, CheckCircle2, Circle, Clock3, FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Verification } from "@/features/graph/schema";
import { useI18n } from "@/i18n/use-i18n";

export function SimulatedChip({ authority }: { authority?: string }) {
  const { t } = useI18n();
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-saffron-line bg-saffron-soft px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-saffron-ink"
      title={authority ? `${t("authority")}: ${authority}` : t("simulatedResponse")}
    >
      <FlaskConical aria-hidden className="size-3" />
      {t("simulated")}
    </span>
  );
}

const verificationStyles: Record<Verification["state"], string> = {
  verified: "bg-success-soft text-success",
  mismatch: "bg-warning-soft text-warning",
  pending: "bg-info-soft text-info",
  "self-declared": "bg-surface-strong text-ink-muted",
  expired: "bg-danger-soft text-danger",
};

export function VerificationBadge({ verification }: { verification: Verification }) {
  const { t } = useI18n();
  const labels: Record<Verification["state"], ReturnType<typeof t>> = {
    verified: t("verified"),
    mismatch: t("mismatch"),
    pending: t("pending"),
    "self-declared": t("selfDeclared"),
    expired: t("expired"),
  };
  const Icon = verification.state === "verified" ? CheckCircle2 : AlertCircle;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold",
        verificationStyles[verification.state],
      )}
      title={`${verification.source}, ${verification.asOf}`}
    >
      <Icon aria-hidden className="size-3" />
      {labels[verification.state]}
    </span>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "success" | "warning" | "info" | "neutral";
}) {
  const styles = {
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    info: "bg-info-soft text-info",
    neutral: "bg-surface-strong text-ink-muted",
  };
  const Icon = tone === "success" ? CheckCircle2 : tone === "warning" ? AlertCircle : tone === "info" ? Clock3 : Circle;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", styles[tone])}>
      <Icon aria-hidden className="size-3" />
      {label}
    </span>
  );
}
