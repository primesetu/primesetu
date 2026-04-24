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

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import AttributeSales from './AttributeSales';
import MISReports from './MISReports';

export default function AnalyticsModule() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTRIBUTES' | 'MIS'>('OVERVIEW');

  const chartData = [
    { day: 'Mon', sales: 42000 },
    { day: 'Tue', sales: 38000 },
    { day: 'Wed', sales: 52000 },
    { day: 'Thu', sales: 45000 },
    { day: 'Fri', sales: 68000 },
    { day: 'Sat', sales: 85000 },
    { day: 'Sun', sales: 92000 },
  ];

  const maxSales = Math.max(...chartData.map(d => d.sales));

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-navy">Business Insights</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Nexus Mall Seawood · Performance Metrics</p>
        </div>
        
        <div className="flex bg-navy/5 p-1 rounded-2xl border border-border/50 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'OVERVIEW' ? 'bg-navy text-white shadow-lg' : 'text-muted'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('ATTRIBUTES')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'ATTRIBUTES' ? 'bg-navy text-white shadow-lg' : 'text-muted'}`}
          >
            Attribute Sales
          </button>
          <button 
            onClick={() => setActiveTab('MIS')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'MIS' ? 'bg-navy text-white shadow-lg' : 'text-muted'}`}
          >
            MIS Reports
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'OVERVIEW' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-10"
          >
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Weekly Revenue', value: '₹4.22L', trend: '+15.2%', color: 'text-emerald-500' },
                { label: 'Avg Bill Value', value: '₹4,850', trend: '+4.1%', color: 'text-amber-500' },
                { label: 'Net Margin', value: '32.5%', trend: 'Stable', color: 'text-navy/40' },
                { label: 'Total Footfall', value: '1,240', trend: '+22.5%', color: 'text-emerald-500' },
              ].map((kpi, i) => (
                <div key={i} className="glass p-8 rounded-[2.5rem] shadow-xl border-t-4 border-t-saffron/20 group hover:border-t-saffron transition-all duration-500">
                  <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4">{kpi.label}</p>
                  <div className="text-3xl font-serif font-black text-navy mb-2">{kpi.value}</div>
                  <div className={`text-[10px] font-black uppercase tracking-tighter ${kpi.color}`}>
                    {kpi.trend} vs Last Week
                  </div>
                </div>
              ))}
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sales Trend Chart */}
              <div className="lg:col-span-2 glass rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-navy/5 rounded-bl-full -mr-20 -mt-20"></div>
                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div>
                    <h3 className="text-2xl font-serif font-black text-navy">Sales Momentum</h3>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Daily Revenue Contribution</p>
                  </div>
                </div>

                <div className="flex items-end justify-between h-64 gap-4 relative z-10">
                  {chartData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                      <div className="w-full relative">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.sales / maxSales) * 100}%` }}
                          transition={{ delay: i * 0.1, duration: 1 }}
                          className="w-full bg-navy rounded-2xl group-hover:bg-saffron transition-colors shadow-lg relative overflow-hidden"
                        />
                      </div>
                      <span className="text-[10px] font-black text-muted uppercase tracking-tighter">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Split */}
              <div className="glass-dark rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <h3 className="text-2xl font-serif font-black mb-10 relative z-10">Category Mix</h3>
                <div className="space-y-10 relative z-10">
                  {[
                    { label: 'Footwear', value: 68, color: 'bg-saffron' },
                    { label: 'Apparel', value: 24, color: 'bg-emerald-400' },
                    { label: 'Accessories', value: 8, color: 'bg-blue-400' },
                  ].map((cat, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{cat.label}</span>
                        <span className="text-sm font-black text-white">{cat.value}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.value}%` }}
                          transition={{ delay: 0.5 + (i * 0.2), duration: 1 }}
                          className={`h-full ${cat.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'ATTRIBUTES' && (
          <motion.div
            key="attributes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AttributeSales />
          </motion.div>
        )}

        {activeTab === 'MIS' && (
          <motion.div
            key="mis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <MISReports />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
