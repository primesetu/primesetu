/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation     :  AITDL Network
 * Project : SMRITI-OS
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
import { useTheme } from '@/hooks/useTheme'

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
    { label: 'Today Revenue', value: `₹${stats.today_revenue.toLocaleString()}`, sub: '+12.4% vs Avg', icon: DollarSign, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/10' },
    { label: 'Bills Issued', value: stats.bills_today, sub: 'Live Session', icon: Receipt, color: 'text-[var(--secondary)]', bg: 'bg-[var(--secondary)]/10' },
    { label: 'Active SKUs', value: stats.active_skus, sub: 'Registry Clean', icon: Package, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary)]/10' },
    { label: 'Risk Alerts', value: stats.low_stock_alerts, sub: 'Action Required', icon: AlertCircle, color: 'text-[var(--danger)]', bg: 'bg-[var(--danger)]/10' },
  ];

  const { theme } = useTheme();
  const isTally = theme === 'SMRITI-OS';

  if (isTally) {
    return (
      <div className="flex flex-col gap-[var(--space-6)] tally-scrollbar pb-[var(--space-8)]">
        {/* ── Tally Header Bar ── */}
        <div className="tp-header px-[var(--space-4)] flex items-center justify-between">
           <div className="flex items-center gap-[var(--space-4)]">
              <div className="w-8 h-8 bg-[var(--surface)] flex items-center justify-center border border-[var(--border-subtle)]">
                 <Activity className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                 <h2 className="text-sm font-bold uppercase">Management Cockpit</h2>
                 <p className="text-[9px] opacity-80 uppercase font-bold tracking-widest">System Status: Optimal · MUM-X01</p>
              </div>
           </div>
           <div className="flex gap-1">
              {['1H', '1D', '1W', '1M'].map(t => (
                <button key={t} className={t === '1D' ? "tp-btn-gold" : "tp-btn-white"}>{t}</button>
              ))}
           </div>
        </div>

        {/* ── Tally Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-4)]">
          {metricCards.map((m, i) => (
            <div key={i} className="tp-card flex flex-col gap-[var(--space-4)]">
              <div className="flex justify-between items-start">
                <div className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">{m.label}</div>
                <m.icon size={18} className="text-[var(--accent)]" />
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)] font-mono">{m.value}</div>
              <div className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Tally Reports ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-6)]">
          <div className="lg:col-span-2 tp-card">
            <h3 className="text-xs font-bold text-[var(--accent)] uppercase mb-[var(--space-6)] border-b border-[var(--background)] pb-[var(--space-2)]">Revenue Velocity</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesPulse}>
                  <CartesianGrid strokeDasharray="0" stroke="var(--background)" />
                  <XAxis dataKey="time" axisLine={{ stroke: 'var(--border-subtle)' }} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--text-primary)' }} />
                  <YAxis axisLine={{ stroke: 'var(--border-subtle)' }} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--text-primary)' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '0' }}
                  />
                  <Area type="stepAfter" dataKey="val" stroke="var(--accent)" strokeWidth={2} fill="var(--accent)" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="tp-card">
            <h3 className="text-xs font-bold text-[var(--accent)] uppercase mb-[var(--space-6)] border-b border-[var(--background)] pb-[var(--space-2)] text-center">Node Health</h3>
            <div className="space-y-[var(--space-6)]">
              {[
                { label: 'Database Sync', val: 100, color: 'bg-[var(--secondary)]' },
                { label: 'Auth Latency', val: 98, color: 'bg-[var(--accent)]' },
                { label: 'Audit Compliance', val: 92, color: 'bg-[var(--primary)]' },
                { label: 'AI Predictor', val: 84, color: 'bg-[var(--warning)]' },
              ].map((h, i) => (
                <div key={i} className="space-y-[var(--space-2)]">
                   <div className="flex justify-between items-end">
                      <span className="text-[9px] font-bold uppercase text-[var(--text-tertiary)]">{h.label}</span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{h.val}%</span>
                   </div>
                   <div className="h-2 w-full bg-[var(--background)] border border-[var(--border-subtle)]">
                      <div className={cn("h-full", h.color)} style={{ width: `${h.val}%` }} />
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-8)] pb-20 animate-in fade-in duration-1000">
      
      {/* ── 1. MISSION STATUS BAR (Tesla Feel) ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-[var(--space-6)] bg-[var(--surface-elevated)]/40 backdrop-blur-3xl border border-[var(--text-primary)]/5 p-[var(--space-6)] rounded-[var(--radius-xl)] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-[var(--space-6)] relative">
          <div className="w-14 h-14 bg-[var(--accent)] rounded-[var(--radius-lg)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
            <Activity className="w-8 h-8 text-[var(--background)] animate-pulse" />
          </div>
          <div>
            <h2 className="module-title text-2xl tracking-tighter uppercase text-[var(--text-primary)]">Mission Control</h2>
            <div className="flex items-center gap-[var(--space-3)] mt-[var(--space-1)]">
               <span className="flex items-center gap-1.5 text-[9px] font-black text-[var(--secondary)] uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)] animate-ping" /> System Optimal
               </span>
               <span className="text-[9px] font-black text-[var(--text-primary)]/20 uppercase tracking-widest border-l border-[var(--text-primary)]/10 pl-3">Node: MUM-X01</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[var(--space-3)]">
          {['1H', '1D', '1W', '1M'].map(t => (
            <button key={t} className={cn("px-6 py-2.5 rounded-[var(--radius-md)] text-[10px] font-black tracking-widest transition-all", t === '1D' ? "bg-[var(--accent)] text-[var(--background)] shadow-lg" : "text-[var(--text-primary)]/30 hover:bg-[var(--text-primary)]/5 hover:text-[var(--text-primary)]")}>{t}</button>
          ))}
          <button className="w-12 h-12 bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 rounded-[var(--radius-lg)] flex items-center justify-center text-[var(--text-primary)]/40 transition-all ml-[var(--space-4)] border border-[var(--text-primary)]/5"><RefreshCcw size={18} /></button>
        </div>
      </div>

      {/* ── 2. CORE METRICS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-6)]">
        {metricCards.map((m, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-[var(--text-primary)]/[0.02] border border-[var(--text-primary)]/5 p-[var(--space-8)] rounded-[var(--radius-xl)] hover:bg-[var(--text-primary)]/[0.05] transition-all relative overflow-hidden"
          >
            <div className={cn("absolute -top-12 -right-12 w-24 h-24 blur-3xl rounded-full opacity-10 group-hover:opacity-30 transition-opacity", m.bg)} />
            <div className="flex justify-between items-start mb-[var(--space-8)]">
              <div className={cn("w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center transition-transform group-hover:scale-110", m.bg, m.color)}>
                <m.icon size={28} />
              </div>
              <div className="text-[10px] font-black text-[var(--text-primary)]/20 uppercase tracking-[0.2em]">{m.sub}</div>
            </div>
            <div className="text-[9px] font-black text-[var(--text-primary)]/30 uppercase tracking-[0.3em] mb-[var(--space-2)]">{m.label}</div>
            <div className="stat-card-value text-4xl text-[var(--text-primary)]">{m.value}</div>
          </motion.div>
        ))}
      </div>

      {/* ── 3. LIVE PERFORMANCE AUDIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-8)]">
        
        {/* Main Velocity Chart */}
        <div className="lg:col-span-2 bg-[var(--text-primary)]/[0.02] border border-[var(--text-primary)]/5 rounded-[var(--radius-xl)] p-[var(--space-8)] relative overflow-hidden">
           <div className="flex items-center justify-between mb-[var(--space-8)]">
              <div>
                 <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-widest">Revenue Velocity</h3>
                 <p className="text-[9px] font-black text-[var(--text-primary)]/20 uppercase tracking-[0.5em] mt-[var(--space-2)]">Real-time Pulse Monitoring</p>
              </div>
              <div className="flex items-center gap-[var(--space-4)]">
                 <div className="flex items-center gap-[var(--space-2)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(244,162,97,0.5)]" />
                    <span className="text-[9px] font-black text-[var(--text-primary)]/40 uppercase tracking-widest">Live Flow</span>
                 </div>
              </div>
           </div>

           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={salesPulse}>
                    <defs>
                       <linearGradient id="glowGold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--text-primary)/0.05" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-primary)/0.2' }} />
                    <YAxis hide />
                    <Tooltip 
                       contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}
                       labelStyle={{ display: 'none' }}
                       itemStyle={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent)' }}
                       cursor={{ stroke: 'var(--accent)', strokeWidth: 1 }}
                    />
                    <Area 
                       type="monotone" 
                       dataKey="val" 
                       stroke="var(--accent)" 
                       strokeWidth={4} 
                       fill="url(#glowGold)" 
                       animationDuration={2000}
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Institutional Health */}
        <div className="bg-[var(--text-primary)]/[0.02] border border-[var(--text-primary)]/5 rounded-[var(--radius-xl)] p-[var(--space-8)] flex flex-col relative overflow-hidden shadow-2xl">
           <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[var(--accent)]/5 blur-[80px] rounded-full" />
           <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-widest mb-[var(--space-8)] text-center">Node Health</h3>
           
           <div className="flex-1 flex flex-col justify-center gap-[var(--space-8)]">
              {[
                { label: 'Database Sync', val: 100, color: 'text-[var(--secondary)]' },
                { label: 'Auth Latency', val: 98, color: 'text-[var(--accent)]' },
                { label: 'Audit Compliance', val: 92, color: 'text-[var(--primary)]' },
                { label: 'AI Predictor', val: 84, color: 'text-purple-400' },
              ].map((h, i) => (
                <div key={i} className="space-y-[var(--space-3)]">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]/40">{h.label}</span>
                      <span className={cn("text-xs font-black", h.color)}>{h.val}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-[var(--text-primary)]/5 rounded-full overflow-hidden">
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

           <div className="mt-[var(--space-8)] pt-[var(--space-8)] border-t border-[var(--text-primary)]/5 text-center">
              <div className="inline-flex items-center gap-[var(--space-2)] px-[var(--space-6)] py-[var(--space-2)] bg-[var(--text-primary)]/5 rounded-full border border-[var(--text-primary)]/5">
                 <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">Sovereign Guard Active</span>
              </div>
           </div>
        </div>

      </div>

      {/* ── 4. PREDICTIVE INSIGHTS BAR ── */}
      {isTally ? (
        <div className="tp-card flex flex-col md:flex-row items-center justify-between gap-[var(--space-6)] mt-[var(--space-4)]">
          <div className="flex items-center gap-[var(--space-6)]">
            <div className="w-12 h-12 bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]">
              <BarChart3 className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--accent)] uppercase">Inventory Forecast</h4>
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-[var(--space-1)]">Next 72 Hours Projection</p>
            </div>
          </div>
          <div className="flex-1 bg-[var(--background)] p-[var(--space-4)] border border-[var(--border-subtle)]">
            <p className="text-xs font-bold text-[var(--text-primary)] uppercase leading-relaxed">
              Demand for <span className="text-[var(--accent)]">Athletic Wear</span> is expected to surge by <span className="text-[var(--secondary)]">24%</span> this weekend.
            </p>
          </div>
          <button className="tp-btn-gold px-6 py-2">Action Inventory</button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] p-1 rounded-[var(--radius-xl)] shadow-2xl">
          <div className="bg-[var(--background)] rounded-[var(--radius-xl)] p-[var(--space-8)] flex flex-col md:flex-row items-center justify-between gap-[var(--space-8)]">
              <div className="flex items-center gap-[var(--space-8)]">
                <div className="w-20 h-20 bg-[var(--text-primary)]/5 rounded-[var(--radius-lg)] flex items-center justify-center border border-[var(--text-primary)]/10">
                    <BarChart3 className="w-10 h-10 text-[var(--accent)]" />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Inventory Forecast</h4>
                    <p className="text-[10px] font-black text-[var(--text-primary)]/30 uppercase tracking-[0.4em] mt-[var(--space-2)]">Next 72 Hours Projection</p>
                </div>
              </div>

              <div className="flex-1 max-w-lg bg-[var(--text-primary)]/5 p-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--text-primary)]/10">
                <p className="text-sm font-medium text-[var(--text-primary)]/60 leading-relaxed uppercase tracking-widest">
                    Demand for <span className="text-[var(--accent)] font-black">Athletic Wear</span> is expected to surge by <span className="text-[var(--secondary)] font-black">24%</span> this weekend. Recommend restocking <span className="text-[var(--text-primary)] font-black underline decoration-[var(--accent)] underline-offset-4">Top 5 SKUs</span>.
                </p>
              </div>

              <button className="h-16 px-10 bg-[var(--accent)] text-[var(--background)] rounded-[var(--radius-md)] font-black text-[10px] uppercase tracking-[0.3em] shadow-lg hover:scale-105 transition-all">Action Inventory</button>
          </div>
        </div>
      )}
    </div>
  )
}




