"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip, StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getOwnedAssets } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [{ id: "intent", title: "Describe the business", description: "What you will do and where." }, { id: "plan", title: "Review the plan", description: "Registrations, licences and benefits." }, { id: "start", title: "Start the first task", description: "Save a draft in this demo." }],
  hi: [{ id: "intent", title: "व्यवसाय बताएँ", description: "प्रकार और स्थान आसान भाषा में।" }, { id: "plan", title: "योजना जाँचें", description: "पंजीकरण, लाइसेंस और योजनाएँ।" }, { id: "start", title: "पहला काम शुरू करें", description: "एक साफ़ ड्राफ्ट बनाएँ।" }],
  kn: [{ id: "intent", title: "ವ್ಯವಹಾರ ವಿವರಿಸಿ", description: "ವಿಧ ಮತ್ತು ಸ್ಥಳವನ್ನು ಸರಳವಾಗಿ ತಿಳಿಸಿ." }, { id: "plan", title: "ಯೋಜನೆ ಪರಿಶೀಲಿಸಿ", description: "ನೋಂದಣಿ, ಪರವಾನಗಿ ಮತ್ತು ಯೋಜನೆಗಳು." }, { id: "start", title: "ಮೊದಲ ಕ್ರಮ ಪ್ರಾರಂಭಿಸಿ", description: "ಸ್ಪಷ್ಟ ಕರಡು ರಚಿಸಿ." }],
};

interface PlanItem {
  title: string;
  body: string;
}

type Translate = ReturnType<typeof useI18n>["t"];

function createPlan(businessType: string, city: string, t: Translate, existingBusinessName?: string): PlanItem[] {
  return [
    existingBusinessName
      ? { title: t("startExistingPlanTitle", { business: existingBusinessName }), body: t("startExistingPlanBody", { activity: businessType, business: existingBusinessName }) }
      : { title: t("startFreshPlanTitle"), body: t("startFreshPlanBody", { city }) },
    existingBusinessName
      ? { title: t("startUdyamPlanTitle"), body: t("startUdyamPlanBody", { activity: businessType }) }
      : { title: t("startRegisterUdyamPlanTitle"), body: t("startRegisterUdyamPlanBody", { activity: businessType }) },
    { title: t("startTradePlanTitle"), body: t("startTradePlanBody", { city }) },
    { title: t("startGstPlanTitle"), body: t("startGstPlanBody") },
  ];
}

