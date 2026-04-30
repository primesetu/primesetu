/* ============================================================
 * SMRITI-OS — TopBar Component
 * Design: Stripe/Notion-inspired minimal topbar
 * © 2026 AITDL Network
 * ============================================================ */
import React, { useState } from 'react';
import { Bell, Settings, Search, ChevronDown, Monitor, Package, Globe, Lock, ShieldCheck, Palette, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '@/hooks/useMenu';
import { useTranslation } from 'react-i18next';
import { MODULES } from '@/lib/ModuleRegistry';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

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

  const categories = [
    { id: 'POS',       label: 'Sales',   icon: Monitor,     },
    { id: 'WAREHOUSE', label: 'Stock',   icon: Package,     },
    { id: 'FINANCE',   label: 'Finance', icon: ShieldCheck, },
    { id: 'HO',        label: 'Network', icon: Globe,       },
    { id: 'SYSTEM',    label: 'Setup',   icon: Lock,        },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 md:left-[var(--sw)] right-0 lg:right-[120px] z-[100] flex items-center px-4 gap-4 transition-all duration-300",
        theme === 'tallyprime' ? "tp-header" : "h-[var(--topbar-h)] bg-[var(--bg-base)] border-b border-[var(--border-subtle)]"
      )}
    >
      {/* ── Hamburger toggle ── */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('toggleSidebar'))}
        className="p-2 rounded-md transition-colors hover:bg-[var(--bg-float)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] shrink-0"
        title="Toggle Sidebar"
      >
        <Menu size={16} />
      </button>

      {/* ── Top menu nav ── */}
      <nav className="flex items-center gap-0.5">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="relative"
            onMouseEnter={() => setOpenMenu(cat.id)}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                openMenu === cat.id
                  ? 'bg-[var(--bg-float)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-float)]'
              }`}
            >
              <cat.icon size={13} />
              {cat.label}
              <ChevronDown size={11} className={`transition-transform duration-150 ${openMenu === cat.id ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {openMenu === cat.id && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full left-0 mt-1 w-56 rounded-xl overflow-hidden py-1 z-[200]"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}
                >
                  <div className="px-3 py-2 mb-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                      {cat.label}
                    </span>
                  </div>
                  {MODULES.filter(m => m.category === cat.id).map(module => (
                    <button
                      key={module.id}
                      onClick={() => { setActiveTab(module.id); setOpenMenu(null); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[var(--bg-float)] group text-[var(--text-primary)]"
                    >
                      <div className="w-7 h-7 flex items-center justify-center shrink-0">
                        <module.icon size={13} />
                      </div>
                      <div>
                        <div className="text-sm font-medium leading-tight">{module.label}</div>
                        {module.shortcut && (
                          <div className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{module.shortcut}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="w-px h-4 shrink-0 bg-white/20" />

      {/* ── Breadcrumb ── */}
      {/* ── Breadcrumb / Center Area ── */}
      <div className="flex-1 flex justify-center overflow-hidden">
        {document.documentElement.getAttribute('data-theme') === 'tallyprime' ? (
          <button
            onClick={() => setIsCommandBarOpen?.(true)}
            className="flex items-center gap-4 px-6 py-1 bg-black/20 hover:bg-black/30 border border-white/20 transition-all group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Go To</span>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <Search size={12} className="text-[var(--gold)]" />
              <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--gold)' }}>Alt+G</span>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
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
        {document.documentElement.getAttribute('data-theme') !== 'tallyprime' && (
          <button
            onClick={() => setIsCommandBarOpen?.(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-float)]"
          >
            <Search size={13} />
            <span className="hidden md:inline">Search</span>
            <span className="font-mono text-[10px] px-1 py-0.5 rounded" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>F3</span>
          </button>
        )}

        <button
          onClick={() => setTheme(theme === 'tesla' ? 'tallyprime' : 'tesla')}
          className="p-2 hover:bg-black/10"
        >
          <Palette size={15} />
        </button>

        <button className="p-2 hover:bg-black/10">
          <Bell size={15} />
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className="p-2 hover:bg-black/10"
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
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
