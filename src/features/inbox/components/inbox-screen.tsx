"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Page, PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { ListRow } from "@/components/ui/list-row";
import { EmptyState } from "@/components/ui/feedback";
import { StatusPill } from "@/components/ui/status";
import { getNotices } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { useAuthStore } from "@/features/auth/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle } from "@/i18n/content";
import { formatDate } from "@/lib/format";
import { NoticeLens } from "./notice-lens";
import { NoticeDetail } from "./notice-detail";

function noticeFromHash() {
  try {
    return typeof window === "undefined"
      ? ""
      : decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return "";
  }
}

function InboxForPerson({ personId }: { personId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const [selectedId, setSelectedId] = useState(noticeFromHash);
  const detailRef = useRef<HTMLDivElement>(null);
  const notices = getNotices(graph, personId);
  const selected = notices.find(({ node }) => node.id === selectedId);
  useEffect(() => {
    const changed = () => setSelectedId(noticeFromHash());
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  useEffect(() => {
    if (!selectedId) return;
    const { graph: currentGraph, commit } = useCitizenStore.getState();
    const notice = getNotices(currentGraph, personId).find(
      ({ node }) => node.id === selectedId,
    );
    if (!notice) return;
    detailRef.current?.scrollIntoView({ block: "start" });
    if (notice.read) return;
    const edge = currentGraph.edges.find(
      (candidate) =>
        candidate.type === "subjectOf" &&
        candidate.from === personId &&
        candidate.to === selectedId &&
        candidate.status === "active" &&
        !candidate.validTo,
    );
    if (edge)
      commit({
        actorId: personId,
        labelKey: "eventNoticeRead",
        labelParams: { noticeId: selectedId },
        procedureId: "notice-reading",
        mutations: [
          { type: "patchEdgeAttrs", edgeId: edge.id, attrs: { read: true } },
        ],
      });
  }, [personId, selectedId]);
  const openId = (noticeId: string) => {
    setSelectedId(noticeId);
    window.history.replaceState(null, "", `#${encodeURIComponent(noticeId)}`);
  };
  return (
    <Page className="grid gap-7">
      <PageHeader
        backdrop="india-gate"
        eyebrow={`${notices.length}`}
        title={t("governmentInbox")}
      />
      <NoticeLens personId={personId} onViewNotice={openId} />
      <section className="grid gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-t-2 border-ink pt-5">
          <h2 className="font-display text-3xl font-semibold text-ink">
            {t("governmentInbox")}
          </h2>
          <Link
            className="min-h-11 content-center text-xs font-bold text-indigo-deep underline underline-offset-4"
            href="/home#records"
          >
            {t("back")}
          </Link>
        </div>
        {selected ? (
          <div className="scroll-mt-24" ref={detailRef} id={selected.node.id}>
            <NoticeDetail
              key={selected.node.id}
              notice={selected}
              personId={personId}
            />
          </div>
        ) : null}
        {notices.length ? (
          <div className="border-y border-paper-line">
            {notices.map((notice) => (
              <ListRow
                action={
                  <Button
                    aria-label={`${t("view")}: ${localizeNodeTitle(language, notice.node.id, notice.node.attrs.subject)}`}
                    onClick={() => openId(notice.node.id)}
                    variant="secondary"
                  >
                    {t("view")}
                  </Button>
                }
                key={notice.node.id}
                meta={`${notice.node.attrs.lensSavedOn && notice.node.verification.source === "Self" ? t("noticeLensSavedByYou") : notice.node.attrs.sender} · ${formatDate(notice.node.attrs.receivedOn, language)}`}
                status={
                  <StatusPill
                    label={notice.read ? t("noticeRead") : t("unread")}
                    tone={notice.read ? "neutral" : "info"}
                  />
                }
                title={localizeNodeTitle(
                  language,
                  notice.node.id,
                  notice.node.attrs.subject,
                )}
              />
            ))}
          </div>
        ) : (
          <EmptyState title={t("noItems")} />
        )}
      </section>
    </Page>
  );
}

export function InboxScreen() {
  const personId = useAuthStore((state) => state.personId);
  return personId ? (
    <InboxForPerson key={personId} personId={personId} />
  ) : null;
}
