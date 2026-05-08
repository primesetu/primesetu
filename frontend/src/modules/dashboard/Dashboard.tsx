/* ============================================================
 * SMRITI-OS — Dashboard
 * Design: Linear/Vercel Bento Grid with proper dark tokens
 * © 2026 AITDL Network
 * ============================================================ */
import { useLanguage } from '@/hooks/useLanguage'
import { useStore } from '@/hooks/useStore'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { TrendingUp, Package, Receipt, AlertTriangle, Wifi, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

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
      accent: 'var(--secondary)',
      accentBg: 'var(--secondary)/10',
      metricVariant: '',           // default teal top-border
    },
    {
      label: 'Active SKUs',
      value: (stats?.active_skus || 1842).toLocaleString(),
      change: null,
      icon: Package,
      accent: 'var(--primary)',
      accentBg: 'var(--primary)/10',
      metricVariant: '',
    },
    {
      label: 'Bills Today',
      value: (stats?.bills_today || 127).toString(),
      change: stats?.bills_change || 8.1,
      icon: Receipt,
      accent: 'var(--accent)',
      accentBg: 'var(--accent)/10',
      metricVariant: 'is-accent',  // gold top-border
    },
    {
      label: 'Low Stock Alerts',
      value: (stats?.low_stock_alerts || 4).toString(),
      change: null,
      icon: AlertTriangle,
      accent: 'var(--danger)',
      accentBg: 'var(--danger)/10',
      metricVariant: 'is-danger',  // red top-border
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
      className="space-y-[var(--space-4)]"
    >
      {/* ── Header ── */}
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <p className="text-[var(--text-tertiary)] text-sm font-medium mb-[var(--space-1)]">
            {greeting}, {store?.name || 'Manager'}
          </p>
          <h1 className="text-[var(--text-primary)] text-2xl font-semibold tracking-tight">
            Overview
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[var(--text-tertiary)] text-xs">Business Date</p>
          <p className="text-[var(--text-primary)] text-sm font-semibold">{today}</p>
        </div>
      </motion.div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--space-3)]">
        {KPIs.map((kpi, i) => (
          <motion.div
            key={i}
            variants={item}
            className={cn(
              "card-base c-card--metric p-[var(--space-4)] cursor-default group transition-colors hover:border-[var(--border-default)]",
              kpi.metricVariant
            )}
          >
            <div className="flex items-start justify-between mb-[var(--space-4)]">
              <div 
                className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center" 
                style={{ background: `color-mix(in srgb, ${kpi.accent}, transparent 90%)` } as React.CSSProperties}
              >
                <kpi.icon size={15} style={{ color: kpi.accent }} strokeWidth={1.75} />
              </div>
              {kpi.change !== null && (
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  kpi.change > 0 ? "text-[var(--secondary)]" : "text-[var(--danger)]"
                )}>
                  {kpi.change > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {Math.abs(kpi.change)}%
                </div>
              )}
            </div>
            <div className="text-[var(--text-tertiary)] uppercase text-[10px] font-bold tracking-widest mb-[var(--space-1)]">
              {kpi.label}
            </div>
            <div className="text-[var(--text-primary)] font-mono text-2xl font-semibold tracking-tight">
              {kpi.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-3)]">

        {/* Recent Transactions */}
        <motion.div
          variants={item}
          className="lg:col-span-2 card-base rounded-[var(--radius-lg)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-[var(--space-5)] py-[var(--space-4)] border-b border-[var(--border-subtle)]">
            <h3 className="text-[var(--text-primary)] text-sm font-semibold">Recent Transactions</h3>
            <button className="text-[var(--accent)] text-xs font-medium transition-colors hover:opacity-80">
              View all →
            </button>
          </div>
          <div>
            {recentBills.map((bill, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-[var(--space-4)] px-[var(--space-5)] py-[var(--space-3)] transition-colors hover:bg-[var(--surface-elevated)] cursor-pointer",
                  i < recentBills.length - 1 && "border-b border-[var(--border-subtle)]"
                )}
              >
                <div className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                  <Receipt size={14} className="text-[var(--text-tertiary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[var(--text-primary)] text-sm font-medium truncate">{bill.customer}</div>
                  <div className="text-[var(--text-tertiary)] text-xs truncate">{bill.items}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[var(--text-primary)] font-mono text-sm font-semibold">
                    ₹{bill.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-[var(--secondary)] font-bold">{bill.method}</div>
                </div>
                <div className="text-[var(--text-tertiary)] text-[11px] shrink-0 w-16 text-right">{bill.time}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          variants={item}
          className="card-base rounded-[var(--radius-lg)] overflow-hidden"
        >
          <div className="px-[var(--space-5)] py-[var(--space-4)] border-b border-[var(--border-subtle)]">
            <h3 className="text-[var(--text-primary)] text-sm font-semibold">System Status</h3>
          </div>
          <div className="px-[var(--space-5)] py-[var(--space-4)] space-y-[var(--space-4)]">
            {[
              { label: 'Node Connection', status: 'Stable', ok: true },
              { label: 'POS Terminal', status: 'Active', ok: true },
              { label: 'Database Sync', status: 'Synced', ok: true },
              { label: 'Till Status', status: 'Open', ok: true },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-[var(--space-2)]">
                  <div className={cn("w-1.5 h-1.5 rounded-full", row.ok ? "bg-[var(--secondary)]" : "bg-[var(--danger)]")} />
                  <span className="text-[var(--text-secondary)] text-sm">{row.label}</span>
                </div>
                <span className={cn("text-xs font-medium", row.ok ? "text-[var(--secondary)]" : "text-[var(--danger)]")}>{row.status}</span>
              </div>
            ))}
          </div>

          <div className="mx-[var(--space-4)] mb-[var(--space-4)] p-[var(--space-4)] rounded-[var(--radius-md)] bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-2)]">
              <Activity size={13} className="text-[var(--accent)]" />
              <span className="text-[var(--text-primary)] text-xs font-medium">Operations Hub</span>
            </div>
            <p className="text-[var(--text-tertiary)] text-xs">All systems nominal. Sovereign mode active.</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}




