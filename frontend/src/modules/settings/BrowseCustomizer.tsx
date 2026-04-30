/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Layout, 
  Columns, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Type, 
  ChevronRight,
  Monitor,
  ShieldAlert,
  Box
} from 'lucide-react';
import { api } from '@/api/client';
import { 
  Button, 
  Input, 
  Card, 
  Text, 
  Badge,
  DataTable 
} from '@/components/ui/SovereignUI';
import { cn } from '@/lib/utils';

const SCREENS = [
  { id: 'BILLING', label: 'Billing Terminal' },
  { id: 'ITEM_MASTER', label: 'Item Master Search' },
  { id: 'CUSTOMER_SEARCH', label: 'Customer Lookup' },
  { id: 'STOCK_LEDGER', label: 'Stock Movement Grid' }
];

export default function BrowseCustomizer() {
  const [selectedScreen, setSelectedScreen] = useState('BILLING');
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFields();
  }, [selectedScreen]);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const data = await api.config.getUIFields(selectedScreen);
      setFields(data);
    } catch (err) {
      console.error("Failed to fetch UI fields", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field: any) => {
    try {
      setSaving(true);
      await api.config.upsertUIField(field);
      // Optimistic UI update
      setFields(prev => prev.map(f => f.id === field.id ? field : f));
    } catch (err) {
      console.error("Failed to update field", err);
    } finally {
      setSaving(false);
    }
  };

  // ── GRID COLUMNS ──
  const columns = useMemo(() => [
    {
      header: "FIELD IDENTITY",
      accessor: (row: any) => (
        <div className="flex flex-col py-2">
          <span className="font-black text-white uppercase text-xs tracking-tight">{row.field_name}</span>
          <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">SHOPER_RECID: {row.shoper_recid || 'DYNAMIC'}</span>
        </div>
      ),
      flex: 1.5,
      pinned: 'left' as const
    },
    {
      header: "DISPLAY LABEL",
      accessor: (row: any) => (
        <div className="relative">
          <Input 
            defaultValue={row.display_label || row.field_name}
            onBlur={(e) => handleUpdate({ ...row, display_label: e.target.value })}
            className="h-10 bg-slate-900/50 border-slate-700/50 text-white font-black text-xs pl-10 focus:border-brand-gold"
          />
          <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        </div>
      ),
      width: 200
    },
    {
      header: "WIDTH (PX)",
      accessor: (row: any) => (
        <Input 
          type="number"
          defaultValue={row.column_width}
          onBlur={(e) => handleUpdate({ ...row, column_width: parseInt(e.target.value) })}
          className="h-10 bg-slate-900/50 border-slate-700/50 text-white font-black text-xs text-center focus:border-brand-gold w-24 mx-auto"
        />
      ),
      width: 120,
      className: 'text-center'
    },
    {
      header: "VISIBILITY",
      accessor: (row: any) => (
        <button 
          onClick={() => handleUpdate({ ...row, is_visible: !row.is_visible })}
          className={cn(
            "h-10 w-10 rounded-xl transition-all flex items-center justify-center mx-auto shadow-inner",
            row.is_visible ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-600"
          )}
        >
          {row.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      ),
      width: 120,
      className: 'text-center'
    },
    {
      header: "EDITABLE",
      accessor: (row: any) => (
        <button 
          onClick={() => handleUpdate({ ...row, is_editable: !row.is_editable })}
          className={cn(
            "h-10 w-10 rounded-xl transition-all flex items-center justify-center mx-auto shadow-inner",
            row.is_editable ? "bg-indigo-500/10 text-indigo-400" : "bg-slate-800 text-slate-600"
          )}
        >
          {row.is_editable ? <Unlock size={18} /> : <Lock size={18} />}
        </button>
      ),
      width: 120,
      className: 'text-center'
    },
    {
      header: "MANDATORY",
      accessor: (row: any) => (
        <button 
          onClick={() => handleUpdate({ ...row, is_mandatory: !row.is_mandatory })}
          className={cn(
            "w-12 h-6 rounded-full transition-all relative mx-auto",
            row.is_mandatory ? "bg-brand-gold shadow-lg shadow-brand-gold/20" : "bg-slate-800"
          )}
        >
          <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", row.is_mandatory ? "right-1" : "left-1")}></div>
        </button>
      ),
      width: 120,
      className: 'text-center'
    },
    {
      header: "PROTOCOL",
      accessor: (row: any) => (
         <div className="flex justify-end pr-4">
            {saving ? <RefreshCw className="animate-spin text-brand-gold" size={16} /> : <ShieldAlert className="text-slate-800 group-hover:text-brand-gold transition-colors" size={16} />}
         </div>
      ),
      width: 100,
      pinned: 'right' as const
    }
  ], [saving]);

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 h-full p-2">
      <div className="flex justify-between items-center bg-slate-900 p-10 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 rotate-12 -translate-y-8">
           <Monitor size={220} />
        </div>
        <div className="flex items-center gap-8 relative z-10">
           <div className="h-20 w-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-inner">
              <Layout className="w-10 h-10 text-brand-gold" />
           </div>
           <div>
             <Text variant="h1" className="font-serif font-black text-white uppercase tracking-tighter leading-none">Browse Customizer</Text>
             <Text variant="xs" className="text-slate-500 font-black uppercase tracking-[0.4em] mt-3">Parity with Shoper 9 BrowseSettings · Sovereign UI Sync</Text>
           </div>
        </div>
        
        <div className="flex gap-3 p-2 bg-white/5 rounded-[2.5rem] border border-white/10 relative z-10">
          {SCREENS.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedScreen(s.id)}
              className={cn(
                "px-8 h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
                selectedScreen === s.id ? 'bg-white text-navy shadow-2xl' : 'text-slate-500 hover:text-white hover:bg-white/5'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="rounded-[4.5rem] bg-slate-900 border border-white/5 shadow-2xl overflow-hidden flex flex-col flex-1 relative min-h-[500px]">
        <div className="px-12 py-8 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div className="flex items-center gap-4">
             <div className="h-3 w-3 bg-brand-gold rounded-full animate-pulse" />
             <Text variant="xs" className="font-black text-slate-500 uppercase tracking-[0.4em]">Field Protocol Registry: {selectedScreen}</Text>
          </div>
          <Badge variant="info" className="bg-white/5 text-white font-black text-[9px] uppercase tracking-widest border-none px-4">Institutional Lock Active</Badge>
        </div>

        <div className="flex-1 overflow-hidden">
           <DataTable 
             data={fields} 
             columns={columns} 
             loading={loading}
             rowHeight={80}
             overlayNoRowsTemplate={`
               <div class="flex flex-col items-center justify-center opacity-10 h-full">
                  <Box size="60" class="mb-4 text-white" />
                  <div class="text-xs font-black uppercase tracking-[0.4em] text-white">No Custom Fields Defined</div>
               </div>
             `}
           />
        </div>
      </Card>
      
      <div className="flex justify-between items-center p-10 bg-brand-gold rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute left-0 top-0 opacity-10 -translate-x-4">
           <RefreshCw size={120} className="group-hover:rotate-180 transition-transform duration-1000" />
        </div>
        <div>
          <Text variant="h3" className="font-black text-navy uppercase tracking-tight leading-none mb-2">Protocol Real-Time Sync</Text>
          <Text variant="xs" className="font-black text-navy/40 uppercase tracking-widest">All UI changes propagate to nodes immediately upon save signature.</Text>
        </div>
        <Button className="h-16 px-12 bg-navy text-white rounded-[2rem] shadow-2xl font-black text-[10px] uppercase tracking-widest gap-3 hover:scale-105 transition-all">
          <RefreshCw className="w-5 h-5 text-brand-gold" /> SYNC ALL NODE TERMINALS
        </Button>
      </div>
    </div>
  );
}
