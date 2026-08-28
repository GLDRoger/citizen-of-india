import type { IntentContext, IntentResponse, RoutableIntent, WorkflowSlug } from "./schema";

function detectLanguage(text: string): IntentResponse["language"] {
  if (/\p{Script=Kannada}/u.test(text)) return "kn";
  if (/\p{Script=Devanagari}/u.test(text)) return "hi";
  if (/\b(kya|papa|mujhe|karna|shaadi|paisa|hai|ho gayi)\b/i.test(text)) return "hinglish";
  return "en";
}

function detectRoute(text: string): WorkflowSlug {
  const normalized = text.toLowerCase();
  if (/(death|died|passed away|death ho|निधन|मृत्यु|तेरहवीं|ನಿಧನ|ತೀರಿಕೊಂಡ|ಮರಣ)/u.test(normalized)) return "service-unavailable";
  if (/(marriage|marry|wedding|shaadi|शादी|विवाह|ವಿವಾಹ|ಮದುವೆ)/u.test(normalized)) return "marriage";
  if (/(epfo|epf|provident fund|uan|pf balance|passbook|grievance|पीएफ|ईपीएफओ|यूएएन|भविष्य निधि|ಪಿಎಫ್|ಇಪಿಎಫ್‌ಒ|ಯುಎಎನ್|ಭವಿಷ್ಯ ನಿಧಿ)/u.test(normalized)) return "epfo";
  if (/(gstr|gst return|file gst|जीएसटीआर|जीएसटी रिटर्न|ಜಿಎಸ್‌ಟಿಆರ್|ಜಿಎಸ್‌ಟಿ ರಿಟರ್ನ್)/u.test(normalized)) return "gstr3b";
  if (/(property tax|bbmp tax|संपत्ति कर|प्रॉपर्टी टैक्स|ಆಸ್ತಿ ತೆರಿಗೆ)/u.test(normalized)) return "property-tax";
  if (/(passport.*renew|renew.*passport|passport expiry|पासपोर्ट.*नवीनी|पासपोर्ट.*समाप्त|ಪಾಸ್‌ಪೋರ್ಟ್.*ನವೀ|ಪಾಸ್‌ಪೋರ್ಟ್.*ಅವಧಿ)/u.test(normalized)) return "passport-renewal";
  if (/(tax refund|refund status|track.*refund|मेरा.*रिफंड|रिफंड.*स्थिति|कर वापसी|ಮರುಪಾವತಿ.*ಸ್ಥಿತಿ|ತೆರಿಗೆ ಮರುಪಾವತಿ)/u.test(normalized)) return "refund-track";
  if (/(pmsby|suraksha bima|insurance scheme|benefit|scheme eligibility|पीएमएसबीवाई|सुरक्षा बीमा|योजना|पात्रता|ಪಿಎಂಎಸ್‌ಬಿವೈ|ಸುರಕ್ಷಾ ವಿಮೆ|ಯೋಜನೆ|ಅರ್ಹತೆ)/u.test(normalized)) return "benefit-application";
  if (/(my records|my profile|मेरे रिकॉर्ड|मेरी प्रोफ़ाइल|ನನ್ನ ದಾಖಲೆ|ನನ್ನ ಪ್ರೊಫೈಲ್)/u.test(normalized)) return "profile";
  if (/(digilocker|documents|दस्तावेज|डिजिलॉकर|ದಾಖಲೆಗಳು|ಡಿಜಿಲಾಕರ್)/u.test(normalized)) return "documents";
  if (/(loan|mudra|credit|कर्ज|लोन|ಸಾಲ)/u.test(normalized)) return "loan";
  if (/(pan|name mismatch|wrong name|record mismatch|correct.*name|नाम.*गलत|नाम.*सुधार|पैन|रिकॉर्ड.*अंतर|ಹೆಸರು.*ತಪ್ಪು|ಹೆಸರು.*ತಿದ್ದು|ಪ್ಯಾನ್|ದಾಖಲೆ.*ವ್ಯತ್ಯಾಸ)/u.test(normalized)) return "record-correction";
  if (/(start.*business|new business|business plan|व्यवसाय|बिज़नेस|ವ್ಯವಹಾರ)/u.test(normalized)) return "start-business";
  if (/(challan|deadline|tax|obligation|refund|payment|जुर्माना|चालान|भुगतान|बकाया|देय|आयकर|समय-सीमा|ತೆರಿಗೆ|ದಂಡ|ಪಾವತಿ|ಬಾಕಿ|ಗಡುವು)/u.test(normalized)) return "obligations";
  return "service-unavailable";
}

