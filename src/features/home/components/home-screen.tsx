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
  getThingsToDo,
  type TaskView,
} from "@/features/graph/selectors";
import { getApplicationOwnership, getObligationOwnership, summarizeOwnership } from "@/features/graph/ownership";
import { useCitizenStore } from "@/features/graph/store";
import { IntentComposer } from "@/features/intent/components/intent-composer";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle } from "@/i18n/content";
import { getDocumentKindMessageKey, getStatusMessageKey } from "@/i18n/formatters";
import { daysUntil, formatCurrency, formatDate } from "@/lib/format";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { HomeRecords } from "./home-records";
import { HomeNudges } from "./home-nudges";
import { HomeStand, OwnershipLine } from "./home-stand";

type Obligation = ReturnType<typeof getObligations>[number];
type Application = ReturnType<typeof getApplications>[number];

function greetingKey() {
  const hour = new Date().getHours();
  return hour < 12 ? "goodMorning" as const : hour < 17 ? "goodAfternoon" as const : "goodEvening" as const;
}

function TaskLedgerRow({ application, index, obligation, personId, task }: { application?: Application; index: number; obligation?: Obligation; personId: string; task: TaskView }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const ownership = obligation ? getObligationOwnership(obligation) : application ? getApplicationOwnership(graph, application, personId) : undefined;
  const status = obligation?.attrs.status ?? application?.attrs.status;
  const statusKey = status ? getStatusMessageKey(status) : undefined;
  const localizedStatus = statusKey ? t(statusKey) : status;
  const localizedMeta = task.metaKey ? t(task.metaKey) : task.meta;
  const value = task.metaKey === "outcomeUnresolvedMeta"
    ? t("outcomeUnresolvedMeta")
    : obligation?.attrs.dueDate
    ? daysUntil(obligation.attrs.dueDate) < 0 ? t("daysOverdue", { count: Math.abs(daysUntil(obligation.attrs.dueDate)) }) : t("daysLeft", { count: daysUntil(obligation.attrs.dueDate) })
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
    : localizeNodeTitle(language, application?.id ?? obligation?.id ?? task.id, task.title);
  const actionLabel = task.metaKey === "outcomeUnresolvedMeta" ? t("followUp")
    : task.id === "obl:echallan-500" ? t("pay")
    : task.id === "obl:bbmp-property-tax" ? t("payPropertyTax")
      : task.id === "obl:gstr3b-sep" ? t("fileGstr")
        : task.id === "obl:passport-renewal" ? t("reviewScope")
          : task.id === "obl:itr-refund" ? t("trackRefund")
            : application?.attrs.status === "partner-consent-pending" && task.urgent ? t("respond")
              : t("view");

  return (
    <div className="grid min-h-16 grid-cols-[2rem_minmax(0,3fr)_minmax(0,2fr)] items-start gap-3 border-b border-paper-line py-4 last:border-b-0 sm:gap-4" id={`task-${task.id}`}>
      <span aria-hidden className={`font-display text-2xl font-bold leading-none tabular-nums ${task.urgent ? "text-brick" : "text-indigo-deep"}`}>{String(index + 1).padStart(2, "0")}</span>
      <div className="grid min-w-0 gap-1.5">
        <span className="block font-display text-lg font-semibold leading-6 tracking-[-0.01em] text-ink">{title}</span>
        {ownership ? <OwnershipLine language={language} ownership={ownership} /> : null}
      </div>
      <div className="min-w-0 text-right">
        <strong className={`block font-display text-base font-bold leading-6 tabular-nums ${task.urgent ? "text-brick" : "text-ink"}`}>{value}</strong>
        <Link aria-label={`${actionLabel}: ${title}`} className="mt-1 inline-block min-h-11 content-center text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4 hover:decoration-indigo-deep" href={task.href}>{actionLabel}</Link>
      </div>
    </div>
  );
}

export function HomeScreen() {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;

  const profile = getProfileSummary(graph, personId);
  if (!profile) return null;

  const tasks = getThingsToDo(graph, personId);
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
  const firstTasks = tasks.slice(0, 3);
  const remainingTasks = tasks.slice(3);

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
            {tasks.length ? firstTasks.map((task, index) => <TaskLedgerRow application={applicationsById.get(task.id.replace(/:follow-up$/, ""))} index={index} key={task.id} obligation={obligationsById.get(task.id.replace(/:follow-up$/, ""))} personId={personId} task={task} />) : <p className="py-7 text-sm text-ink-mute">{t("nothingWaiting")}</p>}
            {remainingTasks.length ? <details className="group border-t border-paper-line"><summary className="min-h-11 cursor-pointer content-center text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4"><span className="group-open:hidden">{t("moreTasks", { count: remainingTasks.length })}</span><span className="hidden group-open:inline">{t("showFewer")}</span></summary>{remainingTasks.map((task, index) => <TaskLedgerRow application={applicationsById.get(task.id.replace(/:follow-up$/, ""))} index={index + firstTasks.length} key={task.id} obligation={obligationsById.get(task.id.replace(/:follow-up$/, ""))} personId={personId} task={task} />)}</details> : null}
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
