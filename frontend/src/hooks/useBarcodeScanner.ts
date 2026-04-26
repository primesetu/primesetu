/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import { useEffect, useRef } from 'react';

/**
 * Barcode scanners send keystrokes ending in Enter.
 * Typical scan speed: 40-100 chars in < 100ms.
 * We detect scans by measuring keystroke velocity.
 */
export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const SCAN_THRESHOLD_MS = 50; // keystrokes faster than this = scanner, not keyboard

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const timeSinceLast = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (bufferRef.current.length >= 6) {
          onScan(bufferRef.current);
          bufferRef.current = '';
          e.preventDefault();
        }
        return;
      }

      // If keystrokes are very fast → scanner input, accumulate
      if (timeSinceLast < SCAN_THRESHOLD_MS || bufferRef.current.length > 0) {
        if (e.key.length === 1) {
          bufferRef.current += e.key;
        }
      } else {
        // Slow keystrokes → normal keyboard, clear buffer
        bufferRef.current = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScan]);
}
