import React, { useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  Button 
} from '@/components/ui/SovereignUI';
import { usePaymentStore } from '@/modules/billing/stores/usePaymentStore';
import { useCartStore } from '@/modules/billing/stores/useCartStore';
import { CreditCard, Banknote, Smartphone, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * [SMRITI-OS] PaymentDialog Orchestrator (v1.2 Compliant)
 * 
 * [RULE R4-B] Absolute Focus Continuity: Must restore focus to search input on close.
 */
export const PaymentDialog = ({ onFinalize }: { onFinalize: () => void }) => {
  const { isOpen, closePayment, mode, setMode, tendered, setTendered } = usePaymentStore();
  const total = useCartStore(state => state.getCartTotal());
  const finalizeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management: When mode is selected, move focus to tender or finalize
  useEffect(() => {
    if (mode === 'CASH') {
      // Auto-focus tender input (to be implemented in CashTenderNode)
    } else if (mode) {
      finalizeButtonRef.current?.focus();
    }
  }, [mode]);

  const change = Math.max(0, tendered - total);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePayment()}>
      <DialogContent className="sm:max-w-[480px] bg-[#020617] border-white/10 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-white/[0.02] border-b border-white/5">
          <DialogTitle className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
            Settlement Orchestration
          </DialogTitle>
          <div className="mt-4">
            <div className="text-[10px] font-black text-[var(--gold)] uppercase mb-1">Total Payable</div>
            <div className="text-4xl font-mono font-black text-white">
              ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Mode Selection */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'CASH', icon: Banknote, label: 'Cash' },
              { id: 'CARD', icon: CreditCard, label: 'Card' },
              { id: 'UPI', icon: Smartphone, label: 'UPI' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                  mode === m.id 
                    ? "bg-[var(--gold)] border-transparent text-black" 
                    : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                )}
              >
                <m.icon size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Cash Settlement Details */}
          {mode === 'CASH' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Amount Tendered</label>
                <input 
                  type="number"
                  autoFocus
                  value={tendered || ''}
                  onChange={(e) => setTendered(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl text-right px-6 text-2xl font-mono font-black text-white focus:border-[var(--gold)]/50 focus:outline-none"
                />
              </div>
              
              {tendered > 0 && (
                <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Change Due</span>
                  <span className="text-xl font-mono font-black text-emerald-400">
                    ₹{change.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-white/[0.02] border-t border-white/5">
          <Button 
            ref={finalizeButtonRef}
            disabled={!mode || (mode === 'CASH' && tendered < total)}
            onClick={onFinalize}
            className={cn(
              "w-full h-14 rounded-xl font-black uppercase tracking-widest transition-all",
              mode && (mode !== 'CASH' || tendered >= total)
                ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed"
            )}
          >
            <CheckCircle2 size={20} className="mr-2" />
            Finalize Transaction (F10)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

PaymentDialog.displayName = 'PaymentDialog';
