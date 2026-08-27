import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ProcedureStep } from "./procedure-shell";

interface StepTimelineProps {
  complete: boolean;
  currentStep: number;
  steps: ProcedureStep[];
}

export function StepTimeline({ complete, currentStep, steps }: StepTimelineProps) {
  const activeIndex = complete ? Math.max(steps.length - 1, 0) : Math.min(currentStep, Math.max(steps.length - 1, 0));
  const activeStep = steps[activeIndex];
  return (
    <div className="min-w-0 overflow-hidden rounded-[8px] border border-paper-line bg-paper-shade px-4">
      <div className="grid gap-2 py-4 md:hidden">
        <div className="flex items-center justify-between gap-4 text-xs font-bold leading-4 text-ink-mute"><span>{activeStep?.title}</span><span className="tabular-nums text-indigo-deep">{complete ? steps.length : activeIndex + 1}/{steps.length}</span></div>
        <div aria-hidden className="h-1 overflow-hidden rounded-[2px] bg-paper-line"><span className="block h-full bg-indigo-deep" style={{ width: `${complete ? 100 : ((activeIndex + 1) / steps.length) * 100}%` }} /></div>
      </div>
      <ol className="hidden py-4 md:grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, index) => {
          const done = complete || index < currentStep;
          const active = !complete && index === currentStep;
          return (
            <li className="pr-3 last:pr-0" key={step.id}>
              <div className="flex items-center"><span className={cn("grid size-8 shrink-0 place-items-center rounded-[4px] border text-xs font-black", done ? "border-green-deep bg-green-deep text-paper" : active ? "border-indigo-deep bg-indigo-deep text-paper" : "border-paper-line bg-paper text-ink-mute")}>{done ? <Check aria-hidden className="size-4" /> : index + 1}</span>{index < steps.length - 1 ? <span aria-hidden className={cn("h-px min-w-8 flex-1", done ? "bg-green-deep" : active ? "bg-indigo" : "bg-paper-line")} /> : null}</div>
              <div className="grid gap-1 pr-3 pt-3"><strong className={cn("text-xs leading-4", active ? "text-indigo-deep" : "text-ink")}>{step.title}</strong><span className="text-xs leading-4 text-ink-mute">{step.description}</span></div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
