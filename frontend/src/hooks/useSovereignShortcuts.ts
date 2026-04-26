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
import { useEffect } from 'react';

/**
 * Sovereign Shortcut Guard
 * Disables default browser shortcuts to prevent accidental disruption.
 * Only whitelisted PrimeSetu shortcuts are allowed.
 */
export function useSovereignShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Whitelist common interaction keys
      const whitelistedKeys = ['Enter', 'Escape', 'Tab', 'Backspace', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Delete'];
      if (whitelistedKeys.includes(e.key) && !e.ctrlKey && !e.altKey) {
        return;
      }

      // 2. Handle PrimeSetu Specific Shortcuts (Whitelist)
      // Ctrl + K: Command Bar
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        return; 
      }

      // F1 - F12: Functional Shortcuts (Allow)
      if (e.key.startsWith('F')) {
        // Prevent default browser F-key actions (like F1 help, F3 search, F5 reload)
        // But allow the event to propagate to our components
        e.preventDefault();
        return;
      }

      // 3. Block Dangerous Browser Shortcuts (Ctrl / Cmd only)
      if (e.ctrlKey || e.metaKey) {
        // Block: S (Save), P (Print), N (New), T (Tab), W (Close), R (Reload), F (Find), D (Bookmark)
        const blockedChars = ['s', 'p', 'n', 't', 'w', 'r', 'f', 'd', 'j', 'u'];
        if (blockedChars.includes(e.key.toLowerCase())) {
          console.warn(`[PrimeSetu] Sovereign Guard: Blocked browser shortcut Ctrl+${e.key.toUpperCase()}`);
          e.preventDefault();
          e.stopPropagation();
        }
      }

      // 4. Block Reload (F5)
      if (e.key === 'F5') {
        e.preventDefault();
      }
    };

    // 5. Block Context Menu (Right Click) for Native Feel
    const handleContextMenu = (e: MouseEvent) => {
      // Allow right-click ONLY if holding Ctrl + Shift (Dev Backdoor)
      if (!e.ctrlKey || !e.shiftKey) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
}
