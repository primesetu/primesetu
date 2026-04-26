/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  ArrowRight,
  Activity,
  CloudCog,
  X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';

interface SyncPacket {
  id: string;
  type: string;
  size: string;
}

interface SyncStatus {
  connected: boolean;
  corporate_node: string;
  pending_packets: number;
  last_sync: string;
  packets: SyncPacket[];
}

interface SyncManagerProps {
  onClose: () => void;
}

export default function SyncManagerModal({ onClose }: SyncManagerProps) {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  const { data: status } = useQuery<SyncStatus>({
    queryKey: ['ho-status'],
    queryFn: () => api.ho.getStatus(),
    refetchInterval: 3000
  });

  const syncMutation = useMutation({
    mutationFn: () => api.ho.triggerSync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ho-status'] });
      setSyncing(false);
    },
    onError: () => {
      setSyncing(false);
      alert('Synchronization pulse failed. The node will continue in Isolation Protocol.');
    }
  });

  const handleSyncNow = () => {
    if (syncing) return;
    setSyncing(true);
    syncMutation.mutate();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-navy p-10 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-gold/20 rounded-[1.5rem] flex items-center justify-center text-gold shadow-xl shadow-gold/10">
                 <Activity size={32} className={syncing ? 'animate-pulse' : ''} />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-black uppercase tracking-tighter">Sovereign Node Pulse</h2>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-1">Head Office Synchronization Hub</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-10">
            
            {/* Connection Status */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-navy/5 p-8 rounded-[2.5rem] flex flex-col justify-between">
                 <div className="flex items-center gap-3 mb-8">
                    <div className={`w-3 h-3 rounded-full ${status?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">
                      {status?.connected ? 'Institutional Link Active' : 'Offline Mode'}
                    </span>
                 </div>
                 <div>
                    <div className="text-4xl font-serif font-black text-navy uppercase tracking-tighter">
                      {status?.corporate_node || 'HQ-MUM-01'}
                    </div>
                    <div className="text-[9px] font-black text-navy/30 uppercase tracking-widest mt-1">Target Corporate Endpoint</div>
                 </div>
              </div>

              <div className="bg-navy/5 p-8 rounded-[2.5rem] flex flex-col justify-between">
                 <div className="flex items-center gap-3 mb-8">
                    <Database size={16} className="text-navy/30" />
                    <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Pending Synchronization</span>
                 </div>
                 <div>
                    <div className="text-4xl font-serif font-black text-navy uppercase tracking-tighter">
                      {status?.pending_packets || 0} Packets
                    </div>
                    <div className="text-[9px] font-black text-navy/30 uppercase tracking-widest mt-1">Total Transaction Backlog</div>
                 </div>
              </div>
            </div>

            {/* Packet Registry */}
            <div>
              <h3 className="text-[11px] font-black text-navy uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                 <CloudCog size={16} className="text-navy/30" /> Live Packet Registry
              </h3>
              <div className="space-y-3">
                 {status?.packets && status.packets.length > 0 ? status.packets.map((pkt) => (
                   <div key={pkt.id} className="group flex items-center justify-between p-5 bg-white border border-navy/5 rounded-2xl hover:border-navy/20 transition-all hover:shadow-lg hover:shadow-navy/5">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center text-navy/40 group-hover:bg-navy group-hover:text-white transition-all">
                            <Database size={18} />
                         </div>
                         <div>
                            <div className="text-xs font-black text-navy uppercase tracking-wider">{pkt.type} Update</div>
                            <div className="text-[9px] text-navy/30 font-mono mt-0.5">#{pkt.id.substring(0, 8)} · {pkt.size}</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest px-3 py-1 bg-amber-50 rounded-lg">Pending</span>
                         <ArrowRight size={14} className="text-navy/10 group-hover:text-navy/40 transition-all" />
                      </div>
                   </div>
                 )) : (
                   <div className="py-12 flex flex-col items-center justify-center text-navy/20 gap-4 bg-navy/[0.02] rounded-[2rem] border border-dashed border-navy/10">
                      <CheckCircle2 size={40} strokeWidth={1} />
                      <div className="text-center">
                         <div className="text-[10px] font-black uppercase tracking-widest">Node Fully Synchronized</div>
                         <div className="text-[9px]">Zero transaction backlog at this endpoint</div>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-10 bg-navy/5 border-t border-navy/10 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="text-right">
                   <div className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Last Successful Pulse</div>
                   <div className="text-xs font-mono text-navy font-bold">
                     {status?.last_sync ? new Date(status.last_sync).toLocaleTimeString() : '--:--:--'}
                   </div>
                </div>
             </div>
             <button 
               onClick={handleSyncNow}
               disabled={syncing || !status?.pending_packets}
               className="flex items-center gap-3 bg-navy text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-navy/20 disabled:opacity-50"
             >
                {syncing ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Force Global Synchronization
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
