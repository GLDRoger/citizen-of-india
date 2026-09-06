"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";
import type { Language } from "@/i18n/messages";
import { seedLogins } from "@/features/graph/seed";
import type { CitizenGraph } from "@/features/graph/schema";
import { getActiveDelegation } from "@/features/graph/delegation";

const profileIds = new Set(seedLogins.map((login) => login.personId));
const persistedAuthSchema = z.object({
  personId: z.string().nullable(),
  actorId: z.string().nullable().optional(),
  language: z.enum(["en", "hi", "kn"]),
  dataSaver: z.boolean(),
}).refine(
  (state) => (state.personId === null || profileIds.has(state.personId)) && (!state.actorId || profileIds.has(state.actorId)),
);

interface AuthStore {
  /** Whose record is on screen. */
  personId: string | null;
  /** The signed-in person when they are acting for `personId` under a delegation; null when acting for themselves. */
  actorId: string | null;
  language: Language;
  dataSaver: boolean;
  hydrated: boolean;
  openProfile: (phone: string) => { ok: true; personId: string } | { ok: false; reason: string };
  signOut: () => void;
  switchPersona: (personId: string) => void;
  actFor: (subjectId: string, graph: CitizenGraph) => void;
  stopActing: () => void;
  setLanguage: (language: Language) => void;
  setDataSaver: (enabled: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      personId: null,
      actorId: null,
      language: "en",
      dataSaver: false,
      hydrated: false,
      openProfile: (phone) => {
        const login = seedLogins.find((candidate) => candidate.phone === phone);
        if (!login) {
          return { ok: false, reason: "Pick one of the profiles below." };
        }
        set({ personId: login.personId, actorId: null });
        return { ok: true, personId: login.personId };
      },
      signOut: () => set({ personId: null, actorId: null }),
      switchPersona: (personId) => {
        if (seedLogins.some((login) => login.personId === personId)) {
          set({ personId, actorId: null });
        }
      },
      actFor: (subjectId, graph) => {
        const { personId, actorId } = get();
        if (actorId || !personId || !profileIds.has(subjectId) || subjectId === personId) return;
        if (!getActiveDelegation(graph, personId, subjectId)) return;
        set({ personId: subjectId, actorId: personId });
      },
      stopActing: () => {
        const { actorId } = get();
        if (actorId) set({ personId: actorId, actorId: null });
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
          ? { ...parsed.data, actorId: parsed.data.actorId ?? null }
          : { personId: null, actorId: null, language: "en", dataSaver: false };
      },
      partialize: (state) => ({
        personId: state.personId,
        actorId: state.actorId,
        language: state.language,
        dataSaver: state.dataSaver,
      }),
      merge: (persistedState, currentState) => {
        const parsed = persistedAuthSchema.safeParse(persistedState);
        return parsed.success ? { ...currentState, ...parsed.data, actorId: parsed.data.actorId ?? null } : currentState;
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
