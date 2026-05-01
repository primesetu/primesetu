// RULE-024: Every write is vaulted before it is sent.
// IndexedDB is the source of truth when the network is absent.
// The queue is drained in FIFO order when connectivity restores.

import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME    = 'primesetu-vault';
const DB_VERSION = 1;

interface VaultSchema extends DBSchema {
  cart_sessions: {
    key:   string;         // session_id
    value: CartSession;
  };
  write_queue: {
    key:       number;     // auto-increment
    value:     QueueEntry;
    indexes:   { by_status: string };
  };
  mask_cache: {
    key:   string;         // e.g. 'entry-1300'
    value: MaskCacheEntry;
  };
  offline_ledger: {
    key:       number;     // auto-increment
    value:     LedgerEntry;
    indexes:   { by_session: string, by_action: string };
  };
}

export type LedgerAction = 
  | 'CART_ADD' 
  | 'CART_REMOVE' 
  | 'CART_QTY_CHANGE' 
  | 'CART_CLEAR' 
  | 'BILL_FINALIZE_START' 
  | 'BILL_FINALIZE_SUCCESS' 
  | 'BILL_FINALIZE_VAULTED' 
  | 'MANAGER_OVERRIDE_APPROVED'
  | 'MANAGER_OVERRIDE_DENIED';

export interface LedgerEntry {
  id?:          number;
  session_id:   string;
  action:       LedgerAction;
  payload:      any;
  cashier_code: string;
  terminal_id:  string;
  timestamp:    number;
}

export interface CartSession {
  session_id:    string;
  trn_type:      number;
  till_id:       string;
  cashier_code:  string;
  customer_code: string;
  trn_mode:      string;
  cart_items:    any[];
  addons:        any[];
  remarks:       string;
  created_at:    string;
  updated_at:    string;
}

export interface QueueEntry {
  id?:          number;
  endpoint:     string;
  method:       'POST' | 'PUT' | 'PATCH';
  payload:      any;
  status:       'pending' | 'syncing' | 'done' | 'failed';
  created_at:   string;
  attempts:     number;
  last_error?:  string;
  tag:          string;   // e.g. 'bill_finalize' | 'override_audit'
}

export interface MaskCacheEntry {
  key:        string;
  data:       any;
  fetched_at: string;
  trn_type:   number;
}

let db: IDBPDatabase<VaultSchema> | null = null;

async function getDB(): Promise<IDBPDatabase<VaultSchema>> {
  if (db) return db;
  db = await openDB<VaultSchema>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      database.createObjectStore('cart_sessions', { keyPath: 'session_id' });
      const wq = database.createObjectStore('write_queue', { keyPath: 'id', autoIncrement: true });
      wq.createIndex('by_status', 'status');
      database.createObjectStore('mask_cache', { keyPath: 'key' });
      const ledger = database.createObjectStore('offline_ledger', { keyPath: 'id', autoIncrement: true });
      ledger.createIndex('by_session', 'session_id');
      ledger.createIndex('by_action', 'action');
    },
  });
  return db;
}

// ── CART SESSION ─────────────────────────────────────────────

export const vault = {
  async saveSession(session: CartSession): Promise<void> {
    const d = await getDB();
    await d.put('cart_sessions', { ...session, updated_at: new Date().toISOString() });
  },

  async loadSession(session_id: string): Promise<CartSession | undefined> {
    const d = await getDB();
    return d.get('cart_sessions', session_id);
  },

  async deleteSession(session_id: string): Promise<void> {
    const d = await getDB();
    await d.delete('cart_sessions', session_id);
  },

  async allSessions(): Promise<CartSession[]> {
    const d = await getDB();
    return d.getAll('cart_sessions');
  },

  // ── WRITE QUEUE ─────────────────────────────────────────────

  async enqueue(entry: Omit<QueueEntry, 'id' | 'status' | 'attempts' | 'created_at'>): Promise<number> {
    const d = await getDB();
    return d.add('write_queue', {
      ...entry,
      status:     'pending',
      attempts:   0,
      created_at: new Date().toISOString(),
    } as QueueEntry);
  },

  async getPendingQueue(): Promise<QueueEntry[]> {
    const d = await getDB();
    return d.getAllFromIndex('write_queue', 'by_status', 'pending');
  },

  async markSyncing(id: number): Promise<void> {
    const d = await getDB();
    const entry = await d.get('write_queue', id);
    if (entry) await d.put('write_queue', { ...entry, status: 'syncing', attempts: entry.attempts + 1 });
  },

  async markDone(id: number): Promise<void> {
    const d = await getDB();
    const entry = await d.get('write_queue', id);
    if (entry) await d.put('write_queue', { ...entry, status: 'done' });
  },

  async markFailed(id: number, error: string): Promise<void> {
    const d = await getDB();
    const entry = await d.get('write_queue', id);
    if (entry) await d.put('write_queue', { ...entry, status: entry.attempts >= 3 ? 'failed' : 'pending', last_error: error });
  },

  async queueDepth(): Promise<number> {
    const pending = await vault.getPendingQueue();
    return pending.length;
  },

  // ── MASK CACHE ───────────────────────────────────────────────

  async cacheMask(key: string, data: any, trnType: number): Promise<void> {
    const d = await getDB();
    await d.put('mask_cache', { key, data, fetched_at: new Date().toISOString(), trn_type: trnType });
  },

  async getCachedMask(key: string): Promise<any | null> {
    const d = await getDB();
    const entry = await d.get('mask_cache', key);
    return entry?.data ?? null;
  },

  // ── AUDIT LEDGER ─────────────────────────────────────────────

  async logEvent(entry: Omit<LedgerEntry, 'id' | 'timestamp'>): Promise<number> {
    const d = await getDB();
    return d.add('offline_ledger', {
      ...entry,
      timestamp: Date.now(),
    } as LedgerEntry);
  },

  async getLedgerBySession(session_id: string): Promise<LedgerEntry[]> {
    const d = await getDB();
    return d.getAllFromIndex('offline_ledger', 'by_session', session_id);
  },

  async clearLedger(session_id?: string): Promise<void> {
    const d = await getDB();
    if (session_id) {
      const keys = await d.getAllKeysFromIndex('offline_ledger', 'by_session', session_id);
      for (const key of keys) await d.delete('offline_ledger', key);
    } else {
      await d.clear('offline_ledger');
    }
  },
};
