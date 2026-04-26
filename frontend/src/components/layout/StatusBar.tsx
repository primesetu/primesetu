/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useEffect } from 'react';

interface StatusBarProps {
  activeTab: string;
}

type PulseState = 'connecting' | 'online' | 'offline'

const StatusBar: React.FC<StatusBarProps> = ({ activeTab }) => {
  const [pulseState, setPulseState] = useState<PulseState>('connecting')
  const [offlineQueueCount, setOfflineQueueCount] = useState(0)
  const [lastSync, setLastSync] = useState<string>('')

  // Real-time HO Pulse: ping navigator.onLine + attempt fetch
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    const checkPulse = async () => {
      if (!navigator.onLine) {
        setPulseState('offline')
        return
      }
      try {
        // Lightweight ping to the local sovereign node
        await fetch('/api/health', { method: 'HEAD', signal: AbortSignal.timeout(2000) })
        setPulseState('online')
        setLastSync(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
      } catch {
        // offline or node down — still online via browser but node unreachable
        setPulseState(navigator.onLine ? 'offline' : 'offline')
      }
    }

    // Also track browser offline/online events
    const goOnline = () => checkPulse()
    const goOffline = () => setPulseState('offline')
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    checkPulse()
    interval = setInterval(checkPulse, 30000) // re-check every 30s

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const pulseColor = {
    connecting: 'text-amber-400/70',
    online:     'text-emerald-400/80',
    offline:    'text-rose-400/80',
  }[pulseState]

  const pulseBarColor = {
    connecting: 'bg-amber-400/50',
    online:     'bg-emerald-400/70',
    offline:    'bg-rose-400/70',
  }[pulseState]

  const pulseLabel = {
    connecting: 'HO Connecting...',
    online:     'HO Pulse Active',
    offline:    'HO Offline',
  }[pulseState]

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-navy border-t-2 border-gold/40 z-[9999] flex items-center px-10 gap-12 shadow-[0_-10px_40px_rgba(13,27,62,0.5)] backdrop-blur-md">
      <div className="flex gap-8">
        {[
          { key: 'F1', label: 'Billing' },
          { key: 'F2', label: 'Items' },
          { key: 'F3', label: 'Reports' },
          { key: 'F9', label: 'Stock' },
          { key: 'F10', label: 'Setup' },
          { key: 'F12', label: 'DayEnd' }
        ].map(btn => (
          <div key={btn.key} className={`flex items-center gap-3 group cursor-pointer ${activeTab === btn.label.toLowerCase() ? 'opacity-100' : 'opacity-60 hover:opacity-100'} transition-opacity`}>
             <span className="text-gold font-mono font-black text-lg group-hover:scale-125 transition-transform">{btn.key}</span>
             <span className="text-white/60 font-black text-xs uppercase tracking-[0.2em] group-hover:text-white transition-colors">{btn.label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-10">
        {/* HO Pulse Indicator — live */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-8">
          <div className="flex gap-1 items-end">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all ${pulseBarColor} ${pulseState === 'online' ? 'animate-pulse' : ''}`}
                style={{
                  height: `${8 + i * 4}px`,
                  animationDelay: `${i * 180}ms`,
                  opacity: pulseState === 'connecting' ? 0.4 : 1
                }}
              />
            ))}
          </div>
          <div>
            <div className={`text-xs font-black uppercase tracking-[0.3em] ${pulseColor}`}>
              {pulseLabel}
            </div>
            {lastSync && pulseState === 'online' && (
              <div className="text-2xs text-white/40 font-mono">Last: {lastSync}</div>
            )}
          </div>
        </div>

        {/* Node identity */}
        <div className="text-white/30 text-xs font-black uppercase tracking-[0.6em] pr-4 border-l border-white/10 pl-8">
          PST-X01 · NODE v2.0
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
