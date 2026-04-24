/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "billing": "Billing / POS",
      "items": "Items",
      "mrp": "MRP",
      "qty": "Qty",
      "disc": "Disc %",
      "total": "Total",
      "payable": "Net Payable",
      "settle": "Settle Bill",
      "suspend": "Suspend",
      "search": "Search Item",
      "balance": "Balance Due",
      "change": "Change Back",
      "digital_receipt": "Digital Receipt",
      "mobile": "Mobile",
      "isolated": "TERMINAL ISOLATED",
      "syncing": "PENDING SYNC"
    }
  },
  hi: {
    translation: {
      "billing": "बिलिंग / POS",
      "items": "वस्तुएं",
      "mrp": "एमआरपी",
      "qty": "मात्रा",
      "disc": "छूट %",
      "total": "कुल",
      "payable": "कुल देय",
      "settle": "बिल सेटल करें",
      "suspend": "स्थगित करें",
      "search": "आइटम खोजें",
      "balance": "बकाया राशि",
      "change": "वापसी राशि",
      "digital_receipt": "डिजिटल रसीद",
      "mobile": "मोबाइल",
      "isolated": "टर्मिनल अलग है",
      "syncing": "सिंक लंबित है"
    }
  }
};

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
