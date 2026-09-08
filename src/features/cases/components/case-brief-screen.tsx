"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Printer } from "lucide-react";
import { PageSkeleton } from "@/components/ui/feedback";
import { Button, LinkButton } from "@/components/ui/button";
import { Backdrop, Page, PageHeader } from "@/components/ui/page";
import { VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getApplicationHref } from "@/features/graph/navigation";
import { getPerson } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { localizeNodeTitle, localizeNoticeBody } from "@/i18n/content";
import { getDocumentKindMessageKey, getStatusMessageKey, localizeEventLabel } from "@/i18n/formatters";
import { useI18n } from "@/i18n/use-i18n";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { describeConsequences } from "../consequences";
import { getCaseBrief, type CaseRecord } from "../model";
import styles from "./case-brief.module.css";

function RecordSummary({ record }: { record: CaseRecord }) {
  const { language, t } = useI18n();
  const statusKey = getStatusMessageKey(record.attrs.status ?? "due");
  const date = record.type === "application" ? record.attrs.createdOn : record.attrs.initiatedOn ?? record.attrs.issuedOn ?? record.verification.asOf;
  return (
    <div className="grid gap-4">
      <h3 className="font-display text-2xl font-semibold leading-tight">{localizeNodeTitle(language, record.id, record.attrs.title)}</h3>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div><dt className="text-ink-mute">{t("briefRecordStatus")}</dt><dd className="font-bold">{statusKey ? t(statusKey) : record.attrs.status}</dd></div>
        <div><dt className="text-ink-mute">{t("briefCitizenOutcome")}</dt><dd className="font-bold">{t(record.attrs.citizenOutcome === "unresolved" ? "briefUnresolved" : record.attrs.citizenOutcome === "solved" ? "briefSolved" : "briefNoAnswer")}</dd></div>
        <div><dt className="text-ink-mute">{t("briefAuthority")}</dt><dd>{record.attrs.authority}</dd></div>
        <div><dt className="text-ink-mute">{t("briefCreated")}</dt><dd>{formatDate(date, language)}</dd></div>
        {record.type === "application" ? <div className="sm:col-span-2"><dt className="text-ink-mute">{t("briefReference")}</dt><dd className="font-bold">{record.attrs.reference ?? t("briefNoReference")}</dd></div> : null}
        {record.type === "obligation" && record.attrs.amount !== undefined ? <div><dt className="text-ink-mute">{t("briefAmount")}</dt><dd className="font-bold">{formatCurrency(record.attrs.amount)}</dd></div> : null}
      </dl>
      {record.attrs.note ? <div className="grid gap-1 text-sm leading-6"><p className="text-ink-mute">{t("briefRecordNote")}</p><p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{record.attrs.note}</p></div> : null}
    </div>
  );
}

