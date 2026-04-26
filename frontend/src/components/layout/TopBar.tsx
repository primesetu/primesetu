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
import { Bell, Settings, Search, Globe } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import { useTranslation } from 'react-i18next';

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
  const { i18n } = useTranslation();
  const { findModule } = useMenu();
  const activeModule = findModule(activeTab);
  
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="fixed top-0 left-[var(--sw)] right-0 h-[64px] bg-white border-b border-border z-50 flex items-center px-8 gap-4">
      <div className="flex flex-col">
        <span className="font-serif text-2xl font-bold text-navy leading-none">
          {activeModule?.label || 'Dashboard'}
        </span>
        <span className="text-xs text-muted mt-1 font-semibold uppercase tracking-widest">
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
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                nodeType === type ? 'bg-navy text-white shadow-md' : 'text-navy/50 hover:bg-navy/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* LANGUAGE SWITCHER */}
      <div className="flex items-center bg-cream border border-border rounded-xl p-1 gap-1 mr-2">
        {[
          { code: 'en', label: 'EN' },
          { code: 'hi', label: 'HI' }
        ].map(lang => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
              i18n.language === lang.code ? 'bg-navy text-white shadow-sm' : 'text-navy/40 hover:bg-navy/10'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div 
        onClick={() => setIsCommandBarOpen?.(true)}
        className="search flex items-center gap-2 bg-cream border border-border rounded-xl p-[10px_16px] text-sm font-medium text-muted w-[280px] cursor-pointer hover:border-saffron transition-all"
      >
        <Search className="w-4 h-4" />
        <span>Global Search... <span className="ml-2 font-mono bg-border/50 text-navy/60 px-1.5 py-0.5 rounded text-xs">F3</span></span>
      </div>

      <div className="relative group">
        <div className="w-[42px] h-[42px] rounded-xl bg-cream border border-border flex items-center justify-center cursor-pointer transition-all hover:bg-navy hover:text-white">
          <Bell className="w-5 h-5" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-saffron rounded-full border-2 border-white"></div>
        </div>
      </div>

      <div className="w-[42px] h-[42px] rounded-xl bg-cream border border-border flex items-center justify-center cursor-pointer transition-all hover:bg-navy hover:text-white">
        <Settings className="w-5 h-5" />
      </div>

      <div className="bg-navy text-gold text-xs font-mono font-semibold px-4 py-2 rounded-full tracking-wider">
        {today}
      </div>
    </header>
  );
}
