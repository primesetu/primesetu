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
import React, { useState } from 'react'
import { useSovereignStore } from '@/core/stores/useSovereignStore'
import { api } from '@/api/client'
import { ShieldAlert, Terminal, Loader2, Key, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function GovernanceGuard() {
  const { pendingCommands, clearCommand } = useSovereignStore()
  const [executing, setExecuting] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (pendingCommands.length === 0) return null

  const handleConfirmAndExecute = async (id: string) => {
    setExecuting(id)
    setError(null)
    try {
      // 1. Step One: Manager Confirmation (PIN Gate)
      await api.ho.confirmCommand(id, 'MANAGER_01', pin) // Fixed ID for now
      
      // 2. Step Two: Dispatch Execution
      await api.ho.executeCommand(id)
      
      clearCommand(id)
      setConfirming(null)
      setPin('')
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authorization failed")
    } finally {
      setExecuting(null)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 z-[9999] flex flex-col gap-3 animate-in slide-in-from-right-10 duration-500">
      {pendingCommands.map(cmd => (
        <div 
          key={cmd.id} 
          className={cn(
            "p-5 rounded-[var(--radius-lg)] border backdrop-blur-xl shadow-2xl relative overflow-hidden",
            cmd.is_destructive 
              ? "bg-red-500/10 border-red-500/30" 
              : "bg-[var(--surface-elevated)] border-[var(--border-subtle)]"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-2 rounded-[var(--radius-sm)]",
              cmd.is_destructive ? "bg-red-500 text-white" : "bg-[var(--accent)] text-white"
            )}>
              {cmd.is_destructive ? <ShieldAlert size={18} /> : <Terminal size={18} />}
            </div>
            
            <div className="flex-1">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] mb-1">
                {cmd.is_destructive ? "Destructive Governance" : "Institutional Directive"}
              </h5>
              <p className="text-[11px] font-bold text-[var(--text-secondary)] leading-tight mb-3">
                HQ: <span className="text-[var(--accent)]">{cmd.command_type}</span>
              </p>
              
              {confirming === cmd.id ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={14} />
                    <input
                      autoFocus
                      type="password"
                      placeholder="Enter Manager PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] pl-10 pr-4 py-2 text-xs font-mono tracking-[0.3em] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      disabled={!!executing || pin.length < 4}
                      onClick={() => handleConfirmAndExecute(cmd.id)}
                      className="flex-1 bg-[var(--accent)] text-white text-[10px] font-black uppercase py-2 rounded-[var(--radius-sm)] hover:opacity-90 disabled:opacity-50"
                    >
                      {executing === cmd.id ? <Loader2 className="animate-spin mx-auto" size={14} /> : "Authorize"}
                    </button>
                    <button 
                      onClick={() => setConfirming(null)}
                      className="px-4 py-2 bg-[var(--background)] border border-[var(--border-subtle)] text-[10px] font-black uppercase text-[var(--text-tertiary)] rounded-[var(--radius-sm)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => cmd.requires_approval ? setConfirming(cmd.id) : handleConfirmAndExecute(cmd.id)}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-[var(--radius-sm)] text-[10px] font-black uppercase tracking-widest",
                      cmd.is_destructive ? "bg-red-600 text-white" : "bg-[var(--accent)] text-white"
                    )}
                  >
                    Resolve Directive
                  </button>
                  <button 
                    onClick={() => clearCommand(cmd.id)}
                    className="px-4 py-2 bg-[var(--background)] border border-[var(--border-subtle)] text-[10px] font-black uppercase text-[var(--text-tertiary)] rounded-[var(--radius-sm)]"
                  >
                    Defer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
