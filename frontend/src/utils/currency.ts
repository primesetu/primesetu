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
 */
export const toRupees = (paise: number): number => {
  return paise / 100;
};

/**
 * Formats paise as a localized currency string (INR).
 */
export const formatCurrency = (paise: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(toRupees(paise));
};

/**
 * Formats paise as a simple decimal string.
 */
export const formatDecimal = (paise: number): string => {
  return toRupees(paise).toFixed(2);
};
