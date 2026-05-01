/* ============================================================
 * SMRITI-OS — Institutional Billing Cockpit (Lite Mode)
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * ============================================================ */
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, ValueFormatterParams, ModuleRegistry } from 'ag-grid-community'
import { ClientSideRowModelModule, NumberEditorModule } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

// Register AG Grid Modules
ModuleRegistry.registerModules([ ClientSideRowModelModule, NumberEditorModule ])

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
  id: string       // Grid internal ID
  real_id: string  // Database UUID (Required for Backend)
  stock_no: string
  descr: string
  dept: string
  brand: string
  subclass1: string
  subclass2: string
  colour: string
  size: string
  rate: number
  qty: number
  disc_per: number
  disc_amt: number
  tax_amt: number
  total: number
}

function BillingModule() {
  const { theme } = useTheme()
  const entryRef = useRef<HTMLInputElement>(null)
  const qtyRef = useRef<HTMLInputElement>(null)
  const discRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<AgGridReact>(null)

  // 1. STATE DECLARATIONS
  const [items, setItems] = useState<BillItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeEntry, setActiveEntry] = useState({ stock_no: '', qty: 1, rate: 0, disc_per: 0 })
  const [showSettle, setShowSettle] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CARD'>('CASH')

  // 2. MEMOIZED TOTALS
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

  // 3. EFFECTS
  useEffect(() => {
    setPaymentAmount(totals.net)
  }, [totals.net])

  useEffect(() => {
    entryRef.current?.focus()
  }, [])

  // 4. LOGIC HANDLERS
  const commitLine = async () => {
    const searchVal = activeEntry.stock_no.trim()
    if (!searchVal || isSearching) return
    
    setIsSearching(true)
    try {
      const results = await api.inventory.search(searchVal)
      const inventoryItems = Array.isArray(results) ? results : (results.data || [])

      if (inventoryItems.length > 0) {
        const item = inventoryItems[0]
        const liveStock = Number(item.stock) || 0
        if (liveStock <= 0) {
           alert(`❌ OUT OF STOCK: SKU [${item.code}] has 0 balance.`)
           setActiveEntry({ stock_no: '', qty: 1, rate: 0, disc_per: 0 })
           entryRef.current?.focus()
           return
        }

        const rate = (item.mrp_paise ?? 0) / 100
        const currentQty = Number(activeEntry.qty) || 1
        const currentDisc = Number(activeEntry.disc_per) || 0
        
        const existingIndex = items.findIndex(i => i.stock_no === item.code && i.disc_per === currentDisc)
        
        if (existingIndex > -1) {
          const updatedItems = [...items]
          const existing = updatedItems[existingIndex]
          const newQty = existing.qty + currentQty
          const line_disc_amt = (rate * newQty * existing.disc_per) / 100
          
          updatedItems[existingIndex] = {
            ...existing,
            qty: newQty,
            disc_amt: line_disc_amt,
            total: (rate * newQty) - line_disc_amt
          }
          setItems(updatedItems)
        } else {
          const disc_amt = (rate * currentQty * currentDisc) / 100
          const total = (rate * currentQty) - disc_amt

          const newItem: BillItem = {
            id: crypto.randomUUID(),
            real_id: item.id,
            stock_no: item.code || 'N/A',
            descr: item.name,
            dept: item.department || '',
            brand: item.brand || '',
            subclass1: item.subclass1 || '',
            subclass2: item.subclass2 || '',
            colour: item.colour || '',
            size: item.size || '',
            rate: rate,
            qty: currentQty,
            disc_per: currentDisc,
            disc_amt: disc_amt,
            tax_amt: 0,
            total: total
          }
          setItems(prev => [newItem, ...prev])
        }
        setActiveEntry({ stock_no: '', qty: 1, rate: 0, disc_per: 0 })
        entryRef.current?.focus()
      } else {
        alert("SKU Not Found")
        entryRef.current?.select()
      }
    } catch (err) { console.error(err) } finally { setIsSearching(false) }
  }

  const handleFinalize = async () => {
    if (items.length === 0 || isFinalizing) return
    setIsFinalizing(true)
    try {
      const payload = {
        type: "Sales",
        items: items.map(i => ({
          product_id: i.real_id, 
          qty: i.qty,
          unit_price: Math.round(i.rate * 100),
          discount_per: i.disc_per,
          tax_per: 18 
        })),
        payments: [{ mode: paymentMode, amount: Math.round(paymentAmount * 100) }]
      }
      const res = await api.billing.finalize(payload)
      alert(`✅ BILL SAVED! No: ${res.data.bill_no}`)
      setItems([])
      setShowSettle(false)
    } catch (err) { alert("Failed to Save Bill.") } finally { setIsFinalizing(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: 'stock' | 'qty' | 'disc') => {
    if (e.key === 'F8') { e.preventDefault(); setShowSettle(true); return }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (field === 'stock' && activeEntry.stock_no) commitLine()
      else if (field === 'qty' || field === 'disc') commitLine()
    }
  }

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: 'stock_no', headerName: 'STOCK NO', width: 140, cellStyle: { fontWeight: '900', color: 'var(--primary)' } },
    { field: 'descr', headerName: 'DESCRIPTION', flex: 1, minWidth: 200 },
    { field: 'dept', headerName: 'DEPT', width: 120 },
    { field: 'brand', headerName: 'BRAND', width: 120 },
    { field: 'colour', headerName: 'COLOR', width: 100 },
    { field: 'size', headerName: 'SIZE', width: 80 },
    { field: 'rate', headerName: 'RATE', width: 100, type: 'numericColumn', valueFormatter: (p: any) => (p.value || 0).toFixed(2) },
    { field: 'qty', headerName: 'QTY', width: 80, type: 'numericColumn', editable: true },
    { field: 'disc_per', headerName: 'D%', width: 80, type: 'numericColumn', editable: true },
    { field: 'total', headerName: 'TOTAL', width: 120, type: 'numericColumn', cellStyle: { fontWeight: '900' }, valueFormatter: (p: any) => (p.value || 0).toFixed(2) },
    { headerName: '', width: 50, cellRenderer: (p: any) => (
        <button onClick={() => setItems(prev => prev.filter(i => i.id !== p.data.id))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
    )}
  ], [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--background)]">
      <header className="h-[var(--topbar-h)] bg-[var(--surface)] flex items-center px-6 justify-between shrink-0 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[var(--primary)] text-white flex items-center justify-center"><FileText size={18} /></div>
              <span className="text-sm font-black uppercase tracking-widest">Billing Terminal</span>
           </div>
        </div>
        <Badge variant="info">HELP [F1]</Badge>
      </header>

      <main className="flex-1 flex flex-col p-2 overflow-hidden relative">
         <div className="flex-1 ag-theme-quartz w-full h-full shadow-sm">
            <AgGridReact
              ref={gridRef}
              rowData={items}
              columnDefs={columnDefs}
              theme="legacy"
              defaultColDef={{ resizable: true, sortable: true }}
              onGridReady={(params) => params.api.sizeColumnsToFit()}
            />
         </div>

         <div className="bg-[var(--surface-container)] border border-[var(--border-subtle)] mt-2 p-3 rounded">
            <div className="grid grid-cols-[220px_1fr_100px_80px_120px_150px] gap-4 items-end">
               <div className="relative">
                  <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1">Scan Station [F3]</label>
                  <Barcode size={14} className="absolute left-3 bottom-3 text-[var(--primary)] z-10" />
                  <input ref={entryRef} className="w-full bg-[var(--surface)] border border-[var(--border-default)] h-11 pl-10 pr-3 text-xs font-black uppercase outline-none focus:border-[var(--primary)]" placeholder="SCAN SKU..." value={activeEntry.stock_no} onChange={e => setActiveEntry({...activeEntry, stock_no: e.target.value.toUpperCase()})} onKeyDown={e => handleKeyDown(e, 'stock')} />
               </div>
               <div>
                  <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1">Qty</label>
                  <input ref={qtyRef} type="number" className="w-full bg-[var(--surface)] border border-[var(--border-default)] h-11 px-3 text-center text-xs font-black outline-none" value={activeEntry.qty} onChange={e => setActiveEntry({...activeEntry, qty: Number(e.target.value)})} onKeyDown={e => handleKeyDown(e, 'qty')} />
               </div>
               <div>
                  <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1">Disc%</label>
                  <input ref={discRef} type="number" className="w-full bg-[var(--surface)] border border-[var(--border-default)] h-11 px-3 text-center text-xs font-black outline-none" value={activeEntry.disc_per} onChange={e => setActiveEntry({...activeEntry, disc_per: Number(e.target.value)})} onKeyDown={e => handleKeyDown(e, 'disc')} />
               </div>
               <div className="col-span-2 flex flex-col items-end justify-center px-4 h-11">
                  <span className="text-xl font-black text-[var(--text-primary)]">₹{((Number(activeEntry.qty) || 1) * (Number(activeEntry.rate) || 0)).toFixed(2)}</span>
               </div>
               <Button onClick={commitLine} className="h-11 bg-[var(--primary)] text-white text-[11px] font-black uppercase"><Plus size={14} /> ADD [ENT]</Button>
            </div>
         </div>
      </main>

      <section className="bg-[var(--surface)] border-t border-[var(--border-subtle)] flex justify-between px-10 py-6 shrink-0">
         <div className="flex gap-16">
            <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-[var(--text-tertiary)]">Items</span><span className="text-4xl font-black">{totals.items}</span></div>
            <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-[var(--text-tertiary)]">Qty</span><span className="text-4xl font-black">{totals.qty}</span></div>
         </div>
         <div className="w-[400px]">
            <div className="flex justify-between border-b pb-2 text-[12px] font-bold"><span className="uppercase">Gross:</span><span>₹{totals.gross.toFixed(2)}</span></div>
            <div className="flex justify-between pt-2"><span className="text-[11px] font-black uppercase text-[var(--primary)]">Net Payable:</span><span className="text-5xl font-black text-[var(--text-primary)]">₹{totals.net.toLocaleString()}</span></div>
         </div>
      </section>

      <footer className="h-8 bg-[var(--surface-container-high)] flex items-center px-6 justify-between text-[10px] font-black">
         <div className="flex gap-8"><span>F8: SETTLE</span><span>F9: TOTALS</span></div>
         <div>SMRITI-OS | LITE PROTOCOL ACTIVE</div>
      </footer>
      
      {showSettle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] w-full max-w-lg rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <header className="bg-[var(--primary)] p-4 text-white flex justify-between items-center"><h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><LayoutGrid size={16} /> Settle Transaction</h3><button onClick={() => setShowSettle(false)}><Plus size={20} className="rotate-45" /></button></header>
            <div className="p-8 space-y-6">
               <div className="flex justify-between items-end border-b pb-4"><span className="text-[10px] font-black uppercase text-[var(--text-tertiary)]">Total Amount Due</span><span className="text-4xl font-black text-[var(--primary)]">₹{totals.net.toLocaleString()}</span></div>
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setPaymentMode('CASH')} className={cn("h-16 border-2 rounded flex flex-col items-center justify-center transition-all", paymentMode === 'CASH' ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]" : "border-[var(--border-default)] opacity-50 grayscale")}>CASH [F1]</button>
                  <button onClick={() => setPaymentMode('CARD')} className={cn("h-16 border-2 rounded flex flex-col items-center justify-center transition-all", paymentMode === 'CARD' ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]" : "border-[var(--border-default)] opacity-50 grayscale")}>CARD/UPI [F2]</button>
               </div>
               <div><label className="block text-[10px] font-black uppercase text-[var(--text-tertiary)] mb-2">Amount Received</label><input autoFocus type="number" className="w-full h-14 bg-[var(--surface-container)] border border-[var(--border-default)] px-4 text-2xl font-black outline-none" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} /></div>
               <div className="bg-[var(--surface-container-high)] p-4 rounded border flex justify-between items-center"><span className="text-[11px] font-black uppercase">Change:</span><span className="text-xl font-black text-green-500">₹{Math.max(0, paymentAmount - totals.net).toFixed(2)}</span></div>
               <Button onClick={handleFinalize} disabled={isFinalizing || items.length === 0} className="w-full h-16 bg-[var(--primary)] text-white text-lg font-black uppercase shadow-lg disabled:opacity-50">{isFinalizing ? <Loader2 size={24} className="animate-spin" /> : "FINALIZE & SAVE [F8]"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillingModule
