"use client";

import { ArrowRight, BadgeIndianRupee, Building2, FileCheck2, MapPin, Store, WandSparkles } from "lucide-react";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { SimulatedChip } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { buildIntentContext, classifyIntent } from "@/features/intent/intent-client";
import { CompletionCard, ProcedureShell, StepCard, type ProcedureStep } from "../components/procedure-shell";

const steps: ProcedureStep[] = [
  { id: "intent", title: "Describe the business", description: "Type and location, in plain language." },
  { id: "plan", title: "Review the plan", description: "Registrations, licences and schemes." },
  { id: "start", title: "Start the first action", description: "Create an honest draft." },
];

interface PlanItem {
  title: string;
  body: string;
  kind: "registration" | "licence" | "scheme" | "finance";
}

function createPlan(businessType: string, city: string): PlanItem[] {
  return [
    { kind: "registration", title: "Choose a sole proprietorship", body: `Start small in ${city}; keep the entity simple until partners or investment make a company useful.` },
    { kind: "registration", title: "Update Udyam for the new activity", body: `Add ${businessType} to the MSME record before applying for linked schemes.` },
    { kind: "licence", title: "Check the local trade licence", body: `${city} municipal rules depend on the premises and activity. Citizen will ask for the exact ward before preparing a form.` },
    { kind: "licence", title: "Confirm GST and sector registration", body: "GST depends on turnover and sales pattern. Food, transport and regulated work may need a sector licence." },
    { kind: "scheme", title: "Review MSME support", body: "Compare state incentives and central schemes only after entity, location and activity are final." },
    { kind: "finance", title: "Separate business money", body: "Open a dedicated current account and keep invoices from day one. This makes later credit decisions clearer." },
  ];
}

const planIcons = { registration: Building2, licence: FileCheck2, scheme: WandSparkles, finance: BadgeIndianRupee };

export function StartBusinessWorkflow() {
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [businessType, setBusinessType] = useState("home-style food service");
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
  const currentStep = complete ? 3 : plan ? 1 : 0;

  const generatePlan = async () => {
    if (businessType.trim().length < 3 || city.trim().length < 2) return;
    setLoading(true);
    try {
      const response = await classifyIntent(`I want to start a ${businessType} business in ${city}`, buildIntentContext(graph, personId));
      setSummary(response.reply);
      setPlan(createPlan(businessType, city));
    } finally {
      setLoading(false);
    }
  };

  const startRegistration = () => {
    if (!plan || application) return;
    const mutations: GraphMutation[] = [
      { type: "addNode", node: { id: applicationId, type: "application", attrs: { title: `Start ${businessType} in ${city}`, authority: "Citizen action plan", status: "draft", createdOn: "2026-08-24", kind: "business-registration", participants: [personId], currentStep: 0, note: "Local draft for the first registration action." }, verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" } } },
      { type: "addEdge", edge: { id: `e:${personId.slice(7)}-subject-new-business-draft`, type: "subjectOf", from: personId, to: applicationId, attrs: {}, validFrom: "2026-08-24", status: "active", verification: { source: "Self", state: "self-declared", asOf: "2026-08-24" } } },
    ];
    commit({ actorId: personId, label: "New business registration plan started", procedureId: "start-business", mutations });
  };

  const content = complete ? (
    <CompletionCard title="Your first registration draft is ready." body="Citizen kept the plan focused and created one honest draft. No government filing or business registration was submitted."><LinkButton href="/activity" variant="inverse">View draft <ArrowRight aria-hidden className="size-4" /></LinkButton></CompletionCard>
  ) : !plan ? (
    <StepCard eyebrow="Plain-language setup" title="What are you planning to start?" body="A useful plan needs the activity and city first. Entity, licences and schemes come after that."><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2"><span className="flex items-center gap-2 text-xs font-bold text-ink"><Store aria-hidden className="size-4 text-action" />Business type</span><input className="h-13 rounded-[15px] border border-line bg-canvas px-4 text-sm outline-none focus:border-action focus:ring-4 focus:ring-action/10" maxLength={100} onChange={(event) => setBusinessType(event.target.value)} value={businessType} /></label><label className="grid gap-2"><span className="flex items-center gap-2 text-xs font-bold text-ink"><MapPin aria-hidden className="size-4 text-action" />City</span><input className="h-13 rounded-[15px] border border-line bg-canvas px-4 text-sm outline-none focus:border-action focus:ring-4 focus:ring-action/10" maxLength={80} onChange={(event) => setCity(event.target.value)} value={city} /></label></div><Button loading={loading} onClick={() => void generatePlan()}><WandSparkles aria-hidden className="size-4" />Generate action plan</Button></StepCard>
  ) : (
    <StepCard eyebrow={`${businessType} · ${city}`} title="A focused plan, in the right order" body={summary || "Start with the entity and registrations, then confirm local licences, schemes and finance."}><div className="flex items-center gap-2"><SimulatedChip authority="Citizen planning assistant" /></div><div className="grid gap-3 sm:grid-cols-2">{plan.map((item, index) => { const Icon = planIcons[item.kind]; return <article className="grid min-h-44 content-between gap-5 rounded-[17px] bg-surface-strong p-4" key={item.title}><div className="flex items-center justify-between"><Icon aria-hidden className="size-5 text-action" /><span className="font-display text-xs font-bold text-ink-faint">{String(index + 1).padStart(2, "0")}</span></div><div><strong className="block text-sm text-ink">{item.title}</strong><p className="mt-1 text-xs leading-5 text-ink-muted">{item.body}</p></div></article>; })}</div><div className="flex flex-col gap-2 sm:flex-row"><Button onClick={startRegistration}>Start first registration <ArrowRight aria-hidden className="size-4" /></Button><Button onClick={() => setPlan(null)} variant="secondary">Change plan</Button></div></StepCard>
  );

  return <ProcedureShell authority="Citizen planning assistant" complete={complete} currentStep={currentStep} description="Turn a business idea into ordered registration, licence, scheme and finance actions without exposing departmental complexity." steps={steps} title="Start a business">{content}</ProcedureShell>;
}
