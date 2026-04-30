/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useMemo } from 'react';
import { 
  MoveRight, 
  MoveLeft, 
  History, 
  Search, 
  Filter, 
  Download, 
  PackageCheck, 
  PackageMinus, 
  PackagePlus,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  DataTable, 
  Badge, 
  Button, 
  Card, 
  Text 
} from '@/components/ui/SovereignUI';

export default function StockMovement() {
  const [filter, setFilter] = useState('ALL');

  const movements = useMemo(() => [
    { id: 1, type: 'IN', ref: 'PUR-8821', item: 'Nike Air Max 270', qty: 12, date: '2026-04-24 10:30 AM', source: 'HO MUMBAI', running_stock: 1245 },
    { id: 2, type: 'OUT', ref: 'INV-10245', item: 'Puma RS-X Bold', qty: 1, date: '2026-04-24 11:15 AM', source: 'POS T1', running_stock: 1244 },
    { id: 3, type: 'IN', ref: 'RET-0052', item: 'Nexus Cotton Tee', qty: 1, date: '2026-04-24 01:20 PM', source: 'RETURNS', running_stock: 1245 },
    { id: 4, type: 'OUT', ref: 'INV-10246', item: 'Nike Air Max 270', qty: 2, date: '2026-04-24 02:45 PM', source: 'POS T2', running_stock: 1243 },
  ].filter(m => filter === 'ALL' || m.type === filter), [filter]);

  // ── GRID COLUMNS ──
  const columns = useMemo(() => [
    {
      header: "TIMESTAMP",
      accessor: (item: any) => (
        <span className="text-[10px] font-mono font-bold text-navy/40 uppercase tracking-tight">
          {item.date}
        </span>
      ),
      width: 180,
      pinned: 'left' as const
    },
    {
      header: "REFERENCE NO",
      accessor: (item: any) => (
        <span className="font-mono font-black text-navy text-[11px] uppercase tracking-widest bg-navy/5 px-3 py-1 rounded-lg">
          {item.ref}
        </span>
      ),
      width: 160
    },
    {
      header: "ITEM DESCRIPTION",
      accessor: (item: any) => <span className="font-bold text-navy text-xs uppercase tracking-tight">{item.item}</span>,
      flex: 2
    },
    {
      header: "MOVEMENT QTY",
      accessor: (item: any) => (
        <div className="flex justify-center">
           <Badge variant={item.type === 'IN' ? 'success' : 'error'} className="h-7 px-4 text-[10px] font-black border-none font-mono">
              {item.type === 'IN' ? '+' : '-'}{item.qty}
           </Badge>
        </div>
      ),
      width: 130,
      className: 'text-center'
    },
    {
      header: "SOURCE/DEST",
      accessor: (item: any) => (
        <div className="flex justify-center">
           <Badge variant="muted" className="h-6 px-3 text-[9px] font-black uppercase tracking-widest bg-navy/5 text-navy/60 border-none">
              {item.source}
           </Badge>
        </div>
      ),
      width: 150,
      className: 'text-center'
    },
    {
      header: "RUNNING STOCK",
      accessor: (item: any) => (
        <span className="font-serif font-black text-navy text-lg tracking-tight">
          {item.running_stock.toLocaleString()}
        </span>
      ),
      width: 150,
      className: 'text-right',
      pinned: 'right' as const
    }
  ], []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 pb-20">
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/20 mb-4">
         <span>Home</span> <ChevronRight size={10} />
         <span>Inventory</span> <ChevronRight size={10} />
         <span className="text-navy/60">Movement Ledger</span>
      </nav>

      <div className="flex items-center justify-between bg-white/50 p-10 rounded-[40px] border border-navy/5 backdrop-blur-sm shadow-sm">
        <div>
          <h1 className="text-4xl font-serif font-black text-navy flex items-center gap-4">
            <History className="w-10 h-10 text-amber-600" />
            Stock Movement Ledger
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <TrendingUp size={14} className="text-amber-500" /> Historical Inventory Flow Audit Protocol
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="sec" size="lg" className="h-14 px-8 rounded-[2rem] gap-3">
            <Download size={18} /> EXPORT EXCEL
          </Button>
          <Button variant="pri" size="lg" className="h-14 px-10 rounded-[2rem] bg-navy text-white gap-3 shadow-2xl">
            <Filter size={18} /> ADVANCED FILTER
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total In-ward', value: '425 Units', icon: PackagePlus, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Total Out-ward', value: '182 Units', icon: PackageMinus, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Net Variance', value: '+243 Units', icon: PackageCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-10 rounded-[3rem] border-navy/5 shadow-xl group hover:-translate-y-2 transition-all">
            <div className="flex justify-between items-start mb-8">
               <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", stat.bg, stat.color)}>
                  <stat.icon size={28} />
               </div>
               <Text variant="xs" className="text-navy/30 uppercase tracking-[0.3em] font-black">{stat.label}</Text>
            </div>
            <div className="text-4xl font-serif font-black text-navy tracking-tight">{stat.value}</div>
          </Card>
        ))}
      </div>

      <Card className="rounded-[50px] border-navy/5 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        <div className="bg-navy px-10 py-6 flex justify-between items-center text-white">
          <h3 className="font-serif font-black uppercase tracking-tight text-lg">Movement History</h3>
          <div className="flex gap-3">
            {['ALL', 'IN', 'OUT'].map((t) => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === t ? 'bg-amber-500 text-navy shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1">
           <DataTable 
             data={movements}
             columns={columns}
             overlayNoRowsTemplate={`
                <div class="flex flex-col items-center justify-center opacity-10 h-full">
                   <RefreshCw size="60" class="mb-4" />
                   <div class="text-xs font-black uppercase tracking-[0.4em]">Fetching Movement DNA...</div>
                </div>
             `}
           />
        </div>
      </Card>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
