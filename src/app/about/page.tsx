import type { Metadata } from "next";
import { AboutScreen } from "@/features/about/components/about-screen";
import { AskCitizen } from "@/features/landing/ask/ask-citizen";
import { LandingFooter, LandingHeader } from "@/features/landing/components/landing-header";

export const metadata: Metadata = {
  title: "How Citizen works",
  description: "What is real and what is simulated in the Citizen prototype, who the fictional people are, and how the screens fit together.",
};

export default function AboutPage() {
  return (
    <main className="break-words bg-paper text-ink">
      <LandingHeader />
      <AboutScreen />
      <LandingFooter />
      <AskCitizen />
    </main>
  );
}
