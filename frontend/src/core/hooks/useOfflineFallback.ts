import { useState, useEffect } from 'react';
import db from '@/lib/dexie';

/**
 * useOfflineFallback Hook
 * Wraps data fetching with Dexie.js persistence.
 * If network fails or offline, returns the last known good state from Sovereign storage.
 */
export function useOfflineFallback<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  initialData: T
) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOfflineData, setIsOfflineData] = useState(false);

  useEffect(() => {
    if (!key) return;
    
    let isMounted = true;

    const loadData = async () => {
      // 1. Try to load initial cache from Dexie
      const cached = await db.data_cache.get(key);
      if (cached && isMounted) {
        setData(cached.data);
      }

      try {
        if (isMounted) setLoading(true);
        
        // 2. Fetch from Live Backend
        const result = await fetcher();
        
        if (isMounted) {
          setData(result);
          setIsOfflineData(false);
          // 3. Update Sovereign Cache
          await db.data_cache.put({ key, data: result, updated_at: Date.now() });
        }
      } catch (err) {
        console.warn(`[SMRITI-OS] Offline Fallback Active for ${key}:`, err);
        
        // 4. Engaging Sovereign Offline Fallback
        const saved = await db.data_cache.get(key);
        if (saved && isMounted) {
          setData(saved.data);
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
