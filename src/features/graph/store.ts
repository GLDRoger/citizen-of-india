"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { applyTransaction, createGraphEvent } from "./mutations";
import { createSeedGraph } from "./seed";
import { citizenGraphSchema, type CitizenGraph, type GraphMutation } from "./schema";

const persistedGraphSchema = citizenGraphSchema.transform((graph) => ({ graph }));

interface CommitInput {
  actorId: string;
  label: string;
  mutations: GraphMutation[];
  procedureId?: string;
}

interface CitizenStore {
  graph: CitizenGraph;
  hydrated: boolean;
  commit: (input: CommitInput) => void;
  resetDemo: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useCitizenStore = create<CitizenStore>()(
  persist(
    (set) => ({
      graph: createSeedGraph(),
      hydrated: false,
      commit: (input) =>
        set((state) => ({
          graph: applyTransaction(state.graph, createGraphEvent(input)),
        })),
      resetDemo: () => set({ graph: createSeedGraph() }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "citizen-of-india-graph",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ graph: state.graph }),
      merge: (persistedState, currentState) => {
        const parsed = persistedGraphSchema.safeParse(
          typeof persistedState === "object" && persistedState !== null && "graph" in persistedState
            ? persistedState.graph
            : undefined,
        );
        return parsed.success ? { ...currentState, ...parsed.data } : currentState;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          localStorage.removeItem("citizen-of-india-graph");
          state?.resetDemo();
        }
        state?.setHydrated(true);
      },
    },
  ),
);
