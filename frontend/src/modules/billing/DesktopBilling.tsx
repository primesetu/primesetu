/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * System Architect : Jawahar R. M. | © 2026
 * ============================================================ */
import React, { useRef, useEffect, useMemo } from 'react'
import { Barcode, Trash2, FileText, User, UserCheck, Calendar, Clock } from 'lucide-react'
import { Button, Badge } from '@/components/ui/SovereignUI'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, themeQuartz } from 'ag-grid-community'
import { buildColDefs } from '@/lib/GridEngine'
import { api } from '@/api/client'

interface DesktopBillingProps {
  items: any[]
  setItems: React.Dispatch<React.SetStateAction<any[]>>
  activeEntry: any
  setActiveEntry: React.Dispatch<React.SetStateAction<any>>
  commitLine: () => Promise<void>
  handleKeyDown: (e: React.KeyboardEvent, field: string) => void
  totals: any
  setShowSettle: (val: boolean) => void
  customer: { name: string; phone: string }
  setCustomer: (val: { name: string; phone: string }) => void
  salesman: string
  setSalesman: (val: string) => void
  billNo: string
  dateTime: string
  billDiscount: number
  setBillDiscount: (val: number) => void
  isCustomerMandatory?: boolean
  isSalesmanMandatory?: boolean
  personnelList?: any[]
  customerResults?: any[]
  onCustomerSearch?: (q: string) => void
  fieldMask?: any[]
}

