import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, User, Trash2, Plus, Minus, CreditCard, Banknote, Receipt, Smartphone, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillItem { id: string; code: string; name: string; qty: number; rate: number; discount: number; taxPct: number; }

const ITEM_DB: Record<string, Omit<BillItem, 'id' | 'qty' | 'discount'>> = {
  'ITM-001': { code: 'ITM-001', name: 'Cotton Slim Fit Shirt – Blue', rate: 1299, taxPct: 12 },
  'ITM-002': { code: 'ITM-002', name: 'Slim Fit Denim Jeans 34', rate: 2499, taxPct: 12 },
  'ITM-003': { code: 'ITM-003', name: 'Running Shoes – White 42', rate: 3499, taxPct: 18 },
  '8901234567890': { code: 'ITM-001', name: 'Cotton Slim Fit Shirt – Blue', rate: 1299, taxPct: 12 },
};

type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'SPLIT';
let billSeq = 9026;

const POS: React.FC = () => {
  const [items, setItems] = useState<BillItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [billNo] = useState(`BL-${billSeq++}`);
  const [customer] = useState('WALK-IN CUSTOMER');
  const [payMode, setPayMode] = useState<PaymentMode | null>(null);
  const [cashTendered, setCashTendered] = useState('');
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => { barcodeRef.current?.focus(); }, []);

  const subtotal   = items.reduce((s, i) => s + i.rate * i.qty, 0);
  const totalDisc  = items.reduce((s, i) => s + i.discount, 0);
  const grandTotal = subtotal - totalDisc;
  const totalTax   = items.reduce((s, i) => { const net = (i.rate * i.qty) - i.discount; return s + (net * i.taxPct) / (100 + i.taxPct); }, 0);
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const change = parseFloat(cashTendered || '0') - grandTotal;

  const addItem = useCallback((query: string) => {
    const found = ITEM_DB[query.trim().toUpperCase()] || ITEM_DB[query.trim()];
    if (!found) return;
    setItems(prev => {
      const exists = prev.findIndex(i => i.code === found.code);
      if (exists >= 0) { const n = [...prev]; n[exists] = { ...n[exists], qty: n[exists].qty + 1 }; setSelectedIdx(exists); return n; }
      setSelectedIdx(prev.length);
      return [...prev, { id: Date.now().toString(), ...found, qty: 1, discount: 0 }];
    });
  }, []);

  const handleBarcodeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    addItem(barcode);
    setBarcode('');
  };

  const changeQty = (idx: number, delta: number) => {
    setItems(prev => { const n = [...prev]; const nq = n[idx].qty + delta; if (nq <= 0) { n.splice(idx, 1); setSelectedIdx(null); return n; } n[idx] = { ...n[idx], qty: nq }; return n; });
  };

  const deleteItem = (idx: number) => { setItems(prev => prev.filter((_, i) => i !== idx)); setSelectedIdx(null); };

  const setDiscount = (idx: number, val: string) => {
    setItems(prev => { const n = [...prev]; n[idx] = { ...n[idx], discount: parseFloat(val) || 0 }; return n; });
  };

  const voidBill = () => { setItems([]); setSelectedIdx(null); setPayMode(null); setCashTendered(''); };

  return (
    <div className="h-full flex overflow-hidden bg-[#020617]">
      {/* ── Left: Bill ── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-outline-variant">
        {/* Header */}
        <div className="h-14 flex items-center gap-3 px-4 bg-surface border-b border-outline-variant flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary">
            <Receipt size={14} /><span className="font-mono text-sm font-black">{billNo}</span>
          </div>
          <div className="flex-1 relative">
            <Zap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-pulse" />
            <input ref={barcodeRef} type="text" value={barcode} onChange={e => setBarcode(e.target.value)} onKeyDown={handleBarcodeEnter}
              placeholder="SCAN / TYPE CODE & PRESS ENTER  (F1)"
              className="w-full h-10 pl-9 pr-4 bg-surface-container border border-primary/20 focus:border-primary outline-none font-mono text-sm font-bold text-primary placeholder:text-outline/25 placeholder:font-sans placeholder:text-xs" />
          </div>
          <button className="h-10 px-4 border border-outline-variant bg-surface hover:bg-surface-container flex items-center gap-2">
            <User size={14} className="text-outline" /><span className="text-xs font-bold">{customer}</span>
          </button>
        </div>

        {/* Column Headers */}
        {items.length > 0 && (
          <div className="grid grid-cols-[28px_1fr_76px_96px_76px_76px_32px] text-[9px] font-black uppercase tracking-widest text-outline bg-surface-container border-b border-outline-variant px-3 py-2 flex-shrink-0">
            <span>#</span><span>Description</span><span className="text-right">Rate</span>
            <span className="text-center">Qty</span><span className="text-right">Disc</span>
            <span className="text-right">Amount</span><span />
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-auto">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-20">
              <Zap size={40} className="text-primary" />
              <p className="text-xs font-black uppercase tracking-widest">Scan or enter item code to start</p>
            </div>
          )}
          {items.map((item, idx) => {
            const lineTotal = item.rate * item.qty - item.discount;
            const isSel = selectedIdx === idx;
            return (
              <div key={item.id} onClick={() => setSelectedIdx(idx)}
                className={cn("grid grid-cols-[28px_1fr_76px_96px_76px_76px_32px] items-center border-b border-outline-variant px-3 cursor-pointer transition-colors",
                  isSel ? "bg-primary/10 shadow-[inset_3px_0_0_#1E40AF]" : "hover:bg-surface/50")}>
                <span className="text-[10px] font-mono text-outline py-3">{idx + 1}</span>
                <div className="py-3 min-w-0 pr-2">
                  <div className="text-[9px] font-black text-primary/50 uppercase">{item.code}</div>
                  <div className="text-[12px] font-bold truncate">{item.name}</div>
                  <div className="text-[9px] text-outline">GST {item.taxPct}% incl.</div>
                </div>
                <span className="font-mono text-[11px] text-right text-outline">{item.rate.toFixed(2)}</span>
                <div className="flex items-center justify-center gap-1">
                  <button onClick={e => { e.stopPropagation(); changeQty(idx, -1); }} className="w-6 h-6 border border-outline-variant hover:border-red-400 hover:text-red-500 flex items-center justify-center text-outline transition-all"><Minus size={10} /></button>
                  <span className="w-8 text-center font-mono font-black text-sm">{item.qty}</span>
                  <button onClick={e => { e.stopPropagation(); changeQty(idx, +1); }} className="w-6 h-6 border border-outline-variant hover:border-primary hover:text-primary flex items-center justify-center text-outline transition-all"><Plus size={10} /></button>
                </div>
                <div className="flex justify-end">
                  {isSel
                    ? <input type="number" value={item.discount || ''} onChange={e => { e.stopPropagation(); setDiscount(idx, e.target.value); }} onClick={e => e.stopPropagation()} placeholder="0"
                        className="w-16 h-7 text-right pr-1 bg-amber-500/10 border border-amber-400 text-amber-600 font-mono text-xs font-bold outline-none" />
                    : <span className={cn("font-mono text-[11px]", item.discount > 0 ? "text-amber-600" : "text-outline/25")}>{item.discount > 0 ? `-${item.discount.toFixed(2)}` : '—'}</span>
                  }
                </div>
                <span className="font-mono text-[12px] font-black text-right">₹{lineTotal.toFixed(2)}</span>
                <button onClick={e => { e.stopPropagation(); deleteItem(idx); }} className="w-7 h-7 flex items-center justify-center text-outline/20 hover:text-red-500 transition-all"><Trash2 size={12} /></button>
              </div>
            );
          })}
        </div>

        {/* Shortcut Bar */}
        <div className="grid grid-cols-7 border-t border-outline-variant flex-shrink-0">
          {[['F1: Item',''],['F3: Disc','text-amber-600'],['F4: Qty',''],['F5: Hold','text-amber-600'],['F9: Recall','text-blue-600'],['ESC: Cancel','text-red-500'],['DEL: Void','text-red-600']].map(([lbl, cls], i) => (
            <button key={i} onClick={i === 6 ? voidBill : undefined}
              className={cn("h-9 text-[9px] font-black uppercase tracking-wide bg-surface-container hover:bg-surface border-r border-outline-variant transition-all", cls)}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right: Totals + Payment ── */}
      <div className="flex-shrink-0 flex flex-col bg-surface" style={{ width: 320 }}>
        {/* Totals */}
        <div className="bg-primary text-white p-5 flex-shrink-0 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rotate-12" />
          <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Total Payable</div>
          <div className="text-4xl font-mono font-black tracking-tighter">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className="mt-3 space-y-1 text-[10px] font-mono opacity-70 border-t border-white/20 pt-2">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            {totalDisc > 0 && <div className="flex justify-between text-yellow-300"><span>Discount</span><span>-₹{totalDisc.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span>CGST</span><span>₹{cgst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>SGST</span><span>₹{sgst.toFixed(2)}</span></div>
          </div>
          <div className="mt-1 flex justify-between text-[9px] opacity-40 font-mono">
            <span>{items.reduce((s,i)=>s+i.qty,0)} items · {items.length} lines</span>
          </div>
        </div>

        {/* Payment Mode */}
        <div className="p-4 border-b border-outline-variant flex-shrink-0">
          <div className="text-[9px] font-black uppercase tracking-widest text-outline mb-2">Settlement Mode</div>
          <div className="grid grid-cols-2 gap-2">
            {([['CASH',Banknote,'bg-emerald-600'],['CARD',CreditCard,'bg-blue-600'],['UPI',Smartphone,'bg-violet-600'],['SPLIT',Tag,'bg-amber-600']] as [string, React.ElementType, string][]).map(([mode,Icon,color]) => (
              <button key={mode} onClick={() => setPayMode(mode as PaymentMode)}
                className={cn("h-11 flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all border-2",
                  payMode === mode ? `${color} text-white border-transparent` : "border-outline-variant hover:border-primary text-outline")}>
                <Icon size={15} />{mode}
              </button>
            ))}
          </div>
        </div>

        {/* Cash Tender */}
        {payMode === 'CASH' && (
          <div className="p-4 border-b border-outline-variant flex-shrink-0 space-y-2">
            <div className="text-[9px] font-black uppercase tracking-widest text-outline">Cash Tendered</div>
            <input type="number" value={cashTendered} onChange={e => setCashTendered(e.target.value)} placeholder={grandTotal.toFixed(2)}
              className="w-full h-11 px-4 text-right font-mono text-xl font-black bg-surface-container border-2 border-primary outline-none text-primary" />
            <div className="grid grid-cols-4 gap-1">
              {[500,1000,2000,5000].map(a => (
                <button key={a} onClick={() => setCashTendered(String(a))}
                  className="h-8 bg-surface-container border border-outline-variant text-[10px] font-black hover:bg-primary hover:text-white hover:border-primary transition-all">
                  {a>=1000?`₹${a/1000}K`:`₹${a}`}
                </button>
              ))}
            </div>
            {cashTendered && <div className={cn("flex justify-between text-sm font-black", change>=0?"text-emerald-600":"text-red-500")}><span>CHANGE</span><span className="font-mono">₹{Math.abs(change).toFixed(2)}{change<0?' SHORT':''}</span></div>}
          </div>
        )}

        {/* Finalize */}
        <div className="mt-auto p-4 space-y-2">
          <button disabled={items.length === 0 || !payMode}
            className={cn("w-full h-14 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all",
              items.length > 0 && payMode ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-surface-container text-outline/30 cursor-not-allowed border border-outline-variant")}>
            <Receipt size={18} />{!payMode ? 'Select Payment Mode' : items.length === 0 ? 'Add Items First' : 'Finalize Bill  ·  F12'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="h-9 border border-outline-variant text-[10px] font-black uppercase hover:bg-surface-container transition-all">Hold  F5</button>
            <button onClick={voidBill} className="h-9 border border-red-500/30 text-red-500 text-[10px] font-black uppercase hover:bg-red-500/10 transition-all">Void  DEL</button>
          </div>
        </div>

        {/* Terminal */}
        <div className="h-8 bg-surface-container border-t border-outline-variant flex items-center justify-between px-4 text-[9px] font-mono text-outline flex-shrink-0">
          <span>Reg: #01 · ADM</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />Online · X01</span>
        </div>
      </div>
    </div>
  );
};

export default POS;
