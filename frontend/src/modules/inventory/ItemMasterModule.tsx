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
import { AgGridReact } from 'ag-grid-react'
import { ColDef, ModuleRegistry, ClientSideRowModelModule, TextFilterModule, NumberFilterModule } from 'ag-grid-community'

ModuleRegistry.registerModules([ClientSideRowModelModule, TextFilterModule, NumberFilterModule])

import { 
  Button, 
  Input, 
  Badge,
  Card
} from '@/components/ui/SovereignUI'
import AddItemModal from './AddItemModal'
import ItemDetailsModal from './ItemDetailsModal'

export default function ItemMasterModule() {
  const { theme } = useTheme()
  const isInstitutional = theme === 'LIGHT'

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
      // Directly mapping to legacy Itemmaster table as requested
      const response = await api.legacy.getData('itemmaster', { limit: 500 })
      setItems(response.data || [])
    } catch (err) {
      console.error("Itemmaster fetch failed", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const colDefs: ColDef[] = useMemo(() => [
    {
      headerName: "STOCK NO",
      field: "stockno",
      cellRenderer: (params: any) => {
        const item = params.data;
        if (!item) return null;
        return (
          <div className="flex flex-col justify-center h-full">
            <span className="font-serif font-black text-[var(--accent)] text-sm tracking-tight leading-none">{item.stockno}</span>
            <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase leading-none mt-1">{item.extnfield1 || 'STD'}</span>
          </div>
        );
      },
      width: 180,
      pinned: 'left',
      filter: true
    },
    {
      headerName: "ITEM DESCRIPTION",
      field: "itemdesc",
      cellRenderer: (params: any) => {
        const item = params.data;
        if (!item) return null;
        return (
          <div className="flex flex-col justify-center h-full">
            <span className="text-xs font-black text-[var(--text-primary)] uppercase truncate w-full leading-none">{item.itemdesc}</span>
            <div className="flex gap-2 mt-1">
               <span className="text-[8px] font-black px-1.5 py-0.5 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] rounded-sm leading-none">
                  {item.class1cd || 'NO BRAND'}
               </span>
               <span className="text-[8px] font-black px-1.5 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-sm leading-none">
                  {item.class2cd || 'GEN'}
               </span>
               <span className="text-[8px] font-black px-1.5 py-0.5 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] rounded-sm leading-none">
                  SZ: {item.sizecd || 'N/A'}
               </span>
            </div>
          </div>
        );
      },
      flex: 1,
      minWidth: 300,
      filter: true
    },
    {
      headerName: "SUPER CLASS 1",
      field: "superclass1",
      width: 130,
      hide: true
    },
    {
      headerName: "SUPER CLASS 2",
      field: "superclass2",
      width: 130,
      hide: true
    },
    {
      headerName: "DEPT / CLASS 1",
      field: "class1cd",
      width: 130,
      filter: true
    },
    {
      headerName: "BRAND / CLASS 2",
      field: "class2cd",
      width: 130,
      filter: true
    },
    {
      headerName: "ANAL 1",
      field: "analcode1",
      width: 100,
      hide: true
    },
    {
      headerName: "ANAL 2",
      field: "analcode2",
      width: 100,
      hide: true
    },
    {
      headerName: "RETAIL PRICE",
      field: "retail_price",
      cellRenderer: (params: any) => {
        const item = params.data;
        if (!item) return null;
        const mrp = parseFloat(item.retail_price) || 0;
        return (
          <div className="flex items-center justify-end h-full">
            <span className="font-serif font-black text-[var(--text-primary)]">
              ₹{mrp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        );
      },
      width: 140,
      type: 'numericColumn'
    },
    {
      headerName: "DEALER PRICE",
      field: "dealer_price",
      cellRenderer: (params: any) => {
        const item = params.data;
        if (!item) return null;
        const dp = parseFloat(item.dealer_price) || 0;
        return (
          <div className="flex items-center justify-end h-full">
            <span className="font-serif font-black text-[var(--text-tertiary)]">
              ₹{dp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        );
      },
      width: 140,
      type: 'numericColumn'
    },
    {
      headerName: "STATUS",
      field: "itemstatus",
      cellRenderer: (params: any) => {
        const item = params.data;
        if (!item) return null;
        const isActive = item.itemstatus === 'A' || !item.itemstatus;
        return (
          <div className="flex items-center justify-center h-full">
            <Badge variant={isActive ? 'success' : 'danger'} className="font-serif font-black text-[10px]">
              {isActive ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </div>
        );
      },
      width: 120,
    },
    {
      headerName: "ACTION",
      colId: "action",
      cellRenderer: (params: any) => {
        const item = params.data;
        if (!item) return null;
        return (
          <div className="flex items-center justify-end h-full">
             <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setSelectedItem(item); setActiveView('details'); }}
              className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--accent)]"
            >
              DETAILS <ChevronRight size={12} className="ml-1" />
             </Button>
          </div>
        );
      },
      width: 120,
      pinned: 'right',
      sortable: false,
      filter: false
    }
  ], []);

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
              placeholder="SEARCH BY STOCK NO OR DESCRIPTION..." 
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

      <ItemDetailsModal 
        isOpen={activeView === 'details'} 
        onClose={() => setActiveView('grid')} 
        item={selectedItem} 
      />
      <div className={cn(
        "rounded-[var(--radius-lg)] shadow-2xl border overflow-hidden",
        isInstitutional ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]" : "bg-[var(--background)]/40 backdrop-blur-md border-[var(--border-subtle)]/50"
      )}>
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
           <div className="flex gap-2">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--background)] border border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-tertiary)] uppercase">
                <Package size={12} /> {items.length} TOTAL SKUS
             </div>
           </div>
           <Button variant="ghost" size="sm" className="gap-2 text-[10px] font-black uppercase text-[var(--text-tertiary)]">
              <Filter size={14} /> FILTER ANAL-CODES
           </Button>
        </div>

        <div className={cn("h-[600px] w-full", isInstitutional ? "ag-theme-quartz" : "ag-theme-quartz-dark")}>
           <AgGridReact 
             rowData={items.filter(i => 
               i.stockno?.toLowerCase().includes(search.toLowerCase()) || 
               i.itemdesc?.toLowerCase().includes(search.toLowerCase()) ||
               i.sfield1?.toLowerCase().includes(search.toLowerCase())
             )}
             columnDefs={colDefs}
             rowHeight={56}
             headerHeight={40}
             suppressCellFocus={true}
             enableCellTextSelection={true}
             overlayLoadingTemplate={`<span class="text-xs font-black uppercase text-[var(--text-tertiary)]">Loading Item Master DNA...</span>`}
             overlayNoRowsTemplate={`<span class="text-xs font-black uppercase text-[var(--text-tertiary)]">No SKUs found matching query.</span>`}
           />
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Departments', count: departments.length, icon: Layers },
          { label: 'Active Brands', count: brands.length, icon: Tag },
          { label: 'Size Groups', count: sizeGroups.length, icon: BarChart3 },
          { label: 'Critical Items', count: items.filter(i => i.itemstatus !== 'A').length, icon: Info, color: 'text-red-500' }
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

