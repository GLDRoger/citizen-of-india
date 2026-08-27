"use client";

import Link from "next/link";
import { Page, PageHeader } from "@/components/ui/page";
import { StatusPill } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getApplications, getDocuments, getObligations } from "@/features/graph/selectors";
import { useCitizenStore } from "@/features/graph/store";
import { getAvailableServices, type ServiceWorkflowSlug } from "@/features/services/availability";
import { getStatusMessageKey } from "@/i18n/formatters";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

interface ServiceDefinition {
  action: MessageKey;
  applicationKind?: string;
  category: ServiceCategory;
  obligationId?: string;
  promise: MessageKey;
  slug: ServiceWorkflowSlug | "digilocker";
  title: MessageKey;
}

type ServiceCategory = "identity" | "employment" | "money" | "business";
type Application = ReturnType<typeof getApplications>[number];
type Obligation = ReturnType<typeof getObligations>[number];

const categories: ReadonlyArray<{ id: ServiceCategory; label: MessageKey }> = [
  { id: "employment", label: "serviceCategoryEmployment" },
  { id: "identity", label: "serviceCategoryIdentity" },
  { id: "money", label: "serviceCategoryMoney" },
  { id: "business", label: "serviceCategoryBusiness" },
];

const services: ServiceDefinition[] = [
  { action: "continueAction", applicationKind: "epfo-grievance", category: "employment", promise: "epfoPromise", slug: "epfo", title: "epfoService" },
  { action: "viewDocuments", category: "identity", promise: "digilockerPromise", slug: "digilocker", title: "documents" },
  { action: "start", applicationKind: "marriage", category: "identity", promise: "marriagePromise", slug: "marriage", title: "marriageService" },
  { action: "continueAction", applicationKind: "record-correction", category: "identity", promise: "recordCorrectionPromise", slug: "record-correction", title: "recordCorrectionService" },
  { action: "reviewScope", category: "identity", obligationId: "obl:passport-renewal", promise: "passportServicePromise", slug: "passport-renewal", title: "passportWorkflowTitle" },
  { action: "pay", category: "money", obligationId: "obl:echallan-500", promise: "obligationsPromise", slug: "obligations", title: "challanWorkflowTitle" },
  { action: "payPropertyTax", category: "money", obligationId: "obl:bbmp-property-tax", promise: "propertyTaxServicePromise", slug: "property-tax", title: "payPropertyTax" },
  { action: "fileGstr", category: "money", obligationId: "obl:gstr3b-sep", promise: "gstrServicePromise", slug: "gstr3b", title: "fileGstr" },
  { action: "trackRefund", category: "money", obligationId: "obl:itr-refund", promise: "refundServicePromise", slug: "refund-track", title: "trackRefund" },
  { action: "loanService", applicationKind: "business-loan", category: "business", promise: "loanPromise", slug: "loan", title: "loanService" },
  { action: "start", applicationKind: "business-registration", category: "business", promise: "startBusinessPromise", slug: "start-business", title: "startBusinessService" },
];

function ServiceCard({ application, index, obligation, service }: { application?: Application; index: number; obligation?: Obligation; service: ServiceDefinition }) {
  const { t } = useI18n();
  const status = application?.attrs.status ?? obligation?.attrs.status;
  const complete = status === "completed" || status === "paid" || status === "received";
  const statusKey = status ? getStatusMessageKey(status) : undefined;
  return (
    <li>
      <Link className="group grid gap-4 rounded-[8px] border border-paper-line bg-paper-shade p-5 transition-colors hover:border-indigo/40 md:min-h-48 md:content-between md:gap-6" href={service.slug === "digilocker" ? "/documents" : `/workflows/${service.slug}`}>
        <span className="flex items-start justify-between gap-3">
          <span className="font-display text-sm font-semibold tabular-nums text-ink-mute">{String(index).padStart(2, "0")}</span>
          {status ? <StatusPill label={statusKey ? t(statusKey) : status} tone={complete ? "success" : "info"} /> : null}
        </span>
        <span className="grid gap-2">
          <strong className="font-display text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-ink">{t(service.title)}</strong>
          <span className="text-sm leading-6 text-ink-mute">{t(service.promise)}</span>
        </span>
        <span className="min-h-11 w-fit content-center text-sm font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4 transition-colors group-hover:decoration-indigo-deep">{complete ? t("view") : application ? t("continueAction") : t(service.action)}</span>
      </Link>
    </li>
  );
}

export function ServicesScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  if (!personId) return null;
  const applications = getApplications(graph, personId);
  const documents = getDocuments(graph, personId);
  const obligations = getObligations(graph, personId);
  const available = new Set(getAvailableServices(graph, personId));
  const visibleServices = services.filter(({ slug }) => slug === "digilocker" ? documents.length > 0 : available.has(slug));

  return (
    <Page className="grid gap-6 lg:gap-8">
      <PageHeader title={t("servicesHeadline")} />
      <div className="grid gap-8">
        {categories.map((category) => {
          const categoryServices = visibleServices.filter((service) => service.category === category.id);
          if (!categoryServices.length) return null;
          return (
            <section className="grid gap-3" key={category.id}>
              <header className="flex items-end justify-between gap-4"><h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{t(category.label)}</h2><span className="text-sm font-bold tabular-nums text-ink-mute">{categoryServices.length}</span></header>
              <ol className="grid gap-3 md:grid-cols-2">
                {categoryServices.map((service) => <ServiceCard application={service.applicationKind ? applications.find((candidate) => candidate.attrs.kind === service.applicationKind) : undefined} index={visibleServices.indexOf(service) + 1} key={service.slug} obligation={service.obligationId ? obligations.find((candidate) => candidate.id === service.obligationId) : undefined} service={service} />)}
              </ol>
            </section>
          );
        })}
      </div>
    </Page>
  );
}
