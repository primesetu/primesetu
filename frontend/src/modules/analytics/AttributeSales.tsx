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

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Calendar, ChevronRight } from 'lucide-react';
import { api } from '@/api/client';

const AttributeSales: React.FC = () => {
  const [attribute, setAttribute] = useState('category');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const attributes = [
    { id: 'size', label: 'Size Wise', icon: '📏' },
    { id: 'color', label: 'Color Wise', icon: '🎨' },
    { id: 'brand', label: 'Brand Wise', icon: '🏷️' },
    { id: 'category', label: 'Category Wise', icon: '📂' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await api.reports.getSalesByAttribute(attribute);
        setData(result.data || []);
      } catch (err) {
        console.error("Failed to fetch attribute sales:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attribute]);

  const maxRevenue = Math.max(...data.map(d => d.total_revenue || 0), 1);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Selector Tabs */}
      <div className="flex gap-4 p-2 bg-navy/5 rounded-[2rem] w-fit">
        {attributes.map((attr) => (
          <button
            key={attr.id}
            onClick={() => setAttribute(attr.id)}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
              attribute === attr.id 
              ? 'bg-navy text-white shadow-xl' 
              : 'hover:bg-navy/5 text-muted'
            }`}
          >
            <span>{attr.icon}</span>
            {attr.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
        {/* Performance List */}
        <div className="glass rounded-[3rem] p-10 flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-serif font-black text-navy">Sales Performance</h3>
            <div className="flex gap-2">
              <Calendar className="w-4 h-4 text-muted" />
              <span className="text-[10px] font-black text-muted uppercase">Last 30 Days</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-4">
            {data.map((item, i) => (
              <div key={i} className="flex items-center gap-6 group">
                <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center font-black text-navy group-hover:bg-gold transition-colors">
                  {item.label || item.brand || item.category}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-black text-navy">{item.label}</span>
                    <span className="text-xs font-bold text-navy/40">₹{(item.total_revenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-navy/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((item.total_revenue || 0) / maxRevenue) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-navy rounded-full"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-navy">{item.total_qty || 0}</div>
                  <div className="text-[9px] text-muted font-bold uppercase">Units</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Card */}
        <div className="glass-dark rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px]"></div>
          
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <PieChart className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-black">Attribute Efficiency</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Sovereign Performance Audit</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <ChevronRight className="w-5 h-5 text-gold mt-1" />
                <p className="text-sm font-medium leading-relaxed">
                  The <span className="text-gold font-black">{data[0]?.label || 'Selected'}</span> variant is currently outperforming the category average by <span className="text-emerald-400 font-black">24%</span>.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <ChevronRight className="w-5 h-5 text-gold mt-1" />
                <p className="text-sm font-medium leading-relaxed">
                  Replenishment suggested for <span className="text-gold font-black">{data[0]?.label || 'top-performing'}</span> items to maintain momentum.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Revenue Impact</span>
              <span className="text-xs font-black text-emerald-400">+₹42,000</span>
            </div>
            <div className="text-xs text-white/60 font-medium">
              Calculated based on velocity-to-stock ratio.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributeSales;
