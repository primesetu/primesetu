/* ============================================================
 * PrimeSetu — TopBar Component
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
      className="fixed top-0 left-[var(--sw)] right-0 z-[100] flex items-center px-4 gap-4 transition-all duration-200"
      style={{
        height: 'var(--topbar-h)',
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
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
                      className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[var(--bg-float)] group"
                    >
                      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                           style={{ background: 'var(--bg-float)' }}>
                        <module.icon size={13} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-light)]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">{module.label}</div>
                        {module.shortcut && (
                          <div className="text-[10px] font-mono text-[var(--text-tertiary)]">{module.shortcut}</div>
                        )}
                      </div>
                    </button>
                  ))}
                  {MODULES.filter(m => m.category === cat.id).length === 0 && (
                    <div className="px-3 py-4 text-center text-xs text-[var(--text-tertiary)]">No modules</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="w-px h-4 shrink-0" style={{ background: 'var(--border-default)' }} />

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-xs overflow-hidden flex-1">
        <span className="text-[var(--text-tertiary)] shrink-0">PrimeSetu</span>
        <span className="text-[var(--border-default)]">/</span>
        <span className="text-[var(--text-primary)] font-medium truncate">
          {activeModule?.label || 'Dashboard'}
        </span>
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Search */}
        <button
          onClick={() => setIsCommandBarOpen?.(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-float)] border border-transparent hover:border-[var(--border-default)]"
        >
          <Search size={13} />
          <span className="hidden md:inline">Search</span>
          <span className="font-mono text-[10px] px-1 py-0.5 rounded" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>F3</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'tesla' ? 'shoper9' : 'tesla')}
          className="p-2 rounded-md transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-float)]"
          title={theme === 'tesla' ? 'Switch to Classic' : 'Switch to Modern'}
        >
          <Palette size={15} />
        </button>

        <button
          className="p-2 rounded-md transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-float)]"
        >
          <Bell size={15} />
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className="p-2 rounded-md transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-float)]"
        >
          <Settings size={15} />
        </button>

        {/* Node type (owners only) */}
        {userRole === 'OWNER' && setNodeType && (
          <div className="flex items-center rounded-md p-0.5 gap-0.5 ml-1" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
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
