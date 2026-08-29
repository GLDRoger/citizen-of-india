"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { applyTransaction, createGraphEvent } from "./mutations";
import { createSeedGraph } from "./seed";
import { citizenGraphSchema, type CitizenGraph, type GraphMutation } from "./schema";
import type { MessageKey } from "@/i18n/messages";

const persistedGraphSchema = citizenGraphSchema.transform((graph) => ({ graph }));

function migratePersistedGraph(persistedState: unknown) {
  const parsed = persistedGraphSchema.safeParse(
    typeof persistedState === "object" && persistedState !== null && "graph" in persistedState
      ? persistedState.graph
      : undefined,
  );
  if (!parsed.success) return { graph: createSeedGraph() };

  const graph = parsed.data.graph;
  const eventIds = new Set(graph.events.map((event) => event.id));
  const seededHistory = createSeedGraph().events.filter((event) => !eventIds.has(event.id));
  return {
    graph: {
      ...graph,
      events: [...seededHistory, ...graph.events].sort((first, second) => first.occurredAt.localeCompare(second.occurredAt)),
    },
  };
}

interface CommitInput {
  actorId: string;
  labelKey: MessageKey;
  labelParams?: Record<string, string | number>;
  mutations: GraphMutation[];
  procedureId?: string;
}

interface CitizenStore {
  graph: CitizenGraph;
  hydrated: boolean;
  lastEventId?: string;
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
        set((state) => {
          const event = createGraphEvent(input);
          return { graph: applyTransaction(state.graph, event), lastEventId: event.id };
        }),
      resetDemo: () => set({ graph: createSeedGraph(), lastEventId: undefined }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "citizen-of-india-graph",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      migrate: migratePersistedGraph,
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
