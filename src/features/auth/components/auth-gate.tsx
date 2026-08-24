"use client";

import type { ReactNode } from "react";
import { PageSkeleton } from "@/components/ui/feedback";
import { useCitizenStore } from "@/features/graph/store";
import { useAuthStore } from "../store";
import { ConsentScreen } from "./consent-screen";
import { LoginScreen } from "./login-screen";

export function AuthGate({ children }: { children: ReactNode }) {
  const authHydrated = useAuthStore((state) => state.hydrated);
  const graphHydrated = useCitizenStore((state) => state.hydrated);
  const personId = useAuthStore((state) => state.personId);
  const consentedPersonIds = useAuthStore((state) => state.consentedPersonIds);

  if (!authHydrated || !graphHydrated) return <PageSkeleton />;
  if (!personId) return <LoginScreen />;
  if (!consentedPersonIds.includes(personId)) return <ConsentScreen />;
  return children;
}
