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

import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { ICON_MAP } from '../../lib/ModuleRegistry';
import { useMenu } from '../../hooks/useMenu';
import { MenuItem } from '../../api/menuService';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  userRole?: string;
  nodeType?: string;
}

/**
 * SidebarItem Component
 * Handles individual menu rendering and hotkey registration.
 */
const SidebarItem: React.FC<{
  item: MenuItem;
  isActive: boolean;
  onSelect: (id: string) => void;
}> = ({ item, isActive, onSelect }) => {
  
  // Rule 4: Terminal Mode Hotkeys (Keyboard First)
  useHotkeys(item.shortcut || '', () => onSelect(item.id), {
    enabled: !!item.shortcut,
    preventDefault: true,
    enableOnFormTags: false
  });

  const Icon = ICON_MAP[item.id] || ICON_MAP['dashboard'];

  return (
    <div 
      onClick={() => onSelect(item.id)}
      className={`
        group flex items-center gap-2.5 px-5 py-2.5 cursor-pointer transition-all border-l-[3px]
        ${isActive 
          ? 'bg-[var(--saffron)]/15 text-white border-[var(--saffron)] font-medium' 
          : 'text-white/50 border-transparent hover:bg-white/5 hover:text-white/85 hover:border-white/20'
        }
      `}
    >
      <span className={`text-[15px] w-5 flex items-center justify-center ${isActive ? 'text-[var(--gold)]' : 'text-inherit opacity-40 group-hover:opacity-100'}`}>
        <Icon size={16} />
      </span>
      <span className="text-[12.5px]">
        {item.label}
      </span>
      {item.shortcut && (
        <span className="ml-auto text-[9px] font-bold bg-white/5 text-white/30 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {item.shortcut}
        </span>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole = 'CASHIER', nodeType = 'RETAIL' }) => {
  const { menu: modules, loading } = useMenu();

  if (loading) {
    return (
      <aside className="sidebar w-[var(--sw)] bg-[var(--navy)] min-h-screen fixed left-0 top-0 flex flex-col z-[100] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--gold)]"></div>
      </aside>
    );
  }

  // Categories from Sovereign Protocol
  const categories = [
    { id: 'POS', label: 'POS Operations' },
    { id: 'WAREHOUSE', label: 'Warehouse & Stock' },
    { id: 'FINANCE', label: 'Finance & Accounts' },
    { id: 'HO', label: 'Head Office' },
    { id: 'SYSTEM', label: 'System Admin' },
  ];

  return (
    <aside className="sidebar w-[var(--sw)] bg-[var(--navy)] min-h-screen fixed left-0 top-0 flex flex-col z-[100] overflow-y-auto">
      <div className="sb-logo p-[22px_20px_18px] border-b border-white/5 flex items-center gap-2.5">
        <svg width="30" height="30" viewBox="0 0 64 64" fill="none">
          <path d="M8 44 Q32 14 56 44" stroke="#F9B942" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
          <line x1="20" y1="30" x2="20" y2="44" stroke="rgba(255,255,255,0.65)" strokeWidth="3" strokeLinecap="round"/>
          <line x1="32" y1="22" x2="32" y2="44" stroke="rgba(255,255,255,0.65)" strokeWidth="3" strokeLinecap="round"/>
          <line x1="44" y1="30" x2="44" y2="44" stroke="rgba(255,255,255,0.65)" strokeWidth="3" strokeLinecap="round"/>
          <line x1="6" y1="44" x2="58" y2="44" stroke="white" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="32" cy="10" r="4" fill="#F4840A"/>
        </svg>
        <div>
          <div className="font-serif text-[20px] font-black text-white tracking-tighter">
            Prime<span className="text-[var(--gold)]">Setu</span>
          </div>
          <div className="text-[9px] tracking-[2px] uppercase text-white/30 -mt-1 font-semibold">
            Retail Enterprise
          </div>
        </div>
      </div>

      <div className="flex-1 py-4">
        {/* Render "Overview" first */}
        <div className="mb-6">
          <div className="text-[9px] font-bold tracking-[3px] uppercase text-white/25 px-5 mb-2">Overview</div>
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

        {categories.map(cat => {
          const modulesInCat = modules.filter(m => 
            m.id !== 'dashboard' && 
            m.category === cat.id
          );
          
          if (modulesInCat.length === 0) return null;

          return (
            <div key={cat.id} className="mb-6">
              <div className="text-[9px] font-bold tracking-[3px] uppercase text-white/25 px-5 mb-2">
                {cat.label}
              </div>
              <nav className="flex flex-col">
                {modulesInCat.map(item => (
                  <SidebarItem 
                    key={item.id} 
                    item={item} 
                    isActive={activeTab === item.id} 
                    onSelect={setActiveTab} 
                  />
                ))}
              </nav>
            </div>
          );
        })}
      </div>

      <div className="sb-bottom mt-auto border-t border-white/5 p-[14px_20px] flex items-center gap-2.5 cursor-pointer hover:bg-white/5 transition-all">
        <div className="w-8 h-8 bg-gradient-to-br from-[var(--saffron)] to-[var(--gold)] rounded-full flex items-center justify-center text-[12px] font-bold text-white">
          {userRole?.[0] || 'U'}
        </div>
        <div>
          <div className="text-[12px] font-medium text-white leading-none">
            {nodeType} NODE
          </div>
          <div className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">
            {userRole} · Sovereign
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
