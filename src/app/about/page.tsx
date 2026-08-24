import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, FlaskConical, ShieldAlert, X } from "lucide-react";

export const metadata: Metadata = { title: "Service status" };

const realItems = [
  "Responsive navigation, search, validation, and guided workflows",
  "Connected-record views, eligibility checks, and a change history",
  "Document reuse, profile switching, and progress saved in this browser",
  "Plain-language planning and notice explanations when AI assistance is connected",
];

const simulatedItems = [
  "Every person, phone number, identifier, notice, balance and family relationship",
  "Profile access codes and citizen consent",
  "Authority registration, payments, appointments, certificates and responses",
  "Cross-citizen notifications and consent arrival",
];

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto grid min-h-dvh max-w-[1120px] gap-14 px-5 py-7 sm:px-10 sm:py-12">
        <header className="flex items-center justify-between gap-4">
          <Link className="flex min-h-11 items-center gap-2 text-sm font-bold text-ink-mute hover:text-ink" href="/"><ArrowLeft aria-hidden className="size-4" />Citizen</Link>
          <span className="rounded-[4px] border border-brick bg-brick-tint px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-brick">Independent prototype</span>
        </header>

        <section className="grid max-w-4xl gap-5">
          <p className="eyebrow">Service status and data use</p>
          <h1 className="font-display text-[clamp(3.2rem,8vw,6.8rem)] font-semibold leading-[0.86] tracking-[-0.055em]">Know what Citizen<br /><span className="text-green-deep">can do today.</span></h1>
          <p className="max-w-2xl text-sm leading-7 text-ink-mute sm:text-base">Citizen brings connected records, life events, and public-service tasks into one guided view. It is an independent product preview, not a government service, and it cannot submit a live application.</p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="grid content-start gap-6 border-t border-green-deep pt-5">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-[4px] bg-green-tint text-green-deep"><Check aria-hidden className="size-5" /></span><h2 className="font-display text-3xl font-semibold">Available now</h2></div>
            <ul className="grid gap-4">{realItems.map((item) => <li className="flex gap-3 text-sm leading-6 text-ink-mute" key={item}><Check aria-hidden className="mt-1 size-4 shrink-0 text-green-deep" />{item}</li>)}</ul>
          </article>
          <article className="grid content-start gap-6 border-t border-saffron pt-5">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-[4px] bg-brick-tint text-brick"><FlaskConical aria-hidden className="size-5" /></span><h2 className="font-display text-3xl font-semibold">Simulated in this preview</h2></div>
            <ul className="grid gap-4">{simulatedItems.map((item) => <li className="flex gap-3 text-sm leading-6 text-ink-mute" key={item}><X aria-hidden className="mt-1 size-4 shrink-0 text-brick" />{item}</li>)}</ul>
          </article>
        </section>

        <section className="grid gap-6 rounded-[8px] bg-ink p-6 text-paper sm:grid-cols-[auto_minmax(0,1fr)] sm:p-8">
          <ShieldAlert aria-hidden className="size-8 text-brick" />
          <div className="grid gap-3"><h2 className="font-display text-3xl font-semibold">Safety and privacy</h2><p className="max-w-3xl text-sm leading-6 text-paper/70">Every profile and record shown here is fictional. Progress stays in this browser. AI routes receive only the records needed for the current task, never the full connected graph. Do not enter real Aadhaar, PAN, payment, or medical information.</p></div>
        </section>

        <footer className="flex flex-col justify-between gap-4 border-t border-paper-line py-6 text-xs text-ink-mute sm:flex-row"><p>Not affiliated with the Government of India or any state authority.</p><Link className="font-bold text-green-deep hover:underline" href="/">Return to Citizen</Link></footer>
      </div>
    </main>
  );
}
