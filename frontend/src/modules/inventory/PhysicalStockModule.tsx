/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, X, Zap, Barcode, Save, 
  Package, Loader2, History, CheckCircle2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

interface AuditEntry {
  id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  book_qty: number;
  physical_qty: number;
  scanned_at: string;
}

interface AuditSession {
  id: string;
  status: string;
  created_at: string;
  entries: AuditEntry[];
}

export default function PhysicalStockModule({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: sessions } = useQuery({
    queryKey: ['audit-sessions'],
    queryFn: () => api.inventory.listAuditSessions(),
  });

  const { data: sessionData } = useQuery<AuditSession>({
    queryKey: ['audit-session', activeSessionId],
    queryFn: () => api.inventory.getAuditSession(activeSessionId!),
    enabled: !!activeSessionId,
    refetchInterval: 5000 // Sync counts every 5s
  });

  // Mutations
  const startMutation = useMutation({
    mutationFn: () => api.inventory.createAuditSession(),
    onSuccess: (session) => {
      setActiveSessionId(session.id);
      queryClient.invalidateQueries({ queryKey: ['audit-sessions'] });
    }
  });

  const entryMutation = useMutation({
    mutationFn: (data: { item_id: string, physical_qty: number }) => 
      api.inventory.addAuditEntry(activeSessionId!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audit-session', activeSessionId] })
  });

  const finalizeMutation = useMutation({
    mutationFn: () => api.inventory.submitAudit(activeSessionId!),
    onSuccess: () => {
      setIsFinalizing(true);
      queryClient.invalidateQueries({ queryKey: ['audit-sessions'] });
      setTimeout(() => onClose(), 3000);
    }
  });

  // Handlers
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;

    try {
      const results = await api.catalogue.universalSearch(scanInput);
      const product = results.find((p: any) => p.code === scanInput || p.name.includes(scanInput));
      
      if (product) {
        const existing = sessionData?.entries.find(e => e.product_id === product.id);
        const newQty = (existing?.physical_qty || 0) + 1;
        
        entryMutation.mutate({ 
          item_id: product.id, 
          physical_qty: newQty 
        });
        setScanInput('');
      } else {
        alert('SKU not found in Registry.');
        setScanInput('');
      }
    } catch (err) {
      console.error('Scan lookup failed:', err);
    }
  };

  const updateEntryQty = (productId: string, qty: number) => {
    entryMutation.mutate({ item_id: productId, physical_qty: Math.max(0, qty) });
  };

  if (isFinalizing) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center backdrop-blur-2xl bg-navy/60">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-16 rounded-[4rem] text-center shadow-2xl">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-serif font-black text-navy uppercase mb-4">Stock Posted</h2>
          <p className="text-muted font-bold uppercase tracking-widest text-sm">Ledger reconciliation complete. Node synced.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 backdrop-blur-2xl bg-navy/60">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#f8f9fc] w-full max-w-6xl h-[85vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        
        <div className="bg-navy p-10 text-white flex items-center justify-between border-b-8 border-amber-400">
           <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-amber-400 rounded-3xl flex items-center justify-center text-navy shadow-2xl transform -rotate-3">
                 <ClipboardCheck className="w-10 h-10" />
              </div>
              <div>
                 <h2 className="text-4xl font-serif font-black uppercase tracking-tight">Physical Stock Audit</h2>
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1 italic flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Sovereign Audit Session
                 </p>
              </div>
           </div>
           <button onClick={onClose} className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
              <X className="w-6 h-6" />
           </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {!activeSessionId ? (
            <div className="flex-1 p-16 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-navy/5 text-navy rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
                <History size={40} />
              </div>
              <h3 className="text-3xl font-serif font-black text-navy uppercase mb-4">Start Audit Sequence</h3>
              <p className="text-muted font-bold text-sm max-w-md uppercase tracking-widest mb-12">Initialize a new session or resume an active count.</p>
              
              <div className="flex gap-6 mb-12 flex-wrap justify-center">
                {sessions?.map((s: any) => (
                  s.status === 'OPEN' && (
                    <button key={s.id} onClick={() => setActiveSessionId(s.id)}
                      className="px-10 py-5 bg-white border-2 border-amber-400/30 rounded-3xl text-[11px] font-black uppercase tracking-widest text-navy hover:bg-amber-50 transition-all shadow-xl">
                      Resume: {s.audit_no}
                    </button>
                  )
                ))}
                <button 
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                  className="bg-navy text-white px-16 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-4"
                >
                  {startMutation.isPending ? <Loader2 className="animate-spin" /> : <Zap size={20} />} NEW SESSION
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="bg-white border-b border-gray-100 p-8 flex items-center justify-between shadow-sm z-10">
                <div className="flex gap-10">
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Counting Engine</div>
                    <form onSubmit={handleScan} className="flex gap-2">
                       <div className="relative">
                          <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input ref={scanRef} autoFocus value={scanInput} onChange={e => setScanInput(e.target.value.toUpperCase())}
                            placeholder="SCAN ARTICLE / CODE..."
                            className="bg-gray-100 border-none pl-12 pr-6 py-4 rounded-2xl text-sm font-black outline-none focus:ring-4 ring-amber-400/20 focus:bg-white w-96 transition-all" />
                       </div>
                    </form>
                  </div>
                  <div className="w-px h-16 bg-gray-100" />
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Audit Session</div>
                    <div className="flex items-center gap-4">
                       <div className="text-3xl font-serif font-black text-navy">
                         {sessionData?.entries?.length || 0} Articles Scanned
                       </div>
                       <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-lg">Sync Active</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => finalizeMutation.mutate()} 
                    disabled={finalizeMutation.isPending || !sessionData?.entries?.length}
                    className="bg-navy text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-amber-400 hover:text-navy transition-all disabled:opacity-50">
                    {finalizeMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />} Finalize & Post
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-10">
                {!sessionData?.entries?.length ? (
                  <div className="flex flex-col items-center justify-center h-full text-navy/10 gap-4">
                    <Package size={80} strokeWidth={0.5} />
                    <span className="text-2xl font-black uppercase tracking-widest">No counts recorded yet</span>
                  </div>
                ) : (
                  <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-navy text-white text-[10px] font-black uppercase tracking-widest">
                         <tr>
                            <th className="p-8">Article Details</th>
                            <th className="p-8 text-center bg-white/10">Book Qty</th>
                            <th className="p-8 text-center bg-white/20">Physical Count</th>
                            <th className="p-8 text-center">Variance</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {sessionData.entries.map(entry => {
                           const variance = entry.physical_qty - entry.book_qty;
                           return (
                             <tr key={entry.id} className="hover:bg-cream/20 transition-all">
                                <td className="p-8">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><Package size={20} /></div>
                                      <div>
                                         <div className="text-sm font-black text-navy uppercase tracking-tight">{entry.product_name}</div>
                                         <div className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">{entry.product_code}</div>
                                      </div>
                                   </div>
                                </td>
                                <td className="p-8 text-center font-serif text-2xl text-navy/40">{entry.book_qty}</td>
                                <td className="p-8 text-center">
                                   <div className="flex items-center justify-center gap-4">
                                      <button onClick={() => updateEntryQty(entry.product_id, entry.physical_qty - 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all">-</button>
                                      <span className="w-16 text-center text-lg font-black text-navy">{entry.physical_qty}</span>
                                      <button onClick={() => updateEntryQty(entry.product_id, entry.physical_qty + 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-white transition-all">+</button>
                                   </div>
                                </td>
                                <td className={`p-8 text-center font-serif text-3xl font-black ${variance === 0 ? 'text-emerald-500/30' : variance > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                   {variance === 0 ? '--' : variance > 0 ? `+${variance}` : variance}
                                </td>
                             </tr>
                           );
                         })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {activeSessionId && (
          <div className="p-10 bg-white border-t border-gray-100 flex items-center justify-between">
             <div className="flex gap-16">
                <div>
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Session ID</div>
                   <div className="text-xs font-mono font-black text-navy">{activeSessionId.split('-')[0].toUpperCase()}</div>
                </div>
                <div>
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Variance</div>
                   <div className="text-2xl font-serif font-black text-rose-500">
                     {sessionData?.entries?.reduce((acc, e) => acc + Math.abs(e.physical_qty - e.book_qty), 0) || 0} Units
                   </div>
                </div>
             </div>
             <div className="flex gap-4">
                <button onClick={() => setActiveSessionId(null)} className="px-8 py-4 bg-gray-100 rounded-2xl text-[10px] font-black text-navy uppercase tracking-widest hover:bg-gray-200 transition-all">Switch Session</button>
             </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
