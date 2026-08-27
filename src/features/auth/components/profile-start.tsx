"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageSkeleton } from "@/components/ui/feedback";
import { useCitizenStore } from "@/features/graph/store";
import { useAuthStore } from "../store";
import { LoginScreen } from "./login-screen";

export function ProfileStart() {
  const router = useRouter();
  const authHydrated = useAuthStore((state) => state.hydrated);
  const graphHydrated = useCitizenStore((state) => state.hydrated);
  const personId = useAuthStore((state) => state.personId);
  const hydrated = authHydrated && graphHydrated;

  useEffect(() => {
    if (hydrated && personId) router.replace("/home");
  }, [hydrated, personId, router]);

  if (!hydrated || personId) return <PageSkeleton />;
  return <LoginScreen />;
}
