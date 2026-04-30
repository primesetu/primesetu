import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, CreditCard, QrCode, Ticket, UserCheck, X, CheckCircle2, ChevronRight, Calculator } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

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
  const { isInstitutional } = useTheme();
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
    <div className={cn(
      "fixed inset-0 z-[200] flex items-center justify-center p-8 backdrop-blur-3xl",
      isInstitutional ? "bg-black/20" : "bg-navy/80"
    )}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "w-full max-w-5xl shadow-2xl flex flex-col overflow-hidden border h-[80vh]",
          isInstitutional 
            ? "bg-white rounded-none border-border-default" 
            : "bg-bg-elevated rounded-[4rem] border-white/10"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-10 flex items-center justify-between",
          isInstitutional ? "bg-accent text-white" : "bg-bg-float text-text-primary"
        )}>
          <div>
            <h2 className={cn(
              "text-4xl font-black",
              isInstitutional ? "text-white uppercase" : "text-accent font-serif"
            )}>Final Settlement</h2>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest mt-1",
              isInstitutional ? "text-white/70" : "text-text-tertiary"
            )}>Payment Hub · SMRITI-OS Node 01</p>
          </div>
          <div className="text-right">
            <div className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-1",
              isInstitutional ? "text-white/70" : "text-text-tertiary"
            )}>Total Bill Value</div>
            <div className="text-4xl font-black">₹{totalAmount.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Modes Sidebar */}
          <div className={cn(
            "w-80 border-r p-8 flex flex-col gap-4",
            isInstitutional ? "bg-[#F5F5F5] border-border-subtle" : "bg-bg-base/30 border-border-subtle"
          )}>
             {payments.map((p) => (
               <button 
                key={p.id}
                onClick={() => setActiveMode(p.id)}
                className={cn(
                  "flex items-center gap-4 p-5 transition-all border-2",
                  isInstitutional ? "rounded-none" : "rounded-3xl",
                  activeMode === p.id 
                    ? (isInstitutional ? "bg-white border-accent text-accent shadow-sm" : "bg-accent text-bg-base border-accent shadow-xl")
                    : (isInstitutional ? "bg-transparent border-transparent hover:border-accent/20 text-text-primary" : "bg-bg-float border-transparent hover:border-accent/10 text-text-secondary")
                )}
               >
                 <div className={cn(
                   "w-10 h-10 rounded-xl flex items-center justify-center",
                   activeMode === p.id 
                     ? (isInstitutional ? "bg-accent text-white" : "bg-bg-base text-accent") 
                     : (isInstitutional ? "bg-accent/5 text-accent" : "bg-bg-base/40 text-text-tertiary")
                 )}>
                    <p.icon className="w-5 h-5" />
                 </div>
                 <div className="text-left flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest">{p.label}</div>
                    <div className={cn(
                      "text-sm font-black",
                      p.amount > 0 
                        ? (activeMode === p.id ? "text-current" : (isInstitutional ? "text-green-700" : "text-green-400")) 
                        : (activeMode === p.id ? "opacity-60" : "text-text-tertiary")
                    )}>
                      ₹{p.amount.toLocaleString()}
                    </div>
                 </div>
                 {p.amount > 0 && <CheckCircle2 className={cn("w-4 h-4", isInstitutional ? "text-green-600" : "text-green-400")} />}
               </button>
             ))}

             <div className={cn(
               "mt-auto p-6 border border-dashed",
               isInstitutional ? "bg-white border-accent/30 rounded-none" : "bg-bg-base/40 border-white/10 rounded-[2rem]"
             )}>
                <div className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-2 text-center">Remaining Balance</div>
                <div className={cn(
                  "text-3xl font-black text-center",
                  balanceAmount > 0 
                    ? (isInstitutional ? "text-red-600" : "text-red-400") 
                    : (isInstitutional ? "text-green-700" : "text-green-400")
                )}>
                  ₹{Math.max(0, balanceAmount).toLocaleString()}
                </div>
             </div>
          </div>

          {/* Input Area */}
          <div className={cn(
            "flex-1 p-12 flex flex-col relative",
            isInstitutional ? "bg-white" : "bg-bg-elevated"
          )}>
            <div className="max-w-md mx-auto w-full">
              <div className="mb-10 flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-3xl flex items-center justify-center",
                  isInstitutional ? "bg-accent text-white" : "bg-bg-float text-accent"
                )}>
                   {React.createElement(payments.find(p => p.id === activeMode)!.icon, { className: 'w-8 h-8' })}
                </div>
                <div>
                  <h3 className={cn(
                    "text-2xl font-black uppercase tracking-tight",
                    isInstitutional ? "text-accent" : "text-text-primary"
                  )}>{payments.find(p => p.id === activeMode)!.label}</h3>
                  <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Enter amount to settle via this mode</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block mb-4">Payment Amount</label>
                  <div className="relative">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-black opacity-20">₹</span>
                    <input 
                      autoFocus
                      type="number" 
                      value={tempAmount}
                      onChange={(e) => setTempAmount(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPayment()}
                      placeholder={balanceAmount.toString()}
                      className={cn(
                        "w-full border-4 rounded-[2.5rem] pl-16 pr-10 py-10 text-5xl font-black outline-none transition-all",
                        isInstitutional 
                          ? "bg-[#F9F9F9] border-accent/10 focus:border-accent text-accent rounded-none" 
                          : "bg-bg-base/40 border-white/5 focus:border-accent text-text-primary"
                      )}
                    />
                  </div>
                </div>

                {(activeMode === 'CARD' || activeMode === 'UPI' || activeMode === 'CN') && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block mb-4">Reference / Auth No</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 123456"
                      className={cn(
                        "w-full border-2 rounded-2xl px-8 py-5 text-lg font-black outline-none transition-all",
                        isInstitutional 
                          ? "bg-white border-border-default focus:border-accent text-text-primary rounded-none" 
                          : "bg-bg-base/40 border-white/10 focus:border-accent text-text-primary"
                      )}
                    />
                  </motion.div>
                )}

                <button 
                  onClick={handleAddPayment}
                  className={cn(
                    "w-full py-8 font-black text-xs tracking-widest transition-all shadow-2xl flex items-center justify-center gap-4 group",
                    isInstitutional 
                      ? "bg-accent text-white hover:bg-accent-dark rounded-none" 
                      : "bg-accent text-bg-base hover:opacity-90 rounded-[2rem]"
                  )}
                >
                  ADD TO SETTLEMENT <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="absolute bottom-12 right-12 flex gap-4">
               <button onClick={() => setTempAmount(balanceAmount.toString())} className={cn(
                 "p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors",
                 isInstitutional 
                  ? "bg-accent/5 hover:bg-accent/10 text-accent rounded-none border border-accent/20" 
                  : "bg-bg-float hover:bg-bg-overlay text-text-primary border border-white/5"
               )}>
                 <Calculator className="w-4 h-4" /> Full Balance
               </button>
               <button onClick={() => setPayments(payments.map(p => ({ ...p, amount: 0 })))} className={cn(
                 "p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors",
                 isInstitutional 
                  ? "bg-red-50 hover:bg-red-100 text-red-600 rounded-none border border-red-200" 
                  : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
               )}>
                 <X className="w-4 h-4" /> Reset All
               </button>
            </div>
          </div>
        </div>

        {/* Footer Settlement Action */}
        <div className={cn(
          "p-10 flex items-center justify-between border-t",
          isInstitutional 
            ? "bg-[#F0F1F1] text-text-primary border-accent border-t-4" 
            : "bg-bg-float text-text-primary border-white/10"
        )}>
           <div className="flex gap-12">
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Total Settled</div>
                <div className="text-4xl font-black">₹{paidAmount.toLocaleString()}</div>
              </div>
              {paidAmount > totalAmount && (
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Change Return</div>
                  <div className={cn(
                    "text-4xl font-black",
                    isInstitutional ? "text-red-700" : "text-red-400"
                  )}>₹{(paidAmount - totalAmount).toLocaleString()}</div>
                </div>
              )}
           </div>

           <div className="flex gap-4">
              <button onClick={onClose} className={cn(
                "px-10 py-5 font-black text-[10px] uppercase tracking-widest border-2 transition-all",
                isInstitutional 
                  ? "rounded-none border-border-default hover:bg-black/5" 
                  : "rounded-2xl border-white/10 hover:bg-white/5"
              )}>Cancel</button>
              <button 
                onClick={() => onComplete(payments.filter(p => p.amount > 0))}
                disabled={paidAmount < totalAmount}
                className={cn(
                  "px-16 py-5 font-black text-xs tracking-widest shadow-2xl transition-all flex items-center gap-3 uppercase",
                  isInstitutional ? "rounded-none" : "rounded-[2rem]",
                  paidAmount < totalAmount 
                    ? "opacity-30 cursor-not-allowed" 
                    : (isInstitutional ? "bg-accent text-white hover:bg-accent-dark" : "bg-accent text-bg-base hover:scale-105"),
                  paidAmount >= totalAmount && isInstitutional && "bg-green-700 hover:bg-green-800"
                )}
              >
                <CheckCircle2 className="w-6 h-6" /> Complete & Print Invoice
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  )
}




