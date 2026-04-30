/* ============================================================
   SMRITI-OS — Lead Frontend Architect Sidebar
   Enforcing Smriti Sentinal Governance (Audit Rule 11)
   ============================================================ */
import React, { useState, useMemo } from 'react';
import { ChevronDown, LayoutDashboard, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../../hooks/useMenu';
import { ICON_MAP } from '../../lib/ModuleRegistry';
import { useHotkeys } from 'react-hotkeys-hook';
import { MenuItem } from '../../api/menuService';
import { ThemeToggle } from '../ThemeToggle';
import { cn } from '@/components/ui/SovereignUI'; // Using our UI's cn
import { useTheme } from '@/hooks/useTheme';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  userRole?: string;
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
  const { theme, isInstitutional } = useTheme();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['POS', 'CATALOGUE', 'MASTERS', 'TRANSACTIONS', 'UTILITIES', 'REPORTS']);

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

    const renderLabel = () => {
      if (!isInstitutional || !item.shortcut) return item.label;
      
      const char = item.shortcut.replace('Alt+', '').replace('Ctrl+', '').toUpperCase();
      const index = item.label.toUpperCase().indexOf(char);
      
      if (index === -1) return item.label;
      
      return (
        <>
          {item.label.substring(0, index)}
          <span className="text-[var(--accent)] font-black underline decoration-2 underline-offset-2">{item.label[index]}</span>
          {item.label.substring(index + 1)}
        </>
      );
    };

    return (
      <button
        onClick={() => onSelect(item.id)}
        title={item.label}
        className={cn(
          "relative group flex items-center w-full gap-3 px-4 py-2.5 transition-all duration-100 text-left min-h-[44px]", // POS Standards
          isActive
            ? "bg-white/10 text-[var(--accent)] font-bold"
            : "text-[var(--aside-text-dim)] hover:bg-white/5 hover:text-[var(--aside-text)]"
        )}
      >
        {/* Active Indicator */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)]"
          />
        )}

        <div className={cn("flex flex-col items-center justify-center", isCollapsed ? "mx-auto" : "shrink-0")}>
          <Icon size={isCollapsed ? 20 : 16} strokeWidth={isActive ? 2.5 : 1.5} />
        </div>

        {!isCollapsed && (
          <span className={cn("flex-1 text-sm truncate leading-none", isInstitutional && "u-uppercase tracking-wide text-xs")}>
            {renderLabel()}
          </span>
        )}

        {!isCollapsed && item.shortcut && !isInstitutional && (
          <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded bg-[var(--background)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
            {item.shortcut}
          </span>
        )}
      </button>
    );
  };

  // Group modules for SMRITI-OS Dashboard structure
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
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-[var(--topbar-h)] left-0 bottom-[var(--status-bar-h,28px)] flex flex-col overflow-hidden z-[var(--z-sidebar)] transition-all"
        )}
        style={{ 
          width: isCollapsed ? 64 : 256,
          background: 'var(--aside-bg)',
          boxShadow: `calc(4px * ${isCollapsed ? 0 : 1}) 0 20px var(--aside-glow)`
        }}
      >
      {/* ── NAVIGATION ── */}
      <div className="flex-1 overflow-y-auto tally-scrollbar py-2">
        {isInstitutional ? (
          <div className="flex flex-col gap-0">
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
                    className="w-full flex items-center justify-between px-4 py-2 bg-white/5 text-[var(--accent)] font-black u-uppercase text-[10px] tracking-widest border-y border-[var(--accent-border)]"
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
          <div className="px-0 space-y-0.5">
            {modules.filter(m => m.module === 'dashboard').map(m => (
              <SidebarItem key={m.id} item={m} isActive={activeTab === m.id} onSelect={setActiveTab} />
            ))}

            <div className="my-3 mx-4 h-px bg-[var(--border-subtle)]" />

            {categories.map(cat => {
              const catModules = modules.filter(m => m.category === cat.id && m.module !== 'dashboard');
              if (!catModules.length) return null;
              const isExpanded = expandedCategories.includes(cat.id);

              return (
                <div key={cat.id} className="mb-1">
                  <button
                    onClick={() => setExpandedCategories(p => p.includes(cat.id) ? p.filter(x => x !== cat.id) : [...p, cat.id])}
                    className="w-full flex items-center justify-between px-4 py-2 group"
                  >
                    <span className="text-[10px] font-black u-uppercase tracking-[0.15em] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
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
        )}
      </div>

      {/* ── FOOTER / USER ── */}
      <div className={cn("px-3 py-4 shrink-0 border-t border-[var(--border-subtle)] flex flex-col gap-4 text-[var(--aside-text)]", isCollapsed && "items-center")}>
        <div className={cn(isCollapsed && "hidden")}>
          <ThemeToggle />
        </div>

        <div className={cn("flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer group", isCollapsed && "justify-center px-0")}>
          <div className="w-8 h-8 rounded bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-black text-[var(--primary)]">{(userRole || 'U')[0]}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold text-[var(--aside-text)] truncate leading-tight u-uppercase">{userRole}</div>
              <div className="text-[9px] text-[var(--aside-text-dim)] truncate u-uppercase font-black tracking-widest mt-0.5">Sovereign Guard</div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
    </>
  );
};

export default Sidebar;
