/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardCheck, X, Zap, Barcode, Save, 
  Package, Loader2, History, CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { 
  Button, 
  Input, 
  Card, 
  Text, 
  Badge 
} from '../../components/ui/SovereignUI';

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
    refetchInterval: 5000 
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
      <div className="fixed inset-0 z-[110] flex items-center justify-center backdrop-blur-2xl bg-bg-base/80">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-24 h-24 bg-status-green/10 text-status-green rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-status-green/10">
            <CheckCircle2 size={48} />
          </div>
          <Text variant="h1" className="mb-4">Stock Ledger Reconciled</Text>
          <Text variant="xs" className="text-text-tertiary font-bold uppercase tracking-widest">Node Registry Synced · Protocol Finalized</Text>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 backdrop-blur-xl bg-bg-base/60">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-elevated w-full max-w-6xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-border-subtle">
        
        <Card variant="flat" className="p-8 flex items-center justify-between border-b border-border-subtle bg-bg-elevated/40 rounded-none">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shadow-sm">
                 <ClipboardCheck size={28} />
              </div>
              <div>
                 <Text variant="h2" className="uppercase tracking-tight">Physical Stock Audit</Text>
                 <div className="flex items-center gap-2 mt-1">
                    <Badge variant="info" className="text-[9px] h-5">Sovereign Audit</Badge>
                    <Text variant="xs" className="text-text-tertiary font-mono uppercase tracking-widest">Session Active</Text>
                 </div>
              </div>
           </div>
           <Button variant="sec" size="sm" onClick={onClose} className="h-12 w-12 p-0">
              <X size={20} />
           </Button>
        </Card>

        <div className="flex-1 flex flex-col overflow-hidden">
          {!activeSessionId ? (
            <div className="flex-1 p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-bg-float text-text-tertiary rounded-3xl flex items-center justify-center mb-8 border border-border-subtle">
                <History size={32} />
              </div>
              <Text variant="h1" className="mb-4">Initialize Audit Sequence</Text>
              <Text variant="xs" className="text-text-tertiary font-bold max-w-md uppercase tracking-widest mb-12">Registry connection ready. Select a session or spawn a new sequence.</Text>
              
              <div className="flex gap-4 mb-12 flex-wrap justify-center">
                {sessions?.map((s: any) => (
                  s.status === 'OPEN' && (
                    <Button key={s.id} variant="sec" onClick={() => setActiveSessionId(s.id)} className="h-14 px-8 border-accent/20">
                      Resume: {s.audit_no}
                    </Button>
                  )
                ))}
                <Button 
                   onClick={() => startMutation.mutate()}
                   disabled={startMutation.isPending}
                   size="lg"
                   className="h-14 px-12"
                >
                  {startMutation.isPending ? <Loader2 className="animate-spin" /> : <Zap size={18} />} NEW SESSION
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="bg-bg-elevated/60 border-b border-border-subtle p-8 flex items-center justify-between z-10">
                <div className="flex gap-12">
                  <div className="space-y-3">
                    <Text variant="xs" className="font-bold text-text-tertiary uppercase tracking-widest ml-1">Counting Engine</Text>
                    <form onSubmit={handleScan} className="flex gap-2">
                       <div className="relative">
                          <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                          <Input ref={scanRef} autoFocus value={scanInput} onChange={e => setScanInput(e.target.value.toUpperCase())}
                            placeholder="SCAN ARTICLE / CODE..."
                            className="pl-12 w-96 h-12 font-bold tracking-wider" />
                       </div>
                    </form>
                  </div>
                  <div className="w-px h-16 bg-border-subtle mt-2" />
                  <div className="space-y-1 mt-1">
                    <Text variant="xs" className="font-bold text-text-tertiary uppercase tracking-widest">Audit Session</Text>
                    <div className="flex items-center gap-4">
                       <Text variant="h2" className="font-mono">
                         {sessionData?.entries?.length || 0} Articles
                       </Text>
                       <Badge variant="info">Sync Active</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => finalizeMutation.mutate()} 
                    disabled={finalizeMutation.isPending || !sessionData?.entries?.length}
                    className="h-12 px-8"
                  >
                    {finalizeMutation.isPending ? <RefreshCw className="animate-spin" /> : <Save size={18} />} 
                    Finalize & Post
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-8">
                {!sessionData?.entries?.length ? (
                  <div className="flex flex-col items-center justify-center h-full text-text-disabled gap-4">
                    <Package size={80} strokeWidth={0.5} />
                    <Text variant="h3" className="uppercase tracking-widest opacity-20">No counts recorded</Text>
                  </div>
                ) : (
                  <Card className="overflow-hidden border-border-subtle">
                    <table className="w-full text-left">
                      <thead className="bg-bg-float text-[10px] font-bold uppercase tracking-widest text-text-tertiary border-b border-border-subtle">
                         <tr>
                            <th className="px-8 py-5">Article Entity</th>
                            <th className="px-6 py-5 text-center">Book Qty</th>
                            <th className="px-6 py-5 text-center bg-accent/5 text-accent">Physical Count</th>
                            <th className="px-8 py-5 text-center">Variance</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                         {sessionData.entries.map(entry => {
                           const variance = entry.physical_qty - entry.book_qty;
                           return (
                             <tr key={entry.id} className="hover:bg-bg-float/20 transition-all">
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-bg-float rounded-xl flex items-center justify-center text-text-tertiary border border-border-subtle"><Package size={20} /></div>
                                      <div>
                                         <Text variant="sm" className="font-bold uppercase leading-none">{entry.product_name}</Text>
                                         <Text variant="xs" className="font-mono text-text-tertiary mt-2 uppercase tracking-widest">{entry.product_code}</Text>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-5 text-center font-mono text-xl text-text-tertiary">{entry.book_qty}</td>
                                <td className="px-6 py-5 text-center bg-accent/5">
                                   <div className="flex items-center justify-center gap-4">
                                      <Button variant="sec" size="sm" onClick={() => updateEntryQty(entry.product_id, entry.physical_qty - 1)} className="h-8 w-8 p-0 border-status-red/20 text-status-red hover:bg-status-red/10">-</Button>
                                      <Text variant="h3" className="w-12 text-center font-mono">{entry.physical_qty}</Text>
                                      <Button variant="sec" size="sm" onClick={() => updateEntryQty(entry.product_id, entry.physical_qty + 1)} className="h-8 w-8 p-0 border-status-green/20 text-status-green hover:bg-status-green/10">+</Button>
                                   </div>
                                </td>
                                <td className={`px-8 py-5 text-center font-mono text-2xl font-bold ${variance === 0 ? 'text-text-disabled' : variance > 0 ? 'text-status-green' : 'text-status-red'}`}>
                                   {variance === 0 ? '--' : variance > 0 ? `+${variance}` : variance}
                                </td>
                             </tr>
                           );
                         })}
                      </tbody>
                    </table>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        {activeSessionId && (
          <Card variant="flat" className="p-8 bg-bg-elevated/80 border-t border-border-subtle rounded-none flex items-center justify-between">
             <div className="flex gap-16">
                <div>
                   <Text variant="xs" className="font-bold text-text-tertiary uppercase tracking-widest mb-2">Protocol ID</Text>
                   <Text variant="xs" className="font-mono font-bold">{activeSessionId.split('-')[0].toUpperCase()}</Text>
                </div>
                <div>
                   <Text variant="xs" className="font-bold text-text-tertiary uppercase tracking-widest mb-2">Net Variance</Text>
                   <div className="flex items-center gap-3">
                      <Text variant="h2" className="font-mono text-status-red">
                        {sessionData?.entries?.reduce((acc, e) => acc + Math.abs(e.physical_qty - e.book_qty), 0) || 0}
                      </Text>
                      <Text variant="xs" className="uppercase font-bold text-text-tertiary mt-2">Units</Text>
                   </div>
                </div>
             </div>
             <div className="flex gap-3">
                <Button variant="sec" onClick={() => setActiveSessionId(null)} className="px-6 h-12">
                   Switch Protocol
                </Button>
             </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}




