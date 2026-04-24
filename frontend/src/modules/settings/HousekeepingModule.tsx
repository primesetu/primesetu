/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState } from 'react';
import { Database, RefreshCw, Trash2, HardDrive, ShieldCheck, Activity, Save, History } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HousekeepingModule() {
  const [cleaning, setCleaning] = useState(false);

  const startCleaning = () => {
    setCleaning(true);
    setTimeout(() => setCleaning(false), 2000);
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-black text-navy flex items-center gap-4">
            <Database className="w-10 h-10 text-emerald-500" />
            Housekeeping
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Node Optimization & Maintenance</p>
        </div>
        <button onClick={startCleaning} disabled={cleaning}
          className="bg-navy text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-navy/90 transition-all flex items-center gap-2">
          {cleaning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} 
          RUN SYSTEM MAINTENANCE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Database Health', value: 'OPTIMAL', icon: Activity, color: 'text-emerald-500' },
          { label: 'Unsynced Cache', value: '0 Bytes', icon: RefreshCw, color: 'text-blue-500' },
          { label: 'Disk Usage', value: '42.5 MB', icon: HardDrive, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="glass p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center text-center">
            <div className={`w-14 h-14 bg-cream/50 rounded-2xl flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="text-2xl font-black text-navy">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-[3rem] shadow-xl space-y-8">
          <h3 className="text-lg font-serif font-black text-navy flex items-center gap-3 uppercase">
            <Save className="w-5 h-5 text-blue-500" /> Critical Actions
          </h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-6 bg-white border border-border rounded-[2rem] hover:border-blue-400 hover:bg-blue-50 transition-all group">
              <div className="text-left">
                <div className="text-xs font-black text-navy uppercase tracking-widest">Rebuild Local Index</div>
                <div className="text-[9px] text-muted font-bold">Optimizes search speed for large catalogues</div>
              </div>
              <RefreshCw className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
            </button>
            <button className="w-full flex items-center justify-between p-6 bg-white border border-border rounded-[2rem] hover:border-amber-400 hover:bg-amber-50 transition-all group">
              <div className="text-left">
                <div className="text-xs font-black text-navy uppercase tracking-widest">Verify Ledger Integrity</div>
                <div className="text-[9px] text-muted font-bold">Cross-checks all bills with node inventory</div>
              </div>
              <ShieldCheck className="w-5 h-5 text-gray-300 group-hover:text-amber-500" />
            </button>
            <button className="w-full flex items-center justify-between p-6 bg-white border border-border rounded-[2rem] hover:border-rose-400 hover:bg-rose-50 transition-all group">
              <div className="text-left">
                <div className="text-xs font-black text-navy uppercase tracking-widest">Purge Old Logs</div>
                <div className="text-[9px] text-muted font-bold">Clears audit logs older than 365 days</div>
              </div>
              <Trash2 className="w-5 h-5 text-gray-300 group-hover:text-rose-500" />
            </button>
          </div>
        </div>

        <div className="glass p-10 rounded-[3rem] shadow-xl space-y-8">
          <h3 className="text-lg font-serif font-black text-navy flex items-center gap-3 uppercase">
            <History className="w-5 h-5 text-purple-500" /> Maintenance History
          </h3>
          <div className="space-y-4">
            {[
              { event: 'Database Vacuum', date: '2026-04-24 02:00 AM', status: 'SUCCESS' },
              { event: 'Index Rebuild', date: '2026-04-21 11:30 PM', status: 'SUCCESS' },
              { event: 'Cache Purge', date: '2026-04-14 06:15 PM', status: 'SUCCESS' },
            ].map((ev, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/50">
                <div>
                  <div className="text-[11px] font-black text-navy uppercase">{ev.event}</div>
                  <div className="text-[9px] text-muted font-bold">{ev.date}</div>
                </div>
                <span className="text-[8px] font-black px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                  {ev.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
