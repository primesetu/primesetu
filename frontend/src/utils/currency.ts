/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

/**
 * Converts rupees (float/string) to paise (integer).
 * Ensures no floating point errors during conversion.
 */
export const toPaise = (rupees: number | string): number => {
  const amount = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(amount)) return 0;
  return Math.round(amount * 100);
};

/**
 * Converts paise (integer) to rupees (float).
 * @deprecated Use integer arithmetic for formatting (BUG-07 Fix)
 */
export const toRupees = (paise: number): number => {
  return paise / 100;
};

/**
 * Formats paise as a localized currency string (INR).
 * Sovereign Fix: Uses integer arithmetic to prevent floating point drift.
 */
export const formatCurrency = (paise: number): string => {
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const cents = absPaise % 100;
  
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0
  }).format(rupees);

  const result = `₹${formatted}.${cents.toString().padStart(2, '0')}`;
  return paise < 0 ? `-${result}` : result;
};

/**
 * Formats paise as a simple decimal string.
 */
export const formatDecimal = (paise: number): string => {
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const cents = absPaise % 100;
  const result = `${rupees}.${cents.toString().padStart(2, '0')}`;
  return paise < 0 ? `-${result}` : result;
};
