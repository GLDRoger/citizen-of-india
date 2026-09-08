"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { seedLogins } from "@/features/graph/seed";
import { useCitizenStore } from "@/features/graph/store";
import { useAuthStore } from "@/features/auth/store";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

const routes: Array<{ id: string; title: MessageKey; body: MessageKey; steps: MessageKey[]; action: MessageKey; personId: string; href: string }> = [
  { id: "route-primary", title: "routePrimary", body: "routePrimaryBody", steps: ["routePrimaryOne", "routePrimaryTwo", "routePrimaryThree", "routePrimaryFour", "routePrimaryFive"], action: "routePrimaryStart", personId: "person:arjun", href: "/workflows/record-correction" },
  { id: "route-marriage", title: "routeMarriage", body: "routeMarriageBody", steps: ["routeMarriageOne", "routeMarriageTwo", "routeMarriageThree"], action: "routeMarriageStart", personId: "person:priya", href: "/workflows/marriage" },
  { id: "route-family", title: "routeFamily", body: "routeFamilyBody", steps: ["routeFamilyOne", "routeFamilyTwo", "routeFamilyThree"], action: "routeFamilyStart", personId: "person:sunita", href: "/family#delegation" },
];

export function DemoRoutes() {
  const { t } = useI18n();
  const router = useRouter();
  const openProfile = useAuthStore((state) => state.openProfile);
  const resetDemo = useCitizenStore((state) => state.resetDemo);
  const [reset, setReset] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  useEffect(() => {
    // Keep native disclosure controls, while opening the route named by a landing-page link.
    const openLinkedRoute = () => {
      const route = routes.find((candidate) => `#${candidate.id}` === window.location.hash);
      const detail = route ? document.getElementById(route.id) : null;
      if (detail instanceof HTMLDetailsElement) detail.open = true;
    };
    openLinkedRoute();
    window.addEventListener("hashchange", openLinkedRoute);
    return () => window.removeEventListener("hashchange", openLinkedRoute);
  }, []);
  return (
    <section aria-labelledby="routes-heading" className="grid scroll-mt-6 gap-4" id="routes">
      <div className="grid gap-2"><h2 className="font-display text-3xl font-semibold leading-tight text-indigo-deep" id="routes-heading">{t("routesTitle")}</h2><p className="text-sm leading-6 text-ink-mute">{t("routesIntro")}</p></div>
      <div className="divide-y divide-paper-line border-y border-paper-line">
        {routes.map((route, index) => <details className="group scroll-mt-6 py-4" id={route.id} key={route.title} open={index === 0}>
          <summary className="grid min-h-11 cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-3 focus-visible:outline-2 focus-visible:outline-indigo-deep [&::-webkit-details-marker]:hidden">
            <span className="grid gap-1"><strong className="font-display text-xl font-semibold leading-tight text-ink">{t(route.title)}</strong><span className="text-sm leading-6 text-ink-mute">{t(route.body)}</span></span><ChevronDown aria-hidden className="size-5 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 pt-4">
            <ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-ink marker:font-bold marker:text-indigo-deep">{route.steps.map((step) => <li className="pl-1" key={step}>{t(step)}</li>)}</ol>
            <Button className="justify-self-start" onClick={() => {
              const login = seedLogins.find((candidate) => candidate.personId === route.personId);
              if (login && openProfile(login.phone).ok) router.push(route.href);
            }}>{t(route.action)}<ArrowRight aria-hidden className="size-4 shrink-0" /></Button>
          </div>
        </details>)}
      </div>
      <p className="text-sm font-semibold leading-6 text-indigo-deep">{t("routesDevice")}</p>
      <p className="text-xs leading-5 text-ink-mute">{t("routesSaved")}</p>
      <button className="min-h-11 justify-self-start text-xs font-bold text-ink-mute underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-indigo-deep" onClick={() => setResetOpen(true)} type="button">{t("routesReset")}</button>
      <ConfirmDialog open={resetOpen} title={t("routesReset")} description={t("resetConfirm")} confirmLabel={t("resetProgress")} cancelLabel={t("familyCancel")} onCancel={() => setResetOpen(false)} onConfirm={() => { setResetOpen(false); resetDemo(); setReset(true); }} />
      {reset ? <p className="text-sm text-green-deep" role="status">{t("routesResetDone")}</p> : null}
    </section>
  );
}
