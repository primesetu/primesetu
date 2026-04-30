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
import { useState, useEffect } from 'react'
import { Database, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, RefreshCw, Server } from 'lucide-react'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

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

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className={cn(
          "text-4xl font-serif font-black uppercase tracking-tight",
          isInstitutional ? "text-[var(--accent)]" : "text-white"
        )}>HO Sync Engine</h1>
        <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-widest mt-2">Node-to-HeadOffice Connectivity Hub</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Connection Status Card */}
        <div className={cn(
          "rounded-[3rem] p-12 shadow-2xl relative overflow-hidden flex flex-col border",
          isInstitutional ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)]" : "glass border-white/10"
        )}>
          <div className="absolute top-0 right-0 p-8">
            <div className={`w-4 h-4 rounded-full ${syncStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
          </div>
          
          <div className={cn(
            "w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-xl border",
            isInstitutional ? "bg-[var(--accent)] text-white border-[var(--accent)]/20" : "bg-navy text-white border-white/10"
          )}>
            <Server className="w-8 h-8" />
          </div>

          <h3 className={cn(
            "text-2xl font-serif font-black mb-2",
            isInstitutional ? "text-[var(--text-primary)]" : "text-navy"
          )}>Corporate Node</h3>
          <div className="text-xs font-black text-[var(--gold)] uppercase tracking-widest mb-10">HQ-MUMBAI-CENTRAL (Active)</div>

          <div className="space-y-6 flex-1">
            <div className={cn(
              "flex justify-between items-center pb-4 border-b",
              isInstitutional ? "border-[var(--border-subtle)]" : "border-border"
            )}>
              <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Latency</span>
              <span className={cn(
                "text-sm font-bold",
                isInstitutional ? "text-[var(--text-primary)]" : "text-navy"
              )}>24ms</span>
            </div>
            <div className={cn(
              "flex justify-between items-center pb-4 border-b",
              isInstitutional ? "border-[var(--border-subtle)]" : "border-border"
            )}>
              <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Protocol</span>
              <span className={cn(
                "text-sm font-bold",
                isInstitutional ? "text-[var(--text-primary)]" : "text-navy"
              )}>Sovereign-P2P</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Encryption</span>
              <span className="text-sm font-bold text-emerald-600">AES-256 AES-GCM</span>
            </div>
          </div>

          <button 
            onClick={triggerSync}
            disabled={isSyncing}
            className={cn(
              "mt-12 w-full py-5 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl",
              isInstitutional 
                ? "bg-[var(--accent)] text-white hover:opacity-90 shadow-[var(--accent)]/20" 
                : "bg-navy text-white hover:bg-navy/90 shadow-navy/20"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", isInstitutional ? "text-white" : "text-gold", isSyncing ? 'animate-spin' : '')} />
            {isSyncing ? 'SYNCHRONIZING...' : 'FORCE MASTER PULL'}
          </button>
        </div>

        {/* Sync Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={cn(
            "p-10 rounded-[3rem] shadow-xl border transition-all",
            isInstitutional ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)]" : "glass border-white/10"
          )}>
            <div className="flex items-center justify-between mb-8">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                isInstitutional ? "bg-emerald-100 text-emerald-600" : "bg-emerald-50 text-emerald-600"
              )}>
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Data Upload</span>
            </div>
            <div className={cn(
              "text-3xl font-serif font-black mb-2",
              isInstitutional ? "text-[var(--text-primary)]" : "text-navy"
            )}>1,242 Records</div>
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-tighter leading-relaxed",
              isInstitutional ? "text-[var(--text-secondary)]" : "text-muted"
            )}>
              Sales transactions, cancellations, and inventory audits successfully pushed to Head Office.
            </p>
            <div className="mt-8 text-xs font-black text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Last Push: Today, 14:42
            </div>
          </div>

          <div className={cn(
            "p-10 rounded-[3rem] shadow-xl border transition-all",
            isInstitutional ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)]" : "glass border-white/10"
          )}>
            <div className="flex items-center justify-between mb-8">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                isInstitutional ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-saffron/10 text-saffron"
              )}>
                <ArrowDownRight className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Data Download</span>
            </div>
            <div className={cn(
              "text-3xl font-serif font-black mb-2",
              isInstitutional ? "text-[var(--text-primary)]" : "text-navy"
            )}>12 Masters</div>
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-tighter leading-relaxed",
              isInstitutional ? "text-[var(--text-secondary)]" : "text-muted"
            )}>
              New product categories, tax slab updates, and promotional schemes pulled from Corporate HQ.
            </p>
            <div className={cn(
              "mt-8 text-xs font-black flex items-center gap-2",
              isInstitutional ? "text-[var(--accent)]" : "text-saffron"
            )}>
              <AlertCircle className="w-4 h-4" /> 2 Schemes Pending Review
            </div>
          </div>

          {/* Pending Packets Area */}
          <div className={cn(
            "md:col-span-2 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border",
            isInstitutional 
              ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)]" 
              : "glass-dark border-white/10 text-white"
          )}>
            {!isInstitutional && <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/10 blur-[100px]"></div>}
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className={cn(
                "w-24 h-24 rounded-[2rem] flex items-center justify-center border text-4xl font-black shadow-inner",
                isInstitutional 
                  ? "bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--accent)]" 
                  : "bg-white/5 border-white/10 text-gold"
              )}>
                {syncStatus?.pending_packets || 0}
              </div>
              <div>
                <h4 className={cn(
                  "text-xl font-serif font-black mb-2 uppercase tracking-tight",
                  isInstitutional ? "text-[var(--text-primary)]" : "text-white"
                )}>Pending Sync Packets</h4>
                <p className={cn(
                  "text-sm max-w-lg leading-relaxed",
                  isInstitutional ? "text-[var(--text-secondary)]" : "text-white/40"
                )}>
                  These records are currently stored in the Sovereign Vault and will be transmitted to HO in the next scheduled sync pulse (every 15 mins).
                </p>
              </div>
              <button className={cn(
                "px-10 py-5 rounded-2xl font-black text-xs tracking-widest ml-auto transition-all shadow-xl",
                isInstitutional 
                  ? "bg-[var(--accent)] text-white hover:opacity-90 shadow-[var(--accent)]/20" 
                  : "bg-white text-navy hover:bg-gold shadow-white/10"
              )}>
                PULSE SYNC NOW
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Topology Map & SIS Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className={cn(
          "rounded-[3rem] p-12 shadow-2xl border",
          isInstitutional ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)]" : "glass border-white/10"
        )}>
          <h3 className={cn(
            "text-xl font-serif font-black mb-10",
            isInstitutional ? "text-[var(--text-primary)]" : "text-navy"
          )}>Network Topology Map</h3>
          <div className="h-[200px] flex items-center justify-center gap-20">
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl",
                isInstitutional ? "bg-[var(--accent)] text-white" : "bg-navy text-white"
              )}><Server className="w-10 h-10" /></div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isInstitutional ? "text-[var(--accent)]" : "text-navy"
              )}>Corporate HQ</span>
            </div>
            <div className={cn(
              "flex-1 h-px bg-dashed border-t-2 border-dashed relative",
              isInstitutional ? "border-[var(--accent)]/20" : "border-navy/20"
            )}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gold rounded-full flex items-center justify-center animate-bounce shadow-lg">🚀</div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl border-4 transition-all",
                isInstitutional ? "bg-white border-[var(--accent)] text-[var(--accent)]" : "bg-white border-navy text-navy"
              )}><Database className="w-10 h-10" /></div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isInstitutional ? "text-[var(--accent)]" : "text-navy"
              )}>Store X01 (Local)</span>
            </div>
          </div>
        </div>

        <div className={cn(
          "rounded-[3rem] p-10 shadow-2xl flex flex-col border",
          isInstitutional 
            ? "bg-[var(--bg-base)] border-[var(--border-subtle)]" 
            : "glass-dark border-white/10 text-white"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={cn(
              "text-xl font-serif font-black uppercase tracking-tight",
              isInstitutional ? "text-[var(--text-primary)]" : "text-white"
            )}>SIS Monitor Log</h3>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-black tracking-widest uppercase">Service Running</span>
          </div>
          <div className={cn(
            "flex-1 font-mono text-[10px] space-y-3 overflow-auto max-h-[200px] scrollbar-hide",
            isInstitutional ? "opacity-80 text-[var(--text-secondary)]" : "opacity-60 text-white"
          )}>
            <div>[20:15:02] SIS Bridge Initialized on Port 9525...</div>
            <div>[20:15:10] Heartbeat received from HQ (Latency: 22ms)</div>
            <div>[20:25:00] Initiating scheduled packet export (Pulse #42)</div>
            <div className="text-gold">[20:25:05] Exporting 14 sales packets to HQ-MUM-CENTRAL...</div>
            <div className="text-emerald-400">[20:25:08] Ack received: 14 packets committed successfully.</div>
            <div>[20:30:00] Listening for Master updates...</div>
            <div className="animate-pulse text-white/40">_</div>
          </div>
        </div>
      </div>

      {/* Packet Inspector */}
      <div className={cn(
        "rounded-[3rem] p-12 shadow-2xl border",
        isInstitutional ? "bg-[var(--bg-elevated)] border-[var(--border-subtle)]" : "glass border-white/10"
      )}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className={cn(
              "text-xl font-serif font-black",
              isInstitutional ? "text-[var(--text-primary)]" : "text-navy"
            )}>Pending Data Inspector</h3>
            <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mt-1">Sovereign Vault Integrity Check</p>
          </div>
          <button className={cn(
            "text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
            isInstitutional ? "text-[var(--accent)] hover:bg-[var(--accent)]/5" : "text-navy hover:bg-navy/5"
          )}>
            Clear Queue <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={cn(
              "text-[9px] font-black uppercase tracking-[0.2em] border-b",
              isInstitutional 
                ? "bg-[var(--bg-base)] text-[var(--text-tertiary)] border-[var(--border-subtle)]" 
                : "bg-navy/5 text-muted border-border"
            )}>
              <tr>
                <th className="px-6 py-4">Packet ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Origin</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className={cn(
              "text-[10px] font-black uppercase tracking-tighter divide-y",
              isInstitutional 
                ? "text-[var(--text-primary)] divide-[var(--border-subtle)]" 
                : "text-navy divide-border/50"
            )}>
              {syncStatus?.packets?.map((pkt: any) => (
                <tr key={pkt.id} className={cn(
                  "transition-colors",
                  isInstitutional ? "hover:bg-[var(--bg-base)]" : "hover:bg-cream/20"
                )}>
                  <td className="px-6 py-4 font-mono">{pkt.id}</td>
                  <td className="px-6 py-4">{pkt.type}</td>
                  <td className="px-6 py-4">{pkt.origin}</td>
                  <td className="px-6 py-4">{pkt.size}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-saffron animate-pulse"></span> Ready
                  </td>
                </tr>
              ))}
              {(!syncStatus?.packets || syncStatus.packets.length === 0) && (
                <tr>
                  <td colSpan={5} className={cn(
                    "px-6 py-10 text-center",
                    isInstitutional ? "text-[var(--text-tertiary)]" : "text-muted"
                  )}>
                    No pending packets in the Sovereign Vault. All data is synchronized.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}




