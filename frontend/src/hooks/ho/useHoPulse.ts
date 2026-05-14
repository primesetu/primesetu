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
import { useEffect, useRef, useState, useCallback } from 'react'
import { api } from '@/api/client'
import { useSovereignStore } from '@/store/useSovereignStore'

const BASE_INTERVAL = 30000 // 30 seconds
const MAX_BACKOFF = 300000 // 5 minutes

export function useHoPulse() {
  const { setPendingCommands, isBackendAvailable } = useSovereignStore()
  const [failures, setFailures] = useState(0)
  const timerRef = useRef<any>(null)
  const isPulsing = useRef(false)

  const sendPulse = useCallback(async () => {
    if (isPulsing.current || !isBackendAvailable) return
    
    isPulsing.current = true
    try {
      // 1. Fetch Supply Chain Intelligence for HQ Pulse
      const forecast = await api.inventory.getPredictive()
      
      const metrics = {
        transaction_count: 0,
        pending_sync_packets: 0,
        last_sync_id: null,
        critical_skus: forecast.stockout_forecast_count,
        surplus_skus: 0, // [TODO] Implement surplus calc in API
        total_inventory_value: 0
      }

      const response = await api.ho.pulse(metrics)
      
      if (response.commands) {
        setPendingCommands(response.commands)
      }
      setFailures(0)
      scheduleNextPulse(BASE_INTERVAL)
    } catch (err) {
      console.warn('[Governance] Pulse failed. Entering backoff...')
      setFailures(f => {
        const next = f + 1
        const backoff = Math.min(BASE_INTERVAL * Math.pow(2, next), MAX_BACKOFF)
        const jitter = backoff * 0.1 * (Math.random() * 2 - 1)
        scheduleNextPulse(backoff + jitter)
        return next
      })
    } finally {
      isPulsing.current = false
    }
  }, [isBackendAvailable, setPendingCommands])

  const scheduleNextPulse = (delay: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(sendPulse, delay)
  }

  useEffect(() => {
    sendPulse()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [sendPulse])

  return null
}
