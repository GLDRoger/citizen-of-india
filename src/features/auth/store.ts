"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";
import type { Language } from "@/i18n/messages";
import { seedLogins } from "@/features/graph/seed";

const profileIds = new Set(seedLogins.map((login) => login.personId));
const persistedAuthSchema = z.object({
  personId: z.string().nullable(),
  language: z.enum(["en", "hi", "kn"]),
  dataSaver: z.boolean(),
}).refine(
  (state) => state.personId === null || profileIds.has(state.personId),
);

interface AuthStore {
  personId: string | null;
  language: Language;
  dataSaver: boolean;
  hydrated: boolean;
  openProfile: (phone: string) => { ok: true; personId: string } | { ok: false; reason: string };
  signOut: () => void;
  switchPersona: (personId: string) => void;
  setLanguage: (language: Language) => void;
  setDataSaver: (enabled: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      personId: null,
      language: "en",
      dataSaver: false,
      hydrated: false,
      openProfile: (phone) => {
        const login = seedLogins.find((candidate) => candidate.phone === phone);
        if (!login) {
          return { ok: false, reason: "Pick one of the profiles below." };
        }
        set({ personId: login.personId });
        return { ok: true, personId: login.personId };
      },
      signOut: () => set({ personId: null }),
      switchPersona: (personId) => {
        if (seedLogins.some((login) => login.personId === personId)) {
          set({ personId });
        }
      },
      setLanguage: (language) => set({ language }),
      setDataSaver: (dataSaver) => set({ dataSaver }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "citizen-of-india-auth",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const parsed = persistedAuthSchema.safeParse(persistedState);
        return parsed.success
          ? parsed.data
          : { personId: null, language: "en", dataSaver: false };
      },
      partialize: (state) => ({
        personId: state.personId,
        language: state.language,
        dataSaver: state.dataSaver,
      }),
      merge: (persistedState, currentState) => {
        const parsed = persistedAuthSchema.safeParse(persistedState);
        return parsed.success ? { ...currentState, ...parsed.data } : currentState;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          localStorage.removeItem("citizen-of-india-auth");
        }
        state?.setHydrated(true);
      },
    },
  ),
);
