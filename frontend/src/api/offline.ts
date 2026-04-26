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
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'primesetu_sovereign_cache';
const STORE_NAME = 'transaction_queue';

export interface QueuedTransaction {
  id: string;
  data: any;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase>;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const offlineService = {
  /**
   * Queue a transaction when the terminal is isolated (offline).
   */
  async queueTransaction(data: any) {
    const db = await getDB();
    const id = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    await db.put(STORE_NAME, {
      id,
      data,
      timestamp: Date.now(),
    });
    console.log('Transaction safely committed to Sovereign Offline Vault:', id);
    return id;
  },

  /**
   * Fetch all transactions waiting in the isolation vault.
   */
  async getQueue(): Promise<QueuedTransaction[]> {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },

  /**
   * Remove a transaction from the vault after successful cloud sync.
   */
  async clearItem(id: string) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },

  /**
   * Check if there are pending transactions in the vault.
   */
  async getQueueCount() {
    const db = await getDB();
    return db.count(STORE_NAME);
  }
};
