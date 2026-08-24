"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/features/auth/store";
import { cn } from "@/lib/cn";
import { RouteBreadcrumbs } from "./breadcrumbs";
import { TopNavigation } from "./top-navigation";
import { TrustFooter } from "./trust-footer";

export function AppShell({ children }: { children: ReactNode }) {
  const dataSaver = useAuthStore((state) => state.dataSaver);
  const language = useAuthStore((state) => state.language);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return (
    <div className={cn("flex min-h-dvh flex-col bg-paper", dataSaver && "data-saver")}>
      <TopNavigation />
      <RouteBreadcrumbs />
      <main className="min-w-0 flex-1">{children}</main>
      <TrustFooter />
    </div>
  );
}
