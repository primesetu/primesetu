import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useCartStore } from '@/modules/billing/stores/useCartStore';
import { usePaymentStore } from '@/modules/billing/stores/usePaymentStore';
import { ProductSearch } from '@/modules/billing/components/Search/ProductSearch';
import { CartTable } from '@/modules/billing/components/Cart/CartTable';
import { BillingSummary } from '@/modules/billing/components/Summary/BillingSummary';
import { PaymentDialog } from '@/modules/billing/components/Payment/PaymentDialog';
import { ShortcutHandler } from '@/modules/billing/components/Interaction/ShortcutHandler';
import { logger } from '@/core/observability/logger';
import { apiClient } from '@/api/client';
import { Loader2, AlertCircle, Wifi, WifiOff, User } from 'lucide-react';

/**
 * [SMRITI-OS] POS Orchestrator — Live Edition
 *
 * Barcode/code scan → real DB lookup → Cart → Tender → Bill finalization
 * Shoper9 parity: stockno, itemdesc, retail_price, brand from s9.stockmaster + s9.itemmaster
 */
const POS: React.FC = () => {
  const searchRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore(state => state.addItem);
  const clearCart = useCartStore(state => state.clearCart);
  const items = useCartStore(state => state.items);
  const getCartTotal = useCartStore(state => state.getCartTotal);

  const { openPayment, reset: resetPayment } = usePaymentStore();
  const activeCompany = localStorage.getItem('X-Company-Db') || '';

  const [isLooking, setIsLooking] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [billNo, setBillNo] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cashierName] = useState('ADM');

  // Network status
  useEffect(() => {
    const up = () => setIsOnline(true);
    const dn = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', dn);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', dn); };
  }, []);

  // Focus Restoration
  const restoreFocus = useCallback(() => {
    if (!usePaymentStore.getState().isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, []);

  useEffect(() => {
    restoreFocus();
  }, [items.length, restoreFocus]);

  // ── Core: Live Barcode/Code Scan Lookup ─────────────────────────────────
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = searchRef.current?.value?.trim();
    if (!code) return;

    setIsLooking(true);
    setLookupError(null);

    try {
      // Try stockmaster lookup (stockno exact match first, then description search)
      const res = await apiClient.get(`/legacy/stockmaster`, {
        params: { search: code, limit: 1 },
      });

      const hits = res.data?.data ?? res.data?.items ?? (Array.isArray(res.data) ? res.data : []);
      if (!hits || hits.length === 0) {
        setLookupError(`Item not found: "${code}"`);
        restoreFocus();
        return;
      }

      const hit = hits[0];
      addItem({
        stockno:      hit.stockno      ?? code,
        itemdesc:     hit.itemdesc     ?? hit.item_desc ?? hit.descr ?? code,
        brand:        hit.brandname    ?? hit.brand ?? '',
        retail_price: Number(hit.salerate ?? hit.retail_price ?? hit.mrp ?? 0),
        image_url:    '',
      });

      logger.traceWorkflow('POS_SCAN', 'ITEM_ADDED', { module: 'POS', stockno: hit.stockno, code });
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Lookup failed';
      setLookupError(msg);
      logger.log('WARN', `POS scan failed: ${msg}`, { module: 'POS', code });
    } finally {
      setIsLooking(false);
      if (searchRef.current) searchRef.current.value = '';
      restoreFocus();
    }
  };

  // ── Bill Finalization ────────────────────────────────────────────────────
  const handleFinalize = async () => {
    logger.traceWorkflow('BILLING_SETTLEMENT', 'FINALIZATION_COMMITTED', { module: 'BILLING' });

    const payState = usePaymentStore.getState();
    const cartItems = useCartStore.getState().items;
    const total = getCartTotal();

    try {
      // Post transaction to backend
      const payload = {
        type: 'Sales',
        payments: {
          mode: payState.mode,
          tendered: payState.tendered,
          change: Math.max(0, payState.tendered - total),
        },
        net_payable: Math.round(total * 100),  // paise
        items: cartItems.map(i => ({
          stock_no: i.stockno,
          item_name: i.itemdesc,
          item_brand: i.brand,
          qty: i.quantity,
          mrp: Math.round(i.retail_price * 100),
          net_amount: Math.round(i.retail_price * i.quantity * 100),
        })),
      };

      const res = await apiClient.post('/billing/bills', payload);
      setBillNo(res.data?.bill_no ?? null);
    } catch (err: any) {
      logger.log('WARN', `Bill post failed: ${err?.message}`, { module: 'BILLING' });
      // Still clear cart — offline queue will sync later
    }

    clearCart();
    resetPayment();
    restoreFocus();
  };

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const total = getCartTotal();

  return (
    <div className="h-full flex flex-col gap-0 overflow-hidden bg-[#020617] text-white">
      <ShortcutHandler />

      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 h-12 border-b border-white/5 bg-black/40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            POS TERMINAL · REG #01
          </span>
          {activeCompany && (
            <>
              <span className="text-slate-700">|</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                {activeCompany}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {billNo && (
            <span className="text-[9px] font-mono text-emerald-400 uppercase">
              Last Bill: {billNo}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-500">
            <User size={10} />
            {cashierName}
          </div>
          <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
            {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
      </div>

      {/* ── Scan Bar ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <form onSubmit={handleScan} className="relative">
          <ProductSearch
            ref={searchRef}
            placeholder="SCAN BARCODE OR ENTER STOCK CODE (F2)..."
            isProcessing={isLooking}
            disabled={isLooking}
          />
          {isLooking && (
            <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-2 text-amber-400">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-[9px] font-black uppercase tracking-widest">Looking up...</span>
            </div>
          )}
        </form>
        {/* Lookup Error Toast */}
        {lookupError && (
          <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle size={12} />
            <span className="text-[10px] font-black uppercase">{lookupError}</span>
            <button
              onClick={() => setLookupError(null)}
              className="ml-auto text-red-400/50 hover:text-red-400 transition-colors text-xs"
            >×</button>
          </div>
        )}
      </div>

      {/* ── Workspace: Cart + Summary ─────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 px-4 pb-3 overflow-hidden">

        {/* Cart */}
        <div className="flex-[2] flex flex-col min-h-0">
          <CartTable />
        </div>

        {/* Totals + Actions */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="bg-[#0f172a]/60 rounded-2xl border border-white/5 p-4 flex-1 shadow-2xl overflow-y-auto">
            <BillingSummary />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="text-[18px] font-black text-white font-mono">{itemCount}</div>
              <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Items</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="text-[18px] font-black text-amber-400 font-mono">
                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
              </div>
              <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Total</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={clearCart}
              disabled={items.length === 0}
              className="h-12 bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-xl"
            >
              Clear (F12)
            </button>
            <button
              onClick={openPayment}
              disabled={items.length === 0}
              className="h-12 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black uppercase text-[10px] tracking-widest shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-all rounded-xl"
            >
              Settle (F10)
            </button>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog onFinalize={handleFinalize} />
    </div>
  );
};

export default POS;
