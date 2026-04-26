/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * Price Revision Cockpit (Bulk Updates)
 * Tesla Style Management
 * ============================================================ */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Search, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Filter,
  Save,
  Percent,
  Calendar
} from 'lucide-react';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';

interface RevisionItem {
  id: string;
  code: string;
  name: string;
  current_price: number;
  new_price: number;
}

const MOCK_ITEMS: RevisionItem[] = [
  { id: '1', code: 'PUMA-RSX-01', name: 'Puma RS-X Bold', current_price: 8999, new_price: 8999 },
  { id: '2', code: 'PUMA-RSX-02', name: 'Puma RS-X Triple White', current_price: 8499, new_price: 8499 },
  { id: '3', code: 'NIKE-AJ1-01', name: 'Jordan 1 Retro High', current_price: 15999, new_price: 15999 },
];

export default function PriceRevisionCockpit() {
  const [items, setItems] = useState<RevisionItem[]>(MOCK_ITEMS);
  const [search, setSearch] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [globalAdj, setGlobalAdj] = useState(0);

  const applyAdjustment = (type: 'percent' | 'fixed', value: number) => {
    setItems(prev => prev.map(item => ({
      ...item,
      new_price: type === 'percent' 
        ? Math.round(item.current_price * (1 + value / 100)) 
        : item.current_price + value
    })));
  };

  const handleSave = async () => {
    setIsApplying(true);
    try {
      const revisions = items.filter(i => i.new_price !== i.current_price).map(i => ({
        id: i.id,
        new_price: i.new_price
      }));
      
      if (revisions.length === 0) {
        alert('No price changes detected');
        return;
      }

      await api.catalogue.bulkPriceRevision(revisions);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert('Failed to apply price revisions');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-navy/5 p-8 gap-8 animate-in fade-in duration-700">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mb-2">Catalogue / Pricing</div>
          <h1 className="text-4xl font-black text-navy tracking-tighter" style={{ fontFamily: 'var(--font-tesla)' }}>
            Price Revision Cockpit
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm border border-navy/5">
            <Calendar className="w-4 h-4 text-navy/40" />
            <span className="text-[10px] font-black text-navy uppercase tracking-widest">Effective: Immediate</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={isApplying}
            className="tesla-button px-10"
          >
            {isApplying ? <Zap className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
            Apply Revisions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
        {/* ── BULK TOOLS ── */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="tesla-card bg-white p-8">
            <h3 className="text-xs font-black text-navy uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <Zap className="text-brand-gold w-5 h-5" /> Bulk Adjust
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest block mb-3">Markup / Markdown (%)</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={globalAdj}
                    onChange={(e) => setGlobalAdj(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-navy/5 border-2 border-transparent focus:border-brand-gold/20 rounded-xl px-4 py-3 text-sm font-black outline-none"
                    placeholder="E.g. 10"
                  />
                  <button 
                    onClick={() => applyAdjustment('percent', globalAdj)}
                    className="p-3 bg-navy text-white rounded-xl hover:scale-105 transition-all"
                  >
                    <Percent className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => applyAdjustment('percent', 5)}
                  className="py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                >
                  +5% Surge
                </button>
                <button 
                  onClick={() => applyAdjustment('percent', -10)}
                  className="py-4 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                >
                  -10% Clearance
                </button>
              </div>
            </div>
          </div>

          <div className="tesla-card bg-navy text-white p-8 overflow-hidden relative">
            <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-8">Revision Impact</h3>
            <div className="space-y-6 relative z-10">
               <div>
                 <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Items Affected</div>
                 <div className="text-3xl font-black">{items.filter(i => i.new_price !== i.current_price).length}</div>
               </div>
               <div>
                 <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Value Delta</div>
                 <div className="text-2xl font-black text-emerald-400">
                   +{formatCurrency(items.reduce((acc, i) => acc + (i.new_price - i.current_price), 0))}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* ── ITEM GRID ── */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6 min-h-0">
          <div className="tesla-card bg-white flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-navy/5 flex items-center justify-between">
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/20" />
                <input 
                  type="text"
                  placeholder="Filter grid..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-navy/5 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-black outline-none placeholder:text-navy/20"
                />
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black text-navy/40 uppercase tracking-widest">
                <span>Sorting: High Price</span>
                <Filter className="w-4 h-4" />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-navy/[0.02] text-[10px] font-black text-navy/30 uppercase tracking-[0.3em]">
                    <th className="p-6 text-left">Product Detail</th>
                    <th className="p-6 text-center">Current MRP</th>
                    <th className="p-6 text-center">New MRP</th>
                    <th className="p-6 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  <AnimatePresence>
                    {items.map((item, idx) => (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-navy/[0.01]"
                      >
                        <td className="p-6">
                          <div className="text-sm font-black text-navy uppercase tracking-tight">{item.name}</div>
                          <div className="text-[10px] font-mono text-navy/40 mt-1 uppercase tracking-widest">{item.code}</div>
                        </td>
                        <td className="p-6 text-center font-mono font-black text-navy/40 text-sm italic">
                          {formatCurrency(item.current_price)}
                        </td>
                        <td className="p-6 text-center">
                          <input 
                            type="number"
                            value={item.new_price}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setItems(prev => prev.map(p => p.id === item.id ? { ...p, new_price: val } : p));
                            }}
                            className={cn(
                              "w-32 bg-transparent border-2 rounded-xl py-2 px-4 text-center text-sm font-black outline-none transition-all",
                              item.new_price === item.current_price 
                                ? "border-transparent focus:border-navy/10" 
                                : item.new_price > item.current_price 
                                  ? "border-emerald-100 bg-emerald-50 text-emerald-600" 
                                  : "border-rose-100 bg-rose-50 text-rose-500"
                            )}
                          />
                        </td>
                        <td className="p-6 text-right">
                          <div className={cn(
                            "flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest",
                            item.new_price === item.current_price ? "text-navy/20" : item.new_price > item.current_price ? "text-emerald-500" : "text-rose-500"
                          )}>
                            {item.new_price > item.current_price ? <TrendingUp className="w-3 h-3" /> : item.new_price < item.current_price ? <TrendingDown className="w-3 h-3" /> : null}
                            {item.new_price === item.current_price ? 'NO CHANGE' : `${((item.new_price - item.current_price) / item.current_price * 100).toFixed(1)}%`}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── SUCCESS NOTIFICATION ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 z-[300] border-2 border-emerald-400"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Sovereign Pricing Synced Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
