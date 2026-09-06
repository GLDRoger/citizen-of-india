"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CURRENT_SEED_REVISION, useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";

/** Never overwrite a returning visitor's demo progress merely because the sample data changed. */
export function SeedUpdateNotice() {
  const { t } = useI18n();
  const router = useRouter();
  const { seedRevision, dismissedSeedUpdate, dismissSeedUpdate, resetDemo } = useCitizenStore();
  if (seedRevision >= CURRENT_SEED_REVISION || dismissedSeedUpdate) return null;
  return (
    <aside className="mx-auto grid w-full max-w-[1180px] gap-3 border-b border-paper-line px-5 py-5 sm:px-8" aria-labelledby="seed-update-title">
      <h2 className="text-base font-bold" id="seed-update-title">{t("seedUpdateTitle")}</h2>
      <p className="max-w-3xl text-sm leading-6 text-ink-mute">{t("seedUpdateBody")}</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={dismissSeedUpdate} variant="secondary">{t("seedUpdateKeep")}</Button>
        <Button onClick={() => { if (window.confirm(t("resetConfirm"))) { resetDemo(); router.push("/home"); } }}>{t("seedUpdateLoad")}</Button>
      </div>
    </aside>
  );
}
