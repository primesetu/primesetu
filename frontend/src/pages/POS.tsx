import React, { useRef, useEffect, useCallback } from 'react';
import { useCartStore } from '@/modules/billing/stores/useCartStore';
import { usePaymentStore } from '@/modules/billing/stores/usePaymentStore';
import { ProductSearch } from '@/modules/billing/components/Search/ProductSearch';
import { CartTable } from '@/modules/billing/components/Cart/CartTable';
import { BillingSummary } from '@/modules/billing/components/Summary/BillingSummary';
import { PaymentDialog } from '@/modules/billing/components/Payment/PaymentDialog';
import { ShortcutHandler } from '@/modules/billing/components/Interaction/ShortcutHandler';
import { logger } from '@/core/observability/logger';

/**
 * [SMRITI-OS] POS Orchestrator (v1.2 Compliant)
 * 
 * [RULE R4-B] Centralizes focus orchestration for barcode/keyboard workflows.
 * [RULE R6-A] Preserves Shoper9 semantic data lineage.
 * [RULE R5-C] Integrated PaymentWorkflow atomization.
 */
const POS: React.FC = () => {
  const searchRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore(state => state.addItem);
  const clearCart = useCartStore(state => state.clearCart);
  const itemsCount = useCartStore(state => state.items.length);
  
  // Payment Orchestration
  const { openPayment, reset: resetPayment } = usePaymentStore();

  // Focus Restoration Strategy: Ensures the scanner is always active.
  const restoreFocus = useCallback(() => {
    // [RULE R4-B] Ensure focus returns to scanner unless modal is open.
    if (!usePaymentStore.getState().isOpen) {
      searchRef.current?.focus();
    }
  }, []);

  // Restore focus on mount and whenever the cart size changes (e.g., after an add).
  useEffect(() => {
    restoreFocus();
  }, [itemsCount, restoreFocus]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = searchRef.current?.value;
    if (!barcode) return;

    /**
     * [RULE R6-A] Operational Data Mapping.
     * Binding scan results to Shoper9 legacy fields: stockno, itemdesc, retail_price.
     */
    const mockItem = {
      stockno: barcode,
      itemdesc: `SCANNED ITEM - ${barcode}`,
      retail_price: 1299.00,
      brand: 'SMRITI',
      image_url: ''
    };

    addItem(mockItem);
    
    // Reset state and restore focus immediately to allow sequential scanning.
    if (searchRef.current) searchRef.current.value = '';
    restoreFocus();
  };

  const handleFinalize = () => {
    logger.traceWorkflow('BILLING_SETTLEMENT', 'FINALIZATION_COMMITTED', { module: 'BILLING' });
    clearCart();
    resetPayment();
    restoreFocus();
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-hidden bg-[#020617] text-white">
      {/* [RULE 4.8] Deterministic Shortcut Ownership Layer */}
      <ShortcutHandler />
      {/* Search & Entry Node (Focus Controlled) */}
      <form onSubmit={handleScan}>
        <ProductSearch 
          ref={searchRef} 
          placeholder="SCAN ITEM OR ENTER CODE (F2)..."
        />
      </form>

      {/* Operational Workspace */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Cart Rendering Node (Isolated Performance) */}
        <div className="flex-[2] flex flex-col min-h-0">
          <CartTable />
        </div>

        {/* Totals & Settlement Node */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-[#0f172a]/40 rounded-2xl border border-white/5 p-6 flex-1 shadow-2xl">
             <BillingSummary />
          </div>
          
          {/* Cashier Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={clearCart}
               className="h-12 bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-500 transition-all rounded-xl"
             >
               Clear (F12)
             </button>
             <button 
               onClick={openPayment}
               className="h-12 bg-[var(--gold)] text-black font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] shadow-[0_0_30px_rgba(234,179,8,0.1)] transition-all rounded-xl"
             >
               Settle (F10)
             </button>
          </div>
        </div>
      </div>
      
      {/* Terminal Metadata Footer */}
      <div className="flex items-center justify-between px-2 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
         <div className="flex items-center gap-4">
           <span>REG: #01</span>
           <span className="text-slate-700">|</span>
           <span>CASHIER: ADM</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
           <span>SOVEREIGN NODE ONLINE</span>
         </div>
      </div>

      {/* [RULE R5-C] Payment Atomization Orchestrator */}
      <PaymentDialog onFinalize={handleFinalize} />
    </div>
  );
};

export default POS;
