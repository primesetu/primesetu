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
import { Scale, Plus, Save, X, Info } from 'lucide-react'

interface TaxSlab {
  min: number
  max: number
  rate: number
}

interface TaxRate {
  id: string
  name: string
  hsn: string
  slabs: TaxSlab[]
}

export default function TaxMaster({ onClose }: { onClose: () => void }) {
  const [taxes, setTaxes] = useState<TaxRate[]>([
    { id: '1', name: 'GST Footwear', hsn: '6403', slabs: [{ min: 0, max: 999, rate: 5 }, { min: 1000, max: 99999, rate: 12 }] },
    { id: '2', name: 'GST Apparel', hsn: '6203', slabs: [{ min: 0, max: 999, rate: 5 }, { min: 1000, max: 99999, rate: 12 }] },
    { id: '3', name: 'Standard GST', hsn: '0000', slabs: [{ min: 0, max: 999999, rate: 18 }] },
  ])

  const addSlab = (taxId: string) => {
    setTaxes(taxes.map(t => t.id === taxId ? { ...t, slabs: [...t.slabs, { min: 0, max: 0, rate: 0 }] } : t))
  }

  const updateSlab = (taxId: string, idx: number, field: keyof TaxSlab, value: number) => {
    setTaxes(taxes.map(t => {
      if (t.id === taxId) {
        const newSlabs = [...t.slabs]
        newSlabs[idx] = { ...newSlabs[idx], [field]: value }
        return { ...t, slabs: newSlabs }
      }
      return t
    }))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-xl bg-navy/40">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-5xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/20"
      >
        {/* Header */}
        <div className="bg-navy p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-black">Tax Master</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">GST Slab Configuration · Shoper 9 Compliance</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><X /></button>
        </div>

        <div className="flex-1 overflow-auto p-12 space-y-10 bg-cream/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-black text-navy">Active Tax Groups</h3>
            <button className="bg-navy text-white px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest hover:bg-navy/90 transition-all shadow-xl">
              + ADD NEW TAX GROUP
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {taxes.map(tax => (
              <div key={tax.id} className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                <div className="p-8 bg-cream/30 border-b border-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-4">
                      <h4 className="text-lg font-black text-navy">{tax.name}</h4>
                      <span className="px-3 py-1 bg-navy text-white rounded-lg text-[9px] font-black tracking-widest uppercase">HSN: {tax.hsn}</span>
                    </div>
                    <p className="text-[10px] text-muted font-bold uppercase mt-1">Multi-Slab Pricing Logic Enabled</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="text-[10px] font-black text-navy/40 hover:text-rose-500 transition-all uppercase tracking-widest">Delete</button>
                    <button className="text-[10px] font-black text-navy uppercase tracking-widest">Edit Layout</button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-3 gap-6 mb-4 text-[9px] font-black text-muted uppercase tracking-widest px-4">
                    <div>Price Range (Min)</div>
                    <div>Price Range (Max)</div>
                    <div className="text-center">Tax Rate (%)</div>
                  </div>
                  <div className="space-y-4">
                    {tax.slabs.map((slab, i) => (
                      <div key={i} className="grid grid-cols-3 gap-6 bg-cream/20 p-4 rounded-2xl border border-transparent hover:border-navy/10 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-navy/40">₹</span>
                          <input 
                            type="number" 
                            value={slab.min} 
                            onChange={(e) => updateSlab(tax.id, i, 'min', Number(e.target.value))}
                            className="w-full bg-white border border-border rounded-xl px-4 py-2 text-xs font-black text-navy outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-navy/40">₹</span>
                          <input 
                            type="number" 
                            value={slab.max} 
                            onChange={(e) => updateSlab(tax.id, i, 'max', Number(e.target.value))}
                            className="w-full bg-white border border-border rounded-xl px-4 py-2 text-xs font-black text-navy outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-4">
                          <input 
                            type="number" 
                            value={slab.rate} 
                            onChange={(e) => updateSlab(tax.id, i, 'rate', Number(e.target.value))}
                            className="w-16 bg-white border border-border rounded-xl px-4 py-2 text-xs font-black text-emerald-600 text-center outline-none"
                          />
                          <span className="text-xs font-black text-navy/40">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => addSlab(tax.id)}
                    className="mt-6 flex items-center gap-2 text-[10px] font-black text-navy/60 hover:text-navy uppercase tracking-widest"
                  >
                    <Plus className="w-4 h-4" /> Add Price Slab
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-8 bg-[#FAF7F2] border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3 text-rose-500">
            <Info className="w-5 h-5" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Pricing-based slabs are processed during real-time checkout.</p>
          </div>
          <button 
            onClick={onClose}
            className="bg-navy text-white px-12 py-5 rounded-[2rem] font-black text-xs tracking-widest shadow-2xl hover:bg-navy/90 transition-all flex items-center gap-3"
          >
            <Save className="w-4 h-4 text-gold" /> SAVE TAX CONFIGURATION
          </button>
        </div>
      </motion.div>
    </div>
  )
}
