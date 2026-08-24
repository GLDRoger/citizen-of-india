import type { Verification } from "@/features/graph/schema";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";
export function SimulatedChip({ authority }: { authority?: string }) { const { t } = useI18n(); return <span className="stamp" title={authority}>{t("simulated")}</span>; }
export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "success" | "warning" | "info" | "neutral" }) { return <span className={cn("status-text", tone === "warning" && "status-text--brick")}>{label}</span>; }
export function VerificationBadge({ verification }: { verification: Verification }) { const { t } = useI18n(); if (verification.state === "verified") return <span className="stamp" title={`${verification.source}, ${verification.asOf}`}>{t("verified")}</span>; const labels: Record<Verification["state"], string> = { verified: t("verified"), mismatch: t("mismatch"), pending: t("pending"), "self-declared": t("selfDeclared"), expired: t("expired") }; return <span className={cn("status-text", verification.state === "mismatch" || verification.state === "expired" ? "status-text--brick" : "")}>{labels[verification.state]}</span>; }
