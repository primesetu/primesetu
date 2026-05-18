import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Loader2, Plus, Sparkles } from 'lucide-react';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';

interface PurchaseMatrixModalProps {
  onClose: () => void;
  onApply: (items: any[]) => void;
}

export default function PurchaseMatrixModal({ onClose, onApply }: PurchaseMatrixModalProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, number>>>({});

  const searchBase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query.length < 3) return;
    setIsSearching(true);
    try {
      const res = await api.inventory.search(query.trim());
      const items = Array.isArray(res) ? res : (res?.data || []);
      setResults(items);
      setMatrixData({}); // reset matrix
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Build matrix axes based on results
  // For standard apparel matrix:
  // Rows (Y) = class1 (Color)
  // Cols (X) = class2 (Size)
  const { rows, cols } = useMemo(() => {
    const rowSet = new Set<string>();
    const colSet = new Set<string>();
    
    results.forEach(r => {
      rowSet.add(r.class1 || r.brand || 'STD');
      colSet.add(r.class2 || r.size || 'STD');
    });

    return {
      rows: Array.from(rowSet).sort(),
      cols: Array.from(colSet).sort()
    };
  }, [results]);

  const handleQtyChange = (row: string, col: string, qty: number) => {
    setMatrixData(prev => {
      const newRow = { ...(prev[row] || {}) };
      newRow[col] = qty;
      return { ...prev, [row]: newRow };
    });
  };

  const handleApply = () => {
    const selectedItems: any[] = [];
    rows.forEach(r => {
      cols.forEach(c => {
        const qty = matrixData[r]?.[c] || 0;
        if (qty > 0) {
          // Find corresponding SKU in results
          const match = results.find(item => 
            (item.class1 || item.brand || 'STD') === r && 
            (item.class2 || item.size || 'STD') === c
          );
          if (match) {
            selectedItems.push({ ...match, qty });
          } else {
            // Optional: If item doesn't exist but matrix implies it, we could generate one.
            // For purchase, we usually only allow existing items or auto-create them.
            // Here we skip if it doesn't exist.
          }
        }
      });
    });
    
    if (selectedItems.length > 0) {
      onApply(selectedItems);
    }
    onClose();
  };

  const totalQty = useMemo(() => {
    let sum = 0;
    Object.values(matrixData).forEach(row => {
      Object.values(row).forEach(qty => {
        sum += qty;
      });
    });
    return sum;
  }, [matrixData]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Sparkles className="text-emerald-200" size={24} />
            <div>
              <h2 className="text-white text-lg font-black uppercase tracking-wider leading-none">Matrix Generator</h2>
              <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest mt-1">Sovereign Size-Wise PO Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
          <form onSubmit={searchBase} className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value.toUpperCase())}
                placeholder="ENTER ARTICLE, BRAND, OR BASE SKU TO GENERATE MATRIX..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-12 pl-12 pr-4 text-sm font-black uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching || query.length < 3}
              className="h-12 px-8 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Fetch Matrix
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-white dark:bg-slate-900 relative">
          {results.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <Search size={64} className="mb-4" />
              <div className="text-sm font-black uppercase tracking-widest">Search an Article to begin</div>
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-slate-100 dark:bg-slate-800 p-3 text-left border-b border-slate-200 dark:border-slate-700 min-w-[150px] sticky left-0 z-10">
                      <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Color \ Size</div>
                    </th>
                    {cols.map(c => (
                      <th key={c} className="bg-slate-100 dark:bg-slate-800 p-3 text-center border-b border-l border-slate-200 dark:border-slate-700 min-w-[80px]">
                        <div className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">{c}</div>
                      </th>
                    ))}
                    <th className="bg-slate-100 dark:bg-slate-800 p-3 text-center border-b border-l border-slate-200 dark:border-slate-700 w-24">
                      <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Row Total</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    let rowSum = 0;
                    cols.forEach(c => rowSum += (matrixData[r]?.[c] || 0));

                    return (
                      <tr key={r} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 border-b border-slate-200 dark:border-slate-700 font-bold text-xs uppercase bg-white dark:bg-slate-900 sticky left-0 z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                          {r}
                        </td>
                        {cols.map(c => {
                          // Check if cell is valid (exists in registry)
                          const exists = results.some(item => 
                            (item.class1 || item.brand || 'STD') === r && 
                            (item.class2 || item.size || 'STD') === c
                          );

                          return (
                            <td key={c} className={cn(
                              "p-2 border-b border-l border-slate-200 dark:border-slate-700",
                              !exists && "bg-slate-50 dark:bg-slate-950/50"
                            )}>
                              {exists ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={matrixData[r]?.[c] || ''}
                                  onChange={e => handleQtyChange(r, c, parseInt(e.target.value) || 0)}
                                  onFocus={e => e.target.select()}
                                  className="w-full text-center bg-transparent outline-none font-black text-sm text-emerald-700 dark:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-900/30 rounded py-1"
                                />
                              ) : (
                                <div className="text-center text-slate-300 dark:text-slate-700 text-xs">—</div>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3 border-b border-l border-slate-200 dark:border-slate-700 text-center font-black text-slate-400 bg-slate-50 dark:bg-slate-900">
                          {rowSum || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <div>Matches: <span className="text-slate-900 dark:text-white text-base">{results.length}</span></div>
            <div>Total Qty: <span className="text-emerald-600 dark:text-emerald-400 text-base">{totalQty}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 h-10 rounded-lg font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleApply}
              disabled={totalQty === 0}
              className="px-8 h-10 rounded-lg font-black uppercase tracking-widest text-[10px] bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={14} /> Insert to Document
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
