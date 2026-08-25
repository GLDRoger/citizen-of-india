"use client";

import { useAuthStore } from "@/features/auth/store";
import { getMessage, type MessageKey } from "./messages";

export function useI18n() {
  const language = useAuthStore((state) => state.language);
  return {
    language,
    t: (key: MessageKey, params?: Record<string, string | number>) => getMessage(language, key, params),
  };
}
