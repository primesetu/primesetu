/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useRef } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion, AnimatePresence } from 'framer-motion';

import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';
import InventoryAuditReport from './InventoryAuditReport';
import MobileAudit from './MobileAudit';

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
      } else {
        console.warn('Product not found for barcode:', barcode);
      }
    } catch (err) {
      console.error('Scan failed:', err);
    }
  };

  const startAudit = () => createMutation.mutate();

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Breadcrumb Pattern */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/20 mb-4">
         <span>Home</span> <ChevronRight size={10} />
         <span>Operations</span> <ChevronRight size={10} />
         <span className="text-navy/60">Inventory Audit</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white/50 p-10 rounded-[40px] border border-navy/5 backdrop-blur-sm shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-brand-navy text-brand-gold text-[9px] font-black uppercase tracking-[0.2em] rounded-md">Operational Audit</div>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
          </div>
          <h1 className="text-5xl font-serif font-black text-navy uppercase tracking-tight">Stock Verification</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-3 flex items-center gap-2 italic text-navy/40">
            <ClipboardCheck className="w-3.5 h-3.5 text-navy" /> Physical Stock Alignment Logic Active
          </p>
        </div>

           <div className="flex gap-4">
             <button 
               onClick={() => setMobileMode(true)}
               className="bg-navy/5 text-navy px-8 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-navy/10 transition-all flex items-center gap-4"
             >
               <Scan size={20} className="text-brand-gold" />
               Mobile Handheld Mode
             </button>
             <button 
               onClick={startAudit}
               className="bg-brand-navy text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl active:scale-95 flex items-center gap-4"
             >
               <Plus size={20} className="text-brand-gold" />
               Start New Audit Session
             </button>
           </div>
      </div>

      {!activeSession ? (
         <div className="grid grid-cols-12 gap-10">
            {/* KPI Summary */}
            <div className="col-span-12 grid grid-cols-4 gap-6">
               <div className="bg-white p-10 rounded-[3rem] border border-navy/5 shadow-xl">
                  <div className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-6">Total Sessions</div>
                  <div className="text-5xl font-serif font-black text-navy">{audits.length}</div>
               </div>
               <div className="bg-white p-10 rounded-[3rem] border border-navy/5 shadow-xl">
                  <div className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-6">Net Variance</div>
                  <div className="text-5xl font-serif font-black text-rose-500">-12 <span className="text-sm">PCS</span></div>
               </div>
               <div className="bg-white p-10 rounded-[3rem] border border-navy/5 shadow-xl">
                  <div className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-6">Accuracy Rate</div>
                  <div className="text-5xl font-serif font-black text-emerald-600">99.4%</div>
               </div>
               <div className="bg-white p-10 rounded-[3rem] border border-navy/5 shadow-xl">
                  <div className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-6">Last Audit</div>
                  <div className="text-2xl font-black text-navy uppercase tracking-tight pt-2">24 APR 2026</div>
               </div>
            </div>

            {/* Audit History Table */}
            <div className="col-span-12 bg-white rounded-[3rem] border border-navy/5 shadow-2xl overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-navy text-white text-[10px] font-black uppercase tracking-[0.3em]">
                        <th className="px-12 py-8">Session Ref</th>
                        <th className="px-12 py-8">Audit Date</th>
                        <th className="px-12 py-8">Status</th>
                        <th className="px-12 py-8 text-center">Variance</th>
                        <th className="px-12 py-8 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5">
                     {Array.isArray(audits) && audits.length > 0 ? audits.map((audit: any) => (
                        <tr key={audit.id} className="hover:bg-brand-cream transition-all group">
                           <td className="px-12 py-10">
                              <div className="font-mono font-black text-navy text-base uppercase tracking-tight">{audit.audit_no}</div>
                              <div className="text-[9px] font-black text-navy/20 uppercase tracking-widest mt-2">Manual Verification</div>
                           </td>
                           <td className="px-12 py-10 text-sm font-black text-navy/60">
                              {new Date(audit.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </td>
                           <td className="px-12 py-10">
                              <span className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                 audit.status === 'OPEN' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                 {audit.status}
                              </span>
                           </td>
                           <td className="px-12 py-10 text-center font-mono font-black text-rose-500 text-lg">
                              -2
                           </td>
                           <td className="px-12 py-10 text-right">
                               <button 
                                 onClick={() => setViewReport(audit)}
                                 className="p-4 bg-navy/5 text-navy rounded-2xl hover:bg-navy hover:text-white transition-all shadow-sm"
                               >
                                  <FileText size={20} />
                               </button>
                           </td>
                        </tr>
                     )) : (
                        <tr>
                           <td colSpan={5} className="px-12 py-32 text-center text-navy/10 uppercase font-black tracking-[0.5em] text-sm">
                              {Array.isArray(audits) ? 'No audit history found' : 'Connectivity Error / Unauthorized'}
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      ) : (
         <div className="grid grid-cols-12 gap-10 animate-in slide-in-from-right-10 duration-500">
            {/* Active Scanning Interface */}
            <div className="col-span-12 lg:col-span-8 space-y-10">
               <div className="bg-brand-navy p-16 rounded-[50px] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 blur-[120px] rounded-full"></div>
                  <div className="relative z-10 flex justify-between items-center">
                     <div>
                        <h2 className="text-4xl font-serif font-black uppercase tracking-tight text-brand-gold">{activeSession.audit_no}</h2>
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mt-3">Active Session · Please Scan Items</p>
                     </div>
                     <div className="flex gap-6">
                        <button onClick={() => setActiveSession(null)} className="px-10 py-5 bg-white/5 text-white/60 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">
                           Suspend [Esc]
                        </button>
                        <button className="px-12 py-5 bg-brand-gold text-navy rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-brand-gold/20">
                           Submit Final [F10]
                        </button>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-[50px] p-12 border border-navy/5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center gap-8 mb-12 pb-12 border-b border-navy/5">
                     <div className="flex-1 relative">
                        <Scan className="absolute left-8 top-1/2 -translate-y-1/2 text-navy/20" size={24} />
                        <input 
                           ref={searchInputRef}
                           type="text" 
                           placeholder="SCAN BARCODE OR SEARCH ITEM... [F3]"
                           className="w-full bg-navy/5 border-2 border-transparent focus:border-brand-gold/20 rounded-[2.5rem] py-6 pl-20 pr-10 text-base font-black text-navy outline-none transition-all placeholder:text-navy/20 uppercase tracking-widest"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                     {loadingSession ? (
                        <div className="flex flex-col items-center py-20 gap-4">
                           <div className="w-10 h-10 border-4 border-navy/10 border-t-navy rounded-full animate-spin" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-navy/20">Syncing Ledger...</span>
                        </div>
                     ) : !sessionDetails?.entries?.length ? (
                        <div className="flex flex-col items-center py-20 gap-4">
                           <Scan className="w-12 h-12 text-navy/10" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-navy/20">No items scanned yet</span>
                        </div>
                     ) : (
                        sessionDetails.entries.map((entry: any, i: number) => {
                           const v = entry.physical_qty - entry.book_qty;
                           return (
                              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                 key={entry.id} className="flex items-center justify-between p-6 bg-navy/5 rounded-3xl border border-transparent hover:border-navy/10 transition-all group">
                                 <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                       <FileText className="text-navy/20" size={20} />
                                    </div>
                                    <div>
                                       <div className="font-serif font-black text-navy text-lg uppercase tracking-tight">{entry.product_name}</div>
                                       <div className="text-[10px] font-black text-navy/30 uppercase tracking-widest mt-1">
                                          {entry.product_code} • {entry.size} / {entry.colour}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-12">
                                    <div className="text-right">
                                       <div className="text-[9px] font-black text-navy/20 uppercase tracking-widest mb-1">Book Qty</div>
                                       <div className="font-mono font-black text-navy text-base">{entry.book_qty}</div>
                                    </div>
                                    <div className="text-right">
                                       <div className="text-[9px] font-black text-navy/20 uppercase tracking-widest mb-1">Physical</div>
                                       <div className="font-mono font-black text-navy text-xl">{entry.physical_qty}</div>
                                    </div>
                                    <div className={`w-20 text-center px-4 py-2 rounded-xl text-[11px] font-black ${
                                       v === 0 ? 'bg-navy/5 text-navy/40' : v > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                                    }`}>
                                       {v > 0 ? '+' : ''}{v}
                                    </div>
                                 </div>
                              </motion.div>
                           )
                        })
                     )}
                  </div>
               </div>
            </div>

            {/* Variance Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-10">
               <div className="bg-white rounded-[50px] p-12 border border-navy/5 shadow-2xl">
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
               </div>
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
