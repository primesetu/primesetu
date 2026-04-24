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
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Store } from '@/types/database'

export function useStore() {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      // Sovereign Optimization: Use metadata instead of a DB query to fix 404 on 'users' table
      const storeId = user.user_metadata?.store_id || 'X01'
      
      const { data: storeData, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()

      if (error) console.error('[PrimeSetu] useStore:', error.message)
      else setStore(storeData as unknown as Store)
      setLoading(false)
    }
    load()
  }, [])

  return { store, loading }
}
