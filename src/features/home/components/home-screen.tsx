"use client";

import Link from "next/link";
import { FilePanel, LedgerRow } from "@/components/ui/file-panel";
import { ContrastLine, Page } from "@/components/ui/page";
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
import { getStatusMessageKey } from "@/i18n/formatters";
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
  const value = obligation?.attrs.dueDate
    ? t("daysLeft", { count: daysUntil(obligation.attrs.dueDate) })
    : application && localizedStatus
      ? t("statusPrefix", { status: localizedStatus })
      : localizedStatus ?? task.meta;
  const title = application?.attrs.kind === "benefit" && application.attrs.relatedTo
    ? t("benefitApplicationTitle", { benefit: localizeNodeTitle(language, application.attrs.relatedTo, task.title) })
    : localizeNodeTitle(language, task.id, task.title);
  const actionLabel = task.id === "obl:echallan-500" ? t("pay")
    : task.id === "obl:bbmp-property-tax" ? t("payPropertyTax")
      : task.id === "obl:gstr3b-sep" ? t("fileGstr")
        : task.id === "obl:passport-renewal" ? t("reviewScope")
          : task.id === "obl:itr-refund" ? t("trackRefund")
            : t("view");

  return (
    <div className="grid min-h-16 grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-center gap-4 border-b border-paper-line py-3 last:border-b-0" id={`task-${task.id}`}>
      <div className="min-w-0">
        <span className="block text-sm font-medium leading-5 text-ink">{String(index + 1).padStart(2, "0")} · {title}</span>
        {obligation ? <span className="mt-1 block text-xs leading-4 text-ink-mute">{obligation.attrs.authority}</span> : null}
      </div>
      <div className="min-w-0 text-right">
        <strong className="block font-display text-sm font-bold leading-5 tabular-nums text-ink">{value}</strong>
        <Link className="mt-1 inline-block text-xs underline" href={task.href}>{actionLabel}</Link>
      </div>
    </div>
  );
}

function SummaryLedgerItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid min-h-24 content-between gap-3 border-b border-paper-line py-4">
      <span className="eyebrow">{label}</span>
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
  const moneyAuthorityIds = ["obl:gstr3b-sep", "obl:bbmp-property-tax", "obl:echallan-500", "obl:itr-refund"];
  const moneyAuthorities = moneyAuthorityIds
    .map((id) => obligations.find((obligation) => obligation.id === id)?.attrs.authority)
    .filter((authority): authority is string => Boolean(authority))
    .join(" · ");

  return (
    <Page className="grid gap-16 lg:gap-24">
      <section className="grid content-start gap-7 pt-6 lg:pt-14">
        <p className="text-sm text-ink-mute">{t(greetingKey())}, {profile.person.attrs.name.split(" ")[0]}</p>
        <h1 className="max-w-5xl font-display text-[clamp(4rem,11vw,8.4rem)] font-extrabold leading-[0.78] tracking-[-0.05em] text-ink">{t("needPrompt")}</h1>
        <IntentComposer />
        <ContrastLine className="max-w-2xl">{t("contrastHome")}</ContrastLine>
      </section>
      <FilePanel label={t("money")}><LedgerRow action={<Link className="text-xs underline" href="#money-actions">{t("view")}</Link>} label={t("due")} value={formatCurrency(money.payable)} /><LedgerRow action={<Link className="text-xs underline" href="/workflows/refund-track">{t("trackRefund")}</Link>} label={t("comingToYou")} value={formatCurrency(money.receivable)} /></FilePanel>
      <FilePanel label={t("mySnapshot")}><div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3"><SummaryLedgerItem label={t("deadlines")} value={deadlineCount} /><SummaryLedgerItem label={t("expiry")} value={expiringDocuments.length} /><SummaryLedgerItem label={t("pendingApplications")} value={applications.length} /></div></FilePanel>
      <section className="grid gap-6" id="money">
        <div className="grid gap-2"><p className="eyebrow">{unreadNotices} {t("unreadNotices").toLowerCase()}</p><h2 className="max-w-4xl font-display text-[clamp(2.5rem,7vw,5.4rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-ink">{t("dashboardHeadline")}</h2><p className="max-w-2xl text-sm leading-6 text-ink-mute sm:text-base">{t("dashboardBody")}</p>{moneyAuthorities ? <ContrastLine>{t("contrastMoneyAuthorities", { authorities: moneyAuthorities })}</ContrastLine> : null}</div>
        <div id="money-actions"><FilePanel label={t("thingsToDo")}>{tasks.length ? tasks.map((task, index) => <TaskLedgerRow application={applicationsById.get(task.id)} index={index} key={task.id} obligation={obligationsById.get(task.id)} task={task} />) : <p className="border-y border-paper-line py-7 text-sm text-ink-mute">{t("nothingWaiting")}</p>}</FilePanel></div>
        <HomeRecords personId={personId} />
      </section>
    </Page>
  );
}
