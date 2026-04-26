/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Package, 
  Users, 
  ChevronRight,
  Command,
  Tags,
  ShieldAlert,
  Search,
  LayoutGrid,
  DollarSign,
  Briefcase,
  History,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-Modules
import ItemMaster from './ItemMaster';
import CustomerMaster from './CustomerMaster';
import VendorMaster from './VendorMaster';
import PriceGroups from './PriceGroups';
import StyleMatrix from './StyleMatrix';
import PriceRevisionCockpit from './PriceRevisionCockpit';
import PersonnelMaster from './PersonnelMaster';

type TabId = 'items' | 'matrix' | 'revisions' | 'customers' | 'vendors' | 'pricing' | 'personnel';

interface RegistryTab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const REGISTRY_TABS: RegistryTab[] = [
  { id: 'items', label: 'Item Master', icon: Package, color: 'brand-gold', description: 'Core product SKU management & DNA definition.' },
  { id: 'matrix', label: 'Style Matrix', icon: LayoutGrid, color: 'indigo-500', description: 'High-fidelity Size/Color grid management.' },
  { id: 'revisions', label: 'Price Cockpit', icon: Sparkles, color: 'emerald-500', description: 'Bulk markups, markdowns & surge pricing.' },
  { id: 'customers', label: 'Customers', icon: Users, color: 'blue-500', description: 'Institutional CRM & Loyalty tracking.' },
  { id: 'vendors', label: 'Vendors', icon: Briefcase, color: 'rose-500', description: 'Supply chain partners & procurement logic.' },
  { id: 'pricing', label: 'Price Groups', icon: DollarSign, color: 'saffron', description: 'Customer-specific price levels & hierarchies.' },
  { id: 'personnel', label: 'Personnel', icon: ShieldAlert, color: 'navy', description: 'Access control & store associate registry.' },
];

export default function CatalogRegistry() {
  const [activeTab, setActiveTab] = useState<TabId>('items');
  const [viewStyle, setViewStyle] = useState<string | null>(null);

  const renderContent = () => {
    if (viewStyle) {
      return <StyleMatrix styleCode={viewStyle} onBack={() => setViewStyle(null)} />;
    }

    switch (activeTab) {
      case 'items': return <ItemMaster onOpenMatrix={setViewStyle} />;
      case 'matrix': return <StyleMatrix styleCode="SELECT_STYLE" onBack={() => setActiveTab('items')} />;
      case 'revisions': return <PriceRevisionCockpit />;
      case 'customers': return <CustomerMaster />;
      case 'vendors': return <VendorMaster />;
      case 'pricing': return <PriceGroups />;
      case 'personnel': return <PersonnelMaster />;
      default: return <ItemMaster onOpenMatrix={setViewStyle} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] overflow-hidden">
      {/* ── UNIFIED HUB HEADER ── */}
      {!viewStyle && (
        <div className="px-12 pt-12 pb-8 bg-white border-b border-navy/5 shrink-0">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-brand-navy text-brand-gold text-[9px] font-black uppercase tracking-[0.2em] rounded-md">Master Registry</div>
                <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse"></div>
              </div>
              <h1 className="text-5xl font-black text-navy tracking-tighter" style={{ fontFamily: 'var(--font-tesla)' }}>Catalogue Hub</h1>
            </div>
            
            <div className="flex gap-4">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-navy/20 uppercase tracking-widest">Active Store</span>
                  <span className="text-sm font-black text-navy">PRIME-X01 / MUMBAI</span>
               </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {REGISTRY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-start p-6 min-w-[180px] rounded-[2rem] transition-all duration-500 relative overflow-hidden group border-2 ${
                    isActive 
                      ? 'bg-navy border-navy shadow-2xl scale-105 z-10' 
                      : 'bg-white border-navy/5 hover:border-brand-gold/30 grayscale hover:grayscale-0'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 ${
                    isActive ? 'bg-brand-gold text-navy' : 'bg-navy/5 text-navy/40'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-navy/40'}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── HUB CONTENT AREA ── */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (viewStyle || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── COMMAND BAR (F2) ── */}
      <div className="h-10 bg-navy shrink-0 flex items-center px-12 justify-between border-t border-white/5">
         <div className="flex gap-8 items-center h-full">
            <div className="flex gap-2 items-center text-[9px] font-black text-white/40 uppercase tracking-widest">
               <span className="text-brand-gold">F2</span> Universal Search
            </div>
            <div className="flex gap-2 items-center text-[9px] font-black text-white/40 uppercase tracking-widest">
               <span className="text-brand-gold">Alt+N</span> New Entry
            </div>
            <div className="flex gap-2 items-center text-[9px] font-black text-white/40 uppercase tracking-widest">
               <span className="text-brand-gold">Ctrl+E</span> Export Fleet
            </div>
         </div>
         <div className="flex items-center gap-4 text-[9px] font-black text-white/20 italic tracking-widest uppercase">
            Institutional Registry Engine V4.2
         </div>
      </div>
    </div>
  );
}
