"use client";

import Link from "next/link";
import { FilePanel, LedgerRow } from "@/components/ui/file-panel";
import { RichText } from "@/components/rich-text";
import { Backdrop, Page } from "@/components/ui/page";
import { useAuthStore } from "@/features/auth/store";
import {
  getApplications,
  getMoneySummary,
  getNotices,
  getObligations,
  getProfileSummary,
} from "@/features/graph/selectors";
import { getApplicationOwnership, getObligationOwnership, summarizeOwnership } from "@/features/graph/ownership";
import { attentionCategories, getAttentionItems, type AttentionCategory, type AttentionItem } from "@/features/graph/attention";
import { useCitizenStore } from "@/features/graph/store";
import { IntentComposer } from "@/features/intent/components/intent-composer";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle } from "@/i18n/content";
import { getDocumentKindMessageKey, getRelationshipMessageKey, getStatusMessageKey } from "@/i18n/formatters";
import { daysUntil, formatCurrency, formatDate } from "@/lib/format";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { HomeRecords } from "./home-records";
import { HomeNudges } from "./home-nudges";
import { HomeStand, OwnershipLine } from "./home-stand";
import { useState } from "react";

type Obligation = ReturnType<typeof getObligations>[number];
type Application = ReturnType<typeof getApplications>[number];

function greetingKey() {
  const hour = new Date().getHours();
  return hour < 12 ? "goodMorning" as const : hour < 17 ? "goodAfternoon" as const : "goodEvening" as const;
}

function TaskLedgerRow({ application, index, item, obligation, personId }: { application?: Application; index: number; item: AttentionItem; obligation?: Obligation; personId: string }) {
  const { language, t } = useI18n();
  const task = item.task;
  const graph = useCitizenStore((state) => state.graph);
  const ownership = obligation ? getObligationOwnership(obligation) : application ? getApplicationOwnership(graph, application, personId) : undefined;
  const status = obligation?.attrs.status ?? application?.attrs.status;
  const statusKey = status ? getStatusMessageKey(status) : undefined;
  const localizedStatus = statusKey ? t(statusKey) : status;
  const localizedMeta = task?.metaKey ? t(task.metaKey) : task?.meta ?? item.meta;
  const value = task?.metaKey === "outcomeUnresolvedMeta"
    ? t("outcomeUnresolvedMeta")
    : task && obligation?.attrs.dueDate
      ? daysUntil(obligation.attrs.dueDate) < 0 ? t("daysOverdue", { count: Math.abs(daysUntil(obligation.attrs.dueDate)) }) : t("daysLeft", { count: daysUntil(obligation.attrs.dueDate) })
      : application && task?.urgent && task.metaKey
      ? localizedMeta
      : application && localizedStatus
      ? t("statusPrefix", { status: localizedStatus })
      : task ? localizedStatus ?? localizedMeta : t(item.state === "action" ? "attentionActionRequired" : item.state === "waiting" ? "attentionWaiting" : "attentionInformation");
  const documentKindKey = task?.documentKind ? getDocumentKindMessageKey(task.documentKind) : undefined;
  const relationshipKey = item.familyRelationship ? getRelationshipMessageKey(item.familyRelationship) : undefined;
  const title = item.familyMemberName
    ? t("familyAlertTitle", { relationship: relationshipKey ? t(relationshipKey) : t("relationshipOther"), name: item.familyMemberName, title: localizeNodeTitle(language, item.recordId ?? item.id, item.title) })
    : item.titleKey ? t(item.titleKey, item.titleParams)
    : task?.titleKey
    ? t(task.titleKey, { document: documentKindKey ? t(documentKindKey) : task.documentKind ?? "" })
    : application?.attrs.kind === "benefit" && application.attrs.relatedTo
    ? t("benefitApplicationTitle", { benefit: localizeNodeTitle(language, application.attrs.relatedTo, task?.title ?? item.title) })
    : task ? localizeNodeTitle(language, application?.id ?? obligation?.id ?? task.id, task.title) : localizeNodeTitle(language, item.recordId ?? item.id, item.title);
  const actionLabel = task?.metaKey === "outcomeUnresolvedMeta" ? t("followUp")
    : task?.id === "obl:echallan-500" ? t("pay")
    : task?.id === "obl:bbmp-property-tax" ? t("payPropertyTax")
      : task?.id === "obl:gstr3b-sep" ? t("fileGstr")
        : task?.id === "obl:passport-renewal" ? t("reviewScope")
          : task?.id === "obl:itr-refund" ? t("trackRefund")
            : application?.attrs.status === "partner-consent-pending" && task?.urgent ? t("respond")
              : item.source === "notice" ? t("noticeLensHomeAction")
                : item.source === "connection" ? t("familyConnectionsTitle")
                  : item.familyMemberName ? t("familyViewSharedAlert")
                  : t("view");

  return (
    <div className="grid min-h-16 grid-cols-[2rem_minmax(0,3fr)_minmax(0,2fr)] items-start gap-3 border-b border-paper-line py-4 last:border-b-0 sm:gap-4" id={`task-${item.id}`}>
      <span aria-hidden className={`font-display text-2xl font-bold leading-none tabular-nums ${item.urgent ? "text-brick" : "text-indigo-deep"}`}>{String(index + 1).padStart(2, "0")}</span>
      <div className="grid min-w-0 gap-1.5">
        <span className="block font-display text-lg font-semibold leading-6 tracking-[-0.01em] text-ink">{title}</span>
        {ownership ? <OwnershipLine language={language} ownership={ownership} /> : null}
      </div>
      <div className="min-w-0 text-right">
        <strong className={`block font-display text-base font-bold leading-6 tabular-nums ${item.urgent ? "text-brick" : "text-ink"}`}>{value}</strong>
        <Link aria-label={`${actionLabel}: ${title}`} className="mt-1 inline-block min-h-11 content-center text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4 hover:decoration-indigo-deep" href={item.href}>{actionLabel}</Link>
      </div>
    </div>
  );
}

