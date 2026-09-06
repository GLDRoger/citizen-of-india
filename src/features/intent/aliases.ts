import type { RoutableIntent } from "./schema";

/**
 * Every way a citizen might name a service, in English, Hindi, Kannada and
 * the Hinglish people actually type. One list per route; the composer matches
 * these live as the person types and the local planner uses them first.
 * Longer aliases are more specific and score higher, so "tax refund" beats
 * "tax" and "property tax" beats "property".
 */
export const serviceAliases: Record<RoutableIntent, readonly string[]> = {
  marriage: ["marriage", "marry", "married", "wedding", "shaadi", "shadi", "vivah", "spouse", "partner", "husband", "wife", "शादी", "विवाह", "पति", "पत्नी", "ವಿವಾಹ", "ಮದುವೆ", "ಗಂಡ", "ಹೆಂಡತಿ"],
  epfo: ["epfo", "epf", "pf", "provident fund", "uan", "pf balance", "passbook", "employer contribution", "पीएफ", "ईपीएफ", "ईपीएफओ", "यूएएन", "भविष्य निधि", "पासबुक", "ಪಿಎಫ್", "ಇಪಿಎಫ್", "ಇಪಿಎಫ್‌ಒ", "ಯುಎಎನ್", "ಭವಿಷ್ಯ ನಿಧಿ", "ಪಾಸ್‌ಬುಕ್"],
  gstr3b: ["gstr", "gstr-3b", "gstr3b", "gst return", "file gst", "gst filing", "gstin", "जीएसटी", "जीएसटीआर", "ಜಿಎಸ್‌ಟಿ", "ಜಿಎಸ್‌ಟಿಆರ್"],
  "property-tax": ["property tax", "property", "bbmp tax", "bbmp", "khata", "house tax", "संपत्ति कर", "संपत्ति", "प्रॉपर्टी टैक्स", "प्रॉपर्टी", "मकान कर", "ಆಸ್ತಿ ತೆರಿಗೆ", "ಆಸ್ತಿ", "ಖಾತಾ"],
  "passport-renewal": ["passport", "passport renewal", "renew passport", "passport expiry", "visa", "पासपोर्ट", "ಪಾಸ್‌ಪೋರ್ಟ್"],
  "refund-track": ["tax refund", "refund", "itr refund", "income tax refund", "refund status", "track refund", "रिफंड", "रिफ़ंड", "कर वापसी", "ಮರುಪಾವತಿ", "ತೆರಿಗೆ ಮರುಪಾವತಿ"],
  "benefit-application": ["benefit", "benefits", "scheme", "schemes", "yojana", "pmsby", "suraksha bima", "insurance", "eligible", "eligibility", "welfare", "pension", "योजना", "पात्रता", "बीमा", "सुरक्षा बीमा", "पेंशन", "ಯೋಜನೆ", "ಅರ್ಹತೆ", "ವಿಮೆ", "ಸುರಕ್ಷಾ ವಿಮೆ", "ಪಿಂಚಣಿ"],
  profile: ["my records", "my record", "my profile", "profile", "family", "relatives", "my details", "मेरे रिकॉर्ड", "मेरी प्रोफ़ाइल", "प्रोफ़ाइल", "परिवार", "ನನ್ನ ದಾಖಲೆ", "ನನ್ನ ಪ್ರೊಫೈಲ್", "ಕುಟುಂಬ"],
  documents: ["documents", "document", "digilocker", "aadhaar", "aadhar", "driving licence", "driving license", "licence", "rc", "certificate", "दस्तावेज", "दस्तावेज़", "डिजिलॉकर", "आधार", "लाइसेंस", "ದಾಖಲೆಗಳು", "ದಾಖಲೆ", "ಡಿಜಿಲಾಕರ್", "ಆಧಾರ್", "ಪರವಾನಗಿ"],
  loan: ["loan", "loans", "mudra", "credit", "business loan", "emi", "borrow", "कर्ज", "क़र्ज़", "लोन", "ऋण", "मुद्रा", "ಸಾಲ", "ಮುದ್ರಾ"],
  "record-correction": ["pan", "pan card", "pan name", "name mismatch", "wrong name", "name wrong", "record mismatch", "correct name", "correct my name", "fix name", "spelling", "पैन", "नाम गलत", "नाम सुधार", "नाम ठीक", "ಪ್ಯಾನ್", "ಹೆಸರು ತಪ್ಪು", "ಹೆಸರು ತಿದ್ದು", "ಹೆಸರು ಸರಿ"],
  "start-business": ["start a business", "start business", "new business", "business", "business plan", "udyam", "msme", "shop", "startup", "register business", "company", "start a", "start my", "open a", "bakery", "cafe", "restaurant", "store", "kirana", "व्यवसाय", "बिज़नेस", "बिजनेस", "दुकान", "उद्यम", "ವ್ಯವಹಾರ", "ಉದ್ಯಮ", "ಅಂಗಡಿ"],
  rti: ["rti", "an rti", "file rti", "file an rti", "rti about", "rti for", "under rti", "right to information", "information request", "rti application", "ask for information", "सूचना का अधिकार", "आरटीआई", "सूचना माँग", "ಮಾಹಿತಿ ಹಕ್ಕು", "ಆರ್‌ಟಿಐ", "ಮಾಹಿತಿ ಕೇಳ"],
  grievance: ["grievance", "complaint", "complain", "cpgrams", "redress", "escalate", "nobody is responding", "no response", "not resolved", "shikayat", "शिकायत", "कोई जवाब नहीं", "ದೂರು", "ಉತ್ತರವಿಲ್ಲ"],
  obligations: ["challan", "e-challan", "fine", "traffic", "deadline", "deadlines", "due", "dues", "payment", "payments", "pay", "obligation", "tax", "what do i owe", "जुर्माना", "चालान", "भुगतान", "बकाया", "देय", "समय-सीमा", "टैक्स", "कर", "ದಂಡ", "ಚಲನ್", "ಪಾವತಿ", "ಬಾಕಿ", "ಗಡುವು", "ತೆರಿಗೆ"],
};

export interface ServiceMatch {
  route: RoutableIntent;
  score: number;
}

const wordBoundary = /[\s,.!?;:/()\-]+/u;

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/gu, " ").trim();
}

/**
 * Rank routes by how strongly the text names them. Whole-alias hits score by
 * alias length (specific beats generic); a trailing partial word that starts
 * an alias scores a little, so "passp" already surfaces the passport journey.
 */
export function rankServices(text: string, available: readonly RoutableIntent[]): ServiceMatch[] {
  const normalized = normalize(text);
  if (normalized.length < 2) return [];
  const tokens = normalized.split(wordBoundary).filter(Boolean);
  const tail = tokens.at(-1) ?? "";
  const partial = tail.length >= 3 && !text.endsWith(" ") ? tail : "";
  const matches: ServiceMatch[] = [];
  for (const route of available) {
    let score = 0;
    for (const alias of serviceAliases[route]) {
      if (alias.length <= 2 ? tokens.includes(alias) : normalized.includes(alias)) score += alias.length + 2;
      else if (partial && alias.startsWith(partial)) score += 1;
    }
    if (score > 0) matches.push({ route, score });
  }
  return matches.sort((a, b) => b.score - a.score);
}
