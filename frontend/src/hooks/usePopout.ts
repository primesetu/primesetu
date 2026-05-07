/* ============================================================
 * SMRITI-OS — usePopout hook
 * Manages the lifecycle of a browser popup window for a module.
 * Uses localStorage as a shared channel between parent & popup.
 * ============================================================ */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface PopoutEntry {
  winKey: string;
  mid: string;
  popupRef: Window | null;
}

/**
 * usePopout — Single-instance popout manager.
 *
 * Usage:
 *   const { poppedOut, launchPopout, closePopout } = usePopout();
 *
 * poppedOut: Set<winKey>  — which windows are currently in popout mode
 * launchPopout(winKey, mid, title)  — opens popup, hides in-desktop window
 * closePopout(winKey)               — programmatically close the popup
 */
export function usePopout(onPopoutClosed: (winKey: string) => void) {
  // Track which winKeys are currently popped out
  const [poppedOut, setPoppedOut] = useState<Set<string>>(new Set());
  // Keep a ref to the popup window objects (key -> Window)
  const popupRefs = useRef<Map<string, Window>>(new Map());

  const launchPopout = useCallback((winKey: string, mid: string, title: string) => {
    // If already popped out, focus the existing popup
    const existing = popupRefs.current.get(winKey);
    if (existing && !existing.closed) {
      existing.focus();
      return;
    }

    const url = `${window.location.origin}/popout/${encodeURIComponent(mid)}`;
    const popup = window.open(
      url,
      `smriti_popup_${winKey}`,
      `width=1280,height=800,left=100,top=80,resizable=yes,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no,directories=no,personalbar=no,titlebar=no`
    );

    if (!popup) {
      alert('Popup blocked! Please allow popups for this site.');
      return;
    }

    popup.focus();
    popupRefs.current.set(winKey, popup);
    setPoppedOut(prev => new Set(prev).add(winKey));
    // Clear any stale closed flag
    localStorage.removeItem(`sov_popup_${winKey}`);
  }, []);

  const closePopout = useCallback((winKey: string) => {
    const popup = popupRefs.current.get(winKey);
    if (popup && !popup.closed) {
      popup.close();
    }
    popupRefs.current.delete(winKey);
    setPoppedOut(prev => { const s = new Set(prev); s.delete(winKey); return s; });
    localStorage.removeItem(`sov_popup_${winKey}`);
  }, []);

  // Poll for popup close events via localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      for (const [winKey, popup] of popupRefs.current.entries()) {
        const storageFlag = localStorage.getItem(`sov_popup_${winKey}`);
        // Detect close either by polling the window object or by the localStorage flag
        if (popup.closed || storageFlag === 'closed') {
          popupRefs.current.delete(winKey);
          setPoppedOut(prev => { const s = new Set(prev); s.delete(winKey); return s; });
          localStorage.removeItem(`sov_popup_${winKey}`);
          onPopoutClosed(winKey);
        }
      }
    }, 800);
    return () => clearInterval(interval);
  }, [onPopoutClosed]);

  return { poppedOut, launchPopout, closePopout };
}
