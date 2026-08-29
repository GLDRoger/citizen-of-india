"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { getGovernmentHealth } from "@/features/graph/insights";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle } from "@/i18n/content";
import { formatCurrency } from "@/lib/format";

function HealthRow({ href, label, value, warn }: { href?: string; label: string; value: string; warn: boolean }) {
  const body = (
    <>
      <span className="min-w-0 text-xs leading-5 text-ink-mute">{label}</span>
      <strong className={`font-display text-sm font-bold tabular-nums ${warn ? "text-brick" : "text-ink"}`}>{value}</strong>
    </>
  );
  const className = "grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-paper-line py-2 last:border-b-0";
  return href ? <Link className={className} href={href}>{body}</Link> : <div className={className}>{body}</div>;
}

export function GovernmentHealthCard({ personId }: { personId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const health = getGovernmentHealth(graph, personId);
  const healthy = health.attentionCount === 0;
  const unclaimedTitleKey = health.unclaimedBenefits.length === 1
    ? "healthUnclaimedTitleOne"
    : "healthUnclaimedTitleMany";

  return (
    <section className="grid gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5">
      <div className="flex items-center gap-3">
        <Activity aria-hidden className={`size-5 ${healthy ? "text-green-deep" : "text-brick"}`} />
        <strong className="text-sm text-ink">{t("healthTitle")}</strong>
      </div>
      <p className="font-display text-2xl font-semibold leading-tight text-ink">
        {healthy ? t("healthAllClear") : t("healthAttention", { count: health.attentionCount })}
      </p>
      <div>
        <HealthRow href="/home#attention" label={t("healthObligations")} value={String(health.obligationsDue)} warn={health.obligationsDue > 0} />
        <HealthRow label={t("healthPayable")} value={formatCurrency(health.payable)} warn={health.payable > 0} />
        <HealthRow label={t("healthReceivable")} value={formatCurrency(health.receivable)} warn={false} />
        <HealthRow href="/documents" label={t("healthExpiring")} value={String(health.expiringDocuments)} warn={health.expiringDocuments > 0} />
        <HealthRow href="/workflows/record-correction" label={t("healthRecordIssues")} value={String(health.recordIssues)} warn={health.recordIssues > 0} />
        <HealthRow href="/home" label={t("healthUnread")} value={String(health.unreadNotices)} warn={health.unreadNotices > 0} />
      </div>
      {health.unclaimedBenefits.length > 0 ? (
        <Link className="grid gap-1 rounded-[8px] bg-indigo-tint p-4" href="/discover">
          <span className="text-xs font-bold text-indigo-deep">{t(unclaimedTitleKey, { count: health.unclaimedBenefits.length })}</span>
          <span className="text-xs leading-5 text-ink-mute">
            {health.unclaimedBenefits.map((benefit) => localizeNodeTitle(language, benefit.id, benefit.attrs.name)).join(" · ")}
          </span>
        </Link>
      ) : null}
    </section>
  );
}
