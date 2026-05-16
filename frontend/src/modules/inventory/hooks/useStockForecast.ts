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
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/api/client'

export interface StockForecast {
  sku: string
  current_qty: number
  avg_daily: number
  doc: number | null
  tier: 'CRITICAL' | 'WARNING' | 'HEALTHY'
  reorder_at_date: string | null
}

const POLL_INTERVAL = 300000 // 5 minutes

export function useStockForecast(tier?: string) {
  const [data, setData] = useState<StockForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchForecast = useCallback(async () => {
    try {
      const res = await api.inventory.getForecast(tier)
      setData(res)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stock forecast')
    } finally {
      setLoading(false)
    }
  }, [tier])

  useEffect(() => {
    fetchForecast()
    const timer = setInterval(fetchForecast, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [fetchForecast])

  return { data, loading, error, refetch: fetchForecast }
}
