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
  const isTally = theme === 'SMRITI-OS';

  // Static mapping for core Shoper9-style function keys
  const getContextKeys = () => {
    switch(activeTab) {
      case 'sales':
        return [
          { key: 'F1', label: 'New Bill' },
          { key: 'F2', label: 'Item Search' },
          { key: 'F4', label: 'Returns' },
          { key: 'F5', label: 'Suspended' },
          { key: 'F7', label: 'Exact Cash' },
          { key: 'F8', label: 'Settlement' },
          { key: 'F9', label: 'Bill Totals' },
          { key: 'F10', label: 'Finalize' },
          { key: 'F12', label: 'Suspend' },
        ];
      case 'inventory':
      case 'registry':
        return [
          { key: 'F1', label: 'Select Store' },
          { key: 'F2', label: 'Advanced Search' },
          { key: 'F3', label: 'Stock Report' },
          { key: 'F5', label: 'Refresh Grid' },
          { key: 'F9', label: 'Stock Take' },
          { key: 'F12', label: 'Configure' },
        ];
      default:
        return [
          { key: 'F1', label: 'Help' },
          { key: 'F2', label: 'Date Change' },
          { key: 'F3', label: 'Company Info' },
          { key: 'F10', label: 'System Config' },
          { key: 'F11', label: 'Features' },
          { key: 'F12', label: 'Configuration' },
        ];
    }
  };

  const keys = getContextKeys();

  return (
    <>
      {/* Toggle Button for Right Sidebar (When Hidden) */}
      {isRightCollapsed && (
        <button
          onClick={() => setIsRightCollapsed?.(false)}
          className={cn(
            "fixed right-0 top-1/2 -translate-y-1/2 z-[var(--z-sidebar)] p-1 rounded-l-md transition-all shadow-md",
            isTally ? "bg-[var(--accent)] text-[var(--gold)]" : "bg-accent text-white"
          )}
          title="Show Shortcut Keys"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      <aside className={cn(
        "fixed right-0 top-[var(--topbar-h)] bottom-[var(--status-bar-h,24px)] z-[var(--z-sidebar)] flex flex-col py-0 transition-all duration-300 ease-in-out overflow-hidden",
        isRightCollapsed ? "w-0 border-none" : "w-[var(--sidebar-right-w,120px)]",
        isTally 
          ? "border-l" 
          : "bg-navy-mid border-l border-white/5"
      )}
      style={isTally ? { background: 'var(--accent-dark, #1a4a48)', borderColor: 'var(--accent-border)' } : {}}
    >
        {/* Internal Toggle Button (When Visible) */}
        {!isRightCollapsed && (
          <button
            onClick={() => setIsRightCollapsed?.(true)}
            className={cn(
              "absolute left-0 top-2 -translate-x-1/2 z-[var(--z-sidebar)] p-1 rounded-full border shadow-sm transition-all",
              isTally ? "bg-[var(--accent)] border-[var(--accent-border)] text-[var(--gold)]" : "bg-navy text-white border-white/10"
            )}
            title="Hide Shortcut Keys"
          >
            <ChevronRight size={12} />
          </button>
        )}

        {Array.from({ length: 12 }).map((_, i) => {
          const keyNum = `F${i + 1}`;
          const activeKey = keys.find(k => k.key === keyNum);

          return (
            <div 
              key={keyNum}
              className={cn(
                "flex-1 flex flex-col items-center justify-center border-b transition-all min-w-[120px]",
                isTally ? "border-[var(--accent-border)]" : "border-white/5",
              activeKey 
                  ? (isTally 
                      ? 'cursor-pointer group border-l-2 border-transparent hover:border-[var(--gold)] hover:bg-[var(--accent)]' 
                      : 'cursor-pointer hover:bg-white/10 active:bg-saffron/20 group')
                  : 'opacity-20 pointer-events-none'
              )}
            >
              <span className={cn(
                "text-lg font-mono font-black tracking-tighter",
                activeKey 
                  ? (isTally ? 'text-[var(--gold)]' : 'text-gold group-hover:scale-110 transition-transform') 
                  : 'text-white/30'
              )}>
                {keyNum}
              </span>
              {activeKey && (
                <span className={cn(
                  "text-xs font-bold uppercase tracking-tight text-center px-1 leading-tight mt-1",
                  isTally ? "text-white" : "text-white/70"
                )}>
                  {activeKey.label}
                </span>
              )}
            </div>
          );
        })}
      </aside>
    </>
  );
};

export default FunctionBar;




