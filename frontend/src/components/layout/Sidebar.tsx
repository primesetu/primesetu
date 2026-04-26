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
  Zap,
  Globe,
  ShieldCheck,
  Power
} from 'lucide-react';
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
  nodeType = 'RETAIL',
  isCollapsed,
  setIsCollapsed
}) => {
  const { language, setLanguage } = useLanguage();
  const { menu: modules, loading } = useMenu();
  const sync = useNodeSync();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['POS', 'CATALOGUE']);

  const syncConfig = {
    online:  { dot: 'bg-emerald-400', label: 'Synced',   glow: 'shadow-[0_0_15px_rgba(52,211,153,0.5)]' },
    syncing: { dot: 'bg-brand-gold',  label: 'Syncing…', glow: 'shadow-[0_0_15px_rgba(244,162,97,0.5)]' },
    offline: { dot: 'bg-rose-500',    label: 'Isolated', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]' },
  }[sync.status];

  const categories = useMemo(() => {
    const categoryMap: Record<string, string> = {
      'POS': 'Operations',
      'WAREHOUSE': 'Inventory',
      'CATALOGUE': 'Registry',
      'FINANCE': 'Treasury',
      'HO': 'Network',
      'SYSTEM': 'Settings'
    };

    const uniqueCats = Array.from(new Set(modules.map(m => m.category).filter(Boolean)));
    const order = ['POS', 'WAREHOUSE', 'CATALOGUE', 'FINANCE', 'HO', 'SYSTEM'];
    uniqueCats.sort((a, b) => order.indexOf(a!) - order.indexOf(b!));

    return uniqueCats.map(catId => ({
      id: catId!,
      label: categoryMap[catId!] || catId!.toUpperCase()
    }));
  }, [modules]);

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
          "group relative flex items-center w-full px-6 py-4 transition-all duration-300",
          isActive 
            ? "bg-white text-black font-semibold" 
            : "text-white/40 hover:text-white hover:bg-white/5"
        )}
      >
        <div className={cn(
          "flex items-center justify-center transition-transform duration-300",
          isCollapsed ? "w-full" : "w-5 mr-4",
          isActive && "scale-105"
        )}>
          <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
        </div>
        
        {!isCollapsed && (
          <div className="flex-1 flex items-center justify-between overflow-hidden">
            <span className={cn(
              "text-xs uppercase tracking-widest truncate transition-all",
              isActive ? "text-black font-bold" : "text-inherit"
            )}>
              {item.label}
            </span>
            {item.shortcut && (
              <span className={cn(
                "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors",
                isActive ? "bg-black/10 text-black/60" : "bg-white/5 text-white/30 group-hover:text-white/70"
              )}>
                {item.shortcut}
              </span>
            )}
          </div>
        )}

        {isCollapsed && (
          <div className="fixed left-20 px-4 py-2 bg-white text-[10px] font-bold uppercase tracking-widest text-black rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[300]">
            {item.label}
          </div>
        )}
      </button>
    );
  };

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? 0 : 280 }}
      className="fixed top-0 left-0 bottom-0 flex flex-col z-[100] bg-black border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.3)] overflow-hidden"
      style={{ fontFamily: 'var(--font-tesla)' }}
    >
      {/* ── HEADER ── */}
      <div className="h-24 flex items-center px-6 shrink-0 relative group">
        {!isCollapsed ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 w-full">
             <button 
                onClick={() => setIsCollapsed(true)}
                className="w-10 h-10 bg-brand-gold rounded-2xl flex items-center justify-center shadow-lg shadow-brand-gold/20 hover:scale-105 transition-transform"
                title="Collapse Sidebar"
             >
                <Menu className="w-5 h-5 text-navy" />
             </button>
             <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tighter leading-none">PrimeSetu</span>
                <span className="text-[8px] font-black text-brand-gold uppercase tracking-[0.4em] mt-1">Sovereign OS</span>
             </div>
          </motion.div>
        ) : (
          <div className="mx-auto w-full flex justify-center">
             <button 
                onClick={() => setIsCollapsed(false)}
                className="w-10 h-10 bg-brand-gold rounded-2xl flex items-center justify-center shadow-lg shadow-brand-gold/20 hover:scale-105 transition-transform"
                title="Expand Sidebar"
             >
                <Menu className="w-5 h-5 text-navy" />
             </button>
          </div>
        )}
      </div>

      {/* ── NAVIGATION ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-6">
        <div className="mb-10">
          {!isCollapsed && <div className="px-8 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Command Center</div>}
          {modules.filter(m => m.module === 'dashboard').map(m => (
            <SidebarItem key={m.id} item={m} isActive={activeTab === m.id} onSelect={setActiveTab} />
          ))}
        </div>

        {categories.map(cat => {
          const catModules = modules.filter(m => m.category === cat.id && m.module !== 'dashboard');
          if (catModules.length === 0) return null;
          const isExpanded = expandedCategories.includes(cat.id);

          return (
            <div key={cat.id} className="mb-8">
              {!isCollapsed && (
                <button 
                  onClick={() => setExpandedCategories(p => p.includes(cat.id) ? p.filter(x => x !== cat.id) : [...p, cat.id])}
                  className="w-full flex items-center justify-between px-8 py-2 group"
                >
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] group-hover:text-brand-gold transition-colors">{cat.label}</span>
                  <ChevronDown size={12} className={cn("text-white/20 transition-transform", !isExpanded && "-rotate-90")} />
                </button>
              )}
              <AnimatePresence>
                {(isExpanded || isCollapsed) && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    {catModules.map(m => <SidebarItem key={m.id} item={m} isActive={activeTab === m.id} onSelect={setActiveTab} />)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── FOOTER ── */}
      <div className="mt-auto bg-white/[0.02] border-t border-white/5 p-8 shrink-0">
         <div className={cn(
           "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500",
           sync.status === 'online' ? "bg-emerald-500/5 border-emerald-500/10" : "bg-rose-500/5 border-rose-500/10"
         )}>
            <div className={cn("w-2 h-2 rounded-full", syncConfig.dot, syncConfig.glow)} />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className={cn("text-[9px] font-black uppercase tracking-widest", sync.status === 'online' ? "text-emerald-400" : "text-rose-400")}>Network: {syncConfig.label}</span>
                <span className="text-[8px] text-white/20 font-bold uppercase tracking-tight mt-0.5">Node ID: {nodeType}-001</span>
              </div>
            )}
         </div>

         {!isCollapsed && (
           <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-gradient-to-br from-white/10 to-transparent rounded-full flex items-center justify-center text-[10px] font-black text-white border border-white/10">{userRole[0]}</div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{userRole}</span>
                    <span className="text-[8px] text-white/20 font-bold uppercase tracking-tight">Sovereign Guard Active</span>
                 </div>
              </div>
              <button onClick={() => setIsCollapsed(true)} className="p-2 text-white/20 hover:text-brand-gold transition-colors"><Power size={14}/></button>
           </div>
         )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
