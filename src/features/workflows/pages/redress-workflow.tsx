"use client";

import { ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/feedback";
import { StatusPill } from "@/components/ui/status";
import { caseBriefHref } from "@/features/cases/model";
import { useAuthStore } from "@/features/auth/store";
import { describeEventTargets } from "@/features/graph/describe-mutation";
import { getApplicationOwnership, getObligationOwnership } from "@/features/graph/ownership";
import type { GraphMutation, GraphNode } from "@/features/graph/schema";
import { getApplications, getObligations } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { useDraft } from "@/features/workflows/progress-store";
import { localizeNodeTitle } from "@/i18n/content";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { formatDate } from "@/lib/format";
import { fileRtiRequest, lodgeGrievance } from "@/lib/mockGov";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

/**
 * Rights as services. An RTI request or a CPGRAMS grievance starts from a
 * record the citizen already holds, is addressed to the authority that holds
 * it, and carries the record's Timeline history. The reply clock lands on the
 * same Timeline as everything else. Both are simulated and say so.
 */

export type Remedy = "rti" | "grievance";

type Matter = Extract<GraphNode, { type: "application" | "obligation" }>;

const remedies = {
  rti: { kind: "rti-request", procedureId: "rti-request", source: "DoPT", authorityKey: "rtiAuthority", titleKey: "rtiWorkflowTitle", bodyKey: "rtiWorkflowBody", serviceKey: "rtiService", writeBodyKey: "redressStepWriteRti", replyDays: 30 },
  grievance: { kind: "grievance", procedureId: "grievance", source: "DARPG", authorityKey: "grievanceAuthority", titleKey: "grievanceWorkflowTitle", bodyKey: "grievanceWorkflowBody", serviceKey: "grievanceService", writeBodyKey: "redressStepWriteGrievance", replyDays: 30 },
} as const satisfies Record<Remedy, { kind: string; procedureId: string; source: "DoPT" | "DARPG"; authorityKey: MessageKey; titleKey: MessageKey; bodyKey: MessageKey; serviceKey: MessageKey; writeBodyKey: MessageKey; replyDays: number }>;

export const redressKinds: readonly string[] = [remedies.rti.kind, remedies.grievance.kind];

function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function steps(remedy: Remedy, t: (key: MessageKey) => string): ProcedureStep[] {
  return [
    { id: "choose", title: t("redressStepChoose"), description: t("redressStepChooseBody") },
    { id: "write", title: t("redressStepWrite"), description: t(remedies[remedy].writeBodyKey) },
    { id: "track", title: t("redressStepTrack"), description: t("redressStepTrackBody") },
  ];
}

/** Pending matters first, settled ones last; the citizen's own "not solved" verdicts on top. */
function rankMatters(matters: Matter[], graph: Parameters<typeof getApplicationOwnership>[0], personId: string) {
  const rank = (node: Matter) => {
    const ownership = node.type === "application" ? getApplicationOwnership(graph, node, personId) : getObligationOwnership(node);
    if (ownership?.unresolved) return 0;
    if (ownership?.holder === "authority") return 1;
    if (ownership) return 2;
    return 3;
  };
  return [...matters].sort((a, b) => rank(a) - rank(b));
}

function MatterRow({ checked, matter, onChoose, personId }: { checked: boolean; matter: Matter; onChoose: () => void; personId: string }) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const ownership = matter.type === "application" ? getApplicationOwnership(graph, matter, personId) : getObligationOwnership(matter);
  const title = localizeNodeTitle(language, matter.id, matter.attrs.title);
  const since = ownership?.since ?? matter.verification.asOf;
  const meta = ownership?.holder === "authority"
    ? t("redressWithAuthority", { authority: ownership.authority, date: formatDate(since, language) })
    : ownership
      ? t("redressHeldByYou", { date: formatDate(since, language) })
      : t("redressSettled", { date: formatDate(since, language) });
  return (
    <label className="grid min-h-14 cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border-b border-paper-line py-3 last:border-b-0">
      <input checked={checked} className="mt-1.5" name="redress-matter" onChange={onChoose} type="radio" value={matter.id} />
      <span className="grid gap-1">
        <span className="flex flex-wrap items-center gap-2"><strong className="text-sm font-bold leading-5 text-ink">{title}</strong>{ownership?.unresolved ? <StatusPill label={t("redressUnresolvedTag")} tone="warning" /> : null}</span>
        <span className="text-xs leading-5 text-ink-mute">{matter.attrs.authority} · {meta}</span>
      </span>
    </label>
  );
}

