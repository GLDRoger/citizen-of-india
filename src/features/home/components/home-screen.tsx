"use client";

import Link from "next/link";
import { FilePanel, LedgerRow } from "@/components/ui/file-panel";
import { Page } from "@/components/ui/page";
import { useAuthStore } from "@/features/auth/store";
import {
  getDocuments,
  getEligibility,
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
import { formatCurrency } from "@/lib/format";

type Obligation = ReturnType<typeof getObligations>[number];

function greetingKey() {
  const hour = new Date().getHours();
  return hour < 12 ? "goodMorning" as const : hour < 17 ? "goodAfternoon" as const : "goodEvening" as const;
}

function TaskLedgerRow({ index, obligation, task }: { index: number; obligation?: Obligation; task: TaskView }) {
  const { t } = useI18n();
  const value = obligation?.attrs.status?.replaceAll("-", " ") ?? task.meta;

  return (
    <div className="grid min-h-16 grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-center gap-4 border-b border-paper-line py-3 last:border-b-0">
      <div className="min-w-0">
        <span className="block text-sm font-medium leading-5 text-ink">{String(index + 1).padStart(2, "0")} · {task.title}</span>
        {obligation ? <span className="mt-1 block text-xs leading-4 text-ink-mute">{obligation.attrs.authority}</span> : null}
      </div>
      <div className="min-w-0 text-right">
        <strong className="block font-display text-sm font-bold capitalize leading-5 tabular-nums text-ink">{value}</strong>
        <Link className="mt-1 inline-block text-xs underline" href={task.href}>{t("view")}</Link>
      </div>
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
  const obligationsById = new Map(getObligations(graph, personId).map((obligation) => [obligation.id, obligation]));
  const documents = getDocuments(graph, personId);
  const benefits = getEligibility(graph, personId).filter((result) => result.status !== "not-eligible");
  const unreadNotices = getNotices(graph, personId).filter((notice) => !notice.read);
  const money = getMoneySummary(graph, personId);

  return (
    <Page className="grid gap-16 lg:gap-24">
      <section className="grid content-start gap-7 pt-6 lg:pt-14">
        <p className="text-sm text-ink-mute">{t(greetingKey())}, {profile.person.attrs.name.split(" ")[0]}</p>
        <h1 className="max-w-5xl font-display text-[clamp(4rem,11vw,8.4rem)] font-extrabold leading-[0.78] tracking-[-0.05em] text-ink">{t("needPrompt")}</h1>
        <IntentComposer />
      </section>
      <div className="grid gap-12 lg:grid-cols-2">
        <FilePanel label={t("mySnapshot")}>
          <LedgerRow label={t("fullProfile")} value={profile.person.attrs.name} action={<Link className="text-xs underline" href="/you">{t("view")}</Link>} />
          <LedgerRow label={t("documents")} value={documents.length} action={<Link className="text-xs underline" href="/documents">{t("view")}</Link>} />
          <LedgerRow label={t("availableBenefits")} value={benefits.length} />
          <LedgerRow label={t("dueAndRefundable")} value={formatCurrency(money.payable)} />
          <LedgerRow label={t("unreadNotices")} value={unreadNotices.length} />
        </FilePanel>
        <FilePanel label={t("thingsToDo")}>
          {tasks.map((task, index) => <TaskLedgerRow index={index} key={task.id} obligation={obligationsById.get(task.id)} task={task} />)}
        </FilePanel>
      </div>
    </Page>
  );
}
