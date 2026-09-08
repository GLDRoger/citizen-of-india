"use client";

import { Check, FileText } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip } from "@/components/ui/status";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { localizeNodeTitle, localizeRuleExplanation } from "@/i18n/content";
import { formatCurrency, formatDate } from "@/lib/format";
import type { NoticeAnalysis } from "../analyze";

export function AnalysisCard({
  analysis,
  confirmed,
  onConfirm,
  onSave,
  savedNoticeId,
  onViewNotice,
  text,
}: {
  analysis: NoticeAnalysis;
  confirmed: boolean;
  onConfirm: (value: boolean) => void;
  onSave: () => void;
  savedNoticeId?: string;
  onViewNotice: (noticeId: string) => void;
  text: string;
}) {
  const { language, t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const related = graph.nodes.find(
    (node) => node.id === analysis.relatedRecordId,
  );
  const relatedTitle = related
    ? localizeNodeTitle(
        language,
        related.id,
        related.type === "benefit"
          ? related.attrs.name
          : related.type === "employment"
            ? `${related.attrs.employer} · ${related.attrs.designation}`
            : "title" in related.attrs
              ? related.attrs.title
              : related.id,
      )
    : undefined;
  return (
    <div className="grid gap-5 border-t border-paper-line pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="eyebrow text-indigo-deep">
          {analysis.match === "supported"
            ? t("noticeLensStepReview")
            : t("noticeLensUncertain")}
        </h3>
        <SimulatedChip authority={analysis.authority ?? "Notice guide"} />
      </div>
      {analysis.match === "supported" ? (
        <>
          <div className="grid gap-3 rounded-[3px] bg-indigo-tint p-5">
            <p className="eyebrow">{t("noticeLensPlainLanguage")}</p>
            <p className="font-display text-2xl font-semibold leading-tight text-ink">
              {analysis.plainLanguage}
            </p>
            <p className="text-sm leading-6 text-ink-mute">
              {analysis.whatItMeans}
            </p>
            <p className="grid gap-1 text-sm leading-6 text-ink-mute">
              <strong className="text-ink">
                {t("noticeLensRequiredAction")}
              </strong>
              {analysis.nextAction}
            </p>
          </div>
          <dl className="grid gap-4 border-y border-paper-line py-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-mute">{t("noticeLensIssuer")}</dt>
              <dd className="font-bold text-ink">
                {analysis.authority}
                {analysis.issuer ? ` · ${analysis.issuer}` : ""}
              </dd>
            </div>
            {analysis.reference ? (
              <div>
                <dt className="text-xs text-ink-mute">
                  {t("noticeLensReference")}
                </dt>
                <dd className="break-words font-bold text-ink">
                  {analysis.reference}
                </dd>
              </div>
            ) : null}
            {analysis.amount !== undefined ? (
              <div>
                <dt className="text-xs text-ink-mute">
                  {t("noticeLensAmount")}
                </dt>
                <dd className="font-bold text-ink">
                  {formatCurrency(analysis.amount)}
                </dd>
              </div>
            ) : null}
            {analysis.deadline ? (
              <div>
                <dt className="text-xs text-ink-mute">
                  {t("noticeLensDeadline")}
                </dt>
                <dd className="font-bold text-ink">
                  {formatDate(analysis.deadline, language)}
                </dd>
              </div>
            ) : null}
            {analysis.consequence ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-ink-mute">
                  {t("noticeLensConsequence")}
                </dt>
                <dd className="text-ink">
                  {localizeRuleExplanation(language, analysis.consequence)}
                </dd>
              </div>
            ) : null}
          </dl>
          {related && !savedNoticeId ? (
            <label className="flex items-start gap-3 text-sm leading-6 text-ink">
              <input
                checked={confirmed}
                className="mt-1 size-4 shrink-0 accent-indigo-deep"
                onChange={(event) => onConfirm(event.target.checked)}
                type="checkbox"
              />
              <span>
                {t("noticeLensConfirmRecord")}
                <strong className="block text-ink">{relatedTitle}</strong>
              </span>
            </label>
          ) : null}
        </>
      ) : (
        <div className="grid gap-3 rounded-[3px] bg-paper-shade p-5 text-sm leading-6 text-ink-mute">
          <p>{t("noticeLensUnknownBody")}</p>
          <p>
            <strong className="text-ink">
              {t("noticeLensRequiredAction")}:
            </strong>{" "}
            {t("noticeLensUnknownNext")}
          </p>
        </div>
      )}
      <details className="border-t border-paper-line pt-3">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-bold text-ink-mute">
          <FileText aria-hidden className="size-4" />
          {t("noticeLensOriginalText")}
        </summary>
        <p className="whitespace-pre-wrap break-words pb-2 pt-3 text-xs leading-5 text-ink-mute">
          {text}
        </p>
      </details>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {savedNoticeId ? (
          <p
            className="flex min-h-11 items-center gap-2 text-sm font-bold text-green-deep"
            role="status"
          >
            <Check aria-hidden className="size-4" />
            {t("noticeLensSaved")}
          </p>
        ) : (
          <Button
            disabled={Boolean(analysis.relatedRecordId) && !confirmed}
            onClick={onSave}
          >
            {t("noticeLensSave")}
          </Button>
        )}
        {savedNoticeId ? (
          <Button
            onClick={() => onViewNotice(savedNoticeId)}
            variant="secondary"
          >
            {t("noticeLensViewSaved")}
          </Button>
        ) : null}
        {savedNoticeId && analysis.workflowHref ? (
          <LinkButton href={analysis.workflowHref}>
            {t("noticeLensOpenWorkflow")}
          </LinkButton>
        ) : null}
      </div>
    </div>
  );
}
