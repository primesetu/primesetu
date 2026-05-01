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
import { useGenLookup } from '@/hooks/useGenLookup'
import { cn } from '@/lib/utils'
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Tag, 
  ChevronRight, 
  MoreHorizontal,
  BarChart3,
  Layers,
  Info
} from 'lucide-react'
import { 
  Button, 
  DataTable, 
  Input, 
  Badge,
  Card
} from '@/components/ui/SovereignUI'
import AddItemModal from './AddItemModal'

export default function ItemMasterModule() {
  const { theme } = useTheme()
  const isInstitutional = theme === 'SMRITI-OS'

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Hydrate institutional lookups from Phase 1 engine
  const { data: departments } = useGenLookup(2)
  const { data: brands } = useGenLookup(5)
  const { data: sizeGroups } = useGenLookup(1)

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeView, setActiveView] = useState<'grid' | 'details'>('grid')
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await api.inventory.list()
      setItems(data)
    } catch (err) {
      console.error("Institutional fetch failed", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const columns = useMemo(() => [
    {
      header: "ITEM CODE / SKU",
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="font-serif font-black text-[var(--accent)] text-sm tracking-tight">{item.item_code}</span>
          <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase">{item.hsn_code || 'NO HSN'}</span>
        </div>
      ),
      width: 180,
      pinned: 'left' as const
    },
    {
      header: "ITEM DESCRIPTION",
      accessor: (item: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-[var(--text-primary)] uppercase truncate w-64">{item.item_name}</span>
          <div className="flex gap-2 mt-1">
             <span className="text-[8px] font-black px-1.5 py-0.5 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] rounded-sm">
                {item.brand || 'NO BRAND'}
             </span>
             <span className="text-[8px] font-black px-1.5 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-sm">
                {item.department?.name || 'GEN'}
             </span>
          </div>
        </div>
      ),
      flex: 2
    },
    {
      header: "MRP",
      accessor: (item: any) => (
        <span className="font-serif font-black text-[var(--text-primary)]">
          ₹{(item.mrp_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
      width: 120,
      className: 'text-right'
    },
    {
      header: "CUR BAL",
      accessor: (item: any) => (
        <Badge variant={item.total_stock > 10 ? 'success' : item.total_stock > 0 ? 'warning' : 'danger'} className="font-serif font-black">
          {item.total_stock}
        </Badge>
      ),
      width: 100,
      className: 'text-center'
    },
    {
      header: "ACTION",
      accessor: (item: any) => (
        <div className="flex justify-end">
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setSelectedItem(item); setActiveView('details'); }}
            className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--accent)]"
          >
            DETAILS <ChevronRight size={12} className="ml-1" />
           </Button>
        </div>
      ),
      width: 120,
      pinned: 'right' as const
    }
  ], [])

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className={cn(
            "text-4xl font-serif font-black",
            isInstitutional ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
          )}>Item Master</h1>
          <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-widest mt-2">Managing SMRITI-OS Product DNA & Inventory Matrix</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={16} />
            <Input 
              placeholder="SEARCH BY CODE OR DESCRIPTION..." 
              className="pl-12 h-14 text-xs font-black uppercase shadow-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            className="h-14 px-8 bg-[var(--accent)] text-white gap-3 text-xs font-black uppercase tracking-widest shadow-2xl"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} />
            ADD ITEM [F2]
          </Button>
        </div>
      </div>

      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => fetchItems()} 
      />

      {/* Main Grid View */}
      <div className={cn(
        "rounded-[var(--radius-lg)] shadow-2xl border overflow-hidden",
        isInstitutional ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]" : "bg-[var(--background)]/40 backdrop-blur-md border-[var(--border-subtle)]/50"
      )}>
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
           <div className="flex gap-2">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--background)] border border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-tertiary)] uppercase">
                <Package size={12} /> {items.length} TOTAL SKUS
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--background)] border border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-tertiary)] uppercase">
                <BarChart3 size={12} /> {items.reduce((acc, curr) => acc + (curr.total_stock || 0), 0)} TOTAL QTY
             </div>
           </div>
           <Button variant="ghost" size="sm" className="gap-2 text-[10px] font-black uppercase text-[var(--text-tertiary)]">
              <Filter size={14} /> FILTER ANAL-CODES
           </Button>
        </div>

        <div className="h-[600px]">
           <DataTable 
             data={items.filter(i => 
               i.item_code.toLowerCase().includes(search.toLowerCase()) || 
               i.item_name.toLowerCase().includes(search.toLowerCase())
             )}
             columns={columns}
             loading={loading}
           />
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Departments', count: departments.length, icon: Layers },
          { label: 'Active Brands', count: brands.length, icon: Tag },
          { label: 'Size Groups', count: sizeGroups.length, icon: BarChart3 },
          { label: 'Critical Stock', count: items.filter(i => i.total_stock < 5).length, icon: Info, color: 'text-red-500' }
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex items-center gap-6 border-[var(--border-subtle)]">
            <div className={cn("p-4 rounded-xl bg-[var(--surface-elevated)]", stat.color || "text-[var(--accent)]")}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-serif font-black text-[var(--text-primary)]">{stat.count}</h4>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
