/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R. M.
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
  DollarSign
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

import ItemMaster from '../inventory/ItemMaster';
import CustomerMaster from '../crm/CustomerMaster';
import StyleMatrix from './StyleMatrix';
import PriceGroups from './PriceGroups';
import VendorMaster from './VendorMaster';
import PriceRevisionCockpit from './PriceRevisionCockpit';
import { useMenu } from '../../hooks/useMenu';
import { usePermission } from '../../hooks/usePermission';
import { ICON_MAP } from '../../lib/ModuleRegistry';

type RegistryTab = 'items' | 'matrix' | 'customers' | 'vendors' | 'pricing' | 'lookup' | 'pricegroups' | 'revisions';

const CatalogRegistry: React.FC = () => {
  const { menu, findModule } = useMenu();
  const { hasPermission } = usePermission();
  const [activeTab, setActiveTab] = useState<RegistryTab>('items');

  // Resolve dynamic tabs from DB menu
  const tabs = useMemo(() => {
    const registryModule = findModule('registry');
    if (!registryModule || !registryModule.children) {
      return [
        { id: 'items', label: 'Item Master', icon: Package, component: ItemMaster },
        { id: 'matrix', label: 'Style Matrix', icon: LayoutGrid, component: () => <StyleMatrix styleCode="PUMA-RSX" onBack={() => setActiveTab('items')} /> },
        { id: 'revisions', label: 'Price Revisions', icon: DollarSign, component: PriceRevisionCockpit },
        { id: 'customers', label: 'Customer Master', icon: Users, component: CustomerMaster },
        { id: 'vendors', label: 'Vendor Registry', icon: Users, component: VendorMaster },
        { id: 'pricegroups', label: 'Price Groups', icon: Tags, component: PriceGroups },
      ];
    }

    const componentMap: Record<string, React.FC> = {
      'items': ItemMaster,
      'matrix': () => <StyleMatrix styleCode="PUMA-RSX" onBack={() => setActiveTab('items')} />,
      'revisions': PriceRevisionCockpit,
      'customers': CustomerMaster,
      'vendors': VendorMaster,
      'pricegroups': PriceGroups,
      'pricing': PriceGroups
    };

    return registryModule.children.map(child => ({
      id: child.id as RegistryTab,
      label: child.label,
      icon: ICON_MAP[child.id] || Package,
      component: componentMap[child.id] || (() => <div className="p-10 text-center text-navy/20 font-black uppercase tracking-widest">Module Mapping Incomplete</div>)
    }));
  }, [menu]);

  // Omnisearch Hotkey
  useHotkeys('ctrl+k', (e) => {
    e.preventDefault();
    // Focus logic would go here
  });

  // Permission Guard
  if (!hasPermission('catalog.view')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert size={48} className="text-rose-500 mb-4" />
        <h2 className="text-xl font-black text-navy uppercase tracking-tighter">Access Denied</h2>
        <p className="text-xs text-navy/40 uppercase tracking-widest mt-2">Insufficient permissions to view Master Registry</p>
      </div>
    );
  }

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || ItemMaster;

  return (
    <div className="flex h-full gap-10 animate-in fade-in duration-700">
      {/* Sidebar Navigation */}
      <div className="w-80 flex flex-col gap-3">
        <div className="bg-brand-navy p-8 rounded-[40px] mb-6 shadow-2xl shadow-navy/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl group-hover:bg-brand-gold/20 transition-all"></div>
          <div className="flex items-center gap-4 text-white relative z-10">
            <div className="w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center">
              <Database size={22} className="text-brand-gold" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-black uppercase tracking-tight leading-none">Registry</h2>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] mt-2">Master Data Hub</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as RegistryTab)}
                className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all group relative overflow-hidden ${
                  isActive 
                    ? 'bg-brand-gold text-navy shadow-2xl shadow-brand-gold/30 scale-[1.02]' 
                    : 'bg-white text-navy/40 hover:bg-brand-cream hover:text-navy border border-navy/5'
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`p-2.5 rounded-xl transition-all ${isActive ? 'bg-navy/10' : 'bg-navy/5 group-hover:bg-white'}`}>
                    <Icon size={20} className={isActive ? 'text-navy' : 'group-hover:text-brand-gold'} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                </div>
                <ChevronRight size={18} className={`transition-all ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
              </button>
            );
          })}
        </div>

        <div className="mt-auto bg-white p-8 rounded-[40px] border border-navy/5 shadow-xl">
          <div className="flex items-center gap-3 text-[10px] font-black text-navy uppercase tracking-[0.3em] mb-6 border-b border-navy/5 pb-4">
            <LayoutGrid size={16} className="text-brand-gold" /> Hotkeys Registry
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-mono text-navy/60">
              <span className="uppercase tracking-widest">Global Search</span>
              <span className="bg-navy/5 px-3 py-1 rounded-lg border border-navy/10 font-black text-navy">CTRL+K</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-navy/60">
              <span className="uppercase tracking-widest">Add Record</span>
              <span className="bg-navy/5 px-3 py-1 rounded-lg border border-navy/10 font-black text-navy">F4</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-navy/60">
              <span className="uppercase tracking-widest">Quick Focus</span>
              <span className="bg-navy/5 px-3 py-1 rounded-lg border border-navy/10 font-black text-navy">F3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-4 scroll-smooth">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default CatalogRegistry;
