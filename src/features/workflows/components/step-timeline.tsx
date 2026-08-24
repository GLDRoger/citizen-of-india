import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ProcedureStep } from "./procedure-shell";

interface StepTimelineProps {
  complete: boolean;
  currentStep: number;
  steps: ProcedureStep[];
}

export function StepTimeline({ complete, currentStep, steps }: StepTimelineProps) {
  return (
    <div className="min-w-0 overflow-x-auto border-y border-paper-line py-5 [scrollbar-width:none]">
      <ol className="flex min-w-max lg:grid lg:min-w-0" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, index) => {
          const done = complete || index < currentStep;
          const active = !complete && index === currentStep;
          return (
            <li className="w-40 pr-3 last:pr-0 lg:w-auto" key={step.id}>
              <div className="flex items-center"><span className={cn("grid size-8 shrink-0 place-items-center rounded-[4px] border text-xs font-black", done ? "border-green-deep bg-green-deep text-paper" : active ? "border-green-deep bg-green-deep text-paper" : "border-paper-line bg-paper-shade text-ink-mute")}>{done ? <Check aria-hidden className="size-4" /> : index + 1}</span>{index < steps.length - 1 ? <span aria-hidden className={cn("h-px min-w-8 flex-1", done ? "bg-green-deep" : "bg-paper-line")} /> : null}</div>
              <div className="grid gap-1 pr-3 pt-3"><strong className={cn("text-xs leading-4", active ? "text-green-deep" : "text-ink")}>{step.title}</strong><span className="text-[0.68rem] leading-4 text-ink-mute">{step.description}</span></div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
