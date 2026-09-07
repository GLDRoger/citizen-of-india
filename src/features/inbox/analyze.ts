import type { Language } from "@/i18n/messages";
import { createFallbackExplanation } from "./fallback";
import type { CitizenGraph } from "@/features/graph/schema";
import { getNotices } from "@/features/graph/selectors";

export type NoticeAction = "action" | "no-action" | "uncertain";

export interface NoticeAnalysis {
  match: "supported" | "unknown";
  sampleId?: string;
  plainLanguage?: string;
  whatItMeans?: string;
  nextAction?: string;
  authority?: string;
  issuer?: string;
  reference?: string;
  amount?: number;
  deadline?: string;
  consequence?: string;
  relatedRecordId?: string;
  workflowHref?: string;
  action: NoticeAction;
}

export interface NoticeSample {
  id: string;
  subject: string;
  text: Record<Language, string>;
}

export const noticeSamples: NoticeSample[] = [
  {
    id: "ntc:echallan",
    subject: "Traffic e-challan",
    text: {
      en: "e-Challan KA05-2026-0812445 of Rs 500 issued against KA05MJ4821 for signal jump at Hosur Road on 02-08-2026. Pay by 01-09-2026.",
      hi: "KA05MJ4821 से 02-08-2026 को होसूर रोड पर सिग्नल तोड़ने के लिए ₹500 का ई-चालान KA05-2026-0812445 जारी हुआ। 01-09-2026 तक भुगतान करें।",
      kn: "KA05MJ4821 ವಾಹನವು 02-08-2026ರಂದು ಹೊಸೂರು ರಸ್ತೆಯಲ್ಲಿ ಸಿಗ್ನಲ್ ಉಲ್ಲಂಘಿಸಿದ ಕಾರಣ ₹500ರ ಇ-ದಂಡ KA05-2026-0812445 ನೀಡಲಾಗಿದೆ. 01-09-2026ರೊಳಗೆ ಪಾವತಿಸಿ.",
    },
  },
  {
    id: "ntc:epfo-passbook",
    subject: "EPF contribution",
    text: {
      en: "Dear member, contribution of Rs 21,600 for Jul-2026 credited to UAN XXXXXX7890. Balance: Rs 3,40,000.",
      hi: "प्रिय सदस्य, जुलाई 2026 का ₹21,600 अंशदान UAN XXXXXX7890 में जमा हुआ। शेष राशि: ₹3,40,000।",
      kn: "ಮಾನ್ಯ ಸದಸ್ಯರೇ, ಜುಲೈ 2026ರ ₹21,600 ವಂತಿಗೆ UAN XXXXXX7890ಗೆ ಜಮೆಯಾಗಿದೆ. ಉಳಿಕೆ: ₹3,40,000.",
    },
  },
  {
    id: "ntc:itr-refund",
    subject: "Income-tax refund",
    text: {
      en: "Dear Taxpayer, your refund for AY 2026-27 of INR 12,400 has been initiated and will be credited to your validated bank account ending 0042.",
      hi: "प्रिय करदाता, आकलन वर्ष 2026-27 के लिए ₹12,400 का रिफ़ंड शुरू हो गया है। यह सत्यापित बैंक खाते के अंतिम अंक 0042 में जमा होगा।",
      kn: "ಮಾನ್ಯ ತೆರಿಗೆದಾರರೇ, ಮೌಲ್ಯಮಾಪನ ವರ್ಷ 2026-27ರ ₹12,400 ಮರುಪಾವತಿ ಪ್ರಾರಂಭವಾಗಿದೆ. ಇದು 0042ರಲ್ಲಿ ಕೊನೆಗೊಳ್ಳುವ ಪರಿಶೀಲಿತ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆಯಾಗುತ್ತದೆ.",
    },
  },
];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function extractAmount(text: string) {
  const match = text.replaceAll(",", "").match(/(?:₹|rs\.?|inr)\s*(\d+)/i);
  return match ? Number(match[1]) : undefined;
}

function extractReference(text: string) {
  return text.match(/\b[A-Z]{2,}[A-Z0-9-]*-\d{4}-\d{4,}\b/i)?.[0]?.toUpperCase();
}

function extractDeadline(text: string) {
  const match = text.match(/(?:pay by|before|until|तक|ಒಳಗೆ)\s*(\d{2})[-/.](\d{2})[-/.](\d{4})/i);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : undefined;
}

function supportedMatch(text: string) {
  const normalized = normalize(text);
  const scores = [
    { id: "ntc:echallan", tokens: ["challan", "traffic", "signal", "ka05", "hosur", "ई चालान", "ईदंड"] },
    { id: "ntc:epfo-passbook", tokens: ["epfo", "epf", "uan", "passbook", "contribution", "अंशदान", "ಪಾಸ್‌ಬುಕ್"] },
    { id: "ntc:itr-refund", tokens: ["refund", "taxpayer", "income", "ay 2026 27", "12 400", "रिफ़ंड", "ಮರುಪಾವತಿ"] },
  ].map((candidate) => ({ ...candidate, score: candidate.tokens.filter((token) => normalized.includes(token)).length }));
  return scores.sort((first, second) => second.score - first.score).find((candidate) => candidate.score >= 2);
}

export function analyzeNotice(text: string, graph: CitizenGraph, personId: string, language: Language): NoticeAnalysis {
  const match = supportedMatch(text);
  if (!match) return { match: "unknown", action: "uncertain" };

  const notice = graph.nodes.find((node) => node.id === match.id && node.type === "notice");
  if (!notice || notice.type !== "notice" || !getNotices(graph, personId).some((candidate) => candidate.node.id === match.id)) return { match: "unknown", action: "uncertain" };
  const explanation = createFallbackExplanation(match.id, language);
  const amount = extractAmount(text);
  const reference = extractReference(text);
  const deadline = match.id === "ntc:echallan" ? extractDeadline(text) : undefined;
  const linkedObligation = notice.attrs.relatedTo
    ? graph.nodes.find((node) => node.id === notice.attrs.relatedTo && node.type === "obligation")
    : undefined;

  return {
    match: "supported",
    sampleId: match.id,
    plainLanguage: explanation.plainLanguage,
    whatItMeans: explanation.whatItMeans,
    nextAction: explanation.nextAction,
    authority: match.id === "ntc:echallan" ? "Bengaluru Traffic Police" : match.id === "ntc:epfo-passbook" ? "EPFO" : "Income Tax Department",
    issuer: notice.attrs.sender,
    reference,
    amount,
    deadline,
    consequence: linkedObligation?.type === "obligation" ? linkedObligation.attrs.consequence : undefined,
    relatedRecordId: notice.attrs.relatedTo,
    workflowHref: match.id === "ntc:echallan" ? "/workflows/obligations" : match.id === "ntc:epfo-passbook" ? "/workflows/epfo" : "/workflows/refund-track",
    action: match.id === "ntc:itr-refund" ? "no-action" : "action",
  };
}
