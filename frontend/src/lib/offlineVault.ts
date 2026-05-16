import db, { CartSession, QueueEntry, LedgerEntry, MaskCacheEntry } from './dexie';
export { type LedgerEntry };

export type LedgerAction = 'ADD_ITEM' | 'REMOVE_ITEM' | 'VOID_ITEM' | 'APPLY_DISCOUNT' | 'UPDATE_QTY' | 'CLEAR_CART' | 'PAYMENT_START' | 'PAYMENT_COMPLETE' | 'PAYMENT_FAILED' | string;

/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Sovereign Offline Vault Wrapper
 * ============================================================ */

export const vault = {
  // ── CART SESSION ─────────────────────────────────────────────
  async saveSession(session: CartSession): Promise<void> {
    await db.cart_sessions.put({ ...session, updated_at: new Date().toISOString() });
  },

  async loadSession(session_id: string): Promise<CartSession | undefined> {
    return db.cart_sessions.get(session_id);
  },

  async deleteSession(session_id: string): Promise<void> {
    await db.cart_sessions.delete(session_id);
  },

  async allSessions(): Promise<CartSession[]> {
    return db.cart_sessions.toArray();
  },

  // ── WRITE QUEUE ─────────────────────────────────────────────
  async enqueue(entry: Omit<QueueEntry, 'id' | 'status' | 'attempts' | 'created_at'>): Promise<number> {
    return db.write_queue.add({
      ...entry,
      status: 'pending',
      attempts: 0,
      created_at: new Date().toISOString(),
    } as QueueEntry);
  },

  async getPendingQueue(): Promise<QueueEntry[]> {
    return db.write_queue.where('status').equals('pending').toArray();
  },

  async markSyncing(id: number): Promise<void> {
    await db.write_queue.update(id, { status: 'syncing' });
    const entry = await db.write_queue.get(id);
    if (entry) await db.write_queue.update(id, { attempts: entry.attempts + 1 });
  },

  async markDone(id: number): Promise<void> {
    await db.write_queue.update(id, { status: 'done' });
  },

  async markFailed(id: number, error: string): Promise<void> {
    const entry = await db.write_queue.get(id);
    if (entry) {
      await db.write_queue.update(id, { 
        status: entry.attempts >= 3 ? 'failed' : 'pending', 
        last_error: error 
      });
    }
  },

  async queueDepth(): Promise<number> {
    return db.write_queue.where('status').equals('pending').count();
  },

  // ── MASK CACHE ───────────────────────────────────────────────
  async cacheMask(key: string, data: any, trnType: number): Promise<void> {
    await db.mask_cache.put({ key, data, fetched_at: new Date().toISOString(), trn_type: trnType });
  },

  async getCachedMask(key: string): Promise<any | null> {
    const entry = await db.mask_cache.get(key);
    return entry?.data ?? null;
  },

  // ── AUDIT LEDGER ─────────────────────────────────────────────
  async logEvent(entry: Omit<LedgerEntry, 'id' | 'timestamp'>): Promise<number> {
    return db.offline_ledger.add({
      ...entry,
      timestamp: Date.now(),
    } as LedgerEntry);
  },

  async getLedgerBySession(session_id: string): Promise<LedgerEntry[]> {
    return db.offline_ledger.where('session_id').equals(session_id).toArray();
  },

  async clearLedger(session_id?: string): Promise<void> {
    if (session_id) {
      await db.offline_ledger.where('session_id').equals(session_id).delete();
    } else {
      await db.offline_ledger.clear();
    }
  },
};
