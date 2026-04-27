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

  const statusMap: Record<string, { color: string; label: string }> = {
    online:          { color: 'var(--green)',            label: 'HO Pulse Active' },
    syncing:         { color: 'var(--yellow)',           label: 'HO Syncing...' },
    offline:         { color: 'var(--red)',              label: 'HO Offline' },
    unauthenticated: { color: 'var(--text-tertiary)',    label: 'No Session' },
  };

  const { color: pulseColor, label: pulseLabel } = statusMap[sync.status] ?? statusMap.offline;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 z-[9999] flex items-center px-10 gap-12 backdrop-blur-md" style={{ background: 'var(--bg-elevated)', borderTop: '2px solid rgba(99,102,241,0.2)' }}>
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
             <span className="font-mono font-semibold text-lg group-hover:scale-125 transition-transform" style={{ color: 'var(--accent-light)' }}>{btn.key}</span>
             <span className="font-semibold text-xs uppercase tracking-wider transition-colors" style={{ color: 'var(--text-secondary)' }}>{btn.label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-10">
        {/* HO Pulse Indicator — live */}
        <div 
          onClick={() => setShowSync(true)}
          className="flex items-center gap-3 pl-8 cursor-pointer hover:opacity-80 transition-opacity active:scale-95" style={{ borderLeft: '1px solid var(--border-subtle)' }}
        >
          <div className="flex gap-1 items-end">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all ${sync.status === 'online' ? 'animate-pulse' : ''}`}
                style={{
                  height: `${8 + i * 4}px`,
                  background: pulseColor,
                  animationDelay: `${i * 180}ms`,
                  opacity: sync.status === 'syncing' ? 0.4 : 1
                }}
              />
            ))}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: pulseColor }}>
              {pulseLabel}
            </div>
            {sync.lastSync && sync.status !== 'offline' && (
              <div className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>Last: {sync.lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
            )}
            {sync.pendingCount > 0 && (
              <div className="text-[10px] font-mono" style={{ color: 'var(--yellow)' }}>Pending: {sync.pendingCount}</div>
            )}
          </div>
        </div>

        {/* Node identity */}
        <div className="text-xs font-semibold uppercase tracking-wider pr-4 pl-8" style={{ color: 'var(--text-tertiary)', borderLeft: '1px solid var(--border-subtle)' }}>
          {sync.nodeId || 'PST-X01'} · NODE v2.0
        </div>
      </div>

      {showSync && <SyncManagerModal onClose={() => setShowSync(false)} />}
    </div>
  );
};

export default StatusBar;
