import { Compass, MoveLeft } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Page } from "@/components/ui/page";

export function ServiceUnavailable() {
  return (
    <Page className="grid min-h-[75vh] place-content-center justify-items-start gap-5">
      <span className="grid size-14 place-items-center rounded-full bg-saffron-soft text-saffron-ink"><Compass aria-hidden className="size-7" /></span>
      <p className="eyebrow">Service availability</p>
      <h1 className="max-w-2xl font-display text-5xl font-semibold leading-[0.92] tracking-[-0.045em] text-ink sm:text-7xl">This service is not connected yet.</h1>
      <p className="max-w-xl text-sm leading-6 text-ink-muted">Citizen currently supports death and marriage journeys, obligations, business-loan decisions, scam checks, and starting a business. Choose one of these to continue.</p>
      <LinkButton href="/services"><MoveLeft aria-hidden className="size-4" />Try a connected service</LinkButton>
    </Page>
  );
}