function RedressJourney({ about, remedy }: { about: string | null; remedy: Remedy }) {
  const { language, t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const spec = remedies[remedy];
  const { draft, save } = useDraft(spec.procedureId, personId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [failNextSend, setFailNextSend] = useState(false);
  const inFlight = useRef(false);
  const draftAbout = typeof draft.about === "string" ? draft.about : null;
  const applied = useRef(false);
  // A link that names a record ("?about=") starts a fresh request about it, once; the citizen can still change their mind.
  useEffect(() => {
    if (!about || applied.current) return;
    applied.current = true;
    if (draftAbout !== about) save({ about, screen: "choose", text: null });
  }, [about, draftAbout, save]);
  if (!personId) return null;

  const authority = t(spec.authorityKey);
  const procedureSteps = steps(remedy, t);
  const applications = getApplications(graph, personId);
  const matters = rankMatters([
    ...applications.filter((node) => !redressKinds.includes(node.attrs.kind ?? "")),
    ...getObligations(graph, personId),
  ], graph, personId);
  const chosenId = draftAbout ?? about;
  const matter = matters.find((node) => node.id === chosenId);
  const existing = matter ? applications.find((node) => node.attrs.kind === spec.kind && node.attrs.relatedTo === matter.id) : undefined;
  const screen: "choose" | "write" = matter && draft.screen === "write" ? "write" : "choose";
  const currentStep = existing ? 3 : screen === "write" ? 1 : 0;

  const matterTitle = matter ? localizeNodeTitle(language, matter.id, matter.attrs.title) : "";
  const matterReference = matter?.type === "application" ? matter.attrs.reference : undefined;
  const ownership = matter ? (matter.type === "application" ? getApplicationOwnership(graph, matter, personId) : getObligationOwnership(matter)) : undefined;
  const since = ownership?.since ?? matter?.verification.asOf ?? DEMO_TODAY;
  const history = matter ? graph.events.filter((event) => describeEventTargets(event).includes(matter.id)) : [];
  const defaultText = matter
    ? t(remedy === "rti" ? "redressRtiDefaultQuestion" : "redressGrievanceDefaultText", { title: matterTitle, authority: matter.attrs.authority, reference: matterReference ? t("redressReferenceSuffix", { reference: matterReference }) : "", date: formatDate(since, language) })
    : "";
  const text = typeof draft.text === "string" ? draft.text : defaultText;

  const choose = (id: string) => save({ about: id, text: null });
  const proceed = () => save({ screen: "write", text: text });
  const back = () => save({ screen: "choose" });

  const send = async () => {
    if (!matter || existing || !text.trim() || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError("");
    try {
      const personKey = personId.slice("person:".length);
      const relatedKey = matter.id.slice(matter.id.indexOf(":") + 1);
      const applicationId = `app:${personKey}-${spec.kind}-${relatedKey}`;
      const response = remedy === "rti"
        ? await fileRtiRequest({ applicantId: personId, authority: matter.attrs.authority, subjectId: matter.id, simulateFailure: failNextSend })
        : await lodgeGrievance({ complainantId: personId, authority: matter.attrs.authority, subjectId: matter.id, simulateFailure: failNextSend });
      const replyDue = addDays(DEMO_TODAY, response.data.replyDueDays);
      const mutations: GraphMutation[] = [
        {
          type: "addNode",
          node: {
            id: applicationId,
            type: "application",
            attrs: {
              title: remedy === "rti" ? `${t("rtiService")} · ${matter.attrs.authority}` : `${t("grievanceService")} · ${matterTitle}`,
              authority,
              status: "submitted",
              createdOn: DEMO_TODAY,
              submittedOn: DEMO_TODAY,
              relatedTo: matter.id,
              kind: spec.kind,
              participants: [personId],
              currentStep: 3,
              reference: response.data.registrationNumber,
              note: `${text.trim()}\n\n${t("redressReplyDue")}: ${formatDate(replyDue, language)}`,
              ...("fee" in response.data ? { amountPaid: response.data.fee } : {}),
            },
            verification: { source: spec.source, state: "pending", asOf: DEMO_TODAY, jurisdiction: "union" },
          },
        },
        {
          type: "addEdge",
          edge: { id: `e:${personKey}-subject-${spec.kind}-${relatedKey}`, type: "subjectOf", from: personId, to: applicationId, attrs: {}, validFrom: DEMO_TODAY, status: "active", verification: { source: spec.source, state: "pending", asOf: DEMO_TODAY } },
        },
      ];
      commit({
        actorId: personId,
        labelKey: remedy === "rti" ? "eventRtiFiled" : "eventGrievanceLodged",
        labelParams: remedy === "rti" ? { authority: matter.attrs.authority } : { title: matter.attrs.title },
        procedureId: spec.procedureId,
        mutations,
      });
    } catch {
      setError(t(failNextSend ? "sendFailureMessage" : "redressError"));
      setFailNextSend(false);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  const shell = (children: ReactNode, options?: { complete?: boolean; showProgress?: boolean }) => (
    <ProcedureShell authority={authority} complete={options?.complete} currentStep={currentStep} description={t(spec.bodyKey)} outcomeTargetId={existing?.id} procedureId={spec.procedureId} showProgress={options?.showProgress} steps={procedureSteps} title={t(spec.titleKey)}>
      {children}
    </ProcedureShell>
  );

  if (!matters.length) {
    return shell(
      <StepCard eyebrow={t("profileScopeEyebrow")} title={t("profileScopeTitle")} body={t("redressNoMatters")}>
        <LinkButton href="/services" variant="secondary">{t("back")}</LinkButton>
      </StepCard>,
      { showProgress: false },
    );
  }

  if (existing && matter) {
    const replyDue = addDays(existing.attrs.submittedOn ?? DEMO_TODAY, spec.replyDays);
    return shell(
      <CompletionCard title={t(remedy === "rti" ? "redressRtiCompleteTitle" : "redressGrievanceCompleteTitle")} body={t(remedy === "rti" ? "redressRtiCompleteBody" : "redressGrievanceCompleteBody", { reference: existing.attrs.reference ?? "—", authority: matter.attrs.authority, date: formatDate(replyDue, language) })}>
        <dl className="grid gap-4 text-paper sm:grid-cols-2">
          <div className="grid gap-1"><dt className="text-xs text-paper/65">{t("redressReference")}</dt><dd className="font-display text-xl font-bold tabular-nums">{existing.attrs.reference}</dd></div>
          <div className="grid gap-1"><dt className="text-xs text-paper/65">{t("redressReplyDue")}</dt><dd className="font-display text-xl font-bold">{formatDate(replyDue, language)}</dd></div>
        </dl>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={caseBriefHref(existing.id)} variant="inverse">{t("briefOpen")} <ArrowRight aria-hidden className="size-4" /></LinkButton>
          <LinkButton href="/home#attention" variant="inverseQuiet">{t("returnHome")} <ArrowRight aria-hidden className="size-4" /></LinkButton>
          <button className="min-h-11 px-2 text-sm font-bold text-paper underline decoration-paper/40 underline-offset-4" onClick={() => save({ about: null, screen: "choose", text: null })} type="button">{t("redressChangeMatter")}</button>
        </div>
      </CompletionCard>,
      { complete: true },
    );
  }

  if (screen === "choose" || !matter) {
    return shell(
      <StepCard title={t("redressChooseTitle")} body={t(remedy === "rti" ? "redressChooseRtiBody" : "redressChooseGrievanceBody")}>
        <fieldset className="grid border-y border-paper-line">
          <legend className="sr-only">{t("redressChooseTitle")}</legend>
          {matters.map((candidate) => <MatterRow checked={candidate.id === chosenId} key={candidate.id} matter={candidate} onChoose={() => choose(candidate.id)} personId={personId} />)}
        </fieldset>
        <Button disabled={!matter} onClick={proceed}>{t("redressContinue")} <ArrowRight aria-hidden className="size-4" /></Button>
      </StepCard>,
    );
  }

  return shell(
    <StepCard title={t(remedy === "rti" ? "redressWriteRtiTitle" : "redressWriteGrievanceTitle", { authority: matter.attrs.authority, title: matterTitle })} body={t(remedy === "rti" ? "redressWriteRtiBody" : "redressWriteGrievanceBody")}>
      <label className="grid gap-2">
        <span className="text-sm font-bold text-ink">{t("redressTextLabel")}</span>
        <textarea disabled={loading} className="min-h-36 w-full resize-y rounded-[3px] border border-paper-line bg-paper p-4 text-base leading-7 text-ink outline-none focus:border-indigo-deep focus:ring-4 focus:ring-indigo-tint" maxLength={1200} onChange={(event) => save({ text: event.target.value })} value={text} />
      </label>
      <dl className="grid gap-3 border-y border-paper-line py-4 text-sm sm:grid-cols-2">
        <div className="grid gap-1">
          <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-saffron">{t("redressHistoryTitle")}</dt>
          <dd className="leading-6 text-ink">{history.length ? t(history.length === 1 ? "redressHistoryOne" : "redressHistoryCount", { count: history.length, date: formatDate(history[0].occurredAt.slice(0, 10), language) }) : t("redressHistoryNone")}</dd>
        </div>
        {remedy === "rti" ? <div className="grid gap-1"><dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-saffron">{t("redressFee")}</dt><dd className="leading-6 text-ink">{t("redressFeePaidInDemo")}</dd></div> : null}
      </dl>
      <aside className="grid gap-2 border-y border-paper-line py-4">
        <h3 className="text-sm font-bold">{t("briefReview")}</h3>
        <p className="text-sm leading-6 text-ink-mute">{t("briefReviewBody")}</p>
        <LinkButton className="justify-self-start" href={caseBriefHref(matter.id)} variant="secondary">{t("briefOpen")}</LinkButton>
      </aside>
      <label className="flex min-h-11 items-start gap-3 text-sm leading-6">
        <input checked={failNextSend} className="mt-1.5 size-4 shrink-0" disabled={loading} onChange={(event) => setFailNextSend(event.target.checked)} type="checkbox" />
        <span><strong className="block">{t("sendFailureOption")}</strong><span className="text-ink-mute">{t("sendFailureHelp")}</span></span>
      </label>
      {error ? <p className="text-sm font-bold text-brick" role="alert">{error}</p> : null}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button disabled={!text.trim()} loading={loading} onClick={() => void send()}>{error ? t("sendRetry") : t(remedy === "rti" ? "redressSendRti" : "redressSendGrievance")} <ArrowRight aria-hidden className="size-4" /></Button>
        <button className="min-h-11 px-2 text-sm font-bold text-indigo-deep underline decoration-indigo-deep/30 underline-offset-4" disabled={loading} onClick={back} type="button">{t("redressChangeMatter")}</button>
      </div>
    </StepCard>,
  );
}

function RedressRoute({ remedy }: { remedy: Remedy }) {
  const about = useSearchParams().get("about");
  return <RedressJourney about={about} key={`${remedy}:${about ?? ""}`} remedy={remedy} />;
}

export function RedressWorkflow({ remedy }: { remedy: Remedy }) {
  return <Suspense fallback={<PageSkeleton />}><RedressRoute remedy={remedy} /></Suspense>;
}
