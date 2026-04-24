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
import { Lock, Calculator, CheckCircle2, AlertTriangle, Printer, Send, Clock, Wallet, CreditCard, QrCode, Globe } from 'lucide-react'

interface DayEndProps {
  onClose: () => void
}

export default function DayEndModule({ onClose }: DayEndProps) {
  const [step, setStep] = useState<'REVIEW' | 'RECONCILE' | 'FINALIZE' | 'SYNC'>('REVIEW')
  const [cashCount, setCashCount] = useState<string>('')
  
  const systemSales = {
    cash: 42500,
    card: 31200,
    upi: 12400,
    cn: 1500,
    total: 87600
  }

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-navy uppercase">Shift Closure (Day-End)</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Cycle Date: 2026-04-24 | Status: Open</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 border-border hover:bg-cream transition-all"
          >
            Cancel
          </button>
           {['REVIEW', 'RECONCILE', 'FINALIZE', 'SYNC'].map((s) => (
             <div 
              key={s}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${step === s ? 'bg-navy text-white shadow-lg' : 'text-muted'}`}
             >
               {step === s && <Clock className="w-3 h-3" />} {s}
             </div>
           ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'REVIEW' && (
          <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { label: 'Total Invoices', value: '142', icon: Lock },
                  { label: 'Net Sales', value: '₹87,600', icon: Calculator },
                  { label: 'Returns', value: '₹3,200', icon: AlertTriangle },
                  { label: 'Open Slips', value: '2', icon: Clock }
                ].map((stat, i) => (
                  <div key={i} className="glass p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <stat.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-navy/5 group-hover:scale-110 transition-transform" />
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-2">{stat.label}</p>
                    <div className="text-3xl font-serif font-black text-navy">{stat.value}</div>
                  </div>
                ))}
             </div>

             <div className="glass rounded-[3rem] overflow-hidden shadow-2xl border border-white/20">
                <div className="bg-navy p-8 text-white flex justify-between items-center">
                   <div>
                     <h3 className="text-xl font-serif font-black">System Collection Summary</h3>
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Aggregated by Payment Mode</p>
                   </div>
                   <button className="bg-white/10 p-3 rounded-xl hover:bg-white/20"><Printer className="w-5 h-5" /></button>
                </div>
                <div className="p-10">
                   <div className="space-y-6">
                      {[
                        { label: 'Cash Collection', value: systemSales.cash, icon: Wallet, color: 'bg-emerald-50 text-emerald-600' },
                        { label: 'Card Settlements', value: systemSales.card, icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
                        { label: 'UPI / Digital', value: systemSales.upi, icon: QrCode, color: 'bg-indigo-50 text-indigo-600' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-cream/10 border border-border/30">
                           <div className="flex items-center gap-6">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}><item.icon className="w-6 h-6" /></div>
                              <span className="font-bold text-navy uppercase tracking-tighter">{item.label}</span>
                           </div>
                           <div className="text-2xl font-serif font-black text-navy">₹{item.value.toLocaleString()}</div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="p-10 bg-gold/10 border-t border-border flex justify-end">
                   <button 
                    onClick={() => setStep('RECONCILE')}
                    className="bg-navy text-white px-12 py-5 rounded-[2rem] font-black text-xs tracking-widest hover:bg-gold hover:text-navy transition-all shadow-xl flex items-center gap-3 uppercase"
                   >
                     Initiate Physical Count <Calculator className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </motion.div>
        )}

        {step === 'RECONCILE' && (
          <motion.div key="recon" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-10">
             <div className="glass p-12 rounded-[4rem] shadow-2xl text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-navy text-gold rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl">
                   <Wallet className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-serif font-black text-navy mb-4">Physical Cash Declaration</h2>
                <p className="text-sm text-muted max-w-lg mb-12 uppercase tracking-tighter font-bold leading-relaxed">Please count the physical currency in the register and declare the final amount. This will be reconciled against system sales for discrepancy auditing.</p>
                
                <div className="w-full max-w-md relative mb-12">
                   <span className="absolute left-10 top-1/2 -translate-y-1/2 text-5xl font-serif font-black text-navy/20">₹</span>
                   <input 
                    autoFocus
                    type="number"
                    value={cashCount}
                    onChange={(e) => setCashCount(e.target.value)}
                    placeholder={systemSales.cash.toString()}
                    className="w-full bg-cream/30 border-4 border-navy/5 rounded-[3rem] pl-20 pr-12 py-10 text-6xl font-serif font-black text-navy outline-none focus:border-gold transition-all text-center"
                   />
                </div>

                <div className="flex gap-4">
                   <button onClick={() => setStep('REVIEW')} className="px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-border hover:bg-cream transition-all">Back</button>
                   <button 
                    onClick={() => setStep('FINALIZE')}
                    className="bg-navy text-white px-16 py-5 rounded-[2rem] font-black text-xs tracking-widest shadow-2xl hover:scale-105 transition-all uppercase"
                   >
                     Verify Discrepancy
                   </button>
                </div>
             </div>
          </motion.div>
        )}

        {step === 'FINALIZE' && (
          <motion.div key="final" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
             <div className="glass p-12 rounded-[4rem] shadow-2xl border-4 border-emerald-500/20 flex flex-col md:flex-row gap-12 items-center">
                <div className="w-32 h-32 bg-emerald-500 text-white rounded-[3rem] flex items-center justify-center shrink-0 shadow-2xl animate-bounce">
                   <CheckCircle2 className="w-16 h-16" />
                </div>
                <div className="flex-1">
                   <h2 className="text-3xl font-serif font-black text-navy uppercase tracking-tight mb-2">Reconciliation Perfect</h2>
                   <p className="text-sm text-muted uppercase tracking-widest font-bold">Physical declaration matches system records. Ready for permanent closure.</p>
                </div>
                <div className="text-right">
                   <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Declared Value</div>
                   <div className="text-5xl font-serif font-black text-emerald-600">₹{parseFloat(cashCount).toLocaleString()}</div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-10 rounded-[3rem] space-y-6">
                   <h4 className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Permanent Actions</h4>
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm font-bold text-navy/60"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Void all open sales slips</div>
                      <div className="flex items-center gap-4 text-sm font-bold text-navy/60"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Freeze transaction ledger for 2026-04-24</div>
                      <div className="flex items-center gap-4 text-sm font-bold text-navy/60"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Generate E-Invoice compliance packets</div>
                   </div>
                </div>
                <div className="bg-navy p-12 rounded-[3rem] flex flex-col justify-center items-center text-center">
                   <h3 className="text-white text-2xl font-serif font-black mb-6">Authorize Day-End</h3>
                   <button 
                    onClick={() => setStep('SYNC')}
                    className="w-full bg-gold text-navy py-6 rounded-[2rem] font-black text-xs tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase"
                   >
                     CLOSE SESSION <Send className="w-5 h-5" />
                   </button>
                   <p className="text-[9px] text-white/40 mt-6 uppercase tracking-widest font-bold">Warning: This action cannot be undone.</p>
                </div>
             </div>
          </motion.div>
        )}

        {step === 'SYNC' && (
          <motion.div key="sync" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
             <div className="relative inline-block mb-12">
                <div className="w-48 h-48 border-8 border-gold/20 border-t-gold rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Globe className="w-16 h-16 text-navy animate-pulse" />
                </div>
             </div>
             <h2 className="text-4xl font-serif font-black text-navy mb-4">Pulsing to Head Office</h2>
             <p className="text-sm text-muted uppercase tracking-widest font-bold max-w-md mx-auto">The Sovereign Integration Server is uploading finalized sales packets to the corporate vault. Please do not close the browser.</p>
             <div className="mt-12 bg-navy/5 p-6 rounded-3xl max-w-sm mx-auto border border-border/50">
                <div className="text-[10px] font-mono text-left space-y-2 text-navy/60 uppercase">
                   <p>[04:26:42] Packing 142 Invoices...</p>
                   <p>[04:26:43] Encrypting Financial Ledger...</p>
                   <p>[04:26:44] Pulse Check: HO-SERVER-01 OK</p>
                   <p className="text-emerald-600 font-bold">[04:26:45] Syncing Part 1/1 ... 85%</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
