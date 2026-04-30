/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React from 'react';
import { 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp,
  Package,
  Activity,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useIntelligenceDoc } from '@/hooks/useIntelligence';

export default function StockPulse() {
  const { data: analysis = [], isLoading: loading } = useIntelligenceDoc();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'text-rose-600 bg-rose-100 border-rose-200';
      case 'WARNING': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'OVERSTOCK': return 'text-indigo-600 bg-indigo-100 border-indigo-200';
      case 'DEAD': return 'text-slate-600 bg-slate-100 border-slate-200';
      default: return 'text-emerald-600 bg-emerald-100 border-emerald-200';
    }
  };

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-black text-navy flex items-center gap-4">
            <Activity className="w-12 h-12 text-brand-gold" />
            Predictive Stock Pulse
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-[0.2em] mt-3">Phase 5 Operational Intelligence · Days of Cover Active</p>
        </div>
        
        <div className="flex gap-4">
          <button className="bg-white border-2 border-border px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cream transition-all flex items-center gap-2">
            <Filter className="w-4 h-4" /> Refine Heuristics
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'OOS Risk (Critical)', val: analysis.filter(a => a.status === 'CRITICAL').length, icon: AlertTriangle, color: 'text-rose-500' },
          { label: 'Reorder Needed', val: analysis.filter(a => a.status === 'WARNING').length, icon: Zap, color: 'text-amber-500' },
          { label: 'Healthy Runway', val: analysis.filter(a => a.status === 'HEALTHY').length, icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Inventory Bloat', val: analysis.filter(a => a.status === 'OVERSTOCK').length, icon: TrendingDown, color: 'text-indigo-500' },
        ].map((kpi, i) => (
          <div key={i} className="glass p-8 rounded-[2.5rem] shadow-xl border border-white/50">
            <div className="flex justify-between items-start mb-6">
              <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
            </div>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{kpi.label}</p>
            <div className="text-4xl font-serif font-black text-navy">{kpi.val} <span className="text-sm font-sans font-bold text-muted/40">SKUs</span></div>
          </div>
        ))}
      </div>

      {/* Main Pulse Table */}
      <div className="glass rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/50">
        <div className="panel-header px-10 py-6 flex justify-between items-center">
          <h3 className="text-xl font-serif font-black uppercase tracking-tight">Intelligence Ledger</h3>
          <span className="text-[10px] font-black tracking-[0.2em] opacity-60">30-Day Velocity Moving Average</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-cream/30 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
              <tr>
                <th className="pl-10 py-6">Identity</th>
                <th className="px-6 py-6 text-center">Stock</th>
                <th className="px-6 py-6 text-center">30D Velocity</th>
                <th className="px-6 py-6 text-center">Days of Cover</th>
                <th className="pr-10 py-6 text-right">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center font-black text-muted uppercase tracking-widest">Synthesizing Neural Data...</td></tr>
              ) : (
                analysis.map((row, i) => (
                  <tr key={i} className="hover:bg-cream/5 transition-colors group">
                    <td className="pl-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center font-black text-xs text-navy/40">
                          {row.sku.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-navy text-sm">{row.name}</p>
                          <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{row.sku} · {row.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center font-mono text-sm font-bold">{row.stock}</td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-navy">{row.velocity}</span>
                        <span className="text-[8px] font-black text-muted uppercase tracking-tighter">Units/Day</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm ${
                        row.doc < 7 ? 'text-rose-600 bg-rose-50' : 'text-navy'
                      }`}>
                        {row.doc}
                      </div>
                    </td>
                    <td className="pr-10 py-6 text-right">
                      <span className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
