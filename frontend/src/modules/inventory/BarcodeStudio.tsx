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

import React, { useState, useRef } from 'react';
import { 
  ScanBarcode, 
  Search, 
  Printer, 
  Settings, 
  RefreshCw,
  Layout,
  Tag,
  Zap,
  MoreVertical,
  Layers,
  History,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHotkeys } from 'react-hotkeys-hook';

import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/currency';
import { usePermission } from '../../hooks/usePermission';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { validateEAN13, calculateEAN13CheckDigit } from '../../utils/barcode';

const BarcodeStudio: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [labelQty, setLabelQty] = useState(1);
  const [activeView, setActiveView] = useState<'STUDIO' | 'QUEUE' | 'AUDIT'>('STUDIO');
  const { hasPermission } = usePermission();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. Permission Guard
  if (!hasPermission('catalog.view')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert size={48} className="text-rose-500 mb-4" />
        <h2 className="text-xl font-black text-navy uppercase">Access Denied</h2>
        <p className="text-xs text-navy/40 uppercase tracking-widest mt-2">Insufficient permissions to access Barcode Studio</p>
      </div>
    );
  }

  // 2. Fetch Items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items-barcode', searchTerm],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/items/?search=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('primesetu_token')}` }
      });
      return res.json();
    },
    enabled: searchTerm.length > 1
  });

  // 3. Barcode Scanner Hook
  useBarcodeScanner((barcode) => {
    setSearchTerm(barcode);
    // Auto-select if exact match found
  });

  // 4. Hotkeys
  useHotkeys('f3', (e) => { e.preventDefault(); searchInputRef.current?.focus(); }, { enableOnFormTags: true });
  useHotkeys('f4', (e) => { e.preventDefault(); /* Trigger generate */ }, { enableOnFormTags: true });
  useHotkeys('f6', (e) => { e.preventDefault(); setActiveView('QUEUE'); }, { enableOnFormTags: true });

  const generateInternal = useMutation({
    mutationFn: async (itemId: string) => {
       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/barcodes/generate-internal`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('primesetu_token')}` 
          },
          body: JSON.stringify({ item_id: itemId, is_primary: true })
       });
       return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items-barcode'] })
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Breadcrumb Pattern */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/20 mb-4">
         <span>Home</span> <ChevronRight size={10} />
         <span>Operational</span> <ChevronRight size={10} />
         <span className="text-navy/60">Barcode Studio</span>
      </nav>

      {/* Header Section */}
      <div className="flex items-center justify-between bg-white/50 p-8 rounded-[40px] border border-navy/5 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-brand-navy rounded-[24px] flex items-center justify-center text-brand-gold shadow-2xl shadow-navy/20">
            <ScanBarcode size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tight leading-none">Barcode Studio</h1>
            <p className="text-[10px] font-mono text-navy/40 uppercase tracking-[0.2em] mt-3">Identity Management · thermal Label Intelligence</p>
          </div>
        </div>

        <div className="flex items-center bg-navy/5 p-1.5 rounded-2xl border border-navy/5">
           {[
             { id: 'STUDIO', label: 'Studio', icon: Layout },
             { id: 'QUEUE', label: 'Print Queue', icon: History },
             { id: 'AUDIT', label: 'Bulk Audit', icon: Layers }
           ].map(view => (
             <button 
               key={view.id}
               onClick={() => setActiveView(view.id as any)}
               className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === view.id ? 'bg-navy text-white shadow-2xl' : 'text-navy/40 hover:text-navy'}`}
             >
               <view.icon size={16} /> {view.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Left Panel: Explorer */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[40px] p-10 border border-navy/5 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
              
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[10px] font-black text-navy uppercase tracking-[0.3em]">Catalogue Lookup</h3>
                 <span className="text-[9px] font-black text-brand-gold/60 uppercase font-mono">[F3]</span>
              </div>

              <div className="relative mb-8">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20" size={18} />
                 <input 
                   ref={searchInputRef}
                   type="text" 
                   placeholder="SCAN OR TYPE SKU..."
                   className="w-full bg-navy/5 border-2 border-transparent focus:border-brand-gold/20 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-black text-navy outline-none transition-all placeholder:text-navy/20 uppercase tracking-widest"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>

              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                 {items.map((item: any) => (
                    <button 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`w-full flex items-center justify-between p-6 rounded-3xl transition-all border-2
                        ${selectedItem?.id === item.id 
                          ? 'bg-brand-gold/5 border-brand-gold shadow-lg shadow-brand-gold/10' 
                          : 'bg-white border-transparent hover:border-navy/5'}`}
                    >
                       <div className="text-left">
                          <div className="text-xs font-black text-navy uppercase">{item.item_name}</div>
                          <div className="text-[9px] font-mono text-navy/30 uppercase mt-1">{item.item_code}</div>
                       </div>
                       <ArrowRight size={16} className={selectedItem?.id === item.id ? 'text-brand-gold' : 'text-navy/10'} />
                    </button>
                 ))}
                 {items.length === 0 && searchTerm.length > 1 && !isLoading && (
                    <div className="py-10 text-center text-[10px] font-black text-navy/20 uppercase tracking-widest">No matching items</div>
                 )}
              </div>
           </div>
        </div>

        {/* Right Panel: Studio Canvas */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           {activeView === 'STUDIO' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Preview Canvas */}
                <div className="col-span-1 bg-brand-navy rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col items-center">
                   <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><ScanBarcode size={240} /></div>
                   
                   <div className="w-full flex justify-between items-start mb-12 relative z-10">
                      <h3 className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.4em]">80mm Label Mode</h3>
                      <button className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-white/40"><RefreshCw size={18} /></button>
                   </div>

                   {/* The Label */}
                   <div className="w-[320px] aspect-[1.5/1] bg-white border-2 border-dashed border-white/30 rounded-lg p-6 flex flex-col justify-between shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                      <div className="flex justify-between items-start">
                         <div className="text-[12px] font-serif font-black text-navy uppercase leading-none">PrimeSetu</div>
                         <div className="text-[7px] font-mono text-navy/40 font-black uppercase">{selectedItem?.brand || 'CW-STORE'}</div>
                      </div>

                      <div className="py-2 border-y border-navy/5 text-center">
                         <div className="text-[12px] font-black text-navy uppercase truncate">
                            {selectedItem?.item_name || 'SELECT AN ITEM'}
                         </div>
                      </div>

                      <div className="flex justify-between items-end">
                         <div>
                            <div className="text-[14px] font-black text-navy font-mono">{formatCurrency(selectedItem?.mrp_paise || 0)}</div>
                            <div className="text-[6px] font-black text-navy/40 uppercase">Inc. GST</div>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                            <span className="text-[8px] font-mono font-black text-navy">{selectedItem?.item_code || 'IT-CODE'}</span>
                            <div className="w-24 h-4 bg-navy/5 flex items-center justify-center gap-[0.5px]">
                               {Array(40).fill(0).map((_, i) => <div key={i} className="bg-navy h-full" style={{ width: `${[1,2,1][i%3]}px`, opacity: i%6===0 ? 0 : 1 }} />)}
                            </div>
                         </div>
                      </div>
                   </div>

                   <button className="w-full py-5 bg-white text-navy rounded-3xl font-black text-[11px] uppercase tracking-widest mt-12 hover:bg-brand-gold transition-all shadow-2xl relative z-10">
                      Print Single Label
                   </button>
                </div>

                {/* Generator Controls */}
                <div className="col-span-1 space-y-8">
                   <div className="bg-white rounded-[40px] p-10 border border-navy/5 shadow-xl">
                      <h3 className="text-[10px] font-black text-navy/40 uppercase tracking-[0.3em] mb-8">Encoding Protocols</h3>
                      
                      <div className="space-y-6">
                         <button 
                           onClick={() => generateInternal.mutate(selectedItem.id)}
                           disabled={!selectedItem || generateInternal.isPending}
                           className="w-full p-6 bg-navy/5 rounded-3xl border-2 border-transparent hover:border-navy/10 transition-all flex items-center justify-between group disabled:opacity-20"
                         >
                            <div className="text-left">
                               <div className="text-xs font-black text-navy uppercase">Generate Internal</div>
                               <div className="text-[8px] font-black text-navy/30 uppercase mt-1 tracking-widest">CODE128 · Sovereign Format</div>
                            </div>
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-navy shadow-sm group-hover:bg-navy group-hover:text-white transition-all">
                               <Zap size={18} />
                            </div>
                         </button>

                         <button 
                           className="w-full p-6 bg-navy/5 rounded-3xl border-2 border-transparent hover:border-emerald-500/10 transition-all flex items-center justify-between group opacity-40 cursor-not-allowed"
                         >
                            <div className="text-left">
                               <div className="text-xs font-black text-navy uppercase">Register EAN-13</div>
                               <div className="text-[8px] font-black text-navy/30 uppercase mt-1 tracking-widest">GS1 Standard · Phase 7</div>
                            </div>
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-navy shadow-sm">
                               <Tag size={18} />
                            </div>
                         </button>
                      </div>
                   </div>

                   <div className="bg-brand-gold rounded-[40px] p-10 text-navy shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-20"><Printer size={100} /></div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 relative z-10">Batch Operations</h3>
                      <div className="flex items-center gap-4 relative z-10">
                         <input 
                           type="number" 
                           value={labelQty}
                           onChange={(e) => setLabelQty(parseInt(e.target.value) || 1)}
                           className="w-20 bg-navy/5 border-2 border-navy/10 rounded-2xl py-4 px-4 text-center font-black outline-none focus:border-navy"
                         />
                         <button className="flex-1 py-4 bg-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                            Add to Print Queue
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeView === 'QUEUE' && (
             <div className="bg-white rounded-[40px] p-12 border border-navy/5 shadow-2xl animate-in slide-in-from-right-10 duration-500">
                <div className="flex items-center justify-between mb-10 pb-10 border-b border-navy/5">
                   <div>
                      <h2 className="text-3xl font-serif font-black text-navy uppercase tracking-tight">Print Queue</h2>
                      <p className="text-[9px] font-black text-navy/40 uppercase tracking-widest mt-2">Active Jobs Pending Transmission</p>
                   </div>
                   <button className="bg-navy text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                      Dispatch All Jobs
                   </button>
                </div>
                <div className="py-20 text-center text-navy/10 font-black uppercase tracking-[0.4em]">Queue is currently empty</div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeStudio;
