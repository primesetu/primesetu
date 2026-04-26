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
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/api/client'

export default function HODashboard() {
  const [isSyncing, setIsSyncing] = useState(false)

  const { data: status } = useQuery({
    queryKey: ['ho-status'],
    queryFn: async () => {
      return await api.ho.getStatus()
    },
    refetchInterval: 5000
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      setIsSyncing(true)
      const data = await api.ho.triggerSync()
      // Artificial delay for premium animation feel
      await new Promise(r => setTimeout(r, 2000))
      return data
    },
    onSuccess: () => {
      setIsSyncing(false)
      alert('Sovereign node successfully synchronized with Corporate HQ.')
    }
  })

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-black text-navy">Corporate HO View</h1>
          <p className="text-xs text-muted uppercase tracking-widest font-bold">Node Identity: {status?.corporate_node ?? 'PS-TERMINAL-01'}</p>
        </div>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${status?.connected ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <div className={`w-2 h-2 rounded-full ${status?.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {status?.connected ? 'Global Link Active' : 'Link Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Sync Control & Logs */}
        <div className="col-span-8 space-y-6">
          <div className="bg-white border border-border rounded-3xl p-8 shadow-sm overflow-hidden relative">
            {isSyncing && (
               <div className="absolute inset-0 bg-navy/5 z-10 flex items-center justify-center backdrop-blur-[2px]">
                 <div className="flex flex-col items-center gap-4">
                   <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black uppercase tracking-[3px] text-navy">Pushing Sovereign Ledger...</p>
                 </div>
               </div>
            )}
            
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-navy">Data Synchronization</h3>
                <p className="text-sm text-muted italic">Last successful handshake: {status?.last_sync ? new Date(status.last_sync).toLocaleString() : 'Never'}</p>
              </div>
              <button 
                onClick={() => syncMutation.mutate()}
                disabled={isSyncing}
                className="bg-navy text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[2px] shadow-xl shadow-navy/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                Sync Now
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <MetricBox label="Pending Packets" value={status?.pending_packets ?? 0} unit="RECORDS" />
              <MetricBox label="Link Quality" value="98%" unit="SIGNAL" />
              <MetricBox label="Node Health" value="OPTIMAL" unit="SECURED" />
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-border pb-2">Recent Handshake Logs</p>
              <div className="font-mono text-[11px] text-navy/70 space-y-2">
                <LogItem time="01:45:22" msg="Authentication handshake initiated with HQ-MUM-01" />
                <LogItem time="01:45:23" msg="Encrypted tunnel established via Sovereign Bridge" />
                <LogItem time="01:45:24" msg="Manifest verified: 142 records ready for export" />
                <LogItem time="01:45:25" msg="Synchronization lifecycle: IDLE" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Compliance */}
        <div className="col-span-4 space-y-6">
          <div className="bg-cream rounded-3xl p-8 border border-border">
            <h3 className="font-serif text-lg font-bold text-navy mb-6">Corporate Compliance</h3>
            <div className="space-y-6">
              <ComplianceCheck label="Daily Inventory Audit" done={true} />
              <ComplianceCheck label="GST Return Filing" done={true} />
              <ComplianceCheck label="Cash Reconciliation" done={false} />
              <ComplianceCheck label="Staff Attendance" done={true} />
              <ComplianceCheck label="Terminal Health Check" done={true} />
            </div>
            
            <div className="mt-10 p-5 bg-white rounded-2xl border border-dashed border-border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">🏆</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-navy">Gold Standard</span>
              </div>
              <p className="text-[10px] text-muted leading-relaxed">
                This node is currently performing in the top 5% of the regional cluster. Keep up the operational excellence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricBox({ label, value, unit }: any) {
  return (
    <div className="bg-cream/50 rounded-2xl p-5 border border-border group hover:bg-navy hover:border-navy transition-all">
      <p className="text-[9px] font-black uppercase tracking-widest text-muted group-hover:text-white/40 mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-black text-navy group-hover:text-white">{value}</span>
        <span className="text-[9px] font-bold text-saffron mb-1.5">{unit}</span>
      </div>
    </div>
  )
}

function LogItem({ time, msg }: any) {
  return (
    <div className="flex gap-4">
      <span className="text-muted shrink-0">[{time}]</span>
      <span className="truncate">{msg}</span>
    </div>
  )
}

function ComplianceCheck({ label, done }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${done ? 'bg-navy text-white' : 'bg-white border border-border text-transparent'}`}>
        ✓
      </div>
      <span className={`text-xs font-bold ${done ? 'text-navy' : 'text-muted'}`}>{label}</span>
    </div>
  )
}
