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

import React, { useState } from 'react';
import { Bell, Settings, Search, ChevronDown, Monitor, Package, Globe, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '@/hooks/useMenu';
import { useTranslation } from 'react-i18next';
import { MODULES } from '@/lib/ModuleRegistry';

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
  setActiveTab,
  userRole = 'CASHIER', 
  nodeType = 'RETAIL', 
  setNodeType,
  setIsCommandBarOpen
}: TopBarProps) {
  const { i18n } = useTranslation();
  const { findModule } = useMenu();
  const activeModule = findModule(activeTab);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  
  const categories = [
    { id: 'POS', label: 'Bazaar', icon: Monitor, color: 'text-emerald-600' },
    { id: 'WAREHOUSE', label: 'Khazana', icon: Package, color: 'text-amber-600' },
    { id: 'FINANCE', label: 'Khatavahi', icon: ShieldCheck, color: 'text-indigo-600' },
    { id: 'HO', label: 'Sanchalan', icon: Globe, color: 'text-rose-600' },
    { id: 'SYSTEM', label: 'Sashakt', icon: Lock, color: 'text-slate-600' },
  ];

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="fixed top-0 left-[var(--sw)] right-0 h-[72px] bg-white border-b-2 border-border z-[100] flex items-center px-6 gap-6 shadow-sm">
      {/* ── Classic Top Menu System ── */}
      <nav className="flex items-center gap-1 h-full">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="relative h-full flex items-center"
            onMouseEnter={() => setOpenMenu(cat.id)}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                openMenu === cat.id ? 'bg-navy text-white shadow-lg' : 'text-navy hover:bg-navy/5'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${openMenu === cat.id ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {openMenu === cat.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-[80%] left-0 w-64 bg-white border-2 border-border rounded-2xl shadow-2xl overflow-hidden py-2 z-[110]"
                >
                  <div className={`px-4 py-2 mb-2 border-b border-border/50 bg-cream/30 ${cat.color} font-black text-[9px] uppercase tracking-tighter`}>
                    {cat.id} Modules
                  </div>
                  {MODULES.filter(m => m.category === cat.id).map(module => (
                    <button
                      key={module.id}
                      onClick={() => {
                        setActiveTab(module.id);
                        setOpenMenu(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-saffron/10 group transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center group-hover:bg-navy group-hover:text-gold transition-all">
                        <module.icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-navy uppercase tracking-wider">{module.label}</span>
                        {module.shortcut && <span className="text-[9px] font-bold text-muted">{module.shortcut}</span>}
                      </div>
                    </button>
                  ))}
                  {MODULES.filter(m => m.category === cat.id).length === 0 && (
                    <div className="px-4 py-8 text-center text-[10px] font-bold text-muted uppercase italic">No modules assigned</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      <div className="h-8 w-px bg-border mx-2" />

      {/* ── Dynamic Breadcrumb Path ── */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
          <span>PrimeSetu</span>
          <span className="opacity-30">/</span>
          <span className="text-navy">{categories.find(c => c.id === activeModule?.category)?.label || 'System'}</span>
        </div>
        <h2 className="text-xl font-serif font-black text-navy leading-tight truncate max-w-[200px]">
          {activeModule?.label || 'Dashboard'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* NODE TOPOLOGY SWITCHER */}
        {userRole === 'OWNER' && setNodeType && (
          <div className="hidden xl:flex items-center bg-navy/5 border border-navy/10 rounded-xl p-1 gap-1">
            {(['RETAIL', 'WAREHOUSE', 'HO'] as const).map(type => (
              <button
                key={type}
                onClick={() => setNodeType(type)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  nodeType === type ? 'bg-navy text-white shadow-md' : 'text-navy/50 hover:bg-navy/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* SEARCH BAR (F3) */}
        <div 
          onClick={() => setIsCommandBarOpen?.(true)}
          className="hidden md:flex items-center gap-3 bg-cream border-2 border-border rounded-xl px-4 py-2 text-xs font-bold text-muted cursor-pointer hover:border-navy transition-all group w-[220px]"
        >
          <Search className="w-4 h-4 group-hover:text-navy" />
          <span>Quick Find...</span>
          <span className="ml-auto font-mono bg-border text-[9px] px-1.5 py-0.5 rounded">F3</span>
        </div>

        {/* UTILITIES */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-cream border border-border flex items-center justify-center hover:bg-navy hover:text-white transition-all">
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className="w-10 h-10 rounded-xl bg-cream border border-border flex items-center justify-center hover:bg-navy hover:text-white transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden lg:flex flex-col items-end">
          <div className="text-[10px] font-black text-navy uppercase tracking-widest leading-none">Voucher Date</div>
          <div className="text-xs font-bold text-muted mt-1">{today}</div>
        </div>
      </div>
    </header>
  );
}
