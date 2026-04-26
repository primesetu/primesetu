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

import React from 'react';
import { FileText, ArrowRight, Trash2, X, Loader2, PackageOpen, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

interface SalesSlipItem {
  id: string;
  code: string;
  name: string;
  brand: string;
  category: string;
  qty: number;
  mrp: number;
  discount_per: number;
  tax_rate: number;
}

interface SalesSlip {
  id: string;
  slip_no: string;
  total_amount: number;
  created_at: string;
  customer_mobile?: string;
  items: SalesSlipItem[];
}

interface Props {
  onRecall: (items: any[], mobile: string) => void;
  onClose: () => void;
}

const SalesSlipsBrowser: React.FC<Props> = ({ onRecall, onClose }) => {
  const queryClient = useQueryClient();

  const { data: slips, isLoading } = useQuery<SalesSlip[]>({
    queryKey: ['sales-slips'],
    queryFn: () => api.billing.getSlips(),
    refetchInterval: 10000 // Auto-refresh every 10s
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.billing.deleteSlip(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales-slips'] })
  });

  const convertMutation = useMutation({
    mutationFn: async (slip: SalesSlip) => {
      await api.billing.convertSlip(slip.id);
      return slip;
    },
    onSuccess: (slip) => {
      // Map items to CartItem format
      const cartItems = slip.items.map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        brand: item.brand,
        category: item.category,
        qty: Number(item.qty),
        mrp: Number(item.mrp),
        cost_price: 0,
        discount_per: Number(item.discount_per) || 0,
        tax_rate: Number(item.tax_rate),
        is_tax_inclusive: true,
      }));
      queryClient.invalidateQueries({ queryKey: ['sales-slips'] });
      onRecall(cartItems, slip.customer_mobile || '');
    }
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-navy/20">
      {/* Header */}
      <div className="bg-amber-400 px-6 py-4 flex items-center justify-between shadow-xl z-10 relative">
        <div>
          <h2 className="text-navy font-serif font-black text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" /> Sales Slips
          </h2>
          <p className="text-[9px] text-navy/60 font-black uppercase tracking-widest mt-0.5">
            F6 · Sovereign Picking Slip Queue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-navy/60 uppercase tracking-widest">
            {slips?.length || 0} Slips
          </span>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-navy/5 hover:bg-navy/10 transition-all text-navy"
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
            <span className="text-[10px] font-black uppercase tracking-widest">Retrieving Slips...</span>
          </div>
        ) : slips?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-4 text-white/20">
            <PackageOpen className="w-16 h-16" strokeWidth={0.8} />
            <div className="text-center">
              <div className="text-sm font-black uppercase tracking-widest">No Active Slips</div>
              <div className="text-[10px] mt-1">Generate slips for faster checkout</div>
            </div>
          </div>
        ) : (
          slips?.map(slip => (
            <div 
              key={slip.id} 
              className="bg-white/5 border border-white/10 rounded-2xl p-5 group hover:bg-white/10 hover:border-amber-400/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
                      {slip.slip_no}
                    </span>
                    <span className="text-[9px] text-white/30 font-bold flex items-center gap-1">
                      <Clock size={10} /> {formatTime(slip.created_at)}
                    </span>
                  </div>
                  <div className="text-2xl font-serif font-black text-white">
                    ₹{Number(slip.total_amount).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-white/40 font-bold mt-0.5">
                    {slip.customer_mobile || 'Walk-in'} • {slip.items.length} Product(s)
                  </div>
                </div>
              </div>

              {/* Item Preview */}
              <div className="space-y-1 mb-4">
                {slip.items.slice(0, 2).map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="text-white/50 truncate max-w-[180px]">{item.name}</span>
                    <span className="text-white/30 font-bold ml-2">×{item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => deleteMutation.mutate(slip.id)}
                  disabled={deleteMutation.isPending || convertMutation.isPending}
                  className="p-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30"
                >
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => convertMutation.mutate(slip)}
                  disabled={convertMutation.isPending || deleteMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-navy px-4 py-3 rounded-xl font-black text-[10px] tracking-widest hover:bg-amber-400 hover:text-white transition-all shadow-xl disabled:opacity-40"
                >
                  {convertMutation.isPending 
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><ArrowRight className="w-4 h-4" /> CONVERT TO BILL</>
                  }
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SalesSlipsBrowser;
