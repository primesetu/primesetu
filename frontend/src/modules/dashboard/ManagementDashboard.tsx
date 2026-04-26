/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation     :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell 
} from 'recharts'
import { 
  TrendingUp, Package, DollarSign, AlertCircle, ArrowUpRight, ArrowDownRight, 
  RefreshCcw, Database, ShieldCheck, Zap, Receipt, Activity, Globe, Cpu,
  Layers, BarChart3, Clock
} from 'lucide-react'
import { api } from '@/api/client'
import { syncEngine } from '@/lib/SyncEngine'
import { cn } from '@/lib/utils'

// ── MOCK DATA FOR CINEMATIC FEEL ──
const salesPulse = [
  { time: '09:00', val: 12000 }, { time: '11:00', val: 45000 },
  { time: '13:00', val: 32000 }, { time: '15:00', val: 89000 },
  { time: '17:00', val: 110000 }, { time: '19:00', val: 95000 },
  { time: '21:00', val: 65000 },
]

export default function ManagementDashboard() {
  const [stats, setStats] = useState<any>({ today_revenue: 124500, bills_today: 42, active_skus: 1240, low_stock_alerts: 8 });
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPulse(p => (p + 1) % 100), 2000);
    return () => clearInterval(timer);
  }, []);

  const metricCards = [
    { label: 'Today Revenue', value: `₹${stats.today_revenue.toLocaleString()}`, sub: '+12.4% vs Avg', icon: DollarSign, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
    { label: 'Bills Issued', value: stats.bills_today, sub: 'Live Session', icon: Receipt, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Active SKUs', value: stats.active_skus, sub: 'Registry Clean', icon: Package, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { label: 'Risk Alerts', value: stats.low_stock_alerts, sub: 'Action Required', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-1000">
      
      {/* ── 1. MISSION STATUS BAR (Tesla Feel) ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-navy/40 backdrop-blur-3xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-6 relative">
          <div className="w-14 h-14 bg-brand-gold rounded-2xl flex items-center justify-center shadow-lg shadow-brand-gold/20">
            <Activity className="w-8 h-8 text-navy animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase" style={{ fontFamily: 'var(--font-tesla)' }}>Mission Control</h2>
            <div className="flex items-center gap-3 mt-1">
               <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> System Optimal
               </span>
               <span className="text-[9px] font-black text-white/20 uppercase tracking-widest border-l border-white/10 pl-3">Node: MUM-X01</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {['1H', '1D', '1W', '1M'].map(t => (
            <button key={t} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all", t === '1D' ? "bg-brand-gold text-navy shadow-lg" : "text-white/30 hover:bg-white/5 hover:text-white")}>{t}</button>
          ))}
          <button className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-white/40 transition-all ml-4 border border-white/5"><RefreshCcw size={18} /></button>
        </div>
      </div>

      {/* ── 2. CORE METRICS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((m, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.05] transition-all relative overflow-hidden"
          >
            <div className={cn("absolute -top-12 -right-12 w-24 h-24 blur-3xl rounded-full opacity-10 group-hover:opacity-30 transition-opacity", m.bg)} />
            <div className="flex justify-between items-start mb-10">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", m.bg, m.color)}>
                <m.icon size={28} />
              </div>
              <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{m.sub}</div>
            </div>
            <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">{m.label}</div>
            <div className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-tesla)' }}>{m.value}</div>
          </motion.div>
        ))}
      </div>

      {/* ── 3. LIVE PERFORMANCE AUDIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Velocity Chart */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
           <div className="flex items-center justify-between mb-12">
              <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-widest">Revenue Velocity</h3>
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mt-2">Real-time Pulse Monitoring</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(244,162,97,0.5)]" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Live Flow</span>
                 </div>
              </div>
           </div>

           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={salesPulse}>
                    <defs>
                       <linearGradient id="glowGold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f4a261" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f4a261" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#ffffff20' }} />
                    <YAxis hide />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }}
                       labelStyle={{ display: 'none' }}
                       itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#f4a261' }}
                       cursor={{ stroke: '#f4a261', strokeWidth: 1 }}
                    />
                    <Area 
                       type="monotone" 
                       dataKey="val" 
                       stroke="#f4a261" 
                       strokeWidth={4} 
                       fill="url(#glowGold)" 
                       animationDuration={2000}
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Institutional Health */}
        <div className="bg-navy text-white rounded-[3rem] p-10 flex flex-col relative overflow-hidden border border-white/5 shadow-2xl">
           <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full" />
           <h3 className="text-xl font-black uppercase tracking-widest mb-12 text-center">Node Health</h3>
           
           <div className="flex-1 flex flex-col justify-center gap-8">
              {[
                { label: 'Database Sync', val: 100, color: 'text-emerald-400' },
                { label: 'Auth Latency', val: 98, color: 'text-brand-gold' },
                { label: 'Audit Compliance', val: 92, color: 'text-sky-400' },
                { label: 'AI Predictor', val: 84, color: 'text-purple-400' },
              ].map((h, i) => (
                <div key={i} className="space-y-3">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{h.label}</span>
                      <span className={cn("text-xs font-black", h.color)}>{h.val}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${h.val}%` }} 
                        transition={{ duration: 1.5, delay: i * 0.2 }}
                        className={cn("h-full rounded-full", h.color.replace('text', 'bg'))} 
                      />
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-12 pt-8 border-t border-white/5 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/5">
                 <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-brand-gold">Sovereign Guard Active</span>
              </div>
           </div>
        </div>

      </div>

      {/* ── 4. PREDICTIVE INSIGHTS BAR ── */}
      <div className="bg-gradient-to-br from-brand-gold to-saffron p-1 rounded-[3rem] shadow-2xl">
         <div className="bg-[#0a0a0c] rounded-[2.9rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-8">
               <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10">
                  <BarChart3 className="w-10 h-10 text-brand-gold" />
               </div>
               <div>
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Inventory Forecast</h4>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">Next 72 Hours Projection</p>
               </div>
            </div>

            <div className="flex-1 max-w-lg bg-white/5 p-6 rounded-3xl border border-white/10">
               <p className="text-sm font-medium text-white/60 leading-relaxed uppercase tracking-widest">
                  Demand for <span className="text-brand-gold font-black">Athletic Wear</span> is expected to surge by <span className="text-emerald-400 font-black">24%</span> this weekend. Recommend restocking <span className="text-white font-black underline decoration-brand-gold underline-offset-4">Top 5 SKUs</span>.
               </p>
            </div>

            <button className="h-16 px-10 bg-brand-gold text-navy rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg hover:scale-105 transition-all">Action Inventory</button>
         </div>
      </div>

    </div>
  )
}
