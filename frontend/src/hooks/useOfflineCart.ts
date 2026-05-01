// Persists the active cart to IndexedDB on every change.
// Restores cart on mount (crash recovery).

import { useEffect, useCallback, useRef } from 'react';
import { vault } from '@/lib/offlineVault';
import type { CartSession } from '@/lib/offlineVault';

const TILL_ID      = 'T01';
const CASHIER_CODE = 'C-001';   // TODO: from auth context

interface UseOfflineCartArgs {
  sessionId:    string;
  cartItems:    any[];
  trnMode:      string;
  customerCode: string;
  addons:       any[];
  remarks:      string;
  onRestore?:   (session: CartSession) => void;
}

export function useOfflineCart({
  sessionId,
  cartItems,
  trnMode,
  customerCode,
  addons,
  remarks,
  onRestore,
}: UseOfflineCartArgs) {
  const didRestore = useRef(false);

  // Restore on mount — crash recovery
  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;

    vault.loadSession(sessionId).then(session => {
      if (session && session.cart_items.length > 0 && onRestore) {
        onRestore(session);
      }
    });
  }, [sessionId, onRestore]);

  // Persist on every cart change
  useEffect(() => {
    if (cartItems.length === 0) {
      vault.deleteSession(sessionId);
      return;
    }
    vault.saveSession({
      session_id:    sessionId,
      trn_type:      1300,
      till_id:       TILL_ID,
      cashier_code:  CASHIER_CODE,
      customer_code: customerCode,
      trn_mode:      trnMode,
      cart_items:    cartItems,
      addons,
      remarks,
      created_at:    new Date().toISOString(),
      updated_at:    new Date().toISOString(),
    });
  }, [cartItems, trnMode, customerCode, addons, remarks, sessionId]);

  const clearVault = useCallback(() => {
    vault.deleteSession(sessionId);
  }, [sessionId]);

  return { clearVault };
}
