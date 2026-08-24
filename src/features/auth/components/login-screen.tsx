"use client";

import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { seedLogins } from "@/features/graph/seed";
import { getPerson } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { languageLabels, languages } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { getInitials } from "@/lib/format";
import { useAuthStore } from "../store";

export function LoginScreen() {
  const { t } = useI18n();
  const graph = useCitizenStore((state) => state.graph);
  const authenticate = useAuthStore((state) => state.authenticate);
  const setLanguage = useAuthStore((state) => state.setLanguage);
  const language = useAuthStore((state) => state.language);
  const [phone, setPhone] = useState(seedLogins[0]?.phone ?? "");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (stage === "phone") {
      if (!seedLogins.some((login) => login.phone === phone)) {
        setError("Choose one of the available profiles.");
        return;
      }
      setStage("otp");
      return;
    }
    const result = authenticate(phone, otp);
    if (!result.ok) setError(result.reason);
  };

  return (
    <main className="min-h-dvh bg-ink text-canvas">
      <div className="mx-auto grid min-h-dvh max-w-[1280px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex min-h-[42vh] flex-col justify-between overflow-hidden border-b border-canvas/15 px-5 py-6 sm:px-10 sm:py-10 lg:min-h-dvh lg:border-b-0 lg:border-r">
          <div aria-hidden className="absolute -right-24 top-20 size-72 rounded-full border-[52px] border-saffron/80 opacity-90 sm:size-[430px]" />
          <div className="relative flex items-center justify-between gap-4">
            <p className="font-display text-xl font-semibold tracking-tight">{t("brand")}<span className="text-saffron">.</span></p>
            <Link className="text-xs font-bold text-canvas/70 underline-offset-4 hover:underline" href="/about">
              {t("about")}
            </Link>
          </div>
          <div className="relative grid max-w-[620px] gap-5 py-12 lg:py-0">
            <span className="w-fit rounded-full border border-canvas/20 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-canvas/70">
              {t("independentPreview")}
            </span>
            <h1 className="font-display text-[clamp(3.2rem,8vw,6.8rem)] font-semibold leading-[0.84] tracking-[-0.055em]">
              {t("loginTitle")}
            </h1>
            <p className="max-w-md text-sm leading-6 text-canvas/65 sm:text-base">{t("loginBody")}</p>
          </div>
          <p className="relative hidden max-w-md text-xs leading-5 text-canvas/45 lg:block">{t("independentNotice")}</p>
        </section>

        <section className="flex items-center bg-canvas px-5 py-10 text-ink sm:px-10 lg:px-16">
          <form className="mx-auto grid w-full max-w-md gap-8" onSubmit={(event) => { event.preventDefault(); submit(); }}>
            <div className="grid gap-3">
              <p className="eyebrow">{stage === "phone" ? t("chooseProfile") : t("otp")}</p>
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl">
                {stage === "phone" ? t("chooseProfile") : t("anyOtp")}
              </h2>
            </div>

            {stage === "phone" ? (
              <div className="grid gap-2" role="radiogroup" aria-label={t("chooseProfile")}>
                {seedLogins.map((login) => {
                  const person = getPerson(graph, login.personId);
                  if (!person) return null;
                  const selected = phone === login.phone;
                  return (
                    <button
                      key={login.personId}
                      className="group flex min-h-20 items-center gap-4 rounded-[18px] border border-line bg-canvas px-4 text-left transition hover:border-action/40 hover:bg-action-soft focus-visible:outline-2 focus-visible:outline-action"
                      onClick={() => setPhone(login.phone)}
                      role="radio"
                      aria-checked={selected}
                      type="button"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-semibold text-canvas">
                        {getInitials(person.attrs.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-ink">{person.attrs.name}</span>
                        <span className="block text-xs text-ink-muted">{login.phone} · {login.label.split("(")[1]?.replace(")", "")}</span>
                      </span>
                      <span className="grid size-6 place-items-center rounded-full border border-line text-action">
                        {selected ? <Check aria-hidden className="size-4" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <label className="grid gap-2">
                <span className="text-sm font-bold text-ink">{t("otp")}</span>
                <input
                  autoFocus
                  className="h-16 rounded-[16px] border border-line bg-surface px-5 font-display text-2xl font-semibold tracking-[0.32em] outline-none transition focus:border-action focus:ring-4 focus:ring-action/10"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-invalid={Boolean(error)}
                  maxLength={6}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  value={otp}
                />
                <span className="flex items-center gap-2 text-xs text-ink-muted">
                  <ShieldCheck aria-hidden className="size-4 text-action" /> {t("anyOtp")}
                </span>
              </label>
            )}

            {error ? <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger" role="alert">{error}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              {stage === "otp" ? <Button className="sm:flex-1" onClick={() => setStage("phone")} type="button" variant="secondary">{t("back")}</Button> : null}
              <Button className="sm:flex-[2]" type="submit">
                {stage === "phone" ? t("continue") : t("verifyOtp")} <ArrowRight aria-hidden className="size-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-line pt-5" aria-label={t("language")}>
              {languages.map((option) => (
                <button
                  key={option}
                  className={`rounded-full px-3 py-2 text-xs font-bold transition ${language === option ? "bg-ink text-canvas" : "bg-surface-strong text-ink-muted hover:text-ink"}`}
                  onClick={() => setLanguage(option)}
                  type="button"
                >
                  {languageLabels[option]}
                </button>
              ))}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