export function HomeScreen() {
  const { language, t } = useI18n();
  const [attentionFilter, setAttentionFilter] = useState<AttentionCategory | "all">("all");
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;

  const profile = getProfileSummary(graph, personId);
  if (!profile) return null;

  const attentionItems = getAttentionItems(graph, personId);
  const filteredAttention = attentionFilter === "all" ? attentionItems : attentionItems.filter((item) => item.categories.includes(attentionFilter));
  const obligations = getObligations(graph, personId);
  const obligationsById = new Map(obligations.map((obligation) => [obligation.id, obligation]));
  const applications = getApplications(graph, personId);
  const applicationsById = new Map(applications.map((application) => [application.id, application]));
  const unreadNotices = getNotices(graph, personId).filter((notice) => !notice.read).length;
  const money = getMoneySummary(graph, personId);
  const stand = summarizeOwnership([
    ...obligations.map((node) => getObligationOwnership(node)),
    ...applications.map((node) => getApplicationOwnership(graph, node, personId)),
  ]);
  const firstTasks = filteredAttention.slice(0, 3);
  const remainingTasks = filteredAttention.slice(3);
  const filterLabel: Record<AttentionCategory, Parameters<typeof t>[0]> = { personal: "attentionFilterPersonal", business: "attentionFilterBusiness", family: "attentionFilterFamily", financial: "attentionFilterFinancial" };

  return (
    <Page className="grid gap-10 lg:gap-12">
      <section className="grid content-start gap-6 lg:grid-cols-[minmax(16rem,0.68fr)_minmax(0,1.32fr)] lg:items-start lg:gap-10 lg:pt-3">
        <div className="relative isolate grid gap-4 lg:min-h-[26rem] lg:content-start lg:pt-6">
          <Backdrop className="-bottom-3 h-auto w-[min(46vw,17rem)] max-w-none sm:w-[min(36vw,22rem)] lg:-bottom-1 lg:w-full" name="taj-mahal" />
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-y-2 border-ink py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-ink"><span>{t("homeEdition", { name: profile.person.attrs.name.split(" ")[0] })}</span><span className="text-ink-mute">{formatDate(DEMO_TODAY, language)}</span></div>
          <p className="text-sm text-ink-mute">{t(greetingKey())}, {profile.person.attrs.name.split(" ")[0]}</p>
          <h1 className="max-w-2xl font-display text-[clamp(3rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-ink"><RichText entrance="load" text={t("homeHeadline")} /></h1>
        </div>
        <IntentComposer key={personId} />
      </section>
      <HomeStand unread={unreadNotices} withGovernment={stand.withGovernment} withYou={stand.withYou} withOthers={stand.withOthers} />
      <section className="grid scroll-mt-20 gap-6" id="attention">
        <div className="grid gap-1.5 border-t-2 border-ink pt-5"><p className="eyebrow text-indigo-deep">{unreadNotices} {t("unread").toLowerCase()}</p><h2 className="max-w-4xl font-display text-[clamp(2.35rem,5vw,4rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-ink"><RichText entrance="scroll" text={t("dashboardHeadline")} /></h2></div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-start">
          <FilePanel label={t("thingsToDo")}>
            <div aria-label={t("attentionFilterLabel")} className="flex flex-wrap gap-2 border-b border-paper-line pb-4" role="group">{([{ value: "all", label: t("attentionFilterAll") }, ...attentionCategories.map((value) => ({ value, label: t(filterLabel[value]) }))] as Array<{ value: AttentionCategory | "all"; label: string }>).map((filter) => <button aria-pressed={attentionFilter === filter.value} className={`min-h-10 rounded-[2px] border px-3 text-xs font-bold transition-colors ${attentionFilter === filter.value ? "border-indigo-deep bg-indigo-deep text-paper" : "border-paper-line text-ink-mute hover:border-indigo/40 hover:text-indigo-deep"}`} key={filter.value} onClick={() => setAttentionFilter(filter.value)} type="button">{filter.label} <span className="tabular-nums">{filter.value === "all" ? attentionItems.length : attentionItems.filter((item) => item.categories.includes(filter.value as AttentionCategory)).length}</span></button>)}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-paper-line py-3 text-xs text-ink-mute"><span><strong className="text-brick">{t("attentionActionRequired")}</strong></span><span><strong className="text-indigo-deep">{t("attentionWaiting")}</strong></span><span>{t("attentionInformation")}</span></div>
            {filteredAttention.length ? firstTasks.map((item, index) => <TaskLedgerRow application={applicationsById.get(item.id.replace(/:follow-up$/, ""))} index={index} item={item} key={item.id} obligation={obligationsById.get(item.id.replace(/:follow-up$/, ""))} personId={personId} />) : <p className="py-7 text-sm text-ink-mute">{attentionFilter === "all" ? t("nothingWaiting") : t("attentionNoFilterItems")}</p>}
            {remainingTasks.length ? <details className="group border-t border-paper-line"><summary className="min-h-11 cursor-pointer content-center text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4"><span className="group-open:hidden">{t("moreTasks", { count: remainingTasks.length })}</span><span className="hidden group-open:inline">{t("showFewer")}</span></summary>{remainingTasks.map((item, index) => <TaskLedgerRow application={applicationsById.get(item.id.replace(/:follow-up$/, ""))} index={index + firstTasks.length} item={item} key={item.id} obligation={obligationsById.get(item.id.replace(/:follow-up$/, ""))} personId={personId} />)}</details> : null}
          </FilePanel>
          <div className="grid gap-5">
            <HomeNudges personId={personId} />
            <FilePanel label={t("money")}><LedgerRow label={t("due")} tone={money.payable > 0 ? "brick" : "ink"} value={formatCurrency(money.payable)} /><LedgerRow action={money.receivable > 0 ? <Link className="min-h-11 content-center text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href="/workflows/refund-track">{t("trackRefund")}</Link> : undefined} label={t("comingToYou")} tone={money.receivable > 0 ? "green" : "ink"} value={formatCurrency(money.receivable)} /></FilePanel>
          </div>
        </div>
        <div className="scroll-mt-20" id="records"><HomeRecords key={personId} personId={personId} /></div>
      </section>
    </Page>
  );
}
