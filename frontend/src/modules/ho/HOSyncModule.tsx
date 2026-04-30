/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import { useState, useEffect, useMemo } from 'react'
import { Database, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, RefreshCw, Server, ShieldCheck, Box } from 'lucide-react'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { 
  Button, 
  Card, 
  Text, 
  Badge,
  DataTable 
} from '@/components/ui/SovereignUI'

export default function HOSyncModule() {
  const { theme } = useTheme();
  const isInstitutional = theme === 'SMRITI-OS';
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    api.ho.getStatus().then(setSyncStatus)
  }, [])

  const triggerSync = async () => {
    setIsSyncing(true)
    try {
      const data = await api.ho.triggerSync()
      setSyncStatus((prev: any) => ({ ...prev, last_sync: new Date().toISOString(), pending_packets: 0 }))
      alert(data.message)
    } finally {
      setIsSyncing(false)
    }
  }

  // ── PACKET COLUMNS ──
  const columns = useMemo(() => [
    {
      header: "PACKET PROTOCOL ID",
      accessor: (item: any) => <span className="font-mono font-black text-navy uppercase tracking-tighter">{item.id}</span>,
      flex: 1.5,
      pinned: 'left' as const
    },
    {
      header: "ENTITY TYPE",
      accessor: (item: any) => <Badge variant="info" className="bg-navy/5 text-navy border-none font-black text-[9px] uppercase">{item.type}</Badge>,
      width: 150
    },
    {
      header: "ORIGIN NODE",
      accessor: 'origin',
      width: 150,
      className: 'text-[10px] font-black text-navy/40 uppercase tracking-widest'
    },
    {
      header: "PAYLOAD SIZE",
      accessor: 'size',
      width: 120,
      className: 'text-right font-mono font-black text-navy'
    },
    {
      header: "STATUS",
      accessor: (item: any) => (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="text-[10px] font-black text-navy uppercase tracking-widest">Ready for Pulse</span>
        </div>
      ),
      width: 160,
      pinned: 'right' as const
    }
  ], []);

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <Text variant="h1" className="font-serif font-black text-navy uppercase tracking-tighter leading-none">HO Sync Engine</Text>
          <Text variant="xs" className="text-navy/30 font-black uppercase tracking-[0.4em] mt-3">Node-to-HeadOffice Connectivity Hub · Sovereign Protocol</Text>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Connection Status Card */}
        <Card className="p-12 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col border-none bg-white">
          <div className="absolute top-0 right-0 p-10">
            <div className={`w-4 h-4 rounded-full ${syncStatus?.connected ? 'bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
          </div>
          
          <div className="w-20 h-20 rounded-[2.5rem] bg-navy text-white flex items-center justify-center mb-10 shadow-2xl">
            <Server className="w-10 h-10 text-brand-gold" />
          </div>

          <Text variant="h2" className="font-serif font-black text-navy uppercase mb-2">Corporate Node</Text>
          <Text variant="xs" className="font-black text-brand-gold uppercase tracking-[0.2em] mb-12">HQ-MUMBAI-CENTRAL (Active)</Text>

          <div className="space-y-8 flex-1">
            <div className="flex justify-between items-center pb-6 border-b border-navy/5">
              <Text variant="xs" className="font-black text-navy/20 uppercase tracking-widest">Network Latency</Text>
              <Text variant="sm" className="font-black text-navy">24ms</Text>
            </div>
            <div className="flex justify-between items-center pb-6 border-b border-navy/5">
              <Text variant="xs" className="font-black text-navy/20 uppercase tracking-widest">Sync Protocol</Text>
              <Badge variant="info" className="bg-indigo-50 text-indigo-600 border-none font-black">Sovereign-P2P</Badge>
            </div>
            <div className="flex justify-between items-center">
              <Text variant="xs" className="font-black text-navy/20 uppercase tracking-widest">Encryption</Text>
              <Text variant="sm" className="font-black text-emerald-600">AES-GCM-256</Text>
            </div>
          </div>

          <Button 
            onClick={triggerSync}
            disabled={isSyncing}
            className="mt-12 h-16 rounded-3xl bg-navy text-white font-black text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl shadow-navy/20"
          >
            <RefreshCw className={cn("w-5 h-5 text-brand-gold", isSyncing ? 'animate-spin' : '')} />
            {isSyncing ? 'SYNCHRONIZING...' : 'FORCE MASTER PULL'}
          </Button>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
          <Card className="p-10 rounded-[3.5rem] shadow-xl border-none bg-white group hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <ArrowUpRight className="w-7 h-7" />
              </div>
              <Badge variant="info" className="bg-emerald-500 text-white border-none font-black text-[9px] uppercase">Data Upload</Badge>
            </div>
            <Text variant="h1" className="text-4xl font-black text-navy mb-3">1,242 Records</Text>
            <Text variant="xs" className="text-navy/40 font-black uppercase tracking-tight leading-relaxed">
              Sales transactions and inventory audits successfully pushed to Head Office registry.
            </Text>
            <div className="mt-10 text-[10px] font-black text-emerald-600 flex items-center gap-2 uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" /> Last Push: Today, 14:42
            </div>
          </Card>

          <Card className="p-10 rounded-[3.5rem] shadow-xl border-none bg-white group hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                <ArrowDownRight className="w-7 h-7" />
              </div>
              <Badge variant="info" className="bg-indigo-600 text-white border-none font-black text-[9px] uppercase">Data Download</Badge>
            </div>
            <Text variant="h1" className="text-4xl font-black text-navy mb-3">12 Masters</Text>
            <Text variant="xs" className="text-navy/40 font-black uppercase tracking-tight leading-relaxed">
              New categories, tax slabs, and promotional schemes pulled from Corporate HQ.
            </Text>
            <div className="mt-10 text-[10px] font-black text-amber-500 flex items-center gap-2 uppercase tracking-widest">
              <AlertCircle className="w-4 h-4" /> 2 Schemes Pending Review
            </div>
          </Card>

          <Card className="md:col-span-2 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden border-none bg-navy text-white">
            <div className="absolute right-0 top-0 opacity-10 rotate-12 -translate-y-8">
               <Database size={240} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="w-28 h-28 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-5xl font-black shadow-inner text-brand-gold">
                {syncStatus?.pending_packets || 0}
              </div>
              <div className="flex-1">
                <Text variant="h2" className="font-serif font-black mb-3 uppercase tracking-tight">Pending Sync Packets</Text>
                <Text variant="xs" className="text-white/40 font-black leading-relaxed max-w-lg uppercase tracking-tight">
                  These records are currently stored in the Sovereign Vault and will be transmitted to HO in the next scheduled sync pulse (every 15 mins).
                </Text>
              </div>
              <Button className="px-10 h-16 rounded-2xl bg-white text-navy hover:bg-brand-gold hover:text-navy transition-all shadow-2xl font-black text-[10px] uppercase tracking-widest">
                PULSE SYNC NOW
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Packet Inspector */}
      <Card className="rounded-[4.5rem] p-12 shadow-2xl border-none bg-white flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-navy text-brand-gold rounded-3xl flex items-center justify-center shadow-xl">
               <ShieldCheck size={28} />
            </div>
            <div>
              <Text variant="h2" className="font-serif font-black text-navy uppercase leading-none">Pending Data Inspector</Text>
              <Text variant="xs" className="text-navy/30 font-black uppercase tracking-[0.2em] mt-2">Sovereign Vault Integrity Check · PA-2026</Text>
            </div>
          </div>
          <Button variant="sec" className="h-12 px-6 rounded-xl border-navy/5 text-navy/40 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest gap-3">
            Clear Queue <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-[400px] bg-navy/2 rounded-[3rem] border border-navy/5 overflow-hidden shadow-inner">
           <DataTable 
             data={syncStatus?.packets || []}
             columns={columns}
             overlayNoRowsTemplate={`
               <div class="flex flex-col items-center justify-center opacity-10 h-full">
                  <Box size="60" class="mb-4" />
                  <div class="text-xs font-black uppercase tracking-[0.4em]">Sovereign Vault is Empty</div>
               </div>
             `}
           />
        </div>
      </Card>
    </div>
  )
}
