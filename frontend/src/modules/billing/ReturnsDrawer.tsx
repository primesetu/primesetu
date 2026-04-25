/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState } from 'react';
import { Search, RotateCcw, FileCheck2, X, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';

interface Props {
  onClose: () => void;
  onReturn: (bill: any) => void;
}

export default function ReturnsDrawer({ onClose }: Props) {
  const [search, setSearch] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  // Simulated query for a past bill
  // In reality, this would hit an endpoint like api.billing.getBill(search)
  const { data: bill, isLoading, refetch, isError } = useQuery({
    queryKey: ['past-bill', search],
    queryFn: async () => {
      try {
        return await api.billing.getBill(search);
      } catch (err: any) {
        throw new Error(err.response?.data?.detail || 'Bill not found');
      }
    },
    enabled: false,
    retry: false
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setSearched(true);
      refetch();
    }
  };

  const toggleItem = (item: any) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleIssueCreditNote = () => {
    if (!selectedItems.length || !bill) return;
    const value = selectedItems.reduce((acc, item) => acc + (item.qty * item.unit_price * (1 - item.discount_per / 100)), 0);
    
    // Construct Return Bill Object for Printing
    const returnBill = {
      ...bill,
      type: 'Return',
      bill_number: `CN-${bill.bill_number}`,
      original_bill_no: bill.bill_number,
      items: selectedItems.map(item => ({ ...item })), // Pass items as they are, CreditNoteA4 handles the '-' display
      total: value,
      return_reason: 'Size/Quality Return'
    };

    onReturn(returnBill);
    onClose();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-navy relative">
      <div className="bg-rose-600 px-8 py-5 flex items-center justify-between shadow-xl z-10">
        <h2 className="text-white font-serif font-black text-lg flex items-center gap-3">
          <RotateCcw className="w-5 h-5" /> Customer Returns & Ledger
        </h2>
        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6">
        <form onSubmit={handleSearch} className="relative">
          <input 
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Scan / Enter Original Bill No. (try B-1001)"
            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-mono text-lg focus:border-rose-400 outline-none transition-all placeholder:text-white/20"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {isLoading ? (
          <div className="text-center p-10 text-rose-300 font-bold uppercase tracking-widest text-xs">Querying Ledger...</div>
        ) : searched && isError ? (
          <div className="bg-white/5 border border-rose-500/30 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <p className="text-white font-bold mb-1">Bill Not Found</p>
            <p className="text-xs text-white/40">The receipt number may be invalid or belongs to another store.</p>
          </div>
        ) : bill ? (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Bill details</p>
                <p className="text-white font-mono text-sm">{bill.bill_number} • {new Date(bill.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Customer</p>
                <p className="text-white font-mono text-sm">+91 {bill.customer_mobile}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-3 px-2">Select Items to Return</p>
              <div className="space-y-2">
                {bill.items.map((item: any) => {
                  const isSelected = selectedItems.find(i => i.id === item.id);
                  const net = item.qty * item.unit_price * (1 - item.discount_per / 100);
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => toggleItem(item)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'bg-rose-500/20 border-rose-500' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                    >
                      <div>
                        <p className="text-white font-bold">{item.product.name}</p>
                        <p className="text-xs text-white/40 font-mono">{item.product.code} • Qty: {item.qty}</p>
                      </div>
                      <p className="text-white font-black">₹{net.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
           <div className="text-center p-10 text-white/20 font-bold uppercase tracking-widest text-xs">Waiting for scan...</div>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div className="bg-white p-6 rounded-t-3xl shadow-2xl z-20 animate-in slide-in-from-bottom-10">
          <div className="flex justify-between items-center mb-4">
            <p className="text-navy font-black uppercase tracking-widest text-xs">Credit Note Value</p>
            <p className="text-3xl font-black text-rose-600">
              ₹{selectedItems.reduce((acc, item) => acc + (item.qty * item.unit_price * (1 - item.discount_per / 100)), 0).toFixed(2)}
            </p>
          </div>
          <button 
            onClick={handleIssueCreditNote}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex justify-center items-center gap-2"
          >
            <FileCheck2 className="w-5 h-5" /> Issue Credit Note
          </button>
        </div>
      )}
    </div>
  );
}
