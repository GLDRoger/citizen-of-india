"use client";

import { ArrowRight, BadgeIndianRupee, Building2, FileCheck2, MapPin, Store, WandSparkles } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getNodeByType } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { buildIntentContext, classifyIntent } from "@/features/intent/intent-client";
import type { Language } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const stepsByLanguage: Record<Language, ProcedureStep[]> = {
  en: [{ id: "intent", title: "Describe the business", description: "Type and location, in plain language." }, { id: "plan", title: "Review the plan", description: "Registrations, licences and schemes." }, { id: "start", title: "Start the first action", description: "Create an honest draft." }],
  hi: [{ id: "intent", title: "व्यवसाय बताएँ", description: "प्रकार और स्थान आसान भाषा में।" }, { id: "plan", title: "योजना जाँचें", description: "पंजीकरण, लाइसेंस और योजनाएँ।" }, { id: "start", title: "पहला काम शुरू करें", description: "एक साफ़ ड्राफ्ट बनाएँ।" }],
  kn: [{ id: "intent", title: "ವ್ಯವಹಾರ ವಿವರಿಸಿ", description: "ವಿಧ ಮತ್ತು ಸ್ಥಳವನ್ನು ಸರಳವಾಗಿ ತಿಳಿಸಿ." }, { id: "plan", title: "ಯೋಜನೆ ಪರಿಶೀಲಿಸಿ", description: "ನೋಂದಣಿ, ಪರವಾನಗಿ ಮತ್ತು ಯೋಜನೆಗಳು." }, { id: "start", title: "ಮೊದಲ ಕ್ರಮ ಪ್ರಾರಂಭಿಸಿ", description: "ಸ್ಪಷ್ಟ ಕರಡು ರಚಿಸಿ." }],
};

interface PlanItem {
  title: string;
  body: string;
  kind: "registration" | "licence" | "scheme" | "finance";
}

type Translate = ReturnType<typeof useI18n>["t"];

function createPlan(businessType: string, city: string, t: Translate, existingBusinessName?: string): PlanItem[] {
  return [
    existingBusinessName
      ? { kind: "registration", title: t("startExistingPlanTitle", { business: existingBusinessName }), body: t("startExistingPlanBody", { activity: businessType, business: existingBusinessName }) }
      : { kind: "registration", title: t("startFreshPlanTitle"), body: t("startFreshPlanBody", { city }) },
    { kind: "registration", title: t("startUdyamPlanTitle"), body: t("startUdyamPlanBody", { activity: businessType }) },
    { kind: "licence", title: t("startTradePlanTitle"), body: t("startTradePlanBody", { city }) },
    { kind: "licence", title: t("startGstPlanTitle"), body: t("startGstPlanBody") },
    { kind: "scheme", title: t("startSupportPlanTitle"), body: t("startSupportPlanBody") },
    { kind: "finance", title: t("startMoneyPlanTitle"), body: t("startMoneyPlanBody") },
  ];
}

