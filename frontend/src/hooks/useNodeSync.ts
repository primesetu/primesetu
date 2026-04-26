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

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';

export type SyncStatus = 'online' | 'syncing' | 'offline';

export interface NodeSyncState {
  status: SyncStatus;
  lastSync: Date | null;
  pendingCount: number;
  latencyMs: number | null;
  nodeId?: string;
}

const HEARTBEAT_INTERVAL_MS = 5_000; // 5s high-fidelity heartbeat

export function useNodeSync(): NodeSyncState {
  const [state, setState] = useState<NodeSyncState>({
    status: 'offline',
    lastSync: null,
    pendingCount: 0,
    latencyMs: null,
  });

  const checkPulse = useCallback(async () => {
    const t0 = Date.now();
    try {
      const data = await api.ho.getStatus();
      const latencyMs = Date.now() - t0;

      setState({
        status: data.pending_packets > 0 ? 'syncing' : 'online',
        lastSync: data.last_sync ? new Date(data.last_sync) : new Date(),
        pendingCount: data.pending_packets || 0,
        latencyMs,
        nodeId: data.corporate_node
      });
    } catch (err) {
      console.warn('[PrimeSetu] HO Pulse Failed:', err);
      setState(prev => ({ ...prev, status: 'offline', latencyMs: null }));
    }
  }, []);

  useEffect(() => {
    checkPulse();
    const id = setInterval(checkPulse, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [checkPulse]);

  return state;
}
