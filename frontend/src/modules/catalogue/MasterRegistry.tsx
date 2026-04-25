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

import React, { useState, useEffect } from 'react';
import { 
  Search, Package, Users, Truck, UserSquare2, Layers, Zap,
  ArrowRight, Filter, MoreVertical, Plus, BarChart3, 
  ShieldCheck, Smartphone, Mail, MapPin, CreditCard,
  Percent, Briefcase, Calendar, Info, Settings2, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';

type RegistryType = 'ITEMS' | 'CUSTOMERS' | 'VENDORS' | 'TAXES' | 'CLASSIFICATION';

interface RegistryEntity {
  id: string;
  name: string;
  code?: string;
  mobile?: string;
  category?: string;
  // Item specific
  stock?: number;
  price?: number;
  hsn?: string;
  size_group?: string;
  // Customer specific
  loyalty_tier?: string;
  points?: number;
  tax_type?: 'LOCAL' | 'CENTRAL';
  dob?: string;
  class_1?: string; // e.g. Religion
  class_2?: string; // e.g. Age Group
  // Vendor specific
  tax_behavior?: 'INCLUSIVE' | 'EXCLUSIVE';
  partial_supply?: boolean;
  terms?: string;
}

const MasterRegistry: React.FC = () => {
  const [activeRegistry, setActiveRegistry] = useState<RegistryType>('ITEMS');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<RegistryEntity | null>(null);

  const registries = [
    { id: 'ITEMS', icon: Package, label: 'Items & Matrix', count: 1240 },
    { id: 'CUSTOMERS', icon: Users, label: 'Customer CRM', count: 8420 },
    { id: 'VENDORS', icon: Truck, label: 'Vendor Network', count: 124 },
    { id: 'TAXES', icon: Percent, label: 'Tax Catalogue', count: 8 },
    { id: 'CLASSIFICATION', icon: Layers, label: 'Master DNA', count: 32 },
  ];

  const [registryData, setRegistryData] = useState<Record<RegistryType, RegistryEntity[]>>({
    ITEMS: [], CUSTOMERS: [], VENDORS: [], TAXES: [], CLASSIFICATION: []
  });

  useEffect(() => {
    fetchRegistryData();
  }, [activeRegistry]);

  const fetchRegistryData = async () => {
    setLoading(true);
    try {
      // Sovereign Fetch: Try Network first
      let data: any[] = [];
      if (activeRegistry === 'ITEMS') data = await api.inventory.list();
      else if (activeRegistry === 'CUSTOMERS') data = await api.customers.list();
      else if (activeRegistry === 'VENDORS') data = await api.vendors.list();
      
      if (data.length > 0) {
        setRegistryData(prev => ({ ...prev, [activeRegistry]: data }));
        // Sync to idb for offline fallback
        await offlineService.syncCatalogue(activeRegistry, data);
      }
    } catch (error) {
      console.warn(`[PrimeSetu] Backend unreachable for ${activeRegistry}. Falling back to idb.`);
      const localData = await offlineService.getCatalogue(activeRegistry);
      setRegistryData(prev => ({ ...prev, [activeRegistry]: localData }));
    } finally {
      setLoading(false);
    }
  };

  // ── Shoper 9 Analysis Driven Mock Data (Fallback if both fail) ─────────────
  const displayData = registryData;

  const filteredData = displayData[activeRegistry].filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.code?.toLowerCase().includes(search.toLowerCase()) ||
    item.mobile?.includes(search)
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      
      {/* Sovereign Command Header */}
      <div className="glass p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 blur-[120px] rounded-full"></div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="px-3 py-1 bg-navy text-gold text-[9px] font-black uppercase tracking-widest rounded-md">Master Catalogue</div>
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tight">Sovereign Registry</h1>
            <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2 flex items-center gap-2 italic">
               <Globe className="w-3.5 h-3.5 text-emerald-500" /> Deep Analysis Mapping: Shoper 9 Protocol
            </p>
          </div>
          
          <div className="flex-1 max-w-2xl w-full relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-hover:text-gold transition-colors" />
            <input type="text" placeholder={`Deep search in ${activeRegistry.toLowerCase()} registry...`}
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/50 border border-gray-100 rounded-[2rem] pl-16 pr-6 py-6 text-sm font-bold focus:border-gold focus:bg-white outline-none transition-all shadow-inner" />
          </div>

          <button className="bg-navy text-white px-10 py-6 rounded-3xl font-black text-xs tracking-[0.2em] hover:bg-gold hover:text-navy transition-all shadow-2xl flex items-center gap-4 group">
            <Plus className="w-5 h-5 text-gold group-hover:text-navy" />
            CREATE MASTER
          </button>
        </div>
      </div>

      <div className="flex gap-10 h-[calc(100vh-320px)]">
        {/* Registry Selection Rail */}
        <aside className="w-80 flex flex-col gap-4">
          {registries.map((reg) => (
            <button key={reg.id} onClick={() => { setActiveRegistry(reg.id as RegistryType); setSelectedEntity(null); }}
              className={`p-6 rounded-[2.5rem] flex flex-col gap-4 transition-all duration-500 text-left border-2 ${
                activeRegistry === reg.id ? 'bg-navy border-navy text-white shadow-2xl scale-105' : 'bg-white border-transparent text-gray-400 hover:border-gray-100 hover:bg-cream/20'
              }`}>
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl ${activeRegistry === reg.id ? 'bg-gold/10 text-gold' : 'bg-gray-50 text-gray-400'}`}>
                   <reg.icon size={24} />
                </div>
                <div className={`text-[10px] font-black px-3 py-1 rounded-full ${activeRegistry === reg.id ? 'bg-white/10 text-gold' : 'bg-gray-100'}`}>{reg.count}</div>
              </div>
              <div>
                <h3 className="font-serif font-black text-xl tracking-tight">{reg.label}</h3>
                <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${activeRegistry === reg.id ? 'text-white/40' : 'text-muted'}`}>Shoper Protocol Registry</p>
              </div>
            </button>
          ))}
        </aside>

        {/* Dynamic Registry Table */}
        <main className="flex-1 glass rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden relative">
          <div className="bg-navy px-10 py-8 flex items-center justify-between border-b border-white/5">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gold">
                   {registries.find(r => r.id === activeRegistry)?.icon && React.createElement(registries.find(r => r.id === activeRegistry)!.icon, { size: 24 })}
                </div>
                <div>
                   <h2 className="text-white font-serif font-black text-2xl uppercase tracking-tight">{activeRegistry} Catalogue</h2>
                   <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Viewing Record Buffer</p>
                </div>
             </div>
             <div className="flex gap-4">
                <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 text-white/60 transition-all"><Filter size={20} /></button>
                <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 text-white/60 transition-all"><Settings2 size={20} /></button>
             </div>
          </div>

          <div className="flex-1 overflow-auto">
             <table className="w-full text-left">
                <thead className="sticky top-0 bg-white/95 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 z-10">
                   <tr>
                      <th className="pl-12 py-6">ID / Code</th>
                      <th className="px-6 py-6">Master Name</th>
                      <th className="px-6 py-6 text-right">Primary DNA</th>
                      <th className="px-6 py-6 text-center">Protocol Status</th>
                      <th className="pr-12 py-6"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {filteredData.map(item => (
                     <tr key={item.id} onClick={() => setSelectedEntity(item)}
                       className={`group cursor-pointer transition-all ${selectedEntity?.id === item.id ? 'bg-gold/5' : 'hover:bg-cream/10'}`}>
                        <td className="pl-12 py-8">
                           <span className="font-mono text-[11px] font-black text-navy px-4 py-2 bg-gray-100 rounded-xl group-hover:bg-white transition-all">
                              {item.code || item.mobile}
                           </span>
                        </td>
                        <td className="px-6 py-8">
                           <div className="text-lg font-black text-navy group-hover:text-gold transition-colors">{item.name}</div>
                           <div className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">
                              {item.category || item.loyalty_tier || item.tax_behavior} Registry
                           </div>
                        </td>
                        <td className="px-6 py-8 text-right">
                           <div className="text-lg font-black text-navy">
                              {item.price ? `₹${item.price.toLocaleString()}` : item.points ? `${item.points} Pts` : item.terms}
                           </div>
                           <div className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">
                              {item.stock !== undefined ? `In-Stock: ${item.stock}` : item.tax_type || item.category || 'Standard Value'}
                           </div>
                        </td>
                        <td className="px-6 py-8 text-center">
                           <div className="flex items-center justify-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Verified</span>
                           </div>
                        </td>
                        <td className="pr-12 py-8 text-right">
                           <button className="p-3 text-gray-300 hover:text-navy transition-all"><MoreVertical size={20} /></button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </main>

        {/* Sovereign Relationship Matrix (Side Panel) */}
        <AnimatePresence>
          {selectedEntity && (
            <motion.aside initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
              className="w-[450px] glass rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden border-l border-white/20">
              
              <div className="bg-navy p-10 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-10"><Zap size={120} strokeWidth={0.5} /></div>
                 <button onClick={() => setSelectedEntity(null)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-white/40"><X size={20} /></button>
                 
                 <div className="p-4 bg-gold text-navy rounded-2xl w-14 h-14 flex items-center justify-center mb-6 shadow-2xl shadow-gold/20">
                    <Zap size={28} />
                 </div>
                 <h2 className="text-3xl font-serif font-black uppercase leading-tight">{selectedEntity.name}</h2>
                 <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mt-3">Sovereign Matrix Entry</p>
              </div>

              <div className="flex-1 overflow-auto p-10 space-y-10">
                 
                 {/* Identity DNA */}
                 <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] flex items-center gap-2">
                       <ShieldCheck size={14} /> Identity DNA
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { label: 'Code', value: selectedEntity.code || 'N/A', icon: Info },
                         { label: 'Category', value: selectedEntity.category || activeRegistry, icon: Layers },
                         { label: 'Mobile', value: selectedEntity.mobile || 'Private', icon: Smartphone },
                         { label: 'Tax Map', value: selectedEntity.tax_type || selectedEntity.tax_behavior || 'Local-Incl', icon: Percent },
                       ].map(dna => (
                         <div key={dna.label} className="bg-gray-50 p-5 rounded-3xl border border-gray-100 group hover:border-gold/30 transition-all">
                            <div className="flex items-center gap-3 mb-2">
                               <dna.icon size={12} className="text-muted" />
                               <span className="text-[9px] font-black text-muted uppercase tracking-widest">{dna.label}</span>
                            </div>
                            <div className="text-sm font-black text-navy truncate">{dna.value}</div>
                         </div>
                       ))}
                    </div>
                 </section>

                 {/* Shoper 9 Deep Mapping (Context Dependent) */}
                 <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Zap size={14} /> Shoper 9 Protocols
                    </h4>
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                       {activeRegistry === 'CUSTOMERS' && (
                         <>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                               <div className="flex items-center gap-3"><Calendar size={16} className="text-rose-500" /><span className="text-[11px] font-bold text-navy">Birthday / Anniv</span></div>
                               <span className="text-xs font-black text-rose-500 uppercase">{selectedEntity.dob || 'NOT SET'}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50 text-indigo-600">
                               <div className="flex items-center gap-3"><Users size={16} /><span className="text-[11px] font-bold">Class 1 (Religion)</span></div>
                               <span className="text-xs font-black uppercase">{selectedEntity.class_1 || 'General'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-3 text-indigo-600"><Users size={16} /><span className="text-[11px] font-bold">Class 2 (Age)</span></div>
                               <span className="text-xs font-black uppercase">{selectedEntity.class_2 || 'All'}</span>
                            </div>
                         </>
                       )}
                       {activeRegistry === 'VENDORS' && (
                         <>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                               <div className="flex items-center gap-3"><Percent size={16} className="text-amber-500" /><span className="text-[11px] font-bold text-navy">Tax Behavior</span></div>
                               <span className="text-xs font-black text-amber-500 uppercase">{selectedEntity.tax_behavior}</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-3 text-emerald-600"><Truck size={16} /><span className="text-[11px] font-bold">Partial Supply PO</span></div>
                               <span className="text-xs font-black uppercase">{selectedEntity.partial_supply ? 'ALLOWED' : 'RESTRICTED'}</span>
                            </div>
                         </>
                       )}
                       {activeRegistry === 'ITEMS' && (
                         <>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                               <div className="flex items-center gap-3"><Package size={16} className="text-indigo-500" /><span className="text-[11px] font-bold text-navy">HSN / SAC Code</span></div>
                               <span className="text-xs font-black text-indigo-500 uppercase">{selectedEntity.hsn}</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-3 text-indigo-600"><Layers size={16} /><span className="text-[11px] font-bold">Size Mapping Group</span></div>
                               <span className="text-xs font-black uppercase">{selectedEntity.size_group}</span>
                            </div>
                         </>
                       )}
                    </div>
                 </section>

                 {/* Action Intelligence */}
                 <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                    <button className="flex flex-col items-center justify-center gap-2 p-6 bg-gray-50 rounded-3xl hover:bg-gold hover:text-navy transition-all group">
                       <History className="w-6 h-6 text-muted group-hover:text-navy" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Transaction History</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-6 bg-navy text-white rounded-3xl hover:shadow-2xl hover:scale-105 transition-all">
                       <Settings2 className="w-6 h-6 text-gold" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Modify Master</span>
                    </button>
                 </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MasterRegistry;
