import type { ExplainResponse } from "./schema";
import type { Language } from "@/i18n/messages";

const explanations: Record<Language, Record<"safe" | "scam", Omit<ExplainResponse, "simulated" | "authority">>> = {
  en: {
    safe: { plainLanguage: "This status update matches a record already connected to your profile.", whatItMeans: "The sender, subject, and linked record are consistent with the interactions shown in Citizen.", nextAction: "Review the linked record. Respond only if Citizen shows a deadline or required action." },
    scam: { plainLanguage: "This message is trying to frighten you into opening an unsafe link.", whatItMeans: "The sender and domain do not match the tax interactions shown in your inbox.", nextAction: "Do not click or call. Keep the message as evidence and start a cybercrime draft if you shared information." },
  },
  hi: {
    safe: { plainLanguage: "यह स्थिति अपडेट आपकी प्रोफ़ाइल से जुड़े रिकॉर्ड से मेल खाता है।", whatItMeans: "भेजने वाला, विषय और जुड़ा रिकॉर्ड Citizen में दिख रही जानकारी के अनुरूप हैं।", nextAction: "जुड़ा रिकॉर्ड देखें। केवल तभी जवाब दें जब Citizen कोई समय-सीमा या ज़रूरी काम दिखाए।" },
    scam: { plainLanguage: "यह संदेश डर दिखाकर आपसे असुरक्षित लिंक खुलवाने की कोशिश कर रहा है।", whatItMeans: "भेजने वाला और डोमेन आपके इनबॉक्स में दिख रही कर-संबंधी जानकारी से मेल नहीं खाते।", nextAction: "लिंक न खोलें और नंबर पर कॉल न करें। संदेश सुरक्षित रखें और जानकारी साझा की हो तो साइबर अपराध रिपोर्ट का ड्राफ्ट बनाएँ।" },
  },
  kn: {
    safe: { plainLanguage: "ಈ ಸ್ಥಿತಿ ಮಾಹಿತಿ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಈಗಾಗಲೇ ಸಂಪರ್ಕಿಸಿರುವ ದಾಖಲೆಗೆ ಹೊಂದುತ್ತದೆ.", whatItMeans: "ಕಳುಹಿಸಿದವರು, ವಿಷಯ ಮತ್ತು ಸಂಪರ್ಕಿತ ದಾಖಲೆ Citizen‌ನಲ್ಲಿ ಕಾಣುವ ಮಾಹಿತಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ.", nextAction: "ಸಂಪರ್ಕಿತ ದಾಖಲೆಯನ್ನು ಪರಿಶೀಲಿಸಿ. Citizen ಗಡುವು ಅಥವಾ ಅಗತ್ಯ ಕ್ರಮ ತೋರಿಸಿದಾಗ ಮಾತ್ರ ಪ್ರತಿಕ್ರಿಯಿಸಿ." },
    scam: { plainLanguage: "ಈ ಸಂದೇಶ ಭಯ ಹುಟ್ಟಿಸಿ ಅಸುರಕ್ಷಿತ ಲಿಂಕ್ ತೆರೆಯುವಂತೆ ಮಾಡಲು ಪ್ರಯತ್ನಿಸುತ್ತಿದೆ.", whatItMeans: "ಕಳುಹಿಸಿದವರು ಮತ್ತು ಡೊಮೇನ್ ನಿಮ್ಮ ಇನ್‌ಬಾಕ್ಸ್‌ನ ತೆರಿಗೆ ಸಂಬಂಧಿತ ಮಾಹಿತಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.", nextAction: "ಲಿಂಕ್ ತೆರೆಯಬೇಡಿ ಅಥವಾ ಕರೆ ಮಾಡಬೇಡಿ. ಸಂದೇಶವನ್ನು ಸಾಕ್ಷಿಯಾಗಿ ಉಳಿಸಿ; ಮಾಹಿತಿ ಹಂಚಿದ್ದರೆ ಸೈಬರ್ ಅಪರಾಧ ವರದಿಯ ಕರಡು ಸಿದ್ಧಪಡಿಸಿ." },
  },
};

export function createFallbackExplanation(legitimacy: "legitimate" | "scam" | "unknown", language: Language): ExplainResponse {
  const content = explanations[language][legitimacy === "scam" ? "scam" : "safe"];
  return { ...content, simulated: true, authority: legitimacy === "scam" ? "Citizen safety analysis" : "Citizen notice explainer" };
}
