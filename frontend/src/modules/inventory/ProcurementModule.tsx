/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FilePlus, ShoppingBag, Landmark, Plus, Trash2, 
  Save, Printer, Layers, List, Grid, CheckCircle2,
  Palette, StickyNote, Sparkles, ArrowRight, ScanBarcode
} from 'lucide-react'
import { useNavigate } from 'react-router-dom';

type EntryMode = 'STANDARD' | 'MATRIX';

interface MatrixRow {
  id: string;
  articleCode: string;
  color: string;
  note: string;
  mrp: number;
  sizes: { [key: number]: number };
  isNew: boolean;
}

export default function ProcurementModule() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'PO' | 'GRN' | 'ADVANCE'>('PO')
  const [entryMode, setEntryMode] = useState<EntryMode>('MATRIX')
  
  // Matrix State
  const [matrix, setMatrix] = useState<MatrixRow[]>([
    { id: '1', articleCode: '', color: '', note: '', mrp: 0, sizes: {}, isNew: true }
  ])

  const sizeRange = [35, 36, 37, 38, 39, 40, 41, 42, 43]

  const addColorRow = () => {
    setMatrix([...matrix, { 
      id: Math.random().toString(), 
      articleCode: '', 
      color: '', 
      note: '', 
      mrp: 0, 
      sizes: {}, 
      isNew: true 
    }])
  }

  const updateRow = (rowId: string, updates: Partial<MatrixRow>) => {
    // In a real scenario, we'd check against a local index of articles
    // For now, if code is empty or modified significantly, it's NEW
    setMatrix(matrix.map(row => {
      if (row.id === rowId) {
        const isActuallyNew = updates.articleCode ? !['PUMA','NIK','ADI'].some(b => updates.articleCode?.startsWith(b)) : row.isNew;
        return { ...row, ...updates, isNew: isActuallyNew };
      }
      return row;
    }))
  }

  const updateSize = (rowId: string, size: number, val: string) => {
    const qty = parseInt(val) || 0
    setMatrix(matrix.map(row => 
      row.id === rowId ? { ...row, sizes: { ...row.sizes, [size]: qty } } : row
    ))
  }

  const calculateTotal = () => {
    return matrix.reduce((total, row) => {
      const rowSum = Object.values(row.sizes).reduce((sum, q) => sum + q, 0)
      return total + rowSum
    }, 0)
  }

  const calculateBillValue = () => {
    return matrix.reduce((total, row) => {
      const rowSum = Object.values(row.sizes).reduce((sum, q) => sum + q, 0)
      return total + (rowSum * (row.mrp || 0))
    }, 0)
  }

  const handlePrintBarcodes = () => {
    // Save current matrix to a global state or localStorage for the Barcode Studio to pick up
    const printData = matrix.flatMap(row => 
      Object.entries(row.sizes).map(([size, qty]) => ({
        id: `${row.id}-${size}`,
        code: `${row.articleCode}-${size}`,
        name: `ARTICLE: ${row.articleCode}`,
        mrp: row.mrp,
        size: size,
        qty: qty,
        color: row.color,
        note: row.note,
        isNew: row.isNew
      })).filter(item => item.qty > 0)
    );
    
    localStorage.setItem('primesetu_pending_print', JSON.stringify(printData));
    navigate('/inventory/barcode');
  }

  const ModeSwitcher = () => (
    <div className="flex bg-white/10 rounded-xl p-1 border border-white/10 shadow-inner">
      <button onClick={() => setEntryMode('STANDARD')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${entryMode === 'STANDARD' ? 'bg-amber-400 text-navy shadow-lg' : 'text-white/60 hover:text-white'}`}>
        <List className="w-4 h-4" /> List
      </button>
      <button onClick={() => setEntryMode('MATRIX')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${entryMode === 'MATRIX' ? 'bg-amber-400 text-navy shadow-lg' : 'text-white/60 hover:text-white'}`}>
        <Grid className="w-4 h-4" /> Cutsize Matrix
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* Header & Navigation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-navy text-amber-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-md">Procurement Node</div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <h1 className="text-5xl font-serif font-black text-navy uppercase tracking-tight">Purchase & GRN</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-3 flex items-center gap-2 italic">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Shoper9 Operational Parity Active
          </p>
        </div>
        
        <div className="flex bg-navy/5 p-1.5 rounded-2xl border border-border/50 shadow-inner">
          {[
            { id: 'PO', label: 'Order Form', icon: FilePlus },
            { id: 'GRN', label: 'Good Inwards', icon: ShoppingBag },
            { id: 'ADVANCE', label: 'Customer Advance', icon: Landmark }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-10 py-5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-navy text-white shadow-2xl scale-105' : 'text-muted hover:text-navy hover:bg-white'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(activeTab === 'PO' || activeTab === 'GRN') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
            <div className="glass rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/30 backdrop-blur-3xl bg-white/40">
              {/* Header with Switcher */}
              <div className="bg-navy p-12 text-white flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 blur-[100px] rounded-full"></div>
                 <div className="flex items-center gap-8 relative z-10">
                   <div className="w-16 h-16 bg-amber-400 rounded-[1.5rem] flex items-center justify-center text-navy shadow-2xl transform rotate-3"><FilePlus className="w-8 h-8" /></div>
                   <div>
                     <h2 className="text-3xl font-serif font-black uppercase tracking-tight">{activeTab === 'PO' ? 'Create Purchase Order' : 'Record Goods Inward'}</h2>
                     <div className="mt-4"><ModeSwitcher /></div>
                   </div>
                 </div>
                 <div className="flex gap-5 relative z-10">
                    <button onClick={handlePrintBarcodes} className="bg-white/10 text-white px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-amber-400 hover:text-navy transition-all flex items-center gap-3 shadow-xl backdrop-blur-md">
                      <ScanBarcode className="w-5 h-5" /> Print Barcodes
                    </button>
                    <button className="bg-amber-400 text-navy px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-xl active:scale-95">
                      <Save className="w-5 h-5" /> Finalize {activeTab}
                    </button>
                 </div>
              </div>

              {/* Matrix Entry Engine */}
              <div className="p-12">
                {entryMode === 'MATRIX' && (
                  <div className="space-y-12">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center"><Sparkles className="w-7 h-7 text-indigo-600" /></div>
                         <div>
                            <h3 className="text-2xl font-serif font-black text-navy uppercase tracking-tight">Cutsize Matrix Entry</h3>
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Override Master & Auto-Create Enabled</p>
                         </div>
                      </div>
                      <button onClick={addColorRow} className="bg-navy text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-amber-400 hover:text-navy transition-all shadow-xl active:scale-95">
                        + Add Article Row
                      </button>
                    </div>

                    <div className="overflow-x-auto pb-6">
                      <table className="w-full border-separate border-spacing-2">
                        <thead>
                          <tr className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">
                            <th className="p-6 text-left w-64 bg-navy text-white rounded-2xl shadow-lg">Article Number</th>
                            <th className="p-6 text-left w-48 bg-indigo-50 text-indigo-900 rounded-2xl shadow-sm"><div className="flex items-center gap-2"><Palette size={14} /> Color</div></th>
                            {sizeRange.map(s => <th key={s} className="p-6 text-center bg-white border border-border rounded-2xl w-20 shadow-sm">{s}</th>)}
                            <th className="p-6 text-left w-64 bg-emerald-50 text-emerald-900 rounded-2xl shadow-sm"><div className="flex items-center gap-2"><StickyNote size={14} /> Note/Extra</div></th>
                            <th className="p-6 text-center bg-amber-400/20 text-navy rounded-2xl w-28 border border-amber-400/20 shadow-inner">Total</th>
                            <th className="p-6 w-14"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {matrix.map((row) => (
                            <tr key={row.id} className={row.isNew ? 'bg-indigo-50/20' : ''}>
                              <td>
                                <div className="relative">
                                  <input type="text" placeholder="ARTICLE CODE" 
                                    className="w-full bg-white border-2 border-border rounded-2xl px-6 py-5 text-xs font-black text-navy focus:border-amber-400 outline-none shadow-sm transition-all uppercase"
                                    value={row.articleCode} onChange={(e) => updateRow(row.id, { articleCode: e.target.value })}
                                  />
                                  {row.isNew && <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg">NEW</div>}
                                </div>
                              </td>
                              <td>
                                <input type="text" placeholder="COLOR" 
                                  className="w-full bg-white border-2 border-border rounded-2xl px-6 py-5 text-xs font-black text-indigo-600 focus:border-indigo-400 outline-none shadow-sm transition-all uppercase"
                                  value={row.color} onChange={(e) => updateRow(row.id, { color: e.target.value })}
                                />
                              </td>
                              {sizeRange.map(s => (
                                <td key={s}>
                                  <input type="number" placeholder="0"
                                    className="w-full bg-white border-2 border-border rounded-2xl p-5 text-center font-black text-base text-navy focus:border-amber-400 outline-none shadow-sm transition-all placeholder:text-navy/10"
                                    onChange={(e) => updateSize(row.id, s, e.target.value)}
                                  />
                                </td>
                              ))}
                              <td>
                                <input type="text" placeholder="ADD NOTES..." 
                                  className="w-full bg-white border-2 border-border rounded-2xl px-6 py-5 text-xs font-medium text-emerald-700 focus:border-emerald-400 outline-none shadow-sm transition-all"
                                  value={row.note} onChange={(e) => updateRow(row.id, { note: e.target.value })}
                                />
                              </td>
                              <td className="text-center font-black text-navy text-2xl bg-amber-50/30 rounded-2xl border border-border/50">
                                {Object.values(row.sizes).reduce((a,b) => a+b, 0)}
                              </td>
                              <td className="text-center">
                                <button onClick={() => setMatrix(matrix.filter(r => r.id !== row.id))} className="text-rose-400 hover:text-rose-600 p-4 bg-rose-50 rounded-2xl transition-all"><Trash2 className="w-5 h-5" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Intelligence */}
              <div className="p-12 pt-16 border-t-2 border-border flex flex-col md:flex-row justify-between items-center gap-12 bg-white/50 backdrop-blur-md">
                <div className="flex gap-16">
                   <div>
                     <div className="text-[10px] font-black text-muted uppercase tracking-[0.25em] mb-2">Total Net Qty</div>
                     <div className="text-5xl font-serif font-black text-navy">{calculateTotal()} <span className="text-sm font-sans font-black text-muted/40">PCS</span></div>
                   </div>
                   <div>
                     <div className="text-[10px] font-black text-muted uppercase tracking-[0.25em] mb-2">Gross Bill Value</div>
                     <div className="text-5xl font-serif font-black text-emerald-600">₹{calculateBillValue().toLocaleString()}</div>
                   </div>
                   <div>
                     <div className="text-[10px] font-black text-muted uppercase tracking-[0.25em] mb-2">Line Items</div>
                     <div className="text-5xl font-serif font-black text-indigo-600">{matrix.length} <span className="text-sm font-sans font-black text-muted/40">SKUS</span></div>
                   </div>
                </div>
                
                <div className="flex gap-5">
                   <button onClick={handlePrintBarcodes} className="bg-navy text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-gold hover:text-navy transition-all shadow-xl flex items-center gap-3">
                      <ScanBarcode className="w-5 h-5" /> Generate Barcodes
                   </button>
                   <div className="bg-emerald-500 text-white px-8 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5" /> Protocol Verified
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
