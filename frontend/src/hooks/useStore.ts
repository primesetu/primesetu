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

      const { data, error } = await supabase
        .from('users')
        .select('store_id, stores(*)')
        .eq('id', user.id)
        .single()

      if (error) console.error('[PrimeSetu] useStore:', error.message)
      else setStore(((data as any)?.stores as unknown as Store) ?? null)
      setLoading(false)
    }
    load()
  }, [])

  return { store, loading }
}
