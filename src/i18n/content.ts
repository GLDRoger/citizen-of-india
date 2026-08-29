import type { Language } from "./messages";

interface LocalizedContent {
  nodeTitles: Record<string, string>;
  noticeBodies: Record<string, string>;
  ruleExplanations: Record<string, string>;
}

const hi: LocalizedContent = {
  nodeTitles: {
    "obl:gstr3b-sep": "अगस्त का GSTR-3B जमा करें",
    "obl:echallan-500": "होसूर रोड पर सिग्नल तोड़ने का ट्रैफ़िक ई-चालान",
    "obl:bbmp-property-tax": "BBMP संपत्ति कर 2026-27 की दूसरी किस्त",
    "obl:itr-refund": "आयकर रिफ़ंड, आकलन वर्ष 2026-27",
    "obl:passport-renewal": "वीज़ा के लिए पासपोर्ट में छह महीने से कम समय बचा है",
    "ntc:itr-refund": "₹12,400 का आयकर रिफ़ंड शुरू हुआ",
    "ntc:epfo-passbook": "EPF अंशदान खाते में जमा हुआ",
    "ntc:echallan": "ई-चालान जारी हुआ",
    "ntc:kavita-consent-received": "कविता की कानूनी वारिस सहमति मिली",
    "ntc:marriage-ripple": "विवाह पंजीकृत — जुड़े अगले कदम देखें",
    "ben:pmsby": "प्रधानमंत्री सुरक्षा बीमा योजना",
    "ben:mudra-kishor": "प्रधानमंत्री मुद्रा लोन — किशोर",
    "ben:eps-family-pension": "EPS-95 पारिवारिक पेंशन",
    "ben:ka-widow-pension": "कर्नाटक विधवा वेतन",
    "app:pan-name-correction": "आधार से मिलाने के लिए PAN नाम सुधार",
    "app:death-rajesh": "मृत्यु पंजीकरण और परिवार के अगले काम",
    "app:sunita-family-pension": "EPS-95 पारिवारिक पेंशन",
    "app:sunita-epf-nominee-claim": "राजेश शर्मा का EPF नॉमिनी दावा",
    "app:rajesh-prop-jpnagar-house-succession": "संपत्ति उत्तराधिकार नामांतरण",
    "app:rajesh-veh-dzire-succession": "वाहन मालिकाना हक़ हस्तांतरण",
    "app:marriage-arjun-priya": "अर्जुन और प्रिया का विवाह पंजीकरण",
    "app:arjun-business-loan": "व्यवसाय लोन आवेदन",
  },
  noticeBodies: {
    "ntc:itr-refund": "प्रिय करदाता, आकलन वर्ष 2026-27 के लिए ₹12,400 का रिफ़ंड शुरू हो गया है। यह सत्यापित बैंक खाते के अंतिम अंक 0042 में जमा होगा।",
    "ntc:epfo-passbook": "प्रिय सदस्य, जुलाई 2026 का ₹21,600 अंशदान UAN XXXXXX7890 में जमा हुआ। शेष राशि: ₹3,40,000।",
    "ntc:echallan": "KA05MJ4821 से 02-08-2026 को होसूर रोड पर सिग्नल तोड़ने के लिए ₹500 का ई-चालान KA05-2026-0812445 जारी हुआ। 01-09-2026 तक भुगतान करें।",
    "ntc:kavita-consent-received": "सिम्युलेटेड सहमति माध्यम ने राजेश शर्मा के कानूनी वारिस काम के लिए कविता वर्मा की मंज़ूरी दर्ज की।",
    "ntc:marriage-ripple": "विवाह प्रमाणपत्र दोनों के दस्तावेज़ों में सुरक्षित है। अर्जुन प्रिया को EPF नॉमिनी बनाने का प्रस्ताव देख सकते हैं और दोनों अपनी प्रोफ़ाइल से योजना पात्रता जाँच सकते हैं। कोई बदलाव अपने आप नहीं होगा।",
  },
  ruleExplanations: {
    "You are between 18 and 70.": "आपकी उम्र 18 से 70 वर्ष के बीच है।",
    "You have an active bank account.": "आपका बैंक खाता सक्रिय है।",
    "Sharma Web Solutions is a proprietorship.": "Sharma Web Solutions एकल स्वामित्व वाला व्यवसाय है।",
    "Udyam registration is active.": "उद्यम पंजीकरण सक्रिय है।",
    "The business is at least 2 years old.": "व्यवसाय को कम से कम दो वर्ष हो चुके हैं।",
    "Latest ITR acknowledgement (ITR-V) is required.": "नवीनतम ITR पावती (ITR-V) चाहिए।",
    "Payable to the surviving spouse of an EPS pensioner.": "EPS पेंशनर के जीवित जीवनसाथी को यह पेंशन मिल सकती है।",
    "Rajesh Sharma held an EPS-95 pension.": "राजेश शर्मा को EPS-95 पेंशन मिलती थी।",
    "Death certificate is required.": "मृत्यु प्रमाणपत्र चाहिए।",
    "Payable to widowed residents of Karnataka.": "कर्नाटक की विधवा निवासी इस पेंशन के लिए पात्र हो सकती हैं।",
    "Sunita is a resident of Karnataka.": "सुनीता कर्नाटक की निवासी हैं।",
    "Household income must be within the limit — needs income declaration.": "परिवार की आय तय सीमा में होनी चाहिए; आय घोषणा अभी चाहिए।",
  },
};

