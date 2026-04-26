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

import React, { useState } from 'react';
import { useNodeSync } from '@/hooks/useNodeSync';
import SyncManagerModal from './SyncManagerModal';

interface StatusBarProps {
  activeTab: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ activeTab }) => {
  const sync = useNodeSync();
  const [showSync, setShowSync] = useState(false);

  const pulseColor = {
    syncing: 'text-amber-400/70',
    online:  'text-emerald-400/80',
    offline: 'text-rose-400/80',
  }[sync.status];

  const pulseBarColor = {
    syncing: 'bg-amber-400/50',
    online:  'bg-emerald-400/70',
    offline: 'bg-rose-400/70',
  }[sync.status];

  const pulseLabel = {
    syncing: 'HO Syncing...',
    online:  'HO Pulse Active',
    offline: 'HO Offline',
  }[sync.status];

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
        <div 
          onClick={() => setShowSync(true)}
          className="flex items-center gap-3 border-l border-white/10 pl-8 cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
        >
          <div className="flex gap-1 items-end">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all ${pulseBarColor} ${sync.status === 'online' ? 'animate-pulse' : ''}`}
                style={{
                  height: `${8 + i * 4}px`,
                  animationDelay: `${i * 180}ms`,
                  opacity: sync.status === 'syncing' ? 0.4 : 1
                }}
              />
            ))}
          </div>
          <div>
            <div className={`text-xs font-black uppercase tracking-[0.3em] ${pulseColor}`}>
              {pulseLabel}
            </div>
            {sync.lastSync && sync.status !== 'offline' && (
              <div className="text-2xs text-white/40 font-mono">Last: {sync.lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
            )}
            {sync.pendingCount > 0 && (
              <div className="text-2xs text-amber-400 font-mono">Pending: {sync.pendingCount}</div>
            )}
          </div>
        </div>

        {/* Node identity */}
        <div className="text-white/30 text-xs font-black uppercase tracking-[0.6em] pr-4 border-l border-white/10 pl-8">
          {sync.nodeId || 'PST-X01'} · NODE v2.0
        </div>
      </div>

      {showSync && <SyncManagerModal onClose={() => setShowSync(false)} />}
    </div>
  );
};

export default StatusBar;
