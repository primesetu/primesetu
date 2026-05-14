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
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { Save, AlertCircle, RefreshCcw, ShieldCheck, Database, Search } from 'lucide-react'
import { Button } from '@/components/ui/SovereignUI'

interface SmritiParam {
  param_code: string
  descr: string
  opt_type: 'B' | 'I' | 'T' | 'S' | 'C'
  value_bool: boolean
  value_int: number
  value_txt: string | null
  value_float: number | null
  category: string
  cat_descr: string
  disp_order: number
}

interface Category {
  category: string
  cat_descr: string
  count: number
}

export default function SystemParameters() {
  const { theme } = useTheme()
  const isInstitutional = theme === 'LIGHT'
  
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState<SmritiParam[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // 1. Fetch categories (Cache locally to avoid chatter)
      if (categories.length === 0) {
        const catsRes = await api.config.getCategories?.() || [];
        setCategories(catsRes)
        if (catsRes.length > 0 && !activeCategory) {
          setActiveCategory(catsRes[0].category)
        }
      }

      // 2. Fetch parameters for active category
      const paramsRes = await api.config.getSysParams(activeCategory || undefined)
      setParams(paramsRes)
    } catch (err) {
      console.error("Failed to load SMRITI-OS parameters", err)
    } finally {
      setLoading(false)
    }
  }, [activeCategory])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdate = async (p: SmritiParam, newVal: any) => {
    // Optimistic update
    setParams(prev => prev.map(item => 
      item.param_code === p.param_code ? { 
        ...item, 
        value_bool: p.opt_type === 'B' ? newVal : item.value_bool,
        value_int: p.opt_type === 'I' ? parseInt(newVal) : item.value_int,
        value_txt: p.opt_type === 'T' ? newVal : item.value_txt,
        value_float: (p.opt_type === 'S' || p.opt_type === 'C') ? parseFloat(newVal) : item.value_float,
      } : item
    ))
    
    try {
      await api.config.updateSysParam(p.param_code, newVal)
      // Invalidate category cache to refresh counts/new categories
      setCategories([])
    } catch (err) {
      console.error("Sync failure", err)
      // Rollback on failure
      fetchData()
    }
  }

  const renderValueInput = (p: SmritiParam) => {
    switch (p.opt_type) {
      case 'B':
        return (
          <button 
            onClick={() => handleUpdate(p, !p.value_bool)}
            className={cn(
              "w-12 h-6 rounded-full transition-all relative",
              p.value_bool
                ? "bg-[var(--accent)]" 
                : "bg-[var(--background)] border border-[var(--border-subtle)]"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
              p.value_bool ? 'right-1' : 'left-1'
            )}></div>
          </button>
        )
      case 'I':
      case 'S':
      case 'C':
        return (
          <input 
            type="number"
            defaultValue={p.opt_type === 'I' ? p.value_int : p.value_float || 0}
            onBlur={(e) => handleUpdate(p, e.target.value)}
            className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-bold"
          />
        )
      default:
        return (
          <input 
            type="text"
            defaultValue={p.value_txt || ''}
            onBlur={(e) => handleUpdate(p, e.target.value)}
            className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-bold"
          />
        )
    }
  }

  const filteredParams = params.filter(p => 
    p.descr.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.param_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex gap-6 h-[calc(100vh-180px)] overflow-hidden">
      {/* Sidebar: Categories */}
      <div className="w-64 flex flex-col gap-2 overflow-y-auto pr-2 border-r border-[var(--border-subtle)]">
        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] flex items-center gap-2">
          <Database size={12} />
          Sovereign Profiles
        </div>
        {categories.map(cat => (
          <button
            key={cat.category}
            onClick={() => setActiveCategory(cat.category)}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] text-left transition-all group",
              activeCategory === cat.category 
                ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
            )}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">
                {cat.cat_descr || cat.category}
              </span>
              <span className={cn(
                "text-[8px] font-medium opacity-60 uppercase tracking-widest",
                activeCategory === cat.category ? "text-white" : "text-[var(--text-tertiary)]"
              )}>
                {cat.category}
              </span>
            </div>
            <span className={cn(
              "text-[10px] font-black px-1.5 py-0.5 rounded-full",
              activeCategory === cat.category ? "bg-white/20" : "bg-[var(--surface-elevated)]"
            )}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content: Parameters */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={14} />
            <input 
              type="text"
              placeholder="Search Parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-full pl-10 pr-4 py-2 text-xs font-bold outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => fetchData()}
            className="text-[var(--text-tertiary)] hover:text-[var(--accent)]"
          >
            <RefreshCcw size={14} className={cn(loading && "animate-spin")} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 auto-rows-start">
          {loading ? (
            <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4">
              <RefreshCcw className="animate-spin text-[var(--accent)]" size={32} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Accessing Sovereign Records...</span>
            </div>
          ) : (
            filteredParams.map(p => (
              <div key={p.param_code} className="p-4 rounded-[var(--radius-lg)] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all group relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-tighter opacity-60">
                      {p.param_code}
                    </span>
                    <h4 className="text-xs font-black text-[var(--text-primary)] leading-tight uppercase">
                      {p.descr}
                    </h4>
                  </div>
                  <ShieldCheck size={14} className="text-[var(--accent)] opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex items-center justify-between gap-4 mt-auto">
                  <div className="flex-1">
                    {renderValueInput(p)}
                  </div>
                  <div className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic">
                    {p.opt_type === 'B' ? 'Flag' : p.opt_type === 'I' ? 'Integer' : 'String'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Warning Banner */}
        <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--accent)]/5 border border-[var(--accent)]/20 flex items-start gap-4">
          <AlertCircle size={18} className="text-[var(--accent)] shrink-0 mt-0.5" />
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] mb-1">Governance Integrity Protocol</h5>
            <p className="text-[9px] font-medium text-[var(--text-secondary)] leading-relaxed">
              Modifying these institutional parameters will immediately alter the behavioral DNA of Smriti-OS across all till nodes. 
              Ensure compliance with local retail regulations before committing changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