export function StartBusinessWorkflow() {
  const { language, t } = useI18n();
  const steps = stepsByLanguage[language];
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [businessType, setBusinessType] = useState(() => t("startDefaultBusiness"));
  const [city, setCity] = useState("Bengaluru");
  const [plan, setPlan] = useState<PlanItem[] | null>(null);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  if (!personId) return null;
  const applicationId = `app:new-business-registration:${personId.slice(7)}`;
  const application = graph.nodes
    .filter((node) => node.type === "application")
    .find((node) => node.id === applicationId);
  const complete = application?.attrs.status === "completed";
  const currentStep = application ? 2 : plan ? 1 : 0;
  const existingBusiness = getOwnedAssets(graph, personId).find((node) => node.type === "business");
  const savedBusinessType = application?.attrs.businessType ?? businessType;
  const savedCity = application?.attrs.city ?? city;
  const savedPlan = application ? createPlan(savedBusinessType, savedCity, t, existingBusiness?.attrs.name) : [];
  const detailsValid = businessType.trim().length >= 3 && city.trim().length >= 2;

  const generatePlan = () => {
    if (businessType.trim().length < 3 || city.trim().length < 2) {
      setError(t("startMissingDetails"));
      return;
    }
    setError("");
    setSummary(t("startPlanBody"));
    setPlan(createPlan(businessType, city, t, existingBusiness?.attrs.name));
  };

  const startRegistration = () => {
    if (!plan || application) return;
    const mutations: GraphMutation[] = [
      { type: "addNode", node: { id: applicationId, type: "application", attrs: { title: t("startApplicationTitle", { business: businessType, city }), authority: t("startPlanningAuthority"), status: "draft", createdOn: "2026-08-28", kind: "business-registration", participants: [personId], currentStep: 0, businessType, city, note: "Local draft for the first registration action." }, verification: { source: "Self", state: "self-declared", asOf: "2026-08-28" } } },
      { type: "addEdge", edge: { id: `e:${personId.slice(7)}-subject-new-business-draft`, type: "subjectOf", from: personId, to: applicationId, attrs: {}, validFrom: "2026-08-28", status: "active", verification: { source: "Self", state: "self-declared", asOf: "2026-08-28" } } },
    ];
    commit({ actorId: personId, labelKey: "eventBusinessPlanStarted", procedureId: "start-business", mutations });
  };

  const content = application ? (
    <div className="grid gap-7"><CompletionCard title={t("startCompleteTitle")} body={t("startCompleteBody")}><LinkButton href="#application" variant="inverse">{t("startViewDraft")} <ArrowDown aria-hidden className="size-4" /></LinkButton></CompletionCard><section className="grid scroll-mt-24 gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-6 sm:p-8" id="application"><div className="flex flex-wrap items-start justify-between gap-4"><div className="grid gap-2"><StatusPill label={t("statusDraft")} tone="info" /><h2 className="font-display text-3xl font-semibold text-ink">{t("startApplicationTitle", { business: savedBusinessType, city: savedCity })}</h2></div><SimulatedChip authority={application.attrs.authority} /></div><ol className="border-y border-paper-line">{savedPlan.map((item, index) => <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-paper-line py-4 last:border-b-0" key={item.title}><span className="font-display text-xs font-bold text-indigo-deep">{String(index + 1).padStart(2, "0")}</span><div><strong className="block text-sm text-ink">{item.title}</strong><p className="mt-1 text-xs leading-5 text-ink-mute">{item.body}</p></div></li>)}</ol><div><LinkButton href="/services" variant="secondary">{t("back")}</LinkButton></div></section></div>
  ) : !plan ? (
    <StepCard eyebrow={t("startSetupEyebrow")} title={t("startSetupTitle")} body={t("startSetupBody")}>{existingBusiness ? <p className="border-y border-paper-line py-3 text-xs leading-5 text-ink-mute">{t("existingBusinessContext", { business: existingBusiness.attrs.name })}</p> : null}<div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2"><span className="text-xs font-bold text-ink">{t("startBusinessType")}</span><input aria-invalid={Boolean(error)} className="h-13 rounded-[8px] border border-paper-line bg-paper px-4 text-sm outline-none focus:border-indigo-deep focus:ring-4 focus:ring-indigo-tint" maxLength={100} onChange={(event) => { setBusinessType(event.target.value); setError(""); }} value={businessType} /></label><label className="grid gap-2"><span className="text-xs font-bold text-ink">{t("startCity")}</span><input aria-invalid={Boolean(error)} className="h-13 rounded-[8px] border border-paper-line bg-paper px-4 text-sm outline-none focus:border-indigo-deep focus:ring-4 focus:ring-indigo-tint" maxLength={80} onChange={(event) => { setCity(event.target.value); setError(""); }} value={city} /></label></div>{error ? <p className="text-sm font-bold text-brick" role="alert">{error}</p> : null}<Button disabled={!detailsValid} onClick={generatePlan}>{t("startGeneratePlan")}</Button></StepCard>
  ) : (
    <StepCard eyebrow={`${businessType} · ${city}`} title={t("startPlanTitle")} body={summary || t("startPlanBody")}><div className="flex items-center gap-2"><SimulatedChip authority={t("startPlanningAuthority")} /></div><ol className="border-y border-paper-line">{plan.map((item, index) => <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-paper-line py-4 last:border-b-0" key={item.title}><span className="font-display text-xs font-bold text-indigo-deep">{String(index + 1).padStart(2, "0")}</span><div><strong className="block text-sm text-ink">{item.title}</strong><p className="mt-1 text-xs leading-5 text-ink-mute">{item.body}</p></div></li>)}</ol><div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center"><Button onClick={startRegistration}>{t("startFirstRegistration")} <ArrowRight aria-hidden className="size-4" /></Button><button className="min-h-11 px-2 text-sm font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" onClick={() => setPlan(null)} type="button">{t("startChangePlan")}</button></div></StepCard>
  );

  return <ProcedureShell authority={t("startPlanningAuthority")} complete={complete} currentStep={currentStep} procedureId="start-business" showProgress={!application || complete} steps={steps} title={t("startBusinessService")}>{content}</ProcedureShell>;
}
