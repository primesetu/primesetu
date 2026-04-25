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
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Package, DollarSign, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCcw, Database, ShieldCheck, Zap, Receipt } from 'lucide-react'
import { api } from '@/api/client'
import { syncEngine } from '@/lib/SyncEngine'

const salesData = [
  { day: 'Mon', sales: 45000 },
  { day: 'Tue', sales: 52000 },
  { day: 'Wed', sales: 38000 },
  { day: 'Thu', sales: 65000 },
  { day: 'Fri', sales: 88000 },
  { day: 'Sat', sales: 125000 },
  { day: 'Sun', sales: 110000 },
]

const brandData = [
  { name: 'Puma', value: 45, color: '#0D1B3E' },
  { name: 'Nike', value: 30, color: '#F9B942' },
  { name: 'Adidas', value: 15, color: '#F4840A' },
  { name: 'Others', value: 10, color: '#8A8FA8' },
]

export default function ManagementDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [predictive, setPredictive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingSyncs, setPendingSyncs] = useState(0);

  useEffect(() => {
    fetchStats();
    const syncInterval = setInterval(() => {
      setPendingSyncs(syncEngine.getPendingCount());
    }, 2000);
    return () => clearInterval(syncInterval);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [statsData, predData] = await Promise.all([
        api.dashboard.getStats(),
        api.inventory.getPredictiveStats()
      ]);
      setStats(statsData);
      setPredictive(predData);
    } catch (error) {
      console.error('[PrimeSetu] Dashboard fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-32">
      
      {/* 1. SELECTION & CONTEXT BAR (Classic Shoper Filter) */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/50 border-2 border-border p-3 rounded-[2.5rem] backdrop-blur-xl shadow-sm">
         <div className="flex bg-navy/5 p-1 rounded-2xl border border-navy/5">
           {['TODAY', 'WEEKLY', 'MONTHLY', 'TAX-YEAR'].map(period => (
             <button key={period} className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${period === 'TODAY' ? 'bg-navy text-white shadow-xl' : 'text-navy/40 hover:bg-white hover:text-navy'}`}>
               {period}
             </button>
           ))}
         </div>
         <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[9px] font-black text-muted uppercase tracking-[0.3em]">Operational Node</div>
              <div className="text-xs font-black text-navy uppercase">X01 · MALL ROAD CITYWALK</div>
            </div>
            <button 
              onClick={fetchStats}
              className="w-12 h-12 bg-white border-2 border-border rounded-2xl flex items-center justify-center text-navy hover:border-gold hover:text-gold transition-all shadow-sm active:scale-90"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
         </div>
      </div>

      {/* 2. DYNAMIC KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Net Revenue', value: stats ? `₹${stats.today_revenue.toLocaleString()}` : '₹1.24L', icon: DollarSign, color: 'navy', trend: '+14.2%', up: true },
          { label: 'Bills Issued', value: stats ? stats.bills_today : '42', icon: Receipt, color: 'saffron', trend: 'Live', up: true },
          { label: 'Active Catalogue', value: stats ? stats.active_skus : '1.2K', icon: Package, color: 'navy', trend: '+38 Today', up: true },
          { label: 'Risk Alerts', value: stats ? `${stats.low_stock_alerts} Styles` : '08 Alerts', icon: AlertCircle, color: 'rose', trend: 'CRITICAL', up: false },
        ].map((stat, i) => (
          <div key={i} className="shoper-card group cursor-pointer overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 blur-[40px] rounded-full transition-all group-hover:opacity-20 ${stat.color === 'rose' ? 'bg-rose-500' : 'bg-gold'}`}></div>
            <div className="flex justify-between items-start mb-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 ${
                stat.color === 'navy' ? 'bg-navy text-white' : 
                stat.color === 'saffron' ? 'bg-saffron text-white' : 'bg-rose-500 text-white'
              }`}>
                {stat.icon && <stat.icon className="w-7 h-7" />}
              </div>
              <div className={`text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-2 ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {stat.trend}
              </div>
            </div>
            <div className="text-[11px] font-black text-muted uppercase tracking-[0.2em] mb-2 group-hover:text-gold transition-colors">{stat.label}</div>
            <div className="text-4xl font-serif font-black text-navy tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sales Velocity Chart */}
        <div className="lg:col-span-2 shoper-card p-12 min-h-[550px]">
          <div className="flex items-center justify-between mb-16 px-4">
            <div>
              <h3 className="text-3xl font-serif font-black text-navy uppercase tracking-tighter">Sales Velocity</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mt-2">Historical Pulse Audit</p>
            </div>
            <div className="flex gap-4">
               <button className="bg-navy/5 text-navy px-6 py-3 rounded-xl text-[10px] font-black uppercase border border-navy/5 hover:bg-white hover:border-gold transition-all">Export Report</button>
            </div>
          </div>
          <div className="h-[380px] w-full relative">
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D1B3E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0D1B3E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4DC" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#8A8FA8' }} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 40px 80px rgba(0,0,0,0.15)', padding: '24px', backgroundColor: '#0D1B3E', color: '#fff' }}
                   itemStyle={{ fontSize: '14px', fontWeight: '900', color: '#F9B942' }}
                   cursor={{ stroke: '#F9B942', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Line 
                   type="monotone" 
                   dataKey="sales" 
                   stroke="#0D1B3E" 
                   strokeWidth={6} 
                   dot={{ r: 8, fill: '#F9B942', strokeWidth: 5, stroke: '#fff' }}
                   activeDot={{ r: 12, strokeWidth: 0, fill: '#0D1B3E' }}
                   fill="url(#colorSales)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brand Matrix */}
        <div className="shoper-card p-12 flex flex-col min-h-[550px]">
          <h3 className="text-3xl font-serif font-black text-navy mb-16 uppercase tracking-tighter text-center">Brand Matrix</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-[260px] w-full relative">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={brandData}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={12}
                    dataKey="value"
                  >
                    {brandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-8 w-full mt-16 px-4">
              {brandData.map((brand, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer p-4 rounded-2xl hover:bg-cream transition-all">
                  <div className="w-4 h-4 rounded-lg shadow-lg group-hover:scale-125 transition-transform" style={{ backgroundColor: brand.color }}></div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-black text-navy uppercase tracking-tight leading-none">{brand.name}</span>
                    <span className="text-[10px] font-bold text-muted mt-1.5 uppercase tracking-widest">{brand.value}% Share</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SOVEREIGN INTELLIGENCE & FORECASTING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="shoper-card bg-navy text-white relative overflow-hidden border-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 blur-[150px]"></div>
          <div className="flex items-center gap-6 mb-12 relative z-10">
            <div className="w-16 h-16 bg-gold rounded-3xl flex items-center justify-center text-navy shadow-2xl text-2xl transform -rotate-3 hover:rotate-0 transition-transform">🧠</div>
            <div>
              <h3 className="text-3xl font-serif font-black uppercase tracking-tight">Predictive Analytics</h3>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">Sovereign Forecasting Active</p>
            </div>
          </div>
          <div className="space-y-6 relative z-10">
            <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
              <div className="flex justify-between items-center mb-5">
                <span className="text-[11px] font-black uppercase text-gold tracking-widest">Inventory Forecast</span>
                <TrendingUp className="w-5 h-5 text-white/20 group-hover:text-gold" />
              </div>
              <p className="text-lg font-medium leading-relaxed text-white/80">
                <span className="text-white font-black text-2xl">12 SKUs</span> in <span className="text-gold uppercase font-black">{predictive?.top_category || 'Footwear'}</span> are projected to stockout in <span className="text-rose-400 font-black underline decoration-4 underline-offset-8">4.2 days</span>. 
              </p>
              <button className="mt-8 text-[10px] font-black uppercase text-gold border-b-2 border-gold pb-1 hover:text-white hover:border-white transition-all">View replenishment list</button>
            </div>
          </div>
        </div>

        <div className="shoper-card flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px]"></div>
          <div className="w-32 h-32 bg-cream rounded-full flex items-center justify-center text-6xl mb-10 shadow-inner hover:scale-110 transition-transform cursor-pointer">🇮🇳</div>
          <h3 className="text-3xl font-serif font-black text-navy mb-6 uppercase tracking-tighter">Zero-Cloud Sovereign</h3>
          <p className="text-base text-muted font-bold leading-relaxed max-w-sm px-6 uppercase tracking-tighter italic">
            PrimeSetu Node is operating in <span className="text-navy font-black not-italic">Native Cluster Mode</span>. 
            All data processed locally with bi-directional encrypted pulses.
          </p>
          <div className="mt-12 flex gap-4 flex-wrap justify-center">
            {['PST-AUDIT', 'HO-PULSE', 'MIS-CORE', 'GSP-READY'].map(tag => (
              <span key={tag} className="px-6 py-3 bg-navy text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">{tag}</span>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
