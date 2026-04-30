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
  const isTally = theme === 'SMRITI-OS';

  const statusMap: Record<string, { color: string; label: string }> = {
    online:  { color: 'var(--green)',  label: 'HO Pulse Active' },
    syncing: { color: 'var(--gold)',   label: 'HO Syncing...' },
    offline: { color: 'var(--red)',    label: 'HO Offline' },
  };

  const { color: pulseColor, label: pulseLabel } = statusMap[sync.status] ?? statusMap.offline;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[9999] flex items-center px-4 transition-all",
        isTally 
          ? "tp-status-bar gap-6" 
          : "h-12 backdrop-blur-md bg-[var(--bg-elevated)] border-t-2 border-[rgba(99,102,241,0.2)] gap-8"
      )} 
    >
      <div className="flex gap-6 items-center h-full">
        {[
          { key: 'F1',  label: 'Help' },
          { key: 'F2',  label: 'Items' },
          { key: 'F3',  label: 'Reports' },
          { key: 'F9',  label: 'Stock' },
          { key: 'F10', label: 'Setup' },
          { key: 'F11', label: 'Features' },
          { key: 'F12', label: 'DayEnd' }
        ].map(btn => (
          <div key={btn.key} className={cn(
            "flex items-center gap-2 group cursor-pointer transition-opacity h-full px-2 border-r last:border-r-0",
            isTally ? "border-[var(--accent-border)]" : "border-white/5",
            activeTab === btn.label.toLowerCase() ? 'opacity-100 bg-white/10' : 'opacity-70 hover:opacity-100 hover:bg-white/5'
          )}>
             <span className={cn(
               "font-mono font-bold",
               isTally ? "text-[10px] text-[var(--gold)]" : "text-sm text-[var(--accent-light)]",
             )}>{btn.key}</span>
             <span className={cn(
               "font-bold uppercase tracking-tight transition-colors",
               isTally ? "text-[10px] text-white" : "text-[10px] text-[var(--text-secondary)]"
             )}>{btn.label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-6 h-full">
        {/* HO Pulse Indicator — live */}
        <div 
          onClick={() => setShowSync(true)}
          className={cn(
            "flex items-center gap-3 px-4 cursor-pointer transition-all active:scale-95 h-full border-l",
            isTally ? "border-[var(--accent-border)] hover:bg-white/10" : "border-white/10 hover:bg-white/5"
          )}
        >
          <div className="flex gap-0.5 items-end h-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-0.5 rounded-full transition-all ${sync.status === 'online' ? 'animate-pulse' : ''}`}
                style={{
                  height: `${6 + i * 2}px`,
                  background: pulseColor,
                  animationDelay: `${i * 180}ms`,
                  opacity: sync.status === 'syncing' ? 0.4 : 1
                }}
              />
            ))}
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[9px] font-black uppercase tracking-wider leading-none" style={{ color: pulseColor }}>
              {pulseLabel}
            </div>
            {sync.lastSync && sync.status !== 'offline' && (
              <div className="text-[8px] font-mono opacity-60 mt-0.5" style={{ color: 'white' }}>{sync.lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
            )}
          </div>
        </div>

        {/* Node identity */}
        <div className="text-[9px] font-black uppercase tracking-widest px-4 border-l border-white/10 flex items-center h-full text-white/50">
          {sync.nodeId || 'PST-X01'} · NODE v2.0
        </div>
      </div>

      {showSync && <SyncManagerModal onClose={() => setShowSync(false)} />}
    </div>
  );
};

export default StatusBar;




