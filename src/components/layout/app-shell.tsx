"use client";

import type { ReactNode } from "react";
import { useAuthStore } from "@/features/auth/store";
import { cn } from "@/lib/cn";
import { RouteBreadcrumbs } from "./breadcrumbs";
import { TopNavigation } from "./top-navigation";
import { TrustFooter } from "./trust-footer";

export function AppShell({ children }: { children: ReactNode }) {
  const dataSaver = useAuthStore((state) => state.dataSaver);
  return (
    <div className={cn("citizen-app flex min-h-dvh flex-col bg-paper pb-24 min-[900px]:pb-0", dataSaver && "data-saver")}>
      <TopNavigation />
      <RouteBreadcrumbs />
      <main className="min-w-0 flex-1">{children}</main>
      <TrustFooter />
    </div>
  );
}
