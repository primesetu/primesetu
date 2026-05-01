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
import React, { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { Save, AlertCircle, RefreshCcw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/SovereignUI'

interface ParamData {
  id: string
  prmid: string
  prmval: string
  prmstatus: string
  // Merged fields
  prmtitle?: string
  prmcategory?: string
  prmtype?: string
}

export default function SystemParameters() {
  const { theme } = useTheme()
  const isInstitutional = theme === 'SMRITI-OS'
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [params, setParams] = useState<ParamData[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')

  const fetchData = async () => {
    try {
      setLoading(true)
      // 1. Fetch the actual values (SysParam)
      const valuesRes = await api.legacy.getData('sysparam')
      // 2. Fetch the metadata (SysParamExtd)
      const metaRes = await api.legacy.getData('sysparamextd')

      const merged = valuesRes.data.map((v: any) => {
        const meta = metaRes.data.find((m: any) => m.prmid === v.prmid)
        return {
          ...v,
          prmtitle: meta?.prmtitle || v.prmid,
          prmcategory: meta?.prmcategory || 'GENERAL',
          prmtype: meta?.prmtype || 'STRING'
        }
      })

      setParams(merged)
      const cats = Array.from(new Set(merged.map((m: any) => m.prmcategory))) as string[]
      setCategories(cats)
      if (cats.length > 0) setActiveCategory(cats[0])
    } catch (err) {
      console.error("Failed to load SMRITI-OS parameters", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpdate = async (p: ParamData, newVal: string) => {
    // Optimistic update
    setParams(prev => prev.map(item => item.id === p.id ? { ...item, prmval: newVal } : item))
    
    try {
      await api.legacy.patchData('sysparam', p.id, { prmval: newVal })
    } catch (err) {
      console.error("Sync failure", err)
      // Rollback
      fetchData()
    }
  }

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <RefreshCcw className="animate-spin text-[var(--accent)]" size={32} />
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Synchronizing Institutional Node...</span>
      </div>
    )
  }

  const filteredParams = params.filter(p => p.prmcategory === activeCategory)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-[var(--border-subtle)]">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-[var(--radius-sm)] text-[10px] font-black uppercase tracking-widest transition-all",
              activeCategory === cat 
                ? "bg-[var(--accent)] text-white shadow-lg"
                : "text-[var(--text-tertiary)] hover:bg-[var(--surface-elevated)]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParams.map(p => (
          <div key={p.id} className={cn(
            "p-6 rounded-[var(--radius-lg)] border transition-all relative overflow-hidden group",
            isInstitutional 
              ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)] hover:border-[var(--accent)]" 
              : "bg-[var(--background)]/40 backdrop-blur-md border-[var(--border-subtle)]/50"
          )}>
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
              <ShieldCheck size={14} className="text-[var(--accent)]" />
            </div>
            
            <div className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-tighter mb-1 opacity-60">
              {p.prmid}
            </div>
            
            <h4 className="text-sm font-black text-[var(--text-primary)] mb-4 leading-tight uppercase tracking-tight">
              {p.prmtitle}
            </h4>

            <div className="mt-auto pt-4 flex justify-between items-center">
              {p.prmtype === 'BOOL' ? (
                <button 
                  onClick={() => handleUpdate(p, p.prmval === '1' ? '0' : '1')}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    p.prmval === '1'
                      ? "bg-[var(--accent)]" 
                      : "bg-[var(--background)] border border-[var(--border-subtle)]"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                    p.prmval === '1' ? 'right-1' : 'left-1'
                  )}></div>
                </button>
              ) : (
                <input 
                  type="text"
                  defaultValue={p.prmval}
                  onBlur={(e) => {
                    if (e.target.value !== p.prmval) {
                      handleUpdate(p, e.target.value)
                    }
                  }}
                  className={cn(
                    "w-full rounded-[var(--radius-sm)] px-3 py-2 text-xs font-bold outline-none transition-all",
                    isInstitutional 
                      ? "bg-[var(--background)] border border-[var(--border-subtle)] focus:border-[var(--accent)]" 
                      : "bg-[var(--surface-elevated)]/50 border border-[var(--border-subtle)]/50 focus:border-[var(--accent)]"
                  )}
                />
              )}
              
              <div className="flex items-center gap-1 ml-4">
                <span className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic">Institutional</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={cn(
        "mt-4 p-6 rounded-[var(--radius-lg)] flex items-start gap-4 border",
        isInstitutional 
          ? "bg-[var(--background)] border-[var(--accent)]/20" 
          : "bg-[var(--surface-elevated)]/50 border-[var(--border-subtle)]/50"
      )}>
        <AlertCircle size={20} className="text-[var(--accent)] mt-0.5" />
        <div>
          <h5 className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] mb-1">Warning: Core Governance Modification</h5>
          <p className="text-[10px] font-medium text-[var(--text-secondary)] leading-relaxed">
            Changing these parameters alters the fundamental logic of SMRITI-OS (Billing, Tax, and Stock). 
            Changes are committed instantly to the Sovereign Database and propagate to all active till nodes.
          </p>
        </div>
      </div>
    </div>
  )
}
