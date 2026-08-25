"use client";

import { AlertTriangle, CheckCircle2, ChevronDown, Download, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Page, PageHeader } from "@/components/ui/page";
import { SimulatedChip, VerificationBadge } from "@/components/ui/status";
import { useAuthStore } from "@/features/auth/store";
import { getDocuments, getPerson } from "@/features/graph/selectors";
import type { GraphMutation } from "@/features/graph/schema";
import { useCitizenStore } from "@/features/graph/store";
import { useI18n } from "@/i18n/use-i18n";
import { getDocumentKindMessageKey } from "@/i18n/formatters";
import { cn } from "@/lib/cn";
import { formatDate, maskIdentifier } from "@/lib/format";
import { submitPanCorrection } from "@/lib/mockGov";

function DocumentCard({ document, personId }: { document: ReturnType<typeof getDocuments>[number]; personId: string }) {
  const { language, t } = useI18n();
  const kindKey = getDocumentKindMessageKey(document.attrs.kind);
  const commit = useCitizenStore((state) => state.commit);
  const graph = useCitizenStore((state) => state.graph);
  const person = getPerson(graph, personId);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = () => {
    if (document.attrs.downloaded) return;
    commit({
      actorId: personId,
      labelKey: "eventDocumentSaved",
      labelParams: { documentKind: document.attrs.kind },
      mutations: [{ type: "patchAttrs", nodeId: document.id, attrs: { downloaded: true } }],
    });
  };

  const reconcile = async () => {
    if (!person) return;
    setLoading(true);
    setError(null);
    try {
      const response = await submitPanCorrection({ personId, correctedName: person.attrs.name });
      const mutations: GraphMutation[] = [
        {
          type: "patchAttrs",
          nodeId: document.id,
          attrs: { holderName: person.attrs.name },
          verification: { source: "NSDL", state: "verified", asOf: "2026-08-24", note: "PAN name now matches the connected Aadhaar record." },
        },
        {
          type: "patchAttrs",
          nodeId: "app:pan-name-correction",
          attrs: { status: "completed", reference: response.data.acknowledgement, note: "PAN name correction completed in the simulated service." },
          verification: { source: "NSDL", state: "verified", asOf: "2026-08-24" },
        },
      ];
      commit({ actorId: personId, labelKey: "eventPanMismatchResolved", procedureId: "pan-reconciliation", mutations });
      setMessage(t("panCorrectionSaved", { reference: response.data.acknowledgement }));
    } catch {
      setError(t("documentCorrectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="grid content-start gap-5 rounded-[8px] border border-paper-line bg-paper-shade p-5">
      <div className="grid gap-1">
        <div className="flex items-start justify-between gap-3"><p className="eyebrow">{kindKey ? t(kindKey) : document.attrs.kind.replaceAll("-", " ")}</p><VerificationBadge verification={document.verification} /></div>
        <h2 className="font-display text-2xl font-semibold leading-tight text-ink">{document.attrs.holderName}</h2>
        {document.attrs.numberMasked ? <p className="text-sm font-bold tracking-wide text-ink-mute">{maskIdentifier(document.attrs.numberMasked)}</p> : null}
      </div>
      <div className="grid gap-1 text-xs text-ink-mute">
        <span>{t("documentIssued", { date: formatDate(document.attrs.issuedOn, language) })}</span>
        {document.attrs.expiresOn ? <span>{t("expiry")} {formatDate(document.attrs.expiresOn, language)}</span> : null}
        {document.attrs.downloaded ? <span className="flex items-center gap-1.5 font-bold text-green-deep"><CheckCircle2 aria-hidden className="size-3.5" />{t("storedOnDevice")}</span> : null}
      </div>
      {document.verification.state === "mismatch" && person ? <div className="grid gap-2 border-y border-brick/25 bg-brick-tint px-3 py-3 text-xs leading-5 text-brick"><p className="flex gap-2"><AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0" />{t("panMismatchExplanation", { aadhaarName: person.attrs.name, panName: document.attrs.holderName })}</p><Link className="ml-5 font-bold underline underline-offset-4" href="/#task-app:pan-name-correction">{t("viewCorrectionDraft")}</Link></div> : null}
      {message ? <p className="flex items-center gap-2 text-xs font-bold text-green-deep"><CheckCircle2 aria-hidden className="size-4" />{message} <SimulatedChip authority="Protean eGov (PAN)" /></p> : null}
      {error ? <p className="rounded-xl bg-brick-tint p-3 text-xs font-bold text-brick" role="alert">{error}</p> : null}
      <div className="mt-auto grid gap-2">
        {document.verification.state === "mismatch" ? <Button loading={loading} onClick={() => void reconcile()}><ShieldCheck aria-hidden className="size-4" />{t("resolveMismatch")}</Button> : null}
        {!document.attrs.downloaded ? <Button onClick={download} variant="secondary"><Download aria-hidden className="size-4" />{t("saveOffline")}</Button> : null}
        <details className="border-t border-paper-line pt-2">
          <summary className="flex min-h-9 items-center justify-between text-xs font-bold text-ink-mute"><span>{t("why")}</span><ChevronDown aria-hidden className="size-4 text-green-deep" /></summary>
          <div className="grid gap-1 pb-2 text-xs leading-5 text-ink-mute"><span>{t("documentSource", { source: document.verification.source })}</span><span>{t("documentCheckedOn", { date: formatDate(document.verification.asOf, language) })}</span><span>{t("documentUseReason")}</span></div>
        </details>
      </div>
    </article>
  );
}

export function DocumentsScreen() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  const graph = useCitizenStore((state) => state.graph);
  const [query, setQuery] = useState("");
  if (!personId) return null;
  const documents = getDocuments(graph, personId);
  const normalizedQuery = query.trim().toLowerCase();
  const visible = documents.filter((document) =>
    [document.attrs.kind, document.attrs.holderName, document.attrs.numberMasked]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(normalizedQuery)),
  );

  return (
    <Page className="grid gap-8">
      <PageHeader eyebrow={t("documentCount", { count: documents.length })} title={t("documents")} description={t("documentsPageBody")} />
      <label className="relative block max-w-xl">
        <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
        <input className="h-13 w-full rounded-[8px] border border-paper-line bg-paper-shade pl-11 pr-4 text-sm outline-none transition focus:border-green-deep focus:ring-4 focus:ring-green-deep/10" onChange={(event) => setQuery(event.target.value)} placeholder={t("searchDocuments")} type="search" value={query} />
      </label>
      {visible.length ? (
        <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", visible.length === 1 && "max-w-md")}>
          {visible.map((document) => <DocumentCard document={document} key={document.id} personId={personId} />)}
        </div>
      ) : <EmptyState title={t("noMatchingDocuments")} body={t("documentsSearchHelp")} />}
    </Page>
  );
}
