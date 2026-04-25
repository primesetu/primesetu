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
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, AlertTriangle, Printer,
  Send, Clock, Wallet, CreditCard, QrCode, Globe, X,
  ArrowRight, Delete, TrendingUp, FileText, ShieldCheck,
  RotateCcw, ChevronRight
} from 'lucide-react'
import { toPaise, formatCurrency, toRupees } from '@/utils/currency'

interface DayEndProps {
  onClose: () => void
}

type Step = 'REVIEW' | 'RECONCILE' | 'FINALIZE' | 'SYNC'
const STEPS: Step[] = ['REVIEW', 'RECONCILE', 'FINALIZE', 'SYNC']
const STEP_LABELS: Record<Step, string> = {
  REVIEW: 'Review Sales',
  RECONCILE: 'Cash Count',
  FINALIZE: 'Verify',
  SYNC: 'HO Pulse',
}

// Realistic mock data in PAISE
const systemSales = {
  cash: 4250000,
  card: 3120000,
  upi: 1240000,
  cn: 150000,
  returns: 320000,
  invoices: 142,
  openSlips: 2,
  get total() { return this.cash + this.card + this.upi - this.cn }
}

const SYNC_LOGS = [
  { ms: 0,    text: 'Packing 142 invoices...', ok: false },
  { ms: 900,  text: 'Encrypting financial ledger...', ok: false },
  { ms: 1800, text: 'Connecting HO-SERVER-01...', ok: false },
  { ms: 2600, text: 'Pulse acknowledged ✓', ok: true },
  { ms: 3400, text: 'Uploading sales packets (1/2)...', ok: false },
  { ms: 4200, text: 'Uploading sales packets (2/2)...', ok: false },
  { ms: 5000, text: 'GST ledger synchronized ✓', ok: true },
  { ms: 5800, text: 'Session sealed. Store: X01-RET-01 ✓', ok: true },
]

