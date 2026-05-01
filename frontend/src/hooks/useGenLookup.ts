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
import { useState, useEffect } from 'react'
import { api } from '@/api/client'

interface LookupItem {
  code: string
  descr: string
  number?: number
  recid?: number
}

/**
 * useGenLookup
 * A global hook to fetch and cache institutional lookup data from Shoper 9 GenLookup tables.
 * Used for Dropdowns: Departments, Brands, Sizes, Payment Modes, etc.
 */
export function useGenLookup(recid: number) {
  const [data, setData] = useState<LookupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchLookup = async () => {
      try {
        setLoading(true)
        // Shoper 9 logic: 
        // Recid = 0: The "Categories" themselves (Header)
        // Recid > 0: The members of that category
        const response = await api.legacy.getData('genlookup', {
          search_col: 'recid',
          search_val: recid.toString()
        })
        
        if (isMounted) {
          // Sort alphabetically by description for better UX
          const sorted = response.data.sort((a: any, b: any) => 
            (a.descr || '').localeCompare(b.descr || '')
          )
          setData(sorted)
        }
      } catch (err) {
        if (isMounted) setError("Failed to hydrate SMRITI-OS lookup table.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchLookup()
    return () => { isMounted = false }
  }, [recid])

  return { data, loading, error }
}
