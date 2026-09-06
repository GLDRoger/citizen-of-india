import type { Verification } from "@/features/graph/schema";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

function localizeSource(source: Verification["source"], t: ReturnType<typeof useI18n>["t"]) { return source === "Self" ? t("sourceSelf") : source === "Municipal" ? t("sourceMunicipal") : source === "IncomeTax" ? t("sourceIncomeTax") : source; }
export function SimulatedChip({ authority, inverse = false }: { authority?: string; inverse?: boolean }) { const { t } = useI18n(); return <span className={cn("stamp stamp--simulated", inverse && "stamp--inverse")} title={authority === "Self" ? t("sourceSelf") : authority === "Municipal" ? t("sourceMunicipal") : authority}>{t("simulated")}</span>; }
export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "success" | "warning" | "info" | "neutral" }) { return <span className={cn("status-text", `status-text--${tone}`)}>{label}</span>; }
export function VerificationBadge({ verification }: { verification: Verification }) {
  const { t } = useI18n();
  if (verification.state === "verified") return <span className="stamp stamp--verified" title={`${localizeSource(verification.source, t)}, ${verification.asOf}`}>{t("verified")}</span>;
  const labels: Record<Verification["state"], string> = { verified: t("verified"), mismatch: t("mismatch"), pending: t("pending"), "self-declared": t("selfDeclared"), expired: t("expired"), "not-documented": t("notDocumented") };
  const tone = verification.state === "mismatch" || verification.state === "expired" || verification.state === "not-documented" ? "warning" : verification.state === "pending" ? "info" : "neutral";
  return <span className={cn("status-text", `status-text--${tone}`)}>{labels[verification.state]}</span>;
}

const jurisdictionKeys = { union: "jurisdictionUnion", state: "jurisdictionState", city: "jurisdictionCity", self: "jurisdictionSelf" } as const;

/**
 * Where a record comes from, spelled out: issuer, level of government, when it
 * was last checked, and the issuer's public site. The link is a pointer to
 * where this kind of record lives, never a claim that the demo fetched it.
 */
export function ProvenanceLine({ verification }: { verification: Verification }) {
  const { language, t } = useI18n();
  return (
    <dl className="grid gap-x-4 gap-y-1 text-xs leading-5 text-ink-mute sm:grid-cols-[auto_minmax(0,1fr)]">
      <dt className="font-bold">{t("provenanceIssuer")}</dt>
      <dd>{localizeSource(verification.source, t)}{verification.jurisdiction ? ` · ${t(jurisdictionKeys[verification.jurisdiction])}` : ""}</dd>
      <dt className="font-bold">{t("consentChecked")}</dt>
      <dd>{formatDate(verification.asOf, language)}{verification.state === "not-documented" ? ` · ${t("notDocumented")}` : ""}</dd>
      {verification.note ? <dd className="sm:col-span-2">{verification.note}</dd> : null}
      {verification.sourceUrl ? <dd className="sm:col-span-2"><a className="font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4" href={verification.sourceUrl} rel="noreferrer" target="_blank">{t("provenanceOpenIssuer")}</a> <span>· {t("provenanceNote")}</span></dd> : null}
    </dl>
  );
}
