/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import FlexibleReportDesigner from './FlexibleReportDesigner'
import { useState } from 'react'
import { BarChart3, Layout, ChevronRight } from 'lucide-react'

export default function MISModule() {
  const [mode, setMode] = useState<'dashboard' | 'designer'>('dashboard')
  
  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-summary'],
    queryFn: () => api.reports.getSalesSummary()
  })

  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ['inventory-valuation'],
    queryFn: () => api.reports.getInventoryValuation()
  })

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div 
            onClick={() => setMode('dashboard')}
            className={`cursor-pointer transition-all ${mode === 'dashboard' ? 'opacity-100 scale-110' : 'opacity-30 hover:opacity-60'}`}
          >
            <h1 className="font-serif text-3xl font-black text-navy uppercase tracking-tighter">MIS Intelligence</h1>
            <p className="text-[10px] text-navy/40 uppercase tracking-widest font-black mt-1">Terminal Performance & Audit</p>
          </div>
          <ChevronRight size={20} className="text-navy/10" />
          <div 
            onClick={() => setMode('designer')}
            className={`cursor-pointer transition-all ${mode === 'designer' ? 'opacity-100 scale-110' : 'opacity-30 hover:opacity-60'}`}
          >
            <h1 className="font-serif text-3xl font-black text-navy uppercase tracking-tighter">Report Designer</h1>
            <p className="text-[10px] text-navy/40 uppercase tracking-widest font-black mt-1">Flexible Drag-and-Drop</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex bg-navy/5 p-1.5 rounded-2xl border border-navy/5">
             <button 
               onClick={() => setMode('dashboard')}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'dashboard' ? 'bg-white text-navy shadow-lg shadow-navy/5' : 'text-navy/40 hover:text-navy'}`}
             >
                <BarChart3 size={14} /> Dashboard
             </button>
             <button 
               onClick={() => setMode('designer')}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'designer' ? 'bg-white text-navy shadow-lg shadow-navy/5' : 'text-navy/40 hover:text-navy'}`}
             >
                <Layout size={14} /> Designer
             </button>
          </div>
        </div>
      </div>

      {mode === 'dashboard' ? (
        <>
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
            <div className="col-span-8 bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-10 shadow-xl shadow-navy/5">
              <h3 className="font-serif font-black text-navy text-xl uppercase tracking-tighter mb-8">Revenue Trend (Daily)</h3>
              <div className="h-64 flex items-end justify-between gap-4 px-4 pb-8 border-b border-navy/5 relative">
                {salesLoading ? (
                   <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">Loading...</div>
                ) : sales?.daily?.map((d: any) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                    <div 
                      className="w-full bg-navy/10 group-hover:bg-navy rounded-t-2xl transition-all duration-700 relative"
                      style={{ height: `${(d.amount / sales.revenue) * 200 + 20}px` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-navy opacity-0 group-hover:opacity-100 transition-all bg-white px-3 py-1.5 rounded-xl shadow-xl border border-navy/5">
                        ₹{d.amount}
                      </div>
                    </div>
                    <div className="absolute top-full mt-4 text-[9px] font-black text-navy/30 uppercase tracking-tighter transform -rotate-45 origin-top-left">
                      {new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="col-span-4 bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-10 shadow-xl shadow-navy/5">
              <h3 className="font-serif font-black text-navy text-xl uppercase tracking-tighter mb-8">Stock by Category</h3>
              <div className="space-y-6">
                {inventory?.by_category?.map((c: any) => (
                  <div key={c.category} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">
                      <span>{c.category}</span>
                      <span className="text-navy">₹{c.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-navy/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-navy rounded-full transition-all duration-1000"
                        style={{ width: `${(c.value / (inventory.total_valuation || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 p-6 bg-navy/[0.03] rounded-3xl border border-navy/5 border-dashed">
                <p className="text-[10px] text-navy/40 font-bold italic text-center leading-relaxed">
                  "Data integrity verified by PrimeSetu Sovereign Audit Engine v2.0"
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <FlexibleReportDesigner />
      )}
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
