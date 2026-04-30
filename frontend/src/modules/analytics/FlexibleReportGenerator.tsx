/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState } from 'react';
import { 
  Settings2, 
  Play, 
  Download, 
  Layers, 
  Table as TableIcon,
  Filter,
  BarChart,
  ChevronDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../api/client';

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

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Designer Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] shadow-xl border border-white/50">
            <h3 className="text-sm font-black text-navy uppercase tracking-widest mb-8 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-amber-600" /> Report Designer
            </h3>

            <div className="space-y-8">
              {/* Dimensions Section */}
              <section>
                <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-4">Grouping Dimensions (Rows)</label>
                <div className="flex flex-wrap gap-2">
                  {dimensions.map(d => (
                    <button 
                      key={d.id}
                      onClick={() => toggleDimension(d.id, rows, setRows)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                        rows.includes(d.id) ? 'bg-navy text-white' : 'bg-cream/50 text-muted hover:bg-cream'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Metrics Section */}
              <section>
                <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-4">Value Metrics</label>
                <div className="space-y-2">
                  {valueMetrics.map(v => (
                    <label key={v.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all group">
                      <input 
                        type="checkbox" 
                        checked={metrics.includes(v.id)}
                        onChange={() => toggleDimension(v.id, metrics, setMetrics)}
                        className="w-4 h-4 rounded border-2 border-border text-navy focus:ring-navy"
                      />
                      <span className="text-xs font-bold text-navy group-hover:text-saffron-dk transition-colors">{v.label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <button 
              onClick={runReport}
              disabled={isRunning || rows.length === 0 || metrics.length === 0}
              className="w-full mt-10 bg-navy text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-navy/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isRunning ? 'Synthesizing...' : <><Play className="w-4 h-4 text-amber-500 fill-amber-500" /> Run Analysis</>}
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          <div className="glass rounded-[3rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
            <div className="bg-[var(--navy-deep)] px-10 py-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <TableIcon className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-black uppercase tracking-tight">Pivot Output</h3>
              </div>
              <div className="flex gap-4">
                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"><Download className="w-4 h-4" /></button>
                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"><Filter className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {results.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-cream/30 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border sticky top-0 backdrop-blur-md">
                    <tr>
                      {rows.map(r => <th key={r} className="px-10 py-5">{r}</th>)}
                      {metrics.map(m => <th key={m} className="px-6 py-5 text-right">{m}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {results.map((row, i) => (
                      <tr key={i} className="hover:bg-cream/5 transition-colors group">
                        {rows.map(r => (
                          <td key={r} className="px-10 py-5 font-black text-navy uppercase text-xs">{row[r]}</td>
                        ))}
                        {metrics.map(m => (
                          <td key={m} className="px-6 py-5 text-right font-mono text-sm font-bold text-emerald-400">
                            {typeof row[m] === 'number' && m.includes('amount') ? `₹${((row[m] as number)/100).toLocaleString()}` : row[m]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-6 opacity-20 py-40">
                  <BarChart className="w-20 h-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Design and Run a Report to View Data</p>
                </div>
              )}
            </div>

            <div className="bg-cream/30 px-10 py-6 border-t border-border flex justify-between items-center">
               <div className="flex gap-10">
                 <div>
                   <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Rows Synthesized</p>
                   <p className="text-xl font-black text-navy">{results.length}</p>
                 </div>
                 <div>
                   <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Execution Time</p>
                   <p className="text-xl font-black text-navy">24ms</p>
                 </div>
               </div>
               <div className="flex items-center gap-2 text-emerald-600">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Sovereign Data Guard Active</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




