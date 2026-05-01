/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export default function HODashboard() {
  const { theme } = useTheme();
  const isInstitutional = theme === 'LIGHT'
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
          <h1 className={cn(
            "font-serif text-2xl font-black",
            isInstitutional ? "text-[var(--accent)]" : "text-white"
          )}>Corporate HO View</h1>
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Node Identity: {status?.corporate_node ?? 'PS-TERMINAL-01'}</p>
        </div>
        <div className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-2xl border",
          status?.connected 
            ? (isInstitutional ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-green-50 border-green-200 text-green-700')
            : (isInstitutional ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-red-50 border-red-200 text-red-700')
        )}>
          <div className={`w-2 h-2 rounded-full ${status?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {status?.connected ? 'Global Link Active' : 'Link Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Sync Control & Logs */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className={cn(
            "border rounded-3xl p-8 shadow-sm overflow-hidden relative",
            isInstitutional ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)]" : "bg-white/5 border-white/10"
          )}>
            {isSyncing && (
               <div className={cn(
                 "absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px]",
                 isInstitutional ? "bg-white/60" : "bg-navy/40"
               )}>
                 <div className="flex flex-col items-center gap-4">
                   <div className={cn(
                     "w-12 h-12 border-4 border-t-transparent rounded-full animate-spin",
                     isInstitutional ? "border-[var(--accent)]" : "border-brand-saffron"
                   )}></div>
                   <p className={cn(
                     "text-[10px] font-black uppercase tracking-[3px]",
                     isInstitutional ? "text-[var(--accent)]" : "text-white"
                   )}>Pushing Sovereign Ledger...</p>
                 </div>
               </div>
            )}
            
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-1">
                <h3 className={cn(
                  "font-serif text-xl font-bold",
                  isInstitutional ? "text-[var(--accent)]" : "text-white"
                )}>Data Synchronization</h3>
                <p className="text-sm text-[var(--text-tertiary)] italic">Last successful handshake: {status?.last_sync ? new Date(status.last_sync).toLocaleString() : 'Never'}</p>
              </div>
              <button 
                onClick={() => syncMutation.mutate()}
                disabled={isSyncing}
                className={cn(
                  "px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-[2px] transition-all",
                  isInstitutional 
                    ? "bg-[var(--accent)] text-white shadow-md" 
                    : "bg-brand-saffron text-navy hover:opacity-90"
                )}
              >
                Sync Now
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricBox label="Pending Packets" value={status?.pending_packets ?? 0} unit="RECORDS" isInstitutional={isInstitutional} />
              <MetricBox label="Link Quality" value="98%" unit="SIGNAL" isInstitutional={isInstitutional} />
              <MetricBox label="Node Health" value="OPTIMAL" unit="SECURED" isInstitutional={isInstitutional} />
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] border-b border-[var(--border-subtle)] pb-2">Recent Handshake Logs</p>
              <div className={cn(
                "font-mono text-[11px] space-y-2",
                isInstitutional ? "text-[var(--text-secondary)]" : "text-white/70"
              )}>
                <LogItem time="01:45:22" msg="Authentication handshake initiated with HQ-MUM-01" />
                <LogItem time="01:45:23" msg="Encrypted tunnel established via Sovereign Bridge" />
                <LogItem time="01:45:24" msg="Manifest verified: 142 records ready for export" />
                <LogItem time="01:45:25" msg="Synchronization lifecycle: IDLE" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Compliance */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className={cn(
            "rounded-3xl p-8 border shadow-sm",
            isInstitutional ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)]" : "bg-white/5 border-white/10"
          )}>
            <h3 className={cn(
              "font-serif text-lg font-bold mb-6",
              isInstitutional ? "text-[var(--accent)]" : "text-white"
            )}>Corporate Compliance</h3>
            <div className="space-y-6">
              <ComplianceCheck label="Daily Inventory Audit" done={true} isInstitutional={isInstitutional} />
              <ComplianceCheck label="GST Return Filing" done={true} isInstitutional={isInstitutional} />
              <ComplianceCheck label="Cash Reconciliation" done={false} isInstitutional={isInstitutional} />
              <ComplianceCheck label="Staff Attendance" done={true} isInstitutional={isInstitutional} />
              <ComplianceCheck label="Terminal Health Check" done={true} isInstitutional={isInstitutional} />
            </div>
            
            <div className={cn(
              "mt-10 p-5 rounded-2xl border border-dashed",
              isInstitutional ? "bg-[var(--bg-base)] border-[var(--border-subtle)]" : "bg-white/5 border-white/10"
            )}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">🏆</span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  isInstitutional ? "text-[var(--accent)]" : "text-brand-gold"
                )}>Gold Standard</span>
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
                This node is currently performing in the top 5% of the regional cluster. Keep up the operational excellence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricBox({ label, value, unit, isInstitutional }: any) {
  return (
    <div className={cn(
      "rounded-2xl p-5 border",
      isInstitutional ? "bg-[var(--bg-base)] border-[var(--border-subtle)]" : "bg-white/5 border-white/10"
    )}>
      <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <span className={cn(
          "text-2xl font-black font-mono",
          isInstitutional ? "text-[var(--text-primary)]" : "text-white"
        )}>{value}</span>
        <span className="text-[9px] font-black mb-1.5 text-[var(--gold)]">{unit}</span>
      </div>
    </div>
  )
}

function LogItem({ time, msg }: any) {
  return (
    <div className="flex gap-4">
      <span className="opacity-50 shrink-0">[{time}]</span>
      <span className="truncate">{msg}</span>
    </div>
  )
}

function ComplianceCheck({ label, done, isInstitutional }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-5 h-5 rounded-lg flex items-center justify-center text-[10px] transition-all",
        done 
          ? (isInstitutional ? 'bg-[var(--accent)] text-white shadow-sm' : 'bg-emerald-500 text-white shadow-emerald-500/20') 
          : (isInstitutional ? 'bg-[var(--bg-base)] border border-[var(--border-subtle)] text-transparent' : 'bg-white/5 border border-white/10 text-transparent')
      )}>
        ✓
      </div>
      <span className={cn(
        "text-xs font-bold transition-colors",
        done 
          ? (isInstitutional ? "text-[var(--text-primary)]" : "text-white") 
          : "text-[var(--text-tertiary)]"
      )}>{label}</span>
    </div>
  )
}




