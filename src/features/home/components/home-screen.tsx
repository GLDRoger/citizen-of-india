"use client";

import Link from "next/link";
import { FilePanel, LedgerRow } from "@/components/ui/file-panel";
import { Page } from "@/components/ui/page";
import { useAuthStore } from "@/features/auth/store";
import {
  getDocuments,
  getApplications,
  getMoneySummary,
  getNotices,
  getObligations,
  getProfileSummary,
  getThingsToDo,
  type TaskView,
} from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { IntentComposer } from "@/features/intent/components/intent-composer";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle } from "@/i18n/content";
import { getDocumentKindMessageKey, getStatusMessageKey } from "@/i18n/formatters";
import { daysUntil, formatCurrency } from "@/lib/format";
import { HomeRecords } from "./home-records";

type Obligation = ReturnType<typeof getObligations>[number];
type Application = ReturnType<typeof getApplications>[number];

function greetingKey() {
  const hour = new Date().getHours();
  return hour < 12 ? "goodMorning" as const : hour < 17 ? "goodAfternoon" as const : "goodEvening" as const;
}

function TaskLedgerRow({ application, index, obligation, task }: { application?: Application; index: number; obligation?: Obligation; task: TaskView }) {
  const { language, t } = useI18n();
  const status = obligation?.attrs.status ?? application?.attrs.status;
  const statusKey = status ? getStatusMessageKey(status) : undefined;
  const localizedStatus = statusKey ? t(statusKey) : status;
  const localizedMeta = task.metaKey ? t(task.metaKey) : task.meta;
  const value = obligation?.attrs.dueDate
    ? t("daysLeft", { count: daysUntil(obligation.attrs.dueDate) })
    : application && task.urgent && task.metaKey
      ? localizedMeta
      : application && localizedStatus
      ? t("statusPrefix", { status: localizedStatus })
      : localizedStatus ?? localizedMeta;
  const documentKindKey = task.documentKind ? getDocumentKindMessageKey(task.documentKind) : undefined;
  const title = task.titleKey
    ? t(task.titleKey, { document: documentKindKey ? t(documentKindKey) : task.documentKind ?? "" })
    : application?.attrs.kind === "benefit" && application.attrs.relatedTo
    ? t("benefitApplicationTitle", { benefit: localizeNodeTitle(language, application.attrs.relatedTo, task.title) })
    : localizeNodeTitle(language, task.id, task.title);
  const actionLabel = task.id === "obl:echallan-500" ? t("pay")
    : task.id === "obl:bbmp-property-tax" ? t("payPropertyTax")
      : task.id === "obl:gstr3b-sep" ? t("fileGstr")
        : task.id === "obl:passport-renewal" ? t("reviewScope")
          : task.id === "obl:itr-refund" ? t("trackRefund")
            : application?.attrs.status === "partner-consent-pending" && task.urgent ? t("respond")
              : t("view");

  return (
    <div className="grid min-h-16 grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-center gap-4 border-b border-paper-line py-3 last:border-b-0" id={`task-${task.id}`}>
      <div className="min-w-0">
        <span className="block text-sm font-medium leading-5 text-ink">{String(index + 1).padStart(2, "0")} · {title}</span>
      </div>
      <div className="min-w-0 text-right">
        <strong className="block font-display text-sm font-bold leading-5 tabular-nums text-ink">{value}</strong>
        <Link aria-label={`${actionLabel}: ${title}`} className="mt-1 inline-block min-h-11 content-center text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href={task.href}>{actionLabel}</Link>
      </div>
    </div>
  );
}

function SummaryLedgerItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid min-h-14 min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 sm:min-h-20 sm:grid-cols-1 sm:content-between sm:items-stretch">
      <span className="min-w-0 text-xs font-bold leading-4 text-ink-mute [overflow-wrap:anywhere]">{label}</span>
      <strong className="font-display text-3xl font-bold leading-none tabular-nums text-ink">{value}</strong>
    </div>
  );
}

