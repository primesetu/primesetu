/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

export type SupportedLanguage = 
  | 'en' | 'hi' | 'mr' | 'gu' | 'pa' 
  | 'ta' | 'kn' | 'te' | 'ml' | 'bn' 
  | 'or' | 'mn' | 'as' | 'bho'

export const LANGUAGES: Record<SupportedLanguage, string> = {
  en: 'Indian English',
  hi: 'हिन्दी (Hindi)',
  mr: 'मराठी (Marathi)',
  gu: 'ગુજરાતી (Gujarati)',
  pa: 'ਪੰਜਾਬੀ (Punjabi)',
  ta: 'தமிழ் (Tamil)',
  kn: 'ಕನ್ನಡ (Kannada)',
  te: 'తెలుగు (Telugu)',
  ml: 'മലയാളം (Malayalam)',
  bn: 'বাংলা (Bengali)',
  or: 'ଓଡ଼ିଆ (Oriya)',
  mn: 'মণিপুরী (Manipuri)',
  as: 'অসমীয়া (Assamese)',
  bho: 'भोजपुरी (Bhojpuri)'
}

export const DICTIONARY: Record<string, Record<SupportedLanguage, string>> = {
  aangan: {
    en: 'Aangan', hi: 'आँगन', mr: 'अंगण', gu: 'આંગણું', pa: 'ਆਂਗਣ',
    ta: 'முற்றம்', kn: 'ಅಂಗಳ', te: 'అಂಗణం', ml: 'മുറ്റം', bn: 'উঠান',
    or: 'ଅଗଣା', mn: 'সঙৈ', as: 'চোতাল', bho: 'अँगना'
  },
  bazaar: {
    en: 'Bazaar', hi: 'बाज़ार', mr: 'बाजार', gu: 'બજાર', pa: 'ਬਾਜ਼ਾਰ',
    ta: 'சந்தை', kn: 'ಮಾರುಕಟ್ಟೆ', te: 'బజారు', ml: 'ചന്ത', bn: 'বাজার',
    or: 'ବଜାର', mn: 'কৈথেল', as: 'বজাৰ', bho: 'बाजार'
  },
  khazana: {
    en: 'Khazana', hi: 'खज़ाना', mr: 'खजिना', gu: 'ખજાનો', pa: 'ਖજાના',
    ta: 'கருவூலம்', kn: 'ಖಜಾನೆ', te: 'ఖజానా', ml: 'ಖജനാവ്', bn: 'খাজনা',
    or: 'ଖଜଣା', mn: 'লন', as: 'খাজনা', bho: 'खजाना'
  },
  khatavahi: {
    en: 'Khatavahi', hi: 'खाता बही', mr: 'खातेवही', gu: 'ખાતાવही', pa: 'ਖਾਤਾ ਵਹੀ',
    ta: 'கணக்குப் புத்தகம்', kn: 'ಖಾತೆ ಪುಸ್ತಕ', te: 'ఖాతా పుస్తకం', ml: 'കണക്കു പുസ്തകം', bn: 'খাতা বই',
    or: 'ଖାତା ବହି', mn: 'চেকশঙ', as: 'খাতা বহী', bho: 'खाता बही'
  },
  graha: {
    en: 'Graha', hi: 'ग्राहक', mr: 'ग्राहक', gu: 'ગ્રાહક', pa: 'ਗਾਹਕ',
    ta: 'வாடிக்கையாளர்', kn: 'ಗ್ರಾಹಕ', te: 'ಗ್ರಾಹకుడు', ml: 'ഉപഭോക്താവ്', bn: 'গ্রাহক',
    or: 'ଗ୍ରାಹକ', mn: 'চাতক', as: 'গ্রাহক', bho: 'गाहक'
  },
  prachar: {
    en: 'Prachar', hi: 'प्रचार', mr: 'प्रचार', gu: 'પ્રચાર', pa: 'ਪ੍ਰਚਾਰ',
    ta: 'பரப்புதல்', kn: 'ಪ್ರಚಾರ', te: 'प्रచారం', ml: 'പ്രചാരണം', bn: 'প্রচার',
    or: 'ପ୍ରଚାର', mn: 'প্রচার', as: 'প্ৰচাৰ', bho: 'प्रचार'
  },
  praman: {
    en: 'Praman', hi: 'प्रमाण', mr: 'प्रमाण', gu: 'પ્રમાણ', pa: 'ਪ੍ਰਮਾਣ',
    ta: 'சான்று', kn: 'ಪುರಾವೆ', te: 'ಪ್ರಮಾಣಂ', ml: 'തെളിവ്', bn: 'প্রমাণ',
    or: 'ପ୍ରମାଣ', mn: 'প্রমাণ', as: 'প্ৰমাণ', bho: 'प्रमाण'
  },
  sashakt: {
    en: 'Sashakt', hi: 'सशक्त', mr: 'सशक्त', gu: 'સશક્ત', pa: 'ਸਸ਼ਕਤ',
    ta: 'அதிகாரம்', kn: 'ಸಶಕ್ತ', te: 'సశక్తం', ml: 'ശക്തമായ', bn: 'সশক্ত',
    or: 'ସଶକ୍ତ', mn: 'সশক্ত', as: 'সশক্ত', bho: 'सशक्त'
  },
  sanchalan: {
    en: 'Sanchalan', hi: 'संचालन', mr: 'संचालन', gu: 'સંચાલન', pa: 'ਸੰਚਾਲਨ',
    ta: 'மேலாண்மை', kn: 'ಕಾರ್ಯಾಚರಣೆ', te: 'సంచాలనం', ml: 'പ്രവർത്തனம்', bn: 'চালনা',
    or: 'ସଞ୍চালନ', mn: 'সঞ্চালন', as: 'সঞ্চালন', bho: 'संचालन'
  },
  registry: {
    en: 'Registry', hi: 'पंजीकरण', mr: 'नोंदणी', gu: 'નોંધણી', pa: 'ਰਜਿਸਟਰੀ',
    ta: 'பதிவேடு', kn: 'ನೋಂದಣಿ', te: 'రిజిస్ట్రీ', ml: 'രജിസ്ട്രി', bn: 'রেজিস্ট্রি',
    or: 'ପଞ୍ଜୀକରଣ', mn: 'রেজিস্ট্রি', as: 'পঞ্জীয়ন', bho: 'रजिस्ट्री'
  },
  insights: {
    en: 'Insights', hi: 'सूझबूझ', mr: 'अंतर्दृष्टी', gu: 'આંતરદૃષ્ટિ', pa: 'ਸੂਝ',
    ta: 'நுண்ணறிவு', kn: 'ಒಳನೋಟಗಳು', te: 'అంతర్దృష్టి', ml: 'ഉൾക്കാഴ്ചകൾ', bn: 'অন্তর্দৃষ্টি',
    or: 'ଅନ୍ତର୍ଦୃଷ୍ଟି', mn: 'অন্তর্দৃষ্টি', as: 'অন্তর্দৃষ্টি', bho: 'सूझबूझ'
  }
}
