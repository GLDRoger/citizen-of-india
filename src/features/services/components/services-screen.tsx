"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, HeartHandshake, Landmark, ReceiptText, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";
import { Page, PageHeader } from "@/components/ui/page";
import { SimulatedChip, StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getApplications } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { getStatusMessageKey } from "@/i18n/formatters";

interface ServiceDefinition {
  applicationKind?: string;
  icon: LucideIcon;
  promise: MessageKey;
  slug: string;
  title: MessageKey;
}

const services: ServiceDefinition[] = [
  { applicationKind: "death", icon: HeartHandshake, promise: "deathPromise", slug: "death", title: "deathService" },
  { applicationKind: "marriage", icon: UsersRound, promise: "marriagePromise", slug: "marriage", title: "marriageService" },
  { icon: ReceiptText, promise: "obligationsPromise", slug: "obligations", title: "obligationsService" },
  { applicationKind: "business-loan", icon: Landmark, promise: "loanPromise", slug: "loan", title: "loanService" },
  { applicationKind: "cybercrime", icon: ShieldCheck, promise: "scamPromise", slug: "scam-check", title: "scamService" },
  { applicationKind: "business-registration", icon: BriefcaseBusiness, promise: "startBusinessPromise", slug: "start-business", title: "startBusinessService" },
];

export function ServicesScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;
  const applications = getApplications(graph, personId);
  return (
    <Page className="grid gap-10 lg:gap-14">
      <PageHeader eyebrow={`6 ${t("services").toLowerCase()}`} title={t("servicesHeadline")} description={t("servicesBody")} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service, index) => {
          const application = service.applicationKind ? applications.find((candidate) => candidate.attrs.kind === service.applicationKind) : undefined;
          const complete = application?.attrs.status === "completed";
          const statusKey = application ? getStatusMessageKey(application.attrs.status) : undefined;
          return (
            <Link className="group grid min-h-72 content-between gap-10 rounded-[8px] border border-paper-line bg-paper-shade p-6 transition-colors hover:border-green-deep/40" href={`/workflows/${service.slug}`} key={service.slug}>
              <div className="flex items-start justify-between gap-4"><div className="flex flex-wrap justify-end gap-2"><SimulatedChip />{application ? <StatusPill label={statusKey ? t(statusKey) : application.attrs.status} tone={complete ? "success" : "info"} /> : null}</div></div>
              <div className="grid gap-4"><span className="font-display text-lg font-semibold text-ink-mute">0{index + 1}</span><div className="grid gap-2"><h2 className="font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-ink">{t(service.title)}</h2><p className="text-sm leading-6 text-ink-mute">{t(service.promise)}</p></div><span className="flex items-center gap-2 text-sm font-bold text-green-deep">{application ? t("continueAction") : t("start")}<ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" /></span></div>
            </Link>
          );
        })}
      </section>
    </Page>
  );
}
