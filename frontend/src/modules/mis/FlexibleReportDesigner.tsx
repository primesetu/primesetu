/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState } from 'react';
import { 
  Layout, 
  GripVertical, 
  Trash2, 
  Play, 
  FileJson, 
  Table as TableIcon,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';

const AVAILABLE_DIMENSIONS = [
  { id: 'category', label: 'Category', icon: '📁' },
  { id: 'brand', label: 'Brand', icon: '🏷️' },
  { id: 'size', label: 'Size', icon: '📏' },
  { id: 'color', label: 'Color', icon: '🎨' },
  { id: 'month', label: 'Month', icon: '📅' },
  { id: 'year', label: 'Year', icon: '🗓️' },
  { id: 'store', label: 'Store Node', icon: '🏢' },
];

const AVAILABLE_METRICS = [
  { id: 'qty', label: 'Quantity', icon: '🔢' },
  { id: 'net_amount', label: 'Net Amount', icon: '💰' },
  { id: 'tax_amount', label: 'Tax Amount', icon: '🏛️' },
  { id: 'bills', label: 'Bill Count', icon: '🎫' },
];

export default function FlexibleReportDesigner() {
  const [rows, setRows] = useState<string[]>(['category']);
  const [cols, setCols] = useState<string[]>(['brand']);
  const [vals, setVals] = useState<string[]>(['qty', 'net_amount']);
  const [reportData, setReportData] = useState<{
    data: Record<string, any>[];
    metadata: {
      rows: string[];
      columns: string[];
      values: string[];
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('fieldId', id);
  };

  const handleDrop = (e: React.DragEvent, zone: 'rows' | 'cols' | 'vals') => {
    e.preventDefault();
    const id = e.dataTransfer.getData('fieldId');
    if (zone === 'rows' && !rows.includes(id)) setRows([...rows, id]);
    if (zone === 'cols' && !cols.includes(id)) setCols([...cols, id]);
    if (zone === 'vals' && !vals.includes(id)) setVals([...vals, id]);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const resp = await api.reports.generateFlexibleReport({
        rows,
        columns: cols,
        values: vals,
        filters: { month: new Date().getMonth() + 1, year: new Date().getFullYear() }
      });
      setReportData(resp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sidebar: Data Elements */}
      <div className="w-72 bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 flex flex-col shadow-xl shadow-navy/5">
        <h3 className="text-[10px] font-black text-navy/40 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
          <Layout size={14} /> Data Elements
        </h3>
        
        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
          <section>
            <h4 className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-4">Dimensions</h4>
            <div className="space-y-2">
              {AVAILABLE_DIMENSIONS.map(dim => (
                <div 
                  key={dim.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, dim.id)}
                  className="flex items-center justify-between p-4 bg-white border border-navy/5 rounded-2xl cursor-grab active:cursor-grabbing hover:border-navy/20 hover:shadow-lg hover:shadow-navy/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{dim.icon}</span>
                    <span className="text-[11px] font-bold text-navy uppercase tracking-wider">{dim.label}</span>
                  </div>
                  <GripVertical size={14} className="text-navy/20" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-4">Metrics</h4>
            <div className="space-y-2">
              {AVAILABLE_METRICS.map(met => (
                <div 
                  key={met.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, met.id)}
                  className="flex items-center justify-between p-4 bg-white border border-navy/5 rounded-2xl cursor-grab active:cursor-grabbing hover:border-navy/20 hover:shadow-lg hover:shadow-navy/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{met.icon}</span>
                    <span className="text-[11px] font-bold text-navy uppercase tracking-wider">{met.label}</span>
                  </div>
                  <GripVertical size={14} className="text-navy/20" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Main Designer Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Drop Zones */}
        <div className="grid grid-cols-3 gap-6">
          <DropZone 
            label="Rows (Y-Axis)" 
            items={rows} 
            onDrop={(e) => handleDrop(e, 'rows')} 
            onRemove={(id) => setRows(rows.filter(r => r !== id))}
          />
          <DropZone 
            label="Columns (X-Axis)" 
            items={cols} 
            onDrop={(e) => handleDrop(e, 'cols')} 
            onRemove={(id) => setCols(cols.filter(c => c !== id))}
          />
          <DropZone 
            label="Values (Metrics)" 
            items={vals} 
            onDrop={(e) => handleDrop(e, 'vals')} 
            onRemove={(id) => setVals(vals.filter(v => v !== id))}
          />
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-8 py-4 bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-lg shadow-navy/5">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-navy/40">
                <Filter size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Filters: April 2026</span>
             </div>
          </div>
          <button 
            onClick={generateReport}
            disabled={loading}
            className="flex items-center gap-3 bg-navy text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-navy/20 disabled:opacity-50"
          >
            {loading ? <span className="animate-pulse">Synthesizing...</span> : <><Play size={14} /> Run Report Designer</>}
          </button>
        </div>

        {/* Results Canvas */}
        <div className="flex-1 bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-10 shadow-xl shadow-navy/5 overflow-hidden flex flex-col">
          {reportData ? (
             <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-serif font-black text-navy uppercase tracking-tighter">Matrix Analysis</h3>
                   <div className="flex gap-2">
                      <button className="p-3 bg-navy/5 text-navy rounded-xl hover:bg-navy hover:text-white transition-all"><FileJson size={18} /></button>
                      <button className="p-3 bg-navy/5 text-navy rounded-xl hover:bg-navy hover:text-white transition-all"><TableIcon size={18} /></button>
                   </div>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar border border-navy/5 rounded-3xl">
                   <PivotTable report={reportData} />
                </div>
             </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-navy/20 gap-6">
              <div className="w-24 h-24 bg-navy/[0.03] rounded-full flex items-center justify-center animate-pulse">
                <Layout size={40} strokeWidth={1} />
              </div>
              <div className="text-center">
                <div className="text-sm font-black uppercase tracking-widest mb-1">Canvas Empty</div>
                <div className="text-[10px]">Drag dimensions and metrics to design your report</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DropZoneProps {
  label: string;
  items: string[];
  onDrop: (e: React.DragEvent) => void;
  onRemove: (id: string) => void;
}

function DropZone({ label, items, onDrop, onRemove }: DropZoneProps) {
  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="bg-white/50 backdrop-blur-xl border-2 border-dashed border-navy/10 rounded-[2rem] p-6 min-h-[140px] transition-all hover:border-navy/20 group"
    >
      <div className="text-[9px] font-black text-navy/30 uppercase tracking-[0.2em] mb-4 group-hover:text-navy/50 transition-colors">{label}</div>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {items.map((item: string) => (
            <motion.div 
              key={item}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-2 bg-navy text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-navy/10"
            >
              {item}
              <button onClick={() => onRemove(item)} className="hover:text-rose-400 transition-colors">
                <Trash2 size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="text-[10px] text-navy/10 font-bold uppercase mt-2">Drop Here</div>
        )}
      </div>
    </div>
  );
}

function PivotTable({ report }: { 
  report: { 
    data: Record<string, any>[]; 
    metadata: { rows: string[]; columns: string[]; values: string[]; } 
  } 
}) {
  const { data, metadata } = report;
  if (!data || data.length === 0) return <div className="p-10 text-center text-navy/40 font-bold">No data matches these dimensions.</div>;

  const headers = [...metadata.rows, ...metadata.columns, ...metadata.values];

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-navy sticky top-0 z-10">
          {headers.map(h => (
            <th key={h} className="px-6 py-4 text-[9px] font-black text-white/50 uppercase tracking-widest border-r border-white/5 last:border-0">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-navy/5 bg-white/30">
        {data.map((row: any, i: number) => (
          <tr key={i} className="hover:bg-navy/[0.02] transition-colors">
            {headers.map(h => (
              <td key={h} className={`px-6 py-4 text-xs ${metadata.values.includes(h) ? 'font-mono font-black text-navy' : 'font-bold text-navy/60 uppercase'}`}>
                {metadata.values.includes(h) && h.includes('amount') ? formatCurrency(row[h]) : row[h]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
