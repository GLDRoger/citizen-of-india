"use client";

import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePanel } from "@/components/ui/file-panel";
import { StatusPill } from "@/components/ui/status";
import { getApplications, getEligibility } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { localizeRuleExplanation } from "@/i18n/content";
import { useI18n } from "@/i18n/use-i18n";

function ReasonList({ reasons }: { reasons: string[] }) {
  const { language } = useI18n();
  return <ul className="grid gap-2">{reasons.map((reason) => <li className="flex gap-2 text-xs leading-5 text-ink-mute" key={reason}><Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-green-deep" />{localizeRuleExplanation(language, reason)}</li>)}</ul>;
}

function SuccessionDetail({ authority, documents, timeline, title }: { authority: string; documents: string; timeline: string; title: string }) {
  const { t } = useI18n();
  return (
    <details className="group border-t border-paper-line py-4">
      <summary className="flex min-h-11 items-center justify-between gap-4 font-display text-lg font-bold text-ink"><span>{title}<small className="mt-1 block font-sans text-xs font-normal text-ink-mute">{authority}</small></span><ChevronDown aria-hidden className="size-4 shrink-0 transition group-open:rotate-180" /></summary>
      <div className="grid gap-4 pb-2 pt-4 sm:grid-cols-2"><p className="grid gap-1 text-xs leading-5 text-ink-mute"><strong className="text-ink">{t("expectedTimeline")}</strong>{timeline}</p><p className="grid gap-1 text-xs leading-5 text-ink-mute"><strong className="text-ink">{t("whatToCarry")}</strong>{documents}</p><p className="text-xs leading-5 text-brick sm:col-span-2">{t("noOwnershipChanged")}</p></div>
    </details>
  );
}

export function FamilyBriefing({ onViewSunita }: { onViewSunita: () => void }) {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const eligibility = getEligibility(graph, "person:sunita");
  const familyPension = eligibility.find((result) => result.benefit.id === "ben:eps-family-pension");
  const widowPension = eligibility.find((result) => result.benefit.id === "ben:ka-widow-pension");
  const succession = getApplications(graph, "person:arjun").filter((application) => application.attrs.kind === "property-mutation" || application.attrs.kind === "vehicle-transfer");
  const propertyAuthority = succession.find((application) => application.attrs.kind === "property-mutation")?.attrs.authority ?? "BBMP";
  const vehicleAuthority = succession.find((application) => application.attrs.kind === "vehicle-transfer")?.attrs.authority ?? "RTO Koramangala (KA-01)";

  return (
    <FilePanel className="grid gap-8 sm:p-8" label={t("familyBriefing")}>
      <header className="grid gap-3"><h2 className="font-display text-4xl font-bold leading-none tracking-[-0.04em] text-ink">{t("familyBriefingTitle")}</h2><p className="max-w-2xl text-sm leading-6 text-ink-mute">{t("familyBriefingBody")}</p></header>
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="grid content-start gap-4 rounded-[8px] border border-green-deep/25 bg-green-tint p-5"><StatusPill label={t("eligible")} tone="success" /><div><h3 className="font-display text-2xl font-bold text-ink">{t("familyPensionEligible")}</h3><p className="mt-1 text-sm font-bold text-green-deep">≈ {t("monthlyAmount", { amount: "₹4,100" })}</p></div>{familyPension ? <ReasonList reasons={familyPension.passedReasons} /> : null}</article>
        <article className="grid content-start gap-4 rounded-[8px] border border-brick/20 bg-brick-tint p-5"><StatusPill label={t("missingEvidence")} tone="warning" /><div><h3 className="font-display text-2xl font-bold text-ink">{t("widowPensionBlocked")}</h3><p className="mt-1 text-xs leading-5 text-brick">{t("blockedByIncomeDeclaration")}</p></div>{widowPension ? <ReasonList reasons={widowPension.passedReasons} /> : null}</article>
      </section>
      <section id="family-briefing"><h3 className="eyebrow">{t("successionNextActions")}</h3><div className="mt-3 border-b border-paper-line"><SuccessionDetail authority={propertyAuthority} documents={t("propertyDocuments")} timeline={t("propertyTimeline")} title={t("propertySuccession")} /><SuccessionDetail authority={vehicleAuthority} documents={t("vehicleDocuments")} timeline={t("vehicleTimeline")} title={t("vehicleSuccession")} /></div></section>
      <Button className="justify-self-start" onClick={onViewSunita} variant="secondary">{t("viewAsSunita")}</Button>
    </FilePanel>
  );
}
