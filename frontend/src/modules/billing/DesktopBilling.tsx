/* ============================================================
 * SMRITI-OS — Desktop Terminal (Industrial Mode)
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useRef, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef } from 'ag-grid-community'
import { Barcode, Trash2, FileText, User, UserCheck, Calendar, Clock, Tag } from 'lucide-react'
import { Button, Badge } from '@/components/ui/SovereignUI'

interface DesktopBillingProps {
  items: any[]
  setItems: React.Dispatch<React.SetStateAction<any[]>>
  activeEntry: any
  setActiveEntry: React.Dispatch<React.SetStateAction<any>>
  commitLine: () => Promise<void>
  handleKeyDown: (e: React.KeyboardEvent, field: string) => void
  totals: any
  setShowSettle: (val: boolean) => void
  customer: { name: string, phone: string }
  setCustomer: (val: { name: string, phone: string }) => void
  salesman: string
  setSalesman: (val: string) => void
  billNo: string
  dateTime: string
  billDiscount: number
  setBillDiscount: (val: number) => void
}

export default function DesktopBilling({
  items,
  setItems,
  activeEntry,
  setActiveEntry,
  commitLine,
  handleKeyDown,
  totals,
  setShowSettle,
  customer,
  setCustomer,
  salesman,
  setSalesman,
  billNo,
  dateTime,
  billDiscount,
  setBillDiscount
}: DesktopBillingProps) {
  const entryRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<AgGridReact>(null)

  useEffect(() => {
    entryRef.current?.focus()
  }, [])

  const columnDefs: ColDef[] = [
    { field: 'stock_no', headerName: 'STOCK NO', width: 140 },
    { field: 'descr', headerName: 'DESCRIPTION', flex: 1 },
    { field: 'rate', headerName: 'RATE', width: 100, valueFormatter: (p: any) => (p.value || 0).toFixed(2) },
    { field: 'qty', headerName: 'QTY', width: 80, editable: true },
    { field: 'disc_per', headerName: 'DISC %', width: 80, editable: true },
    { field: 'total', headerName: 'TOTAL', width: 120, valueFormatter: (p: any) => (p.value || 0).toFixed(2) },
    { headerName: '', width: 50, cellRenderer: (p: any) => (
      <button onClick={() => setItems(prev => prev.filter(i => i.id !== p.data.id))} className="text-red-400 p-2 hover:bg-red-500/10 rounded-full transition-all">
        <Trash2 size={14} />
      </button>
    )}
  ]

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* ── INDUSTRIAL HEADER ── */}
      <header className="h-16 bg-[var(--surface)] flex items-center px-6 justify-between border-b border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-black uppercase tracking-widest text-sm">
            <FileText size={18} className="text-[var(--primary)]" /> 
            Terminal <span className="text-[var(--primary)] ml-1">#{billNo}</span>
          </div>
          <div className="h-6 w-px bg-[var(--border-subtle)]" />
          <div className="flex items-center gap-4 text-[10px] font-black uppercase text-[var(--text-tertiary)]">
             <div className="flex items-center gap-2"><Calendar size={14} /> {dateTime.split(',')[0]}</div>
             <div className="flex items-center gap-2"><Clock size={14} /> {dateTime.split(',')[1]}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Customer & Salesman Quick Entry */}
           <div className="flex items-center gap-2 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5">
              <User size={14} className="text-[var(--primary)]" />
              <input 
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase w-32 placeholder:opacity-30" 
                placeholder="CUSTOMER MOBILE"
                value={customer.phone}
                onChange={e => setCustomer({...customer, phone: e.target.value})}
              />
           </div>
           <div className="flex items-center gap-2 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5">
              <UserCheck size={14} className="text-emerald-500" />
              <input 
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase w-32 placeholder:opacity-30" 
                placeholder="SALES PERSONNEL"
                value={salesman}
                onChange={e => setSalesman(e.target.value)}
              />
           </div>
           <Badge variant="info">F8: SETTLE</Badge>
        </div>
      </header>
      
      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
        {/* Main Grid Area */}
        <div className="flex-1 ag-theme-quartz w-full h-full rounded-xl overflow-hidden border border-[var(--border-subtle)] shadow-xl">
          <AgGridReact 
            ref={gridRef} 
            rowData={items} 
            columnDefs={columnDefs} 
            theme="legacy" 
            onGridReady={p => p.api.sizeColumnsToFit()} 
          />
        </div>

        {/* Input & Summary Section */}
        <div className="grid grid-cols-12 gap-4">
           {/* Entry Area */}
           <div className="col-span-8 bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xl flex gap-4 items-end">
              <div className="flex-1 relative">
                <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Scan SKU / Stock No (F1)</label>
                <div className="relative">
                  <Barcode size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]" />
                  <input 
                    ref={entryRef} 
                    className="w-full h-12 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-lg pl-10 pr-4 text-xs font-black uppercase outline-none focus:border-[var(--primary)] transition-all" 
                    value={activeEntry.stock_no} 
                    onChange={e => setActiveEntry({...activeEntry, stock_no: e.target.value.toUpperCase()})} 
                    onKeyDown={e => handleKeyDown(e, 'stock')} 
                    placeholder="READY FOR SCAN..." 
                    autoFocus
                  />
                </div>
              </div>
              <div className="w-20">
                <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Qty</label>
                <input type="number" className="w-full h-12 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-lg text-center font-black text-sm" value={activeEntry.qty} onChange={e => setActiveEntry({...activeEntry, qty: Number(e.target.value)})} onKeyDown={e => handleKeyDown(e, 'qty')} />
              </div>
              <div className="w-24">
                <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Item Disc %</label>
                <input type="number" className="w-full h-12 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-lg text-center font-black text-sm text-amber-600" value={activeEntry.disc_per} onChange={e => setActiveEntry({...activeEntry, disc_per: Number(e.target.value)})} onKeyDown={e => handleKeyDown(e, 'disc')} />
              </div>
              <Button onClick={() => { commitLine(); entryRef.current?.focus(); }} className="h-12 bg-[var(--primary)] text-white font-black uppercase px-6 rounded-lg">COMMIT (ENTER)</Button>
           </div>

           {/* Summary Area */}
           <div className="col-span-4 bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xl flex flex-col justify-between">
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-[var(--text-tertiary)]">
                    <span>Gross Total</span>
                    <span>₹{totals.gross.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-amber-600">
                    <span>Item Discount</span>
                    <span>-₹{totals.disc.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-blue-600">Bill Discount (₹)</span>
                    <input 
                      type="number" 
                      className="w-24 h-8 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded text-right px-2 font-black text-xs text-blue-600" 
                      value={billDiscount}
                      onChange={e => setBillDiscount(Number(e.target.value))}
                    />
                 </div>
              </div>
              <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between items-end">
                 <div>
                    <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Net Amount</p>
                    <p className="text-4xl font-black text-[var(--primary)] tracking-tighter">₹{totals.finalNet.toLocaleString()}</p>
                 </div>
                 <Button onClick={() => setShowSettle(true)} className="h-12 bg-[var(--primary)] text-white font-black px-6 rounded-lg shadow-lg shadow-[var(--primary)]/20 hover:scale-[1.02] transition-all">SETTLE (F8)</Button>
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}
