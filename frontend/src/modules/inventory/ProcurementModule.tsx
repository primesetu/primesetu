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
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FilePlus, ShoppingBag, Landmark, Plus, Trash2, 
  Save, Printer, Layers, List, Grid, CheckCircle2 
} from 'lucide-react'

type EntryMode = 'STANDARD' | 'MATRIX';

interface MatrixRow {
  id: string;
  color: string;
  sizes: { [key: number]: number };
}

export default function ProcurementModule() {
  const [activeTab, setActiveTab] = useState<'PO' | 'GRN' | 'ADVANCE'>('PO')
  const [entryMode, setEntryMode] = useState<EntryMode>('MATRIX')
  
  // Matrix State
  const [articleNo, setArticleNo] = useState('')
  const [costPrice, setCostPrice] = useState(0)
  const [matrix, setMatrix] = useState<MatrixRow[]>([
    { id: '1', color: '', sizes: {} }
  ])

  const sizeRange = [35, 36, 37, 38, 39, 40, 41, 42, 43]

  const addColorRow = () => {
    setMatrix([...matrix, { id: Math.random().toString(), color: '', sizes: {} }])
  }

  const updateSize = (rowId: string, size: number, val: string) => {
    const qty = parseInt(val) || 0
    setMatrix(matrix.map(row => 
      row.id === rowId ? { ...row, sizes: { ...row.sizes, [size]: qty } } : row
    ))
  }

  const updateColor = (rowId: string, color: string) => {
    setMatrix(matrix.map(row => 
      row.id === rowId ? { ...row, color } : row
    ))
  }

  const calculateTotal = () => {
    return matrix.reduce((total, row) => {
      const rowSum = Object.values(row.sizes).reduce((sum, q) => sum + q, 0)
      return total + rowSum
    }, 0)
  }

  const ModeSwitcher = () => (
    <div className="flex bg-white/10 rounded-xl p-1 border border-white/10 shadow-inner">
      <button 
        onClick={() => setEntryMode('STANDARD')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${entryMode === 'STANDARD' ? 'bg-gold text-navy shadow-lg' : 'text-white/60 hover:text-white'}`}
      >
        <List className="w-4 h-4" /> List
      </button>
      <button 
        onClick={() => setEntryMode('MATRIX')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${entryMode === 'MATRIX' ? 'bg-gold text-navy shadow-lg' : 'text-white/60 hover:text-white'}`}
      >
        <Grid className="w-4 h-4" /> Matrix
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* Header & Navigation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-navy text-gold text-[9px] font-black uppercase tracking-[0.2em] rounded-md">Procurement Engine</div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <h1 className="text-5xl font-serif font-black text-navy uppercase tracking-tight">Supply Management</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-3 flex items-center gap-2 italic">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Bi-Directional Sovereign Pulse Active
          </p>
        </div>
        
        <div className="flex bg-navy/5 p-1.5 rounded-2xl border border-border/50 shadow-inner">
          {[
            { id: 'PO', label: 'Order Form', icon: FilePlus },
            { id: 'GRN', label: 'Good Inwards', icon: ShoppingBag },
            { id: 'ADVANCE', label: 'Customer Advance', icon: Landmark }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-10 py-5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-navy text-white shadow-2xl scale-105' : 'text-muted hover:text-navy hover:bg-white'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(activeTab === 'PO' || activeTab === 'GRN') && (
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            className="space-y-10"
          >
            <div className="glass rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/30 backdrop-blur-3xl">
              {/* Header with Switcher */}
              <div className="bg-navy p-12 text-white flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[100px] rounded-full"></div>
                 <div className="flex items-center gap-8 relative z-10">
                   <div className="w-16 h-16 bg-gold rounded-[1.5rem] flex items-center justify-center text-navy shadow-2xl transform rotate-3"><FilePlus className="w-8 h-8" /></div>
                   <div>
                     <h2 className="text-3xl font-serif font-black uppercase tracking-tight">{activeTab === 'PO' ? 'Create Purchase Order' : 'Record Goods Inward'}</h2>
                     <div className="mt-4"><ModeSwitcher /></div>
                   </div>
                 </div>
                 <div className="flex gap-5 relative z-10">
                   <button className="bg-gold text-navy px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-xl active:scale-95">
                     <Save className="w-5 h-5" /> Finalize {activeTab}
                   </button>
                   <button className="bg-white/10 p-5 rounded-2xl hover:bg-white/20 transition-all shadow-lg backdrop-blur-md"><Printer className="w-6 h-6" /></button>
                 </div>
              </div>

              {/* Vendor & Article Identity */}
              <div className="p-12 grid grid-cols-1 md:grid-cols-4 gap-10 bg-cream/30 border-b border-border shadow-inner">
                  <div>
                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] block mb-3">Vendor / Supplier</label>
                    <select className="w-full bg-white border-2 border-border rounded-2xl px-6 py-5 text-sm font-bold text-navy outline-none focus:border-gold transition-all shadow-sm">
                       <option>LUCKY FOOTWEAR (MUMBAI)</option>
                       <option>NEXUS LIFESTYLE PVT LTD</option>
                       <option>CITYWALK INTERNATIONAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] block mb-3">Article No / Design</label>
                    <input 
                      type="text" 
                      placeholder="e.g. A-30003-BL" 
                      className="w-full bg-white border-2 border-border rounded-2xl px-6 py-5 text-sm font-black text-navy outline-none focus:border-gold transition-all shadow-sm placeholder:text-navy/20"
                      value={articleNo}
                      onChange={(e) => setArticleNo(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] block mb-3">Cost Price (Net)</label>
                    <input 
                      type="number" 
                      placeholder="520" 
                      className="w-full bg-white border-2 border-border rounded-2xl px-6 py-5 text-sm font-black text-navy outline-none focus:border-gold transition-all shadow-sm"
                      onChange={(e) => setCostPrice(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] block mb-3">Order Date</label>
                    <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-white border-2 border-border rounded-2xl px-6 py-5 text-sm font-bold text-navy outline-none focus:border-gold transition-all shadow-sm" />
                  </div>
              </div>

              {/* Matrix Entry Engine */}
              <div className="p-12">
                {entryMode === 'STANDARD' ? (
                  /* Standard List Mode */
                  <div className="space-y-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-serif font-black text-navy uppercase tracking-tight flex items-center gap-4">
                        <List className="w-7 h-7 text-gold" /> Line Item Entry
                      </h3>
                      <button className="bg-navy text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-navy transition-all shadow-lg">+ Add Line</button>
                    </div>
                    <div className="bg-white rounded-[2rem] border border-border overflow-hidden shadow-xl">
                      <table className="w-full text-left">
                        <thead className="bg-navy text-white text-[10px] font-black uppercase tracking-widest">
                          <tr>
                            <th className="px-10 py-6">Description</th>
                            <th className="px-6 py-6 text-center">Qty</th>
                            <th className="px-6 py-6 text-right">Unit Rate</th>
                            <th className="px-10 py-6 text-right">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr className="hover:bg-cream/20 transition-all group">
                            <td className="px-10 py-6">
                               <div className="font-bold text-navy">PUMA RS-X / BLACK / SIZE 8</div>
                               <div className="text-[10px] font-black text-muted uppercase tracking-tighter mt-1">Ref: {articleNo || 'No Article'}</div>
                            </td>
                            <td className="px-6 py-6 text-center font-black text-navy text-lg">12</td>
                            <td className="px-6 py-6 text-right font-bold text-navy">₹{costPrice.toLocaleString()}</td>
                            <td className="px-10 py-6 text-right font-black text-navy text-xl">₹{(12 * costPrice).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Matrix / Cutsize Mode (Preferred for Footwear) */
                  <div className="space-y-12">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-navy/5 rounded-2xl flex items-center justify-center"><Layers className="w-7 h-7 text-gold" /></div>
                         <div>
                            <h3 className="text-2xl font-serif font-black text-navy uppercase tracking-tight">Sovereign Matrix Entry</h3>
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Multi-dimensional Stock Allocation</p>
                         </div>
                      </div>
                      <button onClick={addColorRow} className="bg-navy text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gold hover:text-navy transition-all shadow-xl active:scale-95">
                        + Add Color Row
                      </button>
                    </div>

                    <div className="overflow-x-auto pb-6">
                      <table className="w-full border-separate border-spacing-2">
                        <thead>
                          <tr className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">
                            <th className="p-6 text-left w-64 bg-navy text-white rounded-2xl shadow-lg">Color Variation</th>
                            {sizeRange.map(s => <th key={s} className="p-6 text-center bg-white border border-border rounded-2xl w-20 shadow-sm">{s}</th>)}
                            <th className="p-6 text-center bg-gold/20 text-navy rounded-2xl w-28 border border-gold/20 shadow-inner">Row Total</th>
                            <th className="p-6 w-14"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {matrix.map((row) => (
                            <tr key={row.id}>
                              <td>
                                <input 
                                  type="text" 
                                  placeholder="e.g. JET BLACK" 
                                  className="w-full bg-white border-2 border-border rounded-2xl px-6 py-5 text-xs font-black text-navy focus:border-gold outline-none shadow-sm transition-all"
                                  value={row.color}
                                  onChange={(e) => updateColor(row.id, e.target.value)}
                                />
                              </td>
                              {sizeRange.map(s => (
                                <td key={s}>
                                  <input 
                                    type="number" 
                                    placeholder="0"
                                    className="w-full bg-white border-2 border-border rounded-2xl p-5 text-center font-black text-base text-navy focus:ring-8 ring-gold/10 border-gold/0 focus:border-gold outline-none shadow-sm transition-all placeholder:text-navy/10"
                                    onChange={(e) => updateSize(row.id, s, e.target.value)}
                                  />
                                </td>
                              ))}
                              <td className="text-center font-black text-navy text-2xl bg-cream/20 rounded-2xl border border-border/50">
                                {Object.values(row.sizes).reduce((a,b) => a+b, 0)}
                              </td>
                              <td className="text-center">
                                <button 
                                  onClick={() => setMatrix(matrix.filter(r => r.id !== row.id))} 
                                  className="text-rose-400 hover:text-rose-600 p-4 bg-rose-50 rounded-2xl transition-all hover:scale-110"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Matrix Intelligence Summary */}
              <div className="p-12 pt-16 border-t-2 border-border flex flex-col md:flex-row justify-between items-center gap-12 bg-white/50 backdrop-blur-md">
                <div className="flex gap-16">
                   <div className="group cursor-pointer">
                     <div className="text-[10px] font-black text-muted uppercase tracking-[0.25em] mb-2 group-hover:text-gold transition-colors">Net Order Qty</div>
                     <div className="text-5xl font-serif font-black text-navy flex items-center gap-3">
                       {calculateTotal()} <span className="text-sm font-sans font-black text-muted/40 uppercase">Pairs</span>
                     </div>
                   </div>
                   <div className="group cursor-pointer">
                     <div className="text-[10px] font-black text-muted uppercase tracking-[0.25em] mb-2 group-hover:text-gold transition-colors">Estimated Valuation</div>
                     <div className="text-5xl font-serif font-black text-gold">₹{(calculateTotal() * costPrice).toLocaleString()}</div>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-[11px] font-black text-navy/40 uppercase tracking-[0.4em] bg-navy/5 px-8 py-4 rounded-3xl border border-navy/5 shadow-inner">
                     Sovereign Node X01 · Protocol Secure
                   </div>
                   <div className="mt-3 flex gap-4 pr-4">
                     {['GST-READY', 'HO-SYNC', 'PST-AUDIT'].map(tag => (
                       <span key={tag} className="text-[8px] font-black text-muted uppercase tracking-widest">{tag}</span>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'ADVANCE' && (
          <motion.div key="adv" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-20 glass rounded-[4rem] text-center shadow-2xl border border-white/20">
             <div className="w-24 h-24 bg-navy text-gold rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
               <Landmark className="w-12 h-12" />
             </div>
             <h2 className="text-4xl font-serif font-black text-navy uppercase mb-4 tracking-tighter">Customer Advance Ledger</h2>
             <p className="text-muted font-bold uppercase tracking-[0.2em] text-xs max-w-lg mx-auto leading-relaxed">Secure financial tracking for pre-orders, custom sizing deposits, and institutional bulk contracts.</p>
             <button className="mt-12 bg-navy text-white px-12 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-gold hover:text-navy transition-all shadow-2xl">New Deposit Entry</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
