/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React from 'react';
import { 
  Package, 
  Truck, 
  MapPin, 
  ArrowRightLeft, 
  AlertTriangle,
  Search,
  Box,
  Layers,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useWarehouseDashboard } from '@/hooks/useWarehouse';

export default function WarehouseDashboard() {
  const { data, isLoading: loading } = useWarehouseDashboard();
  
  const metrics = data?.metrics;
  const bins = data?.bin_highlights || [];

  if (loading) return <div className="p-20 text-center font-serif text-2xl animate-pulse">Loading Warehouse Pulse...</div>;

  return (
    <div className="p-8 space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-black text-navy flex items-center gap-4">
            <Box className="w-12 h-12 text-indigo-600" />
            Warehouse Operating System
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-[0.2em] mt-3">Sovereign Node: HQ-MUM-01 · Logistics Engine Active</p>
        </div>
        
        <div className="flex gap-4">
          <button className="bg-bg-float border-2 border-border px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cream transition-all flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" /> Transfer Request
          </button>
          <button className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
            Initiate Physical Audit
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Total Inventory Valuation', value: `₹${(metrics?.valuation_paise / 100).toLocaleString()}`, icon: BarChart3, color: 'text-emerald-600' },
          { label: 'Active Bin Occupancy', value: '84%', icon: Layers, color: 'text-indigo-600' },
          { label: 'Low Stock Alerts', value: metrics?.low_stock_count || 0, icon: AlertTriangle, color: 'text-rose-500' },
          { label: 'In-Transit Shipments', value: '03', icon: Truck, color: 'text-amber-600' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-white/50"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 bg-cream/50 rounded-2xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-muted uppercase tracking-tighter">Live</span>
            </div>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="text-3xl font-black text-navy">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Bin Location Highlight */}
        <div className="lg:col-span-2 glass rounded-[3rem] p-10 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-serif font-black text-navy uppercase tracking-tight">Real-time Bin Strategy</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search Bin or SKU..."
                className="pl-12 pr-6 py-3 bg-cream/30 border-2 border-transparent focus:border-indigo-500/30 rounded-full outline-none text-xs font-bold transition-all w-64"
              />
            </div>
          </div>

          <div className="space-y-4">
            {bins.map((bin, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-bg-elevated hover:bg-bg-float rounded-3xl transition-all border border-transparent hover:border-indigo-100 group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xs uppercase">
                    {bin.bin || 'NA'}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy group-hover:text-indigo-600 transition-colors">{bin.name}</h4>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">SKU: {bin.sku || 'ITEM-001'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <div className="text-lg font-black text-navy">{bin.qty} Units</div>
                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Optimal Level</div>
                  </div>
                  <button className="p-3 bg-cream rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <MapPin className="w-4 h-4 text-muted" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logistics Activity */}
        <div className="bg-[#1a2340] rounded-[3rem] p-10 shadow-2xl text-white">
          <h3 className="text-xl font-serif font-black uppercase tracking-tight mb-10">Logistics Pulse</h3>
          <div className="space-y-8">
            {[
              { type: 'TRANSFER', ref: 'TRF-A0291', status: 'IN_TRANSIT', time: '12m ago', from: 'WH-01', to: 'STORE-X01' },
              { type: 'ADJUSTMENT', ref: 'ADJ-9921', status: 'COMPLETED', time: '45m ago', from: 'BIN-C2', to: 'SCRAP' },
              { type: 'RECEIPT', ref: 'GRN-20241', status: 'VERIFIED', time: '2h ago', from: 'VENDOR', to: 'WH-01' }
            ].map((activity, i) => (
              <div key={i} className="relative pl-10 border-l-2 border-white/10 pb-2">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{activity.type}</span>
                  <span className="text-[9px] text-white/40 font-mono">{activity.time}</span>
                </div>
                <h4 className="font-bold text-sm">{activity.ref}</h4>
                <div className="flex items-center gap-2 mt-3 text-[10px] text-white/60 uppercase font-black tracking-tighter">
                  <span>{activity.from}</span>
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>{activity.to}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-12 py-5 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/5">
            View Full Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
