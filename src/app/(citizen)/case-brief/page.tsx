import type { Metadata } from "next";
import { CaseBriefScreen } from "@/features/cases/components/case-brief-screen";

export const metadata: Metadata = { title: "Case brief" };

export default function CaseBriefPage() {
  return <CaseBriefScreen />;
}
