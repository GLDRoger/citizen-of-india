"use client";

import Link from "next/link";
import { LazyMotion, domAnimation, m, MotionConfig } from "framer-motion";
import { ArrowLeft, Check, Circle } from "lucide-react";
import type { ReactNode } from "react";
import { Page } from "@/components/ui/page";
import { SimulatedChip } from "@/components/ui/status";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";

export interface ProcedureStep {
  id: string;
  title: string;
  description: string;
}

interface ProcedureShellProps {
  title: string;
  description: string;
  authority: string;
  steps: ProcedureStep[];
  currentStep: number;
  children: ReactNode;
  complete?: boolean;
}

export function ProcedureShell({ title, description, authority, steps, currentStep, children, complete = false }: ProcedureShellProps) {
  const { t } = useI18n();
  const progress = complete ? 100 : Math.round((Math.min(currentStep, steps.length) / steps.length) * 100);
  return (
    <Page className="grid gap-8">
      <div className="flex items-center justify-between gap-4">
        <Link className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-ink-muted transition hover:text-ink" href="/"><ArrowLeft aria-hidden className="size-4" />{t("back")}</Link>
        <SimulatedChip authority={authority} />
      </div>
      <header className="grid gap-5 border-b border-line pb-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="grid max-w-3xl gap-3"><p className="eyebrow">Guided procedure</p><h1 className="font-display text-[2.5rem] font-semibold leading-[0.92] tracking-[-0.045em] text-ink sm:text-6xl">{title}</h1><p className="max-w-2xl text-sm leading-6 text-ink-muted sm:text-base">{description}</p></div>
        <div className="grid w-full min-w-48 gap-2 lg:w-56"><div className="flex justify-between text-xs font-bold text-ink-muted"><span>{complete ? t("completed") : `${t("nextStep")} ${Math.min(currentStep + 1, steps.length)}`}</span><span>{progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-surface-strong"><div className="h-full origin-left rounded-full bg-action transition-transform duration-500" style={{ transform: `scaleX(${progress / 100})` }} /></div></div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <ol className="grid gap-0 border-y border-line lg:sticky lg:top-24">
          {steps.map((step, index) => {
            const done = complete || index < currentStep;
            const active = !complete && index === currentStep;
            return (
              <li className={cn("grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-line py-4 last:border-b-0", active && "text-action-strong")} key={step.id}>
                <span className={cn("mt-0.5 grid size-6 place-items-center rounded-full", done ? "bg-success text-action-ink" : active ? "bg-action text-action-ink" : "bg-surface-strong text-ink-faint")}>{done ? <Check aria-hidden className="size-3.5" /> : <Circle aria-hidden className="size-3" />}</span>
                <div><strong className="block text-sm">{step.title}</strong><span className="mt-0.5 block text-xs leading-5 text-ink-muted">{step.description}</span></div>
              </li>
            );
          })}
        </ol>
        <MotionConfig reducedMotion="user">
          <LazyMotion features={domAnimation} strict>
            <m.section key={`${currentStep}:${complete}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="min-w-0">
              {children}
            </m.section>
          </LazyMotion>
        </MotionConfig>
      </div>
    </Page>
  );
}

export function StepCard({ eyebrow, title, body, children }: { eyebrow?: string; title: string; body: string; children?: ReactNode }) {
  return <div className="grid gap-6 rounded-[24px] border border-line bg-surface p-5 sm:p-8"><div className="grid gap-3">{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-4xl">{title}</h2><p className="max-w-2xl text-sm leading-6 text-ink-muted">{body}</p></div>{children}</div>;
}

export function CompletionCard({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return <div className="relative grid min-h-[360px] place-content-center justify-items-start gap-5 overflow-hidden rounded-[24px] bg-action p-7 text-action-ink sm:p-10"><div aria-hidden className="absolute -right-16 -top-20 size-64 rounded-full border-[40px] border-saffron/90" /><span className="relative grid size-14 place-items-center rounded-full bg-action-ink text-action"><Check aria-hidden className="size-7" /></span><div className="relative grid max-w-xl gap-3"><p className="text-xs font-bold uppercase tracking-[0.16em] text-action-ink/65">Procedure complete</p><h2 className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] sm:text-5xl">{title}</h2><p className="text-sm leading-6 text-action-ink/75">{body}</p></div><div className="relative">{children}</div></div>;
}
