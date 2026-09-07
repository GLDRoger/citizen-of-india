"use client";

import { PageSkeleton } from "@/components/ui/feedback";
import { useCitizenStore } from "@/features/graph/store";
import { useAuthStore } from "../store";
import { LoginScreen } from "./login-screen";

export function ProfileStart() {
  const authHydrated = useAuthStore((state) => state.hydrated);
  const graphHydrated = useCitizenStore((state) => state.hydrated);
  const hydrated = authHydrated && graphHydrated;

  if (!hydrated) return <PageSkeleton />;
  return <LoginScreen />;
}
