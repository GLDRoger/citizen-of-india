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
  consentedPersonIds: z.array(z.string()),
}).refine(
  (state) =>
    (state.personId === null || profileIds.has(state.personId)) &&
    state.consentedPersonIds.every((personId) => profileIds.has(personId)),
);

interface AuthStore {
  personId: string | null;
  language: Language;
  dataSaver: boolean;
  consentedPersonIds: string[];
  hydrated: boolean;
  authenticate: (phone: string, otp: string) => { ok: true; personId: string } | { ok: false; reason: string };
  giveConsent: () => void;
  signOut: () => void;
  switchPersona: (personId: string) => void;
  setLanguage: (language: Language) => void;
  setDataSaver: (enabled: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      personId: null,
      language: "en",
      dataSaver: false,
      consentedPersonIds: [],
      hydrated: false,
      authenticate: (phone, otp) => {
        if (!/^\d{6}$/.test(otp)) {
          return { ok: false, reason: "Enter any 6-digit access code." };
        }
        const login = seedLogins.find((candidate) => candidate.phone === phone);
        if (!login) {
          return { ok: false, reason: "Choose one of the available profiles below." };
        }
        set({ personId: login.personId });
        return { ok: true, personId: login.personId };
      },
      giveConsent: () => {
        const personId = get().personId;
        if (!personId) return;
        set((state) => ({
          consentedPersonIds: state.consentedPersonIds.includes(personId)
            ? state.consentedPersonIds
            : [...state.consentedPersonIds, personId],
        }));
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
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        personId: state.personId,
        language: state.language,
        dataSaver: state.dataSaver,
        consentedPersonIds: state.consentedPersonIds,
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
