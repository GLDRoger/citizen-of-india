"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Page } from "@/components/ui/page";
import { FilePanel } from "@/components/ui/file-panel";
import { SimulatedChip, StatusPill } from "@/components/ui/status";
import { useI18n } from "@/i18n/use-i18n";
import { StepTimeline } from "./step-timeline";

export interface ProcedureStep {
  id: string;
  title: string;
  description: string;
}

interface ProcedureShellProps {
  authority: string;
  children: ReactNode;
  complete?: boolean;
  currentStep: number;
  description: string;
  steps: ProcedureStep[];
  title: string;
}

export function ProcedureShell({ title, description, authority, steps, currentStep, children, complete = false }: ProcedureShellProps) {
  const { t } = useI18n();
  const progress = complete ? 100 : Math.round((Math.min(currentStep, steps.length) / steps.length) * 100);
  return (
    <Page className="grid gap-8 lg:gap-10">
      <div className="flex items-center justify-between gap-4"><Link className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-ink-mute transition hover:text-ink" href="/services"><ArrowLeft aria-hidden className="size-4" />{t("back")}</Link><SimulatedChip authority={authority} /></div>
      <header className="grid gap-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid max-w-4xl gap-3"><p className="eyebrow">{t("guidedProcedure")}</p><h1 className="font-display text-[clamp(3.35rem,8.5vw,7rem)] font-semibold leading-[0.82] tracking-[-0.06em] text-ink">{title}</h1><p className="max-w-2xl text-base leading-7 text-ink-mute">{description}</p></div>
          <div className="flex items-center gap-3 rounded-[4px] border border-paper-line bg-paper-shade px-4 py-2 text-xs font-bold text-ink-mute"><span>{complete ? t("completed") : `${t("nextStep")} ${Math.min(currentStep + 1, steps.length)}`}</span><strong className="text-green-deep">{progress}%</strong></div>
        </div>
        <StepTimeline complete={complete} currentStep={currentStep} steps={steps} />
      </header>
      <section className="min-w-0">{children}</section>
    </Page>
  );
}

interface Participant {
  name: string;
  status: string;
  tone: "info" | "success" | "warning";
}

export function ParticipantStrip({ left, right }: { left: Participant; right: Participant }) {
  const people = [left, right];
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      {people.map((person, index) => <div className="contents" key={person.name}><article className="flex min-h-20 items-center gap-3 rounded-[8px] border border-paper-line bg-paper-shade px-4"><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-ink">{person.name}</strong><StatusPill label={person.status} tone={person.tone} /></div></article>{index === 0 ? <ArrowRight aria-hidden className="mx-auto hidden size-4 text-ink-mute sm:block" /> : null}</div>)}
    </div>
  );
}

export function StepCard({ eyebrow, title, body, children }: { eyebrow?: string; title: string; body: string; children?: ReactNode }) {
  return <FilePanel className="grid gap-6 sm:p-8" label={eyebrow ?? "Current step"}><div className="grid gap-3"><h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-4xl">{title}</h2><p className="max-w-2xl text-sm leading-6 text-ink-mute">{body}</p></div>{children}</FilePanel>;
}

export function CompletionCard({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  const { t } = useI18n();
  return <div className="grid min-h-[360px] place-content-center justify-items-start gap-5 rounded-[8px] bg-green-deep p-7 text-paper sm:p-10"><div className="grid max-w-xl gap-3"><p className="text-xs font-bold text-paper/65">{t("procedureComplete")}</p><h2 className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] sm:text-5xl">{title}</h2><p className="text-sm leading-6 text-paper/75">{body}</p></div>{children}</div>;
}
