/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useRef, useEffect, useMemo } from 'react'
import { 
  Barcode, Trash2, FileText, User, UserCheck, 
  Calendar, Clock, LayoutGrid, Receipt, 
  Settings, CreditCard, Users, Hash
} from 'lucide-react'
import { Button, Badge, cn } from '@/components/ui/SovereignUI'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz } from 'ag-grid-community'
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

/**
 * SMRITI-OS High-Fidelity Sovereign Billing Terminal
 * Replicates the exact functional layout of Shoper9 POS.
 */
export default function DesktopBilling({
  items, setItems, activeEntry, setActiveEntry,
  commitLine, handleKeyDown, totals, setShowSettle,
  customer, setCustomer, salesman, setSalesman,
  billNo, dateTime, billDiscount, setBillDiscount,
  isCustomerMandatory, isSalesmanMandatory,
  personnelList = [], customerResults = [], onCustomerSearch, fieldMask
}: DesktopBillingProps) {
  const entryRef = useRef<HTMLInputElement>(null)
  
  // Focus the stock input on mount
  useEffect(() => { 
    const focusTimer = setTimeout(() => entryRef.current?.focus(), 100);
    return () => clearTimeout(focusTimer);
  }, [])

  // Dynamic Column Definitions based on Shoper9 Metadata
  const columnDefs = useMemo(() => {
    if (!fieldMask || fieldMask.length === 0) {
      return [
        { field: 'stock_no', headerName: 'STOCK NO', width: 130, pinned: 'left' as const, cellClass: 'font-mono' },
        { field: 'descr', headerName: 'ITEM DESCRIPTION', flex: 1, minWidth: 200 },
        { field: 'qty', headerName: 'QTY', width: 80, editable: true, cellClass: 'text-right font-mono' },
        { field: 'rate', headerName: 'RATE', width: 110, cellClass: 'text-right font-mono', valueFormatter: (p: any) => (p.value || 0).toFixed(2) },
        { field: 'disc_per', headerName: 'DISC %', width: 90, editable: true, cellClass: 'text-right font-mono text-amber-600' },
        { field: 'total', headerName: 'AMOUNT', width: 130, cellClass: 'text-right font-bold text-[var(--primary)]', valueFormatter: (p: any) => (p.value || 0).toFixed(2) },
        { 
          headerName: '', width: 50, pinned: 'right' as const, 
          cellRenderer: (p: any) => (
            <div className="w-full h-full flex items-center justify-center">
              <button onClick={async (e) => {
                e.stopPropagation();
                const id = p.data?.id;
                setItems(prev => prev.filter(i => i.id !== id));
                try { await api.billing.removeFromDraft(id); } catch(e) {}
              }} className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          )
        }
      ];
    }
    
    return [
      ...buildColDefs(fieldMask, {
        colDefMerge: {
          qty: { editable: true, cellClass: 'text-right font-mono' },
          disc_per: { editable: true, cellClass: 'text-right font-mono text-amber-600' },
          rate: { cellClass: 'text-right font-mono' },
          stock_no: { pinned: 'left' as const, cellClass: 'font-mono' },
          total: { cellClass: 'text-right font-bold text-[var(--primary)]' }
        }
      }),
      {
        headerName: '', width: 50, pinned: 'right' as const,
        cellRenderer: (p: any) => (
          <button onClick={async () => {
            const id = p.data?.id;
            setItems(prev => prev.filter(i => i.id !== id));
            try { await api.billing.removeFromDraft(id); } catch(e) {}
          }} className="w-full h-full flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-50 transition-all">
            <Trash2 size={14} />
          </button>
        )
      }
    ] as any[];
  }, [fieldMask, setItems]);

  // Calculations
  const entryValue = (activeEntry.rate || 0) * (activeEntry.qty || 1)
  const entryDiscAmt = (entryValue * (activeEntry.disc_per || 0)) / 100
  const entryTotal = entryValue - entryDiscAmt
  const today = dateTime.split(',')[0]
  const time = dateTime.split(',')[1]

  const inputCls = "h-8 bg-white border border-slate-300 rounded-sm px-2 text-[12px] font-bold uppercase outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all shadow-sm"
  const labelCls = "block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-tight"
  const sectionTitleCls = "text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 border-b border-slate-100 pb-1"

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden select-none">

      {/* ── TOP ACTION BAR ── */}
      <div className="h-10 bg-slate-900 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white font-black text-xs tracking-widest">
            <div className="w-6 h-6 bg-[var(--primary)] rounded flex items-center justify-center">
              <Receipt size={14} />
            </div>
            SMRITI-OS <span className="text-slate-500 font-medium">|</span> BILLING TERMINAL
          </div>
          <div className="flex items-center gap-3 ml-4">
             <Badge variant="muted" className="bg-slate-800 text-slate-400 border-none font-mono tracking-tighter">V9.0.4.S</Badge>
             <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">ONLINE</Badge>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
             <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-600"/>{today}</span>
             <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-600"/>{time}</span>
          </div>
          <div className="h-4 w-px bg-slate-700 mx-2" />
          <button className="text-slate-400 hover:text-white transition-colors"><Settings size={16} /></button>
        </div>
      </div>

      {/* ── MASTER HEADER ── */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Section 1: Bill Configuration */}
          <div className="col-span-3 border-r border-slate-100 pr-6">
            <h3 className={sectionTitleCls}>Bill Configuration</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Bill Type</label>
                <select className={inputCls + " w-full appearance-none"}>
                  <option>PRODUCT</option>
                  <option>SERVICE</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Txn Mode</label>
                <select className={inputCls + " w-full appearance-none"}>
                  <option>CASH</option>
                  <option>CREDIT</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Doc Number</label>
                <div className="flex gap-1">
                   <input className={inputCls + " w-16 bg-slate-50 text-center"} value="S9" readOnly />
                   <input className={inputCls + " flex-1 font-mono tracking-widest text-[var(--primary)]"} value={billNo} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Customer Lifecycle */}
          <div className="col-span-6 border-r border-slate-100 px-6">
            <h3 className={sectionTitleCls}>Customer Identification</h3>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4 relative">
                <label className={labelCls}>Code / Mobile <span className="text-blue-500 font-black ml-1">[F2]</span></label>
                <div className="relative">
                  <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={inputCls + " w-full pl-8 font-mono"}
                    placeholder="ENTER CODE..."
                    value={customer.phone}
                    onChange={e => { setCustomer({ ...customer, phone: e.target.value }); onCustomerSearch?.(e.target.value) }}
                    onFocus={() => onCustomerSearch?.(customer.phone || '')}
                  />
                </div>
                {customerResults.length > 0 && (
                  <div className="absolute top-full left-0 w-80 bg-white border border-slate-200 shadow-2xl rounded-md z-[100] mt-1 max-h-48 overflow-y-auto ring-4 ring-black/5">
                    {customerResults.map((c: any) => (
                      <button key={c.code} onClick={() => { setCustomer({ name: c.name, phone: c.phone }); onCustomerSearch?.("") }}
                        className="w-full text-left p-3 hover:bg-[var(--primary)] hover:text-white transition-all border-b border-slate-50 last:border-0 group">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-black uppercase">{c.name}</span>
                          <span className="text-[9px] font-mono opacity-60 group-hover:opacity-100">{c.phone}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-8">
                <label className={labelCls}>Registered Customer Name</label>
                <input
                  className={inputCls + " w-full bg-slate-50 italic text-slate-500"}
                  value={customer.name || "UNREGISTERED WALK-IN"}
                  readOnly
                />
              </div>
              <div className="col-span-12 flex gap-2">
                 <button className="text-[9px] font-black text-blue-600 hover:underline uppercase tracking-tight">+ Create New Profile</button>
                 <span className="text-slate-300">|</span>
                 <button className="text-[9px] font-black text-blue-600 hover:underline uppercase tracking-tight">View Points History</button>
              </div>
            </div>
          </div>

          {/* Section 3: Session Intelligence */}
          <div className="col-span-3 pl-6">
            <h3 className={sectionTitleCls}>Station Info</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Assigned Salesman</label>
                <div className="relative">
                  <UserCheck size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <select className={inputCls + " w-full pl-8 appearance-none"} value={salesman} onChange={e => setSalesman(e.target.value)}>
                    <option value="">(SELECT STAFF)</option>
                    {personnelList.map((p: any) => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Counter:</span>
                 <span className="text-[10px] font-black text-slate-900 uppercase">POS-MAIN-02</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        
        {/* ── DYNAMIC ENTRY ROW (Top Alignment) ── */}
        <div className="bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-700 ring-1 ring-white/5">
          <div className="grid grid-cols-[40px_160px_1fr_100px_80px_100px_80px_80px_100px_100px_auto] gap-3 items-end">
            <div>
              <label className={labelCls + " text-slate-400"}>S.No</label>
              <div className="h-8 flex items-center justify-center bg-slate-700 rounded text-[12px] font-black text-slate-400 border border-slate-600">
                {items.length + 1}
              </div>
            </div>

            <div className="relative">
              <label className={labelCls + " text-slate-400"}>Stock Number <span className="text-amber-400 font-black ml-1">[F1]</span></label>
              <div className="relative">
                <Barcode size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500" />
                <input ref={entryRef} id="input-stock" 
                  className="h-8 w-full bg-slate-900 border border-slate-600 rounded-sm px-3 pl-9 text-[13px] font-mono font-bold text-white uppercase outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-600"
                  value={activeEntry.stock_no}
                  onChange={e => setActiveEntry({ ...activeEntry, stock_no: e.target.value.toUpperCase() })}
                  onKeyDown={e => handleKeyDown(e, 'stock')}
                  placeholder="SCAN BARCODE..." autoFocus />
              </div>
            </div>

            <div>
              <label className={labelCls + " text-slate-400"}>Item Description</label>
              <input className="h-8 w-full bg-slate-700/50 border border-slate-600 rounded-sm px-3 text-[12px] font-bold text-slate-300 uppercase outline-none cursor-not-allowed"
                value={activeEntry.descr || ''} readOnly placeholder="AUTO-RESOLVING..." />
            </div>

            <div>
              <label className={labelCls + " text-slate-400 text-right"}>Rate / MRP</label>
              <input type="number" className="h-8 w-full bg-slate-900 border border-slate-600 rounded-sm px-3 text-[12px] font-mono font-bold text-white text-right outline-none focus:border-amber-500"
                value={activeEntry.rate || ''}
                onChange={e => setActiveEntry({ ...activeEntry, rate: Number(e.target.value) })}
                onKeyDown={e => handleKeyDown(e, 'rate')} />
            </div>

            <div>
              <label className={labelCls + " text-slate-400 text-right"}>Qty</label>
              <input type="number" className="h-8 w-full bg-slate-900 border border-slate-600 rounded-sm px-3 text-[12px] font-mono font-bold text-white text-right outline-none focus:border-amber-500"
                value={activeEntry.qty}
                onChange={e => setActiveEntry({ ...activeEntry, qty: Number(e.target.value) })}
                onKeyDown={e => handleKeyDown(e, 'qty')} />
            </div>

            <div>
              <label className={labelCls + " text-slate-400 text-right"}>Gross Val</label>
              <input className="h-8 w-full bg-slate-700/50 border border-slate-600 rounded-sm px-3 text-[12px] font-mono font-bold text-slate-400 text-right outline-none cursor-not-allowed"
                value={entryValue.toFixed(2)} readOnly />
            </div>

            <div className="relative">
              <label className={labelCls + " text-slate-400 text-center"}>Disc %</label>
              <input type="number" className="h-8 w-full bg-slate-900 border border-slate-600 rounded-sm px-3 text-[12px] font-mono font-bold text-amber-500 text-right outline-none focus:border-amber-500"
                value={activeEntry.disc_per}
                onChange={e => setActiveEntry({ ...activeEntry, disc_per: Number(e.target.value) })}
                onKeyDown={e => handleKeyDown(e, 'disc_per')} />
            </div>

            <div>
              <label className={labelCls + " text-slate-400 text-right"}>Disc Amt</label>
              <input className="h-8 w-full bg-slate-700/50 border border-slate-600 rounded-sm px-3 text-[12px] font-mono font-bold text-amber-500 text-right outline-none cursor-not-allowed"
                value={entryDiscAmt.toFixed(2)} readOnly />
            </div>

            <div>
              <label className={labelCls + " text-slate-400 text-right"}>Net Total</label>
              <input className="h-8 w-full bg-slate-700/50 border border-slate-600 rounded-sm px-3 text-[12px] font-mono font-bold text-emerald-400 text-right outline-none cursor-not-allowed"
                value={entryTotal.toFixed(2)} readOnly />
            </div>

            <div>
              <label className={labelCls + " text-slate-400 text-center"}>Line Staff</label>
              <select className="h-8 w-full bg-slate-900 border border-slate-600 rounded-sm px-2 text-[11px] font-bold text-white uppercase outline-none focus:border-amber-500 appearance-none"
                value={activeEntry.salesman || salesman}
                onChange={e => setActiveEntry({ ...activeEntry, salesman: e.target.value })}
                onKeyDown={e => handleKeyDown(e, 'salesman')}>
                <option value="">-</option>
                {personnelList.map((p: any) => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
              </select>
            </div>

            <Button onClick={commitLine}
              className="h-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase px-4 rounded shadow-lg transition-transform active:scale-95 text-[10px]">
              ADD LINE (↵)
            </Button>
          </div>
        </div>

        {/* ── MAIN TRANSACTION GRID ── */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner flex flex-col">
          <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 justify-between">
             <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <LayoutGrid size={12} className="text-slate-400" />
                Live Billing Journal
             </div>
             <div className="flex items-center gap-4">
                <span className="text-[9px] font-black text-slate-400 uppercase">Columns: Standard Institutional Parity (V2)</span>
             </div>
          </div>
          <div className="flex-1 relative ag-theme-smriti">
            <AgGridReact 
              theme={themeQuartz}
              rowData={items} 
              columnDefs={columnDefs} 
              rowHeight={38}
              headerHeight={34}
              suppressHorizontalScroll={false}
              suppressMovableColumns={true}
              onGridReady={p => p.api.sizeColumnsToFit()}
              overlayNoRowsTemplate='<div class="text-[11px] font-black uppercase text-slate-300 tracking-[0.5em] mt-12">Waiting for first item scan...</div>'
            />
          </div>
          
          {/* ── DENSE FOOTER SUMMARY ── */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-start shrink-0">
             {/* Stats Block */}
             <div className="grid grid-cols-2 gap-8 pr-12 border-r border-slate-200">
                <div className="text-center">
                   <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Items</div>
                   <div className="text-2xl font-mono font-black text-slate-900 leading-none">{totals.items || 0}</div>
                </div>
                <div className="text-center">
                   <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Quantity</div>
                   <div className="text-2xl font-mono font-black text-slate-900 leading-none">{totals.qty || 0}</div>
                </div>
             </div>

             {/* Values Breakdown */}
             <div className="flex-1 px-12 grid grid-cols-4 gap-8 border-r border-slate-200">
                <div>
                   <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Gross Value</div>
                   <div className="text-[13px] font-mono font-bold text-slate-600">₹{(totals.gross || 0).toFixed(2)}</div>
                </div>
                <div>
                   <div className="text-[9px] font-black text-amber-600 uppercase mb-1">Item Disc</div>
                   <div className="text-[13px] font-mono font-bold text-amber-600">−₹{(totals.disc || 0).toFixed(2)}</div>
                </div>
                <div>
                   <div className="text-[9px] font-black text-blue-600 uppercase mb-1">Bill Disc <span className="ml-1 opacity-40 font-normal underline cursor-pointer">[F9]</span></div>
                   <div className="flex items-center gap-1">
                      <span className="text-[13px] font-mono font-bold text-blue-600">−₹</span>
                      <input type="number" 
                        className="w-16 bg-transparent border-b border-blue-200 outline-none text-[13px] font-mono font-bold text-blue-600 focus:border-blue-500"
                        value={billDiscount} 
                        onChange={e => setBillDiscount(Number(e.target.value))} />
                   </div>
                </div>
                <div>
                   <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Net GST</div>
                   <div className="text-[13px] font-mono font-bold text-slate-600">₹{((totals.net || 0) * 0.05).toFixed(2)}</div>
                </div>
             </div>

             {/* Final Settlement Block */}
             <div className="pl-12 min-w-[280px]">
                <div className="bg-white border-2 border-[var(--primary)] rounded-lg p-3 shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-1 opacity-5">
                      <Hash size={40} />
                   </div>
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payable Net</span>
                      <Badge variant="info" className="bg-[var(--primary)] text-white border-none text-[8px] h-4">FINAL</Badge>
                   </div>
                   <div className="text-3xl font-mono font-black text-[var(--primary)] flex items-baseline gap-1">
                      <span className="text-lg">₹</span>
                      {(totals.finalNet || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                   </div>
                   <button 
                     onClick={() => setShowSettle(true)}
                     className="w-full mt-3 h-10 bg-[var(--primary)] hover:bg-blue-700 text-white font-black uppercase text-[11px] rounded transition-all shadow-md flex items-center justify-center gap-2 group">
                     <CreditCard size={14} className="group-hover:rotate-12 transition-transform" />
                     Settle Bill (F8)
                   </button>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* ── INSTITUTIONAL HOTKEY BAR ── */}
      <div className="h-10 bg-slate-900 border-t border-slate-800 flex shrink-0 divide-x divide-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        {[
          { key: 'F1', label: 'ADD ROW', color: 'text-amber-500' },
          { key: 'F2', label: 'CUST LOOKUP', color: 'text-blue-500' },
          { key: 'F3', label: 'EDIT QTY' },
          { key: 'F6', label: 'PROMO DTLS', color: 'text-purple-400' },
          { key: 'F7', label: 'EXACT CASH', color: 'text-emerald-500' },
          { key: 'F8', label: 'PAYMENT MODES', color: 'text-[var(--primary)]', active: true },
          { key: 'F9', label: 'BILL DISCOUNT' },
          { key: 'F12', label: 'SUSPEND BILL', color: 'text-rose-500' },
        ].map(({ key, label, color, active }) => (
          <button key={key}
            onClick={key === 'F8' ? () => setShowSettle(true) : undefined}
            className={cn(
              "px-4 h-full flex flex-col justify-center transition-all outline-none border-t-2 border-transparent",
              active ? "bg-slate-800 border-t-[var(--primary)]" : "hover:bg-slate-800 hover:border-t-slate-700"
            )}>
            <div className={cn("text-[10px] font-black leading-none mb-1", active ? "text-white" : color || "text-slate-400")}>{key}</div>
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap">{label}</div>
          </button>
        ))}
        <div className="flex-1 flex justify-end items-center px-6 gap-3">
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Sovereign Node</span>
              <span className="text-[9px] font-mono font-bold text-slate-400">GKP-TERMINAL-02</span>
           </div>
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
      </div>
    </div>
  )
}
