export interface TranslationDict {
  brand: string;
  tagline: string;
  heroHeading: string;
  heroSubheading: string;
  getGuidanceBtn: string;
  findCareBtn: string;
  demoModeBtn: string;
  disclaimerShort: string;
  disclaimerFull: string;
  intakeHeading: string;
  intakePlaceholder: string;
  intakeHelpText: string;
  voiceStart: string;
  voiceStop: string;
  voiceListening: string;
  voiceUnsupported: string;
  nextBtn: string;
  backBtn: string;
  skipBtn: string;
  resetBtn: string;
  editBtn: string;
  copyBtn: string;
  copiedMsg: string;
  downloadBtn: string;
  startOverBtn: string;
  notSureOption: string;
  preferNotToSayOption: string;
  emergencyTitle: string;
  emergencyAlertBanner: string;
  call112Btn: string;
  caregiversTitle: string;
  caregiversSubtitle: string;
  noCaregiversFound: string;
  emergencyNoCaregiversNotice: string;
  whyAskedTitle: string;
  summaryTitle: string;
  privacyTitle: string;
  clearSessionTitle: string;
  clearSessionConfirm: string;
}

export const translations: Record<'en' | 'hi' | 'hinglish', TranslationDict> = {
  en: {
    brand: "CareCompass",
    tagline: "Transparent Health Navigation & Caregiver Matching",
    heroHeading: "Understand your health next steps with clarity & care.",
    heroSubheading: "Describe your concern in plain language. Get safe, rule-backed care guidance and connect with qualified local non-clinical caregivers.",
    getGuidanceBtn: "Get Care Guidance",
    findCareBtn: "Find Caregiver & Support",
    demoModeBtn: "Judge Demo & Benchmarks",
    disclaimerShort: "CareCompass is a navigation prototype, not a doctor. In an emergency, dial 112 immediately.",
    disclaimerFull: "CareCompass is an informational care-navigation prototype, not a medical diagnostic or prescribing tool. If you are experiencing severe pain, difficulty breathing, or another life-threatening emergency, call 112 or your local emergency services immediately.",
    intakeHeading: "What brings you here today?",
    intakePlaceholder: "E.g., I've had a fever and mild cough for 2 days, or looking for a home caregiver for an elderly parent...",
    intakeHelpText: "Describe your feelings or needs in everyday words. You can speak or type in English, Hindi, or Hinglish.",
    voiceStart: "Speak Concern",
    voiceStop: "Stop Recording",
    voiceListening: "Listening to your voice...",
    voiceUnsupported: "Speech recognition is not supported in this browser. Please type below.",
    nextBtn: "Continue",
    backBtn: "Back",
    skipBtn: "Skip Question",
    resetBtn: "Clear & Start Over",
    editBtn: "Edit Concern",
    copyBtn: "Copy Summary",
    copiedMsg: "Summary copied to clipboard!",
    downloadBtn: "Download PDF / Text",
    startOverBtn: "Start New Session",
    notSureOption: "I'm not sure",
    preferNotToSayOption: "Prefer not to say",
    emergencyTitle: "Immediate Emergency Guidance Required",
    emergencyAlertBanner: "EMERGENCY SAFETY ALERT: Red flag symptoms detected. Do not wait for routine appointments.",
    call112Btn: "Call Emergency Services (112)",
    caregiversTitle: "Eligible Caregivers & Companions",
    caregiversSubtitle: "Verified non-clinical support profiles matched to your requested skills and region.",
    noCaregiversFound: "No matching caregiver profiles currently available for this area.",
    emergencyNoCaregiversNotice: "Caregiver matching is strictly disabled during emergencies to ensure immediate emergency medical care.",
    whyAskedTitle: "Why we ask this:",
    summaryTitle: "Session Summary & Action Plan",
    privacyTitle: "Privacy & Safe AI Architecture",
    clearSessionTitle: "Reset Session Memory",
    clearSessionConfirm: "Session cleared. No sensitive health logs were saved.",
  },
  hi: {
    brand: "केयरकम्पास (CareCompass)",
    tagline: "पारदर्शी स्वास्थ्य मार्गदर्शन एवं देखभाल सहायक मिलान",
    heroHeading: "अपनी स्वास्थ्य संबंधी चिंता को समझें और सही दिशा पाएं।",
    heroSubheading: "अपनी समस्या को सरल भाषा में बताएं। सुरक्षित मार्गदर्शन प्राप्त करें और स्थानीय देखभाल सहायकों से जुड़ें।",
    getGuidanceBtn: "स्वास्थ्य मार्गदर्शन प्राप्त करें",
    findCareBtn: "सहायक व देखभाल खोजें",
    demoModeBtn: "जज डेमो व टेस्ट बेंचमार्क",
    disclaimerShort: "केयरकम्पास केवल मार्गदर्शन हेतु है, डॉक्टर का विकल्प नहीं। आपातकाल में तुरंत 112 मिलाएं।",
    disclaimerFull: "केयरकम्पास एक देखभाल-मार्गदर्शन प्रोटोटाइप है, कोई मेडिकल डायग्नोसिस या दवा देने वाला सिस्टम नहीं है। यदि कोई गंभीर लक्षण या आपातकालीन स्थिति है, तो तुरंत 112 या स्थानीय आपातकालीन सेवा पर संपर्क करें।",
    intakeHeading: "आज आपको किस प्रकार की परेशानी या सहायता चाहिए?",
    intakePlaceholder: "उदा. मुझे दो दिन से हल्का बुखार है, या मेरी बुजुर्ग माताजी के लिए घरेलू सहायक चाहिए...",
    intakeHelpText: "अपनी भाषा में सामान्य शब्दों में बताएं। आप बोलकर या लिखकर विवरण दे सकते हैं।",
    voiceStart: "बोलकर बताएं",
    voiceStop: "रिकॉर्डिंग रोकें",
    voiceListening: "आपकी आवाज़ सुनी जा रही है...",
    voiceUnsupported: "इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है। कृपया लिखकर बताएं।",
    nextBtn: "आगे बढ़ें",
    backBtn: "पीछे जाएं",
    skipBtn: "छोड़ें",
    resetBtn: "रीसेट करें",
    editBtn: "बदलाव करें",
    copyBtn: "कॉपी करें",
    copiedMsg: "विवरण कॉपी हो गया!",
    downloadBtn: "डाउनलोड करें",
    startOverBtn: "नया सत्र शुरू करें",
    notSureOption: "मुझे पक्का नहीं पता",
    preferNotToSayOption: "बताना नहीं चाहते",
    emergencyTitle: "तत्काल आपातकालीन चिकित्सा सहायता आवश्यक",
    emergencyAlertBanner: "आपातकालीन चेतावनी: गंभीर लक्षण पाए गए हैं। सामान्य अपॉइंटमेंट की प्रतीक्षा न करें।",
    call112Btn: "आपातकालीन नंबर 112 पर कॉल करें",
    caregiversTitle: "उपयुक्त देखभाल सहायक व साथी",
    caregiversSubtitle: "आपकी जरूरतों और क्षेत्र के अनुसार सत्यापित गैर-चिकित्सीय सहायक प्रोफाइल।",
    noCaregiversFound: "इस क्षेत्र के लिए कोई उपयुक्त सहायक उपलब्ध नहीं मिला।",
    emergencyNoCaregiversNotice: "आपातकाल के दौरान सहायक खोजना प्रतिबंधित है ताकि तत्काल अस्पताल जाया जा सके।",
    whyAskedTitle: "यह सवाल पूछने का कारण:",
    summaryTitle: "सत्र सारांश एवं अगला कदम",
    privacyTitle: "गोपनीयता और सुरक्षा नीतियां",
    clearSessionTitle: "सत्र डेटा साफ करें",
    clearSessionConfirm: "सत्र रीसेट हो गया। कोई व्यक्तिगत स्वास्थ्य डेटा संग्रहीत नहीं किया गया।",
  },
  hinglish: {
    brand: "CareCompass",
    tagline: "Transparent Health Navigation & Caregiver Matching",
    heroHeading: "Apni health problem ko aasani se samjhein aur right steps lein.",
    heroSubheading: "Apni pareshani plain language me share karein. Safe guidance paayein aur verified local caregivers se connect karein.",
    getGuidanceBtn: "Care Guidance Lein",
    findCareBtn: "Caregiver & Support Dhoondein",
    demoModeBtn: "Judge Demo & Benchmarks",
    disclaimerShort: "CareCompass care navigation prototype hai, doctor ka substitute nahi. Emergency me turant 112 dial karein.",
    disclaimerFull: "CareCompass ek care-navigation prototype hai, medical diagnosis ya dawa prescribe nahi karta. Agar chest pain, saans lene me takleef ya severe emergency ho, toh turant 112 dial karein.",
    intakeHeading: "Aaj aapko kya pareshani ya help chahiye?",
    intakePlaceholder: "E.g., Mujhe do din se fever aur khansi hai, ya grand parents ke liye caregiver chahiye...",
    intakeHelpText: "Apne normal shabdon me bataiye. Aap bol kar ya type karke likh sakte hain.",
    voiceStart: "Bolkar Batayein",
    voiceStop: "Recording Band Karein",
    voiceListening: "Aapki aawaz sun rahe hain...",
    voiceUnsupported: "Is browser me voice speech support nahi hai. Please type karein.",
    nextBtn: "Aage Badhein",
    backBtn: "Peeche Jaayein",
    skipBtn: "Skip Karein",
    resetBtn: "Clear Karein",
    editBtn: "Edit Karein",
    copyBtn: "Copy Karein",
    copiedMsg: "Summary clipboard me copy ho gayi!",
    downloadBtn: "Download Karein",
    startOverBtn: "Naya Session Shuru Karein",
    notSureOption: "I'm not sure",
    preferNotToSayOption: "Prefer not to say",
    emergencyTitle: "Immediate Emergency Medical Help Zaroori Hai",
    emergencyAlertBanner: "EMERGENCY SAFETY ALERT: Red flag symptoms detect hue hain. Normal appointment ka wait na karein.",
    call112Btn: "Emergency Call (112)",
    caregiversTitle: "Eligible Caregivers & Helpers",
    caregiversSubtitle: "Aapki skills aur location ke hisaab se matched verified non-clinical support profiles.",
    noCaregiversFound: "Is location ke liye abhi koi eligible caregiver available nahi mila.",
    emergencyNoCaregiversNotice: "Emergency cases me caregiver matching block rehti hai taaki aap direct emergency hospital ja sakein.",
    whyAskedTitle: "Yeh question kyu poochha gaya:",
    summaryTitle: "Session Summary & Action Plan",
    privacyTitle: "Privacy & Safety Policy",
    clearSessionTitle: "Session Reset Karein",
    clearSessionConfirm: "Session memory clear ho gaya. Koi health data save nahi hua.",
  },
};
