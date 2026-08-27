import type { ExplainResponse } from "./schema";
import type { Language } from "@/i18n/messages";

type Explanation = Omit<ExplainResponse, "simulated" | "authority">;

const explanations: Record<Language, Record<string, Explanation>> = {
  en: {
    "ntc:itr-refund": { plainLanguage: "Your ₹12,400 tax refund is on its way.", whatItMeans: "It will go to the bank account ending 0042. It should arrive within four to six weeks.", nextAction: "No action now. Check again after six weeks." },
    "ntc:epfo-passbook": { plainLanguage: "₹21,600 was added to your EPF account for July.", whatItMeans: "UAN XXXXXX7890 now shows a balance of ₹3,40,000.", nextAction: "Check only if the amount differs from your passbook." },
    "ntc:echallan": { plainLanguage: "A ₹500 traffic challan was issued for Arjun's Activa.", whatItMeans: "It is for vehicle KA05MJ4821 and is due on 1 September 2026.", nextAction: "Review the challan before paying in the demo." },
  },
  hi: {
    "ntc:itr-refund": { plainLanguage: "आपका ₹12,400 का टैक्स रिफ़ंड भेजा जा रहा है।", whatItMeans: "यह 0042 पर समाप्त होने वाले बैंक खाते में आएगा। इसमें चार से छह सप्ताह लग सकते हैं।", nextAction: "अभी कुछ करने की ज़रूरत नहीं है। छह सप्ताह बाद फिर जाँचें।" },
    "ntc:epfo-passbook": { plainLanguage: "जुलाई के लिए ₹21,600 आपके EPF खाते में जमा हुए।", whatItMeans: "UAN XXXXXX7890 में अब ₹3,40,000 शेष हैं।", nextAction: "पासबुक में राशि अलग हो तभी जाँच करें।" },
    "ntc:echallan": { plainLanguage: "अर्जुन की Activa पर ₹500 का ट्रैफ़िक चालान जारी हुआ।", whatItMeans: "यह KA05MJ4821 के लिए है और 1 सितंबर 2026 तक भरना है।", nextAction: "डेमो में भुगतान करने से पहले चालान जाँचें।" },
  },
  kn: {
    "ntc:itr-refund": { plainLanguage: "ನಿಮ್ಮ ₹12,400 ತೆರಿಗೆ ಮರುಪಾವತಿ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ.", whatItMeans: "ಇದು 0042ರಲ್ಲಿ ಕೊನೆಗೊಳ್ಳುವ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಬರುತ್ತದೆ. ನಾಲ್ಕರಿಂದ ಆರು ವಾರ ಬೇಕಾಗಬಹುದು.", nextAction: "ಈಗ ಏನೂ ಮಾಡಬೇಕಿಲ್ಲ. ಆರು ವಾರಗಳ ನಂತರ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ." },
    "ntc:epfo-passbook": { plainLanguage: "ಜುಲೈಗೆ ₹21,600 ನಿಮ್ಮ EPF ಖಾತೆಗೆ ಜಮೆಯಾಗಿದೆ.", whatItMeans: "UAN XXXXXX7890 ಈಗ ₹3,40,000 ಉಳಿಕೆ ತೋರಿಸುತ್ತದೆ.", nextAction: "ಪಾಸ್‌ಬುಕ್‌ನ ಮೊತ್ತ ಬೇರೆ ಇದ್ದರೆ ಮಾತ್ರ ಪರಿಶೀಲಿಸಿ." },
    "ntc:echallan": { plainLanguage: "ಅರ್ಜುನ್ ಅವರ Activaಗೆ ₹500 ಸಂಚಾರ ದಂಡ ನೀಡಲಾಗಿದೆ.", whatItMeans: "ಇದು KA05MJ4821 ವಾಹನಕ್ಕೆ ಸೇರಿದ್ದು 1 ಸೆಪ್ಟೆಂಬರ್ 2026ರೊಳಗೆ ಪಾವತಿಸಬೇಕು.", nextAction: "ಡೆಮೊದಲ್ಲಿ ಪಾವತಿಸುವ ಮೊದಲು ದಂಡವನ್ನು ಪರಿಶೀಲಿಸಿ." },
  },
};

export function createFallbackExplanation(noticeId: string, language: Language): ExplainResponse {
  const explanation = explanations[language][noticeId];
  if (!explanation) throw new Error(`No local explanation exists for notice ${noticeId}.`);
  return { ...explanation, simulated: true, authority: "Notice guide" };
}
