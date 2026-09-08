"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { CURRENT_SEED_REVISION, useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { requestSeedUpdate } from "@/features/graph/seed-update";

/** Never overwrite a returning visitor's demo progress merely because the sample data changed. */
export function SeedUpdateNotice() {
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { seedRevision, dismissedSeedUpdate, dismissSeedUpdate } = useCitizenStore();
  if (seedRevision >= CURRENT_SEED_REVISION || dismissedSeedUpdate) return null;
  return (
    <aside className="mx-auto grid w-full max-w-[1180px] gap-3 border-b border-paper-line px-5 py-5 sm:px-8" aria-labelledby="seed-update-title">
      <h2 className="text-base font-bold" id="seed-update-title">{t("seedUpdateTitle")}</h2>
      <p className="max-w-3xl text-sm leading-6 text-ink-mute">{t("seedUpdateBody")}</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={dismissSeedUpdate} variant="secondary">{t("seedUpdateKeep")}</Button>
        <Button onClick={() => setConfirmOpen(true)}>{t("seedUpdateLoad")}</Button>
      </div>
      <ConfirmDialog open={confirmOpen} title={t("seedUpdateLoad")} description={t("resetConfirm")} confirmLabel={t("seedUpdateLoad")} cancelLabel={t("familyCancel")} onCancel={() => setConfirmOpen(false)} onConfirm={() => {
        setConfirmOpen(false);
        try { requestSeedUpdate(); } catch { setFailed(true); }
      }} />
      {failed ? <p className="text-sm font-bold text-brick" role="alert">{t("seedUpdateFailed")}</p> : null}
    </aside>
  );
}
