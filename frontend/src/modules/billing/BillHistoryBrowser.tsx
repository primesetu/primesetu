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
import { History, Printer, X, Loader2, Search, FileText, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';

interface BillHistoryProps {
  onReprint: (bill: any) => void;
  onClose: () => void;
}

export default function BillHistoryBrowser({ onReprint, onClose }: BillHistoryProps) {
  const [search, setSearch] = React.useState('');

  const { data: bills, isLoading } = useQuery({
    queryKey: ['billing-history'],
    queryFn: () => api.billing.getHistory()
  });

  const filteredBills = React.useMemo(() => {
    if (!bills) return [];
    if (!search) return bills;
    return bills.filter((b: any) => 
      b.bill_number.toLowerCase().includes(search.toLowerCase()) ||
      (b.customer_mobile && b.customer_mobile.includes(search))
    );
  }, [bills, search]);

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-navy/20 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="bg-navy px-6 py-4 flex items-center justify-between shadow-xl z-10 relative border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-navy shadow-lg shadow-gold/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-serif font-black text-lg flex items-center gap-2">
              Sales History
            </h2>
            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-0.5">
              F4 · Institutional Bill Archive
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/60 hover:text-white"
        >
          <X className="w-4 h-4"/>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-navy/40 border-b border-white/5">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search by Bill No / Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-white outline-none focus:border-gold focus:bg-white/10 transition-all placeholder-white/20"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/20">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">Retrieving Archive...</span>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/20">
            <FileText className="w-16 h-16" strokeWidth={0.8} />
            <div className="text-center">
              <div className="text-sm font-black uppercase tracking-widest">No Bills Found</div>
              <div className="text-[10px] mt-1">Try a different search term</div>
            </div>
          </div>
        ) : (
          filteredBills.map((bill: any) => (
            <div 
              key={bill.id} 
              className="bg-white/5 border border-white/10 rounded-2xl p-5 group hover:bg-white/10 hover:border-gold/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-gold uppercase tracking-widest">
                      {bill.bill_number}
                    </span>
                    <span className="text-[9px] text-white/30 font-bold flex items-center gap-1">
                      <Calendar size={10} /> {new Date(bill.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] text-white/30 font-bold flex items-center gap-1">
                       {formatTime(bill.created_at)}
                    </span>
                  </div>
                  <div className="text-2xl font-serif font-black text-white">
                    {formatCurrency(bill.total)}
                  </div>
                  <div className="text-[10px] text-white/40 font-bold mt-1 uppercase tracking-wider">
                    {bill.customer_mobile || 'Standard Cash Sale'} • {bill.items?.length || 0} Line(s)
                  </div>
                </div>
                
                <button 
                  onClick={() => onReprint(bill)}
                  className="bg-gold text-navy p-3 rounded-xl shadow-lg shadow-gold/10 hover:scale-110 active:scale-95 transition-all group-hover:bg-amber-400"
                  title="Reprint Bill"
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>

              {/* Items Summary */}
              <div className="bg-black/20 rounded-xl p-3 space-y-1">
                {bill.items?.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="text-white/60 truncate max-w-[200px]">{item.name}</span>
                    <div className="flex gap-4">
                      <span className="text-white/30 font-bold">×{item.qty}</span>
                      <span className="text-white/50 w-16 text-right font-mono">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                ))}
                {bill.items?.length > 3 && (
                  <div className="text-[8px] text-white/20 font-black uppercase text-center mt-1">
                    + {bill.items.length - 3} more items
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-navy/60 text-center border-t border-white/5">
        <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em]">
          Institutional Ledger Verified · Sovereign Protocol
        </p>
      </div>
    </div>
  );
}
