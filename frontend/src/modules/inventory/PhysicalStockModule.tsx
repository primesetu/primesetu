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

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ClipboardList, CheckCircle2, AlertTriangle, Scan, Search, 
  Filter, Save, ClipboardCheck, X, ShieldCheck, AlertCircle,
  Barcode, ArrowRight, Printer, History, RefreshCw, 
  Package, LayoutGrid, FileText, Wand2, Zap
} from 'lucide-react'

interface AuditItem {
  id: string
  code: string
  name: string
  brand: string
  systemQty: number
  physicalQty: number
  isScanned?: boolean
}

export default function PhysicalStockModule({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0) // 0: Select, 1: Count, 2: Variance, 3: Posted
  const [items, setItems] = useState<AuditItem[]>([])
  const [scanInput, setScanInput] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  const [loading, setLoading] = useState(false)
  const scanRef = useRef<HTMLInputElement>(null)

  // ── Mock Data Generation (Institutional) ───────────────────
  const startAudit = () => {
    setLoading(true)
    setTimeout(() => {
      setItems([
        { id: '1', code: 'A-30001', name: 'Premium Leather Loafer', brand: 'CityWalk', systemQty: 12, physicalQty: 0 },
        { id: '2', code: 'A-30002', name: 'Casual Sneaker Pro', brand: 'CityWalk', systemQty: 8, physicalQty: 0 },
        { id: '3', code: 'B-10023', name: 'Formal Oxford Brown', brand: 'Nexus', systemQty: 15, physicalQty: 0 },
        { id: '4', code: 'C-50091', name: 'Sports Mesh Run', brand: 'Puma', systemQty: 24, physicalQty: 0 },
      ].filter(i => selectedBrand === 'ALL' || i.brand === selectedBrand))
      setPhase(1)
      setLoading(false)
    }, 800)
  }

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scanInput) return
    
    const target = items.find(i => i.code === scanInput)
    if (target) {
      setItems(prev => prev.map(i => i.code === scanInput ? { ...i, physicalQty: i.physicalQty + 1, isScanned: true } : i))
      setScanInput('')
    } else {
      alert('Item code not found in current audit scope.')
      setScanInput('')
    }
  }

  const updateQty = (id: string, qty: number) => {
    setItems(items.map(i => i.id === id ? { ...i, physicalQty: qty } : i))
  }

  const filteredItems = items.filter(i => selectedBrand === 'ALL' || i.brand === selectedBrand)
  
  const getVariance = (item: AuditItem) => item.physicalQty - item.systemQty
  const varianceCount = filteredItems.filter(i => getVariance(i) !== 0).length

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 backdrop-blur-2xl bg-navy/60">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#f8f9fc] w-full max-w-6xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        
        {/* Header: Institutional Branding */}
        <div className="bg-navy p-10 text-white flex items-center justify-between border-b-8 border-amber-400">
           <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-amber-400 rounded-3xl flex items-center justify-center text-navy shadow-2xl transform -rotate-3">
                 <ClipboardCheck className="w-10 h-10" />
              </div>
              <div>
                 <h2 className="text-4xl font-serif font-black uppercase tracking-tight">Inventory Audit Hub</h2>
                 <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-amber-400">Sovereign Node PST</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Protocol Version 4.2</span>
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group">
              <X className="group-hover:rotate-90 transition-transform" />
           </button>
        </div>

        {/* Audit Phases */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === 0 ? (
               <motion.div key="selection" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-16 flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 bg-navy/5 text-navy rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner"><Filter size={40} /></div>
                  <h3 className="text-3xl font-serif font-black text-navy uppercase mb-4">Initialize Audit Scope</h3>
                  <p className="text-muted font-bold text-sm max-w-md uppercase tracking-widest mb-12">Select specific brand or department to perform a surgical physical stock verification.</p>
                  
                  <div className="flex gap-6 mb-12">
                     {['ALL', 'CityWalk', 'Nexus', 'Puma'].map(brand => (
                        <button key={brand} onClick={() => setSelectedBrand(brand)}
                          className={`px-10 py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 ${selectedBrand === brand ? 'bg-navy border-navy text-white shadow-2xl scale-110' : 'bg-white border-transparent text-gray-400 hover:bg-white hover:border-gray-100'}`}>
                          {brand}
                        </button>
                     ))}
                  </div>

                  <button onClick={startAudit} disabled={loading}
                    className="bg-amber-400 text-navy px-16 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-4 disabled:opacity-50">
                    {loading ? <RefreshCw className="animate-spin" /> : <Zap size={20} />} Begin Count Sequence
                  </button>
               </motion.div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Counting Tools */}
                <div className="bg-white border-b border-gray-100 p-8 flex items-center justify-between shadow-sm relative z-10">
                   <div className="flex gap-10">
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Counting Engine</div>
                        <form onSubmit={handleScan} className="flex gap-2">
                           <div className="relative">
                              <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input ref={scanRef} autoFocus value={scanInput} onChange={e => setScanInput(e.target.value.toUpperCase())}
                                placeholder="SCAN BARCODE..."
                                className="bg-gray-100 border-none pl-12 pr-6 py-4 rounded-2xl text-sm font-black outline-none focus:ring-4 ring-amber-400/20 focus:bg-white w-80 transition-all" />
                           </div>
                        </form>
                      </div>
                      <div className="w-px h-16 bg-gray-100" />
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Audit Progress</div>
                        <div className="flex items-center gap-4">
                           <div className="text-3xl font-serif font-black text-navy">{items.filter(i => i.physicalQty > 0).length} / {items.length}</div>
                           <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(items.filter(i => i.physicalQty > 0).length / items.length) * 100}%` }}></div>
                           </div>
                        </div>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={() => window.print()} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-navy hover:text-white transition-all shadow-lg"><Printer size={20} /></button>
                      <button onClick={() => setPhase(2)} className="bg-navy text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-amber-400 hover:text-navy transition-all">Review Discrepancies <ArrowRight size={16} /></button>
                   </div>
                </div>

                {/* Audit Grid */}
                <div className="flex-1 overflow-auto p-10">
                   <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-navy text-white text-[10px] font-black uppercase tracking-widest">
                           <tr>
                              <th className="p-8">Article Details</th>
                              <th className="p-8 text-center bg-white/10">System Qty</th>
                              <th className="p-8 text-center bg-white/20">Physical Count</th>
                              <th className="p-8 text-center">Variance</th>
                              <th className="p-8 text-center">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {filteredItems.map(item => {
                             const variance = getVariance(item)
                             return (
                               <motion.tr layout key={item.id} className={`transition-all ${item.isScanned ? 'bg-emerald-50/30' : 'hover:bg-cream/20'}`}>
                                  <td className="p-8">
                                     <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.isScanned ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}><Package size={20} /></div>
                                        <div>
                                           <div className="text-sm font-black text-navy uppercase tracking-tight">{item.name}</div>
                                           <div className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2 mt-1">
                                              {item.code} <span className="w-1 h-1 rounded-full bg-gray-300"></span> {item.brand}
                                           </div>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="p-8 text-center font-serif text-2xl text-navy/40">{item.systemQty}</td>
                                  <td className="p-8 text-center">
                                     <div className="flex items-center justify-center gap-4">
                                        <button onClick={() => updateQty(item.id, Math.max(0, item.physicalQty - 1))} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all">-</button>
                                        <input type="number" value={item.physicalQty} onChange={e => updateQty(item.id, parseInt(e.target.value) || 0)}
                                          className="w-20 bg-white border-2 border-gray-100 rounded-xl py-2 text-center text-lg font-black text-navy focus:border-amber-400 outline-none transition-all" />
                                        <button onClick={() => updateQty(item.id, item.physicalQty + 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-white transition-all">+</button>
                                     </div>
                                  </td>
                                  <td className={`p-8 text-center font-serif text-3xl font-black ${variance === 0 ? 'text-emerald-500/30' : variance > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                     {variance === 0 ? '--' : variance > 0 ? `+${variance}` : variance}
                                  </td>
                                  <td className="p-8 text-center">
                                     {variance === 0 ? (
                                        <div className="flex flex-col items-center gap-1 opacity-20"><ShieldCheck className="text-emerald-500" /><span className="text-[8px] font-black uppercase">Verified</span></div>
                                     ) : (
                                        <div className="flex flex-col items-center gap-1"><AlertCircle className="text-rose-500" /><span className="text-[8px] font-black uppercase text-rose-500">Variance</span></div>
                                     )}
                                  </td>
                               </motion.tr>
                             )
                           })}
                        </tbody>
                      </table>
                   </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer: Posting & Intelligence */}
        {phase > 0 && (
          <div className="p-10 bg-white border-t border-gray-100 flex items-center justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-full bg-navy/[0.02] -skew-x-12"></div>
             <div className="flex gap-16 relative z-10">
                <div>
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Net Discrepancy</div>
                   <div className="text-4xl font-serif font-black text-rose-500">{varianceCount} <span className="text-sm font-sans text-muted/40 uppercase">Articles</span></div>
                </div>
                <div>
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valuation Delta</div>
                   <div className="text-4xl font-serif font-black text-navy">₹{items.reduce((acc, i) => acc + (getVariance(i) * 500), 0).toLocaleString()}</div>
                </div>
             </div>
             
             <div className="flex gap-4 relative z-10">
                {phase === 2 ? (
                   <button
                     disabled={loading}
                     onClick={async () => {
                       setLoading(true)
                       try {
                         const payload = items
                           .filter(i => getVariance(i) !== 0)
                           .map(i => ({ product_id: i.id, system_qty: i.systemQty, physical_qty: i.physicalQty, variance: getVariance(i) }))
                         console.info('[PrimeSetu] Audit payload:', payload)
                         setPhase(3)
                       } catch (err) {
                         console.error('[PrimeSetu] Audit post failed:', err)
                         setPhase(3)
                       } finally { setLoading(false) }
                     }}
                     className="bg-emerald-600 text-white px-12 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-4 disabled:opacity-60"
                   >
                     {loading
                       ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Posting...</>
                       : <><Save size={20} /> Post Audit Reconciliation</>
                     }
                   </button>
                ) : (
                   <div className="bg-indigo-900 text-white px-8 py-4 rounded-3xl flex items-center gap-6 shadow-2xl">
                      <Wand2 className="w-8 h-8 text-amber-400" />
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">Phase 1: Entry Mode</div>
                        <div className="text-[10px] font-medium opacity-70">Physical counts are being mapped.</div>
                      </div>
                   </div>
                )}
             </div>
          </div>
        )}

      </motion.div>
    </div>
  )
}
