"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BadgeCheck, FileCheck2, Landmark, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimulatedChip } from "@/components/ui/status";
import { getMarriageRipple } from "@/features/graph/insights";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";

function RippleRow({ action, body, done, icon, title }: { action?: ReactNode; body: string; done: boolean; icon: ReactNode; title: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 border-b border-paper/15 py-4 last:border-b-0">
      <span className={`mt-0.5 ${done ? "text-green-tint" : "text-paper/55"}`}>{icon}</span>
      <div className="grid justify-items-start gap-2">
        <strong className="text-sm leading-5 text-paper">{title}</strong>
        <span className="text-xs leading-5 text-paper/65">{body}</span>
        {action}
      </div>
    </div>
  );
}

export function MarriageRippleCard({ personId }: { personId: string }) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const ripple = getMarriageRipple(graph);
  const canAddNominee = personId === "person:arjun";
  const isParticipant = canAddNominee || personId === "person:priya";
  if (!ripple.married || !isParticipant) return null;

  const addNominee = () => {
    if (!canAddNominee || ripple.nomineeAdded) return;
    const mutations: GraphMutation[] = [
      {
        type: "addEdge",
        edge: {
          id: "e:priya-nominee-arjun-epf",
          type: "nomineeOf",
          from: "person:priya",
          to: "emp:arjun-meridian",
          attrs: { instrument: "EPF", share: 1 },
          validFrom: "2026-09-03",
          status: "active",
          verification: { source: "EPFO", state: "pending", asOf: "2026-09-03" },
        },
      },
    ];
    commit({ actorId: personId, labelKey: "eventEpfNomineeAdded", procedureId: "marriage-arjun-priya", mutations });
  };
  const nomineeAction = ripple.nomineeAdded
    ? undefined
    : canAddNominee
      ? <Button className="bg-paper text-ink hover:bg-saffron" onClick={addNominee}>{t("rippleNomineeAction")} <ArrowRight aria-hidden className="size-4" /></Button>
      : <span className="text-xs font-bold text-paper/72">{t("rippleNomineeOwnerOnly")}</span>;

  return (
    <section className="grid gap-2 rounded-[8px] bg-indigo-deep p-6 text-paper sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-paper/55">{t("rippleEyebrow")}</p>
        <SimulatedChip authority="Citizen record relay" />
      </div>
      <h3 className="font-display text-2xl font-semibold leading-tight">{t("rippleTitle")}</h3>
      <div className="mt-2">
        <RippleRow
          done={ripple.certificateSaved}
          icon={<FileCheck2 aria-hidden className="size-5" />}
          title={t("rippleCertificateTitle")}
          body={t("rippleCertificateBody")}
          action={<Link className="text-xs font-bold text-paper underline decoration-paper/40 underline-offset-4" href="/documents">{t("viewDocuments")}</Link>}
        />
        <RippleRow
          done={ripple.nomineeAdded}
          icon={ripple.nomineeAdded ? <BadgeCheck aria-hidden className="size-5" /> : <UserRoundPlus aria-hidden className="size-5" />}
          title={t("rippleNomineeTitle")}
          body={ripple.nomineeAdded ? t("rippleNomineeDoneBody") : t("rippleNomineeBody")}
          action={nomineeAction}
        />
        <RippleRow
          done={false}
          icon={<Landmark aria-hidden className="size-5" />}
          title={t("rippleEligibilityTitle")}
          body={t("rippleEligibilityBody")}
          action={<Link className="text-xs font-bold text-paper underline decoration-paper/40 underline-offset-4" href="/discover">{t("rippleEligibilityAction")}</Link>}
        />
      </div>
    </section>
  );
}
