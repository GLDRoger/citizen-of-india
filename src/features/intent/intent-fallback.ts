import type { IntentResponse, WorkflowSlug } from "./schema";

function detectLanguage(text: string): IntentResponse["language"] {
  if (/\p{Script=Kannada}/u.test(text)) return "kn";
  if (/\p{Script=Devanagari}/u.test(text)) return "hi";
  if (/\b(kya|papa|mujhe|karna|shaadi|paisa|hai|ho gayi)\b/i.test(text)) return "hinglish";
  return "en";
}

function detectRoute(text: string): WorkflowSlug {
  const normalized = text.toLowerCase();
  if (/(death|died|passed away|death ho|निधन|मृत्यु|तेरहवीं|ನಿಧನ|ತೀರಿಕೊಂಡ|ಮರಣ)/u.test(normalized)) return "death";
  if (/(marriage|marry|wedding|shaadi|शादी|विवाह|ವಿವಾಹ|ಮದುವೆ)/u.test(normalized)) return "marriage";
  if (/(loan|mudra|credit|कर्ज|लोन|ಸಾಲ)/u.test(normalized)) return "loan";
  if (/(scam|fraud|suspicious|message|धोखा|फ्रॉड|ठगी|संदिग्ध|संदेश|ವಂಚನೆ|ಅನುಮಾನಾಸ್ಪದ|ಸಂದೇಶ)/u.test(normalized)) return "scam-check";
  if (/(start.*business|new business|business plan|व्यवसाय|बिज़नेस|ವ್ಯವಹಾರ)/u.test(normalized)) return "start-business";
  if (/(challan|deadline|tax|obligation|refund|payment|जुर्माना|चालान|भुगतान|बकाया|देय|आयकर|समय-सीमा|ತೆರಿಗೆ|ದಂಡ|ಪಾವತಿ|ಬಾಕಿ|ಗಡುವು)/u.test(normalized)) return "obligations";
  return "service-unavailable";
}

type ConnectedWorkflow = Exclude<WorkflowSlug, "service-unavailable">;
type Plan = { title: string; reply: string; steps: string[] };

