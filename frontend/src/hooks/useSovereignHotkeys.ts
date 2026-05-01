import { useEffect } from 'react';
import type { HotkeyMask, HotkeyAction } from '@/types/billing.hotkeys';

export interface HotkeyHandlers {
  new_bill:              () => void;
  suspend_bill:          () => void;
  recall_bill:           () => void;
  settle_bill:           () => void;
  exact_cash:            () => void;
  open_discount:         () => void;
  open_addons:           () => void;
  open_item_search:      () => void;
  open_customer_search:  () => void;
  focus_barcode:         () => void;
  focus_qty:             () => void;
  delete_last_item:      () => void;
  void_bill:             () => void;
}

interface UseSovereignHotkeysArgs {
  mask:        HotkeyMask[];
  handlers:    HotkeyHandlers;
  cartEmpty:   boolean;
}

export function useSovereignHotkeys({ mask, handlers, cartEmpty }: UseSovereignHotkeysArgs) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Format the pressed key string (e.g., 'f8', 'ctrl+4')
      const keys = [];
      if (e.ctrlKey)  keys.push('ctrl');
      if (e.altKey)   keys.push('alt');
      if (e.shiftKey) keys.push('shift');
      
      const keyName = e.key.toLowerCase();
      // Only add non-modifier keys
      if (!['control', 'alt', 'shift'].includes(keyName)) {
        keys.push(keyName);
      }
      
      const combo = keys.join('+');

      // 2. Find matching hotkey in the mask
      const hk = mask.find(h => h.key.toLowerCase() === combo);
      
      if (hk && hk.enabled) {
        // Guard: some actions require non-empty cart
        if (hk.condition === 'cart_non_empty' && cartEmpty) return;

        // Prevent default browser/POS behavior
        e.preventDefault();
        
        const fn = handlers[hk.action as keyof HotkeyHandlers];
        if (fn) fn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mask, handlers, cartEmpty]);
}
