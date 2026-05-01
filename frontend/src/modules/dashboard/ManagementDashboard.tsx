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
import { useQuery } from '@tanstack/react-query'
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
import { formatCurrency } from '@/utils/currency'

// ── MOCK DATA FOR CINEMATIC FEEL ──
export default function ManagementDashboard() {
  const [pulse, setPulse] = useState(0);

  // --- Real-time Data Queries ---
  const { data: stats = { today_revenue: 0, bills_today: 0, active_skus: 0, low_stock_alerts: 0 }, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.dashboard.getStats(),
    refetchInterval: 30000 // Refresh every 30s
  });

  const { data: history = [] } = useQuery({
    queryKey: ['billing-history-mini'],
    queryFn: () => api.billing.getHistory()
  });

  // Transform history into pulse data for chart
  const salesPulse = useMemo(() => {
    if (!history.length) return [
      { time: '09:00', val: 0 }, { time: '12:00', val: 0 }, { time: '15:00', val: 0 }, { time: '18:00', val: 0 }, { time: '21:00', val: 0 }
    ];
    
    // Simple hourly bucket
    const buckets: Record<string, number> = {};
    history.forEach((b: any) => {
      const hour = new Date(b.created_at).getHours();
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      buckets[timeStr] = (buckets[timeStr] || 0) + (b.total || 0);
    });

    return Object.entries(buckets)
      .map(([time, val]) => ({ time, val }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [history]);

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
      <div className="flex flex-col tally-scrollbar h-full divide-y divide-white/5 border-b border-white/5 bg-[var(--surface-muted)]">
        {/* ── Institutional Bento Header ── */}
        <div className="h-12 flex divide-x divide-white/5 items-stretch border-b border-white/5">
           <div className="w-[300px] flex items-center gap-4 px-6 bg-[var(--surface)]">
              <Activity className="w-4 h-4 text-[var(--gold)]" />
              <div>
                 <h2 className="text-[10px] font-black uppercase tracking-widest text-white">Management Cockpit</h2>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">NODE: MUM-X01 · ACTIVE</p>
              </div>
           </div>
           <div className="flex-1 flex items-center justify-center gap-4">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">System Pulse Monitoring</span>
           </div>
           <div className="flex divide-x divide-white/5">
              {['1H', '1D', '1W', '1M'].map(t => (
                <button key={t} className={cn("px-6 text-[9px] font-black transition-all", t === '1D' ? "bg-[var(--gold)] text-black" : "text-white/40 hover:bg-white/5 hover:text-white")}>{t}</button>
              ))}
           </div>
        </div>

        {/* ── Bento Metrics Row ── */}
        <div className="grid grid-cols-4 divide-x divide-white/5 h-20 items-stretch bg-[var(--surface)]">
          {metricCards.map((m, i) => (
            <div key={i} className="flex flex-col justify-center px-6 group hover:bg-white/5 transition-all">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                <m.icon size={12} className="text-[var(--gold)] opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[14px] font-black text-white tracking-tighter">{m.value}</div>
              <div className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter shadow-sm">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Main Bento Area ── */}
        <div className="flex-1 grid grid-cols-3 divide-x divide-white/5 items-stretch min-h-0">
          <div className="col-span-2 flex flex-col p-6 bg-[var(--surface)]/50">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[9px] font-black text-[var(--gold)] uppercase tracking-[0.2em]">Revenue Velocity</h3>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Real-time Terminal Feed</span>
             </div>
             <div className="flex-1 min-h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={salesPulse}>
                   <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" />
                   <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: 'rgba(255,255,255,0.2)' }} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: 'rgba(255,255,255,0.2)' }} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0' }}
                   />
                   <Area type="stepAfter" dataKey="val" stroke="var(--gold)" strokeWidth={1} fill="var(--gold)" fillOpacity={0.05} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="flex flex-col divide-y divide-white/5 bg-[var(--surface)]">
             <div className="h-12 flex items-center justify-center px-6">
                <h3 className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Node Health Audit</h3>
             </div>
             <div className="flex-1 p-6 space-y-6 overflow-y-auto">
               {[
                 { label: 'Database Sync', val: 100, color: 'bg-emerald-500' },
                 { label: 'Auth Latency', val: 98, color: 'bg-[var(--gold)]' },
                 { label: 'Audit Compliance', val: 92, color: 'bg-sky-500' },
                 { label: 'AI Predictor', val: 84, color: 'bg-purple-500' },
               ].map((h, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{h.label}</span>
                       <span className="text-[10px] font-black text-white">{h.val}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 border border-white/5 overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${h.val}%` }} className={cn("h-full", h.color)} />
                    </div>
                 </div>
               ))}
             </div>
             <div className="p-6 bg-white/5">
                <div className="flex items-center gap-3 text-[9px] font-black text-[var(--gold)] uppercase">
                   <div className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse" />
                   Sovereign Integrity Verified
                </div>
             </div>
          </div>
        </div>

        {/* ── Lower Bento Row (Live Audit Stream) ── */}
        <div className="grid grid-cols-4 divide-x divide-white/5 border-t border-white/5 items-stretch bg-[var(--surface)]">
          <div className="col-span-3 flex flex-col divide-y divide-white/5">
             <div className="h-10 flex items-center px-6 bg-white/5 justify-between">
                <span className="text-[9px] font-black text-[var(--gold)] uppercase tracking-widest">Live Terminal Audit Stream</span>
                <span className="text-[8px] font-black text-slate-500 uppercase">Real-time Feed · {new Date().toLocaleDateString()}</span>
             </div>
             <div className="flex-1 max-h-[200px] overflow-y-auto tally-scrollbar">
                {history.slice(0, 8).map((log: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-2 hover:bg-white/5 transition-all group">
                     <span className="text-[9px] font-mono text-slate-500 font-bold">{new Date(log.created_at).toLocaleTimeString()}</span>
                     <div className="h-2 w-px bg-white/10" />
                     <span className="flex-1 text-[9px] font-black text-white/70 group-hover:text-white uppercase tracking-tight truncate">
                       BILL #{log.bill_number} GENERATED {log.customer_mobile ? `FOR ${log.customer_mobile}` : 'CASH'}
                     </span>
                     <span className="text-[9px] font-black text-[var(--gold)] font-mono">{formatCurrency(log.total)}</span>
                     <div className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-500">SUCCESS</div>
                  </div>
                ))}
             </div>
          </div>
          <div className="flex flex-col p-6 gap-4 bg-[var(--surface-muted)]">
             <div className="flex items-center gap-2 mb-2">
                <Database size={14} className="text-[var(--gold)]" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Storage Pulse</span>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <span className="text-[8px] font-black text-slate-500 uppercase">DB Cluster Load</span>
                   <span className="text-[10px] font-black text-white">12.4%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 border border-white/5">
                   <div className="h-full bg-[var(--gold)]" style={{ width: '12.4%' }} />
                </div>
                <p className="text-[8px] font-black text-slate-500 uppercase leading-relaxed">
                   High-performance PostgreSQL cluster operating at optimal latency.
                </p>
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




