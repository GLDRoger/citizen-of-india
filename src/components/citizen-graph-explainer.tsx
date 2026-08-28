"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";

type ScenarioId = "epfo" | "pan" | "challan";

interface GraphScenario {
  action: MessageKey;
  evidence: readonly [MessageKey, MessageKey, MessageKey];
  id: ScenarioId;
  label: MessageKey;
  question: MessageKey;
  results: readonly [MessageKey, MessageKey, MessageKey];
}

const scenarios: readonly GraphScenario[] = [
  {
    action: "graphVisualEpfoAction",
    evidence: ["graphVisualEpfoEvidenceOne", "graphVisualEpfoEvidenceTwo", "graphVisualEpfoEvidenceThree"],
    id: "epfo",
    label: "graphVisualEpfoLabel",
    question: "graphVisualEpfoQuestion",
    results: ["graphVisualEpfoResultOne", "graphVisualEpfoResultTwo", "graphVisualEpfoResultThree"],
  },
  {
    action: "graphVisualPanAction",
    evidence: ["graphVisualPanEvidenceOne", "graphVisualPanEvidenceTwo", "graphVisualPanEvidenceThree"],
    id: "pan",
    label: "graphVisualPanLabel",
    question: "graphVisualPanQuestion",
    results: ["graphVisualPanResultOne", "graphVisualPanResultTwo", "graphVisualPanResultThree"],
  },
  {
    action: "graphVisualChallanAction",
    evidence: ["graphVisualChallanEvidenceOne", "graphVisualChallanEvidenceTwo", "graphVisualChallanEvidenceThree"],
    id: "challan",
    label: "graphVisualChallanLabel",
    question: "graphVisualChallanQuestion",
    results: ["graphVisualChallanResultOne", "graphVisualChallanResultTwo", "graphVisualChallanResultThree"],
  },
];

function Connector() {
  return (
    <div aria-hidden className="flex h-8 items-center justify-center text-saffron lg:h-auto lg:min-h-24">
      <span className="hidden h-px flex-1 bg-saffron/70 lg:block" />
      <ArrowRight className="mx-2 hidden size-5 shrink-0 lg:block" />
      <ArrowDown className="size-5 lg:hidden" />
    </div>
  );
}

export function CitizenGraphExplainer({ className, id }: { className?: string; id?: string }) {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<ScenarioId>("epfo");
  const scenario = scenarios.find((candidate) => candidate.id === selectedId) ?? scenarios[0];

  return (
    <section className={cn("border border-paper-line bg-paper p-5 text-ink sm:p-8", className)} id={id}>
      <header className="grid gap-3 border-b border-paper-line pb-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(18rem,1.15fr)] lg:items-end lg:gap-10">
        <h2 className="max-w-xl font-display text-[clamp(2.25rem,4vw,4rem)] font-semibold leading-[0.94] tracking-[-0.04em] text-indigo-deep">{t("graphVisualTitle")}</h2>
        <p className="max-w-2xl text-sm leading-7 text-ink-mute sm:text-base">{t("graphVisualBody")}</p>
      </header>

      <div aria-label={t("graphVisualScenarioLabel")} className="flex flex-wrap gap-x-6 border-b border-paper-line" role="group">
        {scenarios.map((candidate) => {
          const selected = candidate.id === scenario.id;
          return <button aria-pressed={selected} className={cn("relative min-h-12 py-3 text-left text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-deep", selected ? "text-indigo-deep after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-saffron" : "text-ink-mute hover:text-ink")} key={candidate.id} onClick={() => setSelectedId(candidate.id)} type="button">{t(candidate.label)}</button>;
        })}
      </div>

      <div aria-live="polite" className="page-enter mt-5 bg-indigo-deep p-5 text-paper sm:p-7" key={scenario.id}>
        <div className="grid gap-2 border-b border-paper/25 pb-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-baseline sm:gap-5">
          <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-saffron">{t("graphVisualSituation")}</span>
          <p className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{t(scenario.question)}</p>
        </div>

        <div className="grid gap-0 pt-6 lg:grid-cols-[minmax(0,1fr)_3rem_minmax(12rem,0.72fr)_3rem_minmax(0,1fr)] lg:items-center">
          <div className="grid content-start gap-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-paper/70">{t("graphVisualEvidence")}</p>
            <ul className="grid gap-2">{scenario.evidence.map((key) => <li className="border border-paper/25 bg-paper/8 px-4 py-3 text-sm font-semibold leading-5" key={key}>{t(key)}</li>)}</ul>
          </div>

          <Connector />

          <div className="grid min-h-48 content-between bg-paper p-5 text-ink">
            <span className="w-fit bg-saffron px-2 py-1 text-xs font-extrabold uppercase tracking-[0.1em]">{t("graphVisualRecord")}</span>
            <div className="grid gap-1"><strong className="font-display text-5xl font-semibold leading-none text-indigo-deep">AS</strong><span className="text-sm font-bold">{t("graphVisualPersonName")}</span></div>
            <span className="text-xs leading-5 text-ink-mute">{t("graphVisualRecordBody")}</span>
          </div>

          <Connector />

          <div className="grid content-start gap-4">
            <div className="bg-saffron p-4 text-ink"><span className="block text-xs font-extrabold uppercase tracking-[0.1em]">{t("graphVisualAction")}</span><strong className="mt-2 block font-display text-2xl font-semibold leading-tight">{t(scenario.action)}</strong></div>
            <div><p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-paper/70">{t("graphVisualResults")}</p><ul className="divide-y divide-paper/25 border-y border-paper/25">{scenario.results.map((key) => <li className="py-2.5 text-sm font-bold leading-5" key={key}>{t(key)}</li>)}</ul></div>
          </div>
        </div>
      </div>
    </section>
  );
}
