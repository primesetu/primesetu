/* ============================================================
 * SMRITI-OS — Institutional GRN Processor (Lite Mode)
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * ============================================================ */
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, ValueFormatterParams } from 'ag-grid-community'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { 
  Truck, 
  Search, 
  Trash2, 
  Save, 
  Barcode, 
  ChevronDown,
  Database,
  Box,
  Loader2,
  Plus
} from 'lucide-react'
import { 
  Button, 
  Badge
} from '@/components/ui/SovereignUI'

interface GRNLine {
  id: string
  item_id: string
  item_code: string
  item_name: string
  qty_received: number
  unit_cost_paise: number
  total_paise: number
}

export default function GRNProcessor() {
  const { theme } = useTheme()
  const entryRef = useRef<HTMLInputElement>(null)
  const qtyRef = useRef<HTMLInputElement>(null)
  const costRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<AgGridReact>(null)

  const [vendors, setVendors] = useState<any[]>([])
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [grnNumber, setGrnNumber] = useState('')
  const [lines, setLines] = useState<GRNLine[]>([])
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  
  const [activeEntry, setActiveEntry] = useState({
    item_code: '',
    qty: 1,
    cost: 0
  })

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await api.vendors.list()
        const vendorData = Array.isArray(res) ? res : (res.data || [])
        setVendors(vendorData)
      } catch (e) { console.error(e) }
    }
    fetchVendors()
    setGrnNumber(`GRN-${Math.random().toString(36).substring(7).toUpperCase()}`)
    entryRef.current?.focus()
  }, [])

  const commitLine = async () => {
    const searchVal = activeEntry.item_code.trim()
    if (!searchVal) {
      entryRef.current?.focus()
      return
    }

    const currentQty = Number(activeEntry.qty) || 1
    const currentCost = Number(activeEntry.cost) || 0
    setIsSearching(true)

    try {
      const results = await api.inventory.search(searchVal)
      const inventoryItems = Array.isArray(results) ? results : (results.data || [])

      if (inventoryItems.length > 0) {
        const item = inventoryItems[0]
        const unit_cost_paise = currentCost > 0 ? (currentCost * 100) : (item.cost_paise ?? 0)

        const newLine: GRNLine = {
          id: crypto.randomUUID(),
          item_id: item.id,
          item_code: item.item_code || item.sku || 'N/A',
          item_name: item.item_name || item.name || 'Unknown SKU',
          qty_received: currentQty,
          unit_cost_paise: unit_cost_paise,
          total_paise: unit_cost_paise * currentQty
        }
        setLines(prev => [newLine, ...prev])
        setActiveEntry({ item_code: '', qty: 1, cost: 0 })
        entryRef.current?.focus()
      } else {
        alert("SKU Not Found")
        entryRef.current?.select()
      }
    } catch (err) {
      console.error("GRN Search Fail:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: 'sku' | 'qty' | 'cost') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (field === 'sku') {
        if (activeEntry.item_code) qtyRef.current?.focus()
      } else if (field === 'qty') {
        costRef.current?.focus()
      } else if (field === 'cost') {
        commitLine()
      }
    }
  }

  const handleSave = async () => {
    if (!selectedVendor || lines.length === 0) return
    try {
      setLoading(true)
      await api.procurement.processGRN({
        vendor_id: selectedVendor.id,
        grn_number: grnNumber,
        items: lines.map(l => ({
          item_id: l.item_id,
          qty_received: l.qty_received,
          unit_cost_paise: l.unit_cost_paise
        }))
      })
      alert("Institutional GRN Committed.")
      setLines([])
      setGrnNumber(`GRN-${Math.random().toString(36).substring(7).toUpperCase()}`)
    } catch (e) { alert("GRN Failed.") } finally { setLoading(false) }
  }

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: 'item_code', headerName: 'SKU CODE', width: 140, cellStyle: { fontWeight: '900', color: 'var(--primary)' } },
    { field: 'item_name', headerName: 'DESCRIPTION', flex: 1, cellStyle: { textTransform: 'uppercase', fontWeight: '700' } },
    { field: 'qty_received', headerName: 'QTY', width: 100, type: 'numericColumn', editable: true },
    { 
      field: 'unit_cost_paise', 
      headerName: 'UNIT COST (₹)', 
      width: 120, 
      type: 'numericColumn', 
      editable: true,
      valueFormatter: (p: ValueFormatterParams) => ((Number(p.value) || 0) / 100).toFixed(2) 
    },
    { 
      headerName: 'TOTAL VALUE', 
      width: 150, 
      type: 'numericColumn', 
      cellStyle: { fontWeight: '900', color: 'var(--text-primary)' },
      valueGetter: p => ((Number(p.data.qty_received) || 0) * (Number(p.data.unit_cost_paise) || 0)) / 100,
      valueFormatter: (p: ValueFormatterParams) => (Number(p.value) || 0).toLocaleString()
    },
    {
      headerName: '',
      width: 50,
      cellRenderer: (p: any) => (
        <button onClick={() => setLines(prev => prev.filter(i => i.id !== p.data.id))} className="text-red-400 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      )
    }
  ], [])

  const totals = useMemo(() => {
    return lines.reduce((acc, curr) => ({
      qty: acc.qty + (Number(curr.qty_received) || 0),
      value: acc.value + (Number(curr.total_paise) || 0)
    }), { qty: 0, value: 0 })
  }, [lines])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--background)]">
      
      {/* ── LITE HEADER ── */}
      <header className="h-[var(--topbar-h)] bg-[var(--surface)] flex items-center px-6 justify-between shrink-0 border-b border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[var(--color-teal-500)] text-white flex items-center justify-center shadow-sm">
                 <Box size={18} />
              </div>
              <span className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Inwarding Processor</span>
           </div>
           <nav className="flex h-10 gap-2">
              <button className="px-4 h-full border-b-2 border-[var(--accent)] text-[var(--text-primary)] text-[10px] font-black uppercase">GRN Entry</button>
              <button className="px-4 h-full text-[var(--text-tertiary)] text-[10px] font-black uppercase">History</button>
           </nav>
        </div>
        <div className="flex items-center gap-4">
           <Badge variant="warning" className="font-black px-4">BATCH: {grnNumber}</Badge>
           <Truck size={14} className="text-[var(--text-tertiary)]" />
        </div>
      </header>

      {/* ── LITE VENDOR INFO ── */}
      <section className="bg-[var(--surface)] border-b border-[var(--border-subtle)] p-4 grid grid-cols-12 gap-6 shrink-0">
         <div className="col-span-4">
            <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Vendor Selection</label>
            <select 
              className="w-full bg-[var(--surface-container)] border border-[var(--border-default)] rounded h-8 px-3 text-[11px] font-bold uppercase outline-none focus:border-[var(--primary)]"
              onChange={e => setSelectedVendor(vendors.find(v => v.id === e.target.value))}
            >
              <option value="">SELECT VENDOR</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name || v.descr}</option>)}
            </select>
         </div>
         <div className="col-span-3">
            <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Supplier Invoice</label>
            <input className="w-full bg-[var(--surface)] border border-[var(--border-default)] rounded h-8 px-3 text-[11px] font-bold uppercase outline-none" placeholder="REF NUMBER..." />
         </div>
         <div className="col-span-2 flex items-center justify-center">
            {isSearching && (
              <div className="flex items-center gap-2 text-[var(--primary)]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-[9px] font-black uppercase">SKU Lookup...</span>
              </div>
            )}
         </div>
         <div className="col-span-3 flex items-end justify-end">
            <Button className="h-9 bg-[var(--primary)] text-white text-[11px] font-black uppercase px-8 gap-2 shadow-md" onClick={handleSave} loading={loading}>
               <Save size={14} /> COMMIT INWARD [F9]
            </Button>
         </div>
      </section>

      {/* ── LITE AG GRID WORKSPACE ── */}
      <main className="flex-1 flex flex-col p-2 overflow-hidden relative">
         <div className="flex-1 ag-theme-quartz w-full h-full shadow-sm">
            <AgGridReact
              ref={gridRef}
              rowData={lines}
              columnDefs={columnDefs}
              defaultColDef={{ resizable: true, sortable: true, headerClass: 'ag-header-cell' }}
              animateRows={true}
              onGridReady={(params) => params.api.sizeColumnsToFit()}
            />
         </div>

         {/* ── LITE DIRECT ENTRY BAR (BOTTOM) ── */}
         <div className="bg-[var(--surface-container)] border border-[var(--border-subtle)] mt-2 p-3 rounded shadow-sm">
            <div className="grid grid-cols-[220px_1fr_100px_140px_160px_140px] gap-4 items-end">
               <div className="relative">
                  <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1">Scan Station [SKU/Barcode]</label>
                  <Barcode size={14} className="absolute left-3 bottom-3 text-[var(--primary)] z-10" />
                  <input 
                   ref={entryRef}
                   className="w-full bg-[var(--surface)] border border-[var(--border-default)] h-11 pl-10 pr-3 text-xs font-black text-[var(--text-primary)] uppercase outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                   placeholder="READY TO INWARD..."
                   autoComplete="off"
                   value={activeEntry.item_code}
                   onChange={e => setActiveEntry({...activeEntry, item_code: e.target.value.toUpperCase()})}
                   onKeyDown={e => handleKeyDown(e, 'sku')}
                  />
               </div>
               <div>
                  <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 text-right">Inward Qty</label>
                  <input 
                   ref={qtyRef}
                   type="number"
                   className="w-full bg-[var(--surface)] border border-[var(--border-default)] h-11 px-3 text-right text-xs font-black outline-none focus:border-[var(--primary)]"
                   value={activeEntry.qty}
                   onChange={e => setActiveEntry({...activeEntry, qty: Number(e.target.value)})}
                   onKeyDown={e => handleKeyDown(e, 'qty')}
                  />
               </div>
               <div>
                  <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 text-right">Unit Cost (₹)</label>
                  <input 
                   ref={costRef}
                   type="number"
                   className="w-full bg-[var(--surface)] border border-[var(--border-default)] h-11 px-3 text-right text-xs font-black outline-none focus:border-[var(--primary)]"
                   placeholder="0.00"
                   value={activeEntry.cost || ''}
                   onChange={e => setActiveEntry({...activeEntry, cost: Number(e.target.value)})}
                   onKeyDown={e => handleKeyDown(e, 'cost')}
                  />
               </div>
               <div className="col-span-2 flex flex-col items-end justify-center px-4 h-11">
                  <span className="text-[9px] font-black uppercase text-[var(--text-tertiary)]">Batch Value</span>
                  <span className="text-xl font-black text-[var(--text-primary)]">
                    ₹{((Number(activeEntry.qty) || 1) * (Number(activeEntry.cost) || 0)).toFixed(2)}
                  </span>
               </div>
               <Button 
                onClick={commitLine}
                className="h-11 bg-[var(--accent)] text-black text-[11px] font-black uppercase shadow-sm flex items-center justify-center gap-2"
               >
                 <Plus size={14} /> ADD TO GRN [ENT]
               </Button>
            </div>
         </div>
      </main>

      {/* ── LITE FOOTER SUMMARY ── */}
      <section className="bg-[var(--surface)] border-t border-[var(--border-subtle)] flex flex-col md:flex-row justify-between px-10 py-6 shrink-0">
         <div className="flex items-center gap-16">
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">SKU Count</span>
               <span className="text-4xl font-black text-[var(--text-primary)] leading-none">{lines.length}</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Total Volume</span>
               <span className="text-4xl font-black text-[var(--text-primary)] leading-none">{(Number(totals.qty) || 0)}</span>
            </div>
         </div>

         <div className="w-full md:w-[500px] flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2 border-b border-[var(--border-subtle)] pb-2 text-[12px] font-bold text-[var(--text-secondary)]">
               <span className="uppercase">Net Inventory Value:</span>
               <span>₹{(Number(totals.value) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[11px] font-black uppercase text-[var(--primary)]">Total Batch Value:</span>
               <span className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">₹{(Number(totals.value) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
         </div>
      </section>

      <footer className="h-[var(--status-bar-h)] bg-[var(--surface-container-high)] flex items-center px-6 justify-between shrink-0 text-[var(--text-tertiary)] text-[10px] font-black">
         <div className="flex items-center gap-8 divide-x divide-[var(--border-subtle)]">
            <span className="px-4 uppercase">F2: VENDOR LIST</span>
            <span className="px-4 uppercase">F9: COMMIT GRN</span>
         </div>
         <div className="uppercase opacity-60 tracking-widest">SMRITI-OS | WAREHOUSE LITE PROTOCOL</div>
      </footer>
    </div>
  )
}
