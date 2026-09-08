"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { PageSkeleton } from "@/components/ui/feedback";
import { useCitizenStore } from "@/features/graph/store";
import { useAuthStore } from "../store";
import { applyPendingSeedUpdate } from "@/features/graph/seed-update";
import { useWorkflowProgress } from "@/features/workflows/progress-store";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/use-i18n";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { t } = useI18n();
  const [bootstrap, setBootstrap] = useState<"loading" | "ready" | "failed">("loading");
  const authHydrated = useAuthStore((state) => state.hydrated);
  const graphHydrated = useCitizenStore((state) => state.hydrated);
  const personId = useAuthStore((state) => state.personId);
  const hydrated = authHydrated && graphHydrated;

  useEffect(() => {
    if (!hydrated) return;
    const finish = () => {
      try {
        applyPendingSeedUpdate();
        setBootstrap("ready");
      } catch {
        setBootstrap("failed");
      }
    };
    if (useWorkflowProgress.persist.hasHydrated()) finish();
    else return useWorkflowProgress.persist.onFinishHydration(finish);
  }, [hydrated]);

  useEffect(() => {
    if (bootstrap === "ready" && !personId) router.replace("/start");
  }, [bootstrap, personId, router]);

  if (bootstrap === "failed") return <div className="mx-auto grid max-w-xl gap-4 p-6"><p role="alert">{t("seedUpdateFailed")}</p><Button onClick={() => window.location.reload()}>{t("seedUpdateRetry")}</Button></div>;
  if (!hydrated || bootstrap !== "ready" || !personId) return <PageSkeleton />;
  return children;
}
