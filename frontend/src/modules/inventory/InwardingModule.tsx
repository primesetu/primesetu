/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PackagePlus, ClipboardList, Save, X, Trash2, Search } from 'lucide-react'
import { api } from '@/api/client'

interface SizeQty {
  size: string
  qty: number
}

interface InwardItem {
  id: string
  stockno: string
  name: string
  brand: string
  cost: number
  mrp: number
  sizes: SizeQty[]
}

export default function InwardingModule({ onClose }: { onClose: () => void }) {
  const [vendors, setVendors] = useState<any[]>([])
  const [selectedVendor, setSelectedVendor] = useState('')
  const [billNo, setBillNo] = useState('')
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0])
  
  const [items, setItems] = useState<InwardItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [activeArtNo, setActiveArtNo] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  const defaultSizes = ['6', '7', '8', '9', '10', '11']

  useEffect(() => {
    api.purchase.getVendors().then(setVendors)
  }, [])

  const addArtNo = async () => {
    if (!activeArtNo) return
    setIsSearching(true)
    try {
      const searchResults = await api.inventory.search(activeArtNo)
      if (searchResults && searchResults.length > 0) {
        const product = searchResults[0]
        const newItem: InwardItem = {
          id: Math.random().toString(36),
          stockno: product.stockno,
          name: product.itemdesc,
          brand: product.brand_name || 'Generic',
          cost: product.cost_price || 0,
          mrp: product.retail_price || 0,
          sizes: defaultSizes.map(s => ({ size: s, qty: 0 }))
        }
        setItems([newItem, ...items])
      } else {
        alert("Art No not found in Item Master!")
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
      setActiveArtNo('')
    }
  }

  const handlePost = async () => {
    if (!selectedVendor || !billNo || items.length === 0) {
      alert("Please fill Vendor, Bill No and add at least one item.")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        vendor_code: selectedVendor,
        bill_no: billNo,
        bill_date: billDate,
        items: items.map(item => ({
          stockno: item.stockno,
          qty: item.sizes.reduce((acc, s) => acc + s.qty, 0),
          rate: item.cost,
          mrp: item.mrp
        })).filter(i => i.qty > 0)
      }

      if (payload.items.length === 0) {
        alert("Enter quantities for at least one size!")
        setIsSaving(false)
        return
      }

      const res = await api.purchase.finalizeGRN(payload)
      alert(`GI Successfully Posted! GRN No: ${res.grn_no}`)
      onClose()
    } catch (error) {
      console.error("Post failed:", error)
      alert("Failed to post Inward. Check console.")
    } finally {
      setIsSaving(false)
    }
  }

  const updateSizeQty = (itemId: string, size: string, qty: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          sizes: item.sizes.map(s => s.size === size ? { ...s, qty } : s)
        }
      }
      return item
    }))
  }

  const totalQty = items.reduce((acc, item) => acc + item.sizes.reduce((sAcc, s) => sAcc + s.qty, 0), 0)
  const totalCost = items.reduce((acc, item) => acc + (item.sizes.reduce((sAcc, s) => sAcc + s.qty, 0) * item.cost), 0)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-xl bg-navy/40">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-7xl h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/20"
      >
        {/* Header */}
        <div className="bg-navy p-8 text-white flex items-center justify-between border-b-4 border-gold/30">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <PackagePlus className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-black">Goods Inwards (Sizewise GI)</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Node: WH1 | Mode: SMRITI High-Fidelity Entry</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-black/20 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/60">
              [F2] Add Art No | [F10] Save
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><X /></button>
          </div>
        </div>

        {/* Master Info */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-cream/30 border-b border-border">
          <div className="md:col-span-3">
            <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-2">Vendor / Supplier</label>
            <select 
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full bg-white border border-border rounded-xl px-5 py-4 text-xs font-bold text-navy outline-none focus:border-gold transition-all shadow-sm"
            >
              <option value="">Select Vendor...</option>
              {vendors.map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-2">Invoice / Doc No</label>
            <input 
              type="text" 
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              placeholder="INV-001" 
              className="w-full bg-white border border-border rounded-xl px-5 py-4 text-xs font-bold text-navy outline-none focus:border-gold transition-all shadow-sm" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-2">Invoice Date</label>
            <input 
              type="date" 
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="w-full bg-white border border-border rounded-xl px-5 py-4 text-xs font-bold text-navy outline-none focus:border-gold transition-all shadow-sm" 
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-2">Enter Art No / Design No</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={activeArtNo}
                onChange={(e) => setActiveArtNo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addArtNo()}
                placeholder={isSearching ? "Searching..." : "TYPE ART NO..."}
                disabled={isSearching}
                className="flex-1 bg-white border-2 border-navy/5 rounded-xl px-6 py-4 text-sm font-black text-navy outline-none focus:border-gold transition-all uppercase placeholder:text-navy/20" 
              />
              <button onClick={addArtNo} className="bg-navy text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="md:col-span-2 flex items-end justify-end">
             <div className="text-right">
                <div className="text-[9px] font-black text-muted uppercase tracking-widest">Total Qty</div>
                <div className="text-3xl font-serif font-black text-navy">{totalQty} <span className="text-sm font-sans text-muted">Pcs</span></div>
             </div>
          </div>
        </div>

        {/* Sizewise Entry Grid */}
        <div className="flex-1 overflow-auto p-8 bg-white">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <ClipboardList className="w-24 h-24 mb-6" />
              <h3 className="text-3xl font-serif font-black text-navy">Ready for Inwarding</h3>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] mt-2">Enter an Art No to start size-wise distribution</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="bg-cream/20 border-2 border-navy/5 rounded-[2rem] p-8 hover:border-gold/30 transition-all group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-navy text-gold rounded-2xl flex items-center justify-center font-serif text-xl font-black shadow-lg">
                        {item.stockno[0]}
                      </div>
                      <div>
                        <div className="text-lg font-black text-navy uppercase tracking-tight">{item.stockno} - {item.name}</div>
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest">Brand: {item.brand} | Cost: ₹{item.cost} | MRP: ₹{item.mrp}</div>
                      </div>
                    </div>
                    <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-3 hover:bg-rose-50 rounded-xl">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-4">
                    {item.sizes.map((s) => (
                      <div key={s.size} className="bg-white rounded-2xl p-4 border border-navy/5 shadow-sm focus-within:border-gold transition-all">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 text-center">Size {s.size}</div>
                        <input 
                          type="number"
                          value={s.qty || ''}
                          onChange={(e) => updateSizeQty(item.id, s.size, parseInt(e.target.value) || 0)}
                          className="w-full text-center text-xl font-black text-navy outline-none bg-transparent"
                          placeholder="0"
                        />
                      </div>
                    ))}
                    <div className="flex flex-col justify-center pl-6 border-l border-navy/5">
                      <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Subtotal</div>
                      <div className="text-2xl font-serif font-black text-navy">
                        {item.sizes.reduce((acc, s) => acc + s.qty, 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-navy text-white flex items-center justify-between">
          <div className="flex gap-12">
            <div>
              <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Consolidated Value</div>
              <div className="text-3xl font-serif font-black text-gold">₹{totalCost.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-5 rounded-2xl font-black text-[10px] tracking-widest transition-all uppercase">
              Draft Save
            </button>
            <button 
              onClick={handlePost}
              disabled={isSaving}
              className="bg-gold text-navy px-12 py-5 rounded-[2rem] font-black text-xs tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3 uppercase"
            >
              <Save className="w-5 h-5" /> {isSaving ? 'Posting...' : 'Post Inward (GI) [F10]'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