export function HomeScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;

  const profile = getProfileSummary(graph, personId);
  if (!profile) return null;

  const tasks = getThingsToDo(graph, personId);
  const obligations = getObligations(graph, personId).filter((node) => !["paid", "received", "completed"].includes(node.attrs.status ?? ""));
  const obligationsById = new Map(obligations.map((obligation) => [obligation.id, obligation]));
  const documents = getDocuments(graph, personId);
  const applications = getApplications(graph, personId).filter((node) => node.attrs.status !== "completed");
  const applicationsById = new Map(applications.map((application) => [application.id, application]));
  const expiringDocuments = documents.filter((document) => document.attrs.expiresOn && daysUntil(document.attrs.expiresOn) >= 0 && daysUntil(document.attrs.expiresOn) <= 180);
  const deadlineCount = obligations.filter((node) => Boolean(node.attrs.dueDate)).length;
  const unreadNotices = getNotices(graph, personId).filter((notice) => !notice.read).length;
  const money = getMoneySummary(graph, personId);
  const firstTasks = tasks.slice(0, 3);
  const remainingTasks = tasks.slice(3);

  return (
    <Page className="grid gap-10 lg:gap-12">
      <section className="grid content-start gap-6 lg:grid-cols-[minmax(16rem,0.68fr)_minmax(0,1.32fr)] lg:items-start lg:gap-10 lg:pt-3">
        <div className="grid gap-3 lg:pt-6"><p className="text-sm text-ink-mute">{t(greetingKey())}, {profile.person.attrs.name.split(" ")[0]}</p><h1 className="max-w-2xl font-display text-[clamp(3rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-ink">{t("needPrompt")}</h1></div>
        <IntentComposer key={personId} />
      </section>
      <section className="grid scroll-mt-20 gap-6" id="attention">
        <div className="grid gap-1.5"><p className="eyebrow">{unreadNotices} {t("unreadNotices").toLowerCase()}</p><h2 className="max-w-4xl font-display text-[clamp(2.35rem,5vw,4rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-ink">{t("dashboardHeadline")}</h2></div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-start">
          <FilePanel label={t("thingsToDo")}>
            {tasks.length ? firstTasks.map((task, index) => <TaskLedgerRow application={applicationsById.get(task.id)} index={index} key={task.id} obligation={obligationsById.get(task.id)} task={task} />) : <p className="border-y border-paper-line py-7 text-sm text-ink-mute">{t("nothingWaiting")}</p>}
            {remainingTasks.length ? <details className="group border-t border-paper-line"><summary className="min-h-11 content-center text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4"><span className="group-open:hidden">{t("moreTasks", { count: remainingTasks.length })}</span><span className="hidden group-open:inline">{t("showFewer")}</span></summary>{remainingTasks.map((task, index) => <TaskLedgerRow application={applicationsById.get(task.id)} index={index + firstTasks.length} key={task.id} obligation={obligationsById.get(task.id)} task={task} />)}</details> : null}
          </FilePanel>
          <div className="grid gap-5">
            <section className="rounded-[8px] border border-paper-line bg-paper-shade px-5 py-3"><p className="eyebrow py-3 text-indigo-deep">{t("money")}</p><LedgerRow label={t("due")} value={formatCurrency(money.payable)} /><LedgerRow action={money.receivable > 0 ? <Link className="min-h-11 content-center text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href="/workflows/refund-track">{t("trackRefund")}</Link> : undefined} label={t("comingToYou")} value={formatCurrency(money.receivable)} /></section>
            <section className="rounded-[8px] border border-paper-line bg-paper-shade px-5 py-3"><p className="eyebrow py-3 text-indigo-deep">{t("mySnapshot")}</p><div className="grid divide-y divide-paper-line sm:grid-cols-3 sm:gap-x-5 sm:divide-x sm:divide-y-0"><SummaryLedgerItem label={t("deadlines")} value={deadlineCount} /><div className="min-w-0 sm:pl-4"><SummaryLedgerItem label={t("expiry")} value={expiringDocuments.length} /></div><div className="min-w-0 sm:pl-4"><SummaryLedgerItem label={t("pendingApplications")} value={applications.length} /></div></div></section>
          </div>
        </div>
        <HomeRecords key={personId} personId={personId} />
      </section>
    </Page>
  );
}
