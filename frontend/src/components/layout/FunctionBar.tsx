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

import React from 'react';

interface FunctionBarProps {
  activeTab: string;
  onAction?: (key: string) => void;
}

const FunctionBar: React.FC<FunctionBarProps> = ({ activeTab }) => {
  // Static mapping for core Shoper9-style function keys
  // In a full implementation, these would come from the active component's context
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
    <aside className="fixed right-0 top-[64px] bottom-0 w-[120px] bg-navy-mid border-l border-white/5 z-50 flex flex-col py-1">
      {Array.from({ length: 12 }).map((_, i) => {
        const keyNum = `F${i + 1}`;
        const activeKey = keys.find(k => k.key === keyNum);

        return (
          <div 
            key={keyNum}
            className={`
              flex-1 flex flex-col items-center justify-center border-b border-white/5 transition-all
              ${activeKey 
                ? 'cursor-pointer hover:bg-white/10 active:bg-saffron/20 group' 
                : 'opacity-20 pointer-events-none'
              }
            `}
          >
            <span className={`text-lg font-mono font-black tracking-tighter ${activeKey ? 'text-gold group-hover:scale-110 transition-transform' : 'text-white/30'}`}>
              {keyNum}
            </span>
            {activeKey && (
              <span className="text-xs font-bold text-white/70 uppercase tracking-tight text-center px-1 leading-tight mt-1">
                {activeKey.label}
              </span>
            )}
          </div>
        );
      })}
    </aside>
  );
};

export default FunctionBar;
