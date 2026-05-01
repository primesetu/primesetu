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
import React, { useState, useEffect, useMemo } from 'react'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { Plus, Trash2, Search, Database, ChevronRight, Hash } from 'lucide-react'
import { Button, DataTable, Input } from '@/components/ui/SovereignUI'

interface LookupCategory {
  id: string
  code: string
  descr: string
}

interface LookupMember {
  id: string
  code: string
  descr: string
  recid: number
  number: number
}

export default function GenLookupManager() {
  const { theme } = useTheme()
  const isInstitutional = theme === 'SMRITI-OS'

  const [categories, setCategories] = useState<LookupCategory[]>([])
  const [selectedCat, setSelectedCat] = useState<LookupCategory | null>(null)
  const [members, setMembers] = useState<LookupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true)
        // Fetch headers (Recid = 0)
        const res = await api.legacy.getData('genlookup', { search_col: 'recid', search_val: '0' })
        setCategories(res.data)
        if (res.data.length > 0) setSelectedCat(res.data[0])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCats()
  }, [])

  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedCat) return
      try {
        setLoading(true)
        const res = await api.legacy.getData('genlookup', { search_col: 'recid', search_val: selectedCat.code })
        setMembers(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [selectedCat])

  const columns = useMemo(() => [
    {
      header: "CODE",
      accessor: (m: LookupMember) => (
        <div className="flex items-center gap-2">
           <Hash size={10} className="text-[var(--accent)] opacity-40" />
           <span className="font-serif font-black text-xs">{m.code}</span>
        </div>
      ),
      width: 120
    },
    {
      header: "DESCRIPTION / NAME",
      accessor: (m: LookupMember) => <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">{m.descr}</span>,
      flex: 2
    },
    {
      header: "ORDINAL",
      accessor: (m: LookupMember) => <span className="text-[10px] font-bold text-[var(--text-tertiary)]">{m.number || 0}</span>,
      width: 100,
      className: 'text-center'
    },
    {
      header: "ACTIONS",
      accessor: (m: LookupMember) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase hover:text-red-500">
            <Trash2 size={12} />
          </Button>
        </div>
      ),
      width: 100,
      pinned: 'right' as const
    }
  ], [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[600px]">
      {/* Sidebar: Categories */}
      <div className={cn(
        "lg:col-span-1 rounded-[var(--radius-lg)] border flex flex-col overflow-hidden",
        isInstitutional ? "bg-[var(--background)] border-[var(--border-subtle)]" : "bg-[var(--surface-elevated)]/40 border-[var(--border-subtle)]/50"
      )}>
        <div className="p-4 border-b border-[var(--border-subtle)]">
           <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Lookup Categories</h4>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat)}
              className={cn(
                "w-full text-left p-4 rounded-[var(--radius-sm)] transition-all flex items-center justify-between group",
                selectedCat?.id === cat.id 
                  ? "bg-[var(--accent)] text-white shadow-lg"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
              )}
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tight">{cat.descr}</span>
                <span className={cn(
                  "text-[8px] font-bold opacity-60",
                  selectedCat?.id === cat.id ? "text-white" : "text-[var(--text-tertiary)]"
                )}>RECID: {cat.code}</span>
              </div>
              <ChevronRight size={14} className={cn(
                "transition-transform",
                selectedCat?.id === cat.id ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
              )} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Members */}
      <div className={cn(
        "lg:col-span-3 rounded-[var(--radius-lg)] border flex flex-col overflow-hidden",
        isInstitutional ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]" : "bg-[var(--background)]/40 backdrop-blur-md border-[var(--border-subtle)]/50"
      )}>
        <div className="p-6 border-b border-[var(--border-subtle)] flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-serif font-black uppercase text-[var(--text-primary)]">
              {selectedCat?.descr || 'Registry'}
            </h3>
            <p className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Institutional Lookup Registry</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <Input 
                placeholder="SEARCH REGISTRY..." 
                className="pl-10 h-10 text-[10px] font-black uppercase"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button className="h-10 px-6 bg-[var(--accent)] text-white gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl">
              <Plus size={14} />
              ADD NEW
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <DataTable 
            data={members.filter(m => m.descr.toLowerCase().includes(search.toLowerCase()))} 
            columns={columns} 
          />
        </div>
      </div>
    </div>
  )
}
