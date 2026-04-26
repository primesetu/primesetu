/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

/**
 * Calculate EAN-13 check digit from first 12 digits.
 * GS1 standard: alternating weights 1 and 3, modulo 10.
 */
export const calculateEAN13CheckDigit = (digits12: string): string => {
  if (digits12.length !== 12 || !/^\d+$/.test(digits12)) {
    throw new Error(`EAN-13 base must be exactly 12 digits, got: ${digits12}`);
  }

  let total = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits12[i]);
    total += digit * (i % 2 === 1 ? 3 : 1);
  }
  
  const check = (10 - (total % 10)) % 10;
  return check.toString();
};

/**
 * Generate full 13-digit EAN-13 barcode.
 */
export const generateEAN13 = (digits12: string): string => {
  return digits12 + calculateEAN13CheckDigit(digits12);
};

/**
 * Validate a 13-digit EAN-13 barcode.
 */
export const validateEAN13 = (barcode: string): boolean => {
  if (barcode.length !== 13 || !/^\d+$/.test(barcode)) return false;
  try {
    const expected = calculateEAN13CheckDigit(barcode.substring(0, 12));
    return barcode[12] === expected;
  } catch (e) {
    return false;
  }
};

/**
 * Generates an internal barcode based on the Sovereign Protocol:
 * {PREFIX}{SEQ:06d}{SIZE_CODE}
 */
export const generateInternalBarcode = (
  prefix: string, 
  sequence: number, 
  sizeCode: string = ''
): string => {
  const seqStr = sequence.toString().padStart(6, '0');
  return `${prefix}${seqStr}${sizeCode}`.toUpperCase();
};

/**
 * Validates if a barcode follows the internal protocol.
 */
export const isInternalBarcode = (barcode: string, prefix: string): boolean => {
  return barcode.startsWith(prefix) && barcode.length >= (prefix.length + 6);
};
