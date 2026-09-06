"use client";

import type { GraphNode, Verification } from "@/features/graph/schema";
import { useI18n } from "@/i18n/use-i18n";
import { formatDate } from "@/lib/format";

type Person = Extract<GraphNode, { type: "person" }>;
type DocumentNode = Extract<GraphNode, { type: "document" }>;

export interface ConsentField {
  labelKey: "consentFieldName" | "fieldDob" | "fieldAadhaar" | "fieldAddress" | "fieldMarital";
  value: string;
  verification: Verification;
}

export function marriageConsentFields(person: Person, aadhaar: DocumentNode | undefined, address: string): ConsentField[] {
  const source = aadhaar?.verification ?? person.verification;
  return [
    { labelKey: "consentFieldName", value: person.attrs.name, verification: source },
    { labelKey: "fieldDob", value: person.attrs.dob, verification: source },
    { labelKey: "fieldAadhaar", value: aadhaar?.attrs.numberMasked ?? "—", verification: source },
    { labelKey: "fieldAddress", value: address, verification: person.verification },
    { labelKey: "fieldMarital", value: person.attrs.maritalStatus, verification: person.verification },
  ];
}

/**
 * Consent as a packet you can read before you sign: every field, where it
 * comes from and how fresh it is, the purpose, the recipient, the expiry and
 * how to withdraw. The receipt lands in Documents and on the Timeline.
 */
export function ConsentPacket({ fields, purpose, recipient, expiry, sharer }: { fields: ConsentField[]; purpose: string; recipient: string; expiry: string; sharer: string }) {
  const { language, t } = useI18n();
  return (
    <div className="grid gap-4 rounded-[3px] border border-indigo/25 bg-paper p-4 sm:p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-indigo-deep">{t("consentTitle", { name: sharer })}</p>
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-extrabold uppercase tracking-[0.1em] text-ink-mute"><tr><th className="pb-2 font-extrabold">{t("consentField")}</th><th className="pb-2 font-extrabold">{t("consentSource")}</th><th className="hidden pb-2 font-extrabold sm:table-cell">{t("consentChecked")}</th></tr></thead>
        <tbody className="divide-y divide-paper-line border-y border-paper-line">
          {fields.map((field) => (
            <tr key={field.labelKey}>
              <td className="py-2 pr-3"><span className="block font-semibold text-ink">{t(field.labelKey)}</span><span className="text-xs text-ink-mute">{field.value}</span></td>
              <td className="py-2 pr-3 text-ink-mute">{field.verification.source}<span className="block text-xs sm:hidden">{formatDate(field.verification.asOf, language)}</span></td>
              <td className="hidden py-2 text-ink-mute sm:table-cell">{formatDate(field.verification.asOf, language)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <div className="grid gap-0.5"><dt className="text-xs font-extrabold uppercase tracking-[0.1em] text-ink-mute">{t("consentPurpose")}</dt><dd className="font-semibold text-ink">{purpose}</dd></div>
        <div className="grid gap-0.5"><dt className="text-xs font-extrabold uppercase tracking-[0.1em] text-ink-mute">{t("consentRecipient")}</dt><dd className="font-semibold text-ink">{recipient}</dd></div>
        <div className="grid gap-0.5"><dt className="text-xs font-extrabold uppercase tracking-[0.1em] text-ink-mute">{t("consentExpiry")}</dt><dd className="font-semibold text-ink">{expiry}</dd></div>
      </dl>
      <p className="border-t border-paper-line pt-3 text-xs leading-5 text-ink-mute"><strong className="text-ink">{t("consentWithdraw")}:</strong> {t("consentWithdrawBody")} {t("consentReceiptNote")}</p>
    </div>
  );
}
