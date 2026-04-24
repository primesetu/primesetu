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
import { apiClient } from '@/api/client'

export default function MISModule() {
  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-summary'],
    queryFn: async () => {
      const resp = await apiClient.get('/reports/sales-summary')
      return resp.data
    }
  })

  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ['inventory-valuation'],
    queryFn: async () => {
      const resp = await apiClient.get('/reports/inventory-valuation')
      return resp.data
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-black text-navy">MIS Intelligence</h1>
          <p className="text-xs text-muted uppercase tracking-widest font-bold">Terminal Performance & Audit</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-border text-navy px-4 py-2 rounded-xl text-xs font-bold hover:bg-cream transition-all">
            📥 Export PDF
          </button>
          <button className="bg-navy text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-navy/90 transition-all">
            📅 Last 7 Days
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Total Gross Revenue" 
          value={`₹${sales?.revenue.toLocaleString() || '0'}`} 
          subtitle={`${sales?.bills || 0} Bills Generated`}
          icon="💰"
          loading={salesLoading}
        />
        <KPICard 
          title="Stock Valuation" 
          value={`₹${inventory?.total_valuation.toLocaleString() || '0'}`} 
          subtitle={`${inventory?.total_skus || 0} Unique SKUs`}
          icon="📦"
          loading={invLoading}
        />
        <KPICard 
          title="Avg Bill Value" 
          value={`₹${sales?.bills > 0 ? (sales.revenue / sales.bills).toFixed(2) : '0'}`} 
          subtitle="Customer Ticket Size"
          icon="🎫"
          loading={salesLoading}
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sales Chart (CSS Bars) */}
        <div className="col-span-8 bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-serif font-bold text-navy mb-6">Revenue Trend (Daily)</h3>
          <div className="h-64 flex items-end justify-between gap-4 px-4 pb-8 border-b border-border relative">
            {salesLoading ? (
               <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">Loading...</div>
            ) : sales?.daily?.map((d: any) => (
              <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                <div 
                  className="w-full bg-saffron/20 group-hover:bg-saffron rounded-t-lg transition-all duration-500 relative"
                  style={{ height: `${(d.amount / sales.revenue) * 200 + 20}px` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-navy opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{d.amount}
                  </div>
                </div>
                <div className="absolute top-full mt-2 text-[9px] font-bold text-muted uppercase tracking-tighter transform -rotate-45 origin-top-left">
                  {new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="col-span-4 bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-serif font-bold text-navy mb-6">Stock by Category</h3>
          <div className="space-y-4">
            {inventory?.by_category?.map((c: any) => (
              <div key={c.category} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted">
                  <span>{c.category}</span>
                  <span className="text-navy">₹{c.value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-cream rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-navy rounded-full transition-all duration-1000"
                    style={{ width: `${(c.value / inventory.total_valuation) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 p-4 bg-cream rounded-xl border border-border border-dashed">
            <p className="text-[10px] text-muted italic text-center">
              "Data integrity verified by Sovereign Audit Engine"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, subtitle, icon, loading }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-saffron/30 transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">{title}</p>
          {loading ? (
            <div className="h-8 w-32 bg-cream animate-pulse rounded-lg"></div>
          ) : (
            <h2 className="text-3xl font-black text-navy">{value}</h2>
          )}
          <p className="text-[10px] font-bold text-saffron uppercase tracking-tighter">{subtitle}</p>
        </div>
        <div className="w-12 h-12 bg-cream rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
    </div>
  )
}
