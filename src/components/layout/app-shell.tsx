"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, Gauge, Info, LogOut, RotateCcw } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { useAuthStore } from "@/features/auth/store";
import { seedLogins } from "@/features/graph/seed";
import { getPerson } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { languageLabels, languages } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";
import { navItems } from "./nav-items";

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();
  return navItems.map(({ href, icon: Icon, label }) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link
        key={href}
        className={cn(
          mobile
            ? "grid min-w-0 flex-1 justify-items-center gap-1 px-0.5 py-2 text-[0.58rem] font-bold leading-none"
            : "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold",
          active ? "bg-action-soft text-action-strong" : "text-ink-muted hover:bg-surface-strong hover:text-ink",
        )}
        href={href}
        aria-current={active ? "page" : undefined}
      >
        <Icon aria-hidden className={mobile ? "size-[1.15rem]" : "size-[1.1rem]"} strokeWidth={active ? 2.4 : 1.8} />
        <span className="truncate">{t(label)}</span>
      </Link>
    );
  });
}

function DesktopRail() {
  const { t } = useI18n();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[224px] border-r border-line bg-surface px-4 py-6 lg:flex lg:flex-col">
      <Link className="px-3 font-display text-2xl font-semibold tracking-[-0.04em] text-ink" href="/">
        {t("brand")}<span className="text-saffron">.</span>
      </Link>
      <p className="px-3 pt-1 text-[0.62rem] font-bold uppercase tracking-[0.15em] text-ink-faint">{t("independentPreview")}</p>
      <nav className="mt-10 grid gap-1" aria-label="Primary navigation"><NavLinks /></nav>
      <div className="mt-auto grid gap-3 border-t border-line px-3 pt-5">
        <Link className="flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink" href="/about">
          {t("about")} <ExternalLink aria-hidden className="size-3" />
        </Link>
      </div>
    </aside>
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
      const target = event.target;
      if (target instanceof Node && !detailsRef.current?.contains(target)) {
        detailsRef.current?.removeAttribute("open");
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  const reset = () => {
    if (window.confirm(t("resetConfirm"))) {
      resetDemo();
      detailsRef.current?.removeAttribute("open");
      router.push("/");
    }
  };

  return (
    <details className="group relative" ref={detailsRef}>
      <summary aria-label={`${person?.attrs.name ?? t("brand")} account menu`} className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-surface px-2 pr-3 transition hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-action">
        <span className="grid size-8 place-items-center rounded-full bg-ink font-display text-[0.65rem] font-bold text-canvas">
          {person ? getInitials(person.attrs.name) : "CO"}
        </span>
        <span className="hidden max-w-24 truncate text-xs font-bold text-ink sm:block">{person?.attrs.name.split(" ")[0]}</span>
        <ChevronDown aria-hidden className="size-3 text-ink-muted transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-13 z-50 grid w-[min(21rem,calc(100vw-2rem))] gap-5 rounded-[20px] border border-line bg-surface p-4 shadow-[0_18px_60px_oklch(0.2_0.03_245/0.16)]">
        <div className="grid gap-2">
          <p className="eyebrow">{t("switchPerson")}</p>
          <div className="grid gap-1">
            {seedLogins.map((login) => {
              const candidate = getPerson(graph, login.personId);
              if (!candidate) return null;
              const active = login.personId === personId;
              return (
                <button
                  key={login.personId}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm transition",
                    active ? "bg-action-soft font-bold text-action-strong" : "hover:bg-surface-strong",
                  )}
                  onClick={() => {
                    switchPersona(login.personId);
                    detailsRef.current?.removeAttribute("open");
                    router.push("/");
                  }}
                  type="button"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-ink text-[0.58rem] font-bold text-canvas">{getInitials(candidate.attrs.name)}</span>
                  {candidate.attrs.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-2 border-t border-line pt-4">
          <p className="eyebrow">{t("language")}</p>
          <div className="flex flex-wrap gap-2">
            {languages.map((option) => (
              <button
                key={option}
                className={cn(
                  "rounded-full px-3 py-2 text-xs font-bold",
                  language === option ? "bg-ink text-canvas" : "bg-surface-strong text-ink-muted",
                )}
                onClick={() => {
                  setLanguage(option);
                  detailsRef.current?.removeAttribute("open");
                }}
                type="button"
              >
                {languageLabels[option]}
              </button>
            ))}
          </div>
        </div>
        <label className="flex cursor-pointer items-center justify-between gap-4 border-t border-line pt-4 text-sm font-bold">
          <span className="flex items-center gap-2"><Gauge aria-hidden className="size-4 text-action" /> {t("dataSaver")}</span>
          <input className="toggle" type="checkbox" checked={dataSaver} onChange={(event) => setDataSaver(event.target.checked)} />
        </label>
        <Link className="flex min-h-10 items-center gap-2 border-t border-line pt-4 text-xs font-bold text-ink-muted hover:text-ink" href="/about" onClick={() => detailsRef.current?.removeAttribute("open")}>
          <Info aria-hidden className="size-4 text-action" /> {t("about")}
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-surface-strong text-xs font-bold text-ink" onClick={reset} type="button">
            <RotateCcw aria-hidden className="size-3.5" /> {t("resetProgress")}
          </button>
          <button className="flex min-h-10 items-center justify-center gap-2 rounded-xl text-xs font-bold text-ink-muted hover:bg-surface-strong" onClick={() => { detailsRef.current?.removeAttribute("open"); signOut(); }} type="button">
            <LogOut aria-hidden className="size-3.5" /> {t("signOut")}
          </button>
        </div>
      </div>
    </details>
  );
}

function TopBar() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-canvas/95 px-4 backdrop-blur sm:px-6 lg:px-10">
      <Link className="font-display text-xl font-semibold tracking-[-0.04em] text-ink lg:hidden" href="/">
        {t("brand")}<span className="text-saffron">.</span>
      </Link>
      <p className="hidden text-xs font-bold text-ink-faint lg:block">{t("independentNotice")}</p>
      <AccountMenu />
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const dataSaver = useAuthStore((state) => state.dataSaver);
  const language = useAuthStore((state) => state.language);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return (
    <div className={cn("min-h-dvh bg-canvas", dataSaver && "data-saver")}>
      <DesktopRail />
      <div className="min-h-dvh lg:pl-[224px]">
        <TopBar />
        <main>{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/98 px-1 pb-[max(env(safe-area-inset-bottom),0.25rem)] backdrop-blur lg:hidden" aria-label="Primary navigation">
        <NavLinks mobile />
      </nav>
    </div>
  );
}
