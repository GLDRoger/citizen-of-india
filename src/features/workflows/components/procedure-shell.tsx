"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Page } from "@/components/ui/page";
import { FilePanel } from "@/components/ui/file-panel";
import { SimulatedChip, StatusPill } from "@/components/ui/status";
import { useI18n } from "@/i18n/use-i18n";
import { StepTimeline } from "./step-timeline";
import { MutationReceipt } from "./mutation-receipt";

export interface ProcedureStep {
  id: string;
  title: string;
  description?: string;
}

interface ProcedureShellProps {
  authority: string;
  children: ReactNode;
  complete?: boolean;
  currentStep: number;
  description?: string;
  procedureId: string;
  steps: ProcedureStep[];
  title: string;
}

export function ProcedureShell({ title, description, authority, steps, currentStep, children, complete = false, procedureId }: ProcedureShellProps) {
  const { t } = useI18n();
  const progress = complete ? 100 : Math.round((Math.min(currentStep, steps.length) / steps.length) * 100);
  return (
    <Page className="grid gap-4 lg:gap-7">
      <div className="flex items-center justify-end gap-4 min-[900px]:justify-between"><Link className="hidden min-h-11 items-center gap-2 text-xs font-bold text-ink-mute transition-colors hover:text-ink min-[900px]:inline-flex" href="/services"><ArrowLeft aria-hidden className="size-4" />{t("back")}</Link><SimulatedChip authority={authority} /></div>
      <header className="grid gap-3 sm:gap-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="grid max-w-4xl gap-2"><h1 className="font-display text-[clamp(2.3rem,5vw,4.35rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-ink">{title}</h1>{description ? <p className="max-w-2xl text-sm leading-6 text-ink-mute sm:text-base">{description}</p> : null}</div>
          <div className="hidden items-center gap-3 border-y border-paper-line py-2 text-xs font-bold text-ink-mute md:flex"><span>{complete ? t("completed") : `${t("nextStep")} ${Math.min(currentStep + 1, steps.length)}`}</span><strong className="text-indigo-deep">{progress}%</strong></div>
        </div>
        <StepTimeline complete={complete} currentStep={currentStep} steps={steps} />
      </header>
      <section className="min-w-0">{children}</section>
      <MutationReceipt procedureId={procedureId} />
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
    <>
      <div className="grid grid-cols-2 gap-4 border-y border-paper-line py-3 sm:hidden">{people.map((person) => <div className="min-w-0" key={person.name}><strong className="block text-sm leading-5 text-ink [overflow-wrap:anywhere]">{person.name}</strong><StatusPill label={person.status} tone={person.tone} /></div>)}</div>
      <div className="hidden items-center gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">{people.map((person, index) => <div className="contents" key={person.name}><article className="flex min-h-18 items-center gap-3 rounded-[8px] border border-paper-line bg-paper-shade px-4"><div className="min-w-0 flex-1"><strong className="block text-sm leading-5 text-ink [overflow-wrap:anywhere]">{person.name}</strong><StatusPill label={person.status} tone={person.tone} /></div></article>{index === 0 ? <ArrowRight aria-hidden className="mx-auto size-4 text-ink-mute" /> : null}</div>)}</div>
    </>
  );
}

export function StepCard({ eyebrow, title, body, children }: { eyebrow?: string; title: string; body?: string; children?: ReactNode }) {
  const { t } = useI18n();
  return <FilePanel className="grid gap-4 sm:gap-6 sm:p-7" label={eyebrow ?? t("currentStepLabel")}><div className="grid gap-2"><h2 className="font-display text-[1.85rem] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.4rem]">{title}</h2>{body ? <p className="max-w-2xl text-sm leading-6 text-ink-mute">{body}</p> : null}</div>{children}</FilePanel>;
}

export function CompletionCard({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return <div className="grid min-h-[280px] place-content-center justify-items-start gap-5 rounded-[8px] bg-indigo-deep p-7 text-paper sm:p-10"><div className="grid max-w-xl gap-3"><h2 className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] sm:text-5xl">{title}</h2><p className="text-sm leading-6 text-paper/72">{body}</p></div>{children}</div>;
}
