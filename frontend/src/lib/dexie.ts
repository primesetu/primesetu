import Dexie, { type EntityTable } from 'dexie';

/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Sovereign Offline Vault (Dexie.js Implementation)
 * ============================================================ */

export interface CartSession {
  session_id: string;
  trn_type: number;
  till_id: string;
  cashier_code: string;
  customer_code: string;
  trn_mode: string;
  cart_items: any[];
  addons: any[];
  remarks: string;
  created_at: string;
  updated_at: string;
}

export interface QueueEntry {
  id?: number;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  payload: any;
  status: 'pending' | 'syncing' | 'done' | 'failed';
  created_at: string;
  attempts: number;
  last_error?: string;
  tag: string;
}

export interface MaskCacheEntry {
  key: string;
  data: any;
  fetched_at: string;
  trn_type: number;
}

export interface LedgerEntry {
  id?: number;
  session_id: string;
  action: string;
  payload: any;
  cashier_code: string;
  terminal_id: string;
  timestamp: number;
}

export interface DataCacheEntry {
  key: string;
  data: any;
  updated_at: number;
}

export interface QueuedTransaction {
  id: string;
  data: any;
  timestamp: number;
}

// Unified Database Instance
export const db = new Dexie('SmritiSovereignVault') as Dexie & {
  cart_sessions: EntityTable<CartSession, 'session_id'>;
  write_queue: EntityTable<QueueEntry, 'id'>;
  mask_cache: EntityTable<MaskCacheEntry, 'key'>;
  offline_ledger: EntityTable<LedgerEntry, 'id'>;
  data_cache: EntityTable<DataCacheEntry, 'key'>;
  transaction_queue: EntityTable<QueuedTransaction, 'id'>;
};

db.version(1).stores({
  cart_sessions: 'session_id',
  write_queue: '++id, status',
  mask_cache: 'key',
  offline_ledger: '++id, session_id, action',
  data_cache: 'key',
  transaction_queue: 'id'
});

export default db;
