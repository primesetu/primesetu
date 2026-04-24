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
import { FilePlus, ShoppingBag, Landmark, Plus, Trash2, Save, Printer } from 'lucide-react'

export default function ProcurementModule() {
  const [activeTab, setActiveTab] = useState<'PURCHASE_ORDER' | 'PURCHASE' | 'ADVANCE'>('PURCHASE_ORDER')
  const [items, setItems] = useState<any[]>([])

  const addItem = () => {
    setItems([...items, { id: Math.random(), artNo: 'PUMA-RSX', qty: 12, cost: 1200 }])
  }

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Navigation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-navy uppercase">Procurement & Advances</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Vendor Relations & Customer Deposits</p>
        </div>
        
        <div className="flex bg-navy/5 p-1 rounded-2xl border border-border/50">
          {[
            { id: 'PURCHASE_ORDER', label: 'Purchase Order', icon: FilePlus },
            { id: 'PURCHASE', label: 'Purchase (Inward)', icon: ShoppingBag },
            { id: 'ADVANCE', label: 'Customer Advance', icon: Landmark }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-navy text-white shadow-lg' : 'text-muted hover:text-navy'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'PURCHASE_ORDER' && (
          <motion.div key="po" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            {/* PO Form */}
            <div className="glass rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
               <div className="bg-navy p-10 text-white flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-navy shadow-lg"><FilePlus className="w-8 h-8" /></div>
                    <div>
                      <h2 className="text-2xl font-serif font-black">Generate Purchase Order</h2>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Document Ref: PO-2026-{Math.floor(Math.random()*1000)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-all"><Printer className="w-5 h-5" /></button>
                    <button className="bg-gold text-navy px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"><Save className="w-4 h-4" /> Save PO</button>
                  </div>
               </div>

               <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8 bg-cream/30 border-b border-border">
                  <div>
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">Vendor Selection</label>
                    <select className="w-full bg-white border border-border rounded-xl px-5 py-4 text-xs font-bold text-navy outline-none focus:border-gold transition-all">
                       <option>Select Vendor...</option>
                       <option>Nexus Lifestyle Pvt Ltd</option>
                       <option>Citywalk International</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">Expected Delivery</label>
                    <input type="date" className="w-full bg-white border border-border rounded-xl px-5 py-4 text-xs font-bold text-navy outline-none focus:border-gold transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">Store Node</label>
                    <input type="text" value="X01 - Main Mall" readOnly className="w-full bg-navy/5 border border-border rounded-xl px-5 py-4 text-xs font-bold text-navy outline-none" />
                  </div>
               </div>

               <div className="p-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-serif font-black text-navy uppercase tracking-tight">Order Items</h3>
                    <button onClick={addItem} className="bg-navy text-white px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-gold hover:text-navy transition-all">
                       <Plus className="w-4 h-4" /> Add Style
                    </button>
                  </div>

                  <table className="w-full text-left">
                    <thead className="text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
                      <tr>
                        <th className="py-5">Art No / Design</th>
                        <th className="py-5 text-center">Current Stock</th>
                        <th className="py-5 text-center">Order Qty</th>
                        <th className="py-5 text-right">Est. Cost</th>
                        <th className="py-5 text-right">Subtotal</th>
                        <th className="py-5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {items.map((item, i) => (
                        <tr key={i} className="hover:bg-cream/10 transition-colors">
                          <td className="py-6">
                            <div className="font-bold text-navy">{item.artNo}</div>
                            <div className="text-[10px] font-black text-muted uppercase tracking-tighter">Footwear · Nexus Collection</div>
                          </td>
                          <td className="py-6 text-center text-rose-500 font-black">2</td>
                          <td className="py-6 text-center">
                            <input type="number" defaultValue={item.qty} className="w-16 bg-cream/50 border border-border rounded-lg px-2 py-1 text-center font-black" />
                          </td>
                          <td className="py-6 text-right font-bold">₹{item.cost}</td>
                          <td className="py-6 text-right font-black">₹{item.qty * item.cost}</td>
                          <td className="py-6 text-center">
                             <button onClick={() => setItems(items.filter(it => it.id !== item.id))} className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'ADVANCE' && (
          <motion.div key="adv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
             <div className="glass p-12 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12 items-center">
                <div className="w-32 h-32 bg-navy text-gold rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-2xl">
                   <Landmark className="w-16 h-16" />
                </div>
                <div className="flex-1">
                   <h2 className="text-3xl font-serif font-black text-navy uppercase tracking-tight mb-2">Customer Advance Receipt</h2>
                   <p className="text-sm text-muted uppercase tracking-widest font-bold">Issue deposit receipts for pre-orders or special services.</p>
                </div>
                <button className="bg-gold text-navy px-12 py-6 rounded-[2rem] font-black text-xs tracking-widest hover:scale-105 shadow-2xl transition-all uppercase">New Advance Entry</button>
             </div>

             <div className="glass rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="bg-navy px-10 py-6 text-white flex justify-between items-center">
                   <h3 className="font-serif font-black uppercase tracking-tight">Recent Advance Deposits</h3>
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sovereign Ledger Parity</span>
                </div>
                <table className="w-full text-left">
                   <thead className="bg-cream/30 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
                     <tr>
                       <th className="px-10 py-5">Receipt No</th>
                       <th className="px-6 py-5">Customer Name</th>
                       <th className="px-6 py-5">Phone No</th>
                       <th className="px-6 py-5">Purpose</th>
                       <th className="px-6 py-5 text-right">Deposit Amount</th>
                       <th className="px-10 py-5 text-center">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/50 font-mono text-xs">
                     {[
                       { no: 'ADV-5001', name: 'Rohan Mehta', phone: '+91 98XXX XXX01', purpose: 'Pre-order Puma RS-X', val: 5000 },
                       { no: 'ADV-5002', name: 'S. K. Gupta', phone: '+91 91XXX XXX42', purpose: 'Custom Fitting Deposit', val: 1500 }
                     ].map((adv, i) => (
                       <tr key={i} className="hover:bg-cream/5 transition-colors">
                         <td className="px-10 py-6 font-black text-navy">{adv.no}</td>
                         <td className="px-6 py-6 font-black text-navy/60 uppercase">{adv.name}</td>
                         <td className="px-6 py-6">{adv.phone}</td>
                         <td className="px-6 py-6 italic text-muted">{adv.purpose}</td>
                         <td className="px-6 py-6 text-right font-black text-emerald-600 text-lg">₹{adv.val.toLocaleString()}</td>
                         <td className="px-10 py-6 text-center">
                            <button className="bg-navy text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gold hover:text-navy transition-all">Print Receipt</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
