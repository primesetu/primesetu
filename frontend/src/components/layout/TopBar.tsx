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
import { Bell, Settings, Search } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  userRole?: string;
  nodeType?: 'RETAIL' | 'HO' | 'WAREHOUSE';
  setNodeType?: (type: 'RETAIL' | 'HO' | 'WAREHOUSE') => void;
  setIsCommandBarOpen?: (val: boolean) => void;
}

export default function TopBar({ 
  activeTab, 
  userRole = 'CASHIER', 
  nodeType = 'RETAIL', 
  setNodeType,
  setIsCommandBarOpen
}: TopBarProps) {
  const { findModule } = useMenu();
  const activeModule = findModule(activeTab);
  
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="fixed top-0 left-[var(--sw)] right-0 h-[58px] bg-white border-b border-border z-50 flex items-center px-7 gap-3">
      <div className="flex flex-col">
        <span className="font-serif text-[18px] font-bold text-navy leading-none">
          {activeModule?.label || 'Dashboard'}
        </span>
        <span className="text-[11px] text-muted mt-0.5 font-medium uppercase tracking-widest">
          {activeModule?.id === 'dashboard' ? 'Sovereign Awareness' : (activeModule?.module || 'System Module')}
        </span>
      </div>

      <div className="flex-1" />

      {/* NODE TOPOLOGY SWITCHER (Reflecting "PrimeSetu hi sab hai") */}
      {userRole === 'OWNER' && setNodeType && (
        <div className="flex items-center bg-navy/5 border border-navy/10 rounded-xl p-1 gap-1 mr-4">
          {(['RETAIL', 'WAREHOUSE', 'HO'] as const).map(type => (
            <button
              key={type}
              onClick={() => setNodeType(type)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                nodeType === type ? 'bg-navy text-white shadow-md' : 'text-navy/50 hover:bg-navy/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      <div 
        onClick={() => setIsCommandBarOpen?.(true)}
        className="search flex items-center gap-2 bg-cream border border-border rounded-lg p-[7px_12px] text-[12px] text-muted w-[210px] cursor-pointer hover:border-saffron transition-all"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Global Search... <span className="ml-2 opacity-30 text-[10px]">F3</span></span>
      </div>

      <div className="relative group">
        <div className="w-[34px] h-[34px] rounded-lg bg-cream border border-border flex items-center justify-center cursor-pointer transition-all hover:bg-navy hover:text-white">
          <Bell className="w-4 h-4" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-saffron rounded-full border-2 border-white"></div>
        </div>
      </div>

      <div className="w-[34px] h-[34px] rounded-lg bg-cream border border-border flex items-center justify-center cursor-pointer transition-all hover:bg-navy hover:text-white">
        <Settings className="w-4 h-4" />
      </div>

      <div className="bg-navy text-gold text-[10px] font-semibold p-[5px_12px] rounded-full tracking-wider">
        {today}
      </div>
    </header>
  );
}
