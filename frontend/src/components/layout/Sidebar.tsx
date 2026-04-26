/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation     :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Menu,
  ChevronLeft,
  LayoutDashboard,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../../hooks/useMenu';
import { ICON_MAP } from '../../lib/ModuleRegistry';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLanguage } from '../../hooks/useLanguage';
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
  const { language, setLanguage } = useLanguage();
  const { menu: modules, loading } = useMenu();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['POS', 'WAREHOUSE']);

  // 1. Dynamic Category Resolution (Following "Never Static Arrays" Rule)
  const categories = useMemo(() => {
    const categoryMap: Record<string, string> = {
      'POS': 'POS Operations',
      'WAREHOUSE': 'Warehouse & Stock',
      'FINANCE': 'Finance & Accounts',
      'HO': 'Head Office',
      'SYSTEM': 'System Admin'
    };

    // Extract unique categories from dynamic menu
    const uniqueCats = Array.from(new Set(modules.map(m => m.category).filter(Boolean)));
    
    return uniqueCats.map(catId => ({
      id: catId!,
      label: categoryMap[catId!] || catId!.toUpperCase()
    }));
  }, [modules]);

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
            ? "bg-gold/10 border-gold text-gold" 
            : "border-transparent text-white/70 hover:bg-white/10 hover:text-white"
        )}
        title={isCollapsed ? item.label : ''}
      >
        <div className={cn(
          "flex items-center justify-center transition-all duration-300",
          isCollapsed ? "w-full" : "w-5 mr-3"
        )}>
          <Icon size={16} className={isActive ? 'text-gold' : 'text-inherit opacity-60'} />
        </div>
        
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex items-center justify-between overflow-hidden"
          >
            <span className="text-[12.5px] font-black truncate uppercase tracking-wider">{item.label}</span>
            {item.shortcut && (
              <span className="text-[9px] font-black bg-white/10 text-white/50 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {item.shortcut}
              </span>
            )}
          </motion.div>
        )}

        {isCollapsed && (
          <div className="fixed left-20 px-3 py-1.5 bg-navy text-white text-[11px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[200] shadow-xl border border-white/10 font-bold uppercase tracking-widest">
            {item.label} {item.shortcut && `(${item.shortcut})`}
          </div>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <aside className="w-20 bg-navy min-h-screen fixed left-0 top-0 flex flex-col z-[100] items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </aside>
    );
  }

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 bottom-0 flex flex-col bg-navy z-[100] overflow-hidden border-r border-white/5 shadow-2xl"
      style={{ backgroundColor: '#0D1B3E' }}
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
              Prime<span className="text-gold">Setu</span>
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
            <div className="text-[9px] font-black tracking-[3px] uppercase text-white/45 px-5 mb-2">Overview</div>
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

        {/* Collapsible Categories Resolved Dynamically */}
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
                    <span className="text-[9px] font-black tracking-[3px] uppercase text-white/60 group-hover:text-white/80">
                      {cat.label}
                    </span>
                    <div className="text-white/30 group-hover:text-white/60">
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

      {/* Footer / Status / Language */}
      <div className="mt-auto border-t border-white/5 flex flex-col bg-white/[0.01] shrink-0">
        {!isCollapsed && (
          <div className="px-5 py-3 flex gap-2 border-b border-white/5">
            <button 
              onClick={() => setLanguage('en')}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all",
                language === 'en' ? "bg-gold text-navy shadow-lg" : "text-white/30 hover:bg-white/5"
              )}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('hi')}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all",
                language === 'hi' ? "bg-gold text-navy shadow-lg" : "text-white/30 hover:bg-white/5"
              )}
            >
              हिन्दी
            </button>
          </div>
        )}

        <div className="p-[14px_20px] flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-saffron to-gold rounded-full flex items-center justify-center text-[12px] font-black text-white shrink-0 shadow-lg shadow-saffron/10">
            {userRole?.[0] || 'U'}
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-hidden"
            >
              <div className="text-[11px] font-black text-white tracking-tight truncate uppercase">{nodeType} NODE</div>
              <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] truncate font-bold">{userRole} · Sovereign</div>
            </motion.div>
          )}
          {isCollapsed && (
            <button 
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[9px] font-black text-white/40 hover:text-white transition-all"
            >
              {language === 'en' ? 'HI' : 'EN'}
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
