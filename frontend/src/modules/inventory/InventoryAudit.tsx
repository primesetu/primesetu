/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useRef, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Scan, 
  Plus, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  History,
  ArrowRight,
  TrendingUp,
  BarChart2,
  ChevronRight,
  ShieldCheck,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion, AnimatePresence } from 'framer-motion';

import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';
import InventoryAuditReport from './InventoryAuditReport';
import MobileAudit from './MobileAudit';
import { 
  DataTable, 
  Badge, 
  Text, 
  Button, 
  Card, 
  Input,
  cn 
} from '@/components/ui/SovereignUI';

const InventoryAudit: React.FC = () => {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewReport, setViewReport] = useState<any | null>(null);
  const [mobileMode, setMobileMode] = useState(false);
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['inventory-audits'],
    queryFn: () => api.inventory.listAuditSessions()
  });

  const createMutation = useMutation({
    mutationFn: () => api.inventory.createAuditSession(),
    onSuccess: (data) => {
      setActiveSession(data);
      queryClient.invalidateQueries({ queryKey: ['inventory-audits'] });
    }
  });

  const addEntryMutation = useMutation({
    mutationFn: (data: { item_id: string; size: string; colour: string; physical_qty: number }) => 
      api.inventory.addAuditEntry(activeSession.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-session', activeSession?.id] });
    }
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => api.inventory.submitAudit(id),
    onSuccess: () => {
      setActiveSession(null);
      queryClient.invalidateQueries({ queryKey: ['inventory-audits'] });
    }
  });

  const { data: sessionDetails, isLoading: loadingSession } = useQuery({
    queryKey: ['audit-session', activeSession?.id],
    queryFn: () => api.inventory.getAuditSession(activeSession.id),
    enabled: !!activeSession?.id
  });

  const stats = React.useMemo(() => {
    if (!sessionDetails?.entries) return { scanned: 0, shortage: 0, surplus: 0 };
    return sessionDetails.entries.reduce((acc: any, entry: any) => {
      const v = entry.physical_qty - entry.book_qty;
      if (v < 0) acc.shortage += Math.abs(v);
      else if (v > 0) acc.surplus += v;
      acc.scanned += entry.physical_qty;
      return acc;
    }, { scanned: 0, shortage: 0, surplus: 0 });
  }, [sessionDetails]);

  // Hotkeys
  useHotkeys('f3', (e) => { e.preventDefault(); searchInputRef.current?.focus(); }, { enableOnFormTags: true });
  useHotkeys('f10', (e) => { e.preventDefault(); if (activeSession) submitMutation.mutate(activeSession.id); }, { enableOnFormTags: true });
  useHotkeys('esc', (e) => { e.preventDefault(); if (activeSession) setActiveSession(null); }, { enableOnFormTags: true });

  // Scanner Hook
  useBarcodeScanner((barcode) => {
    if (activeSession) {
      setSearchQuery(barcode);
      handleScan(barcode);
    }
  });

  const handleScan = async (barcode: string) => {
    if (!activeSession) return;
    try {
      const results = await api.inventory.search(barcode);
      const product = Array.isArray(results) ? results.find((p: any) => p.code === barcode || p.barcode === barcode) : null;
      if (product) {
        addEntryMutation.mutate({ 
          item_id: product.id, 
          size: product.size || 'UNI', 
          colour: product.color || 'NOS',
          physical_qty: 1 
        });
        setSearchQuery('');
      }
    } catch (err) {
      console.error('Scan failed:', err);
    }
  };

  const startAudit = () => createMutation.mutate();

  // Columns for History
  const historyColumns = useMemo(() => [
    {
      header: "SESSION REF",
      accessor: (item: any) => (
        <div className="flex flex-col py-1">
          <span className="font-mono font-black text-navy text-sm uppercase tracking-tight">{item.audit_no}</span>
          <span className="text-[9px] font-black text-navy/20 uppercase tracking-widest mt-1">Manual Verification</span>
        </div>
      ),
      width: 200,
      pinned: 'left' as const
    },
    {
      header: "AUDIT DATE",
      accessor: (item: any) => new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      width: 150
    },
    {
      header: "STATUS",
      accessor: (item: any) => (
        <Badge variant={item.status === 'OPEN' ? 'info' : 'success'} className="h-6 text-[9px] font-black uppercase tracking-widest">
          {item.status}
        </Badge>
      ),
      width: 120
    },
    {
      header: "VARIANCE",
      accessor: (item: any) => <span className="font-mono font-black text-rose-500 text-lg">-2</span>,
      width: 120,
      className: 'text-center'
    },
    {
      header: "ACTIONS",
      accessor: (item: any) => (
        <div className="flex justify-end">
           <Button variant="sec" size="sm" onClick={() => setViewReport(item)} className="h-9 w-9 p-0 rounded-xl">
              <FileText size={16} />
           </Button>
        </div>
      ),
      width: 100,
      pinned: 'right' as const
    }
  ], []);

  // Columns for Active Session
  const activeColumns = useMemo(() => [
    {
      header: "ITEM PROTOCOL",
      accessor: (item: any) => (
        <div className="flex flex-col py-2 leading-tight">
          <span className="text-sm font-serif font-black text-navy uppercase tracking-tight">{item.product_name}</span>
          <span className="text-[9px] font-black text-navy/30 uppercase tracking-widest mt-1">
            {item.product_code} • {item.size} / {item.colour}
          </span>
        </div>
      ),
      flex: 2,
      pinned: 'left' as const
    },
    {
      header: "BOOK QTY",
      accessor: 'book_qty',
      width: 120,
      className: 'text-center font-mono font-black text-navy/40'
    },
    {
      header: "PHYSICAL",
      accessor: 'physical_qty',
      width: 120,
      className: 'text-center font-mono font-black text-navy text-lg'
    },
    {
      header: "DISCREPANCY",
      accessor: (item: any) => {
        const v = item.physical_qty - item.book_qty;
        return (
          <div className={cn(
            "inline-flex px-4 py-1 rounded-lg text-[11px] font-black",
            v === 0 ? 'bg-navy/5 text-navy/40' : v > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
          )}>
            {v > 0 ? '+' : ''}{v}
          </div>
        )
      },
      width: 130,
      className: 'text-center'
    }
  ], []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/20 mb-4">
         <span>Home</span> <ChevronRight size={10} />
         <span>Operations</span> <ChevronRight size={10} />
         <span className="text-navy/60">Inventory Audit</span>
      </nav>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white/50 p-10 rounded-[40px] border border-navy/5 backdrop-blur-sm shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="muted" className="bg-brand-navy text-brand-gold text-[9px] font-black uppercase tracking-[0.2em] border-none h-6">Operational Audit</Badge>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
          </div>
          <h1 className="text-5xl font-serif font-black text-navy uppercase tracking-tight">Stock Verification</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-3 flex items-center gap-2 italic text-navy/40">
            <ClipboardCheck size={14} className="text-navy" /> Physical Stock Alignment Logic Active
          </p>
        </div>

        <div className="flex gap-4">
           <Button variant="sec" size="lg" onClick={() => setMobileMode(true)} className="h-14 px-8 rounded-[2rem] gap-3">
              <Scan size={20} className="text-brand-gold" /> Mobile Handheld Mode
           </Button>
           <Button variant="pri" size="lg" onClick={startAudit} className="h-14 px-10 rounded-[2rem] gap-3 bg-brand-navy text-white hover:scale-105 shadow-2xl">
              <Plus size={20} className="text-brand-gold" /> Start New Audit Session
           </Button>
        </div>
      </div>

      {!activeSession ? (
         <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 grid grid-cols-4 gap-6">
               {[
                 { label: 'Total Sessions', val: audits.length.toString(), color: 'navy' },
                 { label: 'Net Variance', val: '-12 PCS', color: 'rose' },
                 { label: 'Accuracy Rate', val: '99.4%', color: 'emerald' },
                 { label: 'Last Audit', val: '24 APR 2026', color: 'navy' }
               ].map((kpi, idx) => (
                 <Card key={idx} className="p-10 rounded-[3rem] border-navy/5 shadow-xl">
                    <Text variant="xs" className="text-navy/30 uppercase tracking-[0.3em] mb-6">{kpi.label}</Text>
                    <div className={cn("text-4xl font-serif font-black", kpi.color === 'rose' ? 'text-rose-500' : kpi.color === 'emerald' ? 'text-emerald-600' : 'text-navy')}>
                       {kpi.val}
                    </div>
                 </Card>
               ))}
            </div>

            <div className="col-span-12 bg-white rounded-[3rem] border border-navy/5 shadow-2xl overflow-hidden min-h-[400px]">
               <DataTable 
                 data={audits}
                 columns={historyColumns}
                 loading={isLoading && audits.length === 0}
               />
            </div>
         </div>
      ) : (
         <div className="grid grid-cols-12 gap-10 animate-in slide-in-from-right-10 duration-500">
            <div className="col-span-12 lg:col-span-8 space-y-10">
               <div className="bg-brand-navy p-16 rounded-[50px] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 blur-[120px] rounded-full"></div>
                  <div className="relative z-10 flex justify-between items-center">
                     <div>
                        <h2 className="text-4xl font-serif font-black uppercase tracking-tight text-brand-gold">{activeSession.audit_no}</h2>
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mt-3">Active Session · Please Scan Items</p>
                     </div>
                     <div className="flex gap-6">
                        <Button variant="sec" onClick={() => setActiveSession(null)} className="px-10 h-14 bg-white/5 border-white/10 text-white/60 rounded-[2rem] hover:bg-white/10">
                           Suspend [Esc]
                        </Button>
                        <Button onClick={() => submitMutation.mutate(activeSession.id)} className="px-12 h-14 bg-brand-gold text-navy rounded-[2rem] shadow-2xl shadow-brand-gold/20 hover:scale-105">
                           Submit Final [F10]
                        </Button>
                     </div>
                  </div>
               </div>

               <Card className="rounded-[50px] p-12 border-navy/5 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-8 mb-12 pb-12 border-b border-navy/5">
                     <div className="flex-1 relative">
                        <Scan className="absolute left-8 top-1/2 -translate-y-1/2 text-navy/20" size={24} />
                        <Input 
                           ref={searchInputRef}
                           type="text" 
                           placeholder="SCAN BARCODE OR SEARCH ITEM... [F3]"
                           className="w-full bg-navy/5 border-none h-16 rounded-[2.5rem] pl-20 pr-10 text-base font-black text-navy placeholder:text-navy/20 uppercase tracking-widest"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleScan(searchQuery)}
                        />
                     </div>
                  </div>

                  <div className="min-h-[400px]">
                     <DataTable 
                        data={sessionDetails?.entries || []}
                        columns={activeColumns}
                        loading={loadingSession}
                        overlayNoRowsTemplate={`
                          <div class="flex flex-col items-center justify-center opacity-10 h-full">
                             <Scan size="60" class="mb-4" />
                             <div class="text-xs font-black uppercase tracking-[0.4em]">Ready for Verification Feed</div>
                          </div>
                        `}
                     />
                  </div>
               </Card>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-10">
               <Card className="rounded-[50px] p-12 border-navy/5 shadow-2xl">
                  <h3 className="text-[11px] font-black text-navy uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                     <BarChart2 size={24} className="text-brand-gold" /> Discrepancy Feed
                  </h3>
                  
                  <div className="space-y-8">
                     <div className="flex justify-between items-center py-6 border-b border-navy/5">
                        <span className="text-[11px] font-black text-navy/30 uppercase tracking-widest">Total Scanned</span>
                        <span className="text-2xl font-serif font-black text-navy">{stats.scanned}</span>
                     </div>
                     <div className="flex justify-between items-center py-6 border-b border-navy/5">
                        <span className="text-[11px] font-black text-navy/30 uppercase tracking-widest">Shortages</span>
                        <span className="text-2xl font-serif font-black text-rose-500">{stats.shortage}</span>
                     </div>
                     <div className="flex justify-between items-center py-6 border-b border-navy/5">
                        <span className="text-[11px] font-black text-navy/30 uppercase tracking-widest">Surplus</span>
                        <span className="text-2xl font-serif font-black text-emerald-600">{stats.surplus}</span>
                     </div>
                  </div>

                  <div className="mt-12 p-8 bg-brand-gold/5 rounded-[2.5rem] border border-brand-gold/10 flex gap-6">
                     <AlertTriangle className="text-brand-gold shrink-0" size={28} />
                     <p className="text-[10px] font-black text-navy/60 leading-relaxed uppercase tracking-tight">
                        Inventory adjustment is <span className="text-rose-500">irreversible</span>. Ensure physical count matches digital entry before final submission.
                     </p>
                  </div>
               </Card>
            </div>
         </div>
      )}

      {viewReport && (
        <InventoryAuditReport 
          audit={viewReport} 
          onClose={() => setViewReport(null)} 
        />
      )}

      {mobileMode && (
        <MobileAudit onBack={() => setMobileMode(false)} />
      )}
    </div>
  );
};

export default InventoryAudit;
