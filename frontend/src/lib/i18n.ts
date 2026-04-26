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

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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
    ta: 'முற்றம்', kn: 'ಅಂಗಳ', te: 'అంగణం', ml: 'മുറ്റം', bn: 'উঠান',
    or: 'ଅଗଣା', mn: 'সঙৈ', as: 'চোতাল', bho: 'अँगना'
  },
  bazaar: {
    en: 'Bazaar', hi: 'बाज़ार', mr: 'बाजार', gu: 'બજાર', pa: 'ਬਾਜ਼ਾਰ',
    ta: 'சந்தை', kn: 'ಮಾರುಕಟ್ಟೆ', te: 'బజారు', ml: 'ചന്ത', bn: 'বাজার',
    or: 'ବଜାର', mn: 'কৈথেল', as: 'বজাৰ', bho: 'बाजार'
  },
  khazana: {
    en: 'Khazana', hi: 'खज़ाना', mr: 'खजिना', gu: 'ખજાનો', pa: 'ખજાના',
    ta: 'கருवூலம்', kn: 'ಖಜಾನೆ', te: 'ఖజానా', ml: 'ಖಜನಾವು', bn: 'খাজনা',
    or: 'ଖଜଣା', mn: 'লন', as: 'খাজনা', bho: 'खजाना'
  },
  khatavahi: {
    en: 'Khatavahi', hi: 'खाता बही', mr: 'खातेवही', gu: 'ખાતાવહી', pa: 'ਖਾਤਾ ਵਹੀ',
    ta: 'கணக்குப் புத்தகம்', kn: 'ಖಾತೆ ಪುಸ್ತಕ', te: 'ఖాతా పుస్తకం', ml: 'കണക്കു പുസ്തകം', bn: 'খাতা বই',
    or: 'ଖାତା ବହି', mn: 'চেকশঙ', as: 'খাতা বহী', bho: 'खाता बही'
  },
  billing: {
    en: 'Billing (POS)', hi: 'बिलिंग / POS', mr: 'बिलिंग', gu: 'બિલિંગ', pa: 'ਬਿਲਿੰਗ',
    ta: 'பில்லிங்', kn: 'ಬಿಲ್ಲಿಂಗ್', te: 'బిల్లింగ్', ml: 'ബില്ലിംഗ്', bn: 'বিলিং',
    or: 'ବିଲିଂ', mn: 'বিলিং', as: 'বিলিং', bho: 'बिलिंग'
  },
  inward: {
    en: 'Inward (GRN)', hi: 'आवक (GRN)', mr: 'आवक', gu: 'આવક', pa: 'ਆਮਦ',
    ta: 'உள்வரவு', kn: 'ಒಳಬರುವಿಕೆ', te: 'ఇన్వర్డ్', ml: 'ഇൻവേർഡ്', bn: 'ইনওয়ার্ড',
    or: 'ଇନୱାର୍ଡ', mn: 'ইনওয়ার্ড', as: 'ইনওয়ার্ড', bho: 'आवक'
  },
  outward: {
    en: 'Outward (Returns)', hi: 'जावक', mr: 'जावक', gu: 'જાવક', pa: 'ਨਿਕਾਸ',
    ta: 'வெளிச்செல்லுதல்', kn: 'ಹೊರಹೋಗುವಿಕೆ', te: 'అవుట్వర్డ్', ml: 'ഔട്ട്‌വേർഡ്', bn: 'আউটওয়ার্ড',
    or: 'ଆଉଟୱାର୍ଡ', mn: 'আউটওয়ার্ড', as: 'আউটওয়ার্ড', bho: 'जावक'
  },
  masters: {
    en: 'Masters (Registry)', hi: 'मास्टर्स', mr: 'मास्टर्स', gu: 'માસ્ટર્સ', pa: 'ਮਾਸਟਰਸ',
    ta: 'மாஸ்டர்ஸ்', kn: 'ಮಾಸ್ಟರ್ಸ್', te: 'ಮಾಸ್ಟರ್ಸ್', ml: 'മാസ്റ്റേഴ്സ്', bn: 'মাস্টার্স',
    or: 'ମାଷ୍ଟର୍ସ', mn: 'মাস্টার্স', as: 'মাষ্টাৰ্ছ', bho: 'मास्टर्स'
  },
  audit: {
    en: 'Audit / Reconcile', hi: 'ऑडिट', mr: 'ऑडिट', gu: 'ઓડિટ', pa: 'ਆਡਿਟ',
    ta: 'தணிக்கை', kn: 'ಲೆಕ್ಕಪರಿಶೋಧನೆ', te: 'ఆడిట్', ml: 'ഓഡിറ്റ്', bn: 'অডিট',
    or: 'ଅଡିଟ୍', mn: 'অডিট', as: 'অডিট', bho: 'ऑडिट'
  },
  sashakt: {
    en: 'Sashakt', hi: 'सशक्त', mr: 'सशक्त', gu: 'સશક્ત', pa: 'ਸਸ਼ਕਤ',
    ta: 'அதிகாரம்', kn: 'ಸಶಕ್ತ', te: 'సశక్తం', ml: 'ശക്തമായ', bn: 'সশক্ত',
    or: 'ସଶକ୍ତ', mn: 'সশক্ত', as: 'সশক্ত', bho: 'सशक्त'
  },
  sanchalan: {
    en: 'Sanchalan', hi: 'संचालन', mr: 'संचालन', gu: 'સંચાલન', pa: 'ਸੰਚਾਲਨ',
    ta: 'மேலாண்மை', kn: 'ಕಾರ್ಯಾಚರಣೆ', te: 'సంచాలనం', ml: 'പ്രവർത്തனம்', bn: 'চালনা',
    or: 'ସଞ୍ଚାଲନ', mn: 'সঞ্চালন', as: 'সঞ্চালন', bho: 'संचालन'
  }
}

// Convert Sovereign Dictionary to i18next resources
const resources: any = {};
Object.keys(LANGUAGES).forEach(lang => {
  resources[lang] = { translation: {} };
});

Object.entries(DICTIONARY).forEach(([key, values]) => {
  Object.entries(values).forEach(([lang, translation]) => {
    if (resources[lang]) {
      resources[lang].translation[key] = translation;
    }
  });
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
