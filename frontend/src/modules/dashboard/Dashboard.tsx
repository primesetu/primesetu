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
import { useLanguage } from '@/hooks/useLanguage'
import { useStore } from '@/hooks/useStore'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'

export default function Dashboard() {
  const { t } = useLanguage()
  const { store } = useStore()
  const now = new Date()
  const hour = now.getHours()
  
  const greeting = hour < 12 ? 'Suprabhat' : hour < 17 ? 'Namaste' : 'Shubh Sandhya'

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.dashboard.getStats
  })

  const STATS = [
    { label: 'Revenue Pulse', key: 'today_sales', value: `₹ ${stats?.today_revenue?.toLocaleString() || '0'}`, trend: `${stats?.revenue_change || 0}%`, icon: '📈', color: 'bg-emerald-500/10 text-emerald-400' },
    { label: 'Inventory Integrity', key: 'stock_value', value: `${stats?.active_skus || 0} SKUs`, trend: 'Healthy', icon: '📦', color: 'bg-amber-500/10 text-amber-400' },
    { label: 'Ticket Velocity', key: 'bills_today', value: `${stats?.bills_today || 0}`, trend: 'Active', icon: '🧾', color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Risk Monitor', key: 'low_stock', value: `${stats?.low_stock_alerts || 0}`, trend: 'Review', icon: '⚠️', color: 'bg-rose-500/10 text-rose-400' },
  ]

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-saffron font-bold text-sm uppercase tracking-[0.2em] mb-2">
            <span className="w-8 h-[2px] bg-saffron"></span>
            {greeting}, {store?.name || 'Sovereign Node'}
          </div>
          <h1 className="text-5xl font-black text-navy leading-tight tracking-tighter" style={{ fontFamily: 'var(--font-tesla)' }}>
            Cockpit <span className="text-navy/20">/ Overview</span>
          </h1>
        </div>
        <div className="glass px-6 py-4 rounded-3xl flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-black text-muted uppercase tracking-widest">Business Date</div>
            <div className="text-sm font-bold text-navy">14 Aug 2025</div>
          </div>
          <div className="w-[1px] h-8 bg-border"></div>
          <div className="text-2xl">📅</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {STATS.map((stat, i) => (
          <div key={i} className="tesla-card group bg-white shadow-xl hover:shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center text-2xl transition-transform group-hover:scale-110`}>
                  {stat.icon}
                </div>
                <div className="text-[10px] font-black px-3 py-1.5 bg-navy/5 rounded-full text-navy/60 uppercase tracking-widest">
                  {stat.trend}
                </div>
              </div>
              <div className="text-[11px] font-black text-navy/40 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
              <div className="text-3xl font-black text-navy tracking-tight" style={{ fontFamily: 'var(--font-tesla)' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif font-black text-navy">Recent Invoices</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-saffron border-b-2 border-saffron/20 hover:border-saffron transition-all pb-1">
              View Bazaar →
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-6 p-5 rounded-3xl hover:bg-cream/50 transition-colors border border-transparent hover:border-border group">
                <div className="w-14 h-14 rounded-2xl bg-white flex flex-col items-center justify-center border border-border shadow-sm group-hover:rotate-3 transition-transform">
                  <span className="text-[8px] font-black text-muted uppercase">Inv</span>
                  <span className="text-sm font-bold text-navy">#892</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-navy">Bilal Khan</div>
                  <div className="text-[10px] text-muted font-medium uppercase tracking-tighter">Puma RS-X · Size 9</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-navy">₹ 4,999</div>
                  <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">Paid via UPI</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Node Feed */}
        <div className="glass-dark rounded-[2.5rem] p-10 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/10 blur-[100px]"></div>
          <h3 className="text-2xl font-serif font-black mb-8 relative z-10">System Alerts</h3>
          <div className="space-y-8 relative z-10">
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-saffron mt-1.5 shadow-[0_0_10px_#F4840A]"></div>
              <div>
                <div className="text-xs font-bold text-white/90">Local Node Status</div>
                <div className="text-[10px] text-white/40 mt-1 uppercase tracking-tighter font-medium">Syncing with PrimeSetu Core · Stable</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shadow-[0_0_10px_#10B981]"></div>
              <div>
                <div className="text-xs font-bold text-white/90">Native POS Active</div>
                <div className="text-[10px] text-white/40 mt-1 uppercase tracking-tighter font-medium">Terminal 001 ready for high-speed billing</div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-saffron flex items-center justify-center text-xl">
                ⚙️
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Operations Hub</div>
                <div className="text-xs font-bold text-white">All Systems Native</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