type ConnectedWorkflow = RoutableIntent;
type Plan = { title: string; reply: string; steps: string[] };

const plans: Record<IntentResponse["language"], Record<ConnectedWorkflow, Plan>> = {
  en: {
    "benefit-application": { title: "Check benefit eligibility", reply: "See the schemes this profile may qualify for, and pick up any saved application.", steps: ["Check eligibility", "Review the scheme", "Submit the demo application"] },
    documents: { title: "Open your documents", reply: "See DigiLocker documents and receipts saved in this demo.", steps: ["Open Documents", "Check the source", "Use the record in a service"] },
    profile: { title: "Open My records", reply: "See your documents, family, work, business, assets and government history in one connected record.", steps: ["Open My records", "Review linked facts", "Check government history"] },
    epfo: { title: "Check EPFO records", reply: "See your UAN, passbook balance and latest contribution. Raise a complaint if something looks wrong.", steps: ["Check the passbook", "Review the contribution", "Choose the next action"] },
    gstr3b: { title: "File GSTR-3B", reply: "Review the business, masked GSTIN and filing period before the simulated filing.", steps: ["Check the return", "Confirm the details", "Save the acknowledgement"] },
    marriage: { title: "Marriage registration", reply: "Invite your partner, share records with consent and register together.", steps: ["Send the invitation", "Choose records and witnesses", "Book and register"] },
    obligations: { title: "Payments and deadlines", reply: "You have payments, filings and a refund to check.", steps: ["See what is due", "Open the task", "Check the result on Home"] },
    "passport-renewal": { title: "Review passport renewal", reply: "Check the passport on file and the steps required before it expires.", steps: ["Check the passport", "Review the renewal steps", "Open the document"] },
    "property-tax": { title: "Pay property tax", reply: "Review the property, khata, due date and amount before the simulated payment.", steps: ["Check the property", "Review the amount", "Save the receipt"] },
    "refund-track": { title: "Track your tax refund", reply: "See the refund amount, current status and destination account already on file.", steps: ["Check the amount", "Review the status", "Return to Home"] },
    loan: { title: "Compare business loans", reply: "Compare monthly cost, missing documents and money already due.", steps: ["Check eligibility", "Compare both options", "Save an application draft"] },
    "record-correction": { title: "Fix PAN name", reply: "PAN and Aadhaar show different names. Check both before sending a correction request.", steps: ["Compare the names", "Check the documents", "Send the request"] },
    "start-business": { title: "Plan a business", reply: "Enter the business and city to see the registrations, licences and tax steps.", steps: ["Enter the details", "Review the plan", "Save the first step"] },
  },
  hi: {
    "benefit-application": { title: "योजना पात्रता जाँचें", reply: "इस प्रोफ़ाइल के लिए उपलब्ध योजनाएँ देखें और किसी मौजूदा ड्राफ्ट आवेदन को आगे बढ़ाएँ।", steps: ["पात्रता जाँचें", "योजना देखें", "डेमो आवेदन जमा करें"] },
    documents: { title: "अपने दस्तावेज़ खोलें", reply: "DigiLocker से जारी दस्तावेज़ और इस डेमो की रसीदें देखें।", steps: ["दस्तावेज़ खोलें", "स्रोत जाँचें", "रिकॉर्ड को सेवा में उपयोग करें"] },
    profile: { title: "मेरे रिकॉर्ड खोलें", reply: "दस्तावेज़, परिवार, काम, व्यवसाय, संपत्ति और सरकारी इतिहास एक जुड़े रिकॉर्ड में देखें।", steps: ["मेरे रिकॉर्ड खोलें", "जुड़े तथ्य देखें", "सरकारी इतिहास जाँचें"] },
    epfo: { title: "EPFO रिकॉर्ड जाँचें", reply: "UAN, पासबुक बैलेंस और नवीनतम अंशदान जाँचें। कोई गड़बड़ी हो तो शिकायत दर्ज करें।", steps: ["पासबुक जाँचें", "अंशदान जाँचें", "अगला कदम चुनें"] },
    gstr3b: { title: "GSTR-3B जमा करें", reply: "सिम्युलेटेड फ़ाइलिंग से पहले व्यवसाय, छिपा हुआ GSTIN और अवधि जाँचें।", steps: ["रिटर्न जाँचें", "जानकारी पक्की करें", "पावती सहेजें"] },
    marriage: { title: "विवाह पंजीकरण", reply: "साथी को बुलाएँ, सहमति से दस्तावेज़ साझा करें और साथ पंजीकरण करें।", steps: ["आमंत्रण भेजें", "दस्तावेज़ और गवाह चुनें", "अपॉइंटमेंट लेकर पंजीकरण करें"] },
    obligations: { title: "भुगतान और समय-सीमाएँ", reply: "आपके भुगतान, फ़ाइलिंग और रिफ़ंड की जाँच बाकी है।", steps: ["बाकी राशि देखें", "काम खोलें", "होम पर नतीजा देखें"] },
    "passport-renewal": { title: "पासपोर्ट नवीनीकरण जाँचें", reply: "मौजूदा पासपोर्ट और उसकी समाप्ति से पहले के कदम देखें।", steps: ["पासपोर्ट जाँचें", "नवीनीकरण के कदम देखें", "दस्तावेज़ खोलें"] },
    "property-tax": { title: "संपत्ति कर भरें", reply: "सिम्युलेटेड भुगतान से पहले संपत्ति, खाता, तारीख और राशि जाँचें।", steps: ["संपत्ति जाँचें", "राशि देखें", "रसीद सहेजें"] },
    "refund-track": { title: "कर वापसी देखें", reply: "रिफ़ंड की राशि, मौजूदा स्थिति और दर्ज बैंक खाते को देखें।", steps: ["राशि जाँचें", "स्थिति देखें", "होम पर लौटें"] },
    loan: { title: "व्यवसाय लोन की तुलना", reply: "मासिक किस्त, बाकी दस्तावेज़ और मौजूदा बकाया की तुलना करें।", steps: ["पात्रता जाँचें", "दोनों विकल्प देखें", "आवेदन का ड्राफ्ट सहेजें"] },
    "record-correction": { title: "PAN नाम ठीक करें", reply: "PAN और आधार पर अलग नाम हैं। सुधार अनुरोध भेजने से पहले दोनों जाँचें।", steps: ["नाम मिलाएँ", "दस्तावेज़ जाँचें", "अनुरोध भेजें"] },
    "start-business": { title: "व्यवसाय की योजना बनाएँ", reply: "पंजीकरण, लाइसेंस और कर के कदम देखने के लिए व्यवसाय और शहर बताएँ।", steps: ["जानकारी भरें", "योजना देखें", "पहला कदम सहेजें"] },
  },
  hinglish: {
    "benefit-application": { title: "Scheme eligibility check karein", reply: "Is profile ke liye schemes dekhein aur existing draft application continue karein.", steps: ["Eligibility dekhein", "Scheme review karein", "Demo application submit karein"] },
    documents: { title: "Apne documents kholein", reply: "DigiLocker issued documents aur demo receipts ek jagah dekhein.", steps: ["Documents kholein", "Source check karein", "Record service mein use karein"] },
    profile: { title: "My records kholein", reply: "Documents, family, work, business, assets aur government history ek connected record mein dekhein.", steps: ["My records kholein", "Linked facts dekhein", "Government history check karein"] },
    epfo: { title: "EPFO records check karein", reply: "UAN, passbook balance aur latest contribution dekhein. Galti ho to grievance register karein.", steps: ["Passbook dekhein", "Contribution check karein", "Agla action chunein"] },
    gstr3b: { title: "GSTR-3B file karein", reply: "Demo filing se pehle business, masked GSTIN aur period check karein.", steps: ["Return check karein", "Details confirm karein", "Acknowledgement save karein"] },
    marriage: { title: "Marriage registration", reply: "Partner ko invite karein, consent se documents share karein aur saath register karein.", steps: ["Invite bhejein", "Documents aur witness chunein", "Appointment lekar register karein"] },
    obligations: { title: "Payments aur deadlines", reply: "Aapke payments, filings aur refund check karne hain.", steps: ["Due amount dekhein", "Kaam kholein", "Home par result dekhein"] },
    "passport-renewal": { title: "Passport renewal check karein", reply: "File par passport aur expiry se pehle ke renewal steps dekhein.", steps: ["Passport check karein", "Renewal steps dekhein", "Document kholein"] },
    "property-tax": { title: "Property tax pay karein", reply: "Demo payment se pehle property, khata, due date aur amount check karein.", steps: ["Property check karein", "Amount review karein", "Receipt save karein"] },
    "refund-track": { title: "Tax refund track karein", reply: "Refund amount, current status aur file par bank account dekhein.", steps: ["Amount check karein", "Status dekhein", "Home par lautein"] },
    loan: { title: "Business loans compare karein", reply: "Monthly EMI, missing documents aur current dues compare karein.", steps: ["Eligibility dekhein", "Dono options compare karein", "Application draft save karein"] },
    "record-correction": { title: "PAN name theek karein", reply: "PAN aur Aadhaar par alag naam hain. Request bhejne se pehle dono check karein.", steps: ["Names compare karein", "Documents check karein", "Request bhejein"] },
    "start-business": { title: "Business plan karein", reply: "Registration, licence aur tax steps ke liye business aur city batayein.", steps: ["Details bharein", "Plan dekhein", "Pehla step save karein"] },
  },
  kn: {
    "benefit-application": { title: "ಯೋಜನೆ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ", reply: "ಈ ಪ್ರೊಫೈಲ್‌ಗೆ ದೊರೆಯಬಹುದಾದ ಯೋಜನೆಗಳನ್ನು ನೋಡಿ ಮತ್ತು ಈಗಿರುವ ಕರಡು ಅರ್ಜಿಯನ್ನು ಮುಂದುವರಿಸಿ.", steps: ["ಅರ್ಹತೆ ನೋಡಿ", "ಯೋಜನೆ ಪರಿಶೀಲಿಸಿ", "ಡೆಮೊ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ"] },
    documents: { title: "ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ತೆರೆಯಿರಿ", reply: "DigiLocker ನೀಡಿದ ದಾಖಲೆಗಳು ಮತ್ತು ಈ ಡೆಮೊದಲ್ಲಿ ಉಳಿಸಿದ ರಸೀದಿಗಳನ್ನು ನೋಡಿ.", steps: ["ದಾಖಲೆ ತೆರೆಯಿರಿ", "ಮೂಲ ಪರಿಶೀಲಿಸಿ", "ಸೇವೆಯಲ್ಲಿ ದಾಖಲೆ ಬಳಸಿ"] },
    profile: { title: "ನನ್ನ ದಾಖಲೆಗಳನ್ನು ತೆರೆಯಿರಿ", reply: "ದಾಖಲೆಗಳು, ಕುಟುಂಬ, ಕೆಲಸ, ವ್ಯವಹಾರ, ಆಸ್ತಿ ಮತ್ತು ಸರ್ಕಾರಿ ಇತಿಹಾಸವನ್ನು ಒಂದೇ ಸಂಪರ್ಕಿತ ದಾಖಲೆಯಲ್ಲಿ ನೋಡಿ.", steps: ["ನನ್ನ ದಾಖಲೆ ತೆರೆಯಿರಿ", "ಸಂಪರ್ಕಿತ ಮಾಹಿತಿಯನ್ನು ನೋಡಿ", "ಸರ್ಕಾರಿ ಇತಿಹಾಸ ಪರಿಶೀಲಿಸಿ"] },
    epfo: { title: "EPFO ದಾಖಲೆ ಪರಿಶೀಲಿಸಿ", reply: "UAN, ಪಾಸ್‌ಬುಕ್ ಬಾಕಿ ಮತ್ತು ಇತ್ತೀಚಿನ ವಂತಿಗೆಯನ್ನು ನೋಡಿ. ತಪ್ಪಿದ್ದರೆ ದೂರು ದಾಖಲಿಸಿ.", steps: ["ಪಾಸ್‌ಬುಕ್ ನೋಡಿ", "ವಂತಿಗೆ ಪರಿಶೀಲಿಸಿ", "ಮುಂದಿನ ಕ್ರಮ ಆರಿಸಿ"] },
    gstr3b: { title: "GSTR-3B ಸಲ್ಲಿಸಿ", reply: "ಅನುಕರಿತ ಸಲ್ಲಿಕೆಗೆ ಮೊದಲು ವ್ಯವಹಾರ, ಮರೆಮಾಡಿದ GSTIN ಮತ್ತು ಅವಧಿ ಪರಿಶೀಲಿಸಿ.", steps: ["ರಿಟರ್ನ್ ಪರಿಶೀಲಿಸಿ", "ವಿವರ ಖಚಿತಪಡಿಸಿ", "ಸ್ವೀಕೃತಿ ಉಳಿಸಿ"] },
    marriage: { title: "ವಿವಾಹ ನೋಂದಣಿ", reply: "ಸಂಗಾತಿಯನ್ನು ಆಹ್ವಾನಿಸಿ, ಒಪ್ಪಿಗೆಯೊಂದಿಗೆ ದಾಖಲೆ ಹಂಚಿ, ಒಟ್ಟಿಗೆ ನೋಂದಾಯಿಸಿ.", steps: ["ಆಹ್ವಾನ ಕಳುಹಿಸಿ", "ದಾಖಲೆ ಮತ್ತು ಸಾಕ್ಷಿ ಆರಿಸಿ", "ಭೇಟಿ ಪಡೆದು ನೋಂದಾಯಿಸಿ"] },
    obligations: { title: "ಪಾವತಿ ಮತ್ತು ಗಡುವುಗಳು", reply: "ನಿಮ್ಮ ಪಾವತಿ, ಸಲ್ಲಿಕೆ ಮತ್ತು ಮರುಪಾವತಿಯನ್ನು ಪರಿಶೀಲಿಸಬೇಕು.", steps: ["ಬಾಕಿ ಮೊತ್ತ ನೋಡಿ", "ಕೆಲಸ ತೆರೆಯಿರಿ", "ಮುಖಪುಟದಲ್ಲಿ ಫಲಿತಾಂಶ ನೋಡಿ"] },
    "passport-renewal": { title: "ಪಾಸ್‌ಪೋರ್ಟ್ ನವೀಕರಣ ಪರಿಶೀಲಿಸಿ", reply: "ಈಗಿರುವ ಪಾಸ್‌ಪೋರ್ಟ್ ಮತ್ತು ಅವಧಿ ಮುಗಿಯುವ ಮೊದಲು ಬೇಕಾದ ಕ್ರಮಗಳನ್ನು ನೋಡಿ.", steps: ["ಪಾಸ್‌ಪೋರ್ಟ್ ಪರಿಶೀಲಿಸಿ", "ನವೀಕರಣ ಕ್ರಮ ನೋಡಿ", "ದಾಖಲೆ ತೆರೆಯಿರಿ"] },
    "property-tax": { title: "ಆಸ್ತಿ ತೆರಿಗೆ ಪಾವತಿಸಿ", reply: "ಅನುಕರಿತ ಪಾವತಿಗೆ ಮೊದಲು ಆಸ್ತಿ, ಖಾತಾ, ಗಡುವು ಮತ್ತು ಮೊತ್ತ ಪರಿಶೀಲಿಸಿ.", steps: ["ಆಸ್ತಿ ಪರಿಶೀಲಿಸಿ", "ಮೊತ್ತ ನೋಡಿ", "ರಸೀದಿ ಉಳಿಸಿ"] },
    "refund-track": { title: "ತೆರಿಗೆ ಮರುಪಾವತಿ ಗಮನಿಸಿ", reply: "ಮರುಪಾವತಿ ಮೊತ್ತ, ಈಗಿನ ಸ್ಥಿತಿ ಮತ್ತು ದಾಖಲೆಯಲ್ಲಿರುವ ಬ್ಯಾಂಕ್ ಖಾತೆಯನ್ನು ನೋಡಿ.", steps: ["ಮೊತ್ತ ಪರಿಶೀಲಿಸಿ", "ಸ್ಥಿತಿ ನೋಡಿ", "ಮುಖಪುಟಕ್ಕೆ ಮರಳಿ"] },
    loan: { title: "ವ್ಯವಹಾರ ಸಾಲ ಹೋಲಿಸಿ", reply: "ತಿಂಗಳ ಕಂತು, ಬಾಕಿ ದಾಖಲೆ ಮತ್ತು ಈಗಿನ ಪಾವತಿಗಳನ್ನು ಹೋಲಿಸಿ.", steps: ["ಅರ್ಹತೆ ನೋಡಿ", "ಎರಡೂ ಆಯ್ಕೆ ಹೋಲಿಸಿ", "ಅರ್ಜಿ ಕರಡು ಉಳಿಸಿ"] },
    "record-correction": { title: "PAN ಹೆಸರು ತಿದ್ದುಪಡಿ", reply: "PAN ಮತ್ತು ಆಧಾರ್‌ನಲ್ಲಿ ಹೆಸರು ಬೇರೆ ಇದೆ. ವಿನಂತಿ ಕಳುಹಿಸುವ ಮೊದಲು ಎರಡನ್ನೂ ಪರಿಶೀಲಿಸಿ.", steps: ["ಹೆಸರು ಹೋಲಿಸಿ", "ದಾಖಲೆ ಪರಿಶೀಲಿಸಿ", "ವಿನಂತಿ ಕಳುಹಿಸಿ"] },
    "start-business": { title: "ವ್ಯವಹಾರ ಯೋಜಿಸಿ", reply: "ನೋಂದಣಿ, ಪರವಾನಗಿ ಮತ್ತು ತೆರಿಗೆ ಕ್ರಮಗಳಿಗೆ ವ್ಯವಹಾರ ಮತ್ತು ನಗರ ತಿಳಿಸಿ.", steps: ["ವಿವರ ನೀಡಿ", "ಯೋಜನೆ ನೋಡಿ", "ಮೊದಲ ಕ್ರಮ ಉಳಿಸಿ"] },
  },
};

