"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { CitizenMark } from "@/components/citizen-mark";
import { Button } from "@/components/ui/button";
import { seedLogins } from "@/features/graph/seed";
import { getPerson } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { languageLabels, languages, type MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { getInitials } from "@/lib/format";
import { useAuthStore } from "../store";

const profileRoleKeys: Record<string, MessageKey> = {
  "person:arjun": "sampleArjunRole",
  "person:priya": "samplePriyaRole",
  "person:sunita": "sampleSunitaRole",
};

export function LoginScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const graph = useCitizenStore((state) => state.graph);
  const openProfile = useAuthStore((state) => state.openProfile);
  const setLanguage = useAuthStore((state) => state.setLanguage);
  const language = useAuthStore((state) => state.language);
  const [phone, setPhone] = useState(seedLogins[0]?.phone ?? "");
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    const result = openProfile(phone);
    setError(result.ok ? null : result.reason);
    if (result.ok) {
      window.scrollTo({ top: 0 });
      router.replace("/home");
    }
  };

  return (
    <main className="citizen-app min-h-dvh bg-paper text-ink">
      <header className="border-b border-white/10 bg-indigo-deep text-white"><div className="mx-auto flex min-h-16 w-full max-w-[1040px] items-center justify-between gap-4 px-5 sm:px-8"><Link className="flex items-center gap-2 font-display text-xl font-extrabold tracking-[0.02em]" href="/"><CitizenMark className="size-7 text-saffron" />{t("brand").toUpperCase()}</Link><Link className="min-h-11 content-center text-xs font-bold text-white/70 underline decoration-white/30 underline-offset-4 hover:text-white" href="/about">{t("about")}</Link></div></header>

      <section className="mx-auto grid w-full max-w-[760px] gap-6 px-5 py-5 sm:gap-8 sm:px-8 sm:py-16">
        <div className="grid gap-4 border-b border-paper-line pb-6 sm:pb-8">
          <Link className="min-h-11 content-center justify-self-start text-xs font-bold text-ink-mute underline underline-offset-4" href="/">← {t("startBack")}</Link>
          <h1 className="max-w-3xl font-display text-[clamp(2.8rem,7vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.045em]">{t("startTitle")}</h1>
          <p className="max-w-2xl text-sm leading-7 text-ink-mute sm:text-base">{t("startBody")}</p>
        </div>

        <form className="grid gap-6" onSubmit={(event) => { event.preventDefault(); open(); }}>
          <div className="grid gap-2" role="group" aria-label={t("chooseProfile")}>
            {seedLogins.map((login) => {
              const person = getPerson(graph, login.personId);
              if (!person) return null;
              const selected = phone === login.phone;
              return (
                <button
                  aria-pressed={selected}
                  className={`group flex min-h-18 items-center gap-4 rounded-[8px] border px-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-indigo-deep ${selected ? "border-indigo/35 bg-indigo-tint" : "border-paper-line bg-paper-shade hover:border-indigo/40"}`}
                  key={login.personId}
                  onClick={() => setPhone(login.phone)}
                  type="button"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-[4px] bg-indigo-deep font-display text-sm font-semibold text-paper">{getInitials(person.attrs.name)}</span>
                  <span className="min-w-0 flex-1"><span className="block font-bold text-ink">{person.attrs.name}</span><span className="block text-xs text-ink-mute">{t(profileRoleKeys[login.personId] ?? "sampleProfileRole")}</span></span>
                  {selected ? <Check aria-hidden className="size-5 shrink-0 text-indigo-deep" /> : null}
                </button>
              );
            })}
          </div>

          <p className="border-y border-paper-line py-4 text-xs leading-5 text-ink-mute">{t("profileAccessNotice")}</p>
          {error ? <p className="rounded-[4px] bg-brick-tint px-4 py-3 text-sm font-semibold text-brick" role="alert">{error}</p> : null}
          <Button type="submit">{t("openSampleProfile")} <ArrowRight aria-hidden className="size-4" /></Button>

          <div className="flex flex-wrap gap-2 border-t border-paper-line pt-5" aria-label={t("language")}>
            {languages.map((option) => <button aria-pressed={language === option} className={`min-h-11 rounded-[4px] px-3 py-2 text-xs font-bold transition-colors ${language === option ? "bg-indigo-deep text-paper" : "bg-paper-shade text-ink-mute hover:text-ink"}`} key={option} onClick={() => setLanguage(option)} type="button">{languageLabels[option]}</button>)}
          </div>
        </form>
      </section>
    </main>
  );
}
