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
import { useEffect, useRef, useCallback } from 'react'
import { api } from '@/api/client'
import { useSovereignStore } from '@/core/stores/useSovereignStore'
import { CONNECTIVITY_CONFIG } from '@/config/connectivity'

export function useHoPulse() {
  const { setPendingCommands, incrementPulseFailure, connectivityState } = useSovereignStore()
  const timerRef = useRef<any>(null)
  const pulseInFlight = useRef(false)

  const sendPulse = useCallback(async () => {
    // RETAIL PRINCIPLE: Background telemetry must NEVER block the main thread or stack requests.
    // Only pulse if we are not already pulsing and the node is at least OFFLINE (to try recovery)
    if (pulseInFlight.current) return;
    
    pulseInFlight.current = true;
    
    try {
      // 1. Fetch Supply Chain Intelligence for HQ Pulse
      // Note: This is an idempotent GET, will retry once if blip occurs.
      const forecast = await api.inventory.getPredictive();
      
      const metrics = {
        transaction_count: 0,
        pending_sync_packets: 0,
        last_sync_id: null,
        critical_skus: forecast.stockout_forecast_count,
        surplus_skus: 0,
        total_inventory_value: 0
      };

      // 2. Transmit to Head Office
      const response = await api.ho.pulse(metrics);
      
      if (response.commands) {
        setPendingCommands(response.commands);
      }
    } catch (err) {
      // RETAIL PRINCIPLE: Silent failure for background tasks.
      // We increment the failure floor for owner dashboard visibility.
      incrementPulseFailure();
      console.warn('[Governance] HO Pulse blip (silent):', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      pulseInFlight.current = false;
      
      // Schedule next pulse regardless of outcome (self-healing loop)
      const delay = connectivityState === 'OFFLINE' 
        ? CONNECTIVITY_CONFIG.PULSE_INTERVAL * 2 
        : CONNECTIVITY_CONFIG.PULSE_INTERVAL;
        
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(sendPulse, delay);
    }
  }, [connectivityState, setPendingCommands, incrementPulseFailure]);

  useEffect(() => {
    // Initial pulse after mount
    const initialTimer = setTimeout(sendPulse, 2000);
    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [sendPulse]);

  return null;
}
