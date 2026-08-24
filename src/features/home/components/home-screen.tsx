"use client";

import Link from "next/link";
import { ArrowRight, Bell, FileText, Gift, IndianRupee, ListChecks, UserRound } from "lucide-react";
import { Page } from "@/components/ui/page";
import { StatCard } from "@/components/ui/stat-card";
import { VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import {
  getDocuments,
  getEligibility,
  getMoneySummary,
  getNotices,
  getOwnedAssets,
  getProfileSummary,
  getThingsToDo,
} from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { IntentComposer } from "@/features/intent/components/intent-composer";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency } from "@/lib/format";

function greetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return "goodMorning" as const;
  if (hour < 17) return "goodAfternoon" as const;
  return "goodEvening" as const;
}

export function HomeScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;
  const profile = getProfileSummary(graph, personId);
  if (!profile) return null;

  const firstName = profile.person.attrs.name.split(" ")[0];
  const tasks = getThingsToDo(graph, personId);
  const documents = getDocuments(graph, personId);
  const benefits = getEligibility(graph, personId).filter((result) => result.status !== "not-eligible");
  const unreadNotices = getNotices(graph, personId).filter((notice) => !notice.read);
  const money = getMoneySummary(graph, personId);
  const assets = getOwnedAssets(graph, personId);
  const businesses = assets.filter((asset) => asset.type === "business").length;
  const properties = assets.filter((asset) => asset.type === "property").length;

  return (
    <Page className="grid gap-14 lg:gap-20">
      <section className="grid gap-8 pt-5 lg:pt-12">
        <div className="grid max-w-4xl gap-5">
          <p className="text-sm font-bold text-action-strong">{t(greetingKey())}, {firstName}</p>
          <h1 className="font-display text-[clamp(4rem,11vw,8.4rem)] font-semibold leading-[0.79] tracking-[-0.065em] text-ink">{t("needPrompt")}</h1>
          <p className="max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">{t("homeHeroBody")}</p>
        </div>
        <IntentComposer />
      </section>

      <section className="grid gap-6">
        <h2 className="font-display text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">{t("snapshotHeading")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link className="group grid min-h-56 content-between gap-8 rounded-[22px] bg-ink p-6 text-canvas sm:col-span-2 lg:col-span-1 lg:row-span-2" href="/you">
            <div className="flex items-start justify-between gap-4"><span className="grid size-11 place-items-center rounded-[12px] bg-canvas/10 text-saffron"><UserRound aria-hidden className="size-5" /></span><VerificationBadge verification={profile.person.verification} /></div>
            <div className="grid gap-5"><div className="grid gap-1"><span className="text-xs font-bold text-canvas/60">{t("mySnapshot")}</span><strong className="font-display text-4xl font-semibold leading-none tracking-[-0.04em]">{profile.person.attrs.name}</strong><span className="text-sm text-canvas/65">{profile.residence} · {profile.age}</span></div><div className="grid grid-cols-3 gap-3 border-t border-canvas/15 pt-4 text-xs"><span><strong className="block font-display text-2xl text-canvas">{profile.relationships}</strong>{t("familyCount")}</span><span><strong className="block font-display text-2xl text-canvas">{businesses}</strong>{t("businessCount")}</span><span><strong className="block font-display text-2xl text-canvas">{properties}</strong>{t("propertyCount")}</span></div><span className="flex items-center gap-2 text-sm font-bold text-saffron">{t("viewFullProfile")}<ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" /></span></div>
          </Link>
          <StatCard detail={tasks[0]?.title ?? t("noItems")} href="/dashboard" icon={ListChecks} title={t("openTasks")} tone="saffron" value={tasks.length} />
          <StatCard detail={`${profile.verifiedDocumentCount}/${documents.length} ${t("verified").toLowerCase()}`} href="/documents" icon={FileText} title={t("documents")} tone="info" value={documents.length} />
          <StatCard detail={benefits[0]?.benefit.attrs.name ?? t("eligibilityRechecks")} href="/discover" icon={Gift} title={t("availableBenefits")} tone="success" value={benefits.length} />
          <StatCard detail={`${t("due")}: ${formatCurrency(money.payable)} · ${t("comingToYou")}: ${formatCurrency(money.receivable)}`} href="/dashboard" icon={IndianRupee} title={t("dueAndRefundable")} value={formatCurrency(money.payable)} />
          <StatCard detail={unreadNotices[0]?.node.attrs.subject ?? t("noItems")} href="/dashboard" icon={Bell} title={t("unreadNotices")} tone="saffron" value={unreadNotices.length} />
        </div>
      </section>
    </Page>
  );
}
