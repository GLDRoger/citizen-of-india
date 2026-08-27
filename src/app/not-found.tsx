import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="grid min-h-dvh place-content-center justify-items-start gap-5 bg-paper px-5 text-ink">
      <p className="eyebrow">404</p>
      <h1 className="font-display text-5xl font-semibold tracking-[-0.04em]">Page not found</h1>
      <p className="max-w-md text-sm leading-6 text-ink-mute">Go home and choose a service.</p>
      <LinkButton href="/home">Go home</LinkButton>
    </section>
  );
}
