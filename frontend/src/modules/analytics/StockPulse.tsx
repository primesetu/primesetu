/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useMemo } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp,
  Package,
  Activity,
  ChevronRight,
  Filter,
  BrainCircuit,
  Box
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useIntelligenceDoc } from '@/hooks/useIntelligence';
import { 
  Button, 
  Card, 
  Text, 
  Badge,
  DataTable 
} from '@/components/ui/SovereignUI';
import { cn } from '@/lib/utils';

export default function StockPulse() {
  const { data: analysis = [], isLoading: loading } = useIntelligenceDoc();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'bg-rose-500 text-white border-none shadow-lg shadow-rose-100';
      case 'WARNING': return 'bg-amber-500 text-white border-none shadow-lg shadow-amber-100';
      case 'OVERSTOCK': return 'bg-indigo-500 text-white border-none shadow-lg shadow-indigo-100';
      case 'DEAD': return 'bg-slate-500 text-white border-none shadow-lg shadow-slate-100';
      default: return 'bg-emerald-500 text-white border-none shadow-lg shadow-emerald-100';
    }
  };

  // ── INTELLIGENCE COLUMNS ──
  const columns = useMemo(() => [
    {
      header: "ENTITY IDENTITY",
      accessor: (row: any) => (
        <div className="flex items-center gap-6 py-2">
          <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center font-black text-xs text-navy/40 shadow-inner">
            {row.sku.charAt(0)}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-black text-navy text-sm uppercase tracking-tight">{row.name}</span>
            <span className="text-[9px] text-navy/30 font-black uppercase tracking-[0.2em] mt-1">{row.sku} · {row.brand}</span>
          </div>
        </div>
      ),
      flex: 2,
      pinned: 'left' as const
    },
    {
      header: "STOCK (UNITS)",
      accessor: 'stock',
      width: 130,
      className: 'text-center font-mono font-black text-navy'
    },
    {
      header: "30D VELOCITY",
      accessor: (row: any) => (
        <div className="flex flex-col items-center">
          <span className="font-black text-navy">{row.velocity}</span>
          <span className="text-[8px] font-black text-navy/20 uppercase tracking-tighter">Units / Day</span>
        </div>
      ),
      width: 140,
      className: 'text-center'
    },
    {
      header: "DAYS OF COVER",
      accessor: (row: any) => (
        <div className={cn(
          "inline-flex items-center justify-center px-6 py-2 rounded-2xl font-black text-sm border-2",
          row.doc < 7 ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-navy/5 border-transparent text-navy"
        )}>
          {row.doc}
        </div>
      ),
      width: 160,
      className: 'text-center'
    },
    {
      header: "HEALTH STATUS",
      accessor: (row: any) => (
        <Badge className={cn("px-4 py-2 font-black text-[9px] uppercase tracking-widest rounded-xl", getStatusColor(row.status))}>
          {row.status}
        </Badge>
      ),
      width: 160,
      pinned: 'right' as const
    }
  ], []);

  return (
    <div className="p-10 space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex justify-between items-center bg-white p-12 rounded-[4rem] shadow-sm border border-navy/5">
        <div className="flex items-center gap-8">
           <div className="h-20 w-20 bg-navy rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-navy/20">
              <Activity className="w-10 h-10 text-brand-gold" />
           </div>
           <div>
             <Text variant="h1" className="font-serif font-black text-navy uppercase tracking-tighter leading-none">Predictive Stock Pulse</Text>
             <Text variant="xs" className="text-navy/30 font-black uppercase tracking-[0.4em] mt-3">Phase 5 Operational Intelligence · Days of Cover Algorithm Active</Text>
           </div>
        </div>
        
        <div className="flex gap-4">
          <Button variant="sec" className="h-14 px-8 rounded-2xl border-navy/5 bg-white text-navy font-black text-[10px] uppercase tracking-widest gap-3 shadow-xl">
            <Filter className="w-5 h-5 text-brand-gold" /> Refine Heuristics
          </Button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'OOS Risk (Critical)', val: analysis.filter(a => a.status === 'CRITICAL').length, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Reorder Protocol', val: analysis.filter(a => a.status === 'WARNING').length, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Healthy Runway', val: analysis.filter(a => a.status === 'HEALTHY').length, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Inventory Bloat', val: analysis.filter(a => a.status === 'OVERSTOCK').length, icon: TrendingDown, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ].map((kpi, i) => (
          <Card key={i} className={cn("p-10 rounded-[3rem] shadow-xl border-none relative overflow-hidden group bg-white")}>
            <div className={cn("absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-1000", kpi.color)}>
               <kpi.icon size={120} />
            </div>
            <div className="relative z-10">
               <kpi.icon className={cn("w-8 h-8 mb-6", kpi.color)} />
               <Text variant="h1" className="text-4xl font-black text-navy mb-2">
                 {kpi.val} <span className="text-xs text-navy/20 font-sans uppercase tracking-widest">SKUs</span>
               </Text>
               <Text variant="xs" className="font-black text-navy/20 uppercase tracking-widest">{kpi.label}</Text>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Pulse Table */}
      <Card className="rounded-[4.5rem] shadow-2xl overflow-hidden border-none bg-white flex flex-col relative">
        <div className="absolute right-0 top-0 opacity-[0.02] p-10 rotate-12">
           <BrainCircuit size={200} />
        </div>
        <div className="px-12 py-10 border-b border-navy/5 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
             <div className="h-3 w-3 bg-brand-gold rounded-full animate-pulse" />
             <Text variant="xs" className="font-black text-navy uppercase tracking-[0.4em]">Intelligence Ledger · Real-Time Pulse</Text>
          </div>
          <Badge variant="info" className="bg-navy/5 text-navy font-black text-[9px] uppercase tracking-widest">30-Day Velocity MVA</Badge>
        </div>

        <div className="h-[500px]">
           <DataTable 
             data={analysis} 
             columns={columns} 
             loading={loading}
             overlayNoRowsTemplate={`
               <div class="flex flex-col items-center justify-center opacity-10 h-full">
                  <Box size="60" class="mb-4" />
                  <div class="text-xs font-black uppercase tracking-[0.4em]">Neural Data Unavailable</div>
               </div>
             `}
           />
        </div>
      </Card>
    </div>
  );
}
