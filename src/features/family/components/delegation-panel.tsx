"use client";

import { KeyRound, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getNodeByType } from "@/features/graph/selectors";
import { getActiveDelegations, LEGACY_DELEGATION_ID } from "@/features/graph/delegation";
import { preparePaperworkAccess, PAPERWORK_EXPIRES } from "@/features/graph/paperwork-procedures";
import { revokeFamily } from "@/features/graph/family-procedures";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { getStatusMessageKey } from "@/i18n/formatters";
import { formatDate } from "@/lib/format";

const DELEGATION_ID = LEGACY_DELEGATION_ID;
/**
 * Sunita ↔ Arjun shared access. Arjun can ask; only Sunita can grant or revoke.
 * The delegation node walks requested → active → revoked; nothing is deleted.
 */
export function DelegationPanel({ personId }: { personId: string }) {
  const { language, t } = useI18n();
  const actorId = useAuthStore((state) => state.actorId);
  const actFor = useAuthStore((state) => state.actFor);
  const router = useRouter();
  const graph = useCitizenStore((state) => state.graph);
  const commit = useCitizenStore((state) => state.commit);
  const [error, setError] = useState(false);
  const isSunita = personId === "person:sunita";
  const isArjun = personId === "person:arjun";
  const delegation = getNodeByType(graph, DELEGATION_ID, "delegation");
  if (!isSunita && !isArjun) return null;
  const status = delegation?.attrs.status;
  const active = getActiveDelegations(graph, "person:arjun", "person:sunita").some((permission) => permission.id === DELEGATION_ID);
  const requested = status === "requested";
  const ended = status === "revoked" || status === "expired";
  const familyProperty = getNodeByType(graph, "prop:jpnagar-house", "property");
  const expires = formatDate(delegation?.attrs.expiresOn ?? PAPERWORK_EXPIRES, language);

  const saveAccess = (action: "request" | "grant" | "revoke") => {
    try {
      const current = useCitizenStore.getState().graph;
      const mutations = action === "revoke" ? revokeFamily(current, personId, DELEGATION_ID) : preparePaperworkAccess(current, personId, action);
      commit({ actorId: personId, labelKey: action === "request" ? "eventAccessRequested" : action === "grant" ? "eventPaperworkDelegated" : "eventPaperworkRevoked", procedureId: "delegation", mutations });
      setError(false);
    } catch { setError(true); }
  };

  const title = active ? t("delegationActiveTitle")
    : requested ? t(isSunita ? "delegationRequestedTitle" : "delegationRequestSentTitle")
    : ended ? t("delegationEndedTitle")
    : t(isSunita ? "delegationSetupTitle" : "delegationRequestAction");
  const body = active ? t("delegationActiveBody", { date: expires })
    : requested ? t(isSunita ? "delegationRequestedBody" : "delegationRequestSentBody", { date: expires })
    : ended ? t("delegationEndedBody")
    : isSunita ? t("delegationSetupBody", { date: expires })
    : t("delegationRequestHint");

  const action = actorId && isSunita
    ? <p className="border-l-2 border-saffron pl-3 text-xs leading-5 text-paper/80">{t("actingNotDelegable", { name: "Sunita" })}</p>
    : isSunita && !active ? <Button onClick={() => saveAccess("grant")} variant="inverse">{t("delegationGrantAction")}</Button>
    : isSunita && active ? <Button onClick={() => saveAccess("revoke")} variant="inverseQuiet">{t("revoke")}</Button>
    : isArjun && active && !actorId ? <Button onClick={() => { actFor("person:sunita", graph); window.scrollTo(0, 0); router.push("/home"); }} variant="saffron"><UsersRound aria-hidden className="size-4" />{t("actFor", { name: "Sunita" })}</Button>
    : isArjun && !active && !requested && !actorId ? <Button onClick={() => saveAccess("request")} variant="inverse">{t("delegationRequestAction")}</Button>
    : null;

  return (
    <section className="grid scroll-mt-20 gap-5 rounded-[3px] bg-indigo-deep p-6 text-paper" id="delegation">
      <div className="flex items-start justify-between gap-4"><KeyRound aria-hidden className="size-5 text-saffron" />{delegation ? <StatusPill label={t(getStatusMessageKey(delegation.attrs.status) ?? "pending")} tone={active ? "success" : requested ? "info" : "neutral"} /> : null}</div>
      <div className="grid gap-2"><p className="text-xs font-bold uppercase tracking-[0.12em] text-paper/55">{t("delegation")}</p><h2 className="font-display text-3xl font-semibold leading-none">{title}</h2><p className="text-xs leading-5 text-paper/72">{body}</p></div>
      {active && isArjun ? <div className="grid divide-y divide-paper/15 border-y border-paper/15 text-xs"><div className="grid gap-1 py-3"><span className="capitalize text-paper/60">{familyProperty?.attrs.kind ?? t("propertyAndVehicles")}</span><strong className="text-sm text-paper">{familyProperty?.attrs.authority ?? "BBMP"} · {familyProperty?.attrs.khataNumber ?? ""}</strong></div></div> : null}
      {action}
      {error ? <p className="text-sm font-bold text-paper" role="alert">{t("sharedSaveError")}</p> : null}
    </section>
  );
}