const kn: LocalizedContent = {
  nodeTitles: {
    "obl:gstr3b-sep": "ಆಗಸ್ಟ್ ತಿಂಗಳ GSTR-3B ಸಲ್ಲಿಸಿ",
    "obl:echallan-500": "ಹೊಸೂರು ರಸ್ತೆಯ ಸಿಗ್ನಲ್ ಉಲ್ಲಂಘನೆಗೆ ಸಂಚಾರ ಇ-ದಂಡ",
    "obl:bbmp-property-tax": "BBMP ಆಸ್ತಿ ತೆರಿಗೆ 2026-27ರ ಎರಡನೇ ಕಂತು",
    "obl:itr-refund": "ಆದಾಯ ತೆರಿಗೆ ಮರುಪಾವತಿ, ಮೌಲ್ಯಮಾಪನ ವರ್ಷ 2026-27",
    "obl:passport-renewal": "ವೀಸಾಕ್ಕೆ ಬೇಕಾದ ಆರು ತಿಂಗಳಿಗಿಂತ ಕಡಿಮೆ ಪಾಸ್‌ಪೋರ್ಟ್ ಅವಧಿ ಉಳಿದಿದೆ",
    "ntc:itr-refund": "₹12,400 ಆದಾಯ ತೆರಿಗೆ ಮರುಪಾವತಿ ಪ್ರಾರಂಭವಾಗಿದೆ",
    "ntc:epfo-passbook": "EPF ವಂತಿಗೆ ಖಾತೆಗೆ ಜಮೆಯಾಗಿದೆ",
    "ntc:echallan": "ಇ-ದಂಡ ನೀಡಲಾಗಿದೆ",
    "ntc:kavita-consent-received": "ಕವಿತಾ ಅವರ ಕಾನೂನು ವಾರಸುದಾರರ ಒಪ್ಪಿಗೆ ದೊರೆತಿದೆ",
    "ntc:marriage-ripple": "ವಿವಾಹ ನೋಂದಣಿಯಾಗಿದೆ — ಸಂಬಂಧಿತ ಮುಂದಿನ ಹೆಜ್ಜೆಗಳನ್ನು ನೋಡಿ",
    "ben:pmsby": "ಪ್ರಧಾನಮಂತ್ರಿ ಸುರಕ್ಷಾ ವಿಮಾ ಯೋಜನೆ",
    "ben:mudra-kishor": "ಪ್ರಧಾನಮಂತ್ರಿ ಮುದ್ರಾ ಸಾಲ — ಕಿಶೋರ್",
    "ben:eps-family-pension": "EPS-95 ಕುಟುಂಬ ಪಿಂಚಣಿ",
    "ben:ka-widow-pension": "ಕರ್ನಾಟಕ ವಿಧವಾ ವೇತನ",
    "app:pan-name-correction": "ಆಧಾರ್‌ಗೆ ಹೊಂದಿಸಲು PAN ಹೆಸರು ತಿದ್ದುಪಡಿ",
    "app:death-rajesh": "ಮರಣ ನೋಂದಣಿ ಮತ್ತು ಕುಟುಂಬದ ಮುಂದಿನ ಕ್ರಮಗಳು",
    "app:sunita-family-pension": "EPS-95 ಕುಟುಂಬ ಪಿಂಚಣಿ",
    "app:sunita-epf-nominee-claim": "ರಾಜೇಶ್ ಶರ್ಮಾ ಅವರ EPF ನಾಮಿನಿ ಹಕ್ಕು",
    "app:rajesh-prop-jpnagar-house-succession": "ಆಸ್ತಿ ಉತ್ತರಾಧಿಕಾರ ಖಾತಾ ಬದಲಾವಣೆ",
    "app:rajesh-veh-dzire-succession": "ವಾಹನ ಮಾಲೀಕತ್ವ ವರ್ಗಾವಣೆ",
    "app:marriage-arjun-priya": "ಅರ್ಜುನ್ ಮತ್ತು ಪ್ರಿಯಾ ಅವರ ವಿವಾಹ ನೋಂದಣಿ",
    "app:arjun-business-loan": "ವ್ಯವಹಾರ ಸಾಲದ ಅರ್ಜಿ",
  },
  noticeBodies: {
    "ntc:itr-refund": "ಮಾನ್ಯ ತೆರಿಗೆದಾರರೇ, ಮೌಲ್ಯಮಾಪನ ವರ್ಷ 2026-27ರ ₹12,400 ಮರುಪಾವತಿ ಪ್ರಾರಂಭವಾಗಿದೆ. ಇದು 0042ರಲ್ಲಿ ಕೊನೆಗೊಳ್ಳುವ ಪರಿಶೀಲಿತ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆಯಾಗುತ್ತದೆ.",
    "ntc:epfo-passbook": "ಮಾನ್ಯ ಸದಸ್ಯರೇ, ಜುಲೈ 2026ರ ₹21,600 ವಂತಿಗೆ UAN XXXXXX7890ಗೆ ಜಮೆಯಾಗಿದೆ. ಉಳಿಕೆ: ₹3,40,000.",
    "ntc:echallan": "KA05MJ4821 ವಾಹನವು 02-08-2026ರಂದು ಹೊಸೂರು ರಸ್ತೆಯಲ್ಲಿ ಸಿಗ್ನಲ್ ಉಲ್ಲಂಘಿಸಿದ ಕಾರಣ ₹500ರ ಇ-ದಂಡ KA05-2026-0812445 ನೀಡಲಾಗಿದೆ. 01-09-2026ರೊಳಗೆ ಪಾವತಿಸಿ.",
    "ntc:kavita-consent-received": "ಅನುಕರಿಸಿದ ಒಪ್ಪಿಗೆ ಸಂಪರ್ಕವು ರಾಜೇಶ್ ಶರ್ಮಾ ಅವರ ಕಾನೂನು ವಾರಸುದಾರರ ಕ್ರಮಕ್ಕೆ ಕವಿತಾ ವರ್ಮಾ ಅವರ ಅನುಮೋದನೆಯನ್ನು ದಾಖಲಿಸಿದೆ.",
    "ntc:marriage-ripple": "ವಿವಾಹ ಪ್ರಮಾಣಪತ್ರ ಇಬ್ಬರ ದಾಖಲೆಗಳಲ್ಲೂ ಇದೆ. ಅರ್ಜುನ್ ಪ್ರಿಯಾ ಅವರನ್ನು EPF ನಾಮಿನಿಯಾಗಿ ಪ್ರಸ್ತಾಪಿಸುವುದನ್ನು ಪರಿಶೀಲಿಸಬಹುದು ಮತ್ತು ಇಬ್ಬರೂ ತಮ್ಮ ಪ್ರೊಫೈಲ್‌ನಿಂದ ಯೋಜನೆ ಅರ್ಹತೆಯನ್ನು ನೋಡಬಹುದು. ಯಾವುದೇ ಬದಲಾವಣೆ ತಾನಾಗಿ ಆಗುವುದಿಲ್ಲ.",
  },
  ruleExplanations: {
    "You are between 18 and 70.": "ನಿಮ್ಮ ವಯಸ್ಸು 18ರಿಂದ 70 ವರ್ಷಗಳ ನಡುವೆ ಇದೆ.",
    "You have an active bank account.": "ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಕ್ರಿಯವಾಗಿದೆ.",
    "Sharma Web Solutions is a proprietorship.": "Sharma Web Solutions ಏಕಮಾಲೀಕತ್ವದ ವ್ಯವಹಾರವಾಗಿದೆ.",
    "Udyam registration is active.": "ಉದ್ಯಮ ನೋಂದಣಿ ಸಕ್ರಿಯವಾಗಿದೆ.",
    "The business is at least 2 years old.": "ವ್ಯವಹಾರಕ್ಕೆ ಕನಿಷ್ಠ ಎರಡು ವರ್ಷಗಳಾಗಿದೆ.",
    "Latest ITR acknowledgement (ITR-V) is required.": "ಇತ್ತೀಚಿನ ITR ಸ್ವೀಕೃತಿ (ITR-V) ಬೇಕಾಗಿದೆ.",
    "Payable to the surviving spouse of an EPS pensioner.": "EPS ಪಿಂಚಣಿದಾರರ ಜೀವಿತ ಸಂಗಾತಿಗೆ ಈ ಪಿಂಚಣಿ ದೊರೆಯಬಹುದು.",
    "Rajesh Sharma held an EPS-95 pension.": "ರಾಜೇಶ್ ಶರ್ಮಾ EPS-95 ಪಿಂಚಣಿ ಪಡೆಯುತ್ತಿದ್ದರು.",
    "Death certificate is required.": "ಮರಣ ಪ್ರಮಾಣಪತ್ರ ಬೇಕಾಗಿದೆ.",
    "Payable to widowed residents of Karnataka.": "ಕರ್ನಾಟಕದ ವಿಧವಾ ನಿವಾಸಿಗಳಿಗೆ ಈ ಪಿಂಚಣಿ ದೊರೆಯಬಹುದು.",
    "Sunita is a resident of Karnataka.": "ಸುನೀತಾ ಕರ್ನಾಟಕದ ನಿವಾಸಿ.",
    "Household income must be within the limit — needs income declaration.": "ಕುಟುಂಬದ ಆದಾಯ ನಿಗದಿತ ಮಿತಿಯೊಳಗಿರಬೇಕು; ಆದಾಯ ಘೋಷಣೆ ಇನ್ನೂ ಬೇಕಾಗಿದೆ.",
  },
};

const dictionaries: Partial<Record<Language, LocalizedContent>> = { hi, kn };

export function localizeNodeTitle(language: Language, nodeId: string, fallback: string) {
  return dictionaries[language]?.nodeTitles[nodeId] ?? fallback;
}

export function localizeNoticeBody(language: Language, noticeId: string, fallback: string) {
  return dictionaries[language]?.noticeBodies[noticeId] ?? fallback;
}

export function localizeRuleExplanation(language: Language, fallback: string) {
  return dictionaries[language]?.ruleExplanations[fallback] ?? fallback;
}
