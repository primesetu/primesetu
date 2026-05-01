import { useCallback, useState } from 'react';
import { vault } from '@/lib/offlineVault';
import type { LedgerEntry } from '@/lib/offlineVault';

export function useReplayEngine() {
  const [isReplaying, setIsReplaying] = useState(false);

  const rebuildStateFromEvents = useCallback(async (sessionId: string) => {
    setIsReplaying(true);
    try {
      const events = await vault.getLedgerBySession(sessionId);
      // Sort events by timestamp (they should be naturally sorted by ID, but TS is safer)
      const sortedEvents = events.sort((a, b) => a.timestamp - b.timestamp);

      let cart: any[] = [];
      let customer: any = null;

      for (const event of sortedEvents) {
        switch (event.action) {
          case 'CART_ADD':
            cart.push(event.payload);
            break;
          case 'CART_REMOVE':
            cart = cart.filter(i => i.id !== event.payload.id);
            break;
          case 'CART_QTY_CHANGE':
            cart = cart.map(i => i.id === event.payload.id ? { ...i, qty: event.payload.qty, total: event.payload.total } : i);
            break;
          case 'CART_CLEAR':
          case 'BILL_FINALIZE_SUCCESS':
            cart = [];
            break;
          // Add more cases as the ledger grows
        }
      }

      return { cart, customer };
    } catch (err) {
      console.error('[REPLAY] Rebuild failed:', err);
      return null;
    } finally {
      setIsReplaying(false);
    }
  }, []);

  return { rebuildStateFromEvents, isReplaying };
}
