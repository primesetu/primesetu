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

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Tags, Box, Palette, Ruler, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession } from '@/hooks/useSession';
import { api } from '@/api/client';

export default function SalesDrilldownModule() {
  const { t } = useLanguage();
  const { session } = useSession();
  
  type AttributeType = 'category' | 'brand' | 'size' | 'color';
  const [activeAttr, setActiveAttr] = useState<AttributeType>('category');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDrilldown();
  }, [activeAttr]);

  const fetchDrilldown = async () => {
    try {
      setLoading(true);
      const res = await api.reports.getSalesByAttribute(activeAttr);
      setData(res.data || []);
    } catch (err) {
      console.error("Failed to fetch drilldown", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const maxRevenue = Math.max(...data.map(d => Number(d.total_revenue) || 0), 1);

  return (
    <div className="flex h-full gap-4 p-4">
      {/* ── Left Pane: Data Viewer ── */}
      <div className="flex-[3] shoper-panel flex flex-col bg-white overflow-hidden">
        <div className="p-6 border-b border-border bg-cream/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-navy/10 rounded-2xl flex items-center justify-center border border-navy/20">
              <BarChart3 className="w-7 h-7 text-navy" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-black text-navy">Sales Drill-down</h2>
              <p className="text-sm font-bold text-muted uppercase tracking-widest mt-1">Multi-Dimensional Analytics</p>
            </div>
          </div>
          <button className="btn-primary h-touch px-8 gap-3">
            <FileSpreadsheet className="w-5 h-5" /> Export CSV [F6]
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-white relative custom-scrollbar">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="grid grid-cols-[2fr_1fr_1.5fr] gap-4 p-4 text-xs font-black text-muted uppercase tracking-wider border-b border-border bg-cream/50 sticky top-0 z-10">
            <div>{activeAttr.toUpperCase()}</div>
            <div className="text-right">Units Sold</div>
            <div className="text-right">Net Revenue</div>
          </div>

          <div className="flex flex-col p-2 space-y-2">
            {data.length === 0 && !loading && (
              <div className="text-center p-10 text-muted font-bold text-lg">No data available for this dimension.</div>
            )}
            
            {data.map((row, i) => {
              const rev = Number(row.total_revenue) || 0;
              const pct = (rev / maxRevenue) * 100;
              
              return (
                <div key={i} className="relative group grid grid-cols-[2fr_1fr_1.5fr] gap-4 p-4 items-center bg-white border border-border rounded-xl hover:border-navy hover:shadow-lg transition-all">
                  {/* Progress bar background */}
                  <div 
                    className="absolute inset-0 bg-saffron/10 rounded-xl transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%`, zIndex: 0 }}
                  />
                  
                  <div className="relative z-10 font-black text-navy text-lg uppercase tracking-wider flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-navy text-gold flex items-center justify-center text-xs">
                      #{i + 1}
                    </span>
                    {row.label || "Unspecified"}
                  </div>
                  
                  <div className="relative z-10 text-right font-mono text-xl font-bold text-gray-600">
                    {row.total_qty}
                  </div>
                  
                  <div className="relative z-10 text-right font-mono text-2xl font-black text-navy">
                    {formatCurrency(rev)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right Pane: Dimensions ── */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="shoper-panel bg-navy text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <h3 className="text-xl font-black text-gold flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6" /> Dimensions
          </h3>
          <p className="text-sm text-white/70 mb-6 leading-relaxed">
            Slice and dice your POS transaction history across sovereign product attributes.
          </p>

          <div className="space-y-3">
            {[
              { id: 'category', label: 'Category', icon: Tags },
              { id: 'brand', label: 'Brand', icon: Box },
              { id: 'color', label: 'Color Variant', icon: Palette },
              { id: 'size', label: 'Size Group', icon: Ruler },
            ].map(dim => {
              const Icon = dim.icon;
              const isActive = activeAttr === dim.id;
              return (
                <button
                  key={dim.id}
                  onClick={() => setActiveAttr(dim.id as AttributeType)}
                  className={`w-full h-touch px-6 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-between transition-all ${
                    isActive 
                      ? 'bg-saffron text-navy shadow-lg shadow-saffron/20 border-2 border-transparent scale-[1.02]' 
                      : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-5 h-5" /> {dim.label}
                  </span>
                  {isActive && <div className="w-2 h-2 rounded-full bg-navy animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mini KPI Card */}
        <div className="shoper-panel bg-white p-6 border-b-4 border-amber-400">
          <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Top Performer ({activeAttr})</div>
          {data.length > 0 ? (
            <>
              <div className="text-2xl font-black text-navy uppercase truncate">{data[0].label || "Unspecified"}</div>
              <div className="text-sm font-bold text-emerald-600 mt-1">Leading with {formatCurrency(Number(data[0].total_revenue) || 0)}</div>
            </>
          ) : (
            <div className="text-lg font-bold text-muted">Awaiting Data</div>
          )}
        </div>
      </div>
    </div>
  );
}
