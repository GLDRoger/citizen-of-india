import type { MessageKey } from "@/i18n/messages";

/**
 * The whole brain of "Ask Citizen": keyword matching over the landing FAQ and
 * the journey list. Deterministic on purpose; the widget says it is scripted.
 * Aliases are lowercase and cover English, Hindi and Kannada, so one table
 * serves every language the dictionary knows.
 */
export type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

export interface Answer { answer: string; href?: string; hrefLabel?: string }

interface Topic { aliases: string[]; answer: MessageKey }

const faqTopics: Topic[] = [
  { answer: "landingFaqOneA", aliases: ["state", "states", "portal", "portals", "integrate", "integration", "different", "राज्य", "राज्यों", "पोर्टल", "अलग", "ರಾಜ್ಯ", "ರಾಜ್ಯಗಳು", "ರಾಜ್ಯಕ್ಕೂ", "ಪೋರ್ಟಲ್", "ಬೇರೆ"] },
  { answer: "landingFaqTwoA", aliases: ["umang", "digilocker", "again", "just", "locker", "directory", "फिर", "ಮತ್ತೆ"] },
  { answer: "landingFaqThreeA", aliases: ["government", "startup", "private", "why", "neutral", "neutrality", "सरकार", "स्टार्टअप", "क्यों", "ಸರಕಾರ", "ಸ್ಟಾರ್ಟ್‌ಅಪ್", "ಏಕೆ"] },
  { answer: "landingFaqFourA", aliases: ["privacy", "danger", "dangerous", "data", "safe", "safety", "consent", "surveillance", "निजता", "ख़तरनाक", "खतरनाक", "डेटा", "ಗೌಪ್ಯತೆ", "ಅಪಾಯ", "ಡೇಟಾ"] },
  { answer: "landingFaqFiveA", aliases: ["wrong", "mistake", "department", "error", "correction", "dispute", "गलती", "विभाग", "ತಪ್ಪು", "ಇಲಾಖೆ"] },
  { answer: "landingFaqSixA", aliases: ["big", "build", "scale", "realistic", "ambitious", "बड़ा", "बनाने", "ದೊಡ್ಡ", "ಕಟ್ಟಲು"] },
  { answer: "landingFaqEightA", aliases: ["village", "villages", "town", "towns", "tier", "tier-3", "tier 3", "rural", "smartphone", "elderly", "grandmother", "grandfather", "parents", "mother", "literate", "illiterate", "blo", "booth", "csc", "assisted", "helper", "family", "delegation", "behalf", "गाँव", "गांव", "कस्बा", "बुज़ुर्ग", "दादी", "माँ", "परिवार", "ಹಳ್ಳಿ", "ಊರು", "ಅಜ್ಜಿ", "ಕುಟುಂಬ", "ಹಿರಿಯರು"] },
  { answer: "landingFaqSevenA", aliases: ["real", "fake", "actual", "simulated", "mock", "mocked", "prototype", "असली", "नकली", "ನಿಜ", "ನಿಜವೇ", "ಅನುಕರಣೆ"] },
];

const journeyTopics: Topic[] = [
  { answer: "marriageService", aliases: ["marriage", "marry", "married", "wedding", "shaadi", "shadi", "विवाह", "शादी", "ಮದುವೆ", "ವಿವಾಹ"] },
  { answer: "challanWorkflowTitle", aliases: ["challan", "challans", "fine", "fines", "traffic", "चालान", "जुर्माना", "ಚಲನ್", "ದಂಡ"] },
  { answer: "epfoService", aliases: ["epf", "pf", "epfo", "passbook", "provident", "पीएफ", "ಪಿಎಫ್"] },
  { answer: "loanService", aliases: ["loan", "loans", "mudra", "borrow", "ऋण", "लोन", "ಸಾಲ"] },
  { answer: "recordCorrectionService", aliases: ["pan", "mismatch", "name", "spelling", "पैन", "नाम", "ಪ್ಯಾನ್", "ಹೆಸರು"] },
  { answer: "startBusinessService", aliases: ["business", "udyam", "gst", "gstr", "shop", "व्यवसाय", "व्यापार", "ವ್ಯವಹಾರ", "ಉದ್ಯಮ"] },
  { answer: "payPropertyTax", aliases: ["property", "tax", "bbmp", "house", "संपत्ति", "ಆಸ್ತಿ", "ತೆರಿಗೆ"] },
  { answer: "passportWorkflowTitle", aliases: ["passport", "renewal", "पासपोर्ट", "ಪಾಸ್‌ಪೋರ್ಟ್"] },
  { answer: "trackRefund", aliases: ["refund", "refunds", "रिफ़ंड", "रिफंड", "ಮರುಪಾವತಿ"] },
  { answer: "rtiService", aliases: ["rti", "information", "आरटीआई", "सूचना", "ಮಾಹಿತಿ"] },
  { answer: "grievanceService", aliases: ["grievance", "grievances", "complaint", "complain", "cpgrams", "redress", "escalate", "appeal", "शिकायत", "ದೂರು", "ಮೇಲ್ಮನವಿ"] },
];

const journeyListAliases = ["journey", "journeys", "workflow", "workflows", "demo", "try", "work", "works", "सफ़र", "सफर", "ಪ್ರಯಾಣ", "ಪ್ರಯಾಣಗಳು"];

function tokenize(text: string) { return text.toLowerCase().split(/[^\p{L}\p{M}\p{N}\u200c\u200d]+/u).filter(Boolean); }

function score(tokens: string[], aliases: string[]) { return tokens.reduce((hits, token) => hits + (aliases.includes(token) ? 1 : 0), 0); }

function best(tokens: string[], topics: Topic[]) {
  let winner: Topic | undefined;
  let top = 0;
  for (const topic of topics) {
    const hits = score(tokens, topic.aliases);
    if (hits > top) { top = hits; winner = topic; }
  }
  return winner;
}

/** Picks the FAQ or journey that shares the most words with the question; otherwise points at the About ledger. */
export function answerQuestion(text: string, t: Translate): Answer {
  const tokens = tokenize(text);
  const faq = best(tokens, faqTopics);
  if (faq) return { answer: t(faq.answer) };
  const journey = best(tokens, journeyTopics);
  if (journey) return { answer: t("askJourney", { journey: t(journey.answer) }), href: "/start", hrefLabel: t("askTryDemo") };
  if (score(tokens, journeyListAliases) > 0) {
    const journeys = journeyTopics.map((topic) => t(topic.answer)).join(", ");
    return { answer: t("askJourneys", { journeys }), href: "/start", hrefLabel: t("askTryDemo") };
  }
  return { answer: t("askFallback"), href: "/about", hrefLabel: t("about") };
}
