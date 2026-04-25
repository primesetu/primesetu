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
import { 
  ChevronDown, 
  ChevronRight, 
  Menu,
  ChevronLeft,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../../hooks/useMenu';
import { ICON_MAP } from '../../lib/ModuleRegistry';
import { useHotkeys } from 'react-hotkeys-hook';
import { MenuItem } from '../../api/menuService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  nodeType = 'RETAIL',
  isCollapsed,
  setIsCollapsed
}) => {
  const { menu: modules, loading } = useMenu();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['POS', 'WAREHOUSE']);

  const categories = [
    { id: 'POS', label: 'POS Operations' },
    { id: 'WAREHOUSE', label: 'Warehouse & Stock' },
    { id: 'FINANCE', label: 'Finance & Accounts' },
    { id: 'HO', label: 'Head Office' },
    { id: 'SYSTEM', label: 'System Admin' },
  ];

  const toggleCategory = (id: string) => {
    if (isCollapsed) return;
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // ------------------------------------------------------------
  // Sidebar Item Component
  // ------------------------------------------------------------
  const SidebarItem = ({ item, isActive, onSelect }: { 
    item: MenuItem; 
    isActive: boolean; 
    onSelect: (id: string) => void 
  }) => {
    // FIX: Using item.module for icon mapping
    const Icon = ICON_MAP[item.module] || LayoutDashboard;
    
    useHotkeys(item.shortcut || '', (e) => {
      e.preventDefault();
      onSelect(item.id);
    }, { enabled: !!item.shortcut });

    return (
      <button
        onClick={() => onSelect(item.id)}
        className={cn(
          "group relative flex items-center w-full px-5 py-2.5 transition-all duration-200 border-l-[3px]",
          isActive 
            ? "bg-[var(--saffron)]/15 border-[var(--saffron)] text-white" 
            : "border-transparent text-white/50 hover:bg-white/5 hover:text-white"
        )}
        title={isCollapsed ? item.label : ''}
      >
        <div className={cn(
          "flex items-center justify-center transition-all duration-300",
          isCollapsed ? "w-full" : "w-5 mr-3"
        )}>
          <Icon size={16} className={isActive ? 'text-[var(--gold)]' : 'text-inherit opacity-60'} />
        </div>
        
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex items-center justify-between overflow-hidden"
          >
            <span className="text-[12.5px] font-medium truncate">{item.label}</span>
            {item.shortcut && (
              <span className="text-[9px] font-bold bg-white/5 text-white/30 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {item.shortcut}
              </span>
            )}
          </motion.div>
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="fixed left-20 px-3 py-1.5 bg-gray-900 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[200] shadow-xl border border-white/10 font-medium">
            {item.label} {item.shortcut && `(${item.shortcut})`}
          </div>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <aside className="w-[var(--sw)] bg-[var(--navy)] min-h-screen fixed left-0 top-0 flex flex-col z-[100] items-center justify-center transition-all duration-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--gold)]"></div>
      </aside>
    );
  }

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 bottom-0 flex flex-col bg-[var(--navy)] z-[100] overflow-hidden border-r border-white/5 shadow-2xl"
    >
      {/* Header / Toggle */}
      <div className="flex items-center justify-between h-[72px] px-5 border-b border-white/5 shrink-0">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5"
          >
            <svg width="30" height="30" viewBox="0 0 64 64" fill="none">
              <path d="M8 44 Q32 14 56 44" stroke="#F9B942" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
              <circle cx="32" cy="10" r="4" fill="#F4840A"/>
            </svg>
            <div className="font-serif text-[18px] font-black text-white tracking-tighter">
              Prime<span className="text-[var(--gold)]">Setu</span>
            </div>
          </motion.div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Pulse */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {/* Core Section */}
        <div className="mb-6">
          {!isCollapsed && (
            <div className="text-[9px] font-bold tracking-[3px] uppercase text-white/25 px-5 mb-2">Overview</div>
          )}
          {modules
            .filter(m => m.id === 'dashboard' || m.module === 'dashboard')
            .map(m => (
              <SidebarItem 
                key={m.id} 
                item={m} 
                isActive={activeTab === m.id} 
                onSelect={setActiveTab} 
              />
            ))
          }
        </div>

        {/* Collapsible Categories */}
        {categories.map(cat => {
          const modulesInCat = modules.filter(m => 
            m.id !== 'dashboard' && 
            m.category === cat.id
          );
          
          if (modulesInCat.length === 0) return null;
          const isExpanded = expandedCategories.includes(cat.id);

          return (
            <div key={cat.id} className="mb-4">
              <button 
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  "w-full flex items-center justify-between px-5 py-1 group transition-colors",
                  isCollapsed ? "justify-center" : "hover:bg-white/5"
                )}
              >
                {!isCollapsed && (
                  <>
                    <span className="text-[9px] font-bold tracking-[3px] uppercase text-white/25 group-hover:text-white/40">
                      {cat.label}
                    </span>
                    <div className="text-white/20 group-hover:text-white/40">
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </div>
                  </>
                )}
                {isCollapsed && <div className="h-px w-6 bg-white/10" />}
              </button>

              <AnimatePresence initial={false}>
                {(isExpanded || isCollapsed) && (
                  <motion.nav 
                    initial={isCollapsed ? { height: 'auto' } : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex flex-col overflow-hidden"
                  >
                    {modulesInCat.map(item => (
                      <SidebarItem 
                        key={item.id} 
                        item={item} 
                        isActive={activeTab === item.id} 
                        onSelect={setActiveTab} 
                      />
                    ))}
                  </motion.nav>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer / Status */}
      <div className="mt-auto border-t border-white/5 p-[14px_20px] flex items-center gap-3 bg-white/[0.01] shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-[var(--saffron)] to-[var(--gold)] rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0 shadow-lg shadow-orange-500/10">
          {userRole?.[0] || 'U'}
        </div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-hidden"
          >
            <div className="text-[11px] font-bold text-white tracking-tight truncate uppercase">{nodeType} NODE</div>
            <div className="text-[9px] text-white/40 uppercase tracking-widest truncate">{userRole} · Sovereign</div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
