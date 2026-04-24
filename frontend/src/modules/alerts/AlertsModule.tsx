/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState } from 'react';
import { Building2, Bell, Zap, Filter, ArrowRight, ShieldAlert, Globe, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AlertsModule() {
  const [filter, setFilter] = useState('ALL');

  const alerts = [
    { id: 1, type: 'STOCK', node: 'HO (MUMBAI)', msg: 'New Spring Collection prices synchronized. Update labels.', time: '12m ago', priority: 'HIGH' },
    { id: 2, type: 'INTEL', node: 'STORE-X02 (DELHI)', msg: 'High demand for Nike Air Max observed. Stock re-routing suggested.', time: '1h ago', priority: 'MEDIUM' },
    { id: 3, type: 'SECURITY', node: 'GATEWAY-V01', msg: 'Multiple failed login attempts detected at Terminal T3.', time: '3h ago', priority: 'CRITICAL' },
    { id: 4, type: 'SYSTEM', node: 'LOCAL NODE', msg: 'Daily backup successful. 42.5MB synced to Sovereign Vault.', time: '5h ago', priority: 'LOW' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-black text-navy flex items-center gap-4">
            <Building2 className="w-10 h-10 text-cyan-500" />
            Chain Store Intel
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Bi-Directional Node Intelligence</p>
        </div>
        <button className="bg-navy text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-navy/90 transition-all flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" /> BROADCAST ALERT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass p-6 rounded-[2rem] shadow-lg border border-white">
            <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-6">Intelligence Filters</h4>
            <div className="space-y-2">
              {['ALL', 'CRITICAL', 'HO_UPDATES', 'STORE_FEEDS'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? 'bg-navy text-white shadow-md' : 'hover:bg-cream/50 text-gray-500'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#1a2340] p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Globe className="w-32 h-32" /></div>
            <div className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-2">Network Status</div>
            <div className="text-xl font-serif font-black mb-4">12 Active Nodes</div>
            <p className="text-[9px] text-white/40 leading-relaxed font-bold uppercase">Sovereign Bridge latency: 42ms. All store terminals are synchronized.</p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {alerts.map((alert) => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6 rounded-[2.5rem] shadow-xl border border-white flex items-center gap-6 relative group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                alert.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-500' :
                alert.priority === 'HIGH' ? 'bg-amber-50 text-amber-500' : 'bg-cyan-50 text-cyan-500'
              }`}>
                {alert.priority === 'CRITICAL' ? <ShieldAlert className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest ${
                    alert.priority === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-navy text-white'
                  }`}>
                    {alert.priority}
                  </span>
                  <span className="text-[10px] font-black text-navy uppercase tracking-tight">{alert.node}</span>
                  <span className="text-[9px] text-muted font-bold ml-auto">{alert.time}</span>
                </div>
                <p className="text-sm font-bold text-gray-600 leading-tight">{alert.msg}</p>
              </div>

              <button className="opacity-0 group-hover:opacity-100 p-4 bg-navy text-white rounded-2xl transition-all shadow-xl">
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
