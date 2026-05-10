/* ============================================================
 * SMRITI-OS — Institutional POS Terminal (v3.0)
 * Architecture: Receipt-Tape UI + Zero-Radius Design
 * ============================================================ */

import React, { useRef, useEffect } from 'react';
import { Barcode, Trash2, User, UserCheck, Calendar, Clock, Receipt, Settings, CreditCard, Hash, Percent } from 'lucide-react';
import { Badge, cn } from '@/components/ui/SovereignUI';
import { api } from '@/api/client';

interface DesktopBillingProps {
  items: any[];
  setItems: React.Dispatch<React.SetStateAction<any[]>>;
  activeEntry: any;
  setActiveEntry: React.Dispatch<React.SetStateAction<any>>;
  commitLine: () => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent, field: string) => void;
  totals: any;
  setShowSettle: (val: boolean) => void;
  customer: { name: string; phone: string };
  setCustomer: (val: { name: string; phone: string }) => void;
  salesman: string;
  setSalesman: (val: string) => void;
  billNo: string;
  dateTime: string;
  billDiscount: number;
  setBillDiscount: (val: number) => void;
  personnelList?: any[];
  customerResults?: any[];
  onCustomerSearch?: (q: string) => void;
}

export default function DesktopBilling({
  items, setItems, activeEntry, setActiveEntry,
  commitLine, handleKeyDown, totals, setShowSettle,
  customer, setCustomer, salesman, setSalesman,
  billNo, dateTime, billDiscount, setBillDiscount,
  personnelList = [], customerResults = [], onCustomerSearch
}: DesktopBillingProps) {
  const entryRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => { 
    const focusTimer = setTimeout(() => entryRef.current?.focus(), 100);
    return () => clearTimeout(focusTimer);
  }, []);

  const today = dateTime.split(',')[0];
  const time = dateTime.split(',')[1];

  // GST Engine (Mock calculation for Indian tax logic)
  const calculateGST = (gross: number, disc: number) => {
    const net = gross - disc;
    // Assuming standard 18% slab for demonstration (9% CGST, 9% SGST)
    const totalGst = net * 0.18;
    return {
      cgst: totalGst / 2,
      sgst: totalGst / 2,
      igst: 0,
      total: totalGst
    };
  };

  const gstCalc = calculateGST(totals.gross, totals.disc + billDiscount);
  const grandTotal = totals.finalNet + gstCalc.total; // Net + Tax

  // Institutional Square CSS standard overrides — token-compliant
  const inputCls = "h-9 bg-[var(--color-surface)] border-2 border-slate-900 rounded-none px-2 text-[13px] font-bold uppercase outline-none focus:border-amber-500 focus:bg-amber-50 transition-colors";
  const labelCls = "block text-[10px] font-black uppercase text-slate-600 mb-1 tracking-widest";
  const blockCls = "bg-[var(--color-surface)] border-2 border-slate-900 p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]";

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-body)] overflow-hidden select-none font-sans">
      
      {/* ── TOP ACTION BAR ── */}
      <div className="h-10 bg-slate-900 flex items-center justify-between px-4 shrink-0 rounded-none">
        <div className="flex items-center gap-4 text-white font-black text-xs tracking-widest uppercase">
          <div className="w-6 h-6 bg-amber-500 rounded-none flex items-center justify-center text-slate-900">
            <Receipt size={14} />
          </div>
          SMRITI-OS | POS TERMINAL
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <span className="flex items-center gap-2"><Calendar size={12}/>{today}</span>
           <span className="flex items-center gap-2 text-white"><Clock size={12}/>{time}</span>
           <div className="h-4 w-px bg-slate-700" />
           <span className="text-emerald-400 font-mono tracking-tighter border border-emerald-500/30 px-2 py-0.5">ONLINE</span>
        </div>
      </div>

      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        
        {/* ── LEFT: FAST SCAN BUFFER & RECEIPT TAPE ── */}
        <div className="w-[60%] flex flex-col gap-4">
          
          {/* Scan Buffer */}
          <div className={blockCls + " flex gap-2 items-end bg-slate-900 text-white"}>
            <div className="flex-1 relative">
              <label className={labelCls + " text-slate-400"}>Barcode / SKU [F1]</label>
              <div className="relative">
                <Barcode size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                <input ref={entryRef} id="input-stock" 
                  className="h-12 w-full bg-slate-800 border-2 border-slate-700 rounded-none px-3 pl-10 text-[18px] font-mono font-black text-white uppercase outline-none focus:border-amber-500 focus:bg-slate-950 transition-colors placeholder:text-slate-600"
                  value={activeEntry.stock_no}
                  onChange={e => setActiveEntry({ ...activeEntry, stock_no: e.target.value.toUpperCase() })}
                  onKeyDown={e => handleKeyDown(e, 'stock')}
                  placeholder="SCAN ITEM..." autoFocus />
              </div>
            </div>
            <div className="w-24">
              <label className={labelCls + " text-slate-400"}>Qty</label>
              <input type="number" 
                className="h-12 w-full bg-slate-800 border-2 border-slate-700 rounded-none px-3 text-[18px] font-mono font-black text-white text-center outline-none focus:border-amber-500 focus:bg-slate-950"
                value={activeEntry.qty}
                onChange={e => setActiveEntry({ ...activeEntry, qty: Number(e.target.value) })}
                onKeyDown={e => handleKeyDown(e, 'qty')} />
            </div>
            <button onClick={commitLine} className="h-12 px-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black uppercase tracking-widest border-2 border-amber-600 rounded-none shadow-[2px_2px_0px_0px_rgba(217,119,6,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all">
              ADD (↵)
            </button>
          </div>

          {/* Receipt Tape */}
          <div className={blockCls + " flex-1 flex flex-col p-0 overflow-hidden bg-yellow-50/50"}>
            <div className="bg-slate-900 text-white flex px-4 py-2 border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-widest">
              <div className="w-12">#</div>
              <div className="flex-1">Description</div>
              <div className="w-20 text-center">Qty</div>
              <div className="w-24 text-right">Rate</div>
              <div className="w-24 text-right">Disc</div>
              <div className="w-28 text-right pr-4">Total</div>
            </div>
            
            <div className="flex-1 overflow-y-auto font-mono text-[13px] font-bold text-slate-800">
              {items.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 font-black uppercase tracking-[0.3em] opacity-50">
                  Awaiting Scan...
                </div>
              ) : (
                items.map((it, idx) => (
                  <div key={it.id} className="flex px-4 py-3 border-b border-dashed border-slate-300 hover:bg-yellow-100/50 group">
                    <div className="w-12 opacity-50">{idx + 1}</div>
                    <div className="flex-1">
                      <div>{it.descr}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{it.stock_no}</div>
                    </div>
                    <div className="w-20 text-center">{it.qty}</div>
                    <div className="w-24 text-right">{(it.rate || 0).toFixed(2)}</div>
                    <div className="w-24 text-right text-rose-600">{it.disc_amt > 0 ? `-${it.disc_amt.toFixed(2)}` : '-'}</div>
                    <div className="w-28 text-right flex justify-between items-center pl-4">
                      <span>{(it.total || 0).toFixed(2)}</span>
                      <button onClick={async () => {
                        setItems(prev => prev.filter(i => i.id !== it.id));
                        try { await api.billing.removeFromDraft(it.id); } catch(e) {}
                      }} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: MASTER CONTROLS & SETTLEMENT ── */}
        <div className="w-[40%] flex flex-col gap-4">
          
          {/* Customer Matrix */}
          <div className={blockCls}>
            <div className="flex justify-between items-end mb-4 border-b-2 border-slate-900 pb-2">
              <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <User size={16} className="text-blue-600" /> Customer Matrix
              </h3>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Inv: <span className="font-mono text-slate-900">{billNo}</span></div>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <label className={labelCls}>Phone / Code [F2]</label>
                <input className={inputCls + " w-full font-mono"} placeholder="SEARCH..."
                  value={customer.phone}
                  onChange={e => { setCustomer({ ...customer, phone: e.target.value }); onCustomerSearch?.(e.target.value); }} />
                
                {customerResults.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-[var(--color-surface)] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] z-[100] mt-1 max-h-48 overflow-y-auto">
                    {customerResults.map((c: any) => (
                      <button key={c.code} onClick={() => { setCustomer({ name: c.name, phone: c.phone }); onCustomerSearch?.("") }}
                        className="w-full text-left p-2 hover:bg-slate-900 hover:text-white transition-colors border-b border-slate-200 last:border-0 flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase">{c.name}</span>
                        <span className="text-[10px] font-mono">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={labelCls}>Name</label>
                <input className={inputCls + " w-full bg-slate-100 cursor-not-allowed"} value={customer.name || "WALK-IN"} readOnly />
              </div>
              <div className="relative">
                <label className={labelCls}>Assigned Salesman</label>
                <select className={inputCls + " w-full appearance-none"} value={salesman} onChange={e => setSalesman(e.target.value)}>
                  <option value="">(SELECT STAFF)</option>
                  {personnelList.map((p: any) => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
                </select>
                <UserCheck size={14} className="absolute right-3 top-8 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Institutional Ledger */}
          <div className={blockCls + " flex-1 flex flex-col justify-between"}>
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-900 mb-4 border-b-2 border-slate-900 pb-2 flex items-center gap-2">
                <Hash size={16} className="text-emerald-600" /> Settlement Ledger
              </h3>
              
              <div className="space-y-2 font-mono text-[14px] font-bold">
                <div className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200">
                  <span className="text-[11px] uppercase font-black text-slate-500">Gross Value</span>
                  <span>₹{(totals.gross || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-rose-50 border border-rose-200 text-rose-700">
                  <span className="text-[11px] uppercase font-black">Item Discounts</span>
                  <span>- ₹{(totals.disc || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 border border-blue-200 text-blue-700">
                  <span className="text-[11px] uppercase font-black flex items-center gap-2">
                    Bill Discount <Percent size={10} className="opacity-50" />
                  </span>
                  <div className="flex items-center gap-1">
                    <span>- ₹</span>
                    <input type="number" className="w-16 bg-transparent outline-none border-b border-blue-300 focus:border-blue-700 text-right"
                      value={billDiscount} onChange={e => setBillDiscount(Number(e.target.value))} />
                  </div>
                </div>
                
                {/* GST Engine Integration */}
                <div className="pt-2 border-t-2 border-dashed border-slate-300">
                  <div className="flex justify-between items-center px-2 text-[12px] text-slate-600">
                    <span className="text-[10px] uppercase font-black">CGST (9%)</span>
                    <span>+ ₹{gstCalc.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center px-2 text-[12px] text-slate-600">
                    <span className="text-[10px] uppercase font-black">SGST (9%)</span>
                    <span>+ ₹{gstCalc.sgst.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-slate-900 text-amber-400 p-4 border-2 border-amber-500 shadow-[4px_4px_0px_0px_rgba(245,158,11,1)]">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Grand Total (Incl. GST)</div>
                <div className="text-4xl font-mono font-black flex justify-between items-baseline">
                  <span className="text-2xl opacity-50">₹</span>
                  {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              
              <button onClick={() => setShowSettle(true)}
                className="w-full mt-6 h-14 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-[0.2em] text-[14px] border-2 border-emerald-700 rounded-none shadow-[4px_4px_0px_0px_rgba(4,120,87,1)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] transition-all flex items-center justify-center gap-3">
                <CreditCard size={18} /> Complete Payment (F8)
              </button>
            </div>
          </div>
          
        </div>
      </main>

      {/* ── INSTITUTIONAL HOTKEY BAR ── */}
      <div className="h-10 bg-slate-900 border-t-4 border-amber-500 flex shrink-0 divide-x divide-slate-800">
        {[
          { key: 'F1', label: 'BARCODE', color: 'text-amber-500' },
          { key: 'F2', label: 'CUSTOMER', color: 'text-blue-500' },
          { key: 'F7', label: 'EXACT CASH', color: 'text-emerald-500' },
          { key: 'F8', label: 'SETTLE', color: 'text-white' },
          { key: 'F12', label: 'SUSPEND', color: 'text-rose-500' },
        ].map(({ key, label, color }) => (
          <button key={key}
            onClick={key === 'F8' ? () => setShowSettle(true) : undefined}
            className="px-6 h-full flex flex-col justify-center hover:bg-slate-800 transition-colors border-none outline-none">
            <div className={cn("text-[11px] font-black leading-none mb-0.5", color)}>{key}</div>
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
          </button>
        ))}
        <div className="flex-1 flex justify-end items-center px-4 gap-3 text-slate-500 font-mono text-[10px] uppercase font-bold tracking-widest">
           Sovereign Node : Terminal-01 <div className="w-2 h-2 rounded-none bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
      </div>
      
    </div>
  );
}
