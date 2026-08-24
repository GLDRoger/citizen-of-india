"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

const routeLabels: Record<string, MessageKey> = {
  activity: "activity",
  dashboard: "dashboard",
  discover: "discover",
  documents: "documents",
  inbox: "inbox",
  services: "services",
  you: "fullProfile",
};

const workflowLabels: Record<string, MessageKey> = {
  death: "deathService",
  loan: "loanService",
  marriage: "marriageService",
  obligations: "obligationsService",
  "scam-check": "scamService",
  "service-unavailable": "serviceUnavailable",
  "start-business": "startBusinessService",
};

interface BreadcrumbItem {
  href?: string;
  label: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t("breadcrumbs")}>
      <ol className="flex min-w-0 items-center gap-1.5 overflow-x-auto py-1 text-[0.7rem] font-bold text-ink-faint [scrollbar-width:none] sm:text-xs">
        {items.map((item, index) => (
          <li className="flex shrink-0 items-center gap-1.5" key={`${item.label}:${item.href ?? index}`}>
            {index > 0 ? <ChevronRight aria-hidden className="size-3 text-line" /> : null}
            {item.href ? <Link className="transition hover:text-action-strong" href={item.href}>{item.label}</Link> : <span aria-current="page" className="text-ink-muted">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function RouteBreadcrumbs() {
  const pathname = usePathname();
  const { t } = useI18n();
  if (pathname === "/") return null;
  const segments = pathname.split("/").filter(Boolean);
  const current = segments.at(-1);
  const workflow = segments[0] === "workflows" && current ? workflowLabels[current] : undefined;
  const label = workflow ?? (current ? routeLabels[current] : undefined);
  if (!label) return null;
  const items: BreadcrumbItem[] = [{ href: "/", label: t("home") }];
  if (workflow) items.push({ href: "/services", label: t("services") });
  items.push({ label: t(label) });
  return <div className="mx-auto w-full max-w-[1240px] px-5 pt-4 sm:px-8 lg:px-10"><Breadcrumbs items={items} /></div>;
}
