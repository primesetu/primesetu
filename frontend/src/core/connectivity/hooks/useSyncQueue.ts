/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Sovereign Sync Runtime: Client-Side Queue Orchestrator
 * ============================================================
 * Hook: useSyncQueue (v1.2)
 * ============================================================ */

import { useEffect, useRef, useCallback, useState } from 'react';
import { vault } from '@/lib/offlineVault';
import { api } from '@/api/client';
import { logger } from '@/core/observability/logger';

const DRAIN_INTERVAL_MS = 30_000; // Check every 30s per Sync Governance

export function useSyncQueue() {
  const [queueDepth, setQueueDepth] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refreshDepth = useCallback(async () => {
    const depth = await vault.queueDepth();
    setQueueDepth(depth);
  }, []);

  const drainQueue = useCallback(async () => {
    // ── [R2] CONNECTIVITY & CONCURRENCY GUARD ─────────────────────────
    if (!navigator.onLine || isSyncing) return;

    const pending = await vault.getPendingQueue();
    if (pending.length === 0) return;

    setIsSyncing(true);

    logger.log('INFO', 'Sync runtime: Draining client-side queue', {
      module: 'SYNC',
      workflow: 'SYNC_RUNTIME',
      pending_count: pending.length,
    });

    for (const entry of pending) {
      if (!entry.id) continue;

      try {
        await vault.markSyncing(entry.id);

        logger.log('DEBUG', `Syncing packet: ${entry.endpoint}`, {
          module: 'SYNC',
          workflow: 'SYNC_RUNTIME',
          packet_id: entry.id,
          method: entry.method,
          endpoint: entry.endpoint,
        });

        const method = entry.method.toLowerCase() as 'post' | 'put' | 'patch';
        
        // Execute API call
        await api[method](entry.endpoint, entry.payload);

        // Mark as done in Dexie
        await vault.markDone(entry.id);

        logger.log('INFO', `Packet synced successfully: ${entry.id}`, {
          module: 'SYNC',
          workflow: 'SYNC_RUNTIME',
          packet_id: entry.id,
        });
      } catch (err: any) {
        const errorMessage = err?.message ?? 'Network/API error';
        await vault.markFailed(entry.id, errorMessage);

        logger.log('ERROR', `Packet sync failed: ${entry.id}`, {
          module: 'SYNC',
          workflow: 'SYNC_RUNTIME',
          packet_id: entry.id,
          error: errorMessage,
        });
      }
    }

    setIsSyncing(false);
    setLastSyncAt(new Date().toISOString());
    await refreshDepth();
  }, [isSyncing, refreshDepth]);

  // ── [R2] REPLAY ORCHESTRATION ────────────────────────────────────────
  useEffect(() => {
    refreshDepth();
    
    // Immediate drain on mount
    drainQueue();

    // Re-trigger on connectivity recovery
    const handleOnline = () => {
      logger.log('INFO', 'Connectivity restored: Triggering queue drain', {
        module: 'SYNC',
        workflow: 'SYNC_RUNTIME'
      });
      drainQueue();
    };
    
    window.addEventListener('online', handleOnline);

    // Continuous polling per sync governance
    intervalRef.current = setInterval(drainQueue, DRAIN_INTERVAL_MS);

    return () => {
      window.removeEventListener('online', handleOnline);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [drainQueue, refreshDepth]);

  return { queueDepth, isSyncing, lastSyncAt, drainQueue, refreshDepth };
}
