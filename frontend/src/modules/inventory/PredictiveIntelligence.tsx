/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, AlertCircle, Package, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export const PredictiveIntelligence: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'predictive'],
    queryFn: () => api.inventory.getPredictive(),
    refetchInterval: 300000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="h-48 animate-pulse bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
        <div className="text-white/20 text-xs font-black uppercase tracking-widest">Predicting Demand...</div>
      </div>
    );
  }

  const stats = data as {
    stockout_forecast_count: number;
    top_category: string;
    predicted_days: number;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-navy border-2 border-rose-500/30 rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingDown size={80} className="text-rose-500" />
        </div>
        <div className="text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
          <AlertCircle size={12} /> Stockout Risk [7-Day]
        </div>
        <div className="text-4xl font-black text-white font-mono">{stats.stockout_forecast_count}</div>
        <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">SKUs at critical level</div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-navy border-2 border-gold/30 rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Calendar size={80} className="text-gold" />
        </div>
        <div className="text-gold text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
          <Package size={12} /> Avg. Days of Cover
        </div>
        <div className="text-4xl font-black text-white font-mono">{stats.predicted_days}</div>
        <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Overall Inventory Runway</div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-navy border-2 border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
          Velocity Hotspot
        </div>
        <div className="text-xl font-black text-white uppercase tracking-tight">{stats.top_category}</div>
        <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Highest demand velocity</div>
      </motion.div>
    </div>
  );
};
