"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Gauge, Info, LogOut, RotateCcw, UserRound } from "lucide-react";
import { useEffect, useRef } from "react";
import { CitizenMark } from "@/components/citizen-mark";
import { useAuthStore } from "@/features/auth/store";
import { seedLogins } from "@/features/graph/seed";
import { getPerson } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { languageLabels, languages } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";
import { navItems } from "./nav-items";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopNavigation() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav aria-label={t("primaryNavigation")} className="hidden h-full items-stretch min-[900px]:flex">
      {navItems.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return <Link aria-current={active ? "page" : undefined} className={cn("relative flex min-h-16 items-center px-3 text-sm font-bold text-paper/65 transition-colors hover:text-paper", active && "bg-paper/8 text-paper after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:bg-saffron")} href={href} key={href}>{t(label)}</Link>;
      })}
    </nav>
  );
}

function MobileNavigation() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav aria-label={t("primaryNavigation")} className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 grid grid-cols-5 rounded-[8px] border border-paper/20 bg-indigo-deep p-1.5 text-paper shadow-[0_4px_12px_rgba(19,28,75,0.18)] min-[900px]:hidden">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = isActive(pathname, href);
        return <Link aria-current={active ? "page" : undefined} className={cn("flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-[4px] px-1 text-center text-xs font-bold leading-4 transition-colors", active ? "bg-saffron text-ink" : "text-paper/72 hover:bg-paper/10 hover:text-paper")} href={href} key={href}><Icon aria-hidden className="size-4.5 shrink-0" /><span className="max-w-full break-normal text-[0.6875rem] min-[380px]:text-xs">{t(label)}</span></Link>;
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
    router.push("/home");
  };

  return (
    <details className="group relative" ref={detailsRef}>
      <summary aria-label={`${person?.attrs.name ?? t("brand")} ${t("accountMenu")}`} className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-[4px] border border-paper/20 bg-paper/8 p-1.5 pr-2.5 text-paper transition-colors hover:bg-paper/12 focus-visible:outline-2 focus-visible:outline-paper">
        <span className="grid size-7 place-items-center rounded-[4px] bg-saffron font-display text-xs font-bold text-ink">{person ? getInitials(person.attrs.name) : "CO"}</span>
        <span className="hidden whitespace-nowrap text-xs font-bold lg:block">{person?.attrs.name.split(" ")[0]}</span>
        <ChevronDown aria-hidden className="size-3 text-white/60 transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-12 z-50 grid max-h-[calc(100dvh-4.5rem)] w-[min(22rem,calc(100vw-2rem))] gap-2 overflow-y-auto rounded-[8px] border border-paper-line bg-paper-shade p-3 text-ink shadow-[0_6px_18px_rgba(19,28,75,0.14)]">
        <Link className="flex min-h-11 items-center gap-3 rounded-[4px] bg-paper px-3 text-sm font-bold text-ink hover:text-indigo-deep" href="/you" onClick={close}><UserRound aria-hidden className="size-4 text-indigo-deep" />{t("fullProfile")}</Link>
        <div className="grid gap-1 border-t border-paper-line pt-3"><p className="eyebrow">{t("switchPerson")}</p>{seedLogins.map((login) => {
          const candidate = getPerson(graph, login.personId);
          if (!candidate) return null;
          const active = login.personId === personId;
          return <button className={cn("flex min-h-11 items-center gap-3 rounded-[4px] px-3 text-left text-sm transition-colors", active ? "bg-indigo-tint font-bold text-indigo-deep" : "hover:bg-paper")} key={login.personId} onClick={() => { switchPersona(login.personId); close(); router.push("/home"); }} type="button"><span className="grid size-7 place-items-center rounded-[4px] bg-indigo-deep text-xs font-bold text-paper">{getInitials(candidate.attrs.name)}</span>{candidate.attrs.name}</button>;
        })}</div>
        <div className="grid gap-1 border-t border-paper-line pt-3"><p className="eyebrow">{t("language")}</p><div className="flex flex-wrap gap-2">{languages.map((option) => <button aria-pressed={language === option} className={cn("min-h-11 rounded-[4px] px-3 py-2 text-xs font-bold", language === option ? "bg-indigo-deep text-paper" : "bg-paper text-ink-mute")} key={option} onClick={() => { setLanguage(option); close(); }} type="button">{languageLabels[option]}</button>)}</div></div>
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 border-t border-paper-line pt-3 text-sm font-bold"><span className="flex items-center gap-2"><Gauge aria-hidden className="size-4 text-indigo-deep" />{t("dataSaver")}</span><input checked={dataSaver} className="toggle" onChange={(event) => setDataSaver(event.target.checked)} type="checkbox" /></label>
        <div className="grid grid-cols-2 gap-2"><button className="flex min-h-11 items-center justify-center gap-2 rounded-[4px] bg-paper text-xs font-bold text-ink" onClick={reset} type="button"><RotateCcw aria-hidden className="size-3.5" />{t("resetProgress")}</button><button className="flex min-h-11 items-center justify-center gap-2 rounded-[4px] text-xs font-bold text-ink-mute hover:bg-paper" onClick={() => { close(); signOut(); window.scrollTo(0, 0); }} type="button"><LogOut aria-hidden className="size-3.5" />{t("signOut")}</button></div>
      </div>
    </details>
  );
}

export function TopNavigation() {
  const { t } = useI18n();
  const language = useAuthStore((state) => state.language);
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-indigo-deep text-white shadow-[0_1px_0_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex min-h-16 w-full max-w-[1180px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-2"><Link className="flex shrink-0 items-center gap-2 font-display text-xl font-extrabold tracking-[0.02em] text-paper" href="/home"><CitizenMark className="size-7 text-saffron" />{t("brand").toUpperCase()}</Link><span className="hidden whitespace-nowrap text-xs text-paper/50 lg:inline">{t("independentPrototype")}</span></div>
          <DesktopNavigation />
          <div className="flex shrink-0 items-center gap-2"><Link aria-label={t("information")} className="flex min-h-11 items-center gap-2 rounded-[4px] border border-paper/20 bg-paper/8 px-3 text-xs font-bold text-paper transition-colors hover:bg-paper/12" href="/about"><Info aria-hidden className="size-4" /><span className="hidden xl:inline">{t("information")}</span></Link><span className="hidden text-xs font-bold uppercase text-paper/65 sm:inline-flex">{languageLabels[language]}</span><AccountMenu /></div>
        </div>
      </header>
      <MobileNavigation />
    </>
  );
}
