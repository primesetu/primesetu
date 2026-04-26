/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, FileText, ShoppingBag, Receipt, ScanBarcode, 
  Settings2, ChevronRight, Plus, Trash2, CheckCircle2,
  Layout, Layers, PenTool, Globe, Save, Monitor,
  Search, Filter, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PrintTemplate {
  id: string;
  name: string;
  module: 'BILLING' | 'INVENTORY' | 'PROCUREMENT' | 'ACCOUNTS';
  type: 'ZPL' | 'TSPL' | 'HTML' | 'SHEET';
  isDefault: boolean;
  lastModified: string;
}

const INITIAL_TEMPLATES: PrintTemplate[] = [
  { id: 't1', name: 'Standard 3-Inch Bill', module: 'BILLING', type: 'HTML', isDefault: true, lastModified: '2026-04-25' },
  { id: 't2', name: 'Zebra 2x1 Barcode', module: 'INVENTORY', type: 'ZPL', isDefault: true, lastModified: '2026-04-24' },
  { id: 't3', name: 'Purchase Order Letterhead', module: 'PROCUREMENT', type: 'HTML', isDefault: true, lastModified: '2026-04-20' },
  { id: 't4', name: 'A4 Multi-Sticker Sheet', module: 'INVENTORY', type: 'SHEET', isDefault: false, lastModified: '2026-04-25' },
];

export default function PrintTemplateCenter() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('ALL');
  const [templates, setTemplates] = useState<PrintTemplate[]>(INITIAL_TEMPLATES);
  const [search, setSearch] = useState('');

  const filtered = templates.filter(t => 
    (filter === 'ALL' || t.module === filter) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const setDefault = (id: string, module: string) => {
    setTemplates(templates.map(t => 
      t.module === module ? { ...t, isDefault: t.id === id } : t
    ));
  };

  const handleEdit = (template: PrintTemplate) => {
    if (template.module === 'INVENTORY') {
      navigate('/inventory/barcode');
    } else {
      alert(`Opening ${template.type} Designer for ${template.name}...`);
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-navy text-amber-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-md">Template Central</div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <h1 className="text-5xl font-serif font-black text-navy uppercase tracking-tight">Print Mapping</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-3 flex items-center gap-2 italic">
            <Globe className="w-3.5 h-3.5 text-emerald-500" /> Module-Based Printing Configuration
          </p>
        </div>

        <div className="flex bg-white shadow-2xl rounded-2xl p-2 border border-gray-100">
          <div className="relative mr-4">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Find template..."
                className="bg-gray-50 border-none pl-10 pr-4 py-3 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-2 ring-amber-400/20" />
          </div>
          <button className="bg-navy text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 hover:text-navy transition-all flex items-center gap-2">
             <Plus className="w-4 h-4" /> Create New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-4">
           <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Filter by Module</div>
           {[
             { id: 'ALL', label: 'All Templates', icon: Layout },
             { id: 'BILLING', label: 'Billing & POS', icon: Receipt },
             { id: 'INVENTORY', label: 'Inventory & Barcode', icon: ScanBarcode },
             { id: 'PROCUREMENT', label: 'Order & GRN', icon: ShoppingBag },
             { id: 'ACCOUNTS', label: 'Financial Reports', icon: FileText },
           ].map(item => (
             <button key={item.id} onClick={() => setFilter(item.id)}
                className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all border ${filter === item.id ? 'bg-navy border-navy text-white shadow-2xl scale-105' : 'bg-white border-transparent text-gray-400 hover:bg-cream/50 hover:text-navy'}`}>
                <div className="flex items-center gap-4">
                   <item.icon className={`w-5 h-5 ${filter === item.id ? 'text-amber-400' : 'text-gray-300'}`} />
                   <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                {filter === item.id && <ChevronRight className="w-4 h-4" />}
             </button>
           ))}
        </div>

        {/* Template Grid */}
        <div className="lg:col-span-3">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {filtered.map((tpl) => (
                  <motion.div layout key={tpl.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className={`glass rounded-[3rem] p-10 border transition-all relative overflow-hidden group ${tpl.isDefault ? 'border-amber-400/30 bg-amber-50/5' : 'border-white/40 hover:border-navy/10 hover:bg-white'}`}>
                    
                    {tpl.isDefault && (
                      <div className="absolute top-0 right-0 p-8">
                         <div className="px-3 py-1 bg-amber-400 text-navy text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">System Default</div>
                      </div>
                    )}

                    <div className="flex items-center gap-6 mb-8">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${tpl.type === 'ZPL' ? 'bg-indigo-600 text-white' : 'bg-navy text-white'}`}>
                          {tpl.module === 'BILLING' ? <Receipt /> : tpl.module === 'INVENTORY' ? <ScanBarcode /> : <FileText />}
                       </div>
                       <div>
                          <h3 className="text-xl font-serif font-black text-navy uppercase">{tpl.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[9px] font-black text-muted uppercase tracking-widest">{tpl.type} Mode</span>
                             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                             <span className="text-[9px] font-black text-emerald-600 uppercase">Ver 1.4 Active</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                       <div className="flex gap-3">
                          <button onClick={() => handleEdit(tpl)} className="px-6 py-2.5 bg-navy text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-400 hover:text-navy transition-all shadow-md flex items-center gap-2">
                             <PenTool className="w-3.5 h-3.5" /> Design
                          </button>
                          <button onClick={() => alert(`Triggering Test Print for ${tpl.name}...`)} className="px-6 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2">
                             <Printer className="w-3.5 h-3.5" /> Test
                          </button>
                          {!tpl.isDefault && (
                            <button onClick={() => setDefault(tpl.id, tpl.module)} className="px-6 py-2.5 bg-white border border-gray-200 text-navy rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-navy transition-all">
                               Set Default
                            </button>
                          )}
                       </div>
                       <button className="p-3 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-navy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>

           {filtered.length === 0 && (
             <div className="text-center py-40">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                   <Monitor size={40} />
                </div>
                <h3 className="text-lg font-serif font-black text-navy uppercase tracking-widest">No Templates Found</h3>
                <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Try adjusting your filter or create a new design</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
