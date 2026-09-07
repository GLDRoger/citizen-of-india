import type { Metadata } from "next";
import { FamilyScreen } from "@/features/family/components/family-screen";

export const metadata: Metadata = { title: "Family" };

export default function FamilyPage() {
  return <FamilyScreen />;
}
