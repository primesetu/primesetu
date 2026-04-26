/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useRef } from 'react';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  Package, 
  ArrowRight,
  Truck,
  ScanBarcode,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';

import { formatCurrency } from '../../utils/currency';
import { useOfflineFallback } from '../../hooks/useOfflineFallback';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';

const GRNProcessor: React.FC = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [grnNumber, setGrnNumber] = useState(`GRN/${new Date().getFullYear()}/${Math.floor(Math.random()*9000)+1000}`);
  const [receivedItems, setReceivedItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 1. Fetch Open POs
  const { data: pos = [], loading: isLoadingPOs } = useOfflineFallback('open_pos', async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/purchase/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('primesetu_token')}` }
    });
    const allPOs = await res.json();
    return allPOs.filter((po: any) => po.status !== 'CLOSED' && po.status !== 'CANCELLED');
  }, []);

  // 2. Hotkeys
  useHotkeys('f3', (e) => { e.preventDefault(); searchInputRef.current?.focus(); }, { enableOnFormTags: true });
  useHotkeys('f10', (e) => { e.preventDefault(); if (selectedPO) handleProcess(); }, { enableOnFormTags: true });
  useHotkeys('esc', (e) => { e.preventDefault(); if (selectedPO) setSelectedPO(null); }, { enableOnFormTags: true });

  // 3. Scanner Hook
  useBarcodeScanner((barcode) => {
    if (!selectedPO) {
       // Search POs by barcode or number
    } else {
       // Search items within selected PO
    }
  });

  const selectPO = (po: any) => {
    setSelectedPO(po);
    setReceivedItems(po.items.map((it: any) => ({
      ...it,
      received_now: it.qty_ordered - it.qty_received
    })));
  };

  const updateReceivedQty = (index: number, val: number) => {
    const newItems = [...receivedItems];
    newItems[index].received_now = val;
    setReceivedItems(newItems);
  };

  const handleProcess = async () => {
    if (!selectedPO) return;
    setIsProcessing(true);
    try {
      const payload = {
        po_id: selectedPO.id,
        vendor_id: selectedPO.vendor_id,
        grn_number: grnNumber,
        items: receivedItems.filter(it => it.received_now > 0).map(it => ({
          po_item_id: it.id,
          item_id: it.item_id,
          size: it.size,
          colour: it.colour,
          qty_received: it.received_now,
          unit_cost_paise: it.unit_cost_paise
        }))
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/purchase/grn`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('primesetu_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("GRN Processing Failed");
      
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Error processing Goods Receipt");
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-10 bg-navy/60 backdrop-blur-2xl animate-in fade-in duration-500">
         <div className="bg-white w-full max-w-2xl rounded-[60px] p-16 shadow-2xl border border-white/20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/20 animate-bounce">
               <CheckCircle2 size={48} />
            </div>

            <h2 className="text-4xl font-serif font-black text-navy uppercase tracking-tight mb-4">Inwarding Finalized</h2>
            <p className="text-[10px] font-black text-navy/40 uppercase tracking-[0.4em] mb-12">Registry Synced · Stock Ledger Updated · {grnNumber}</p>

            <div className="grid grid-cols-2 gap-6 mb-12">
               <div className="p-8 bg-navy/5 rounded-[32px] border border-navy/5">
                  <div className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-2">Total Articles</div>
                  <div className="text-3xl font-mono font-black text-navy">{receivedItems.reduce((acc, it) => acc + (it.received_now || 0), 0)}</div>
               </div>
               <div className="p-8 bg-navy/5 rounded-[32px] border border-navy/5">
                  <div className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-2">Valuation</div>
                  <div className="text-xl font-mono font-black text-navy">
                    {formatCurrency(receivedItems.reduce((acc, it) => acc + (it.received_now * it.unit_cost_paise), 0))}
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-4">
               <button 
                 onClick={() => navigate('/barcode', { state: { items: receivedItems.filter(it => it.received_now > 0) } })}
                 className="w-full py-6 bg-brand-navy text-brand-gold rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4 border-2 border-brand-gold/20"
               >
                 <ScanBarcode size={20} /> Generate Barcodes Now
               </button>
               <button 
                 onClick={() => { setSelectedPO(null); setShowSuccess(false); navigate('/purchase'); }}
                 className="w-full py-6 text-navy/40 font-black text-[10px] uppercase tracking-widest hover:text-navy transition-all"
               >
                 Return to Purchase Registry
               </button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Breadcrumb Pattern */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/20 mb-4">
         <span>Home</span> <ChevronRight size={10} />
         <span>Operations</span> <ChevronRight size={10} />
         <span className="text-navy/60">Goods Receipt (GRN)</span>
      </nav>

      {/* Header Section */}
      <div className="flex items-center justify-between bg-white/50 p-10 rounded-[40px] border border-navy/5 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-emerald-600/20">
            <ArrowDownLeft size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tight leading-none">Goods Receipt</h1>
            <p className="text-[10px] font-mono text-navy/40 uppercase tracking-[0.2em] mt-3">Inwarding Protocol · Physical Verification · Barcode Auto-Sync</p>
          </div>
        </div>
      </div>

      {!selectedPO ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoadingPOs && Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-navy/5 rounded-[40px] animate-pulse" />)}
          {pos.map((po: any) => (
            <div 
              key={po.id} 
              onClick={() => selectPO(po)}
              className="bg-white rounded-[40px] p-10 border border-navy/5 shadow-xl hover:shadow-2xl hover:border-emerald-500/30 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Truck size={140} />
              </div>
              <div className="flex justify-between items-start mb-8">
                 <span className="bg-navy/5 text-navy px-4 py-2 rounded-xl font-mono text-[11px] font-black uppercase tracking-widest">{po.po_number}</span>
                 <span className={`px-4 py-2 text-[9px] font-black uppercase rounded-xl ${po.status === 'DRAFT' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {po.status}
                 </span>
              </div>
              <h3 className="text-xl font-black text-navy uppercase tracking-tight mb-2 group-hover:text-emerald-600 transition-colors">Pending Arrival</h3>
              <p className="text-[11px] font-bold text-navy/30 uppercase tracking-[0.2em] mb-10">Vendor ID: {po.vendor_id.slice(0,8)}</p>
              
              <div className="flex items-center justify-between pt-8 border-t border-navy/5">
                 <div className="text-2xl font-mono font-black text-navy">{formatCurrency(po.total_paise)}</div>
                 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <ArrowRight size={22} />
                 </div>
              </div>
            </div>
          ))}
          {pos.length === 0 && !isLoadingPOs && (
            <div className="col-span-full py-24 text-center bg-white rounded-[50px] border-2 border-dashed border-navy/10 text-navy/20 uppercase font-black tracking-[0.4em]">
               No open purchase orders for inwarding
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-10 animate-in slide-in-from-right-10 duration-500">
           {/* PO Details & Item List */}
           <div className="col-span-12 lg:col-span-8 space-y-10">
              <div className="bg-white rounded-[50px] p-10 border border-navy/5 shadow-2xl flex items-center justify-between">
                 <div className="flex items-center gap-8">
                    <button onClick={() => setSelectedPO(null)} className="w-14 h-14 bg-navy/5 text-navy rounded-2xl hover:bg-navy hover:text-white transition-all flex items-center justify-center shadow-sm">
                       <ArrowLeft size={24} />
                    </button>
                    <div>
                       <div className="text-[10px] font-black text-navy/20 uppercase tracking-[0.4em] mb-2">Inwarding Protocol</div>
                       <div className="text-3xl font-black text-navy uppercase tracking-tight leading-none">{selectedPO.po_number}</div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-2">Generating GRN Registry</div>
                    <div className="text-2xl font-mono font-black text-navy">{grnNumber}</div>
                 </div>
              </div>

              <div className="bg-white rounded-[50px] border border-navy/5 shadow-2xl overflow-hidden">
                 <table className="w-full">
                    <thead>
                       <tr className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.4em]">
                          <th className="px-10 py-8 text-left">Item Entity</th>
                          <th className="px-10 py-8 text-center">Ordered</th>
                          <th className="px-10 py-8 text-center">Inwarding</th>
                          <th className="px-10 py-8 text-center">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-navy/5">
                       {receivedItems.map((item, idx) => (
                         <tr key={idx} className="hover:bg-emerald-50/20 transition-all">
                           <td className="px-10 py-8">
                              <div className="text-sm font-black text-navy uppercase tracking-tight">{item.item_name || 'Inwarding Item'}</div>
                              <div className="text-[10px] font-mono text-navy/30 mt-2 uppercase tracking-widest">{item.size} / {item.colour}</div>
                           </td>
                           <td className="px-10 py-8 text-center font-black text-navy text-sm font-mono">{item.qty_ordered}</td>
                           <td className="px-10 py-8 text-center">
                              <input 
                                type="number" 
                                className="w-24 bg-emerald-50 border-2 border-emerald-100 rounded-2xl py-4 px-4 text-sm font-black text-center text-emerald-700 outline-none focus:ring-4 ring-emerald-500/20 transition-all font-mono"
                                value={item.received_now}
                                max={item.qty_ordered - item.qty_received}
                                min={0}
                                onChange={(e) => updateReceivedQty(idx, parseInt(e.target.value) || 0)}
                              />
                           </td>
                           <td className="px-10 py-8 text-center">
                              {item.received_now + item.qty_received >= item.qty_ordered ? (
                                <CheckCircle2 className="mx-auto text-emerald-500" size={24} />
                              ) : (
                                <Zap className="mx-auto text-amber-500 animate-pulse" size={24} />
                              )}
                           </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Inwarding Control Panel */}
           <div className="col-span-12 lg:col-span-4 space-y-10">
              <div className="bg-brand-navy rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-10 flex items-center gap-4">
                    <ShieldCheck size={24} /> Gatekeeper Logic
                 </h3>
                 
                 <div className="space-y-10">
                    <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
                       <label className="text-[9px] font-black uppercase text-white/40 block mb-4 tracking-widest">Logistic Variance Notes</label>
                       <textarea 
                         className="w-full bg-transparent border-none p-0 text-sm font-bold outline-none placeholder:text-white/20 resize-none h-32 leading-relaxed"
                         placeholder="Enter short shipment details, damage notes, or carrier discrepancies..."
                       />
                    </div>

                    <div className="space-y-6 pt-4">
                       <div className="flex items-center gap-4 text-white/40">
                          <ScanBarcode size={20} className="text-emerald-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Auto-Barcode Print Enforced</span>
                       </div>
                       <div className="flex items-center gap-4 text-white/40">
                          <Zap size={20} className="text-amber-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Real-time Stock Update</span>
                       </div>
                    </div>

                    <button 
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="w-full py-7 bg-emerald-500 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 mt-8"
                    >
                      {isProcessing ? <RefreshCw className="animate-spin" /> : <CheckCircle2 size={24} />}
                      {isProcessing ? 'PROCESSING...' : 'COMPLETE INWARDING [F10]'}
                    </button>
                 </div>
              </div>

              <div className="bg-white rounded-[50px] p-10 border border-navy/5 shadow-xl">
                 <div className="flex items-center gap-5 mb-8">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-[1.25rem] flex items-center justify-center shadow-sm">
                       <Package size={24} />
                    </div>
                    <h4 className="text-[11px] font-black text-navy uppercase tracking-[0.3em]">Stock Allocation</h4>
                 </div>
                 <div className="p-6 bg-navy/5 rounded-3xl flex items-center justify-between border border-navy/5">
                    <span className="text-[10px] font-black text-navy/30 uppercase tracking-widest">Assigned Zone</span>
                    <span className="text-sm font-black text-navy uppercase tracking-tight">Warehouse-A / Row-12</span>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GRNProcessor;
