import type { ScamCheckResponse } from "./scam-schema";
import type { Language } from "@/i18n/messages";

function hasUntrustedLink(message: string) {
  const candidates = message.match(/https?:\/\/[^\s<>"']+/gi) ?? [];
  return candidates.some((candidate) => {
    try {
      const url = new URL(candidate.replace(/[),.;!?]+$/, ""));
      const trustedGovernmentHost = url.hostname === "gov.in" || url.hostname.endsWith(".gov.in");
      return url.protocol !== "https:" || !trustedGovernmentHost;
    } catch {
      return true;
    }
  });
}

const copy: Record<Language, {
  unsafeLink: string;
  safeLink: string;
  urgent: string;
  calm: string;
  callback: string;
  noCallback: string;
  suspicious: string;
  unclear: string;
  actions: string[];
}> = {
  en: {
    unsafeLink: "The link is not a secure .gov.in address.", safeLink: "No untrusted web address was detected.", urgent: "The message uses urgency or a threat to force action.", calm: "The message does not use a strong urgency pattern.", callback: "The callback appears to be a personal mobile number.", noCallback: "No personal callback number was found.", suspicious: "This message shows common impersonation and phishing patterns.", unclear: "Citizen cannot verify this message from the text alone.", actions: ["Do not open the link or call the number in the message.", "Verify through a known official website or app.", "Keep a screenshot if you shared information or money."],
  },
  hi: {
    unsafeLink: "यह लिंक सुरक्षित .gov.in पते पर नहीं जाता।", safeLink: "कोई अविश्वसनीय वेब पता नहीं मिला।", urgent: "संदेश तुरंत कार्रवाई कराने के लिए धमकी या जल्दबाज़ी का दबाव बनाता है।", calm: "संदेश में तेज़ दबाव वाला तरीका नहीं मिला।", callback: "वापस कॉल करने के लिए निजी मोबाइल नंबर दिया गया है।", noCallback: "कोई निजी कॉलबैक नंबर नहीं मिला।", suspicious: "इस संदेश में पहचान की नकल और फ़िशिंग के सामान्य संकेत हैं।", unclear: "सिर्फ़ संदेश के आधार पर Citizen इसकी पुष्टि नहीं कर सकता।", actions: ["लिंक न खोलें और संदेश में दिए नंबर पर कॉल न करें।", "किसी ज्ञात आधिकारिक वेबसाइट या ऐप से पुष्टि करें।", "जानकारी या पैसे साझा किए हों तो स्क्रीनशॉट सुरक्षित रखें।"],
  },
  kn: {
    unsafeLink: "ಈ ಲಿಂಕ್ ಸುರಕ್ಷಿತ .gov.in ವಿಳಾಸಕ್ಕೆ ಹೋಗುವುದಿಲ್ಲ.", safeLink: "ನಂಬಿಕೆಗೆ ಅರ್ಹವಲ್ಲದ ವೆಬ್ ವಿಳಾಸ ಕಂಡುಬಂದಿಲ್ಲ.", urgent: "ತಕ್ಷಣ ಕ್ರಮ ಕೈಗೊಳ್ಳುವಂತೆ ಸಂದೇಶವು ಒತ್ತಡ ಅಥವಾ ಬೆದರಿಕೆ ಬಳಸುತ್ತದೆ.", calm: "ಸಂದೇಶದಲ್ಲಿ ತೀವ್ರ ತುರ್ತು ಒತ್ತಡ ಕಂಡುಬಂದಿಲ್ಲ.", callback: "ಮರಳಿ ಕರೆ ಮಾಡಲು ವೈಯಕ್ತಿಕ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನೀಡಲಾಗಿದೆ.", noCallback: "ವೈಯಕ್ತಿಕ ಮರಳಿ ಕರೆ ಸಂಖ್ಯೆ ಕಂಡುಬಂದಿಲ್ಲ.", suspicious: "ಈ ಸಂದೇಶದಲ್ಲಿ ಸೋಗು ಹಾಕುವಿಕೆ ಮತ್ತು ಫಿಶಿಂಗ್‌ನ ಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳಿವೆ.", unclear: "ಸಂದೇಶದ ಪಠ್ಯದಿಂದ ಮಾತ್ರ Citizen ಇದನ್ನು ಖಚಿತಪಡಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.", actions: ["ಲಿಂಕ್ ತೆರೆಯಬೇಡಿ ಅಥವಾ ಸಂದೇಶದಲ್ಲಿರುವ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಬೇಡಿ.", "ಪರಿಚಿತ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ಅಥವಾ ಆಪ್ ಮೂಲಕ ಪರಿಶೀಲಿಸಿ.", "ಮಾಹಿತಿ ಅಥವಾ ಹಣ ಹಂಚಿದ್ದರೆ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಉಳಿಸಿ."],
  },
};

export function analyzeScamLocally(message: string, language: Language): ScamCheckResponse {
  const hasUnsafeDomain = hasUntrustedLink(message);
  const hasUrgency = /(24\s*(hrs?|hours?)|immediately|urgent|block|suspend|तुरंत|ब्लॉक|बंद|ತಕ್ಷಣ|ನಿರ್ಬಂಧ)/iu.test(message);
  const hasPersonalCallback = /\+?91[\s-]?\d{10}|(?<!\d)\d{10}(?!\d)/.test(message);
  const localized = copy[language];
  return {
    verdict: hasUnsafeDomain || hasUrgency ? "suspicious" : "unclear",
    confidence: hasUnsafeDomain && hasUrgency ? "high" : "medium",
    summary: hasUnsafeDomain || hasUrgency ? localized.suspicious : localized.unclear,
    signals: [hasUnsafeDomain ? localized.unsafeLink : localized.safeLink, hasUrgency ? localized.urgent : localized.calm, hasPersonalCallback ? localized.callback : localized.noCallback],
    nextActions: localized.actions,
    simulated: true,
    authority: "Citizen safety analysis",
  };
}
