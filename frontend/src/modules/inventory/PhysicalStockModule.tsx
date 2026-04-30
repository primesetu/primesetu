/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardCheck, X, Zap, Barcode, Save, 
  Package, Loader2, History, CheckCircle2,
  RefreshCw,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { 
  Button, 
  Input, 
  Card, 
  Text, 
  Badge,
  DataTable 
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

  const { data: sessionData, isLoading: loadingSession } = useQuery<AuditSession>({
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

  // ── GRID COLUMNS ──
  const columns = useMemo(() => [
    {
      header: "ARTICLE ENTITY",
      accessor: (item: AuditEntry) => (
        <div className="flex items-center gap-4 py-2 leading-tight">
           <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center text-navy/30 border border-navy/5"><Package size={20} /></div>
           <div>
              <Text variant="sm" className="font-black uppercase text-navy">{item.product_name}</Text>
              <Text variant="xs" className="font-mono text-navy/40 mt-1 uppercase tracking-widest">{item.product_code}</Text>
           </div>
        </div>
      ),
      flex: 2,
      pinned: 'left' as const
    },
    {
      header: "BOOK QTY",
      accessor: 'book_qty',
      width: 120,
      className: 'text-center font-mono font-black text-navy/40 text-xl'
    },
    {
      header: "PHYSICAL COUNT",
      accessor: (item: AuditEntry) => (
        <div className="flex items-center justify-center gap-4 py-2 bg-indigo-50/50">
           <Button variant="sec" size="sm" onClick={() => updateEntryQty(item.product_id, item.physical_qty - 1)} className="h-9 w-9 p-0 border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl">-</Button>
           <Text variant="h2" className="w-12 text-center font-mono font-black text-indigo-600">{item.physical_qty}</Text>
           <Button variant="sec" size="sm" onClick={() => updateEntryQty(item.product_id, item.physical_qty + 1)} className="h-9 w-9 p-0 border-emerald-200 text-emerald-500 hover:bg-emerald-50 rounded-xl">+</Button>
        </div>
      ),
      width: 180,
      className: 'text-center'
    },
    {
      header: "VARIANCE",
      accessor: (item: AuditEntry) => {
        const v = item.physical_qty - item.book_qty;
        return (
          <div className={cn(
            "text-2xl font-mono font-black",
            v === 0 ? 'text-navy/10' : v > 0 ? 'text-emerald-500' : 'text-rose-500'
          )}>
            {v === 0 ? '--' : v > 0 ? `+${v}` : v}
          </div>
        )
      },
      width: 150,
      className: 'text-center',
      pinned: 'right' as const
    }
  ], [sessionData]);

  if (isFinalizing) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center backdrop-blur-2xl bg-white/80">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/10">
            <CheckCircle2 size={48} />
          </div>
          <Text variant="h1" className="mb-4 font-serif font-black text-navy uppercase">Stock Ledger Reconciled</Text>
          <Text variant="xs" className="text-navy/30 font-black uppercase tracking-widest">Node Registry Synced · Protocol Finalized</Text>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 backdrop-blur-xl bg-navy/40">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-6xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        
        <Card className="p-8 flex items-center justify-between border-b border-navy/5 bg-white rounded-none">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                 <ClipboardCheck size={28} />
              </div>
              <div>
                 <Text variant="h2" className="uppercase tracking-tight font-serif font-black text-navy">Physical Stock Audit</Text>
                 <div className="flex items-center gap-2 mt-1">
                    <Badge variant="info" className="text-[9px] h-5 bg-indigo-500 text-white border-none font-black uppercase">Sovereign Audit</Badge>
                    <Text variant="xs" className="text-navy/30 font-mono uppercase tracking-widest">Session Active</Text>
                 </div>
              </div>
           </div>
           <Button variant="sec" onClick={onClose} className="h-12 w-12 p-0 rounded-2xl">
              <X size={20} />
           </Button>
        </Card>

        <div className="flex-1 flex flex-col overflow-hidden">
          {!activeSessionId ? (
            <div className="flex-1 p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-navy/5 text-navy/20 rounded-3xl flex items-center justify-center mb-8 border border-navy/5">
                <History size={32} />
              </div>
              <Text variant="h2" className="mb-4 font-serif font-black text-navy uppercase">Initialize Audit Sequence</Text>
              <Text variant="xs" className="text-navy/30 font-black max-w-md uppercase tracking-widest mb-12">Registry connection ready. Select a session or spawn a new sequence.</Text>
              
              <div className="flex gap-4 mb-12 flex-wrap justify-center">
                {sessions?.map((s: any) => (
                  s.status === 'OPEN' && (
                    <Button key={s.id} variant="sec" onClick={() => setActiveSessionId(s.id)} className="h-14 px-8 border-indigo-100 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                      Resume: {s.audit_no}
                    </Button>
                  )
                ))}
                <Button 
                   onClick={() => startMutation.mutate()}
                   disabled={startMutation.isPending}
                   className="h-14 px-12 bg-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl"
                >
                  {startMutation.isPending ? <RefreshCw className="animate-spin" /> : <Zap size={18} className="text-brand-gold" />} NEW SESSION
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="bg-white border-b border-navy/5 p-8 flex items-center justify-between z-10">
                <div className="flex gap-12">
                  <div className="space-y-3">
                    <Text variant="xs" className="font-black text-navy/30 uppercase tracking-widest ml-1">Counting Engine</Text>
                    <form onSubmit={handleScan} className="flex gap-2">
                       <div className="relative">
                          <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/20" />
                          <Input ref={scanRef} autoFocus value={scanInput} onChange={e => setScanInput(e.target.value.toUpperCase())}
                            placeholder="SCAN ARTICLE / CODE..."
                            className="pl-12 w-96 h-12 font-black tracking-wider uppercase bg-navy/5 border-none rounded-xl" />
                       </div>
                    </form>
                  </div>
                  <div className="w-px h-16 bg-navy/5 mt-2" />
                  <div className="space-y-1 mt-1">
                    <Text variant="xs" className="font-black text-navy/30 uppercase tracking-widest">Audit Session</Text>
                    <div className="flex items-center gap-4">
                       <Text variant="h2" className="font-mono font-black text-navy">
                         {sessionData?.entries?.length || 0} Articles
                       </Text>
                       <Badge variant="info" className="bg-emerald-500 text-white border-none font-black text-[9px]">Sync Active</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => finalizeMutation.mutate()} 
                    disabled={finalizeMutation.isPending || !sessionData?.entries?.length}
                    className="h-12 px-8 bg-indigo-600 text-white rounded-xl shadow-xl shadow-indigo-100 font-black text-[10px] uppercase tracking-widest gap-2"
                  >
                    {finalizeMutation.isPending ? <RefreshCw className="animate-spin" /> : <Save size={18} />} 
                    Finalize & Post
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-8">
                <div className="h-full bg-white rounded-[30px] border border-navy/5 shadow-inner overflow-hidden">
                   <DataTable 
                      data={sessionData?.entries || []}
                      columns={columns}
                      loading={loadingSession}
                      overlayNoRowsTemplate={`
                        <div class="flex flex-col items-center justify-center opacity-10 h-full">
                           <Package size="60" class="mb-4" />
                           <div class="text-xs font-black uppercase tracking-[0.4em]">No counts recorded</div>
                        </div>
                      `}
                   />
                </div>
              </div>
            </div>
          )}
        </div>

        {activeSessionId && (
          <Card className="p-8 bg-navy/2 rounded-none border-t border-navy/5 flex items-center justify-between">
             <div className="flex gap-16">
                <div>
                   <Text variant="xs" className="font-black text-navy/30 uppercase tracking-widest mb-2">Protocol ID</Text>
                   <Text variant="xs" className="font-mono font-black text-navy uppercase">{activeSessionId.split('-')[0]}</Text>
                </div>
                <div>
                   <Text variant="xs" className="font-black text-navy/30 uppercase tracking-widest mb-2">Net Variance</Text>
                   <div className="flex items-center gap-3">
                      <Text variant="h2" className="font-mono font-black text-rose-500">
                        {sessionData?.entries?.reduce((acc, e) => acc + Math.abs(e.physical_qty - e.book_qty), 0) || 0}
                      </Text>
                      <Text variant="xs" className="uppercase font-black text-navy/20 mt-2">Units</Text>
                   </div>
                </div>
             </div>
             <div className="flex gap-3">
                <Button variant="sec" onClick={() => setActiveSessionId(null)} className="px-8 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest">
                   Switch Protocol
                </Button>
             </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