function CaseBriefView() {
  const recordId = useSearchParams().get("record") ?? "";
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const personId = useAuthStore((state) => state.personId);
  const actorId = useAuthStore((state) => state.actorId);
  const brief = personId && !actorId ? getCaseBrief(graph, personId, recordId) : undefined;
  if (!brief) return <Page className="grid gap-6"><PageHeader backdrop="vidhana-soudha" title={t("briefUnavailable")} description={t("briefUnavailableBody")} /><LinkButton href="/start" variant="secondary">{t("chooseProfile")}</LinkButton></Page>;
  const originalHref = brief.root.type === "application" ? getApplicationHref(brief.root) : "/home#attention";
  return (
    <Page className={`grid gap-8 ${styles.brief}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 ${styles.screenOnly}`}>
        <Link className="min-h-11 content-center text-sm font-bold text-indigo-deep underline underline-offset-4" href="/start#routes">← {t("routesBack")}</Link>
        <Button onClick={() => window.print()}><Printer aria-hidden className="size-4" />{t("briefPrint")}</Button>
      </div>
      <article className="grid min-w-0 gap-8" data-case-brief>
        <header className="relative isolate grid gap-3 overflow-hidden border-b-2 border-ink pb-6">
          <Backdrop name="vidhana-soudha" variant="compact" />
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-deep">Citizen · {t("simulated")}</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{t("briefTitle")}</h1>
          <p className="font-bold">{t("briefPreparedFor", { name: brief.person.attrs.name })}</p>
          <p className="max-w-[65ch] text-sm leading-6 text-ink-mute">{t("briefPurpose")}</p>
          <p className={`text-xs text-ink-mute ${styles.screenOnly}`}>{t("briefPrintHint")}</p>
        </header>
        <section className="grid gap-4" aria-labelledby="brief-original">
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-deep" id="brief-original">{t("briefOriginal")}</h2>
          <RecordSummary record={brief.root} />
        </section>
        <section className="grid gap-4 border-t border-paper-line pt-6" aria-labelledby="brief-evidence">
          <h2 className="font-display text-2xl font-semibold" id="brief-evidence">{t("briefEvidence")}</h2>
          <p className="text-sm leading-6 text-ink-mute">{t("briefEvidenceNote")}</p>
          {!brief.documents.length ? <p className="text-sm">{t("briefNoEvidence")}</p> : <ul className="grid gap-4">{brief.documents.map((document) => {
            const kindKey = getDocumentKindMessageKey(document.attrs.kind);
            return <li className="grid gap-2 border-b border-paper-line pb-4" key={document.id}>
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{kindKey ? t(kindKey) : document.attrs.kind}</h3><VerificationBadge verification={document.verification} /></div>
              <p className="text-sm">{document.attrs.holderName} · {document.attrs.numberMasked}</p>
              <p className="text-xs text-ink-mute">{document.verification.source} · {formatDate(document.verification.asOf, language)}</p>
              {document.verification.sourceUrl ? <p className="text-xs [overflow-wrap:anywhere]">{document.verification.sourceUrl}</p> : null}
            </li>;
          })}</ul>}
        </section>
        {brief.notices.length ? <section className="grid gap-4" aria-labelledby="brief-notices"><h2 className="font-display text-2xl font-semibold" id="brief-notices">{t("briefNotices")}</h2>{brief.notices.map((notice) => <div className="grid gap-2 text-sm leading-6" key={notice.id}><h3 className="font-bold">{localizeNodeTitle(language, notice.id, notice.attrs.subject)}</h3><p>{localizeNoticeBody(language, notice.id, notice.attrs.body)}</p><p className="text-xs text-ink-mute">{notice.attrs.sender} · {formatDate(notice.attrs.receivedOn, language)}</p></div>)}</section> : null}
        <section className="grid gap-5 border-t border-paper-line pt-6" aria-labelledby="brief-followups">
          <h2 className="font-display text-2xl font-semibold" id="brief-followups">{t("briefFollowUps")}</h2>
          {!brief.followUps.length ? <p className="text-sm text-ink-mute">{t("briefNoFollowUps")}</p> : brief.followUps.map((record) => <div className="border-b border-paper-line pb-5" key={record.id}><RecordSummary record={record} /></div>)}
        </section>
        <section className="grid gap-5 border-t border-paper-line pt-6" aria-labelledby="brief-history">
          <h2 className="font-display text-2xl font-semibold" id="brief-history">{t("briefHistory")}</h2>
          {!brief.events.length ? <p className="text-sm text-ink-mute">{t("briefNoHistory")}</p> : <ol className="grid gap-5">{brief.events.map((event) => <li className="grid gap-2 border-b border-paper-line pb-4" key={event.id}>
            <p className="text-xs text-ink-mute">{t("briefBy", { date: formatDateTime(event.occurredAt, language), name: getPerson(graph, event.actorId)?.attrs.name ?? event.actorId })}</p>
            <h3 className="text-sm font-bold">{localizeEventLabel(event, language)}</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6">{describeConsequences(graph, event, language, t).map((line) => <li key={line}>{line}</li>)}</ul>
          </li>)}</ol>}
        </section>
        <p className={`border-t-2 border-ink pt-5 text-xs leading-5 text-ink-mute ${styles.printOnly}`}>{t("briefBoundary")}</p>
      </article>
      <nav aria-label={t("briefNext")} className={`flex flex-wrap gap-3 ${styles.screenOnly}`}>
        {originalHref ? <LinkButton href={originalHref} variant="secondary">{t("briefOpenOriginal")}</LinkButton> : null}
        <LinkButton href={`/workflows/grievance?about=${encodeURIComponent(brief.root.id)}`} variant="secondary">{t("resolveRouteGrievance")}</LinkButton>
        <LinkButton href={`/workflows/rti?about=${encodeURIComponent(brief.root.id)}`} variant="secondary">{t("resolveRouteRti")}</LinkButton>
        <LinkButton href="/activity" variant="secondary">{t("timelineTitle")}</LinkButton>
      </nav>
    </Page>
  );
}

export function CaseBriefScreen() {
  return <Suspense fallback={<PageSkeleton />}><CaseBriefView /></Suspense>;
}
