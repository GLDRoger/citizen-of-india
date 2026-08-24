"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, Gauge, Info, LogOut, Menu, RotateCcw, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/features/auth/store";
import { seedLogins } from "@/features/graph/seed";
import { getNotices, getPerson } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { languageLabels, languages } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";
import { navItems } from "./nav-items";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function DesktopNavigation() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav aria-label={t("primaryNavigation")} className="hidden h-full items-stretch md:flex">
      {navItems.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return <Link aria-current={active ? "page" : undefined} className={cn("relative flex min-h-16 items-center px-4 text-sm font-bold text-ink-muted transition hover:text-ink", active && "text-ink after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-action")} href={href} key={href}>{t(label)}</Link>;
      })}
    </nav>
  );
}

function MobileNavigation({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav aria-label={t("primaryNavigation")} className="grid gap-1 px-5 py-4 md:hidden">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = isActive(pathname, href);
        return <Link aria-current={active ? "page" : undefined} className={cn("flex min-h-13 items-center gap-3 rounded-[14px] px-4 text-sm font-bold transition", active ? "bg-action-soft text-action-strong" : "text-ink-muted hover:bg-surface-strong hover:text-ink")} href={href} key={href} onClick={onClose}><Icon aria-hidden className="size-4.5" />{t(label)}</Link>;
      })}
    </nav>
  );
}

function AccountMenu() {
  const router = useRouter();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const resetDemo = useCitizenStore((state) => state.resetDemo);
  const personId = useAuthStore((state) => state.personId);
  const signOut = useAuthStore((state) => state.signOut);
  const switchPersona = useAuthStore((state) => state.switchPersona);
  const language = useAuthStore((state) => state.language);
  const setLanguage = useAuthStore((state) => state.setLanguage);
  const dataSaver = useAuthStore((state) => state.dataSaver);
  const setDataSaver = useAuthStore((state) => state.setDataSaver);
  const person = personId ? getPerson(graph, personId) : undefined;

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !detailsRef.current?.contains(event.target)) detailsRef.current?.removeAttribute("open");
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  const close = () => detailsRef.current?.removeAttribute("open");
  const reset = () => {
    if (!window.confirm(t("resetConfirm"))) return;
    resetDemo();
    close();
    router.push("/");
  };

  return (
    <details className="group relative" ref={detailsRef}>
      <summary aria-label={`${person?.attrs.name ?? t("brand")} ${t("accountMenu")}`} className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-surface p-1.5 pr-2.5 transition hover:border-action/35 focus-visible:outline-2 focus-visible:outline-action">
        <span className="grid size-7 place-items-center rounded-full bg-ink font-display text-[0.62rem] font-bold text-canvas">{person ? getInitials(person.attrs.name) : "CO"}</span>
        <span className="hidden max-w-24 truncate text-xs font-bold text-ink lg:block">{person?.attrs.name.split(" ")[0]}</span>
        <ChevronDown aria-hidden className="size-3 text-ink-muted transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-12 z-50 grid w-[min(22rem,calc(100vw-2rem))] gap-4 rounded-[18px] border border-line bg-surface p-4 shadow-[0_22px_70px_oklch(0.22_0.04_250/0.16)]">
        <Link className="flex min-h-11 items-center gap-3 rounded-xl bg-surface-strong px-3 text-sm font-bold text-ink hover:text-action-strong" href="/you" onClick={close}><UserRound aria-hidden className="size-4 text-action" />{t("fullProfile")}</Link>
        <div className="grid gap-2 border-t border-line pt-4"><p className="eyebrow">{t("switchPerson")}</p>{seedLogins.map((login) => {
          const candidate = getPerson(graph, login.personId);
          if (!candidate) return null;
          const active = login.personId === personId;
          return <button className={cn("flex min-h-10 items-center gap-3 rounded-xl px-3 text-left text-sm transition", active ? "bg-action-soft font-bold text-action-strong" : "hover:bg-surface-strong")} key={login.personId} onClick={() => { switchPersona(login.personId); close(); router.push("/"); }} type="button"><span className="grid size-7 place-items-center rounded-full bg-ink text-[0.58rem] font-bold text-canvas">{getInitials(candidate.attrs.name)}</span>{candidate.attrs.name}</button>;
        })}</div>
        <div className="grid gap-2 border-t border-line pt-4"><p className="eyebrow">{t("language")}</p><div className="flex flex-wrap gap-2">{languages.map((option) => <button className={cn("rounded-full px-3 py-2 text-xs font-bold", language === option ? "bg-ink text-canvas" : "bg-surface-strong text-ink-muted")} key={option} onClick={() => { setLanguage(option); close(); }} type="button">{languageLabels[option]}</button>)}</div></div>
        <label className="flex cursor-pointer items-center justify-between gap-4 border-t border-line pt-4 text-sm font-bold"><span className="flex items-center gap-2"><Gauge aria-hidden className="size-4 text-action" />{t("dataSaver")}</span><input checked={dataSaver} className="toggle" onChange={(event) => setDataSaver(event.target.checked)} type="checkbox" /></label>
        <Link className="flex min-h-10 items-center gap-2 border-t border-line pt-4 text-xs font-bold text-ink-muted hover:text-ink" href="/about" onClick={close}><Info aria-hidden className="size-4 text-action" />{t("about")}</Link>
        <div className="grid grid-cols-2 gap-2"><button className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-surface-strong text-xs font-bold text-ink" onClick={reset} type="button"><RotateCcw aria-hidden className="size-3.5" />{t("resetProgress")}</button><button className="flex min-h-10 items-center justify-center gap-2 rounded-xl text-xs font-bold text-ink-muted hover:bg-surface-strong" onClick={() => { close(); signOut(); }} type="button"><LogOut aria-hidden className="size-3.5" />{t("signOut")}</button></div>
      </div>
    </details>
  );
}

