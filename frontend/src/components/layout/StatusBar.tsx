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
import { 
  HelpCircle, Package, BarChart3, Box, Settings, Zap, 
  Calendar, Building2, Terminal
} from 'lucide-react';
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

  const HOTKEYS = [
    { key: 'F1',  label: 'Help',     icon: HelpCircle },
    { key: 'F2',  label: 'Items',    icon: Package },
    { key: 'F3',  label: 'Reports',  icon: BarChart3 },
    { key: 'F9',  label: 'Stock',    icon: Box },
    { key: 'F10', label: 'Setup',    icon: Settings },
    { key: 'F11', label: 'Features', icon: Zap },
    { key: 'F12', label: 'DayEnd',   icon: Terminal }
  ];

  const statusMap: Record<string, { color: string; label: string }> = {
    online:  { color: 'var(--green)',  label: 'HO Pulse Active' },
    syncing: { color: 'var(--gold)',   label: 'HO Syncing...' },
    offline: { color: 'var(--red)',    label: 'HO Offline' },
  };

  const { color: pulseColor, label: pulseLabel } = statusMap[sync.status] ?? statusMap.offline;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[9999] flex items-center transition-all h-[var(--status-bar-h,28px)] divide-x divide-white/10",
        isTally 
          ? "bg-[var(--aside-bg)] text-white border-t border-white/10" 
          : "backdrop-blur-md bg-[var(--bg-elevated)] border-t-2 border-[rgba(99,102,241,0.2)]"
      )} 
    >
      <div className="flex items-stretch h-full divide-x divide-white/10">
        {HOTKEYS.map(btn => {
          const isActive = activeTab === btn.label.toLowerCase();
          return (
            <div key={btn.key} className={cn(
              "relative flex items-center gap-2 px-4 transition-all cursor-pointer h-full",
              isActive ? 'bg-white/15' : 'hover:bg-white/10'
            )}>
               {isActive && (
                 <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--gold)]" />
               )}
               <span className="text-[9px] font-black text-[var(--gold)] font-mono">{btn.key}</span>
               <div className="flex items-center gap-1.5 opacity-80">
                 <btn.icon size={10} className={isActive ? 'text-[var(--gold)]' : 'text-white/40'} />
                 <span className="text-[9px] font-black uppercase tracking-tight text-white">{btn.label}</span>
               </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1" />

      <div className="flex items-stretch h-full divide-x divide-white/10">
        {/* HO Pulse Indicator — live */}
        <div 
          onClick={() => setShowSync(true)}
          className="flex items-center gap-3 px-4 cursor-pointer hover:bg-white/10 transition-all h-full"
        >
          <div className="flex gap-0.5 items-end h-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-0.5 rounded-none transition-all ${sync.status === 'online' ? 'animate-pulse' : ''}`}
                style={{
                  height: `${6 + i * 2}px`,
                  background: pulseColor,
                  animationDelay: `${i * 180}ms`,
                  opacity: sync.status === 'syncing' ? 0.4 : 1
                }}
              />
            ))}
          </div>
          <div className="text-[9px] font-black uppercase tracking-wider leading-none" style={{ color: pulseColor }}>
            {pulseLabel}
          </div>
        </div>

        {/* Node identity */}
        <div className="text-[9px] font-black uppercase tracking-widest px-4 flex items-center h-full text-white/50">
          {sync.nodeId || 'PST-X01'} · NODE v2.0
        </div>
      </div>

      {showSync && <SyncManagerModal onClose={() => setShowSync(false)} />}
    </div>
  );
};

export default StatusBar;




