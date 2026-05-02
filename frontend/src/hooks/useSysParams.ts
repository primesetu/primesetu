
import { useState, useEffect } from 'react'
import { api } from '@/api/client'

export interface SysParam {
  paramcode: string
  descr: string
  txt: string | null
  intg: number | null
  boolean: boolean | null
}

export function useSysParams() {
  const [params, setParams] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchParams() {
      try {
        // Fetch from lowercase sysparam table via legacy bridge
        const response = await api.legacy.getData('sysparam', { limit: 500 })
        const data = response.data as SysParam[]
        
        const paramMap: Record<string, any> = {}
        data.forEach(p => {
          const val = p.txt ?? p.intg ?? p.boolean
          paramMap[p.paramcode] = val
        })
        
        setParams(paramMap)
      } catch (err) {
        console.error('Failed to fetch SysParams:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchParams()
  }, [])

  const getParam = (code: string, defaultValue: any = null) => {
    return params[code] ?? defaultValue
  }

  return { params, getParam, loading }
}
