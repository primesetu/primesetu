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

import React from 'react';
import { Zap } from 'lucide-react';

interface StatusBarProps {
  activeTab: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ activeTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-navy border-t-2 border-gold/40 z-[9999] flex items-center px-10 gap-12 shadow-[0_-10px_40px_rgba(13,27,62,0.5)] backdrop-blur-md">
      <div className="flex gap-8">
        {[
          { key: 'F1', label: 'Billing' },
          { key: 'F2', label: 'Items' },
          { key: 'F3', label: 'Reports' },
          { key: 'F9', label: 'Stock' },
          { key: 'F10', label: 'Setup' },
          { key: 'F12', label: 'DayEnd' }
        ].map(btn => (
          <div key={btn.key} className="flex items-center gap-3 group cursor-pointer">
             <span className="text-gold font-black text-[12px] group-hover:scale-125 transition-transform">{btn.key}</span>
             <span className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] group-hover:text-white transition-colors">{btn.label}</span>
          </div>
        ))}
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-10">
         <div className="flex items-center gap-4 text-white/30">
            <Zap className="w-4 h-4 text-gold animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Node Active</span>
         </div>
         <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.6em] pr-4">
           PrimeSetu Sovereign Node v1.02.26
         </div>
      </div>
    </div>
  );
};

export default StatusBar;
