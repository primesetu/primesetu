/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R. M.
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useState, useEffect } from 'react';
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'PrimeSetuOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'data_cache';

/**
 * Initialize IndexedDB for Offline Persistence
 */
const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

/**
 * useOfflineFallback Hook
 * Wraps data fetching with IndexedDB persistence.
 * If network fails or offline, returns the last known good state from Sovereign storage.
 */
export function useOfflineFallback<T>(
  key: string,
  fetcher: () => Promise<T>,
  initialData: T
) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOfflineData, setIsOfflineData] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const db = await initDB();
      
      // 1. Try to load initial cache from IndexedDB
      const cached = await db.get(STORE_NAME, key);
      if (cached && isMounted) {
        setData(cached);
      }

      try {
        if (isMounted) setLoading(true);
        
        // 2. Fetch from Live Backend
        const result = await fetcher();
        
        if (isMounted) {
          setData(result);
          setIsOfflineData(false);
          // 3. Update Sovereign Cache
          await db.put(STORE_NAME, result, key);
        }
      } catch (err) {
        console.warn(`[PrimeSetu] Offline Fallback Active for ${key}:`, err);
        
        // 4. Engaging Sovereign Offline Fallback
        const saved = await db.get(STORE_NAME, key);
        if (saved && isMounted) {
          setData(saved);
          setIsOfflineData(true);
        }
        if (isMounted) setError(err as Error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [key]);

  return { data, loading, error, isOfflineData };
}
