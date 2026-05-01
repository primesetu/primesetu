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

import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

import { ChevronRight, ChevronLeft } from 'lucide-react';

interface FunctionBarProps {
  activeTab: string;
  onAction?: (key: string) => void;
  isRightCollapsed?: boolean;
  setIsRightCollapsed?: (val: boolean) => void;
}

const FunctionBar: React.FC<FunctionBarProps> = ({ 
  activeTab, 
  isRightCollapsed, 
  setIsRightCollapsed 
}) => {
  const { theme } = useTheme();
  const isInstitutional = theme === 'LIGHT';

  // High-Density Shortcut Mapping (Tally style)
  const getContextKeys = () => {
    const baseKeys = [
      { key: 'F1', label: 'Help', type: 'normal' },
      { key: 'F2', label: 'Period', type: 'alt', hasSub: true },
      { key: 'F3', label: 'Company', type: 'alt', hasSub: true },
      { key: 'F4', label: '', type: 'spacer' },
      
      { key: 'F5', label: 'Refresh', type: 'normal' },
      { key: 'F6', label: 'Dashboard', type: 'normal' },
      { key: 'F7', label: 'Registry', type: 'normal' },
      { key: 'F8', label: 'Valuation', type: 'alt', hasSub: true },
      { key: 'F9', label: 'Stock Take', type: 'normal' },
      { key: 'F10', label: 'System', type: 'normal' },
      { key: 'F11', label: 'Features', type: 'normal' },
      { key: 'F4', label: '', type: 'spacer' },

      { key: 'B', label: 'Basis of Values', type: 'alt', hasSub: true },
      { key: 'H', label: 'Change View', type: 'alt', hasSub: true },
      { key: 'J', label: 'Exceptions', type: 'alt', hasSub: true },
      { key: 'L', label: 'Save View', type: 'alt', hasSub: true },
      { key: 'F4', label: '', type: 'spacer' },

      { key: 'C', label: 'New Column', type: 'alt' },
      { key: 'A', label: 'Alter Column', type: 'alt' },
      { key: 'D', label: 'Delete Column', type: 'alt' },
      { key: 'N', label: 'Auto Column', type: 'alt' },
      { key: 'F4', label: '', type: 'spacer' },

      { key: 'F12', label: 'Configure', type: 'normal', hasSub: true },
    ];

    return baseKeys;
  };

  const keys = getContextKeys();

  return (
    <>
      {/* Toggle Button for Right Sidebar (When Hidden) */}
      {isRightCollapsed && (
        <button
          onClick={() => setIsRightCollapsed?.(false)}
          className={cn(
            "fixed right-0 top-[20%] z-[var(--z-sidebar)] w-10 h-16 flex items-center justify-center rounded-l-xl transition-all shadow-2xl border-l-4",
            isInstitutional 
              ? "bg-[var(--accent)] border-[var(--gold)] text-white hover:pr-4" 
              : "bg-navy-mid border-white/20 text-white hover:pr-4"
          )}
          title="Show Shortcut Keys [Alt+K]"
        >
          <ChevronLeft size={24} className="animate-pulse" />
        </button>
      )}

      <aside className={cn(
        "c-function-bar fixed right-0 top-[var(--topbar-h)] bottom-[var(--status-bar-h,28px)] z-[var(--z-sidebar)] flex flex-col py-0 transition-all duration-300 ease-in-out overflow-hidden",
        isRightCollapsed ? "w-0 border-none" : "w-[var(--sidebar-right-w,160px)]"
      )}
      style={{ 
        background: 'var(--aside-bg)',
        boxShadow: `calc(-4px * ${isRightCollapsed ? 0 : 1}) 0 20px var(--aside-glow)` 
      }}
    >
        {/* Internal Toggle Button (When Visible) — Handle Style */}
        {!isRightCollapsed && (
          <button
            onClick={() => setIsRightCollapsed?.(true)}
            className={cn(
              "absolute left-0 top-[15%] -translate-x-1/2 z-[var(--z-sidebar)] w-8 h-12 flex items-center justify-center rounded-full border-2 transition-all hover:scale-110",
              isInstitutional ? "bg-[var(--accent)] border-white/20 text-white shadow-[var(--shadow-accent)]" : "bg-navy text-white border-white/10"
            )}
            title="Hide Shortcut Keys [Alt+K]"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <div className="flex-1 flex flex-col tally-scrollbar overflow-y-auto divide-y divide-white/5 border-t border-white/5">
          {keys.map((k, i) => {
            if (k.type === 'spacer') {
              return <div key={`spacer-${i}`} className="h-6 w-full bg-white/5 flex items-center justify-center">
                <div className="w-8 h-px bg-white/10" />
              </div>;
            }

            return (
              <div 
                key={`${k.key}-${i}`}
                className={cn(
                  "flex items-center px-4 py-0 transition-all group h-8 cursor-pointer",
                  isInstitutional ? "hover:bg-white/5" : "hover:bg-white/10"
                )}
              >
                <div className="flex-1 flex items-baseline gap-2 overflow-hidden">
                  <span className={cn(
                    "text-[10px] font-mono font-black tracking-tighter shrink-0",
                    isInstitutional ? "text-[var(--gold)]" : "text-gold",
                    k.type === 'alt' && "shortcut-alt",
                    k.type === 'ctrl' && "shortcut-ctrl"
                  )}>
                    {k.key}:
                  </span>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest truncate",
                    isInstitutional ? "text-white group-hover:text-[var(--gold)]" : "text-white/70"
                  )}>
                    {k.label}
                  </span>
                </div>
                
                {k.hasSub && (
                   <div className="w-1.5 h-1.5 bg-[var(--gold)]/20 rotate-45 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default FunctionBar;