const plans: Record<IntentResponse["language"], Record<ConnectedWorkflow, Plan>> = {
  en: {
    death: { title: "When someone in the family dies", reply: "I can bring the registration, certificate, pension, nominee, and legal-heir work into one guided journey.", steps: ["Confirm your family member", "Register the death", "Reuse the certificate", "Start pension and nominee actions"] },
    marriage: { title: "Register your marriage", reply: "You and your partner can share documents, consent separately, book an appointment, and receive a shared certificate.", steps: ["Invite your partner", "Collect consent", "Reuse verified documents", "Book and submit"] },
    obligations: { title: "Your deadlines and money", reply: "I found payments, filings, refunds, and document deadlines connected to your records.", steps: ["Review what is due", "Pay the traffic challan", "Track money coming to you"] },
    loan: { title: "Check a business loan", reply: "I can check your business vintage, registrations, filings, and current obligations against Mudra rules.", steps: ["Review connected evidence", "See eligibility and missing proof", "Compare options", "Start an application"] },
    "scam-check": { title: "Check a suspicious message", reply: "I will inspect the sender, links, urgency, and whether the message matches your known interactions.", steps: ["Paste the message", "Inspect warning signs", "Decide what to do", "Open a cybercrime draft if needed"] },
    "start-business": { title: "Plan a new business", reply: "Tell me the location and business type, and I will prepare a focused registration, licence, scheme, and finance plan.", steps: ["Describe the business", "Choose a location", "Review the action plan", "Start the first registration"] },
  },
  hi: {
    death: { title: "परिवार में मृत्यु के बाद क्या करें", reply: "मैं मृत्यु पंजीकरण, प्रमाणपत्र, पेंशन, नॉमिनी और कानूनी वारिस के काम एक यात्रा में पूरा करने में मदद करूँगा।", steps: ["परिवार के सदस्य की पुष्टि करें", "मृत्यु पंजीकरण करें", "प्रमाणपत्र का दोबारा उपयोग करें", "पेंशन और नॉमिनी दावे शुरू करें"] },
    marriage: { title: "अपनी शादी रजिस्टर करें", reply: "आप और आपके साथी अलग-अलग सहमति देकर दस्तावेज़ साझा कर सकते हैं, अपॉइंटमेंट बुक कर सकते हैं और एक साझा प्रमाणपत्र पा सकते हैं।", steps: ["साथी को आमंत्रित करें", "सहमति लें", "सत्यापित दस्तावेज़ इस्तेमाल करें", "बुकिंग और आवेदन पूरा करें"] },
    obligations: { title: "आपकी समय-सीमाएँ और पैसे", reply: "आपके रिकॉर्ड से जुड़े भुगतान, फ़ाइलिंग, रिफ़ंड और दस्तावेज़ की समय-सीमाएँ मिल गई हैं।", steps: ["बाकी काम देखें", "ट्रैफ़िक चालान भरें", "आने वाले पैसे पर नज़र रखें"] },
    loan: { title: "व्यवसाय लोन जाँचें", reply: "मैं आपके व्यवसाय की उम्र, पंजीकरण, फ़ाइलिंग और मौजूदा देनदारियों को मुद्रा नियमों से जाँच सकता हूँ।", steps: ["जुड़े हुए प्रमाण देखें", "पात्रता और बाकी प्रमाण जाँचें", "विकल्पों की तुलना करें", "आवेदन शुरू करें"] },
    "scam-check": { title: "संदिग्ध संदेश जाँचें", reply: "मैं भेजने वाले, लिंक, जल्दबाज़ी और आपकी जानी-पहचानी जानकारी से संदेश का मिलान करूँगा।", steps: ["संदेश चिपकाएँ", "चेतावनी संकेत देखें", "सुरक्षित कदम चुनें", "ज़रूरत हो तो साइबर अपराध ड्राफ्ट बनाएँ"] },
    "start-business": { title: "नया व्यवसाय शुरू करने की योजना", reply: "स्थान और व्यवसाय का प्रकार बताइए; मैं पंजीकरण, लाइसेंस, योजना और वित्त के कदम सही क्रम में दूँगा।", steps: ["व्यवसाय बताएँ", "स्थान चुनें", "कार्य योजना देखें", "पहला पंजीकरण शुरू करें"] },
  },
  hinglish: {
    death: { title: "Family mein death ke baad kya karein", reply: "Main registration, certificate, pension, nominee aur legal-heir ka kaam ek guided journey mein laa sakta hoon.", steps: ["Family member confirm karein", "Death register karein", "Certificate reuse karein", "Pension aur nominee claims shuru karein"] },
    marriage: { title: "Marriage register karein", reply: "Aap aur aapke partner alag consent dekar documents share, appointment book aur shared certificate le sakte hain.", steps: ["Partner ko invite karein", "Consent lein", "Verified documents reuse karein", "Booking aur submission poora karein"] },
    obligations: { title: "Aapki deadlines aur paise", reply: "Aapke records se linked payments, filings, refunds aur document deadlines mil gayi hain.", steps: ["Pending kaam dekhein", "Traffic challan pay karein", "Aane wale paise track karein"] },
    loan: { title: "Business loan check karein", reply: "Main business vintage, registrations, filings aur current obligations ko Mudra rules ke saath check kar sakta hoon.", steps: ["Linked evidence dekhein", "Eligibility aur missing proof samjhein", "Options compare karein", "Application start karein"] },
    "scam-check": { title: "Suspicious message check karein", reply: "Main sender, links, urgency aur aapke known interactions ke saath message ko compare karunga.", steps: ["Message paste karein", "Warning signs dekhein", "Safe action chunein", "Zarurat ho to cybercrime draft banayein"] },
    "start-business": { title: "Naya business plan karein", reply: "Location aur business type batayein; main registration, licence, scheme aur finance ka focused plan dunga.", steps: ["Business describe karein", "Location chunein", "Action plan dekhein", "Pehla registration start karein"] },
  },
  kn: {
    death: { title: "ಕುಟುಂಬದಲ್ಲಿ ಮರಣವಾದ ನಂತರ", reply: "ಮರಣ ನೋಂದಣಿ, ಪ್ರಮಾಣಪತ್ರ, ಪಿಂಚಣಿ, ನಾಮಿನಿ ಮತ್ತು ಕಾನೂನು ವಾರಸುದಾರರ ಕೆಲಸವನ್ನು ಒಂದೇ ಮಾರ್ಗದಲ್ಲಿ ಪೂರ್ಣಗೊಳಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.", steps: ["ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ಖಚಿತಪಡಿಸಿ", "ಮರಣ ನೋಂದಣಿ ಮಾಡಿ", "ಪ್ರಮಾಣಪತ್ರವನ್ನು ಮರುಬಳಸಿ", "ಪಿಂಚಣಿ ಮತ್ತು ನಾಮಿನಿ ಹಕ್ಕು ಪ್ರಾರಂಭಿಸಿ"] },
    marriage: { title: "ವಿವಾಹ ನೋಂದಾಯಿಸಿ", reply: "ನೀವು ಮತ್ತು ನಿಮ್ಮ ಸಂಗಾತಿ ಪ್ರತ್ಯೇಕ ಒಪ್ಪಿಗೆ ನೀಡಿ ದಾಖಲೆ ಹಂಚಿ, ಭೇಟಿಯನ್ನು ನಿಗದಿಪಡಿಸಿ, ಒಂದೇ ಪ್ರಮಾಣಪತ್ರ ಪಡೆಯಬಹುದು.", steps: ["ಸಂಗಾತಿಯನ್ನು ಆಹ್ವಾನಿಸಿ", "ಒಪ್ಪಿಗೆ ಪಡೆಯಿರಿ", "ಪರಿಶೀಲಿಸಿದ ದಾಖಲೆ ಬಳಸಿ", "ಭೇಟಿ ಮತ್ತು ಸಲ್ಲಿಕೆ ಪೂರ್ಣಗೊಳಿಸಿ"] },
    obligations: { title: "ನಿಮ್ಮ ಗಡುವುಗಳು ಮತ್ತು ಹಣ", reply: "ನಿಮ್ಮ ದಾಖಲೆಗಳಿಗೆ ಸಂಪರ್ಕಿಸಿದ ಪಾವತಿ, ಸಲ್ಲಿಕೆ, ಮರುಪಾವತಿ ಮತ್ತು ದಾಖಲೆ ಗಡುವುಗಳನ್ನು ಕಂಡುಕೊಂಡಿದ್ದೇನೆ.", steps: ["ಬಾಕಿ ಕೆಲಸ ಪರಿಶೀಲಿಸಿ", "ಸಂಚಾರ ದಂಡ ಪಾವತಿಸಿ", "ನಿಮಗೆ ಬರಬೇಕಾದ ಹಣ ಗಮನಿಸಿ"] },
    loan: { title: "ವ್ಯವಹಾರ ಸಾಲ ಪರಿಶೀಲಿಸಿ", reply: "ನಿಮ್ಮ ವ್ಯವಹಾರದ ಅವಧಿ, ನೋಂದಣಿ, ಸಲ್ಲಿಕೆ ಮತ್ತು ಬಾಕಿಗಳನ್ನು ಮುದ್ರಾ ನಿಯಮಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಬಹುದು.", steps: ["ಸಂಪರ್ಕಿತ ಸಾಕ್ಷ್ಯ ನೋಡಿ", "ಅರ್ಹತೆ ಮತ್ತು ಬಾಕಿ ದಾಖಲೆ ತಿಳಿಯಿರಿ", "ಆಯ್ಕೆಗಳನ್ನು ಹೋಲಿಸಿ", "ಅರ್ಜಿ ಪ್ರಾರಂಭಿಸಿ"] },
    "scam-check": { title: "ಅನುಮಾನಾಸ್ಪದ ಸಂದೇಶ ಪರಿಶೀಲಿಸಿ", reply: "ಕಳುಹಿಸಿದವರು, ಲಿಂಕ್, ತುರ್ತು ಒತ್ತಡ ಮತ್ತು ನಿಮಗೆ ತಿಳಿದಿರುವ ವ್ಯವಹಾರಗಳೊಂದಿಗೆ ಸಂದೇಶವನ್ನು ಹೋಲಿಸುತ್ತೇನೆ.", steps: ["ಸಂದೇಶ ಅಂಟಿಸಿ", "ಎಚ್ಚರಿಕೆ ಲಕ್ಷಣ ನೋಡಿ", "ಸುರಕ್ಷಿತ ಕ್ರಮ ಆರಿಸಿ", "ಅಗತ್ಯವಿದ್ದರೆ ಸೈಬರ್ ಅಪರಾಧ ಕರಡು ಸಿದ್ಧಪಡಿಸಿ"] },
    "start-business": { title: "ಹೊಸ ವ್ಯವಹಾರ ಯೋಜಿಸಿ", reply: "ಸ್ಥಳ ಮತ್ತು ವ್ಯವಹಾರದ ವಿಧ ತಿಳಿಸಿ; ನೋಂದಣಿ, ಪರವಾನಗಿ, ಯೋಜನೆ ಮತ್ತು ಹಣಕಾಸಿನ ಕ್ರಮಬದ್ಧ ಯೋಜನೆ ನೀಡುತ್ತೇನೆ.", steps: ["ವ್ಯವಹಾರ ವಿವರಿಸಿ", "ಸ್ಥಳ ಆರಿಸಿ", "ಕ್ರಮ ಯೋಜನೆ ನೋಡಿ", "ಮೊದಲ ನೋಂದಣಿ ಪ್ರಾರಂಭಿಸಿ"] },
  },
};

