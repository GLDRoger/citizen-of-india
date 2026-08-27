import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LoanWorkflow } from "@/features/workflows/pages/loan-workflow";
import { BenefitApplicationWorkflow } from "@/features/workflows/pages/benefit-application-workflow";
import { EpfoWorkflow } from "@/features/workflows/pages/epfo-workflow";
import { MarriageWorkflow } from "@/features/workflows/pages/marriage-workflow";
import { MoneyActionWorkflow } from "@/features/workflows/pages/money-action-workflow";
import { ObligationsWorkflow } from "@/features/workflows/pages/obligations-workflow";
import { RecordCorrectionWorkflow } from "@/features/workflows/pages/record-correction-workflow";
import { ServiceUnavailable } from "@/features/workflows/pages/service-unavailable";
import { StartBusinessWorkflow } from "@/features/workflows/pages/start-business-workflow";

const titles: Record<string, string> = {
  "benefit-application": "Benefit application",
  epfo: "EPFO passbook and grievance",
  marriage: "Marriage registration",
  obligations: "Pay a challan",
  loan: "Compare business loans",
  "record-correction": "Record correction",
  "start-business": "Start a business",
  "service-unavailable": "Demo limits",
  "property-tax": "Property tax payment",
  gstr3b: "GSTR-3B filing",
  "passport-renewal": "Renew passport",
  "refund-track": "Refund tracking",
};

export const dynamicParams = false;

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
    case "benefit-application": return <BenefitApplicationWorkflow />;
    case "epfo": return <EpfoWorkflow />;
    case "marriage": return <MarriageWorkflow />;
    case "obligations": return <ObligationsWorkflow />;
    case "loan": return <LoanWorkflow />;
    case "record-correction": return <RecordCorrectionWorkflow />;
    case "start-business": return <StartBusinessWorkflow />;
    case "property-tax": return <MoneyActionWorkflow action="property-tax" />;
    case "gstr3b": return <MoneyActionWorkflow action="gstr3b" />;
    case "passport-renewal": return <MoneyActionWorkflow action="passport-renewal" />;
    case "refund-track": return <MoneyActionWorkflow action="refund-track" />;
    case "service-unavailable": return <ServiceUnavailable />;
    default: notFound();
  }
}
