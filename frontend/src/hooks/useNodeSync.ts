/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/api/client';

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

  const checkPulse = useCallback(async () => {
    const t0 = Date.now();
    try {
      // Sovereign Pulse: Send local heartbeat and get remote commands
      const data = await api.ho.pulse({
        transaction_count: 0,
        pending_sync_packets: 0, // Should be fetched from local DB/sync engine
        last_sync_id: null
      });

      const latencyMs = Date.now() - t0;
      
      // Execute any pending remote commands
      if (data.commands && data.commands.length > 0) {
        console.log(`[SMRITI-OS] HO Pulse: ${data.commands.length} commands received.`);
        for (const cmd of data.commands) {
          try {
            await api.ho.executeCommand(cmd.id);
          } catch (cmdErr) {
            console.error(`[SMRITI-OS] Command ${cmd.id} execution failed:`, cmdErr);
          }
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
  }, []);

  useEffect(() => {
    checkPulse();
    intervalRef.current = setInterval(checkPulse, HEARTBEAT_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkPulse]);

  return state;
}
