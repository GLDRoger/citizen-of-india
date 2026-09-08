"use client";

import { useState } from "react";
import { ArrowRight, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePanel } from "@/components/ui/file-panel";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { analyzeNotice, getNoticeSamples } from "../analyze";
import { prepareNoticeSave } from "../save-notice";
import { AnalysisCard } from "./notice-analysis";

function StepLabel({
  current,
  number,
  title,
}: {
  current: boolean;
  number: number;
  title: string;
}) {
  return (
    <li
      aria-current={current ? "step" : undefined}
      className={`flex items-center gap-2 text-xs font-bold ${current ? "text-indigo-deep" : "text-ink-mute"}`}
    >
      <span
        className={`grid size-6 shrink-0 place-items-center rounded-full border text-[0.6875rem] ${current ? "border-indigo-deep bg-indigo-deep text-paper" : "border-paper-line"}`}
      >
        {number}
      </span>
      {title}
    </li>
  );
}

export function NoticeLens({
  personId,
  onViewNotice,
}: {
  personId: string;
  onViewNotice: (noticeId: string) => void;
}) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const [text, setText] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [savedNoticeId, setSavedNoticeId] = useState<string>();
  const [duplicate, setDuplicate] = useState(false);
  const [error, setError] = useState(false);
  const analysis = reviewed
    ? analyzeNotice(text, graph, personId, language)
    : null;
  const samples = getNoticeSamples(graph, personId, language);
  const changeText = (value: string) => {
    setText(value);
    setReviewed(false);
    setSavedNoticeId(undefined);
    setConfirmed(false);
    setDuplicate(false);
    setError(false);
  };
  const save = () => {
    if (!analysis) return;
    try {
      const { graph: currentGraph, commit } = useCitizenStore.getState();
      const result = prepareNoticeSave(
        currentGraph,
        personId,
        text,
        confirmed ? analysis.relatedRecordId : undefined,
      );
      if (!result.duplicate)
        commit({
          actorId: personId,
          labelKey: "eventNoticeLensSaved",
          procedureId: "notice-lens",
          mutations: result.mutations,
        });
      setDuplicate(result.duplicate);
      setError(false);
      setSavedNoticeId(result.noticeId);
    } catch {
      setError(true);
    }
  };
  return (
    <FilePanel className="grid gap-5 sm:p-7" label={t("noticeLensTitle")}>
      <div className="grid gap-2">
        <h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-ink">
          {t("noticeLensTitle")}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-ink-mute">
          {t("noticeLensIntro")}
        </p>
      </div>
      <ol
        aria-label={t("noticeLensTitle")}
        className="grid grid-cols-3 gap-3 border-y border-paper-line py-3"
      >
        <StepLabel
          current={!analysis}
          number={1}
          title={t("noticeLensStepPaste")}
        />
        <StepLabel
          current={Boolean(analysis) && !savedNoticeId}
          number={2}
          title={t("noticeLensStepReview")}
        />
        <StepLabel
          current={Boolean(savedNoticeId)}
          number={3}
          title={t("noticeLensStepSave")}
        />
      </ol>
      <label className="grid gap-2">
        <span className="text-sm font-bold text-ink">
          {t("noticeLensPaste")}
        </span>
        <textarea
          aria-describedby="notice-lens-hint"
          className="min-h-36 resize-y rounded-[3px] border border-paper-line bg-paper px-4 py-3 text-sm leading-6 text-ink outline-none transition focus:border-indigo focus:ring-2 focus:ring-indigo/20"
          maxLength={20_000}
          onChange={(event) => changeText(event.target.value)}
          placeholder={t("noticeLensPaste")}
          value={text}
        />
        <span className="text-xs leading-5 text-ink-mute" id="notice-lens-hint">
          {t("noticeLensPasteHint")}
        </span>
      </label>
      {samples.length ? (
        <div className="grid gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-mute">
            {t("noticeLensSamples")}
          </p>
          <div className="flex flex-wrap gap-2">
            {samples.map((sample) => (
              <button
                className="min-h-11 rounded-[2px] border border-paper-line px-3 py-2 text-left text-xs font-bold text-indigo-deep transition-colors hover:border-indigo/40 hover:bg-indigo-tint focus-visible:outline-2 focus-visible:outline-indigo-deep"
                key={sample.id}
                onClick={() => changeText(sample.text[language])}
                type="button"
              >
                {sample.subject}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          disabled={text.trim().length < 10 || reviewed}
          onClick={() => {
            setReviewed(true);
            setError(false);
          }}
        >
          {t("noticeLensExplain")}
          <ArrowRight aria-hidden className="size-4" />
        </Button>
        {text ? (
          <Button onClick={() => changeText("")} variant="secondary">
            <RotateCcw aria-hidden className="size-4" />
            {t("noticeLensClear")}
          </Button>
        ) : null}
      </div>
      {duplicate ? (
        <p className="text-sm text-indigo-deep" role="status">
          {t("noticeLensDuplicate")}
        </p>
      ) : null}
      {error ? (
        <p
          className="rounded-[2px] bg-brick-tint p-4 text-sm font-semibold text-brick"
          role="alert"
        >
          {t("noticeLensSaveError")}
        </p>
      ) : null}
      {analysis ? (
        <AnalysisCard
          analysis={analysis}
          confirmed={confirmed}
          onConfirm={setConfirmed}
          onSave={save}
          onViewNotice={onViewNotice}
          savedNoticeId={savedNoticeId}
          text={text}
        />
      ) : null}
      <p className="flex items-start gap-2 border-t border-paper-line pt-4 text-xs leading-5 text-ink-mute">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-indigo-deep" />
        {t("noticeLensSafety")}
      </p>
    </FilePanel>
  );
}
