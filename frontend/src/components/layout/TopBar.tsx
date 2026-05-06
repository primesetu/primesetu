/* ============================================================
 * SMRITI-OS — TopBar Component
 * Design: Stripe/Notion-inspired minimal topbar
 * © 2026 AITDL Network
 * ============================================================ */
import React, { useState, useRef } from 'react';
import { Bell, Settings, Search, ChevronDown, Monitor, Package, Globe, Lock, ShieldCheck, Palette, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '@/hooks/useMenu';
import { useTranslation } from 'react-i18next';
import { MODULES } from '@/lib/ModuleRegistry';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

import { Portal } from '@/components/ui/SovereignUI';

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
  const { theme, setTheme } = useTheme();
  const activeModule = findModule(activeTab);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuCoords, setMenuCoords] = useState<{ top: number, left: number } | null>(null);
  const closeTimeoutRef = useRef<any>(null);

  const categories = [
    { id: 'POS',       label: 'Sales',   icon: Monitor,     },
    { id: 'WAREHOUSE', label: 'Stock',   icon: Package,     },
    { id: 'FINANCE',   label: 'Finance', icon: ShieldCheck, },
    { id: 'HO',        label: 'Network', icon: Globe,       },
    { id: 'SYSTEM',    label: 'Setup',   icon: Lock,        },
  ];

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>, id: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuCoords({ top: rect.bottom, left: rect.left });
    setOpenMenu(id);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 150); // Small buffer to bridge the 4px gap
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[var(--z-nav)] flex items-center transition-all duration-300 tp-header"
      style={{ 
        paddingRight: '1rem' 
      }}
    >
      <div 
        className="flex items-center px-4 shrink-0 h-full transition-all tp-brand-divider"
        style={{ width: 'var(--sw)' }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-6 h-6 rounded-sm bg-white flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <span className="text-[10px] font-black text-[#1a4a48]">S</span>
          </div>
          <div className="flex flex-col overflow-hidden transition-opacity duration-300">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black leading-tight tracking-widest whitespace-nowrap u-uppercase text-white">
                SMRITI-OS
              </span>
              {/* Sovereign Connectivity Pulse */}
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Sovereign Ledger: Connected" />
            </div>
            <span className="text-[7px] font-black text-[var(--gold)] whitespace-nowrap u-uppercase tracking-[0.3em]">
              Architect Core v2.4
            </span>
          </div>
        </div>
        
        <div className="ml-auto">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggleSidebar'))}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/80 hover:text-white transition-colors shrink-0"
            title="Toggle Sidebar"
          >
            <Menu size={16} />
          </button>
        </div>
      </div>

      {/* ── Top menu nav ── */}
      <nav className="flex items-center divide-x divide-white/10 h-full border-r border-white/10 shrink-0">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="h-full relative"
            onMouseEnter={(e) => handleMouseEnter(e, cat.id)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={cn(
                "h-full flex items-center gap-2 px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                openMenu === cat.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <cat.icon size={13} className={openMenu === cat.id ? 'text-[var(--gold)]' : 'text-white/40'} />
              <span className="hidden lg:block">{cat.label}</span>
              <ChevronDown size={11} className={cn("transition-transform duration-150 opacity-40", openMenu === cat.id ? 'rotate-180 opacity-100' : '')} />
            </button>

            <AnimatePresence>
              {openMenu === cat.id && menuCoords && (
                <Portal>
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={() => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); }}
                    onMouseLeave={handleMouseLeave}
                    className="fixed w-64 rounded-xl overflow-hidden py-2 z-[var(--z-dropdown)] shadow-2xl border backdrop-blur-md"
                    style={{ 
                      top: `${menuCoords.top + 4}px`,
                      left: `${menuCoords.left}px`,
                      backgroundColor: 'var(--bg-overlay)', 
                      borderColor: 'var(--border-default)',
                    }}
                  >
                    <div className="px-4 py-2 mb-2 border-b border-[var(--border-subtle)]/50">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                        {cat.label}
                      </span>
                    </div>
                    {MODULES.filter(m => m.category === cat.id).map(module => (
                      <button
                        key={module.id}
                        onClick={() => { setActiveTab(module.id); setOpenMenu(null); }}
                        className="w-full flex items-center gap-4 px-4 py-2.5 text-left transition-all hover:bg-[var(--primary)]/10 group"
                      >
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg bg-[var(--bg-float)] group-hover:bg-[var(--primary)]/20 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors">
                          <module.icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-[var(--text-primary)] leading-tight truncate">{module.label}</div>
                          {module.shortcut && (
                            <div className="text-[9px] font-mono font-bold mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{module.shortcut}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                </Portal>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="w-px h-4 shrink-0 bg-white/20" />

      {/* ── Breadcrumb ── */}
      {/* ── Breadcrumb / Center Area ── */}
      <div className="flex-1 flex items-stretch h-full overflow-hidden">
        {theme === 'LIGHT' ? (
        <button
          onClick={() => setIsCommandBarOpen?.(true)}
          className="mx-12 flex-1 flex items-center max-w-2xl px-6 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
        >
          <Search size={14} className="text-white/30 group-hover:text-[var(--gold)] transition-colors" />
          <span className="ml-4 text-[11px] font-bold text-white/20 group-hover:text-white/40 tracking-widest uppercase">
            Execute Sovereign Command...
          </span>
          <div className="ml-auto flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-mono font-bold text-white px-1.5 py-0.5 rounded bg-white/10">Alt</span>
            <span className="text-[9px] font-mono font-bold text-white px-1.5 py-0.5 rounded bg-white/10 text-[var(--gold)]">G</span>
          </div>
        </button>
        ) : (
          <div className="flex-1 flex items-center px-6 gap-1.5 text-xs text-[var(--text-tertiary)]">
            <span>SMRITI-OS</span>
            <span>/</span>
            <span className="font-medium truncate text-[var(--text-primary)]">
              {activeModule?.label || 'Dashboard'}
            </span>
          </div>
        )}
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setIsCommandBarOpen?.(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-white/80 hover:text-white hover:bg-white/10"
        >
          <Search size={13} />
          <span className="hidden md:inline">Search</span>
          <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-white/10 border border-white/20">F3</span>
        </button>

        <button className={cn("p-2 transition-colors", theme === 'LIGHT' ? "hover:bg-white/10" : "hover:bg-black/10")}>
          <Bell size={15} />
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={cn("p-2 transition-colors", theme === 'LIGHT' ? "hover:bg-white/10" : "hover:bg-black/10")}
        >
          <Settings size={15} />
        </button>

        {userRole === 'OWNER' && setNodeType && (
          <div className="flex items-center ml-1">
            {(['RETAIL', 'HO', 'WAREHOUSE'] as const).map(type => (
              <button
                key={type}
                onClick={() => setNodeType(type)}
                className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                  nodeType === type
                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-black/20'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* ── PRIMESETU MASTER BRANDING ── */}
        <div className="ml-4 pl-4 border-l border-white/20 flex flex-col items-end shrink-0 w-[180px]">
          <div className="w-full flex justify-between text-[14px] font-black text-white leading-none">
            {"PRIMESETU".split('').map((c, i) => (
              <span key={i} className={i >= 5 ? "text-[var(--accent)]" : ""}>{c}</span>
            ))}
          </div>
          <div className="w-full flex justify-between text-[6px] uppercase font-bold text-white/60 leading-none mt-1.5">
            {"Smart Enterprise Technology Unified".split('').map((c, i) => (
              <span key={i}>{c === ' ' ? '\u00A0' : c}</span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}




