// Drains the write queue in FIFO order when online.
// Runs automatically — no manual trigger needed.

import { useEffect, useRef, useCallback, useState } from 'react';
import { vault } from '@/lib/offlineVault';
import { api }   from '@/api/client';

const DRAIN_INTERVAL_MS = 15_000;   // check every 15s

export function useSyncQueue() {
  const [queueDepth,  setQueueDepth]  = useState(0);
  const [isSyncing,   setIsSyncing]   = useState(false);
  const [lastSyncAt,  setLastSyncAt]  = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refreshDepth = useCallback(async () => {
    const depth = await vault.queueDepth();
    setQueueDepth(depth);
  }, []);

  const drainQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    const pending = await vault.getPendingQueue();
    if (pending.length === 0) return;

    setIsSyncing(true);

    for (const entry of pending) {
      if (!entry.id) continue;
      try {
        await vault.markSyncing(entry.id);
        const method = entry.method.toLowerCase() as 'post' | 'put' | 'patch';
        await api[method](entry.endpoint, entry.payload);
        await vault.markDone(entry.id);
      } catch (err: any) {
        await vault.markFailed(entry.id, err?.message ?? 'Unknown error');
      }
    }

    setIsSyncing(false);
    setLastSyncAt(new Date().toISOString());
    await refreshDepth();
  }, [refreshDepth]);

  useEffect(() => {
    refreshDepth();
    // Drain on mount if online
    drainQueue();

    // Drain on reconnect
    const handleOnline = () => drainQueue();
    window.addEventListener('online', handleOnline);

    // Periodic drain
    intervalRef.current = setInterval(drainQueue, DRAIN_INTERVAL_MS);

    return () => {
      window.removeEventListener('online', handleOnline);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [drainQueue, refreshDepth]);

  return { queueDepth, isSyncing, lastSyncAt, drainQueue, refreshDepth };
}
