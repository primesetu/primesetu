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
import { motion } from 'framer-motion'
import { ClipboardList, CheckCircle2, AlertTriangle, Scan, Search, Filter, Save, ClipboardCheck, X, ShieldCheck, AlertCircle } from 'lucide-react'

interface AuditItem {
  id: string
  code: string
  name: string
  systemQty: number
  physicalQty: number
}

export default function PhysicalStockModule({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<1 | 2 | 3>(1) // 1: Entry, 2: Verification, 3: Posting
  const [items, setItems] = useState<AuditItem[]>([
    { id: '1', code: 'PUMA-RSX-01', name: 'Puma RS-X Bold', systemQty: 10, physicalQty: 10 },
    { id: '2', code: 'NIK-AF1-09', name: 'Nike Air Force 1', systemQty: 5, physicalQty: 4 }
  ])

  const updatePhysicalQty = (id: string, qty: number) => {
    setItems(items.map(i => i.id === id ? { ...i, physicalQty: qty } : i))
  }

  const varianceCount = items.filter(i => i.systemQty !== i.physicalQty).length

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 backdrop-blur-2xl bg-navy/60">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-5xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/20"
      >
        {/* Header */}
        <div className="bg-navy p-8 text-white flex items-center justify-between border-b-4 border-saffron/50">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-saffron rounded-2xl flex items-center justify-center text-navy shadow-lg">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-black">Physical Stock Audit (PST)</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Phase {phase} of 3: {phase === 1 ? 'Data Entry' : phase === 2 ? 'Discrepancy Verification' : 'Inventory Reconciliation'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><X /></button>
        </div>

        {/* Phase Indicator */}
        <div className="bg-cream/30 p-1 flex border-b border-border">
          {[1, 2, 3].map(p => (
            <div key={p} className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-widest transition-all ${phase === p ? 'bg-white text-navy shadow-sm rounded-xl' : 'text-muted'}`}>
              Phase {p}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-navy/5 text-navy/40 text-[9px] uppercase font-black tracking-widest sticky top-0 bg-white z-10">
              <tr>
                <th className="pl-10 py-5 text-left">Item Details</th>
                <th className="px-6 py-5 text-center">System Qty</th>
                <th className="px-6 py-5 text-center">Physical Qty</th>
                <th className="px-6 py-5 text-center">Variance</th>
                <th className="pr-10 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-mono text-xs">
              {items.map(item => {
                const variance = item.physicalQty - item.systemQty
                return (
                  <tr key={item.id} className="hover:bg-cream/10 transition-colors">
                    <td className="pl-10 py-5">
                      <div className="font-bold text-navy">{item.name}</div>
                      <div className="text-[9px] font-black text-muted uppercase tracking-tighter">{item.code}</div>
                    </td>
                    <td className="px-6 py-5 text-center font-black text-navy/40">{item.systemQty}</td>
                    <td className="px-6 py-5 text-center">
                      <input 
                        type="number" 
                        value={item.physicalQty}
                        onChange={(e) => updatePhysicalQty(item.id, parseInt(e.target.value) || 0)}
                        className="w-20 bg-white border-2 border-navy/5 rounded-xl px-2 py-2 text-center font-black text-navy focus:border-saffron outline-none"
                      />
                    </td>
                    <td className={`px-6 py-5 text-center font-black ${variance === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {variance > 0 ? `+${variance}` : variance}
                    </td>
                    <td className="pr-10 py-5 text-center">
                      {variance === 0 ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-8 bg-cream/20 border-t border-border flex items-center justify-between">
          <div className="flex gap-12">
            <div>
              <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Discrepancies Found</div>
              <div className="text-2xl font-serif font-black text-rose-500">{varianceCount} Items</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            {phase < 3 ? (
              <button 
                onClick={() => setPhase((phase + 1) as any)}
                className="bg-navy text-white px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest hover:bg-navy/90 transition-all uppercase shadow-xl"
              >
                Proceed to Phase {phase + 1}
              </button>
            ) : (
              <button 
                onClick={() => { alert('Inventory Adjusted Successfully!'); onClose() }}
                className="bg-saffron text-white px-12 py-5 rounded-[2rem] font-black text-xs tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3 uppercase"
              >
                <Save className="w-5 h-5" /> Reconcile & Post Audit
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
