"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store";

export function DocumentLanguage() {
  const language = useAuthStore((state) => state.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
