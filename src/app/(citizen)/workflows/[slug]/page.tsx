import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeathWorkflow } from "@/features/workflows/pages/death-workflow";
import { LoanWorkflow } from "@/features/workflows/pages/loan-workflow";
import { MarriageWorkflow } from "@/features/workflows/pages/marriage-workflow";
import { MoneyActionWorkflow } from "@/features/workflows/pages/money-action-workflow";
import { ObligationsWorkflow } from "@/features/workflows/pages/obligations-workflow";
import { ServiceUnavailable } from "@/features/workflows/pages/service-unavailable";
import { ScamWorkflow } from "@/features/workflows/pages/scam-workflow";
import { StartBusinessWorkflow } from "@/features/workflows/pages/start-business-workflow";

const titles: Record<string, string> = {
  death: "Death in the family",
  marriage: "Marriage registration",
  obligations: "Government obligations",
  loan: "Business loan decision",
  "scam-check": "Scam check",
  "start-business": "Start a business",
  "service-unavailable": "Service availability",
  "property-tax": "Property tax payment",
  gstr3b: "GSTR-3B filing",
  "passport-renewal": "Passport renewal scope",
  "refund-track": "Refund tracking",
};

export function generateStaticParams() {
  return Object.keys(titles).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: titles[slug] ?? "Workflow" };
}

export default async function WorkflowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  switch (slug) {
    case "death": return <DeathWorkflow />;
    case "marriage": return <MarriageWorkflow />;
    case "obligations": return <ObligationsWorkflow />;
    case "loan": return <LoanWorkflow />;
    case "scam-check": return <ScamWorkflow />;
    case "start-business": return <StartBusinessWorkflow />;
    case "property-tax": return <MoneyActionWorkflow action="property-tax" />;
    case "gstr3b": return <MoneyActionWorkflow action="gstr3b" />;
    case "passport-renewal": return <MoneyActionWorkflow action="passport-renewal" />;
    case "refund-track": return <MoneyActionWorkflow action="refund-track" />;
    case "service-unavailable": return <ServiceUnavailable />;
    default: notFound();
  }
}