export function TopNavigation() {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const graph = useCitizenStore((state) => state.graph);
  const personId = useAuthStore((state) => state.personId);
  const language = useAuthStore((state) => state.language);
  const unread = personId ? getNotices(graph, personId).filter((notice) => !notice.read).length : 0;
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/96 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-2"><Link className="shrink-0 font-display text-xl font-semibold tracking-[-0.045em] text-ink" href="/">{t("brand")}<span className="text-saffron">.</span></Link><span className="shrink-0 whitespace-nowrap rounded-full border border-saffron-line bg-saffron-soft px-1.5 py-1 text-[0.5rem] font-extrabold text-saffron-ink sm:px-2 sm:text-[0.65rem]">{t("independentPrototype")}</span></div>
        <DesktopNavigation />
        <div className="flex shrink-0 items-center gap-1.5"><span className="hidden rounded-full bg-surface-strong px-3 py-2 text-[0.65rem] font-extrabold uppercase text-ink-muted sm:inline-flex">{languageLabels[language]}</span><Link aria-label={t("notifications")} className="relative grid size-10 place-items-center rounded-full text-ink-muted transition hover:bg-surface hover:text-ink" href="/dashboard"><Bell aria-hidden className="size-[1.1rem]" />{unread ? <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-saffron px-1 text-[0.52rem] font-black leading-4 text-saffron-ink">{unread}</span> : null}</Link><button aria-expanded={mobileOpen} aria-label={mobileOpen ? t("close") : t("openMenu")} className="grid size-10 place-items-center rounded-full text-ink-muted hover:bg-surface md:hidden" onClick={() => setMobileOpen((open) => !open)} type="button">{mobileOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}</button><AccountMenu /></div>
      </div>
      {mobileOpen ? <div className="absolute inset-x-0 top-full border-b border-line bg-canvas shadow-[0_18px_45px_oklch(0.22_0.04_250/0.12)]"><MobileNavigation onClose={() => setMobileOpen(false)} /></div> : null}
    </header>
  );
}
