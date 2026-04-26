/* ============================================================
 * PrimeSetu — Dashboard
 * Design: Linear/Vercel Bento Grid with proper dark tokens
 * © 2026 AITDL Network
 * ============================================================ */
import { useLanguage } from '@/hooks/useLanguage'
import { useStore } from '@/hooks/useStore'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { TrendingUp, Package, Receipt, AlertTriangle, Wifi, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion } from 'framer-motion'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } } }

export default function Dashboard() {
  const { t } = useLanguage()
  const { store } = useStore()
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const today = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: api.dashboard.getStats })

  const KPIs = [
    {
      label: 'Today\'s Revenue',
      value: `₹${(stats?.today_revenue || 84200).toLocaleString('en-IN')}`,
      change: stats?.revenue_change || 12.4,
      icon: TrendingUp,
      accent: 'var(--green)',
      accentBg: 'var(--green-bg)',
    },
    {
      label: 'Active SKUs',
      value: (stats?.active_skus || 1842).toLocaleString(),
      change: null,
      icon: Package,
      accent: 'var(--blue)',
      accentBg: 'var(--blue-bg)',
    },
    {
      label: 'Bills Today',
      value: (stats?.bills_today || 127).toString(),
      change: stats?.bills_change || 8.1,
      icon: Receipt,
      accent: 'var(--accent)',
      accentBg: 'var(--accent-bg)',
    },
    {
      label: 'Low Stock Alerts',
      value: (stats?.low_stock_alerts || 4).toString(),
      change: null,
      icon: AlertTriangle,
      accent: 'var(--red)',
      accentBg: 'var(--red-bg)',
    },
  ]

  const recentBills = [
    { id: 'INV-1892', customer: 'Ramesh Kumar', items: 'Nike Air Max · Size 9', amount: 8499, method: 'UPI', time: '2 min ago' },
    { id: 'INV-1891', customer: 'Priya Sharma', items: 'Levis 501 · W30 L32', amount: 3299, method: 'Card', time: '18 min ago' },
    { id: 'INV-1890', customer: 'Walk-in', items: '3 Items', amount: 1240, method: 'Cash', time: '31 min ago' },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* ── Header ── */}
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>
            {greeting}, {store?.name || 'Manager'}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Overview
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Business Date</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{today}</p>
        </div>
      </motion.div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPIs.map((kpi, i) => (
          <motion.div
            key={i}
            variants={item}
            className="p-4 rounded-xl cursor-default group transition-colors"
            style={{
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border-subtle)',
            }}
            whileHover={{ borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: kpi.accentBg }}>
                <kpi.icon size={15} style={{ color: kpi.accent }} strokeWidth={1.75} />
              </div>
              {kpi.change !== null && (
                <div className={`flex items-center gap-0.5 text-xs font-medium`} style={{ color: kpi.change > 0 ? 'var(--green)' : 'var(--red)' }}>
                  {kpi.change > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {Math.abs(kpi.change)}%
                </div>
              )}
            </div>
            <div className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
              {kpi.label}
            </div>
            <div className="text-2xl font-semibold tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {kpi.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Recent Transactions */}
        <motion.div
          variants={item}
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h3>
            <button className="text-xs font-medium transition-colors" style={{ color: 'var(--accent-light)' }}>
              View all →
            </button>
          </div>
          <div>
            {recentBills.map((bill, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[var(--bg-float)] cursor-pointer"
                style={{ borderBottom: i < recentBills.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                  <Receipt size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{bill.customer}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{bill.items}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                    ₹{bill.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--green)' }}>{bill.method}</div>
                </div>
                <div className="text-[11px] shrink-0 w-16 text-right" style={{ color: 'var(--text-tertiary)' }}>{bill.time}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          variants={item}
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>System Status</h3>
          </div>
          <div className="px-5 py-4 space-y-4">
            {[
              { label: 'Node Connection', status: 'Stable', ok: true },
              { label: 'POS Terminal', status: 'Active', ok: true },
              { label: 'Database Sync', status: 'Synced', ok: true },
              { label: 'Till Status', status: 'Open', ok: true },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: row.ok ? 'var(--green)' : 'var(--red)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                </div>
                <span className="text-xs font-medium" style={{ color: row.ok ? 'var(--green)' : 'var(--red)' }}>{row.status}</span>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 mx-4 mb-4 rounded-lg" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={13} style={{ color: 'var(--accent-light)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Operations Hub</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>All systems nominal. Sovereign mode active.</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
