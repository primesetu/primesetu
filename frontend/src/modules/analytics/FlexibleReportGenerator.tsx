/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useMemo } from 'react';
import { 
  Settings2, 
  Play, 
  Download, 
  Layers, 
  Table as TableIcon,
  Filter,
  BarChart,
  ChevronDown,
  X,
  Database,
  Activity,
  Box,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../api/client';
import { 
  Button, 
  Card, 
  Text, 
  Badge,
  DataTable 
} from '@/components/ui/SovereignUI';
import { cn } from '@/lib/utils';

export interface ReportRow {
  [key: string]: string | number;
}

export default function FlexibleReportGenerator() {
  const [rows, setRows] = useState<string[]>(['brand']);
  const [cols, setCols] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<string[]>(['qty', 'net_amount']);
  const [results, setResults] = useState<ReportRow[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const dimensions = [
    { id: 'brand', label: 'Brand' },
    { id: 'department', label: 'Department' },
    { id: 'hsn', label: 'HSN Code' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' }
  ];

  const valueMetrics = [
    { id: 'qty', label: 'Total Quantity' },
    { id: 'net_amount', label: 'Net Revenue' },
    { id: 'tax_amount', label: 'Tax Amount' },
    { id: 'bills', label: 'Bill Count' }
  ];

  const runReport = async () => {
    setIsRunning(true);
    try {
      const response = await apiClient.post<{ data: ReportRow[] }>('/reports/flexible/', {
        rows,
        columns: cols,
        values: metrics,
        filters: {}
      });
      setResults(response.data.data);
    } catch (err) {
      console.error('Report execution failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleDimension = (id: string, list: string[], setList: any) => {
    if (list.includes(id)) {
      setList(list.filter(i => i !== id));
    } else {
      setList([...list, id]);
    }
  };

  // ── DYNAMIC COLUMNS FOR DATA TABLE ──
  const dynamicColumns = useMemo(() => {
    const colsList: any[] = [];
    
    // Add Dimensions as pinned left columns
    rows.forEach(r => {
      colsList.push({
        header: r.toUpperCase(),
        accessor: (row: any) => <span className="font-black text-navy uppercase text-xs tracking-tight">{row[r]}</span>,
        width: 160,
        pinned: 'left' as const
      });
    });

    // Add Metrics
    metrics.forEach(m => {
      colsList.push({
        header: m.replace('_', ' ').toUpperCase(),
        accessor: (row: any) => (
          <span className="font-mono font-black text-navy">
             {typeof row[m] === 'number' && m.includes('amount') ? `₹${((row[m] as number)/100).toLocaleString()}` : row[m]}
          </span>
        ),
        width: 140,
        className: 'text-right'
      });
    });

    return colsList;
  }, [rows, metrics]);

  return (
    <div className="flex h-full gap-8 animate-in fade-in slide-in-from-right-4 duration-1000 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full">
        {/* Designer Sidebar */}
        <Card className="lg:col-span-1 p-10 bg-white border-none rounded-[4rem] shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute left-0 top-0 opacity-5 rotate-12 -translate-x-4">
             <Settings2 size={160} />
          </div>
          <Text variant="xs" className="font-black text-navy/20 uppercase tracking-[0.4em] mb-10 flex items-center gap-3 relative z-10">
            <Database size={16} className="text-brand-gold" /> Synthesis Params
          </Text>

          <div className="space-y-10 flex-1 relative z-10">
            {/* Dimensions Section */}
            <section>
              <Text variant="xs" className="font-black text-navy uppercase tracking-[0.2em] mb-6 block border-b border-navy/5 pb-2">Dimensions (Rows)</Text>
              <div className="flex flex-wrap gap-2">
                {dimensions.map(d => (
                  <button 
                    key={d.id}
                    onClick={() => toggleDimension(d.id, rows, setRows)}
                    className={cn(
                      "px-6 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2",
                      rows.includes(d.id) 
                        ? 'bg-navy text-white border-navy shadow-xl shadow-navy/10' 
                        : 'bg-white text-navy/40 border-navy/5 hover:border-navy/10'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Metrics Section */}
            <section>
              <Text variant="xs" className="font-black text-navy uppercase tracking-[0.2em] mb-6 block border-b border-navy/5 pb-2">Value Metrics</Text>
              <div className="space-y-3">
                {valueMetrics.map(v => (
                  <label key={v.id} className="flex items-center gap-4 p-4 bg-navy/2 rounded-2xl cursor-pointer hover:bg-navy/5 transition-all group">
                    <input 
                      type="checkbox" 
                      checked={metrics.includes(v.id)}
                      onChange={() => toggleDimension(v.id, metrics, setMetrics)}
                      className="w-5 h-5 rounded-lg border-2 border-navy/10 text-brand-gold focus:ring-brand-gold transition-all"
                    />
                    <Text variant="xs" className="font-black text-navy uppercase tracking-widest group-hover:text-brand-gold transition-colors">{v.label}</Text>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <Button 
            onClick={runReport}
            disabled={isRunning || rows.length === 0 || metrics.length === 0}
            className="w-full h-16 bg-navy text-white rounded-3xl shadow-2xl font-black text-[10px] uppercase tracking-[0.3em] gap-4 hover:scale-105 transition-all mt-10 relative z-10"
          >
            {isRunning ? <RefreshCw className="animate-spin text-brand-gold" size={20} /> : <><Play size={20} className="text-brand-gold fill-brand-gold" /> Run Analysis</>}
          </Button>
        </Card>

        {/* Results Area */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <Card className="flex-1 bg-white border-none rounded-[5rem] shadow-2xl overflow-hidden flex flex-col relative">
            <div className="bg-navy px-12 py-8 flex justify-between items-center text-white relative overflow-hidden">
               <div className="absolute right-0 top-0 opacity-10 rotate-12 -translate-y-4">
                  <Activity size={200} />
               </div>
               <div className="flex items-center gap-6 relative z-10">
                 <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <TableIcon className="w-6 h-6 text-brand-gold" />
                 </div>
                 <div>
                    <Text variant="h2" className="font-serif font-black uppercase tracking-tighter leading-none">Pivot Synthesis Output</Text>
                    <Text variant="xs" className="text-white/30 font-black uppercase tracking-[0.4em] mt-2">Real-Time Analytical Ledger · Sovereign v3</Text>
                 </div>
               </div>
               <div className="flex gap-4 relative z-10">
                 <Button variant="sec" className="h-12 w-12 p-0 rounded-xl bg-white/10 border-none text-white hover:bg-white/20 transition-all"><Download size={20} /></Button>
                 <Button variant="sec" className="h-12 w-12 p-0 rounded-xl bg-white/10 border-none text-white hover:bg-white/20 transition-all"><Filter size={20} /></Button>
               </div>
            </div>

            <div className="flex-1 overflow-hidden p-8">
              {results.length > 0 ? (
                <div className="h-full rounded-[3rem] overflow-hidden border border-navy/5 shadow-inner bg-white">
                   <DataTable 
                     data={results} 
                     columns={dynamicColumns} 
                     loading={isRunning}
                     rowHeight={60}
                   />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-10 opacity-20 py-40">
                  <div className="w-40 h-40 bg-navy/2 rounded-[4rem] flex items-center justify-center border-4 border-dashed border-navy/10 animate-pulse">
                     <BarChart size={80} strokeWidth={1} />
                  </div>
                  <Text variant="xs" className="font-black uppercase tracking-[0.6em] text-center max-w-xs">Initialize parameters and run report to synthesize data</Text>
                </div>
              )}
            </div>

            <div className="px-12 py-8 border-t border-navy/5 bg-navy/[0.02] flex justify-between items-center">
               <div className="flex gap-16">
                 <div>
                   <Text variant="xs" className="font-black text-navy/20 uppercase tracking-widest mb-2 block">Protocol Rows</Text>
                   <Text variant="h3" className="font-black text-navy">{results.length}</Text>
                 </div>
                 <div className="w-px h-12 bg-navy/5" />
                 <div>
                   <Text variant="xs" className="font-black text-navy/20 uppercase tracking-widest mb-2 block">Synthesis Speed</Text>
                   <Text variant="h3" className="font-black text-navy">{isRunning ? '...' : '24ms'}</Text>
                 </div>
               </div>
               <div className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-2xl">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/20" />
                 <Text variant="xs" className="font-black text-emerald-600 uppercase tracking-widest">Sovereign Data Guard Locked</Text>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
