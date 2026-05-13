/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/api/client';
import { useSovereignStore } from '@/store/useSovereignStore';

export type SyncStatus = 'online' | 'syncing' | 'offline';

export interface NodeSyncState {
  status: SyncStatus;
  lastSync: Date | null;
  pendingCount: number;
  latencyMs: number | null;
  nodeId?: string;
}

const HEARTBEAT_INTERVAL_MS = 15_000; // 15s

export function useNodeSync(): NodeSyncState {
  const [state, setState] = useState<NodeSyncState>({
    status: 'offline',
    lastSync: null,
    pendingCount: 0,
    latencyMs: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isForcedOffline = useSovereignStore(state => state.isForcedOffline);

  const checkPulse = useCallback(async () => {
    // isForcedOffline is in deps — closure is never stale
    if (isForcedOffline) {
      setState(prev => ({ ...prev, status: 'offline', latencyMs: null }));
      return;
    }

    const t0 = Date.now();
    try {
      const data = await api.ho.pulse({
        transaction_count: 0,
        pending_sync_packets: 0,
        last_sync_id: null
      });

      const latencyMs = Date.now() - t0;

      if (data.commands && data.commands.length > 0) {
        console.log(`[SMRITI-OS] HO Pulse: ${data.commands.length} commands received.`);
        for (const cmd of data.commands) {
          try { await api.ho.executeCommand(cmd.id); }
          catch (cmdErr) { console.error(`[SMRITI-OS] Command ${cmd.id} failed:`, cmdErr); }
        }
      }

      setState({
        status: 'online',
        lastSync: data.server_time ? new Date(data.server_time) : new Date(),
        pendingCount: 0,
        latencyMs,
        nodeId: 'HQ-MUM-01',
      });
    } catch {
      setState(prev => ({ ...prev, status: 'offline', latencyMs: null }));
    }
  }, [isForcedOffline]); // ← isForcedOffline in deps — NO stale closure

  useEffect(() => {
    if (isForcedOffline) {
      // User chose offline — kill heartbeat, stay offline until they click Online
      if (intervalRef.current) clearInterval(intervalRef.current);
      setState(prev => ({ ...prev, status: 'offline', latencyMs: null }));
      return;
    }

    // Back online — start fresh heartbeat immediately
    checkPulse();
    intervalRef.current = setInterval(checkPulse, HEARTBEAT_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkPulse, isForcedOffline]);

  return state;
}




