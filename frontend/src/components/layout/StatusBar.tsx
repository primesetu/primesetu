/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState } from 'react';
import { useNodeSync } from '@/hooks/useNodeSync';
import { cn } from '@/lib/utils';
import SyncManagerModal from './SyncManagerModal';
import { useTheme } from '@/hooks/useTheme';

interface StatusBarProps {
  activeTab: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ activeTab }) => {
  const sync = useNodeSync();
  const { theme } = useTheme();
  const [showSync, setShowSync] = useState(false);
  const isTally = theme === 'tallyprime';

  const statusMap: Record<string, { color: string; label: string }> = {
    online:  { color: 'var(--green)',  label: 'HO Pulse Active' },
    syncing: { color: 'var(--gold)',   label: 'HO Syncing...' },
    offline: { color: 'var(--red)',    label: 'HO Offline' },
  };

  const { color: pulseColor, label: pulseLabel } = statusMap[sync.status] ?? statusMap.offline;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[9999] flex items-center px-10 transition-all",
        isTally 
          ? "tp-status-bar gap-6" 
          : "h-16 backdrop-blur-md bg-[var(--bg-elevated)] border-t-2 border-[rgba(99,102,241,0.2)] gap-12"
      )} 
    >
      <div className="flex gap-8">
        {[
          { key: 'F1',  label: 'Billing' },
          { key: 'F2',  label: 'Items' },
          { key: 'F3',  label: 'Reports' },
          { key: 'F9',  label: 'Stock' },
          { key: 'F10', label: 'Setup' },
          { key: 'F12', label: 'DayEnd' }
        ].map(btn => (
          <div key={btn.key} className={cn(
            "flex items-center gap-3 group cursor-pointer transition-opacity",
            activeTab === btn.label.toLowerCase() ? 'opacity-100' : 'opacity-60 hover:opacity-100'
          )}>
             <span className={cn(
               "font-mono font-semibold",
               isTally ? "text-[11px] text-[var(--gold)]" : "text-lg text-[var(--accent-light)]",
             )}>{btn.key}</span>
             <span className={cn(
               "font-semibold uppercase tracking-wider transition-colors",
               isTally ? "text-[10px] text-white" : "text-xs text-[var(--text-secondary)]"
             )}>{btn.label}</span>
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