export default function DayEndModule({ onClose }: DayEndProps) {
  const [step, setStep] = useState<Step>('REVIEW')
  const [cashCountRupees, setCashCountRupees] = useState('')
  const [syncLogs, setSyncLogs] = useState<typeof SYNC_LOGS>([])
  const [syncDone, setSyncDone] = useState(false)
  const [now, setNow] = useState(new Date())

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Enter key to advance steps
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (step === 'REVIEW') setStep('RECONCILE')
        if (step === 'RECONCILE' && cashCountRupees) setStep('FINALIZE')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [step, cashCountRupees])

  // Animated sync log
  const startSync = useCallback(() => {
    setStep('SYNC')
    setSyncLogs([])
    setSyncDone(false)
    SYNC_LOGS.forEach((log, i) => {
      setTimeout(() => {
        setSyncLogs(prev => [...prev, log])
        if (i === SYNC_LOGS.length - 1) setSyncDone(true)
      }, log.ms)
    })
  }, [])

  const variancePaise = cashCountRupees ? toPaise(cashCountRupees) - systemSales.cash : null
  const isMatch = variancePaise !== null && Math.abs(variancePaise) < 100 // 1 rupee tolerance
  const hasMismatch = variancePaise !== null && !isMatch

  const numpadPress = (v: string) => {
    if (v === 'DEL') { setCashCountRupees(p => p.slice(0, -1)); return }
    if (v === 'CLR') { setCashCountRupees(''); return }
    if (cashCountRupees.length >= 8) return
    setCashCountRupees(p => p + v)
  }

  const today = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="px-3 py-1 bg-navy text-amber-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-md">
              Day-End Protocol
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
              <Clock className="w-3 h-3" /> {timeStr}
            </div>
          </div>
          <h1 className="text-4xl font-serif font-black text-navy uppercase">Shift Closure</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">
            Cycle: {today} &nbsp;·&nbsp; Node: X01-RET-01 &nbsp;·&nbsp;
            <span className="text-amber-500">Status: Open</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Stepper */}
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const idx = STEPS.indexOf(step)
              const done = i < idx
              const active = s === step
              return (
                <div key={s} className="flex items-center">
                  <div className={`flex flex-col items-center transition-all`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all
                      ${done ? 'bg-emerald-500 border-emerald-500 text-white' :
                        active ? 'bg-navy border-navy text-white scale-110 shadow-lg' :
                        'bg-white border-border text-muted'}`}>
                      {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-[8px] font-black uppercase mt-1 tracking-tighter whitespace-nowrap
                      ${active ? 'text-navy' : done ? 'text-emerald-500' : 'text-muted/40'}`}>
                      {STEP_LABELS[s]}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 mb-4 transition-all ${done ? 'bg-emerald-400' : 'bg-border'}`} />
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={onClose}
            className="ml-4 w-9 h-9 flex items-center justify-center rounded-xl border-2 border-border hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-all text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Steps ── */}
      <AnimatePresence mode="wait">

        {/* STEP 1 — REVIEW */}
        {step === 'REVIEW' && (
          <motion.div key="review" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Invoices', value: systemSales.invoices, icon: FileText, color: 'text-navy', bg: 'bg-navy/5' },
                { label: 'Net Sales', value: formatCurrency(systemSales.total), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Returns', value: formatCurrency(systemSales.returns), icon: RotateCcw, color: 'text-rose-500', bg: 'bg-rose-50' },
                { label: 'Open Slips', value: systemSales.openSlips, icon: Clock, color: systemSales.openSlips > 0 ? 'text-amber-600' : 'text-muted', bg: systemSales.openSlips > 0 ? 'bg-amber-50' : 'bg-gray-50' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="glass p-6 rounded-[2rem] shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                  <div className={`text-2xl font-serif font-black ${stat.color}`}>{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Collections Summary */}
            <div className="glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20">
              <div className="bg-navy px-8 py-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-serif font-black">System Collection Summary</h3>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-0.5">Aggregated by Payment Mode</p>
                </div>
                <button onClick={() => window.print()}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                  <Printer className="w-4 h-4" /> Z-Report
                </button>
              </div>

              <div className="p-8 space-y-3">
                {[
                  { label: 'Cash', value: systemSales.cash, icon: Wallet, bar: 'bg-emerald-400', pct: (systemSales.cash / systemSales.total) * 100 },
                  { label: 'Card', value: systemSales.card, icon: CreditCard, bar: 'bg-blue-400', pct: (systemSales.card / systemSales.total) * 100 },
                  { label: 'UPI / Digital', value: systemSales.upi, icon: QrCode, bar: 'bg-indigo-400', pct: (systemSales.upi / systemSales.total) * 100 },
                  { label: 'Credit Notes', value: -systemSales.cn, icon: AlertTriangle, bar: 'bg-rose-400', pct: (systemSales.cn / systemSales.total) * 100 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-cream/30 transition-all">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50`}>
                      <item.icon className="w-4 h-4 text-navy/50" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-black text-navy uppercase tracking-tight">{item.label}</span>
                        <span className={`text-sm font-serif font-black ${item.value < 0 ? 'text-rose-500' : 'text-navy'}`}>
                          {item.value < 0 ? '-' : ''}{formatCurrency(Math.abs(item.value))}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                          className={`h-full ${item.bar} rounded-full`} />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center px-4 pt-4 border-t border-dashed border-border">
                  <span className="text-xs font-black text-muted uppercase tracking-widest">Net Collection</span>
                  <span className="text-2xl font-serif font-black text-navy">{formatCurrency(systemSales.total)}</span>
                </div>
              </div>

              <div className="px-8 py-5 bg-amber-50/50 border-t border-border/50 flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted">Press <kbd className="bg-white border border-border px-1.5 py-0.5 rounded text-navy font-black mx-1">Enter</kbd> to begin physical count</p>
                <button onClick={() => setStep('RECONCILE')}
                  className="bg-navy text-white px-10 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-amber-400 hover:text-navy transition-all shadow-lg flex items-center gap-2">
                  Begin Cash Count <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2 — RECONCILE */}
        {step === 'RECONCILE' && (
          <motion.div key="recon" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="max-w-3xl mx-auto w-full space-y-6">
            <div className="glass p-10 rounded-[3rem] shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-navy text-amber-400 rounded-[1.5rem] flex items-center justify-center shadow-xl">
                  <Wallet className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-black text-navy">Physical Cash Declaration</h2>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest">System expects: {formatCurrency(systemSales.cash)}</p>
                </div>
              </div>

              {/* Big display */}
              <div className="bg-navy/5 border-2 border-navy/10 rounded-3xl px-8 py-6 text-center mb-6 relative focus-within:border-amber-400 transition-all">
                <div className="text-[11px] font-black text-muted uppercase tracking-widest mb-1">Counted Cash Amount</div>
                <div className="text-6xl font-serif font-black text-navy min-h-[72px] flex items-center justify-center">
                  {cashCountRupees ? `₹${parseFloat(cashCountRupees).toLocaleString()}` : <span className="text-navy/20">₹ —</span>}
                </div>
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {['7','8','9','4','5','6','1','2','3','000','0','DEL'].map(k => (
                  <button key={k} onClick={() => numpadPress(k)}
                    className={`py-4 rounded-2xl text-lg font-black transition-all active:scale-95 shadow-sm
                      ${k === 'DEL' ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 col-span-1' :
                        k === '000' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                        'bg-white border border-border text-navy hover:bg-cream hover:border-amber-300'}`}>
                    {k === 'DEL' ? <Delete className="w-5 h-5 mx-auto" /> : k}
                  </button>
                ))}
              </div>

              {/* Quick-fill */}
              <div className="flex gap-2 mb-6 flex-wrap">
                <span className="text-[9px] font-black text-muted uppercase tracking-widest self-center">Quick fill:</span>
                {[40000, 42500, 45000, 50000].map(v => (
                  <button key={v} onClick={() => setCashCountRupees(v.toString())}
                    className="px-4 py-2 bg-white border border-border rounded-xl text-[11px] font-black text-navy hover:border-amber-400 hover:bg-amber-50 transition-all">
                    ₹{v.toLocaleString()}
                  </button>
                ))}
                <button onClick={() => setCashCountRupees(toRupees(systemSales.cash).toString())}
                  className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-black text-emerald-700 hover:bg-emerald-100 transition-all">
                  Exact Match
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('REVIEW')}
                  className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-border hover:bg-cream transition-all flex items-center gap-2">
                  ← Back
                </button>
                <button onClick={() => setStep('FINALIZE')} disabled={!cashCountRupees}
                  className="flex-1 bg-navy text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-amber-400 hover:text-navy transition-all shadow-xl disabled:opacity-30 flex items-center justify-center gap-2">
                  Verify Discrepancy <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3 — FINALIZE */}
        {step === 'FINALIZE' && (
          <motion.div key="final" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">

            {/* Variance Banner */}
            {isMatch ? (
              <div className="glass p-8 rounded-[2.5rem] shadow-2xl border-4 border-emerald-400/30 flex items-center gap-8">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-serif font-black text-emerald-600 mb-1">Reconciliation Perfect</h2>
                  <p className="text-xs text-muted font-bold uppercase tracking-widest">Physical count matches system records exactly.</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Declared</div>
                  <div className="text-4xl font-serif font-black text-emerald-600">{formatCurrency(toPaise(cashCountRupees))}</div>
                </div>
              </div>
            ) : (
              <div className="glass p-8 rounded-[2.5rem] shadow-2xl border-4 border-rose-400/30 flex items-center gap-8">
                <div className="w-20 h-20 bg-rose-500 text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-serif font-black text-rose-600 mb-1">
                    {variancePaise! > 0 ? 'Cash Surplus Detected' : 'Cash Deficit Detected'}
                  </h2>
                  <p className="text-xs text-rose-400/80 font-bold uppercase tracking-widest">
                    Variance of {formatCurrency(Math.abs(variancePaise!))} requires supervisor acknowledgment.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${variancePaise! > 0 ? 'text-amber-500' : 'text-rose-400'}`}>
                    {variancePaise! > 0 ? 'Surplus' : 'Deficit'}
                  </div>
                  <div className="text-4xl font-serif font-black text-rose-600">{formatCurrency(Math.abs(variancePaise!))}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Permanent Actions checklist */}
              <div className="glass p-8 rounded-[2.5rem] space-y-4">
                <h4 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Permanent Actions
                </h4>
                {[
                  'Void all open sales slips',
                  `Freeze transaction ledger for ${today}`,
                  'Generate E-Invoice compliance packets',
                  'Archive daily barcode print logs',
                ].map((action, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold text-navy/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {action}
                  </div>
                ))}
              </div>

              {/* Authorize */}
              <div className="bg-navy p-8 rounded-[2.5rem] flex flex-col justify-between">
                <div>
                  <h3 className="text-white text-xl font-serif font-black mb-2">Authorize Day-End</h3>
                  {hasMismatch && (
                    <div className="bg-rose-500/20 border border-rose-400/30 p-3 rounded-2xl mb-4">
                      <p className="text-[10px] text-rose-300 font-black uppercase tracking-widest">
                        ⚠ Mismatch acknowledged — supervisor override required
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <button onClick={startSync}
                    className="w-full bg-amber-400 text-navy py-5 rounded-[1.5rem] font-black text-[11px] tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase active:scale-95">
                    Close Session <Send className="w-4 h-4" />
                  </button>
                  <button onClick={() => setStep('RECONCILE')}
                    className="w-full bg-white/10 text-white/60 hover:text-white py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 uppercase">
                    ← Re-count Cash
                  </button>
                  <p className="text-[9px] text-white/30 text-center uppercase tracking-widest">This action cannot be undone</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4 — SYNC */}
        {step === 'SYNC' && (
          <motion.div key="sync" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto w-full">
            <div className="glass p-12 rounded-[3rem] shadow-2xl text-center">

              {/* Animated globe */}
              <div className="relative inline-block mb-8">
                {!syncDone ? (
                  <>
                    <div className="w-32 h-32 border-8 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Globe className="w-12 h-12 text-navy animate-pulse" />
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                    className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                    <CheckCircle2 className="w-16 h-16 text-white" />
                  </motion.div>
                )}
              </div>

              <h2 className="text-3xl font-serif font-black text-navy mb-2">
                {syncDone ? 'Session Sealed ✓' : 'Pulsing to Head Office'}
              </h2>
              <p className="text-xs text-muted font-bold uppercase tracking-widest mb-8">
                {syncDone ? `X01-RET-01 · ${today} · Archived` : 'Do not close this window'}
              </p>

              {/* Live log terminal */}
              <div className="bg-navy rounded-3xl p-6 text-left font-mono text-[11px] space-y-2 min-h-[160px]">
                {syncLogs.map((log, i) => (
                  <motion.p key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className={log.ok ? 'text-emerald-400 font-black' : 'text-white/50'}>
                    <span className="text-white/20 mr-2">[{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                    {log.text}
                  </motion.p>
                ))}
                {!syncDone && (
                  <p className="text-amber-400 animate-pulse">█ processing...</p>
                )}
              </div>

              {syncDone && (
                <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  onClick={onClose}
                  className="mt-8 w-full bg-navy text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-amber-400 hover:text-navy transition-all shadow-xl">
                  Return to Dashboard
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
