"use client";

import Link from "next/link";
import { Page, PageHeader } from "@/components/ui/page";
import { ListRow } from "@/components/ui/list-row";
import { StatusPill, SimulatedChip } from "@/components/ui/status";
import { getNotices } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { useAuthStore } from "@/features/auth/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle } from "@/i18n/content";
import { formatDate } from "@/lib/format";
import { NoticeLens } from "./notice-lens";

export function InboxScreen() {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;
  const notices = getNotices(graph, personId);
  return (
    <Page className="grid gap-7">
      <PageHeader backdrop="india-gate" eyebrow={`${notices.length}`} title={t("governmentInbox")} description={t("noticeLensIntro")} />
      <NoticeLens personId={personId} />
      <section className="grid gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-t-2 border-ink pt-5"><h2 className="font-display text-3xl font-semibold text-ink">{t("governmentInbox")}</h2><Link className="text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href="/home#records">{t("back")}</Link></div>
        <div className="border-y border-paper-line">{notices.map((notice) => { const title = localizeNodeTitle(language, notice.node.id, notice.node.attrs.subject); return <ListRow action={<Link className="min-h-11 content-center text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href="/home#records">{t("view")}</Link>} key={notice.node.id} meta={`${notice.node.attrs.sender} · ${formatDate(notice.node.attrs.receivedOn, language)}`} status={<span className="flex items-center gap-2"><StatusPill label={notice.read ? t("done") : t("unread")} tone={notice.read ? "neutral" : "info"} />{notice.node.attrs.lensSavedOn ? <SimulatedChip authority="Notice guide" /> : null}</span>} title={title} />; })}</div>
      </section>
    </Page>
  );
}
