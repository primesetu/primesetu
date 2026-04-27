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

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/api/client';
import { supabase } from '@/lib/supabase';

export type SyncStatus = 'online' | 'syncing' | 'offline' | 'unauthenticated';

export interface NodeSyncState {
  status: SyncStatus;
  lastSync: Date | null;
  pendingCount: number;
  latencyMs: number | null;
  nodeId?: string;
}

const HEARTBEAT_INTERVAL_MS = 30_000; // 30s — no spam

export function useNodeSync(): NodeSyncState {
  const [state, setState] = useState<NodeSyncState>({
    status: 'offline',
    lastSync: null,
    pendingCount: 0,
    latencyMs: null,
  });

  // Track if we've already stopped due to 401 — don't retry until session changes
  const blockedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const checkPulse = useCallback(async () => {
    // Don't attempt if we know there's no session
    if (blockedRef.current) return;

    // Quick pre-check: does a Supabase session exist?
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      blockedRef.current = true;
      stopPolling();
      setState(prev => ({
        ...prev,
        status: 'unauthenticated',
        latencyMs: null,
        nodeId: 'NO_SESSION',
      }));
      return;
    }

    const t0 = Date.now();
    try {
      const data = await api.ho.getStatus();
      const latencyMs = Date.now() - t0;
      setState({
        status: data.pending_packets > 0 ? 'syncing' : 'online',
        lastSync: data.last_sync ? new Date(data.last_sync) : new Date(),
        pendingCount: data.pending_packets || 0,
        latencyMs,
        nodeId: data.corporate_node,
      });
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        // Auth error — stop polling, don't spam console
        blockedRef.current = true;
        stopPolling();
        setState(prev => ({
          ...prev,
          status: 'unauthenticated',
          latencyMs: null,
          nodeId: 'AUTH_REQUIRED',
        }));
      } else {
        // Network / server error — keep polling, just mark offline
        setState(prev => ({
          ...prev,
          status: 'offline',
          latencyMs: null,
        }));
      }
    }
  }, [stopPolling]);

  useEffect(() => {
    checkPulse();
    intervalRef.current = setInterval(checkPulse, HEARTBEAT_INTERVAL_MS);

    // Re-enable polling when auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      blockedRef.current = false; // reset block on any auth change
      if (session) {
        // Logged in — restart polling immediately
        stopPolling();
        checkPulse();
        intervalRef.current = setInterval(checkPulse, HEARTBEAT_INTERVAL_MS);
      } else {
        // Logged out — stop polling
        stopPolling();
        setState({
          status: 'unauthenticated',
          lastSync: null,
          pendingCount: 0,
          latencyMs: null,
          nodeId: 'NO_SESSION',
        });
      }
    });

    return () => {
      stopPolling();
      subscription.unsubscribe();
    };
  }, [checkPulse, stopPolling]);

  return state;
}
