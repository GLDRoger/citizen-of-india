import type { MonumentName } from "@/components/ui/monuments";

/** Architectural decoration, not a claim about the service's jurisdiction. */
const procedureMonuments: Readonly<Record<string, MonumentName>> = {
  "epfo-grievance": "howrah-bridge",
  "marriage-arjun-priya": "taj-mahal",
  "record-correction": "hawa-mahal",
  "echallan-payment": "gateway-of-india",
  "property-tax-payment": "mysore-palace",
  "gstr3b-filing": "konark-wheel",
  "passport-renewal": "india-gate",
  "refund-track": "sanchi-stupa",
  "business-loan": "meenakshi-gopuram",
  "start-business": "qutub-minar",
  "benefit-application": "gateway-of-india",
  "rti-request": "sanchi-stupa",
  grievance: "vidhana-soudha",
};

export function getProcedureMonument(procedureId: string): MonumentName {
  return procedureMonuments[procedureId] ?? "vidhana-soudha";
}
