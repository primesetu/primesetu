/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState } from 'react';
import { MoveRight, MoveLeft, History, Search, Filter, Download, PackageCheck, PackageMinus, PackagePlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StockMovement() {
  const [filter, setFilter] = useState('ALL');

  const movements = [
    { id: 1, type: 'IN', ref: 'PUR-8821', item: 'Nike Air Max 270', qty: '+12', date: '2026-04-24 10:30 AM', source: 'HO MUMBAI' },
    { id: 2, type: 'OUT', ref: 'INV-10245', item: 'Puma RS-X Bold', qty: '-1', date: '2026-04-24 11:15 AM', source: 'POS T1' },
    { id: 3, type: 'IN', ref: 'RET-0052', item: 'Nexus Cotton Tee', qty: '+1', date: '2026-04-24 01:20 PM', source: 'RETURNS' },
    { id: 4, type: 'OUT', ref: 'INV-10246', item: 'Nike Air Max 270', qty: '-2', date: '2026-04-24 02:45 PM', source: 'POS T2' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-black text-navy flex items-center gap-4">
            <History className="w-10 h-10 text-amber-600" />
            Stock Movement Ledger
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Historical Inventory Flow Audit</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border-2 border-border px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cream transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> EXPORT EXCEL
          </button>
          <button className="bg-navy text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-navy/90 transition-all flex items-center gap-2">
            <Filter className="w-4 h-4" /> ADVANCED FILTER
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total In-ward', value: '425 Units', icon: PackagePlus, color: 'text-emerald-500' },
          { label: 'Total Out-ward', value: '182 Units', icon: PackageMinus, color: 'text-rose-500' },
          { label: 'Net Variance', value: '+243 Units', icon: PackageCheck, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="glass p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6">
            <div className={`w-14 h-14 bg-cream/50 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="text-2xl font-black text-navy">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="bg-[#1a2340] px-10 py-6 flex justify-between items-center text-white">
          <h3 className="font-serif font-black uppercase tracking-tight">Movement History</h3>
          <div className="flex gap-4">
            {['ALL', 'IN', 'OUT'].map((t) => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === t ? 'bg-amber-500 text-navy' : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-cream/30 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
            <tr>
              <th className="px-10 py-5">Timestamp</th>
              <th className="px-6 py-5">Reference No</th>
              <th className="px-6 py-5">Item Description</th>
              <th className="px-6 py-5 text-center">Movement Qty</th>
              <th className="px-6 py-5 text-center">Source/Dest</th>
              <th className="px-10 py-5 text-right">Running Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 font-mono text-xs">
            {movements.map((row, i) => (
              <tr key={i} className="hover:bg-cream/5">
                <td className="px-10 py-6 text-gray-500">{row.date}</td>
                <td className="px-6 py-6 font-black text-navy">{row.ref}</td>
                <td className="px-6 py-6 font-bold text-gray-700">{row.item}</td>
                <td className={`px-6 py-6 text-center font-black ${row.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {row.qty}
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="text-[9px] font-black uppercase bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{row.source}</span>
                </td>
                <td className="px-10 py-6 text-right font-black text-navy text-lg">1,245</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
