/* ============================================================
 * SMRITI-OS — Mobile Terminal (B2B Grid Mode)
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useRef, useState, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, themeQuartz } from 'ag-grid-community'
import { Barcode, Trash2, X, User, UserCheck, Tag, Loader2, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/SovereignUI'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MobileBillingProps {
  items: any[]
  setItems: React.Dispatch<React.SetStateAction<any[]>>
  activeEntry: any
  setActiveEntry: React.Dispatch<React.SetStateAction<any>>
  commitLine: () => Promise<void>
  handleKeyDown: (e: React.KeyboardEvent, field: string) => void
  totals: any
  showSettle: boolean
  setShowSettle: (val: boolean) => void
  isFinalizing: boolean
  handleFinalize: (payments: any[]) => Promise<void>
  customer: { name: string, phone: string }
  setCustomer: (val: { name: string, phone: string }) => void
  salesman: string
  setSalesman: (val: string) => void
  billNo: string
  dateTime: string
  billDiscount: number
  setBillDiscount: (val: number) => void
  isCustomerMandatory?: boolean
  isSalesmanMandatory?: boolean
  fieldMask?: any[]
}

export default function MobileBilling({
  items, setItems, activeEntry, setActiveEntry, commitLine, handleKeyDown, totals,
  showSettle, setShowSettle, isFinalizing, handleFinalize, customer, setCustomer,
  salesman, setSalesman, billNo, dateTime, billDiscount, setBillDiscount,
  isCustomerMandatory, isSalesmanMandatory, fieldMask
}: MobileBillingProps) {
  const entryRef = useRef<HTMLInputElement>(null)
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CARD'>('CASH')
  const [showMetadata, setShowMetadata] = useState(false)
  const [isGridExpanded, setIsGridExpanded] = useState(false)

  const columnDefs: ColDef[] = [
    { field: 'stock_no', headerName: 'SKU', width: 100, pinned: 'left' },
    { field: 'descr', headerName: 'DESC', flex: 1, minWidth: 150 },
    { field: 'qty', headerName: 'QTY', width: 70, editable: true },
    { field: 'rate', headerName: 'RATE', width: 90, valueFormatter: (p: any) => (p.value || 0).toFixed(2) },
    { field: 'disc_per', headerName: 'D%', width: 60, editable: true },
    { field: 'total', headerName: 'TOTAL', width: 100, valueFormatter: (p: any) => (p.value || 0).toFixed(2) },
    { headerName: '', width: 50, pinned: 'right', cellRenderer: (p: any) => (
      <button onClick={() => setItems(prev => prev.filter(i => i.id !== p.data.id))} className="text-red-500 p-2">
        <Trash2 size={14} />
      </button>
    )}
  ]

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-hidden">
      {/* Mobile Sticky Header */}
      <div className="p-3 bg-[var(--surface)] border-b border-[var(--border-subtle)] flex justify-between items-center z-50">
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-[var(--primary)]">B2B Terminal #{billNo}</span>
          <div className="flex items-center gap-2">
             <span className="text-xl font-black text-[var(--text-primary)]">₹{totals.finalNet.toLocaleString()}</span>
             <Badge className="text-[8px] h-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{items.length} ITEMS</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setShowMetadata(!showMetadata)} className={cn("p-2 rounded-xl border transition-all", customer.phone ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]" : "bg-[var(--surface-container-low)] border-[var(--border-subtle)] text-[var(--text-tertiary)]")}>
              <User size={18} />
           </button>
           <Button onClick={() => setShowSettle(true)} className="h-10 px-4 bg-[var(--primary)] text-white font-black rounded-xl">SETTLE</Button>
        </div>
      </div>

      {/* Metadata Expandable */}
      <AnimatePresence>
        {showMetadata && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-[var(--surface-container-low)] border-b border-[var(--border-subtle)]">
            <div className="p-3 grid grid-cols-2 gap-2">
               <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  <label className="block text-[7px] font-black uppercase text-[var(--text-tertiary)] mb-0.5">B2B Customer</label>
                  <input className="w-full bg-transparent border-none outline-none text-[10px] font-black" placeholder="MOBILE / GSTIN" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
               </div>
               <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  <label className="block text-[7px] font-black uppercase text-[var(--text-tertiary)] mb-0.5">Sales Rep</label>
                  <input className="w-full bg-transparent border-none outline-none text-[10px] font-black" placeholder="ID" value={salesman} onChange={e => setSalesman(e.target.value)} />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Industrial Scan Area */}
      <div className="p-2 bg-[var(--surface)] border-b border-[var(--border-subtle)] shadow-sm z-40">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Barcode size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]" />
            <input ref={entryRef} className="w-full h-11 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3 text-xs font-bold uppercase outline-none focus:border-[var(--primary)]" placeholder="SCAN SKU..." value={activeEntry.stock_no} onChange={e => setActiveEntry({...activeEntry, stock_no: e.target.value.toUpperCase()})} onKeyDown={e => handleKeyDown(e, 'stock')} />
          </div>
          <div className="w-16">
            <input type="number" className="w-full h-11 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-xl text-center font-black text-xs" value={activeEntry.qty} onChange={e => setActiveEntry({...activeEntry, qty: Number(e.target.value)})} />
          </div>
          <Button onClick={commitLine} className="h-11 w-11 p-0 bg-[var(--primary)] text-white rounded-xl"><Plus size={20} /></Button>
        </div>
      </div>

      {/* B2B AG GRID ENGINE (Mobile Optimized) */}
      <div className="flex-1 relative bg-[var(--surface-container-lowest)]">
        <AgGridReact 
          theme={themeQuartz}
          rowData={items} 
          columnDefs={columnDefs} 
          rowHeight={48}
          headerHeight={36}
          suppressHorizontalScroll={false}
          onGridReady={p => p.api.sizeColumnsToFit()}
        />
        {items.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
            <Barcode size={48} />
            <p className="text-[10px] font-black uppercase mt-2">Ready for B2B Entry</p>
          </div>
        )}
      </div>

      {/* Footer Summary (B2B Compact) */}
      <div className="p-3 bg-[var(--surface)] border-t border-[var(--border-subtle)] flex justify-between items-end pb-safe">
         <div className="space-y-1">
            <div className="flex gap-4 text-[8px] font-black text-[var(--text-tertiary)] uppercase">
               <span>Gross: ₹{totals.gross.toFixed(0)}</span>
               <span className="text-amber-600">Disc: -₹{totals.disc.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[8px] font-black text-blue-600 uppercase">Bill Disc:</span>
               <input type="number" className="w-16 h-6 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded text-right px-1 font-black text-[10px] text-blue-600" value={billDiscount} onChange={e => setBillDiscount(Number(e.target.value))} />
            </div>
         </div>
         <div className="text-right">
            <p className="text-[7px] font-black text-[var(--text-tertiary)] uppercase mb-0.5">Final Payable</p>
            <p className="text-2xl font-black text-[var(--primary)] tracking-tighter leading-none">₹{totals.finalNet.toLocaleString()}</p>
         </div>
      </div>

      {/* Settlement Sheet (Same as Desktop for parity) */}
      <AnimatePresence>
        {showSettle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex flex-col justify-end bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-[var(--surface)] w-full rounded-t-[32px] p-6 pb-12 shadow-2xl border-t border-[var(--border-subtle)]">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-black uppercase tracking-widest">Settle B2B Bill</h2>
                 <button onClick={() => setShowSettle(false)} className="w-10 h-10 bg-[var(--surface-container-high)] rounded-full flex items-center justify-center"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => setPaymentMode('CASH')} className={cn("h-16 border-2 rounded-2xl font-black transition-all", paymentMode === 'CASH' ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border-subtle)] opacity-40")}>CASH</button>
                <button onClick={() => setPaymentMode('CARD')} className={cn("h-16 border-2 rounded-2xl font-black transition-all", paymentMode === 'CARD' ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border-subtle)] opacity-40")}>CARD / UPI</button>
              </div>

              <Button onClick={() => handleFinalize([{ id: paymentMode, amount: totals.finalNet * 100 }])} disabled={isFinalizing} className="w-full h-16 bg-[var(--primary)] text-white font-black uppercase rounded-2xl text-lg shadow-xl">
                {isFinalizing ? <Loader2 className="animate-spin" /> : `PAY ₹${totals.finalNet.toLocaleString()}`}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-black uppercase border", className)}>
      {children}
    </span>
  )
}

function Plus({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
}