export default function DesktopBilling({
  items, setItems, activeEntry, setActiveEntry,
  commitLine, handleKeyDown, totals, setShowSettle,
  customer, setCustomer, salesman, setSalesman,
  billNo, dateTime, billDiscount, setBillDiscount,
  isCustomerMandatory, isSalesmanMandatory,
  personnelList = [], customerResults = [], onCustomerSearch, fieldMask
}: DesktopBillingProps) {
  const entryRef = useRef<HTMLInputElement>(null)
  useEffect(() => { entryRef.current?.focus() }, [])

  const columnDefs = useMemo(() => {
    if (!fieldMask || fieldMask.length === 0) {
      return [
        { field: 'StockNo', headerName: 'STOCK NO', width: 120, pinned: 'left' as const },
        { field: 'ItemDesc', headerName: 'ITEM DESCRIPTION', flex: 1, minWidth: 150 },
        { field: 'Qty', headerName: 'QTY', width: 70, editable: true },
        { field: 'Retail_Price', headerName: 'RATE', width: 100, valueFormatter: (p: any) => (p.value || 0).toFixed(2) },
        { field: 'disc_per', headerName: 'D%', width: 60, editable: true },
        { field: 'total', headerName: 'TOTAL', width: 110, valueFormatter: (p: any) => (p.value || 0).toFixed(2) },
        { headerName: '', width: 50, pinned: 'right' as const, cellRenderer: (p: any) => (
          <button onClick={async () => {
            const id = p.data?.id;
            setItems(prev => prev.filter(i => i.id !== id));
            try { await api.billing.removeFromDraft(id); } catch(e) {}
          }} className="text-red-500 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded transition-all">
            <Trash2 size={14} />
          </button>
        )}
      ];
    }
    
    const baseCols = buildColDefs(fieldMask, {
      colDefMerge: {
        qty: { editable: true },
        disc_per: { editable: true },
      }
    });

    return [
      ...baseCols,
      {
        headerName: '', width: 50, pinned: 'right' as const, cellRenderer: (p: any) => (
          <button onClick={async () => {
            const id = p.data?.id;
            setItems(prev => prev.filter(i => i.id !== id));
            try { await api.billing.removeFromDraft(id); } catch(e) {}
          }} className="text-red-500 p-2 hover:bg-red-500/10 rounded transition-all">
            <Trash2 size={14} />
          </button>
        )
      }
    ] as any[];
  }, [fieldMask, setItems]);

  // Derived values for active entry
  const entryValue = (activeEntry.Retail_Price || 0) * (activeEntry.Qty || 1)
  const entryDiscAmt = (entryValue * (activeEntry.disc_per || 0)) / 100
  const entryTotal = entryValue - entryDiscAmt

  // Summary
  const schemeDisc = totals.disc || 0
  const gstAmt = (totals.net || 0) * 0.05 // default 5%, will come from item later
  const today = dateTime.split(',')[0]
  const time = dateTime.split(',')[1]

  const inputCls = "bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded px-1.5 py-1 text-[11px] font-black uppercase outline-none focus:border-[var(--primary)] transition-all"
  const labelCls = "block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-0.5 tracking-widest"

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">

      {/* ── HEADER ── */}
      <header className="bg-[var(--surface)] border-b border-[var(--border-subtle)] px-4 py-2 space-y-2">
        {/* Row 1: Brand + Bill meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-black uppercase tracking-widest text-sm">
              <FileText size={16} className="text-[var(--primary)]" />
              PrimeSetu POS
              <span className="text-[var(--primary)] ml-1 font-mono">INV #{billNo}</span>
            </div>
            <div className="h-5 w-px bg-[var(--border-subtle)]" />
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1"><Calendar size={12} />{today}</span>
              <span className="flex items-center gap-1"><Clock size={12} />{time}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info">F8: SETTLE</Badge>
            <Badge variant="warn">F12: SUSPEND</Badge>
          </div>
        </div>

        {/* Row 2: All Shoper9 header fields */}
        <div className="grid grid-cols-12 gap-3 items-end">
          {/* Bill Type */}
          <div className="col-span-1">
            <label className={labelCls}>Bill Type</label>
            <select className={inputCls + " w-full"}>
              <option value="product">Product</option>
              <option value="service">Service</option>
            </select>
          </div>

          {/* Transaction Type */}
          <div className="col-span-1">
            <label className={labelCls}>Txn Type</label>
            <select className={inputCls + " w-full"}>
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          {/* Bill Date */}
          <div className="col-span-2">
            <label className={labelCls}>Bill Date</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className={inputCls + " w-full"} />
          </div>

          {/* Till / Counter */}
          <div className="col-span-2">
            <label className={labelCls}>Till / Counter</label>
            <select className={inputCls + " w-full"}>
              <option>Till 1 — Entrance</option>
              <option selected>Till 2 — Main</option>
              <option>Till 3 — Express</option>
            </select>
          </div>

          {/* Customer Code (searchable) */}
          <div className="col-span-2 relative">
            <label className={labelCls}>
              <User size={9} className="inline mr-1" />
              Customer Code {isCustomerMandatory && <span className="text-red-500">*</span>}
            </label>
            <input
              className={inputCls + " w-full"}
              placeholder="Code / Mobile [F2]"
              value={customer.phone}
              onChange={e => { setCustomer({ ...customer, phone: e.target.value }); onCustomerSearch?.(e.target.value) }}
              onFocus={() => onCustomerSearch?.(customer.phone || '')}
            />
            {customerResults.length > 0 && (
              <div className="absolute top-full left-0 w-72 bg-[var(--surface)] border border-[var(--border-subtle)] shadow-2xl rounded z-50 mt-1 max-h-40 overflow-y-auto">
                {customerResults.map((c: any) => (
                  <button key={c.code} onClick={() => { setCustomer({ name: c.name, phone: c.phone }); onCustomerSearch?.("") }}
                    className="w-full text-left p-2 hover:bg-[var(--primary)] hover:text-white transition-colors border-b border-[var(--border-subtle)] last:border-0">
                    <p className="text-[10px] font-black uppercase">{c.name}</p>
                    <p className="text-[8px] opacity-60 font-mono">{c.phone} | {c.code}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Name — auto resolved, readonly */}
          <div className="col-span-2">
            <label className={labelCls}>Customer Name</label>
            <input
              className={inputCls + " w-full bg-[var(--border-subtle)]/30 cursor-not-allowed"}
              placeholder="Auto-resolved"
              value={customer.name}
              readOnly
            />
          </div>

          {/* Salesman */}
          <div className="col-span-2">
            <label className={labelCls}>
              <UserCheck size={9} className="inline mr-1 text-emerald-500" />
              Salesman {isSalesmanMandatory && <span className="text-red-500">*</span>}
            </label>
            <select className={inputCls + " w-full"} value={salesman} onChange={e => setSalesman(e.target.value)}>
              <option value="">SELECT STAFF</option>
              {personnelList.map((p: any) => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
        {/* ── ITEM GRID (Shoper9 column order) ── */}
        <div className="flex-1 bg-[var(--surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden shadow-sm flex flex-col">
          <div className="flex-1 relative bg-[var(--surface-container-lowest)]">
            <AgGridReact 
              theme={themeQuartz}
              rowData={items} 
              columnDefs={columnDefs} 
              rowHeight={44}
              headerHeight={36}
              suppressHorizontalScroll={false}
              suppressMovableColumns={true} // LOCK: Institutional Parity
              suppressDragLeaveHidesColumns={true}
              onGridReady={p => p.api.sizeColumnsToFit()}
              overlayNoRowsTemplate='<div style="padding:48px;text-align:center;color:var(--text-tertiary);font-style:italic;font-size:14px;">Scan a product or enter Stock No below to begin...</div>'
            />
          </div>

          {/* ── BILL FOOTER SUMMARY (Shoper9 style) ── */}
          <div className="bg-[var(--surface-container-low)] border-t border-[var(--border-subtle)] flex justify-between items-end p-3 flex-shrink-0">
            {/* Left: item/qty counters */}
            <div className="flex items-end gap-6">
              <div>
                <span className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-0.5">Total Items</span>
                <span className="text-2xl font-black text-[var(--primary)]">{totals.items || 0}</span>
              </div>
              <div>
                <span className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-0.5">Total Qty</span>
                <span className="text-2xl font-black text-[var(--primary)]">{totals.qty || 0}</span>
              </div>
              <div className="pl-4 border-l border-[var(--border-subtle)]">
                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase border border-amber-200">
                  Status: {items.length > 0 ? 'DRAFT' : 'EMPTY'}
                </span>
              </div>
            </div>

            {/* Right: totals breakdown */}
            <div className="flex gap-6 items-end">
              <div className="w-64 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Gross Value</span>
                  <span className="font-bold">₹{(totals.gross || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>Item Discount</span>
                  <span>−₹{schemeDisc.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Bill Discount</span>
                  <div className="flex items-center gap-1">
                    <span>−₹</span>
                    <input type="number" className="w-16 text-right bg-transparent border-b border-blue-300 outline-none text-[11px] font-black"
                      value={billDiscount} onChange={e => setBillDiscount(Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex justify-between text-[var(--text-tertiary)]">
                  <span>GST (est.)</span>
                  <span>₹{gstAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[var(--border-subtle)] text-[var(--primary)]">
                  <span className="font-black uppercase">Net Amount</span>
                  <span className="text-xl font-black">₹{(totals.finalNet || 0).toLocaleString()}</span>
                </div>
              </div>

              <Button onClick={() => setShowSettle(true)}
                className="h-12 bg-[var(--primary)] text-white font-black px-8 rounded-lg shadow-lg hover:scale-[1.02] transition-all text-sm">
                SETTLE (F8)
              </Button>
            </div>
          </div>
        </div>

        {/* ── DIRECT ENTRY ROW (Moved to Bottom - Shoper9 style) ── */}
        <div className="bg-[var(--surface)] border-t-2 border-[var(--primary)] rounded-xl px-4 py-3 flex-shrink-0 shadow-lg">
          <div className="grid grid-cols-[40px_130px_1fr_80px_60px_80px_70px_60px_80px_90px_90px_auto] gap-2 items-end">

            <div>
              <label className={labelCls}>S.No</label>
              <input className={inputCls + " w-full text-center bg-[var(--border-subtle)]/30 cursor-not-allowed"} value={items.length + 1} readOnly />
            </div>

            {/* Stock No (Always Visible) */}
            <div>
              <label className={labelCls}>Stock No <span className="text-[var(--primary)]">[F1]</span></label>
              <div className="relative">
                <Barcode size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--primary)]" />
                <input ref={entryRef} id="input-stock" className={inputCls + " w-full pl-7"}
                  value={activeEntry.stock_no}
                  onChange={e => setActiveEntry({ ...activeEntry, stock_no: e.target.value.toUpperCase() })}
                  onKeyDown={e => handleKeyDown(e, 'stock')}
                  placeholder="SCAN..." autoFocus />
              </div>
            </div>

            {/* Item Description (Usually Read-only) */}
            <div className={(!fieldMask || fieldMask.some(m => m.field.toLowerCase().includes('desc') && m.visible)) ? '' : 'hidden'}>
              <label className={labelCls}>Item Description</label>
              <input id="input-descr" className={inputCls + " w-full bg-[var(--border-subtle)]/30 cursor-not-allowed"}
                value={activeEntry.descr || ''} readOnly placeholder="Auto-filled" />
            </div>

            {/* Rate / MRP */}
            <div className={(!fieldMask || fieldMask.some(m => ['rate', 'mrp', 'retail_price'].includes(m.field.toLowerCase()) && m.visible)) ? '' : 'hidden'}>
              <label className={labelCls + " text-right"}>Rate</label>
              <input type="number" id="input-rate" className={inputCls + " w-full text-right"}
                value={activeEntry.rate || ''}
                onChange={e => setActiveEntry({ ...activeEntry, rate: Number(e.target.value) })}
                onKeyDown={e => handleKeyDown(e, 'rate')} placeholder="0.00" 
                readOnly={fieldMask?.find(m => ['rate', 'mrp', 'retail_price'].includes(m.field.toLowerCase()))?.editable === false} />
            </div>

            {/* Qty */}
            <div className={(!fieldMask || fieldMask.some(m => m.field.toLowerCase() === 'qty' && m.visible)) ? '' : 'hidden'}>
              <label className={labelCls + " text-right"}>Qty</label>
              <input type="number" id="input-qty" className={inputCls + " w-full text-right"}
                value={activeEntry.qty}
                onChange={e => setActiveEntry({ ...activeEntry, qty: Number(e.target.value) })}
                onKeyDown={e => handleKeyDown(e, 'qty')} 
                readOnly={fieldMask?.find(m => m.field.toLowerCase() === 'qty')?.editable === false} />
            </div>

            {/* Value (Calculated) */}
            <div>
              <label className={labelCls + " text-right"}>Value</label>
              <input className={inputCls + " w-full text-right bg-[var(--border-subtle)]/30 cursor-not-allowed"}
                value={entryValue.toFixed(2)} readOnly />
            </div>

            {/* Disc Cd */}
            <div className={(!fieldMask || fieldMask.some(m => m.field.toLowerCase().includes('disc_cd') && m.visible)) ? '' : 'hidden'}>
              <label className={labelCls + " text-center"}>Disc Cd</label>
              <input id="input-disc_cd" className={inputCls + " w-full text-center"}
                value={activeEntry.disc_cd || ''}
                onChange={e => setActiveEntry({ ...activeEntry, disc_cd: e.target.value.toUpperCase() })}
                onKeyDown={e => handleKeyDown(e, 'disc_cd')}
                placeholder="-" />
            </div>

            {/* Disc % */}
            <div className={(!fieldMask || fieldMask.some(m => (m.field.toLowerCase().includes('discper') || m.field.toLowerCase() === 'disc_per') && m.visible)) ? '' : 'hidden'}>
              <label className={labelCls + " text-right"}>Disc %</label>
              <input type="number" id="input-disc_per" className={inputCls + " w-full text-right text-amber-600"}
                value={activeEntry.disc_per}
                onChange={e => setActiveEntry({ ...activeEntry, disc_per: Number(e.target.value) })}
                onKeyDown={e => handleKeyDown(e, 'disc_per')} 
                readOnly={fieldMask?.find(m => m.field.toLowerCase().includes('disc_per'))?.editable === false} />
            </div>

            {/* Disc Amt (Calculated) */}
            <div className={(!fieldMask || fieldMask.some(m => m.field.toLowerCase().includes('discamt') && m.visible)) ? '' : 'hidden'}>
              <label className={labelCls + " text-right"}>Disc Amt</label>
              <input className={inputCls + " w-full text-right bg-[var(--border-subtle)]/30 cursor-not-allowed text-amber-600"}
                value={entryDiscAmt.toFixed(2)} readOnly />
            </div>

            {/* Total (Calculated) */}
            <div>
              <label className={labelCls + " text-right"}>Total</label>
              <input className={inputCls + " w-full text-right font-black bg-[var(--border-subtle)]/30 cursor-not-allowed text-[var(--primary)]"}
                value={entryTotal.toFixed(2)} readOnly />
            </div>

            {/* Staff / Salesman */}
            <div className={(!fieldMask || fieldMask.some(m => ['staff', 'salesman'].includes(m.field.toLowerCase()) && m.visible)) ? '' : 'hidden'}>
              <label className={labelCls + " text-center"}>Staff</label>
              <select id="input-salesman" className={inputCls + " w-full"} value={activeEntry.salesman || salesman}
                onChange={e => setActiveEntry({ ...activeEntry, salesman: e.target.value })}
                onKeyDown={e => handleKeyDown(e, 'salesman')}>
                <option value="">-</option>
                {personnelList.map((p: any) => <option key={p.id} value={p.id}>{p.name.slice(0, 6).toUpperCase()}</option>)}
              </select>
            </div>

            <Button onClick={() => { commitLine(); document.getElementById('input-stock')?.focus() }}
              className="h-9 bg-[var(--primary)] text-white font-black uppercase px-4 rounded-lg text-[10px] whitespace-nowrap">
              ADD (↵)
            </Button>
          </div>
        </div>
      </main>

      {/* ── FUNCTION KEY FOOTER BAR (Shoper9 style) ── */}
      <footer className="bg-slate-900 flex overflow-x-auto h-9 border-t border-slate-700 divide-x divide-slate-700 flex-shrink-0">
        {[
          { key: 'F1', label: 'NEW LINE' },
          { key: 'F2', label: 'CUSTOMER' },
          { key: 'F3', label: 'GO TO' },
          { key: 'F7', label: 'EXACT CASH' },
          { key: 'F8', label: 'SETTLE', active: true },
          { key: 'F9', label: 'TOTALS' },
          { key: 'F12', label: 'SUSPEND' },
        ].map(({ key, label, active }) => (
          <button key={key}
            onClick={key === 'F8' ? () => setShowSettle(true) : undefined}
            className={`px-3 h-full flex items-center font-bold text-[10px] tracking-widest uppercase transition-colors outline-none
              ${active ? 'bg-slate-700 text-amber-400' : 'text-slate-300 hover:bg-slate-800'}`}>
            {key}: {label}
          </button>
        ))}
        <div className="flex-1 flex justify-end items-center px-4">
          <span className="text-slate-500 text-[9px] uppercase tracking-wide">PrimeSetu Sovereign POS · Shoper9 Mode</span>
        </div>
      </footer>
    </div>
  )
}
