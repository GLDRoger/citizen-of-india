"use client";

import { AlertTriangle, CheckCircle2, Download, FileKey2, Search, ShieldCheck } from "lucide-react";
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
import { cn } from "@/lib/cn";
import { formatDate, maskIdentifier } from "@/lib/format";
import { submitPanCorrection } from "@/lib/mockGov";

function DocumentCard({ document, personId }: { document: ReturnType<typeof getDocuments>[number]; personId: string }) {
  const { t } = useI18n();
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
      label: `${document.attrs.kind} saved to this device`,
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
          verification: { source: "NSDL", state: "verified", asOf: "2026-08-24", note: "Correction matched to the connected Aadhaar record in the simulated service." },
        },
        {
          type: "patchAttrs",
          nodeId: "app:pan-name-correction",
          attrs: { status: "completed", reference: response.data.acknowledgement, note: "PAN name correction completed in the simulated service." },
          verification: { source: "NSDL", state: "verified", asOf: "2026-08-24" },
        },
      ];
      commit({ actorId: personId, label: "PAN name mismatch resolved", procedureId: "pan-reconciliation", mutations });
      setMessage(`${response.data.acknowledgement} · ${response.data.status}`);
    } catch {
      setError("The simulated correction service did not respond. The PAN record was not changed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="grid content-start gap-5 rounded-[8px] border border-paper-line bg-paper-shade p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-[4px] bg-paper-line text-ink"><FileKey2 aria-hidden className="size-5" /></span>
        <VerificationBadge verification={document.verification} />
      </div>
      <div className="grid gap-1">
        <p className="eyebrow">{document.attrs.kind.replaceAll("-", " ")}</p>
        <h2 className="font-display text-2xl font-semibold leading-tight text-ink">{document.attrs.holderName}</h2>
        {document.attrs.numberMasked ? <p className="text-sm font-bold tracking-wide text-ink-mute">{maskIdentifier(document.attrs.numberMasked)}</p> : null}
      </div>
      <div className="grid gap-1 text-xs text-ink-mute">
        <span>Issued {formatDate(document.attrs.issuedOn)}</span>
        {document.attrs.expiresOn ? <span>{t("expiry")} {formatDate(document.attrs.expiresOn)}</span> : null}
        {document.attrs.downloaded ? <span className="flex items-center gap-1.5 font-bold text-green-deep"><CheckCircle2 aria-hidden className="size-3.5" />{t("storedOnDevice")}</span> : null}
      </div>
      {document.verification.note ? <p className="flex gap-2 rounded-xl bg-brick-tint p-3 text-xs leading-5 text-brick"><AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0" />{document.verification.note}</p> : null}
      {message ? <p className="flex items-center gap-2 text-xs font-bold text-green-deep"><CheckCircle2 aria-hidden className="size-4" />{message} <SimulatedChip authority="Protean eGov (PAN)" /></p> : null}
      {error ? <p className="rounded-xl bg-brick-tint p-3 text-xs font-bold text-brick" role="alert">{error}</p> : null}
      <div className="mt-auto grid gap-2">
        {document.verification.state === "mismatch" ? <Button loading={loading} onClick={() => void reconcile()}><ShieldCheck aria-hidden className="size-4" />{t("resolveMismatch")}</Button> : null}
        <Button disabled={document.attrs.downloaded} onClick={download} variant="secondary"><Download aria-hidden className="size-4" />{document.attrs.downloaded ? t("storedOnDevice") : "Save offline"}</Button>
        <details className="border-t border-paper-line pt-2">
          <summary className="flex min-h-9 items-center justify-between text-xs font-bold text-ink-mute"><span>{t("why")}</span><span className="text-green-deep">+</span></summary>
          <p className="pb-2 text-xs leading-5 text-ink-mute">Verified by {document.verification.source} on {formatDate(document.verification.asOf)}. Citizen uses this document only when a procedure requires it.</p>
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
      <PageHeader eyebrow={`${documents.length} records`} title={t("documents")} description="Verified identity, vehicle, property, and business records available from this browser." />
      <label className="relative block max-w-xl">
        <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
        <input className="h-13 w-full rounded-[8px] border border-paper-line bg-paper-shade pl-11 pr-4 text-sm outline-none transition focus:border-green-deep focus:ring-4 focus:ring-green-deep/10" onChange={(event) => setQuery(event.target.value)} placeholder={t("searchDocuments")} type="search" value={query} />
      </label>
      {visible.length ? (
        <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", visible.length === 1 && "max-w-md")}>
          {visible.map((document) => <DocumentCard document={document} key={document.id} personId={personId} />)}
        </div>
      ) : <EmptyState title="No matching documents" body="Try a document type, holder name or masked number." />}
    </Page>
  );
}
