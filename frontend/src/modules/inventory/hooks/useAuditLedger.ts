import { useCallback } from 'react';
import { vault } from '@/lib/offlineVault';
import type { LedgerAction } from '@/lib/offlineVault';

const TERMINAL_ID = 'T01-A';
const CASHIER_CODE = 'C-001'; // TODO: from auth context

export function useAuditLedger(sessionId: string) {
  const logEvent = useCallback(async (action: LedgerAction, payload: any) => {
    try {
      await vault.logEvent({
        session_id: sessionId,
        action,
        payload,
        cashier_code: CASHIER_CODE,
        terminal_id: TERMINAL_ID,
      });
    } catch (err) {
      console.error('[AUDIT] Failed to log event:', err);
    }
  }, [sessionId]);

  return { logEvent };
}
