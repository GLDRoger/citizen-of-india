"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";

const draftSchema = z.record(z.string(), z.union([z.string(), z.number().finite(), z.boolean(), z.array(z.string()), z.null()]));
const savedProgressSchema = z.object({ drafts: z.record(z.string(), draftSchema) });

type Draft = Record<string, string | number | boolean | string[] | null>;

interface ProgressStore {
  drafts: Record<string, Draft>;
  patch: (procedureId: string, personId: string, draft: Draft) => void;
  clear: () => void;
}

const key = (procedureId: string, personId: string) => `${personId}:${procedureId}`;

/**
 * Step-level state that does not belong in the Citizen Graph (which option is
 * selected, which screen is open) but must survive a reload or a dropped
 * connection. Keyed per person and procedure; Reset demo clears it.
 */
export const useWorkflowProgress = create<ProgressStore>()(
  persist(
    (set) => ({
      drafts: {},
      patch: (procedureId, personId, draft) => set((state) => ({ drafts: { ...state.drafts, [key(procedureId, personId)]: { ...state.drafts[key(procedureId, personId)], ...draft } } })),
      clear: () => set({ drafts: {} }),
    }),
    {
      name: "citizen-of-india-progress", version: 1, storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ drafts: state.drafts }),
      merge: (persistedState, current) => {
        const parsed = savedProgressSchema.safeParse(persistedState);
        return parsed.success ? { ...current, drafts: parsed.data.drafts } : current;
      },
    },
  ),
);

export function useDraft(procedureId: string, personId: string | null) {
  const draft = useWorkflowProgress((state) => (personId ? state.drafts[key(procedureId, personId)] : undefined));
  const patch = useWorkflowProgress((state) => state.patch);
  return { draft: draft ?? {}, save: (next: Draft) => { if (personId) patch(procedureId, personId, next); } };
}
