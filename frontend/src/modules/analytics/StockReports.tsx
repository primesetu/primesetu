/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState } from 'react';
import { FileText, Search, Download, BarChart2, Filter, Package, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StockReports() {
  const [reportType, setReportType] = useState('VALUATION');

  const stockData = [
    { brand: 'Puma', qty: 42, valuation: '₹84,000', ageing: '12 Days' },
    { brand: 'Nike', qty: 28, valuation: '₹62,500', ageing: '8 Days' },
    { brand: 'Citywalk', qty: 156, valuation: '₹2,14,000', ageing: '45 Days' },
    { brand: 'Metro', qty: 89, valuation: '₹1,22,000', ageing: '22 Days' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-black text-navy flex items-center gap-4">
            <FileText className="w-10 h-10 text-blue-500" />
            Stock Reports
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Sovereign Inventory Intelligence</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border-2 border-border px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cream transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> EXPORT PDF
          </button>
          <button className="bg-navy text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-navy/90 transition-all">
            PRINT REPORT
          </button>
        </div>
      </div>

      <div className="flex bg-navy/5 p-1 rounded-2xl border border-border/50 w-fit">
        {['VALUATION', 'AGEING', 'LOW_STOCK', 'NEGATIVE'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setReportType(tab)}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === tab ? 'bg-navy text-white shadow-lg' : 'text-muted'}`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Stock Qty', value: '4,250', icon: Package, color: 'text-blue-500' },
          { label: 'Stock Value (MRP)', value: '₹42.5L', icon: BarChart2, color: 'text-emerald-500' },
          { label: 'Critically Low', value: '12 Styles', icon: AlertTriangle, color: 'text-rose-500' },
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
        <div className="bg-navy px-10 py-6 flex justify-between items-center text-white">
          <h3 className="font-serif font-black uppercase tracking-tight">Stock Analysis Ledger</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
            <input placeholder="Search Brand..." className="bg-white/10 border border-white/10 rounded-lg pl-8 pr-4 py-1.5 text-[10px] outline-none focus:bg-white/20" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-cream/30 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
            <tr>
              <th className="px-10 py-5">Brand Name</th>
              <th className="px-6 py-5 text-center">In-Stock Qty</th>
              <th className="px-6 py-5 text-right">Valuation (Cost)</th>
              <th className="px-6 py-5 text-center">Avg. Ageing</th>
              <th className="px-10 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 font-mono text-xs">
            {stockData.map((row, i) => (
              <tr key={i} className="hover:bg-cream/5">
                <td className="px-10 py-6 font-black text-navy">{row.brand}</td>
                <td className="px-6 py-6 text-center font-bold">{row.qty}</td>
                <td className="px-6 py-6 text-right font-black text-emerald-600">{row.valuation}</td>
                <td className="px-6 py-6 text-center text-gray-500">{row.ageing}</td>
                <td className="px-10 py-6 text-center">
                  <button className="text-[9px] font-black uppercase text-blue-500 hover:underline">Full Audit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