const planIcons = { registration: Building2, licence: FileCheck2, scheme: WandSparkles, finance: BadgeIndianRupee };

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
  const [loading, setLoading] = useState(false);
  if (!personId) return null;
  const applicationId = `app:new-business-registration:${personId.slice(7)}`;
  const application = graph.nodes
    .filter((node) => node.type === "application")
    .find((node) => node.id === applicationId);
  const complete = Boolean(application);
  const currentStep = complete ? 2 : plan ? 1 : 0;
  const existingBusiness = getNodeByType(graph, "biz:sharma-web", "business");

  const generatePlan = async () => {
    if (businessType.trim().length < 3 || city.trim().length < 2) return;
    setLoading(true);
    try {
      const response = await classifyIntent(`I want to start a ${businessType} business in ${city}`, buildIntentContext(graph, personId));
      setSummary(response.language === language ? response.reply : t("startPlanBody"));
      setPlan(createPlan(businessType, city, t, existingBusiness?.attrs.name));
    } finally {
      setLoading(false);
    }
  };

  const startRegistration = () => {
    if (!plan || application) return;
    const mutations: GraphMutation[] = [
      { type: "addNode", node: { id: applicationId, type: "application", attrs: { title: t("startApplicationTitle", { business: businessType, city }), authority: t("startPlanningAuthority"), status: "draft", createdOn: "2026-08-24", kind: "business-registration", participants: [personId], currentStep: 0, note: "Local draft for the first registration action." }, verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" } } },
      { type: "addEdge", edge: { id: `e:${personId.slice(7)}-subject-new-business-draft`, type: "subjectOf", from: personId, to: applicationId, attrs: {}, validFrom: "2026-08-24", status: "active", verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" } } },
    ];
    commit({ actorId: personId, labelKey: "eventBusinessPlanStarted", procedureId: "start-business", mutations });
  };

  const content = complete ? (
    <CompletionCard title={t("startCompleteTitle")} body={t("startCompleteBody")}><LinkButton href="/#money" variant="inverse">{t("startViewDraft")} <ArrowRight aria-hidden className="size-4" /></LinkButton></CompletionCard>
  ) : !plan ? (
    <StepCard eyebrow={t("startSetupEyebrow")} title={t("startSetupTitle")} body={t("startSetupBody")}>{existingBusiness ? <p className="border-y border-paper-line py-3 text-xs leading-5 text-ink-mute">{t("existingBusinessContext", { business: existingBusiness.attrs.name })}</p> : null}<div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2"><span className="flex items-center gap-2 text-xs font-bold text-ink"><Store aria-hidden className="size-4 text-green-deep" />{t("startBusinessType")}</span><input className="h-13 rounded-[8px] border border-paper-line bg-paper px-4 text-sm outline-none focus:border-green-deep focus:ring-4 focus:ring-green-deep/10" maxLength={100} onChange={(event) => setBusinessType(event.target.value)} value={businessType} /></label><label className="grid gap-2"><span className="flex items-center gap-2 text-xs font-bold text-ink"><MapPin aria-hidden className="size-4 text-green-deep" />{t("startCity")}</span><input className="h-13 rounded-[8px] border border-paper-line bg-paper px-4 text-sm outline-none focus:border-green-deep focus:ring-4 focus:ring-green-deep/10" maxLength={80} onChange={(event) => setCity(event.target.value)} value={city} /></label></div><Button loading={loading} onClick={() => void generatePlan()}><WandSparkles aria-hidden className="size-4" />{t("startGeneratePlan")}</Button></StepCard>
  ) : (
    <StepCard eyebrow={`${businessType} · ${city}`} title={t("startPlanTitle")} body={summary || t("startPlanBody")}><div className="flex items-center gap-2"><SimulatedChip authority={t("startPlanningAuthority")} /></div><div className="grid gap-3 sm:grid-cols-2">{plan.map((item, index) => { const Icon = planIcons[item.kind]; return <article className="grid min-h-44 content-between gap-5 rounded-[8px] bg-paper-line p-4" key={item.title}><div className="flex items-center justify-between"><Icon aria-hidden className="size-5 text-green-deep" /><span className="font-display text-xs font-bold text-ink-mute">{String(index + 1).padStart(2, "0")}</span></div><div><strong className="block text-sm text-ink">{item.title}</strong><p className="mt-1 text-xs leading-5 text-ink-mute">{item.body}</p></div></article>; })}</div><div className="flex flex-col gap-2 sm:flex-row"><Button onClick={startRegistration}>{t("startFirstRegistration")} <ArrowRight aria-hidden className="size-4" /></Button><Button onClick={() => setPlan(null)} variant="secondary">{t("startChangePlan")}</Button></div></StepCard>
  );

  return <ProcedureShell authority={t("startPlanningAuthority")} complete={complete} currentStep={currentStep} description={t("startBusinessPromise")} procedureId="start-business" steps={steps} title={t("startBusinessService")}>{content}</ProcedureShell>;
}
