/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useState, useEffect, useCallback } from 'react';

export type SyncStatus = 'online' | 'syncing' | 'offline';

export interface NodeSyncState {
  status: SyncStatus;
  lastSync: Date | null;
  pendingCount: number;
  latencyMs: number | null;
}

const POLL_INTERVAL_MS = 15_000; // 15s heartbeat
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useNodeSync(): NodeSyncState {
  const [state, setState] = useState<NodeSyncState>({
    status: 'offline',
    lastSync: null,
    pendingCount: 0,
    latencyMs: null,
  });

  const ping = useCallback(async () => {
    const t0 = Date.now();
    try {
      const res = await fetch(`${API_BASE}/api/v1/health`, {
        signal: AbortSignal.timeout(5000),
      });
      const latencyMs = Date.now() - t0;

      if (res.ok) {
        const body = await res.json().catch(() => ({}));
        const pendingCount: number = body?.pending_sync_count ?? 0;

        setState({
          status: pendingCount > 0 ? 'syncing' : 'online',
          lastSync: new Date(),
          pendingCount,
          latencyMs,
        });
      } else {
        setState(prev => ({ ...prev, status: 'offline', latencyMs: null }));
      }
    } catch {
      setState(prev => ({ ...prev, status: 'offline', latencyMs: null }));
    }
  }, []);

  useEffect(() => {
    ping(); // immediate on mount
    const id = setInterval(ping, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [ping]);

  return state;
}
