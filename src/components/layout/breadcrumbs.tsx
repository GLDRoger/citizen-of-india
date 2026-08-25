"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

const workflowLabels: Record<string, MessageKey> = {
  death: "deathService",
  loan: "loanService",
  marriage: "marriageService",
  obligations: "obligationsService",
  "scam-check": "scamService",
  "service-unavailable": "serviceUnavailable",
  "start-business": "startBusinessService",
  "property-tax": "payPropertyTax",
  gstr3b: "fileGstr",
  "passport-renewal": "reviewScope",
  "refund-track": "trackRefund",
};

interface BreadcrumbItem {
  href?: string;
  label: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t("breadcrumbs")}>
      <ol className="flex min-w-0 items-center gap-1.5 overflow-x-auto py-1 text-[0.7rem] font-bold text-ink-mute [scrollbar-width:none] sm:text-xs">
        {items.map((item, index) => (
          <li className="flex shrink-0 items-center gap-1.5" key={`${item.label}:${item.href ?? index}`}>
            {index > 0 ? <ChevronRight aria-hidden className="size-3 text-line" /> : null}
            {item.href ? <Link className="transition hover:text-green-deep" href={item.href}>{item.label}</Link> : <span aria-current="page" className="text-ink-mute">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function RouteBreadcrumbs() {
  const pathname = usePathname();
  const { t } = useI18n();
  const segments = pathname.split("/").filter(Boolean);
  const current = segments.at(-1);
  if (segments[0] !== "workflows" || !current) return null;
  const workflow = workflowLabels[current];
  if (!workflow) return null;
  const items: BreadcrumbItem[] = [
    { href: "/", label: t("home") },
    { href: "/services", label: t("services") },
    { label: t(workflow) },
  ];
  return <div className="mx-auto w-full max-w-[1240px] px-5 pt-4 sm:px-8 lg:px-10"><Breadcrumbs items={items} /></div>;
}
