import type { Metadata } from "next";
import { ServicesScreen } from "@/features/services/components/services-screen";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return <ServicesScreen />;
}
