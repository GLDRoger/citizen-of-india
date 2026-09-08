"use client";

import Link from "next/link";
import { Page } from "@/components/ui/page";
import { useAuthStore } from "@/features/auth/store";
import { useI18n } from "@/i18n/use-i18n";
import { FamilyConnectionsPanel } from "@/features/profile/components/family-connections";

import { DelegationPanel } from "./delegation-panel";

export function FamilyScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  if (!personId) return null;
  return <Page className="grid gap-7"><Link className="min-h-11 content-center justify-self-start text-xs font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href="/you">← {t("fullProfile")}</Link><FamilyConnectionsPanel personId={personId} /><DelegationPanel personId={personId} /></Page>;
}
