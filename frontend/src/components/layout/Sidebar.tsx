/* ============================================================
 * PrimeSetu — Sidebar Component
 * Design: Linear-inspired dark sidebar
 * © 2026 AITDL Network
 * ============================================================ */
import React, { useState, useMemo } from 'react';
import { ChevronDown, LayoutDashboard, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../../hooks/useMenu';
import { ICON_MAP } from '../../lib/ModuleRegistry';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLanguage } from '../../hooks/useLanguage';
import { useNodeSync } from '../../hooks/useNodeSync';
import { MenuItem } from '../../api/menuService';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  userRole?: string;
  nodeType?: string;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole = 'CASHIER',
  isCollapsed,
  setIsCollapsed
}) => {
  const { menu: modules } = useMenu();
  const sync = useNodeSync();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['POS', 'CATALOGUE']);

  const syncDot = sync.status === 'online' ? '#22C55E' : sync.status === 'syncing' ? '#F59E0B' : '#EF4444';
  const syncLabel = sync.status === 'online' ? 'Synced' : sync.status === 'syncing' ? 'Syncing…' : 'Offline';

  const categoryMap: Record<string, string> = {
    'POS': 'Operations', 'WAREHOUSE': 'Inventory',
    'CATALOGUE': 'Catalogue', 'FINANCE': 'Finance',
    'HO': 'Network', 'SYSTEM': 'Settings'
  };
  const catOrder = ['POS', 'WAREHOUSE', 'CATALOGUE', 'FINANCE', 'HO', 'SYSTEM'];
  const categories = useMemo(() => {
    const unique = Array.from(new Set(modules.map(m => m.category).filter(Boolean)));
    unique.sort((a, b) => catOrder.indexOf(a!) - catOrder.indexOf(b!));
    return unique.map(id => ({ id: id!, label: categoryMap[id!] || id! }));
  }, [modules]);

  const SidebarItem = ({ item, isActive, onSelect }: {
    item: MenuItem; isActive: boolean; onSelect: (id: string) => void;
  }) => {
    const Icon = ICON_MAP[item.module] || LayoutDashboard;
    useHotkeys(item.shortcut || '', (e) => { e.preventDefault(); onSelect(item.id); }, { enabled: !!item.shortcut });

    return (
      <button
        onClick={() => onSelect(item.id)}
        title={item.label}
        className={cn(
          "relative group flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-colors duration-100 text-left",
          isActive
            ? "bg-[var(--accent-bg)] text-[var(--accent-light)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-float)] hover:text-[var(--text-primary)]"
        )}
        style={{ margin: '1px 0' }}
      >
        {/* Active left bar */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[var(--accent)]"
          />
        )}

        <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />

        <span className="flex-1 text-sm font-medium truncate leading-none">
          {item.label}
        </span>

        {item.shortcut && (
          <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity px-1 py-0.5 rounded bg-[var(--bg-base)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
            {item.shortcut}
          </span>
        )}
      </button>
    );
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 0 : 256 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 bottom-0 flex flex-col z-[100] overflow-hidden"
      style={{ background: 'var(--bg-elevated)', borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* ── HEADER / LOGO ── */}
      <div className="h-[52px] flex items-center px-4 shrink-0 gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center shrink-0">
          <span className="text-white text-[10px] font-bold">P</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-semibold text-[var(--text-primary)] leading-tight tracking-tight whitespace-nowrap">PrimeSetu</span>
          <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap">Sovereign OS</span>
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-3">

        {/* Dashboard */}
        {modules.filter(m => m.module === 'dashboard').map(m => (
          <SidebarItem key={m.id} item={m} isActive={activeTab === m.id} onSelect={setActiveTab} />
        ))}

        <div className="my-3" style={{ height: '1px', background: 'var(--border-subtle)' }} />

        {/* Categories */}
        {categories.map(cat => {
          const catModules = modules.filter(m => m.category === cat.id && m.module !== 'dashboard');
          if (!catModules.length) return null;
          const isExpanded = expandedCategories.includes(cat.id);

          return (
            <div key={cat.id} className="mb-1">
              <button
                onClick={() => setExpandedCategories(p => p.includes(cat.id) ? p.filter(x => x !== cat.id) : [...p, cat.id])}
                className="w-full flex items-center justify-between px-2 py-1.5 group"
              >
                <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                  {cat.label}
                </span>
                <ChevronDown size={12} className={cn("text-[var(--text-tertiary)] transition-transform duration-150", !isExpanded && "-rotate-90")} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    {catModules.map(m => (
                      <SidebarItem key={m.id} item={m} isActive={activeTab === m.id} onSelect={setActiveTab} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── FOOTER / USER ── */}
      <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {/* Sync status */}
        <div className="flex items-center gap-2 px-2 py-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: syncDot }} />
          <span className="text-xs text-[var(--text-tertiary)] font-medium">{syncLabel}</span>
        </div>

        {/* User row */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--bg-float)] transition-colors cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-[var(--accent-light)]">{(userRole || 'U')[0]}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium text-[var(--text-primary)] truncate leading-tight">{userRole}</div>
            <div className="text-[10px] text-[var(--text-tertiary)] truncate">Sovereign Guard Active</div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
