/* ============================================================
 * SMRITI-OS — Institutional Billing Cockpit (Lite Mode)
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * ============================================================ */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, ValueFormatterParams } from 'ag-grid-community'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { 
  Search, 
  User, 
  Trash2, 
  ChevronDown,
  Barcode,
  LayoutGrid,
  FileText,
  Loader2,
  Plus
} from 'lucide-react'
import { 
  Button, 
  Badge
} from '@/components/ui/SovereignUI'

interface BillItem {
  id: string
  stock_no: string
  descr: string
  rate: number
  qty: number
  disc_per: number
  disc_amt: number
  tax_amt: number
  total: number
}

export default function BillingModule() {
  const { theme } = useTheme()
  const entryRef = useRef<HTMLInputElement>(null)
  const qtyRef = useRef<HTMLInputElement>(null)
  const discRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<AgGridReact>(null)

  const [items, setItems] = useState<BillItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeEntry, setActiveEntry] = useState({
    stock_no: '',
    qty: 1,
    rate: 0,
    disc_per: 0
  })

  useEffect(() => {
    entryRef.current?.focus()
  }, [])

  const totals = useMemo(() => {
    return items.reduce((acc, curr) => {
      const rate = Number(curr.rate) || 0
      const qty = Number(curr.qty) || 0
      const discAmt = Number(curr.disc_amt) || 0
      const total = Number(curr.total) || 0
      
      return {
        items: acc.items + 1,
        qty: acc.qty + qty,
        gross: acc.gross + (qty * rate),
        disc: acc.disc + discAmt,
        net: acc.net + total
      }
    }, { items: 0, qty: 0, gross: 0, disc: 0, net: 0 })
  }, [items])

  // Institutional Commit Line Protocol
  const commitLine = async () => {
    const searchVal = activeEntry.stock_no.trim()
    if (!searchVal) {
      entryRef.current?.focus()
      return
    }

    const currentQty = Number(activeEntry.qty) || 1
    const currentDisc = Number(activeEntry.disc_per) || 0
    
    setIsSearching(true)
    try {
      const results = await api.inventory.search(searchVal)
      const inventoryItems = Array.isArray(results) ? results : (results.data || [])

      if (inventoryItems.length > 0) {
        const item = inventoryItems[0]
        const mrp_paise = (item.mrp_paise ?? (item.mrp ? item.mrp * 100 : (item.price ? item.price * 100 : 0)))
        const rate = mrp_paise / 100
        const disc_amt = (rate * currentQty * currentDisc) / 100
        const total = (rate * currentQty) - disc_amt

        const newItem: BillItem = {
          id: crypto.randomUUID(),
          stock_no: item.item_code || item.sku || item.code || 'N/A',
          descr: item.item_name || item.name || item.descr || 'Unknown Item',
          rate: rate,
          qty: currentQty,
          disc_per: currentDisc,
          disc_amt: disc_amt,
          tax_amt: 0,
          total: total
        }
        
        setItems(prev => [newItem, ...prev])
        // Reset and jump back to scanning
        setActiveEntry({ stock_no: '', qty: 1, rate: 0, disc_per: 0 })
        entryRef.current?.focus()
      } else {
        alert("SKU Not Found in Registry")
        entryRef.current?.select()
      }
    } catch (err) { 
      console.error("Search Fail:", err) 
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: 'stock' | 'qty' | 'disc') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (field === 'stock') {
        if (activeEntry.stock_no) qtyRef.current?.focus()
      } else if (field === 'qty') {
        discRef.current?.focus()
      } else if (field === 'disc') {
        commitLine()
      }
    }
  }

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: 'stock_no', headerName: 'STOCK NO', width: 140, cellStyle: { fontWeight: '900', color: 'var(--primary)' } },
    { field: 'descr', headerName: 'ITEM DESCRIPTION', flex: 1, cellStyle: { textTransform: 'uppercase', fontWeight: '700' } },
    { 
      field: 'rate', 
      headerName: 'RATE', 
      width: 100, 
      type: 'numericColumn', 
      valueFormatter: (p: ValueFormatterParams) => (Number(p.value) || 0).toFixed(2) 
    },
    { field: 'qty', headerName: 'QTY', width: 80, type: 'numericColumn', editable: true },
    { field: 'disc_per', headerName: 'D%', width: 80, type: 'numericColumn', editable: true },
    { 
      field: 'total', 
      headerName: 'TOTAL', 
      width: 120, 
      type: 'numericColumn', 
      cellStyle: { fontWeight: '900', color: 'var(--text-primary)' }, 
      valueFormatter: (p: ValueFormatterParams) => (Number(p.value) || 0).toFixed(2) 
    },
    {
      headerName: '',
      width: 50,
      cellRenderer: (p: any) => (
        <button onClick={() => setItems(prev => prev.filter(i => i.id !== p.data.id))} className="text-red-400 hover:text-red-600 transition-colors">
          <Trash2 size={14} />
        </button>
      )
    }
  ], [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--background)]">
      
      {/* ── LITE HEADER ── */}
      <header className="h-[var(--topbar-h)] bg-[var(--surface)] flex items-center px-6 justify-between shrink-0 border-b border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[var(--primary)] text-white flex items-center justify-center shadow-sm">
                 <FileText size={18} />
              </div>
              <span className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Billing Terminal</span>
           </div>
           <nav className="flex h-10 gap-2">
              <button className="px-4 h-full border-b-2 border-[var(--accent)] text-[var(--text-primary)] text-[10px] font-black uppercase">Sales [F8]</button>
              <button className="px-4 h-full text-[var(--text-tertiary)] text-[10px] font-black uppercase hover:text-[var(--text-primary)]">History</button>
           </nav>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col text-right pr-4 border-r border-[var(--border-subtle)]">
              <span className="text-[8px] font-black text-[var(--text-tertiary)] uppercase">Store Node</span>
              <span className="text-[10px] font-black text-[var(--text-primary)]">SMRITI-HYD-01</span>
           </div>
           <Badge variant="info" className="font-black py-1 px-3">HELP [F1]</Badge>
        </div>
      </header>

      {/* ── DOC INFO ── */}
      <section className="bg-[var(--surface)] border-b border-[var(--border-subtle)] p-4 grid grid-cols-12 gap-6 shrink-0">
         <div className="col-span-3">
            <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Customer</label>
            <div className="flex gap-1">
               <input value="WALK-IN" className="w-20 bg-[var(--surface-container)] border-transparent h-8 text-center text-[10px] font-bold text-[var(--text-secondary)]" disabled />
               <input placeholder="SEARCH [F2]..." className="flex-1 bg-[var(--surface)] border border-[var(--border-default)] h-8 px-2 text-[11px] font-bold uppercase focus:border-[var(--primary)] outline-none" />
            </div>
         </div>
         <div className="col-span-2">
            <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Type</label>
            <div className="flex items-center justify-between bg-[var(--surface-container)] border border-[var(--border-default)] px-3 h-8 text-[10px] font-bold">
               PRODUCT <ChevronDown size={14} />
            </div>
         </div>
         <div className="col-span-4 flex items-center justify-center">
            {isSearching && (
              <div className="flex items-center gap-2 text-[var(--primary)]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Locating SKU...</span>
              </div>
            )}
         </div>
         <div className="col-span-3 flex flex-col items-end">
            <span className="text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1">Invoice Number</span>
            <h4 className="text-xl font-mono font-black text-[var(--primary)] leading-none tracking-tighter">INV-26-009212</h4>
         </div>
      </section>

      {/* ── AG GRID WORKSPACE ── */}
      <main className="flex-1 flex flex-col p-2 overflow-hidden relative">
         <div className="flex-1 ag-theme-quartz w-full h-full shadow-sm">
            <AgGridReact
              ref={gridRef}
              rowData={items}
              columnDefs={columnDefs}
              defaultColDef={{ resizable: true, sortable: true, headerClass: 'ag-header-cell' }}
              animateRows={true}
              onGridReady={(params) => params.api.sizeColumnsToFit()}
            />
         </div>

         {/* ── DIRECT ENTRY BAR (BOTTOM) ── */}
         <div className="bg-[var(--surface-container)] border border-[var(--border-subtle)] mt-2 p-3 rounded shadow-sm">
            <div className="grid grid-cols-[220px_1fr_100px_80px_120px_150px] gap-4 items-end">
               <div className="relative">
                  <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1">Scan Station [F3]</label>
                  <Barcode size={14} className="absolute left-3 bottom-3 text-[var(--primary)] z-10" />
                  <input 
                   ref={entryRef}
                   className="w-full bg-[var(--surface)] border border-[var(--border-default)] h-11 pl-10 pr-3 text-xs font-black text-[var(--text-primary)] uppercase outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                   placeholder="SCAN SKU / BARCODE..."
                   autoComplete="off"
                   value={activeEntry.stock_no}
                   onChange={e => setActiveEntry({...activeEntry, stock_no: e.target.value.toUpperCase()})}
                   onKeyDown={e => handleKeyDown(e, 'stock')}
                  />
               </div>
               <div>
                  <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 text-center">Qty</label>
                  <input 
                   ref={qtyRef}
                   type="number"
                   className="w-full bg-[var(--surface)] border border-[var(--border-default)] h-11 px-3 text-center text-xs font-black outline-none focus:border-[var(--primary)]"
                   value={activeEntry.qty}
                   onChange={e => setActiveEntry({...activeEntry, qty: Number(e.target.value)})}
                   onKeyDown={e => handleKeyDown(e, 'qty')}
                  />
               </div>
               <div>
                  <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 text-center">Disc%</label>
                  <input 
                   ref={discRef}
                   type="number"
                   className="w-full bg-[var(--surface)] border border-[var(--border-default)] h-11 px-3 text-center text-xs font-black outline-none focus:border-[var(--primary)]"
                   value={activeEntry.disc_per}
                   onChange={e => setActiveEntry({...activeEntry, disc_per: Number(e.target.value)})}
                   onKeyDown={e => handleKeyDown(e, 'disc')}
                  />
               </div>
               <div className="col-span-2 flex flex-col items-end justify-center px-4 h-11">
                  <span className="text-[9px] font-black uppercase text-[var(--text-tertiary)]">Batch Value</span>
                  <span className="text-xl font-black text-[var(--text-primary)]">
                    ₹{((Number(activeEntry.qty) || 1) * (Number(activeEntry.rate) || 0)).toFixed(2)}
                  </span>
               </div>
               <Button 
                onClick={commitLine}
                className="h-11 bg-[var(--primary)] text-white text-[11px] font-black uppercase shadow-sm flex items-center justify-center gap-2"
               >
                 <Plus size={14} /> ADD TO BILL [ENT]
               </Button>
            </div>
         </div>
      </main>

      {/* ── FOOTER BILL SUMMARY ── */}
      <section className="bg-[var(--surface)] border-t border-[var(--border-subtle)] flex flex-col md:flex-row justify-between px-10 py-6 shrink-0">
         <div className="flex items-center gap-16">
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Item Count</span>
               <span className="text-4xl font-black text-[var(--text-primary)] leading-none">{totals.items}</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Total Qty</span>
               <span className="text-4xl font-black text-[var(--text-primary)] leading-none">{(Number(totals.qty) || 0)}</span>
            </div>
         </div>

         <div className="w-full md:w-[500px] flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2 border-b border-[var(--border-subtle)] pb-2 text-[12px] font-bold text-[var(--text-secondary)]">
               <span className="uppercase">Sub Total:</span>
               <span>₹{(Number(totals.gross) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[11px] font-black uppercase text-[var(--primary)]">Net Payable:</span>
               <span className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">₹{(Number(totals.net) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
         </div>
      </section>

      <footer className="h-[var(--status-bar-h)] bg-[var(--surface-container-high)] flex items-center px-6 justify-between shrink-0 text-[var(--text-tertiary)] text-[10px] font-black">
         <div className="flex items-center gap-8 divide-x divide-[var(--border-subtle)]">
            <span className="px-4 uppercase">F8: Settle</span>
            <span className="px-4 uppercase">F9: Totals</span>
            <span className="px-4 uppercase">F12: Suspend</span>
         </div>
         <div className="uppercase opacity-60 tracking-widest">SMRITI-OS | LITE PROTOCOL ACTIVE</div>
      </footer>
    </div>
  )
}
