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
  Plus,
  X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHotkeys } from 'react-hotkeys-hook';

import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/currency';
import { usePermission } from '../../hooks/usePermission';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { validateEAN13, calculateEAN13CheckDigit } from '../../utils/barcode';

interface BarcodeStudioProps {
  onClose?: () => void;
  initialItems?: any[];
}

import { useLocation } from 'react-router-dom';

const BarcodeStudio: React.FC<BarcodeStudioProps> = ({ onClose, initialItems = [] }) => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [labelQty, setLabelQty] = useState(1);
  const [activeView, setActiveView] = useState<'STUDIO' | 'QUEUE' | 'AUDIT'>(location.state?.items ? 'QUEUE' : 'STUDIO');
  const [printQueue, setPrintQueue] = useState<any[]>(location.state?.items || []);
  const [labelProfile, setLabelProfile] = useState({
    id: 'STANDARD',
    name: '38x25mm Single',
    width: 38,
    height: 25,
    across: 1,
    gap: 3
  });
  const [customTemplate, setCustomTemplate] = useState<string>('');
  const [useCustomTemplate, setUseCustomTemplate] = useState(false);
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
          body: JSON.stringify({ item_id: itemId, is_primary: true, barcode_type: 'CODE128' })
       });
       return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items-barcode'] })
  });

  const generateEan13 = useMutation({
    mutationFn: async (itemId: string) => {
       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/barcodes/generate-ean13`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('primesetu_token')}` 
          },
          body: JSON.stringify({ item_id: itemId, is_primary: true, barcode_type: 'EAN13' })
       });
       return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items-barcode'] })
  });

  const printLabel = useMutation({
    mutationFn: async ({ barcode, copies }: { barcode: string, copies: number }) => {
       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/barcodes/print`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('primesetu_token')}` 
          },
          body: JSON.stringify({ 
            barcode, 
            copies,
            label_profile: labelProfile,
            custom_template: useCustomTemplate ? customTemplate : null
          })
       });
       return res.json();
    }
  });

  const bulkImport = useMutation({
    mutationFn: async (data: any[]) => {
       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/barcodes/bulk-import`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('primesetu_token')}` 
          },
          body: JSON.stringify(data)
       });
       return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items-barcode'] });
      setActiveView('STUDIO');
    }
  });

  // 4. Hotkeys
  useHotkeys('f3', (e) => { e.preventDefault(); searchInputRef.current?.focus(); }, { enableOnFormTags: true });
  useHotkeys('f4', (e) => { 
    e.preventDefault(); 
    if (selectedItem) generateInternal.mutate(selectedItem.id); 
  }, { enableOnFormTags: true });
  useHotkeys('f6', (e) => { e.preventDefault(); setActiveView('QUEUE'); }, { enableOnFormTags: true });
  useHotkeys('ctrl+p', (e) => {
    e.preventDefault();
    if (printQueue.length > 0) handleDispatchQueue();
  }, { enableOnFormTags: true });

  const handleAddToQueue = () => {
    if (!selectedItem) return;
    const existing = printQueue.find(q => q.id === selectedItem.id);
    if (existing) {
      setPrintQueue(printQueue.map(q => q.id === selectedItem.id ? { ...q, qty: (q.qty || 1) + labelQty } : q));
    } else {
      setPrintQueue([...printQueue, { ...selectedItem, qty: labelQty }]);
    }
    setLabelQty(1);
  };

  const handleDispatchQueue = async () => {
    for (const job of printQueue) {
      await printLabel.mutateAsync({ 
        barcode: job.barcode || job.item_code, 
        copies: job.qty || 1 
      });
    }
    setPrintQueue([]);
    alert("Queue dispatched to label printer.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((h, i) => obj[h] = values[i]);
        return obj;
      });

      bulkImport.mutate(data);
    };
    reader.readAsText(file);
  };

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
                 {Array.isArray(items) && items.map((item: any) => (
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
                 {(!Array.isArray(items) || (items.length === 0 && searchTerm.length > 1)) && !isLoading && (
                    <div className="py-10 text-center text-[10px] font-black text-navy/20 uppercase tracking-widest">
                       {Array.isArray(items) ? 'No matching items' : 'Connectivity Error'}
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Right Panel: Studio Canvas */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           {activeView === 'STUDIO' && (
             <div className="bg-white rounded-[40px] p-10 border border-navy/5 shadow-xl mb-10 flex items-center justify-between">
                <div>
                   <h3 className="text-[10px] font-black text-navy/40 uppercase tracking-[0.3em] mb-4">Active Roll Profile</h3>
                   <div className="flex gap-4">
                      {[
                        { id: 'STANDARD', name: '38x25mm', width: 38, height: 25, across: 1 },
                        { id: 'DOUBLE', name: '2-Across', width: 38, height: 25, across: 2 },
                        { id: 'TRIPLE', name: '3-Across', width: 32, height: 22, across: 3 }
                      ].map(profile => (
                        <button 
                          key={profile.id}
                          onClick={() => setLabelProfile(profile as any)}
                          className={`px-6 py-3 rounded-xl border-2 transition-all text-[9px] font-black uppercase tracking-widest
                            ${labelProfile.id === profile.id ? 'bg-navy text-white border-navy' : 'bg-navy/5 border-transparent text-navy/40 hover:border-navy/10'}`}
                        >
                           {profile.name}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                   <div className="w-12 h-12 bg-navy/5 rounded-2xl flex items-center justify-center text-navy/20">
                      <Settings size={20} />
                   </div>
                   <div>
                      <div className="text-[10px] font-black text-navy uppercase tracking-widest">{labelProfile.width}x{labelProfile.height}mm</div>
                      <div className="text-[8px] font-black text-navy/30 uppercase mt-1">{labelProfile.across}-Across Configuration</div>
                   </div>
                </div>
             </div>
           )}
           {activeView === 'STUDIO' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Preview Canvas */}
                <div className="col-span-1 bg-brand-navy rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col items-center">
                   <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><ScanBarcode size={240} /></div>
                   
                   <div className="w-full flex justify-between items-start mb-12 relative z-10">
                      <h3 className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.4em]">80mm Label Mode</h3>
                      <button className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-white/40"><RefreshCw size={18} /></button>
                                      {/* The Label */}
                   <div 
                     className="bg-white border-2 border-dashed border-white/30 rounded-lg p-4 flex flex-col justify-between shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all hover:scale-105"
                     style={{ 
                       width: `${labelProfile.width * 8}px`, 
                       height: `${labelProfile.height * 8}px`,
                       maxWidth: '100%'
                     }}
                   >
                      <div className="flex flex-col items-center">
                         <div className="text-[8px] font-black text-navy/40 uppercase tracking-[0.2em] mb-1 truncate w-full text-center">
                            {selectedItem?.store_name || 'PRIME SETU RETAIL'}
                         </div>
                         <div className="w-full h-[0.5px] bg-navy/5 mb-2"></div>
                      </div>

                      <div className="text-center space-y-0.5">
                         <div className="text-[10px] font-serif font-black text-navy uppercase leading-none line-clamp-1">
                            {selectedItem?.item_name || 'SELECT AN ITEM'}
                         </div>
                         <div className="text-[14px] font-black text-navy font-mono tracking-tighter">
                            {formatCurrency(selectedItem?.mrp_paise || 0)}
                         </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-navy/5 pt-2">
                         <div className="text-[6px] font-black text-navy/40 uppercase space-y-0">
                            <div>S: {selectedItem?.size || '-'}</div>
                            <div>H: {selectedItem?.hsn_code || '-'}</div>
                         </div>
                         <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[6px] font-mono font-black text-navy">{selectedItem?.barcode || selectedItem?.item_code || 'IT-CODE'}</span>
                            <div className="w-16 h-4 bg-white flex items-center justify-center gap-[0.5px] overflow-hidden">
                               {Array(30).fill(0).map((_, i) => (
                                 <div 
                                   key={i} 
                                   className="bg-navy h-full" 
                                   style={{ 
                                     width: `${[1, 2, 1][i % 3]}px`, 
                                     opacity: (i % 5 === 0) ? 0.4 : 1 
                                   }} 
                                 />
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
 </div>

                   <button 
                     onClick={() => selectedItem?.barcode && printLabel.mutate({ barcode: selectedItem.barcode, copies: 1 })}
                     disabled={!selectedItem?.barcode || printLabel.isPending}
                     className="w-full py-5 bg-white text-navy rounded-3xl font-black text-[11px] uppercase tracking-widest mt-12 hover:bg-brand-gold transition-all shadow-2xl relative z-10 disabled:opacity-20"
                   >
                      {printLabel.isPending ? 'PRINTING...' : 'Print Single Label'}
                   </button>

                   <div className="mt-8 pt-8 border-t border-white/10 w-full relative z-10">
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Raw Template Engine (.prn/.zpl)</span>
                         <button 
                           onClick={() => setUseCustomTemplate(!useCustomTemplate)}
                           className={`w-10 h-5 rounded-full transition-all relative ${useCustomTemplate ? 'bg-emerald-500' : 'bg-white/10'}`}
                         >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${useCustomTemplate ? 'right-1' : 'left-1'}`}></div>
                         </button>
                      </div>
                      
                      {useCustomTemplate && (
                        <textarea 
                          value={customTemplate}
                          onChange={(e) => setCustomTemplate(e.target.value)}
                          placeholder="PASTE .ZPL OR .PRN CODE HERE... USE {{BARCODE}}, {{ITEM_NAME}}, {{MRP}}"
                          className="w-full h-32 bg-black/20 border border-white/10 rounded-2xl p-4 text-[9px] font-mono text-emerald-400/80 outline-none focus:border-emerald-500/30 transition-all placeholder:text-white/5"
                        />
                      )}
                   </div>
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
                           onClick={() => generateEan13.mutate(selectedItem.id)}
                           disabled={!selectedItem || generateEan13.isPending}
                           className="w-full p-6 bg-navy/5 rounded-3xl border-2 border-transparent hover:border-emerald-500/10 transition-all flex items-center justify-between group disabled:opacity-20"
                         >
                            <div className="text-left">
                               <div className="text-xs font-black text-navy uppercase">Register EAN-13</div>
                               <div className="text-[8px] font-black text-navy/30 uppercase mt-1 tracking-widest">GS1 Standard · Phase 7</div>
                            </div>
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-navy shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
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
                         <button 
                           onClick={handleAddToQueue}
                           disabled={!selectedItem}
                           className="flex-1 py-4 bg-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-20"
                         >
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
                   <div className="flex items-center gap-4">
                     <button 
                       onClick={() => setPrintQueue([])}
                       className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-6"
                     >
                       Clear Queue
                     </button>
                     <button 
                       onClick={handleDispatchQueue}
                       disabled={printQueue.length === 0 || printLabel.isPending}
                       className="bg-navy text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all disabled:opacity-20"
                     >
                        {printLabel.isPending ? 'DISPATCHING...' : `Dispatch ${printQueue.length} Jobs`}
                     </button>
                   </div>
                </div>
                
                {printQueue.length > 0 ? (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                     {printQueue.map((job, idx) => (
                       <div key={idx} className="flex items-center justify-between p-6 bg-navy/5 rounded-3xl border border-navy/5 group">
                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-navy shadow-sm group-hover:bg-brand-gold transition-all">
                                <Tag size={20} />
                             </div>
                             <div>
                                <div className="text-xs font-black text-navy uppercase">{job.item_name || job.name}</div>
                                <div className="text-[9px] font-mono text-navy/40 uppercase mt-1">
                                   {job.item_code || job.code} · {job.size || 'N/A'} · {job.colour || 'N/A'}
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-8">
                             <div className="text-right">
                                <div className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-1">Quantity</div>
                                <div className="text-sm font-mono font-black text-navy">{job.qty || 1}</div>
                             </div>
                             <button 
                               onClick={() => setPrintQueue(printQueue.filter((_, i) => i !== idx))}
                               className="p-3 text-navy/20 hover:text-rose-500 transition-all"
                             >
                                <X size={18} />
                             </button>
                          </div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-navy/10 font-black uppercase tracking-[0.4em]">Queue is currently empty</div>
                )}
             </div>
           )}

           {activeView === 'AUDIT' && (
             <div className="bg-white rounded-[40px] p-12 border border-navy/5 shadow-2xl animate-in slide-in-from-right-10 duration-500">
                <div className="max-w-2xl mx-auto text-center py-20">
                   <div className="w-24 h-24 bg-navy/5 rounded-[32px] flex items-center justify-center text-navy mx-auto mb-10">
                      <Layers size={48} />
                   </div>
                   <h2 className="text-4xl font-serif font-black text-navy uppercase tracking-tight mb-4">Bulk Barcode Audit</h2>
                   <p className="text-xs text-navy/40 uppercase tracking-[0.2em] mb-12">Import PDT Data or CSV Manifests for Bulk Synchronization</p>
                   
                   <div className="bg-navy/5 p-10 rounded-[40px] border-2 border-dashed border-navy/10">
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleFileUpload}
                        className="hidden" 
                        id="pdt-upload" 
                      />
                      <label 
                        htmlFor="pdt-upload"
                        className="cursor-pointer group flex flex-col items-center"
                      >
                         <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-navy shadow-xl mb-6 group-hover:bg-brand-gold transition-all">
                            <Plus size={32} />
                         </div>
                         <div className="text-sm font-black text-navy uppercase tracking-widest">Select CSV File</div>
                         <div className="text-[9px] font-black text-navy/20 uppercase mt-3 tracking-[0.3em]">item_code, barcode, barcode_type, size, colour</div>
                      </label>
                   </div>

                   {bulkImport.isPending && (
                     <div className="mt-10 flex items-center justify-center gap-3 text-navy">
                        <RefreshCw size={20} className="animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Processing Synchronisation...</span>
                     </div>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeStudio;
