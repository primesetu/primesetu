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
import { Play, Trash2, Clock, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

interface SuspendedBill {
  id: string;
  suspended_reason: string;
  net_payable: number;
  created_at: string;
  customer_mobile?: string;
  items: any[];
}

interface Props {
  onRecall: (items: any[], mobile: string) => void;
  onClose: () => void;
}

const SuspendedBillsBrowser: React.FC<Props> = ({ onRecall, onClose }) => {
  const queryClient = useQueryClient();

  const { data: bills, isLoading } = useQuery<SuspendedBill[]>({
    queryKey: ['suspended-bills'],
    queryFn: async () => {
      try { return await api.billing.getSuspended() }
      catch { return [] }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.billing.deleteSuspended(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suspended-bills'] })
  });

  if (isLoading) return <div className="p-20 text-center text-white/20">Scanning Sovereign Vault...</div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-navy/20">
      <div className="bg-saffron px-8 py-5 flex items-center justify-between shadow-xl z-10 relative">
        <h2 className="text-white font-serif font-black text-lg flex items-center gap-3">
          <Clock className="w-5 h-5" /> Suspended Bills
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{bills?.length || 0} Pending</span>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white"><X className="w-4 h-4"/></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {bills?.map(bill => (
          <div key={bill.id} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black text-saffron uppercase tracking-widest">Reason: {bill.suspended_reason}</span>
                <span className="text-[10px] text-white/20">•</span>
                <span className="text-[10px] font-bold text-white/40">{new Date(bill.created_at).toLocaleTimeString()}</span>
              </div>
              <h3 className="text-white font-serif font-black text-xl">₹{bill.net_payable.toLocaleString()}</h3>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">
                {bill.customer_mobile || 'Walk-in Customer'} • {bill.items.length} Items
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => deleteMutation.mutate(bill.id)}
                className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onRecall(bill.items, bill.customer_mobile || '')}
                className="flex items-center gap-3 bg-white text-navy px-8 py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-saffron hover:text-white transition-all shadow-xl"
              >
                <Play className="w-4 h-4 fill-current" /> RECALL BILL
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuspendedBillsBrowser;
