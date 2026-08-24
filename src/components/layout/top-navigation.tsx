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
        return <Link aria-current={active ? "page" : undefined} className={cn("relative flex min-h-16 items-center px-4 text-sm font-bold text-ink-mute transition hover:text-ink", active && "text-ink after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-green-deep")} href={href} key={href}>{t(label)}</Link>;
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
        return <Link aria-current={active ? "page" : undefined} className={cn("flex min-h-13 items-center gap-3 rounded-[8px] px-4 text-sm font-bold transition", active ? "bg-green-tint text-green-deep" : "text-ink-mute hover:bg-paper-line hover:text-ink")} href={href} key={href} onClick={onClose}><Icon aria-hidden className="size-4.5" />{t(label)}</Link>;
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
      <summary aria-label={`${person?.attrs.name ?? t("brand")} ${t("accountMenu")}`} className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-[4px] border border-paper-line bg-paper-shade p-1.5 pr-2.5 transition hover:border-green-deep/35 focus-visible:outline-2 focus-visible:outline-green-deep">
        <span className="grid size-7 place-items-center rounded-[4px] bg-ink font-display text-[0.62rem] font-bold text-paper">{person ? getInitials(person.attrs.name) : "CO"}</span>
        <span className="hidden max-w-24 truncate text-xs font-bold text-ink lg:block">{person?.attrs.name.split(" ")[0]}</span>
        <ChevronDown aria-hidden className="size-3 text-ink-mute transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-12 z-50 grid w-[min(22rem,calc(100vw-2rem))] gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-4 ">
        <Link className="flex min-h-11 items-center gap-3 rounded-xl bg-paper-line px-3 text-sm font-bold text-ink hover:text-green-deep" href="/you" onClick={close}><UserRound aria-hidden className="size-4 text-green-deep" />{t("fullProfile")}</Link>
        <div className="grid gap-2 border-t border-paper-line pt-4"><p className="eyebrow">{t("switchPerson")}</p>{seedLogins.map((login) => {
          const candidate = getPerson(graph, login.personId);
          if (!candidate) return null;
          const active = login.personId === personId;
          return <button className={cn("flex min-h-10 items-center gap-3 rounded-xl px-3 text-left text-sm transition", active ? "bg-green-tint font-bold text-green-deep" : "hover:bg-paper-line")} key={login.personId} onClick={() => { switchPersona(login.personId); close(); router.push("/"); }} type="button"><span className="grid size-7 place-items-center rounded-[4px] bg-ink text-[0.58rem] font-bold text-paper">{getInitials(candidate.attrs.name)}</span>{candidate.attrs.name}</button>;
        })}</div>
        <div className="grid gap-2 border-t border-paper-line pt-4"><p className="eyebrow">{t("language")}</p><div className="flex flex-wrap gap-2">{languages.map((option) => <button className={cn("rounded-[4px] px-3 py-2 text-xs font-bold", language === option ? "bg-ink text-paper" : "bg-paper-line text-ink-mute")} key={option} onClick={() => { setLanguage(option); close(); }} type="button">{languageLabels[option]}</button>)}</div></div>
        <label className="flex cursor-pointer items-center justify-between gap-4 border-t border-paper-line pt-4 text-sm font-bold"><span className="flex items-center gap-2"><Gauge aria-hidden className="size-4 text-green-deep" />{t("dataSaver")}</span><input checked={dataSaver} className="toggle" onChange={(event) => setDataSaver(event.target.checked)} type="checkbox" /></label>
        <Link className="flex min-h-10 items-center gap-2 border-t border-paper-line pt-4 text-xs font-bold text-ink-mute hover:text-ink" href="/about" onClick={close}><Info aria-hidden className="size-4 text-green-deep" />{t("about")}</Link>
        <div className="grid grid-cols-2 gap-2"><button className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-paper-line text-xs font-bold text-ink" onClick={reset} type="button"><RotateCcw aria-hidden className="size-3.5" />{t("resetProgress")}</button><button className="flex min-h-10 items-center justify-center gap-2 rounded-xl text-xs font-bold text-ink-mute hover:bg-paper-line" onClick={() => { close(); signOut(); }} type="button"><LogOut aria-hidden className="size-3.5" />{t("signOut")}</button></div>
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
    <header className="sticky top-0 z-40 border-b border-paper-line bg-paper/96 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-[1240px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-baseline gap-2"><Link className="shrink-0 font-display text-xl font-extrabold tracking-[0.04em] text-ink" href="/">{t("brand").toUpperCase()}</Link><span className="hidden whitespace-nowrap text-[0.68rem] text-ink-mute min-[370px]:inline">{t("independentPrototype")}</span></div>
        <DesktopNavigation />
        <div className="flex shrink-0 items-center gap-1.5"><span className="hidden rounded-[4px] bg-paper-line px-3 py-2 text-[0.65rem] font-extrabold uppercase text-ink-mute sm:inline-flex">{languageLabels[language]}</span><Link aria-label={t("notifications")} className="relative grid size-10 place-items-center rounded-[4px] text-ink-mute transition hover:bg-paper-shade hover:text-ink" href="/dashboard"><Bell aria-hidden className="size-[1.1rem]" />{unread ? <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-[4px] bg-brick px-1 text-[0.52rem] font-black leading-4 text-brick">{unread}</span> : null}</Link><button aria-expanded={mobileOpen} aria-label={mobileOpen ? t("close") : t("openMenu")} className="grid size-10 place-items-center rounded-[4px] text-ink-mute hover:bg-paper-shade md:hidden" onClick={() => setMobileOpen((open) => !open)} type="button">{mobileOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}</button><AccountMenu /></div>
      </div>
      {mobileOpen ? <div className="absolute inset-x-0 top-full border-b border-paper-line bg-paper "><MobileNavigation onClose={() => setMobileOpen(false)} /></div> : null}
    </header>
  );
}
