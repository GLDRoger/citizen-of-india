import type { Metadata } from "next";
import { ManifestoScreen } from "@/features/manifesto/components/manifesto-screen";

export const metadata: Metadata = { title: "Manifesto" };

export default function ManifestoPage() {
  return <ManifestoScreen />;
}
