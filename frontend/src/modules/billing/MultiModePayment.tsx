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
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, CreditCard, QrCode, Ticket, UserCheck, X, CheckCircle2, ChevronRight, Calculator } from 'lucide-react'

interface PaymentMode {
  id: string
  label: string
  icon: any
  amount: number
  refNo?: string
}

export default function MultiModePayment({ 
  totalAmount, 
  onClose, 
  onComplete 
}: { 
  totalAmount: number, 
  onClose: () => void, 
  onComplete: (payments: any[]) => void 
}) {
  const [payments, setPayments] = useState<PaymentMode[]>([
    { id: 'CASH', label: 'Cash', icon: Wallet, amount: 0 },
    { id: 'CARD', label: 'Credit/Debit Card', icon: CreditCard, amount: 0, refNo: '' },
    { id: 'UPI', label: 'UPI / QR', icon: QrCode, amount: 0, refNo: '' },
    { id: 'CN', label: 'Credit Note', icon: Ticket, amount: 0, refNo: '' },
    { id: 'ADVANCE', label: 'Advance Adjusted', icon: UserCheck, amount: 0, refNo: '' }
  ])

  const [activeMode, setActiveMode] = useState<string>('CASH')
  const [tempAmount, setTempAmount] = useState<string>('')

  const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0)
  const balanceAmount = totalAmount - paidAmount

  const handleAddPayment = () => {
    const val = parseFloat(tempAmount) || 0
    if (val <= 0) return

    setPayments(payments.map(p => p.id === activeMode ? { ...p, amount: p.amount + val } : p))
    setTempAmount('')
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 backdrop-blur-3xl bg-navy/80">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-5xl rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 h-[80vh]"
      >
        {/* Header */}
        <div className="bg-navy p-10 text-white flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-serif font-black text-gold">Final Settlement</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Multi-Mode Payment Gateway · PrimeSetu Node 01</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Total Bill Value</div>
            <div className="text-4xl font-serif font-black">₹{totalAmount.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Modes Sidebar */}
          <div className="w-80 bg-cream/30 border-r border-border p-8 flex flex-col gap-4">
             {payments.map((p) => (
               <button 
                key={p.id}
                onClick={() => setActiveMode(p.id)}
                className={`flex items-center gap-4 p-5 rounded-3xl transition-all border-2 ${activeMode === p.id ? 'bg-navy text-white border-gold shadow-xl' : 'bg-white border-transparent hover:border-navy/10'}`}
               >
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeMode === p.id ? 'bg-gold text-navy' : 'bg-navy/5 text-navy'}`}>
                    <p.icon className="w-5 h-5" />
                 </div>
                 <div className="text-left flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest">{p.label}</div>
                    <div className={`text-sm font-black ${p.amount > 0 ? (activeMode === p.id ? 'text-white' : 'text-emerald-600') : (activeMode === p.id ? 'text-white/40' : 'text-muted')}`}>
                      ₹{p.amount.toLocaleString()}
                    </div>
                 </div>
                 {p.amount > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
               </button>
             ))}

             <div className="mt-auto bg-navy/5 p-6 rounded-[2rem] border border-dashed border-navy/20">
                <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-2 text-center">Remaining Balance</div>
                <div className={`text-3xl font-serif font-black text-center ${balanceAmount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  ₹{Math.max(0, balanceAmount).toLocaleString()}
                </div>
             </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 p-12 flex flex-col bg-white relative">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-10 flex items-center gap-4">
                <div className="w-16 h-16 bg-navy text-gold rounded-3xl flex items-center justify-center">
                   {React.createElement(payments.find(p => p.id === activeMode)!.icon, { className: 'w-8 h-8' })}
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-black text-navy uppercase tracking-tight">{payments.find(p => p.id === activeMode)!.label}</h3>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">Enter amount to settle via this mode</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-4">Payment Amount</label>
                  <div className="relative">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-serif font-black text-navy/20">₹</span>
                    <input 
                      autoFocus
                      type="number" 
                      value={tempAmount}
                      onChange={(e) => setTempAmount(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPayment()}
                      placeholder={balanceAmount.toString()}
                      className="w-full bg-cream/30 border-4 border-navy/5 rounded-[2.5rem] pl-16 pr-10 py-10 text-5xl font-serif font-black text-navy outline-none focus:border-gold transition-all"
                    />
                  </div>
                </div>

                {(activeMode === 'CARD' || activeMode === 'UPI' || activeMode === 'CN') && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-4">Reference / Auth No</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 123456"
                      className="w-full bg-cream/30 border-2 border-navy/5 rounded-2xl px-8 py-5 text-lg font-black text-navy outline-none focus:border-gold transition-all"
                    />
                  </motion.div>
                )}

                <button 
                  onClick={handleAddPayment}
                  className="w-full bg-navy text-white py-8 rounded-[2rem] font-black text-xs tracking-widest hover:bg-gold hover:text-navy transition-all shadow-2xl flex items-center justify-center gap-4 group"
                >
                  ADD TO SETTLEMENT <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="absolute bottom-12 right-12 flex gap-4">
               <button onClick={() => setTempAmount(balanceAmount.toString())} className="bg-navy/5 hover:bg-navy/10 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Calculator className="w-4 h-4" /> Full Balance
               </button>
               <button onClick={() => setPayments(payments.map(p => ({ ...p, amount: 0 })))} className="bg-rose-50 text-rose-500 hover:bg-rose-100 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <X className="w-4 h-4" /> Reset All
               </button>
            </div>
          </div>
        </div>

        {/* Footer Settlement Action */}
        <div className="p-10 bg-gold text-navy flex items-center justify-between border-t-8 border-navy">
           <div className="flex gap-12">
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Total Settled</div>
                <div className="text-4xl font-serif font-black">₹{paidAmount.toLocaleString()}</div>
              </div>
              {paidAmount > totalAmount && (
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Change Return</div>
                  <div className="text-4xl font-serif font-black text-rose-600">₹{(paidAmount - totalAmount).toLocaleString()}</div>
                </div>
              )}
           </div>

           <div className="flex gap-4">
              <button onClick={onClose} className="px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-navy/20 hover:bg-navy/5 transition-all">Cancel</button>
              <button 
                onClick={() => onComplete(payments.filter(p => p.amount > 0))}
                disabled={paidAmount < totalAmount}
                className={`bg-navy text-white px-16 py-5 rounded-[2rem] font-black text-xs tracking-widest shadow-2xl transition-all flex items-center gap-3 uppercase ${paidAmount < totalAmount ? 'opacity-30' : 'hover:scale-105'}`}
              >
                <CheckCircle2 className="w-6 h-6" /> Complete & Print Invoice
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  )
}
