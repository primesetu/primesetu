/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * Day-End Reconciliation (Shoper 9 SR435700 Parity)
 * Tesla Style Dashboard
 * ============================================================ */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Zap, 
  Clock, 
  CreditCard, 
  Banknote, 
  Smartphone,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';

interface DayEndModuleProps {
  onClose: () => void;
}

export default function DayEndModule({ onClose }: DayEndModuleProps) {
  const [step, setStep] = useState(1);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await api.billing.getDayEndSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch Day-End summary');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      await api.billing.finalizeDayEnd();
      setStep(3); // Success step
    } catch (err: any) {
      alert(err.message || 'Day-End Finalization Failed');
    } finally {
      setIsFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <RefreshCw className="w-10 h-10 text-brand-gold animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-navy/20">Aggregating Global Ledger...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* ── PROGRESS BAR (Tesla Style) ── */}
      <div className="h-2 flex w-full">
        <div className={`h-full transition-all duration-700 ${step >= 1 ? 'bg-brand-gold w-1/3' : 'bg-navy/5 w-1/3'}`} />
        <div className={`h-full transition-all duration-700 ${step >= 2 ? 'bg-brand-gold w-1/3' : 'bg-navy/5 w-1/3'}`} />
        <div className={`h-full transition-all duration-700 ${step >= 3 ? 'bg-brand-gold w-1/3' : 'bg-navy/5 w-1/3'}`} />
      </div>

      <div className="p-12 flex flex-col flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex justify-between items-start mb-12">
                <div>
                  <div className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mb-2">Protocol Step 01</div>
                  <h2 className="text-4xl font-black text-navy tracking-tighter" style={{ fontFamily: 'var(--font-tesla)' }}>Verification Hub</h2>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-navy/5 rounded-2xl border border-navy/5">
                  <Clock className="w-4 h-4 text-navy/40" />
                  <span className="text-xs font-black text-navy">{summary.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="tesla-card bg-navy text-white p-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Lock className="w-5 h-5 text-brand-gold" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Open Tills</span>
                  </div>
                  <div className="text-5xl font-black">{summary.open_tills_count}</div>
                  <p className="text-[9px] font-bold text-white/20 mt-4 uppercase tracking-widest leading-relaxed">
                    {summary.open_tills_count === 0 ? 'All terminals secured' : 'Requires manual closure'}
                  </p>
                </div>

                <div className="tesla-card bg-white p-10 border border-navy/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-indigo-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-navy/20">Pending Syncs</span>
                  </div>
                  <div className="text-5xl font-black text-navy">{summary.pending_syncs}</div>
                  <p className="text-[9px] font-bold text-navy/20 mt-4 uppercase tracking-widest leading-relaxed">
                    Data packets awaiting HO transmission
                  </p>
                </div>

                <div className="tesla-card bg-emerald-500 text-white p-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Ready State</span>
                  </div>
                  <div className="text-5xl font-black">{summary.can_close ? 'YES' : 'NO'}</div>
                  <p className="text-[9px] font-bold text-white/40 mt-4 uppercase tracking-widest leading-relaxed">
                    Sovereign validation checks passed
                  </p>
                </div>
              </div>

              <div className="flex-1 bg-navy/5 rounded-[3rem] p-12 border border-navy/5 relative overflow-hidden">
                <h3 className="text-xs font-black text-navy uppercase tracking-[0.3em] mb-8">Blocker Checklist</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className={summary.open_tills_count === 0 ? "text-emerald-500" : "text-navy/10"} />
                      <span className="text-sm font-black text-navy">All POS Terminals Closed</span>
                    </div>
                    {summary.open_tills_count > 0 && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Action Required</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className={summary.pending_syncs === 0 ? "text-emerald-500" : "text-navy/10"} />
                      <span className="text-sm font-black text-navy">Cloud Sync Completed</span>
                    </div>
                    {summary.pending_syncs > 0 && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Awaiting Pulse</span>}
                  </div>
                </div>
                
                <div className="absolute bottom-0 right-0 p-12">
                   <button 
                     disabled={!summary.can_close}
                     onClick={() => setStep(2)}
                     className="tesla-button group"
                   >
                     Continue to Summary <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex justify-between items-start mb-12">
                <div>
                  <div className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mb-2">Protocol Step 02</div>
                  <h2 className="text-4xl font-black text-navy tracking-tighter" style={{ fontFamily: 'var(--font-tesla)' }}>Sovereign Ledger Summary</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-1">
                <div className="space-y-8">
                  <div className="tesla-card bg-white p-12 border border-navy/5 h-full">
                    <h3 className="text-[10px] font-black text-navy/20 uppercase tracking-[0.4em] mb-10">Sales by Mode</h3>
                    <div className="space-y-6">
                      {Object.entries(summary.mode_totals).map(([mode, amt]: any) => (
                        <div key={mode} className="flex items-center justify-between py-4 border-b border-navy/5">
                           <div className="flex items-center gap-4">
                             {mode === 'CASH' ? <Banknote className="w-5 h-5 text-emerald-500" /> : 
                              mode === 'CARD' ? <CreditCard className="w-5 h-5 text-indigo-500" /> : 
                              <Smartphone className="w-5 h-5 text-brand-gold" />}
                             <span className="text-sm font-black text-navy uppercase tracking-widest">{mode}</span>
                           </div>
                           <span className="text-lg font-black text-navy">{formatCurrency(amt)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-12 pt-8 border-t-4 border-navy flex justify-between items-end">
                      <span className="text-[10px] font-black text-navy uppercase tracking-widest">Net Revenue</span>
                      <span className="text-4xl font-black text-navy">{formatCurrency(summary.total_sales_paise)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="tesla-card bg-amber-500 text-white p-12 relative overflow-hidden">
                     <AlertTriangle className="absolute -right-8 -top-8 w-40 h-40 text-white/10" />
                     <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6">Final Warning</h3>
                     <p className="text-sm font-bold leading-relaxed opacity-90 mb-8">
                       Executing Day-End will lock the current ledger. All operational dates will move forward. This action is recorded in the Sovereign Audit Log.
                     </p>
                     <div className="flex items-center gap-4 px-6 py-4 bg-white/10 rounded-2xl border border-white/10">
                        <ShieldCheck className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sovereign Encryption Active</span>
                     </div>
                  </div>

                  <div className="flex-1 flex items-end justify-between gap-6">
                    <button onClick={() => setStep(1)} className="tesla-button bg-navy/5 text-navy border-transparent flex-1">
                      Back to Verification
                    </button>
                    <button 
                      onClick={handleFinalize}
                      disabled={isFinalizing}
                      className="tesla-button bg-emerald-600 border-emerald-600 flex-[2] relative overflow-hidden"
                    >
                      {isFinalizing ? <RefreshCw className="animate-spin" /> : <Lock className="w-5 h-5" />}
                      EXECUTE DAY-END PROTOCOL
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-20"
            >
              <div className="w-32 h-32 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center mb-10 shadow-2xl shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 size={64} />
              </div>
              <h2 className="text-5xl font-black text-navy tracking-tighter mb-4" style={{ fontFamily: 'var(--font-tesla)' }}>
                Sovereign Seal Applied
              </h2>
              <p className="text-[11px] font-black text-navy/40 uppercase tracking-[0.4em] mb-12">
                Operational Day Secured · Ledger Locked · Next Cycle Initiated
              </p>
              
              <button onClick={onClose} className="tesla-button px-12">
                Return to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CLOSE BUTTON */}
      {step !== 3 && (
        <button 
          onClick={onClose}
          className="absolute top-10 right-10 w-12 h-12 rounded-full bg-navy/5 text-navy/40 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all z-50"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
