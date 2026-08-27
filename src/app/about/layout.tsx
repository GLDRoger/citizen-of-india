import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Citizen" };

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
