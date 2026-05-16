/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Sovereign Recovery Engine: Automated Draft Saving
 * ============================================================
 * Hook: useOfflineCart (v1.2)
 * ============================================================ */

import { useEffect, useCallback, useRef } from 'react';
import { vault } from '@/lib/offlineVault';
import { logger } from '@/core/observability/logger';
import type { CartSession } from '@/lib/dexie';

interface UseOfflineCartArgs {
  sessionId: string;
  cartItems: any[];
  trnMode: string;
  customerCode: string;
  addons: any[];
  remarks: string;
  onRestore?: (session: CartSession) => void;
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
  const debounceTimer = useRef<any>(null);

  // ── [R2] DETERMINISTIC RECOVERY ON MOUNT ─────────────────────────────
  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;

    const restoreDraft = async () => {
      try {
        const session = await vault.loadSession(sessionId);
        if (session && session.cart_items.length > 0 && onRestore) {
          logger.log('INFO', `Recovering billing draft: ${sessionId}`, {
            module: 'BILLING',
            workflow: 'FAILURE_RECOVERY',
            session_id: sessionId,
            item_count: session.cart_items.length
          });
          onRestore(session);
        }
      } catch (err) {
        logger.log('ERROR', `Draft recovery failed: ${sessionId}`, {
          module: 'BILLING',
          workflow: 'FAILURE_RECOVERY',
          error: String(err)
        });
      }
    };

    restoreDraft();
  }, [sessionId, onRestore]);

  // ── [R2] AUTOMATED DRAFT PERSISTENCE (DEBOUNCED) ─────────────────────
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (cartItems.length === 0) {
        // If cart is explicitly emptied by user, clear the draft
        await vault.deleteSession(sessionId);
        return;
      }

      const draft: CartSession = {
        session_id: sessionId,
        trn_type: 1300,
        till_id: 'T01', // TODO: Get from TerminalContext
        cashier_code: 'C-001', // TODO: Get from AuthContext
        customer_code: customerCode,
        trn_mode: trnMode,
        cart_items: cartItems,
        addons,
        remarks,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        await vault.saveSession(draft);
      } catch (err) {
        // Passive logging for persistence failures
        console.error('Dexie Persistence Error:', err);
      }
    }, 500); // 500ms debounce to protect Disk I/O

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [cartItems, trnMode, customerCode, addons, remarks, sessionId]);

  const clearVault = useCallback(async () => {
    await vault.deleteSession(sessionId);
  }, [sessionId]);

  return { clearVault };
}
