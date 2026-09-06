"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { applyTransaction, createGraphEvent } from "./mutations";
import { createSeedGraph } from "./seed";
import { citizenGraphSchema, type CitizenGraph, type GraphMutation } from "./schema";
import type { MessageKey } from "@/i18n/messages";
import { useAuthStore } from "@/features/auth/store";
import { canCommitDelegated } from "./delegation";
import { useWorkflowProgress } from "@/features/workflows/progress-store";

export const CURRENT_SEED_REVISION = 2;

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
  seedRevision: number;
  dismissedSeedUpdate: boolean;
  dismissSeedUpdate: () => void;
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
      seedRevision: CURRENT_SEED_REVISION,
      dismissedSeedUpdate: false,
      dismissSeedUpdate: () => set({ dismissedSeedUpdate: true }),
      hydrated: false,
      commit: (input) =>
        set((state) => {
          // When someone acts for a relative under a delegation, the event names them, not the relative.
          const auth = useAuthStore.getState();
          if (!auth.personId || input.actorId !== auth.personId) throw new Error("The active profile changed. Reopen the action before trying again.");
          if (auth.actorId && !canCommitDelegated(state.graph, auth.actorId, auth.personId, input.mutations)) {
            throw new Error("This action is outside the shared access.");
          }
          const actorId = auth.actorId ?? input.actorId;
          const event = createGraphEvent({ ...input, actorId });
          return { graph: applyTransaction(state.graph, event), lastEventId: event.id };
        }),
      resetDemo: () => {
        useWorkflowProgress.getState().clear();
        useAuthStore.getState().stopActing();
        set({ graph: createSeedGraph(), lastEventId: undefined, seedRevision: CURRENT_SEED_REVISION, dismissedSeedUpdate: false });
      },
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "citizen-of-india-graph",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      migrate: migratePersistedGraph,
      partialize: (state) => ({ graph: state.graph, seedRevision: state.seedRevision, dismissedSeedUpdate: state.dismissedSeedUpdate }),
      merge: (persistedState, currentState) => {
        const parsed = persistedGraphSchema.safeParse(
          typeof persistedState === "object" && persistedState !== null && "graph" in persistedState
            ? persistedState.graph
            : undefined,
        );
        if (!parsed.success) return currentState;
        const saved = persistedState as { seedRevision?: unknown; dismissedSeedUpdate?: unknown };
        return { ...currentState, ...parsed.data,
          seedRevision: typeof saved.seedRevision === "number" ? saved.seedRevision : 0,
          dismissedSeedUpdate: saved.dismissedSeedUpdate === true,
        };
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
