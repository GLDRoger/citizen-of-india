"use client";

import { UsersRound } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { getPerson } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";

/**
 * Shown under the top bar whenever the signed-in person is working inside a
 * relative's record. Names both people and says where the actions land, so
 * acting for someone never looks like being them.
 */
export function ActingBanner() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const actorId = useAuthStore((state) => state.actorId);
  const stopActing = useAuthStore((state) => state.stopActing);
  const graph = useCitizenStore((state) => state.graph);
  if (!actorId || !personId) return null;
  const subject = getPerson(graph, personId);
  const name = subject?.attrs.name.split(" ")[0] ?? personId;
  return (
    <aside aria-live="polite" className="border-b border-ink bg-saffron text-ink">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 lg:px-10">
        <div className="flex items-start gap-3">
          <UsersRound aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p className="text-sm leading-5"><strong className="font-display text-base font-bold">{t("actingTitle", { name })}</strong><span className="block text-xs leading-5 text-ink/80 sm:inline sm:pl-2">{t("actingBody", { name })}</span></p>
        </div>
        <button className="min-h-11 w-fit shrink-0 rounded-[2px] border border-ink/40 bg-paper px-4 text-xs font-bold text-ink transition-colors hover:bg-ink hover:text-paper" onClick={() => { stopActing(); window.scrollTo(0, 0); }} type="button">{t("actingStop")}</button>
      </div>
    </aside>
  );
}
