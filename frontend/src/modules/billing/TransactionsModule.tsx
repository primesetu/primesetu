/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, PackageX, Ticket, Search, CheckCircle2 } from 'lucide-react'
import { formatCurrency, formatDecimal } from '@/utils/currency'

export default function TransactionsModule() {
  const [activeTab, setActiveTab] = useState<'SALES_RETURN' | 'PURCHASE_RETURN' | 'CREDIT_NOTES'>('SALES_RETURN')
  const [searchInvoice, setSearchInvoice] = useState('')
  const [isFound, setIsFound] = useState(false)

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-navy uppercase">Returns & Credits</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Node: X01 | Sovereign Reversal Engine</p>
        </div>
        
        <div className="flex bg-navy/5 p-1 rounded-2xl border border-border/50">
          {[
            { id: 'SALES_RETURN', label: 'Sales Return', icon: RotateCcw },
            { id: 'PURCHASE_RETURN', label: 'Purchase Return', icon: PackageX },
            { id: 'CREDIT_NOTES', label: 'Credit Notes', icon: Ticket }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setIsFound(false) }}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-navy text-white shadow-lg' : 'text-muted hover:text-navy'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'SALES_RETURN' && (
          <motion.div key="sr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
            {/* Search Invoice */}
            <div className="glass p-12 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
               <div className="absolute top-0 right-0 p-12 opacity-5"><RotateCcw className="w-64 h-64" /></div>
               <div className="w-20 h-20 bg-navy text-gold rounded-[2rem] flex items-center justify-center mb-8 shadow-xl">
                  <Search className="w-10 h-10" />
               </div>
               <h2 className="text-3xl font-serif font-black text-navy mb-4">Original Sale Invoice Search</h2>
               <p className="text-sm text-muted max-w-md mb-10 leading-relaxed uppercase tracking-tighter font-bold">Please enter the invoice number or scan the barcode from the customer's bill to initiate the return process.</p>
               
               <div className="w-full max-w-xl flex gap-4">
                  <input 
                    type="text" 
                    value={searchInvoice}
                    onChange={(e) => setSearchInvoice(e.target.value)}
                    placeholder="INV NO / MOBILE NO (e.g. 98765...)"
                    className="flex-1 bg-cream/30 border-4 border-navy/5 rounded-[2rem] px-10 py-6 text-2xl font-black text-navy outline-none focus:border-gold transition-all"
                  />
                  <button 
                    onClick={() => setIsFound(true)}
                    className="bg-navy text-white px-10 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-gold hover:text-navy transition-all shadow-xl"
                  >
                    Fetch Bill
                  </button>
               </div>
            </div>

            {/* Found Invoice Preview */}
            {isFound && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-[3rem] overflow-hidden shadow-2xl border-2 border-emerald-500/20">
                <div className="bg-emerald-500 p-8 text-white flex justify-between items-center">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><CheckCircle2 className="w-7 h-7" /></div>
                      <div>
                        <div className="text-lg font-black uppercase tracking-tight">Invoice RET-10245 Verified</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Customer: J.R.M. | Date: 2026-04-24</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-[9px] font-black uppercase tracking-widest opacity-60">Bill Value</div>
                      <div className="text-3xl font-serif font-black">{formatCurrency(450000)}</div>
                   </div>
                </div>

                <div className="p-10">
                  <table className="w-full text-left">
                    <thead className="text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
                      <tr>
                        <th className="py-5">Item Details</th>
                        <th className="py-5 text-center">Original Qty</th>
                        <th className="py-5 text-center">Return Qty</th>
                        <th className="py-5 text-right">Refund Value</th>
                        <th className="py-5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { name: 'Puma RS-X Bold', size: '10', price: 249900 },
                        { name: 'Nexus Cotton Tee', size: 'L', price: 99900 }
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-cream/10 transition-colors">
                          <td className="py-6">
                            <div className="font-bold text-navy">{item.name}</div>
                            <div className="text-[10px] font-black text-muted uppercase tracking-tighter">Size: {item.size} | MRP: {formatCurrency(item.price)}</div>
                          </td>
                          <td className="py-6 text-center font-bold">1</td>
                          <td className="py-6 text-center">
                            <input type="number" defaultValue="1" className="w-16 bg-cream/50 border border-border rounded-lg px-2 py-1 text-center font-black" />
                          </td>
                          <td className="py-6 text-right font-black">{formatCurrency(item.price)}</td>
                          <td className="py-6 text-center">
                             <button className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-lg transition-all">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-10 bg-cream/10 border-t border-border flex items-center justify-between">
                   <div className="flex gap-10">
                      <div>
                        <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Return Items</div>
                        <div className="text-2xl font-serif font-black text-navy">2 Pcs</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Total Refund</div>
                        <div className="text-2xl font-serif font-black text-emerald-600">{formatCurrency(349800)}</div>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <button className="bg-navy text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-gold hover:text-navy transition-all">
                        <Ticket className="w-5 h-5" /> ISSUE CREDIT NOTE
                      </button>
                      <button className="bg-rose-500 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-rose-600 transition-all">
                        CASH REFUND
                      </button>
                   </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'CREDIT_NOTES' && (
          <motion.div key="cn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'Active Notes', value: '42', color: 'text-emerald-500' },
                  { label: 'Total Liability', value: formatCurrency(12400000), color: 'text-rose-500' },
                  { label: 'Expired (30d)', value: '12', color: 'text-muted' }
                ].map((stat, i) => (
                  <div key={i} className="glass p-10 rounded-[3rem] shadow-xl">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">{stat.label}</p>
                    <div className={`text-4xl font-serif font-black ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
             </div>

             <div className="glass rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="bg-navy px-10 py-6 flex items-center justify-between">
                   <h3 className="text-white font-serif font-black uppercase tracking-tight">Active Credit Note Register</h3>
                   <button className="bg-white/10 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all">Download Audit Log</button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-cream/30 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
                        <tr>
                          <th className="px-10 py-5">Note No</th>
                          <th className="px-6 py-5">Customer</th>
                          <th className="px-6 py-5">Issue Date</th>
                          <th className="px-6 py-5">Expiry Date</th>
                          <th className="px-6 py-5 text-right">Balance Value</th>
                          <th className="px-10 py-5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 font-mono text-xs">
                        {[
                          { no: 'CN-2026-001', cust: 'A.K. Sharma', date: '2026-04-01', exp: '2026-07-01', val: 120000, status: 'ACTIVE' },
                          { no: 'CN-2026-002', cust: 'Mehul Jani', date: '2026-04-12', exp: '2026-07-12', val: 45000, status: 'EXPIRED' }
                        ].map((cn, i) => (
                          <tr key={i} className="hover:bg-cream/5 transition-colors">
                            <td className="px-10 py-6 font-black text-navy">{cn.no}</td>
                            <td className="px-6 py-6 font-black text-navy/60">{cn.cust}</td>
                            <td className="px-6 py-6">{cn.date}</td>
                            <td className="px-6 py-6 text-rose-500/60">{cn.exp}</td>
                            <td className="px-6 py-6 text-right font-black text-navy text-lg">{formatCurrency(cn.val)}</td>
                            <td className="px-10 py-6 text-center">
                               <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${cn.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {cn.status}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
