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
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

interface Stats {
  today_revenue: number
  active_skus: number
  bills_today: number
  low_stock_alerts: number
  revenue_change: number
  sku_change: number
}

const MODULES = [
  { id: 'billing',   name: 'Billing & POS',   icon: '🧾', path: '/billing',   desc: 'Counter Sales & GST' },
  { id: 'inventory', name: 'Inventory',       icon: '📦', path: '/inventory', desc: 'Stock & SKU Mgmt' },
  { id: 'schemes',   name: 'Offer Schemes',   icon: '🏷️', path: '/schemes',   desc: 'Promos & Loyalty' },
  { id: 'ho',        name: 'HO Control',      icon: '🏢', path: '/ho',        desc: 'Centralized Admin' },
  { id: 'mis',       name: 'MIS Reports',     icon: '📊', path: '/mis',       desc: 'Analytics & Insights' },
  { id: 'alerts',    name: 'Stock Alerts',    icon: '⚠️', path: '/alerts',      desc: 'Critical Reorders' },
  { id: 'users',     name: 'Staff Access',    icon: '👥', path: '/users',      desc: 'Role Management' },
  { id: 'ledgers',   name: 'Sovereign Ledger', icon: '📖', path: '/ledgers',    desc: 'Audit & Accounts' },
  { id: 'settings',  name: 'System Config',   icon: '⚙️', path: '/settings',   desc: 'Hardware & OS' },
]

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const resp = await fetch('http://localhost:8000/api/v1/dashboard/stats')
      if (!resp.ok) throw new Error('Failed to fetch stats')
      return resp.json()
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black text-navy">Store Aangan</h1>
          <p className="text-sm text-muted mt-1 uppercase tracking-widest font-semibold">Real-Time Terminal Intelligence</p>
        </div>
        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-tighter bg-white px-3 py-1.5 rounded-full border border-border shadow-sm">
          <span className="text-green-600">● Live</span>
          <span className="text-navy/40">Terminal T1</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Today's Revenue" 
          value={`₹${stats?.today_revenue.toLocaleString() || '0'}`} 
          change={stats?.revenue_change || 0} 
          loading={isLoading}
          icon="💰"
        />
        <StatsCard 
          title="Active SKUs" 
          value={stats?.active_skus.toString() || '0'} 
          change={stats?.sku_change || 0} 
          loading={isLoading}
          icon="📦"
        />
        <StatsCard 
          title="Bills Printed" 
          value={stats?.bills_today.toString() || '0'} 
          change={5.2} 
          loading={isLoading}
          icon="📜"
        />
        <StatsCard 
          title="Low Stock" 
          value={stats?.low_stock_alerts.toString() || '0'} 
          change={-2} 
          loading={isLoading}
          icon="🚨"
          danger={Number(stats?.low_stock_alerts) > 5}
        />
      </div>

      {/* Module Grid */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-navy flex items-center gap-2">
          <span className="w-8 h-[2px] bg-saffron rounded-full"></span>
          Terminal Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((mod) => (
            <Link 
              key={mod.id} 
              to={mod.path}
              className="group bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-xl hover:border-saffron/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl grayscale group-hover:grayscale-0 transition-all">{mod.icon}</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-saffron/10 transition-all">
                  {mod.icon}
                </div>
                <h3 className="font-bold text-navy text-lg group-hover:text-saffron transition-colors">{mod.name}</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">{mod.desc}</p>
                <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-saffron opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                  Open Module →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, change, loading, icon, danger }: any) {
  return (
    <div className={`bg-white p-6 rounded-2xl border ${danger ? 'border-red/20 bg-red/5' : 'border-border'} shadow-sm relative overflow-hidden group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-cream animate-pulse mt-1 rounded-lg"></div>
          ) : (
            <h3 className={`text-2xl font-black mt-1 ${danger ? 'text-red-600' : 'text-navy'}`}>{value}</h3>
          )}
        </div>
        <div className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>
        <span className="text-[10px] text-muted font-medium">vs last 24h</span>
      </div>
    </div>
  )
}
