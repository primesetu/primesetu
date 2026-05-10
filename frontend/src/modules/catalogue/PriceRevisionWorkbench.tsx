/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Sovereign Pricing Engine v2.0
 * ============================================================ */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Save, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  ChevronLeft,
  RefreshCw,
  Plus,
  Minus,
  DownloadCloud,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';
import { 
  WorkbenchRibbon, 
  RibbonGroup, 
  RibbonButton
} from '@/components/ui/WorkbenchUI';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ── TYPES ──────────────────────────────────────────────────────────────────

interface PriceItem {
  id: string;
  stockno: string;
  itemdesc: string;
  current_mrp: number;
  new_mrp: number;
  cost_price: number;
  margin: number;
  modified?: boolean;
}

interface PriceRevisionWorkbenchProps {
  onBack: () => void;
}

// ── COMPONENT ──────────────────────────────────────────────────────────────

export default function PriceRevisionWorkbench({ onBack }: PriceRevisionWorkbenchProps) {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkVal, setBulkVal] = useState(0);

  // ── Data Loading ──
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from /api/v1/inventory/prices
      // For now, we fetch items and map them
      const res = await api.legacy.getData('itemmaster', { limit: 100 });
      const data = Array.isArray(res) ? res : (res?.data || []);
      
      const mapped = data.map((item: any) => ({
        id: item.stockno,
        stockno: item.stockno,
        itemdesc: item.itemdesc,
        current_mrp: item.retail_price || 0,
        new_mrp: item.retail_price || 0,
        cost_price: item.cost_price || 0,
        margin: item.cost_price ? ((item.retail_price - item.cost_price) / item.retail_price) * 100 : 0,
        modified: false
      }));
      setItems(mapped);
    } catch (err) {
      console.error("Failed to load price data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Business Logic ──

  const handlePriceChange = (id: string, newVal: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const margin = item.cost_price ? ((newVal - item.cost_price) / newVal) * 100 : 0;
      return { ...item, new_mrp: newVal, margin, modified: true };
    }));
  };

  const applyBulkAdjustment = (type: 'percent' | 'fixed', direction: 1 | -1) => {
    const val = bulkVal * direction;
    setItems(prev => prev.map(item => {
      // Only apply to selected or all if none selected
      if (selectedIds.size > 0 && !selectedIds.has(item.id)) return item;
      
      let nextMrp = item.current_mrp;
      if (type === 'percent') {
        nextMrp = Math.round(item.current_mrp * (1 + val / 100));
      } else {
        nextMrp = item.current_mrp + val;
      }
      
      const margin = item.cost_price ? ((nextMrp - item.cost_price) / nextMrp) * 100 : 0;
      return { ...item, new_mrp: nextMrp, margin, modified: true };
    }));
  };

  const handleSave = async () => {
    const changed = items.filter(i => i.modified);
    if (changed.length === 0) return;

    setIsSaving(true);
    try {
      // Simulate bulk update
      const payload = changed.map(i => ({ stockno: i.stockno, retail_price: i.new_mrp }));
      await api.legacy.bulkUpdate('itemmaster', payload);
      alert(`${changed.length} Prices synchronized to Sovereign Ledger.`);
      setItems(prev => prev.map(i => ({ ...i, current_mrp: i.new_mrp, modified: false })));
    } catch {
      alert("Synchronization failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter(i => 
    i.itemdesc.toLowerCase().includes(search.toLowerCase()) || 
    i.stockno.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => {
    const modified = items.filter(i => i.modified);
    return {
      count: modified.length,
      drift: modified.reduce((acc, i) => acc + (i.new_mrp - i.current_mrp), 0)
    };
  }, [items]);

  // ── UI RENDER ─────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      
      {/* ── TOP RIBBON ── */}
      <WorkbenchRibbon>
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-3 mr-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <RibbonGroup label="Sovereign Control">
            <RibbonButton 
              icon={Save} 
              label="Commit" 
              variant="primary" 
              onClick={handleSave}
              disabled={isSaving || stats.count === 0}
              shortcut="F9" 
            />
            <RibbonButton 
              icon={RefreshCw} 
              label="Reload" 
              onClick={loadData}
              shortcut="F5" 
            />
          </RibbonGroup>

          <RibbonGroup label="Bulk Actions">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
               <input 
                 type="number" 
                 value={bulkVal || ''}
                 onChange={e => setBulkVal(parseFloat(e.target.value) || 0)}
                 className="w-16 bg-transparent text-xs font-black outline-none px-2"
                 placeholder="0.00"
               />
               <div className="flex gap-1">
                  <button onClick={() => applyBulkAdjustment('percent', 1)} className="p-1 hover:bg-emerald-500 hover:text-white rounded transition-all" title="Surge %"><TrendingUp size={14}/></button>
                  <button onClick={() => applyBulkAdjustment('percent', -1)} className="p-1 hover:bg-rose-500 hover:text-white rounded transition-all" title="Markdown %"><TrendingDown size={14}/></button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                  <button onClick={() => applyBulkAdjustment('fixed', 1)} className="p-1 hover:bg-emerald-500 hover:text-white rounded transition-all" title="Fixed Increase"><Plus size={14}/></button>
                  <button onClick={() => applyBulkAdjustment('fixed', -1)} className="p-1 hover:bg-rose-500 hover:text-white rounded transition-all" title="Fixed Decrease"><Minus size={14}/></button>
               </div>
            </div>
          </RibbonGroup>

          <RibbonGroup label="Tools">
            <RibbonButton icon={FileSpreadsheet} label="Export" onClick={() => {}} />
            <RibbonButton icon={DownloadCloud} label="S9 Import" onClick={() => {}} />
            <RibbonButton 
              icon={ExternalLink} 
              label="Popout" 
              onClick={() => window.open('/popout/price', '_blank', 'width=1400,height=900,menubar=no,toolbar=no,location=no')} 
            />
          </RibbonGroup>

          <RibbonGroup label="Analysis">
             <div className="flex flex-col px-4 border-l border-slate-200 dark:border-slate-800">
                <span className={cn("text-lg font-black leading-none", stats.drift >= 0 ? "text-emerald-600" : "text-rose-600")}>
                   {stats.drift >= 0 ? '+' : ''}{stats.drift.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Value Drift</span>
             </div>
          </RibbonGroup>
        </div>

        <div className="flex items-center gap-2 pr-4">
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Find in Registry..."
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-9 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
           </div>
        </div>
      </WorkbenchRibbon>

      {/* ── WORKBENCH GRID ── */}
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 m-2 rounded-xl shadow-inner relative">
         {loading ? (
           <div className="h-full flex flex-col items-center justify-center opacity-40">
              <RefreshCw className="animate-spin mb-4" size={48} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synchronizing Registry...</span>
           </div>
         ) : (
           <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-20">
                 <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-12 text-center">
                       <input 
                         type="checkbox" 
                         onChange={e => setSelectedIds(e.target.checked ? new Set(items.map(i => i.id)) : new Set())}
                         checked={selectedIds.size === items.length && items.length > 0}
                       />
                    </th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-40">Stock No</th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter">Description</th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-32 text-right">Current MRP</th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-32 text-right bg-emerald-500/5">New MRP</th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-24 text-right">Cost</th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-24 text-right">Margin %</th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-24 text-center">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {filteredItems.map((item) => (
                    <tr 
                      key={item.id}
                      className={cn(
                        "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group",
                        selectedIds.has(item.id) && "bg-emerald-500/5"
                      )}
                    >
                       <td className="p-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(item.id)}
                            onChange={() => {
                              const next = new Set(selectedIds);
                              if (next.has(item.id)) next.delete(item.id);
                              else next.add(item.id);
                              setSelectedIds(next);
                            }}
                          />
                       </td>
                       <td className="p-3 text-[11px] font-black text-emerald-600 font-mono tracking-wider uppercase">{item.stockno}</td>
                       <td className="p-3 text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase truncate max-w-xs">{item.itemdesc}</td>
                       <td className="p-3 text-[11px] font-black text-slate-400 text-right italic">₹{item.current_mrp.toFixed(2)}</td>
                       <td className="p-3 text-right bg-emerald-500/5">
                          <input 
                            type="number"
                            value={item.new_mrp}
                            onChange={e => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                            className={cn(
                              "w-full bg-transparent text-right text-[11px] font-black outline-none",
                              item.modified ? "text-emerald-600" : "text-slate-700 dark:text-slate-200"
                            )}
                          />
                       </td>
                       <td className="p-3 text-[11px] font-black text-slate-400 text-right">₹{item.cost_price.toFixed(2)}</td>
                       <td className="p-3 text-[11px] font-black text-right">
                          <span className={cn(
                            "px-2 py-0.5 rounded",
                            item.margin > 30 ? "bg-emerald-500/10 text-emerald-600" : item.margin > 15 ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"
                          )}>
                             {item.margin.toFixed(1)}%
                          </span>
                       </td>
                       <td className="p-3 text-center">
                          {item.modified && <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" title="Pending Sync" />}
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
         )}
      </div>

      {/* ── STATUS BAR ── */}
      <div className="bg-slate-200 dark:bg-slate-800 px-6 py-1 flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
         <div className="flex items-center gap-8 divide-x divide-slate-300 dark:divide-slate-700">
            <span>F2: Filter Selection</span>
            <span className="pl-8">F9: Commit Changes</span>
            <span className="pl-8">Selected: {selectedIds.size} Items</span>
         </div>
         <div>PRICING ENGINE v2.0 | {stats.count} PENDING CHANGES</div>
      </div>

    </div>
  );
}
