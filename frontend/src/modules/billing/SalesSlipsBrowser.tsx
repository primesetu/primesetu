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

import React, { useState, useEffect } from 'react';
import { FileText, ArrowRight, Trash2 } from 'lucide-react';

interface SalesSlip {
  id: string;
  slip_no: string;
  total_amount: number;
  created_at: string;
  customer_mobile?: string;
  items: any[];
}

interface Props {
  onRecall: (items: any[], mobile: string) => void;
}

const SalesSlipsBrowser: React.FC<Props> = ({ onRecall }) => {
  const [slips, setSlips] = useState<SalesSlip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetch from API
    setTimeout(() => {
      setSlips([
        { 
          id: 's1', 
          slip_no: 'SLIP-984210', 
          total_amount: 12500, 
          created_at: new Date().toISOString(),
          customer_mobile: '9123456789',
          items: [
            { id: 'p2', name: 'Nike Air Max', qty: 1, mrp: 12999, code: 'N-270', brand: 'Nike', category: 'Shoes' }
          ]
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <div className="p-20 text-center text-white/20">Loading Sales Slips...</div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-navy/20">
      <div className="bg-gold px-8 py-5 flex items-center justify-between">
        <h2 className="text-navy font-serif font-black text-lg flex items-center gap-3">
          <FileText className="w-5 h-5" /> Active Sales Slips
        </h2>
        <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">{slips.length} Slips Available</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {slips.map(slip => (
          <div key={slip.id} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black text-gold uppercase tracking-widest">{slip.slip_no}</span>
                <span className="text-[10px] text-white/20">•</span>
                <span className="text-[10px] font-bold text-white/40">{new Date(slip.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="text-white font-serif font-black text-xl">₹{slip.total_amount.toLocaleString()}</h3>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">
                Customer: {slip.customer_mobile || 'Anonymous'} • {slip.items.length} Product(s)
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="p-4 rounded-2xl bg-white/5 text-white/40 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onRecall(slip.items, slip.customer_mobile || '')}
                className="flex items-center gap-3 bg-white text-navy px-8 py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-gold transition-all shadow-xl"
              >
                CONVERT TO BILL <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesSlipsBrowser;
