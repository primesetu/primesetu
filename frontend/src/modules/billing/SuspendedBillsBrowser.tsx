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

import React from 'react';
import { Play, Trash2, Clock, X, Loader2, PackageOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

interface SuspendedBillItem {
  id: string;
  code: string;
  name: string;
  brand: string;
  category: string;
  qty: number;
  mrp: number;
  discount_per: number;
  tax_rate: number;
  is_tax_inclusive?: boolean;
}

interface SuspendedBill {
  id: string;
  suspended_reason: string;
  net_payable: number;
  created_at: string;
  customer_mobile?: string;
  items: SuspendedBillItem[];
}

interface Props {
  onRecall: (items: SuspendedBillItem[], mobile: string) => void;
  onClose: () => void;
}

const SuspendedBillsBrowser: React.FC<Props> = ({ onRecall, onClose }) => {
  const queryClient = useQueryClient();

  const { data: bills, isLoading } = useQuery<SuspendedBill[]>({
    queryKey: ['suspended-bills'],
    queryFn: async () => {
      try { return await api.billing.getSuspended() }
      catch { return [] }
    },
    refetchInterval: 15000 // Auto-refresh every 15s
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.billing.deleteSuspended(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suspended-bills'] })
  });

  // Recall: call backend to remove from queue, then load items into active cart
  const recallMutation = useMutation({
    mutationFn: async (bill: SuspendedBill) => {
      await api.billing.recallSuspended(bill.id);
      return bill;
    },
    onSuccess: (bill) => {
      // Map API items → CartItem format expected by BillingModule
      const cartItems = bill.items.map(item => ({
        id: item.id,
        code: item.code || '',
        name: item.name || '',
        brand: item.brand || '',
        category: item.category || '',
        qty: Number(item.qty) || 1,
        mrp: Number(item.mrp) || 0,
        cost_price: 0,
        discount_per: Number(item.discount_per) || 0,
        tax_rate: Number(item.tax_rate) || 18,
        is_tax_inclusive: item.is_tax_inclusive ?? true,
      }));
      queryClient.invalidateQueries({ queryKey: ['suspended-bills'] });
      onRecall(cartItems, bill.customer_mobile || '');
    }
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMin = Math.round((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-navy/20">
      {/* Header */}
      <div className="bg-saffron px-6 py-4 flex items-center justify-between shadow-xl z-10 relative">
        <div>
          <h2 className="text-white font-serif font-black text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" /> Suspended Bills
          </h2>
          <p className="text-[9px] text-white/60 font-black uppercase tracking-widest mt-0.5">
            F4 / F5 · Sovereign Hold Queue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            {bills?.length || 0} Pending
          </span>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white"
          >
            <X className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/20">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">Scanning Sovereign Vault...</span>
          </div>
        ) : bills?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-4 text-white/20">
            <PackageOpen className="w-16 h-16" strokeWidth={0.8} />
            <div className="text-center">
              <div className="text-sm font-black uppercase tracking-widest">No Suspended Bills</div>
              <div className="text-[10px] mt-1">Use F12 to suspend the active cart</div>
            </div>
          </div>
        ) : (
          bills?.map(bill => (
            <div 
              key={bill.id} 
              className="bg-white/5 border border-white/10 rounded-2xl p-5 group hover:bg-white/10 hover:border-saffron/30 transition-all"
            >
              {/* Bill Meta */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-saffron uppercase tracking-widest px-2 py-0.5 bg-saffron/10 rounded-full">
                      {bill.suspended_reason || 'On Hold'}
                    </span>
                    <span className="text-[9px] text-white/30 font-bold">
                      {formatTime(bill.created_at)}
                    </span>
                  </div>
                  <div className="text-2xl font-serif font-black text-white">
                    ₹{Number(bill.net_payable).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-[10px] text-white/40 font-bold mt-0.5">
                    {bill.customer_mobile || 'Walk-in'} · {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Item Preview (top 3) */}
              <div className="space-y-1 mb-4">
                {bill.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="text-white/50 truncate max-w-[180px]">{item.name}</span>
                    <span className="text-white/30 font-bold ml-2">×{item.qty}</span>
                  </div>
                ))}
                {bill.items.length > 3 && (
                  <div className="text-[9px] text-white/20 font-bold">
                    +{bill.items.length - 3} more items...
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => deleteMutation.mutate(bill.id)}
                  disabled={deleteMutation.isPending || recallMutation.isPending}
                  className="p-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30"
                  title="Discard this suspended bill"
                >
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => recallMutation.mutate(bill)}
                  disabled={recallMutation.isPending || deleteMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-navy px-4 py-3 rounded-xl font-black text-[10px] tracking-widest hover:bg-saffron hover:text-white transition-all shadow-xl disabled:opacity-40"
                >
                  {recallMutation.isPending 
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Play className="w-4 h-4 fill-current" /> RECALL TO CART</>
                  }
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-6 py-3 border-t border-white/5 text-center">
        <p className="text-[9px] text-white/20 uppercase tracking-widest">Recalled bills load into active cart · Server queue cleared automatically</p>
      </div>
    </div>
  );
};

export default SuspendedBillsBrowser;
