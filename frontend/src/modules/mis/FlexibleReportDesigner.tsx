/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useMemo } from 'react';
import { 
  Layout, 
  GripVertical, 
  Trash2, 
  Play, 
  FileJson, 
  Table as TableIcon,
  Filter,
  Layers,
  Activity,
  Box,
  ChevronRight,
  Database,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';
import { 
  Button, 
  Card, 
  Text, 
  Badge,
  DataTable 
} from '@/components/ui/SovereignUI';
import { cn } from '@/lib/utils';

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

  // ── DYNAMIC COLUMNS FOR DATA TABLE ──
  const dynamicColumns = useMemo(() => {
    if (!reportData) return [];
    const { metadata } = reportData;
    const headers = [...metadata.rows, ...metadata.columns, ...metadata.values];

    return headers.map(h => ({
      header: h.toUpperCase(),
      accessor: (row: any) => {
        const val = row[h];
        if (metadata.values.includes(h)) {
          return h.includes('amount') 
            ? <span className="font-mono font-black text-navy">{formatCurrency(val)}</span>
            : <span className="font-mono font-black text-navy">{val}</span>;
        }
        return <span className="font-black text-navy/40 uppercase tracking-widest">{val}</span>;
      },
      width: metadata.values.includes(h) ? 140 : 180,
      className: metadata.values.includes(h) ? 'text-right' : 'text-left'
    }));
  }, [reportData]);

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 overflow-hidden">
      {/* Sidebar: Data Elements */}
      <Card className="w-80 bg-white border-none rounded-[4rem] p-10 flex flex-col shadow-2xl overflow-hidden relative">
        <div className="absolute left-0 top-0 opacity-5 rotate-12 -translate-x-4">
           <Layers size={140} />
        </div>
        <Text variant="xs" className="font-black text-navy/20 uppercase tracking-[0.4em] mb-10 flex items-center gap-3 relative z-10">
          <Database size={16} className="text-brand-gold" /> Protocol Elements
        </Text>
        
        <div className="space-y-10 overflow-y-auto custom-scrollbar pr-4 relative z-10">
          <section>
            <Text variant="xs" className="font-black text-navy uppercase tracking-[0.2em] mb-6 block border-b border-navy/5 pb-2">Dimensions</Text>
            <div className="space-y-3">
              {AVAILABLE_DIMENSIONS.map(dim => (
                <div 
                  key={dim.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, dim.id)}
                  className="flex items-center justify-between p-5 bg-navy/5 border border-transparent rounded-2xl cursor-grab active:cursor-grabbing hover:bg-white hover:border-navy/10 hover:shadow-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{dim.icon}</span>
                    <Text variant="xs" className="font-black text-navy uppercase tracking-widest">{dim.label}</Text>
                  </div>
                  <GripVertical size={16} className="text-navy/10 group-hover:text-brand-gold transition-colors" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <Text variant="xs" className="font-black text-navy uppercase tracking-[0.2em] mb-6 block border-b border-navy/5 pb-2">Metrics</Text>
            <div className="space-y-3">
              {AVAILABLE_METRICS.map(met => (
                <div 
                  key={met.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, met.id)}
                  className="flex items-center justify-between p-5 bg-navy/5 border border-transparent rounded-2xl cursor-grab active:cursor-grabbing hover:bg-white hover:border-navy/10 hover:shadow-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{met.icon}</span>
                    <Text variant="xs" className="font-black text-navy uppercase tracking-widest">{met.label}</Text>
                  </div>
                  <GripVertical size={16} className="text-navy/10 group-hover:text-indigo-500 transition-colors" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </Card>

      {/* Main Designer Area */}
      <div className="flex-1 flex flex-col gap-8">
        {/* Drop Zones */}
        <div className="grid grid-cols-3 gap-8">
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
        <Card className="flex items-center justify-between px-10 py-6 bg-white border-none rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-5 rotate-12 -translate-y-4">
             <Activity size={100} />
          </div>
          <div className="flex items-center gap-6 relative z-10">
             <div className="flex items-center gap-3 text-navy/30">
                <Filter size={16} className="text-brand-gold" />
                <Text variant="xs" className="font-black uppercase tracking-[0.3em]">Institutional Pulse: April 2026 Active</Text>
             </div>
          </div>
          <Button 
            onClick={generateReport}
            disabled={loading}
            className="h-14 px-10 rounded-2xl bg-navy text-white shadow-2xl font-black text-[10px] uppercase tracking-widest gap-3 relative z-10 hover:scale-105 transition-all"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <><Play size={18} className="text-brand-gold" /> Run Report Designer</>}
          </Button>
        </Card>

        {/* Results Canvas */}
        <Card className="flex-1 bg-white border-none rounded-[4.5rem] p-12 shadow-2xl overflow-hidden flex flex-col">
          {reportData ? (
             <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                   <div className="flex items-center gap-4">
                      <div className="h-3 w-3 bg-brand-gold rounded-full animate-pulse" />
                      <Text variant="h2" className="font-serif font-black text-navy uppercase tracking-tighter leading-none">Matrix Synthesis Result</Text>
                   </div>
                   <div className="flex gap-4">
                      <Button variant="sec" className="h-12 w-12 p-0 rounded-xl bg-navy/5 border-none text-navy/40 hover:text-navy transition-all"><FileJson size={20} /></Button>
                      <Button variant="sec" className="h-12 w-12 p-0 rounded-xl bg-navy/5 border-none text-navy/40 hover:text-navy transition-all"><TableIcon size={20} /></Button>
                   </div>
                </div>
                <div className="flex-1 rounded-[3rem] overflow-hidden border border-navy/5 shadow-inner">
                   <DataTable 
                     data={reportData.data} 
                     columns={dynamicColumns} 
                     rowHeight={60}
                   />
                </div>
             </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-navy/10 gap-8">
              <div className="w-32 h-32 bg-navy/2 rounded-[3rem] flex items-center justify-center border-4 border-dashed border-navy/10 animate-pulse">
                <Layout size={60} strokeWidth={1} />
              </div>
              <div className="text-center space-y-2">
                <Text variant="h2" className="font-serif font-black uppercase tracking-widest text-navy/20">Canvas Initialized</Text>
                <Text variant="xs" className="font-black uppercase tracking-[0.4em] text-navy/10">Drag protocol elements to synthesize matrix</Text>
              </div>
            </div>
          )}
        </Card>
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
      className="bg-white/60 backdrop-blur-xl border-4 border-dashed border-navy/5 rounded-[3.5rem] p-8 min-h-[160px] transition-all hover:border-brand-gold/30 group flex flex-col shadow-inner"
    >
      <Text variant="xs" className="font-black text-navy/20 uppercase tracking-[0.4em] mb-6 group-hover:text-navy/40 transition-colors">{label}</Text>
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {items.map((item: string) => (
            <motion.div 
              key={item}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-3 bg-navy text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-2xl shadow-navy/20 border-b-4 border-brand-gold"
            >
              {item}
              <button onClick={() => onRemove(item)} className="hover:text-rose-400 transition-colors ml-2">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="text-[10px] text-navy/10 font-black uppercase mt-4 tracking-[0.2em] ml-2">Drop Protocol Element</div>
        )}
      </div>
    </div>
  );
}
