import type { Metadata } from "next";
import { AskCitizen } from "@/features/landing/ask/ask-citizen";
import { LandingFooter, LandingHeader } from "@/features/landing/components/landing-header";
import { ManifestoScreen } from "@/features/manifesto/components/manifesto-screen";

export const metadata: Metadata = {
  title: "Manifesto",
  description: "Why India needs a public super app with nothing to sell, and what Citizen would owe the people who use it.",
};

export default function ManifestoPage() {
  return (
    <main className="break-words bg-paper text-ink">
      <LandingHeader />
      <ManifestoScreen />
      <LandingFooter />
      <AskCitizen />
    </main>
  );
}