const unavailable: Record<IntentResponse["language"], Plan & { clarification: string }> = {
  en: { title: "That service is not in this demo", reply: "Choose one of the working services below.", steps: ["Open Services"], clarification: "Use a common request or open Services." },
  hi: { title: "यह सेवा डेमो में नहीं है", reply: "नीचे दी गई चालू सेवाओं में से एक चुनें।", steps: ["सेवाएँ खोलें"], clarification: "कोई सामान्य अनुरोध चुनें या सेवाएँ खोलें।" },
  hinglish: { title: "Yeh service demo mein nahi hai", reply: "Neeche working services mein se ek chunein.", steps: ["Services kholein"], clarification: "Common request chunein ya Services kholein." },
  kn: { title: "ಈ ಸೇವೆ ಡೆಮೊದಲ್ಲಿ ಇಲ್ಲ", reply: "ಕೆಳಗಿನ ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಸೇವೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ.", steps: ["ಸೇವೆಗಳನ್ನು ತೆರೆಯಿರಿ"], clarification: "ಸಾಮಾನ್ಯ ವಿನಂತಿ ಆರಿಸಿ ಅಥವಾ ಸೇವೆಗಳನ್ನು ತೆರೆಯಿರಿ." },
};

function routeIsConnected(route: ConnectedWorkflow, context: IntentContext) {
  return context.availableWorkflows.includes(route);
}

export function classifyIntentLocally(text: string, context?: IntentContext): IntentResponse {
  const detectedRoute = detectRoute(text);
  const language = detectLanguage(text);
  const route = detectedRoute !== "service-unavailable" && context && !routeIsConnected(detectedRoute, context)
    ? "service-unavailable"
    : detectedRoute;
  if (route === "service-unavailable") {
    return { route, language, ...unavailable[language], simulated: true, authority: "Request guide" };
  }
  return { route, language, ...plans[language][route], clarification: null, simulated: true, authority: "Request guide" };
}
