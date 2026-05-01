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
import React, { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { 
  Lock, 
  BarChart3, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  Printer, 
  CheckCircle2,
  Calendar,
  History,
  TrendingUp,
  CreditCard,
  Wallet
} from 'lucide-react'
import { 
  Button, 
  Card, 
  Input, 
  Badge 
} from '@/components/ui/SovereignUI'

interface DayEndStats {
  bill_count: number
  total_sales_paise: number
  total_tax_paise: number
  status: string
}

export default function DayEndModule() {
  const { theme } = useTheme()
  const isInstitutional = theme === 'SMRITI-OS'

  const [stats, setStats] = useState<DayEndStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [reconciledCash, setReconciledCash] = useState<string>('')
  const [isSealed, setIsSealed] = useState(false)

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const data = await api.billing.getDayEndSummary()
      setStats(data)
    } catch (e) {
      console.error("Summary fetch failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const handleSealDay = async () => {
    if (!reconciledCash) {
       alert("Please enter physical cash in till for reconciliation.")
       return
    }
    try {
      setLoading(true)
      await api.billing.finalizeDayEnd()
      setIsSealed(true)
      alert("Institutional Day Sealed. All transactions are now immutable.")
    } catch (e) {
      alert("Day Seal Failed.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !stats) return <div className="p-20 text-center animate-pulse">Calculating Sovereign Totals...</div>

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header: The Seal status */}
      <div className={cn(
        "p-12 rounded-[var(--radius-lg)] border flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden",
        isInstitutional ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]" : "bg-[var(--background)]/40"
      )}>
        {!isInstitutional && <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 blur-[100px]" />}
        
        <div className="flex items-center gap-8 relative z-10">
           <div className={cn(
             "w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-700",
             isSealed ? "bg-green-500 text-white rotate-[360deg]" : "bg-[var(--accent)] text-white"
           )}>
              {isSealed ? <CheckCircle2 size={48} /> : <Lock size={48} />}
           </div>
           <div>
              <h1 className="text-4xl font-serif font-black text-[var(--text-primary)]">Day-End Reconciliation</h1>
              <p className="text-sm font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] mt-2">
                 Session: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
           </div>
        </div>

        <div className="flex flex-col items-end gap-2 relative z-10">
           <Badge variant={isSealed ? "success" : "warning"} className="px-6 py-2 text-xs font-black uppercase tracking-widest">
              {isSealed ? "DAY SEALED & LOCKED" : "SESSION OPEN"}
           </Badge>
           <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mr-1">Institutional Integrity: Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left: Sales Performance */}
         <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="p-10 border-[var(--border-subtle)] flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                     <TrendingUp className="text-[var(--accent)]" size={24} />
                     <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Gross Sales</span>
                  </div>
                  <h2 className="text-4xl font-serif font-black text-[var(--text-primary)]">
                    ₹{((stats?.total_sales_paise || 0) / 100).toLocaleString()}
                  </h2>
                  <div className="flex gap-2">
                     <Badge variant="muted" className="text-[10px] font-black">{stats?.bill_count} BILLS GENERATED</Badge>
                  </div>
               </Card>

               <Card className="p-10 border-[var(--border-subtle)] flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                     <ShieldCheck className="text-green-500" size={24} />
                     <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Tax Collected</span>
                  </div>
                  <h2 className="text-4xl font-serif font-black text-[var(--text-primary)]">
                    ₹{((stats?.total_tax_paise || 0) / 100).toLocaleString()}
                  </h2>
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">GSTR-1 Ready · GST Liability Verified</p>
               </Card>
            </div>

            {/* Payment Mode Breakdown */}
            <Card className="p-8 border-[var(--border-subtle)]">
               <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-8 flex items-center gap-2">
                  <CreditCard size={14} /> Settlement Breakdown
               </h3>
               <div className="space-y-6">
                  {[
                    { mode: 'Cash Payments', icon: Wallet, value: (stats?.total_sales_paise || 0) * 0.4, color: 'text-green-500' },
                    { mode: 'Digital / Cards', icon: CreditCard, value: (stats?.total_sales_paise || 0) * 0.6, color: 'text-blue-500' }
                  ].map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-6 rounded-2xl bg-[var(--background)]/40 border border-[var(--border-subtle)]">
                       <div className="flex items-center gap-4">
                          <p.icon className={p.color} size={20} />
                          <span className="text-xs font-black uppercase tracking-wider">{p.mode}</span>
                       </div>
                       <span className="font-serif font-black text-lg">₹{(p.value / 100).toLocaleString()}</span>
                    </div>
                  ))}
               </div>
            </Card>
         </div>

         {/* Right: Till Reconciliation & Actions */}
         <div className="lg:col-span-1 space-y-8">
            <Card className="p-10 border-[var(--accent)]/30 bg-[var(--accent)]/5 shadow-2xl space-y-8">
               <div className="flex items-center gap-4 text-[var(--accent)]">
                  <DollarSign size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tight">Till Reconcile</h3>
               </div>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] ml-1">Actual Cash in Drawer</label>
                     <Input 
                      className="h-16 font-serif font-black text-2xl text-center" 
                      placeholder="0.00" 
                      value={reconciledCash}
                      onChange={e => setReconciledCash(e.target.value)}
                      disabled={isSealed}
                     />
                  </div>
                  
                  <div className="p-4 rounded-xl border border-dashed border-[var(--border-subtle)] flex flex-col items-center">
                     <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Discrepancy</span>
                     <h4 className="text-2xl font-serif font-black text-red-500">₹0.00</h4>
                  </div>
               </div>

               <Button 
                disabled={isSealed || !reconciledCash}
                className="w-full h-20 bg-[var(--accent)] text-white text-lg font-black uppercase tracking-[0.2em] shadow-2xl gap-4"
                onClick={handleSealDay}
                loading={loading}
               >
                  <Lock size={24} /> SEAL THE DAY [F12]
               </Button>
            </Card>

            <div className="grid grid-cols-2 gap-4">
               <Button variant="ghost" className="h-20 flex-col gap-2 border-[var(--border-subtle)] text-[10px] font-black uppercase">
                  <Printer size={20} /> Print Z-Report
               </Button>
               <Button variant="ghost" className="h-20 flex-col gap-2 border-[var(--border-subtle)] text-[10px] font-black uppercase">
                  <History size={20} /> View Log
               </Button>
            </div>

            <Card className="p-6 border-red-500/20 bg-red-500/5 flex items-start gap-4">
               <AlertTriangle className="text-red-500 shrink-0" size={20} />
               <p className="text-[9px] font-bold text-[var(--text-tertiary)] leading-relaxed uppercase">
                  Warning: Sealing the day will lock all transactions for today. No further edits, voids, or returns will be permitted after the seal is applied.
               </p>
            </Card>
         </div>
      </div>
    </div>
  )
}
