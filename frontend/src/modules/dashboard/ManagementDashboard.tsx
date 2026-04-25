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
import { TrendingUp, Package, DollarSign, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCcw, Database } from 'lucide-react'
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
  { name: 'Puma', value: 45, color: '#001F3F' },
  { name: 'Nike', value: 30, color: '#D4AF37' },
  { name: 'Adidas', value: 15, color: '#E63946' },
  { name: 'Others', value: 10, color: '#A8A196' },
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
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Premium Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-navy text-gold text-[9px] font-black uppercase tracking-[0.2em] rounded-md">Institutional Intelligence</div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <h1 className="text-5xl font-serif font-black text-navy uppercase tracking-tight leading-none">Operational Awareness</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
            <Database className="w-3 h-3" /> Sovereign Node X01 · Bi-Directional Pulse Active
          </p>
        </div>
        <div className="flex gap-4 items-center">
          {pendingSyncs > 0 && (
            <div className="bg-gold/10 text-gold px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gold/20 flex items-center gap-3">
              <RefreshCcw className="w-4 h-4 animate-spin-slow" />
              {pendingSyncs} Operations Queueing
            </div>
          )}
          <button 
            onClick={fetchStats}
            className="p-4 bg-white border border-border rounded-2xl text-navy hover:bg-navy hover:text-white transition-all shadow-sm"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dynamic Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Net Revenue', value: stats ? `₹${stats.today_revenue.toLocaleString()}` : '₹0', icon: DollarSign, color: 'navy', trend: '+14.2%', up: true },
          { label: 'Operation Count', value: stats ? stats.bills_today : '0', icon: Package, color: 'saffron', trend: 'Live', up: true },
          { label: 'Master Catalogue', value: stats ? stats.active_skus : '0', icon: TrendingUp, color: 'navy', trend: '+38', up: true },
          { label: 'Risk Alerts', value: stats ? `${stats.low_stock_alerts} Styles` : '0', icon: AlertCircle, color: 'rose', trend: 'CRITICAL', up: false },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:rotate-12 ${
              stat.color === 'navy' ? 'bg-navy text-white' : 
              stat.color === 'saffron' ? 'bg-saffron text-white' : 'bg-rose-500 text-white'
            }`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div className="text-[11px] font-black text-muted uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-3xl font-serif font-black text-navy">{stat.value}</div>
            <div className={`mt-5 text-[10px] font-black flex items-center gap-1.5 ${stat.up ? 'text-emerald-500' : 'text-rose-500'}`}>
              {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {stat.trend} <span className="text-muted/40 ml-1">real-time pulse</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Velocity Chart */}
        <div className="lg:col-span-2 glass rounded-[3.5rem] p-12 shadow-2xl min-h-[500px]">
          <div className="flex items-center justify-between mb-12 px-2">
            <div>
              <h3 className="text-2xl font-serif font-black text-navy uppercase tracking-tight">Sales Velocity</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Aggregated Weekly Performance</p>
            </div>
            <select className="bg-cream/50 border border-border rounded-2xl px-6 py-3 text-[11px] font-black uppercase outline-none focus:ring-2 ring-gold/20">
              <option>Standard 7-Day Window</option>
              <option>30-Day Sovereign Audit</option>
            </select>
          </div>
          <div className="h-[350px] w-full min-w-0 overflow-hidden" style={{ minHeight: '350px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height={350} debounce={100}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#A8A196' }} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 30px 60px rgba(0,0,0,0.12)', padding: '20px' }}
                   itemStyle={{ fontSize: '14px', fontWeight: '900', color: '#001F3F' }}
                />
                <Line 
                   type="monotone" 
                   dataKey="sales" 
                   stroke="#001F3F" 
                   strokeWidth={5} 
                   dot={{ r: 7, fill: '#D4AF37', strokeWidth: 4, stroke: '#fff' }}
                   activeDot={{ r: 10, strokeWidth: 0, fill: '#001F3F' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brand Loyalty Matrix */}
        <div className="glass rounded-[3.5rem] p-12 shadow-2xl flex flex-col min-h-[500px]">
          <h3 className="text-2xl font-serif font-black text-navy mb-12 uppercase tracking-tight">Brand Matrix</h3>
          <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            <div className="h-[220px] w-full min-w-0 overflow-hidden" style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={220} debounce={100}>
                <PieChart>
                  <Pie
                    data={brandData}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={10}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {brandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full mt-12">
              {brandData.map((brand, i) => (
                <div key={i} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-3 h-3 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: brand.color }}></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-navy uppercase tracking-tighter leading-none">{brand.name}</span>
                    <span className="text-[10px] font-bold text-muted mt-0.5">{brand.value}% Share</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sovereign Insights Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden bg-navy text-white">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 blur-[120px]"></div>
          <div className="flex items-center gap-5 mb-10">
            <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center text-navy shadow-xl text-xl">🧠</div>
            <div>
              <h3 className="text-2xl font-serif font-black uppercase tracking-tight">Predictive Pulse</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sovereign Forecasting Active</p>
            </div>
          </div>
          <div className="space-y-6">
            <motion.div 
              whileHover={{ x: 10 }}
              className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-black uppercase text-gold">Stockout Forecast</span>
                <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-gold" />
              </div>
              <p className="text-base font-medium leading-relaxed text-white/80">
                <span className="text-white font-black text-lg">{predictive?.stockout_forecast_count || '12'} SKUs</span> in the {predictive?.top_category || 'Footwear'} category are trending toward stockout in <span className="text-rose-400 font-black underline decoration-2">{predictive?.predicted_days || '4.2'} days</span>.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="glass rounded-[3.5rem] p-12 shadow-2xl bg-white border border-gold/10 flex flex-col justify-center items-center text-center group">
          <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center text-5xl mb-8 shadow-inner transition-transform group-hover:rotate-12">🇮🇳</div>
          <h3 className="text-2xl font-serif font-black text-navy mb-4 uppercase tracking-tight">Zero-Cloud Sovereign</h3>
          <p className="text-sm text-muted font-medium leading-relaxed max-w-sm px-4">
            PrimeSetu Node is operating in <span className="text-navy font-black">Native Cluster Mode</span>. 
            All data processed locally with bi-directional encrypted pulses to SIS.
          </p>
          <div className="mt-10 flex gap-3 flex-wrap justify-center">
            {['PST-AUDIT', 'HO-PULSE', 'MIS-CORE', 'GSP-READY'].map(tag => (
              <span key={tag} className="px-5 py-2.5 bg-navy/5 rounded-2xl text-[10px] font-black text-navy/60 uppercase tracking-widest border border-navy/5">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