const unavailable: Record<IntentResponse["language"], Plan & { clarification: string }> = {
  en: { title: "This service is not connected yet", reply: "Citizen can currently complete six guided experiences.", steps: ["Choose a connected service", "Describe what you need"], clarification: "Would you like help with a death, marriage, deadline, business loan, scam message, or starting a business?" },
  hi: { title: "यह सेवा अभी जुड़ी नहीं है", reply: "Citizen अभी छह निर्देशित सेवाएँ पूरी कर सकता है।", steps: ["जुड़ी हुई सेवा चुनें", "बताएँ आपको क्या चाहिए"], clarification: "क्या आपको मृत्यु, शादी, समय-सीमा, व्यवसाय लोन, संदिग्ध संदेश या नया व्यवसाय शुरू करने में मदद चाहिए?" },
  hinglish: { title: "Yeh service abhi connected nahi hai", reply: "Citizen abhi chhe guided services poori kar sakta hai.", steps: ["Connected service chunein", "Batayein aapko kya chahiye"], clarification: "Death, marriage, deadline, business loan, scam message ya business start karne mein help chahiye?" },
  kn: { title: "ಈ ಸೇವೆ ಇನ್ನೂ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ", reply: "Citizen ಈಗ ಆರು ಮಾರ್ಗದರ್ಶಿತ ಸೇವೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಬಹುದು.", steps: ["ಸಂಪರ್ಕಿತ ಸೇವೆ ಆರಿಸಿ", "ನಿಮಗೆ ಬೇಕಾದುದನ್ನು ತಿಳಿಸಿ"], clarification: "ಮರಣ, ವಿವಾಹ, ಗಡುವು, ವ್ಯವಹಾರ ಸಾಲ, ಅನುಮಾನಾಸ್ಪದ ಸಂದೇಶ ಅಥವಾ ಹೊಸ ವ್ಯವಹಾರಕ್ಕೆ ಸಹಾಯ ಬೇಕೇ?" },
};

export function classifyIntentLocally(text: string): IntentResponse {
  const route = detectRoute(text);
  const language = detectLanguage(text);
  if (route === "service-unavailable") {
    return { route, language, ...unavailable[language], simulated: true, authority: "Citizen planning assistant" };
  }
  return { route, language, ...plans[language][route], clarification: null, simulated: true, authority: "Citizen planning assistant" };
}

export function reconcileIntentResponse(fallback: IntentResponse, generated: IntentResponse | null): { response: IntentResponse; usedFallback: boolean } {
  if (!generated || (fallback.route !== "service-unavailable" && generated.route !== fallback.route)) {
    return { response: fallback, usedFallback: true };
  }
  return { response: generated, usedFallback: false };
}
