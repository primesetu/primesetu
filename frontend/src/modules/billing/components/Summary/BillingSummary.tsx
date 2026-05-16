import React, { useEffect } from 'react';
import { useCartStore } from '@/modules/billing/stores/useCartStore';
import { logger } from '@/core/observability/logger';

/**
 * [SMRITI-OS] BillingSummary Projector (v1.2 Compliant)
 * 
 * [RULE 4.7] Passive Observability: Component observes and projects state without mutation.
 * [RULE 6.A] Shoper9 field lineage (stockno, itemdesc, retail_price).
 */
export const BillingSummary = () => {
  const total = useCartStore(state => state.getCartTotal());
  const count = useCartStore(state => state.getCartCount());

  // [GOVERNANCE] Passive Tracing: Monitor summary state changes without orchestration side effects.
  useEffect(() => {
    if (count > 0) {
      logger.traceWorkflow('BILLING_SUMMARY', 'TOTALS_PROJECTED', { 
        module: 'BILLING',
        totalPayable: total,
        itemCount: count
      });
    }
  }, [total, count]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end border-b border-white/5 pb-4">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Items</div>
        <div className="text-xl font-mono font-black text-white">{count}</div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
          <span>Subtotal</span>
          <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
          <span>Tax (GST)</span>
          <span>₹0.00</span>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t-2 border-dashed border-white/10">
        <div className="text-[10px] font-black text-[var(--gold)] uppercase tracking-[0.3em] mb-1">Total Payable</div>
        <div className="text-4xl font-mono font-black text-white tracking-tighter">
          ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

BillingSummary.displayName = 'BillingSummary';
