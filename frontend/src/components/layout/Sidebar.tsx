/* ============================================================
 * SMRITI-OS — Sidebar Component
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
import { ThemeToggle } from '../ThemeToggle';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

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
  const { theme } = useTheme();
  const sync = useNodeSync();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['POS', 'CATALOGUE', 'MASTERS', 'TRANSACTIONS', 'UTILITIES', 'REPORTS']);

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
    const isTally = theme === 'tallyprime';
    useHotkeys(item.shortcut || '', (e) => { e.preventDefault(); onSelect(item.id); }, { enabled: !!item.shortcut });

    const renderLabel = () => {
      if (!isTally || !item.shortcut) return item.label;
      
      const char = item.shortcut.replace('Alt+', '').replace('Ctrl+', '').toUpperCase();
      const index = item.label.toUpperCase().indexOf(char);
      
      if (index === -1) return item.label;
      
      return (
        <>
          {item.label.substring(0, index)}
          <span className="text-[#f29b12] font-black underline decoration-2 underline-offset-2">{item.label[index]}</span>
          {item.label.substring(index + 1)}
        </>
      );
    };

    return (
      <button
        onClick={() => onSelect(item.id)}
        title={item.label}
        className={cn(
          "relative group flex items-center w-full gap-3 px-3 py-2 transition-colors duration-100 text-left",
          isTally ? "rounded-none" : "rounded-lg",
          isActive
            ? (isTally ? "sidebar-item-active" : "bg-accent-bg text-accent-light")
            : (isTally ? "text-[var(--text-secondary)] hover:bg-[var(--accent-light)]" : "text-text-secondary hover:bg-bg-float hover:text-text-primary")
        )}
        style={{ margin: isTally ? '0' : '1px 0' }}
      >
        {/* Active left bar */}
        {isActive && !isTally && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-accent"
          />
        )}

        <div className={cn("flex flex-col items-center justify-center", isCollapsed ? "mx-auto" : "shrink-0")}>
          <Icon size={isCollapsed ? 20 : 16} strokeWidth={isActive ? 2 : 1.5} className={cn(isTally && isActive && "text-[var(--accent)]")} />
          {isCollapsed && item.shortcut && (
            <span className="text-[9px] font-mono mt-1 opacity-70 font-bold tracking-tighter">
              {item.shortcut.replace('Alt+', 'A-').replace('Ctrl+', 'C-')}
            </span>
          )}
        </div>

        {!isCollapsed && (
          <span className={cn("flex-1 text-sm font-medium truncate leading-none", isTally && "uppercase tracking-wide text-xs")}>
            {renderLabel()}
          </span>
        )}

        {!isCollapsed && item.shortcut && !isTally && (
          <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity px-1 py-0.5 rounded bg-bg-base text-text-tertiary border border-border-subtle">
            {item.shortcut}
          </span>
        )}
      </button>
    );
  };

  const isTally = theme === 'tallyprime';

  // Group modules for Tally Gateway structure
  const tallyGroups = useMemo(() => {
    return {
      'MASTERS': modules.filter(m => m.category === 'CATALOGUE'),
      'TRANSACTIONS': modules.filter(m => m.category === 'POS'),
      'UTILITIES': modules.filter(m => m.category === 'WAREHOUSE'),
      'REPORTS': modules.filter(m => m.category === 'FINANCE'),
    };
  }, [modules]);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {!isCollapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] transition-opacity duration-300" 
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 bottom-[var(--status-bar-h)] flex flex-col overflow-hidden transition-transform duration-300",
          isCollapsed ? "-translate-x-full md:translate-x-0 z-[100]" : "translate-x-0 shadow-2xl md:shadow-none z-[10000] md:z-[100]",
          isTally ? "tp-sidebar" : "bg-bg-elevated border-r border-border-subtle",
          !isCollapsed && "max-md:bottom-0 max-md:border-r-0" // Full screen height on mobile
        )}
      >
      {/* ── HEADER / LOGO ── */}
      <div className={cn(
        "h-[52px] flex items-center px-4 shrink-0 gap-3 border-b border-border-subtle",
        isTally ? "tp-sidebar-header" : "bg-bg-elevated"
      )}>
        <div className={cn(
          "w-6 h-6 rounded-md bg-accent flex items-center justify-center shrink-0",
          isCollapsed && "mx-auto",
          isTally && "bg-white"
        )}>
          <span className={cn("text-[10px] font-bold", isTally ? "text-[#008c85]" : "text-white")}>{isTally ? 'T' : 'S'}</span>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold leading-tight tracking-tight whitespace-nowrap">
              {isTally ? "Gateway of Tally" : "SMRITI-OS"}
            </span>
            <span className="text-[10px] opacity-60 whitespace-nowrap">
              {isTally ? "PrimeSetu Edition" : "Sovereign OS"}
            </span>
          </div>
        )}
      </div>

      {/* ── NAVIGATION ── */}
      <div className="flex-1 overflow-y-auto tally-scrollbar py-2">
        {isTally ? (
          <div className="flex flex-col gap-0">
            {/* Dashboard / Home */}
            {modules.filter(m => m.module === 'dashboard').map(m => (
              <SidebarItem key={m.id} item={m} isActive={activeTab === m.id} onSelect={setActiveTab} />
            ))}

            {Object.entries(tallyGroups).map(([group, items]) => {
              if (!items.length) return null;
              const isExpanded = expandedCategories.includes(group);
              
              return (
                <div key={group} className="mt-2 first:mt-0">
                  <button
                    onClick={() => setExpandedCategories(p => p.includes(group) ? p.filter(x => x !== group) : [...p, group])}
                    className="w-full flex items-center justify-between tp-section-header cursor-pointer group hover:opacity-80 transition-opacity"
                  >
                    <span>{group}</span>
                    <ChevronDown size={14} className={cn("transition-transform duration-150", !isExpanded && "-rotate-90")} />
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
                        {items.map(item => (
                          <SidebarItem key={item.id} item={item} isActive={activeTab === item.id} onSelect={setActiveTab} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-3 space-y-1">
            {/* Dashboard */}
            {modules.filter(m => m.module === 'dashboard').map(m => (
              <SidebarItem key={m.id} item={m} isActive={activeTab === m.id} onSelect={setActiveTab} />
            ))}

            <div className="my-3 h-px bg-border-subtle" />

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
                    <span className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary group-hover:text-text-secondary transition-colors">
                      {cat.label}
                    </span>
                    <ChevronDown size={12} className={cn("text-text-tertiary transition-transform duration-150", !isExpanded && "-rotate-90")} />
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
        )}
      </div>

      {/* ── FOOTER / USER ── */}
      <div className={cn("px-3 py-3 shrink-0 border-t border-border-subtle flex flex-col gap-3", isCollapsed && "items-center")}>
        {/* Theme Toggle */}
        <div className={cn(isCollapsed && "hidden")}>
          <ThemeToggle />
        </div>

        {/* Sync status */}
        <div className={cn("flex items-center gap-2 px-2 py-1", isCollapsed && "justify-center px-0")}>
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: syncDot }} title={syncLabel} />
          {!isCollapsed && <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">{syncLabel}</span>}
        </div>

        {/* User row */}
        <div className={cn("flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-bg-float transition-colors cursor-pointer group", isCollapsed && "justify-center px-0")}>
          <div className="w-7 h-7 rounded-full bg-accent-bg border border-accent-border flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-accent-light">{(userRole || 'U')[0]}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-text-primary truncate leading-tight">{userRole}</div>
              <div className="text-[10px] text-text-tertiary truncate">Sovereign Guard Active</div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
    </>
  );
};

export default Sidebar;
