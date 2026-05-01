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

import React from 'react';
import { Play, Trash2, Clock, X, Loader2, PackageOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { DataTable } from '@/components/ui/SovereignUI';

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
        stock: 0,
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

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-4">
        <DataTable 
          data={bills || []}
          loading={isLoading}
          emptyMessage="No Suspended Bills Found"
          columns={[
            {
              header: 'STATUS / REASON',
              accessor: (bill: SuspendedBill) => (
                <div className="flex flex-col py-1">
                  <span className="text-[10px] font-black text-saffron uppercase tracking-widest">{bill.suspended_reason || 'ON HOLD'}</span>
                  <span className="text-[9px] opacity-40">{formatTime(bill.created_at)}</span>
                </div>
              ),
              width: 150
            },
            {
              header: 'CUSTOMER / ITEMS',
              accessor: (bill: SuspendedBill) => (
                <div className="flex flex-col py-1">
                  <span className="font-bold text-sm">{bill.customer_mobile || 'WALK-IN'}</span>
                  <span className="text-[10px] opacity-40 uppercase font-black">{bill.items.length} Item{bill.items.length !== 1 ? 's' : ''}</span>
                </div>
              ),
              flex: 1
            },
            {
              header: 'NET PAYABLE',
              accessor: (bill: SuspendedBill) => (
                <span className="font-mono font-black text-white text-lg">
                  ₹{Number(bill.net_payable).toLocaleString()}
                </span>
              ),
              align: 'right',
              width: 160
            },
            {
              header: 'ACTIONS',
              accessor: (bill: SuspendedBill) => (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => recallMutation.mutate(bill)}
                    disabled={recallMutation.isPending}
                    className="h-8 px-4 bg-white text-navy rounded font-black text-[10px] tracking-widest uppercase hover:bg-saffron hover:text-white transition-all"
                  >
                    Recall
                  </button>
                  <button 
                    onClick={() => deleteMutation.mutate(bill.id)}
                    className="h-8 w-8 flex items-center justify-center bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
              width: 150,
              align: 'center'
            }
          ]}
        />
      </div>

      <div className="px-6 py-3 border-t border-white/5 text-center">
        <p className="text-[9px] text-white/20 uppercase tracking-widest">Recalled bills load into active cart · Server queue cleared automatically</p>
      </div>
    </div>
  );
};

export default SuspendedBillsBrowser;




