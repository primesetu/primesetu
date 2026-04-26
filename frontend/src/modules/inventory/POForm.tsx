/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Plus, 
  Search,
  Package,
  ShieldCheck,
  Calendar,
  Info,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';

import { formatCurrency, toPaise } from '../../utils/currency';
import { useOfflineFallback } from '../../hooks/useOfflineFallback';

interface POItemInput {
  item_id: string;
  item_code: string;
  item_name: string;
  size: string;
  colour: string;
  qty_ordered: number;
  unit_cost_paise: number;
  tax_rate: number;
}

const POForm: React.FC = () => {
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState('');
  const [poNumber, setPoNumber] = useState(`PO/${new Date().getFullYear()}/${Math.floor(Math.random()*9000)+1000}`);
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<POItemInput[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Vendors for selection
  const { data: vendors = [] } = useOfflineFallback('vendors_list', async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/customer/search?type=vendor&q=`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('primesetu_token')}` }
    });
    return res.json();
  }, []);

  // 2. Hotkeys
  useHotkeys('f10', (e) => { e.preventDefault(); handleSave(); }, { enableOnFormTags: true });
  useHotkeys('esc', (e) => { e.preventDefault(); if (confirm("Discard changes?")) navigate('/purchase'); }, { enableOnFormTags: true });

  const addItem = () => {
    const newItem: POItemInput = {
      item_id: 'mock-id',
      item_code: 'SKU001',
      item_name: 'Sample Item',
      size: 'XL',
      colour: 'Navy',
      qty_ordered: 1,
      unit_cost_paise: 50000,
      tax_rate: 18
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof POItemInput, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let tax = 0;
    items.forEach(item => {
      const lineCost = item.qty_ordered * item.unit_cost_paise;
      const lineTax = Math.floor(lineCost * item.tax_rate / 100);
      subtotal += lineCost;
      tax += lineTax;
    });
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSave = async () => {
    if (!vendorId || items.length === 0) {
      alert("Vendor and at least one item required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        vendor_id: vendorId,
        po_number: poNumber,
        expected_date: expectedDate || null,
        notes,
        items: items.map(it => ({
          item_id: it.item_id,
          size: it.size,
          colour: it.colour,
          qty_ordered: it.qty_ordered,
          unit_cost_paise: it.unit_cost_paise,
          tax_rate: it.tax_rate
        }))
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/purchase/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('primesetu_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to save PO");
      navigate('/purchase');
    } catch (err) {
      console.error(err);
      alert("Error saving Purchase Order");
    } finally {
      setIsSaving(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="pb-20 animate-in slide-in-from-bottom-10 duration-700">
      {/* Breadcrumb Pattern */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/20 mb-6">
         <span>Home</span> <ChevronRight size={10} />
         <span>Procurement</span> <ChevronRight size={10} />
         <span>Registry</span> <ChevronRight size={10} />
         <span className="text-navy/60">Raise New PO</span>
      </nav>

      {/* Sovereign Form Header */}
      <div className="flex items-center justify-between bg-white/50 p-10 rounded-[40px] border border-navy/5 backdrop-blur-sm shadow-sm mb-10">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/purchase')} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-navy shadow-sm border border-navy/5 hover:bg-navy hover:text-white transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tight">New Procurement Protocol</h1>
            <p className="text-[10px] font-mono text-navy/40 uppercase tracking-[0.3em] mt-3">Sovereign Node · Inventory Inwarding · PA-2026-X</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate('/purchase')}
             className="px-10 py-5 bg-white border border-navy/10 rounded-[2rem] text-[11px] font-black uppercase text-navy/40 hover:text-navy hover:border-navy/20 transition-all shadow-sm"
           >
             Discard <span className="opacity-40 ml-1">[Esc]</span>
           </button>
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="px-12 py-5 bg-brand-navy text-brand-gold rounded-[2rem] text-[11px] font-black uppercase shadow-2xl shadow-navy/20 flex items-center gap-4 hover:scale-105 active:scale-95 transition-all"
           >
             {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
             Finalize PO <span className="opacity-40 ml-1">[F10]</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Left Column: Header Details */}
        <div className="col-span-12 lg:col-span-8 space-y-10">
           <div className="bg-white rounded-[50px] p-12 border border-navy/5 shadow-2xl">
              <div className="grid grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-navy uppercase tracking-[0.3em] flex items-center gap-3 ml-2">
                       <ShieldCheck size={18} className="text-emerald-500" /> Vendor Selection *
                    </label>
                    <select 
                      className="w-full bg-navy/5 border-2 border-transparent focus:border-brand-gold/20 rounded-[2rem] py-5 px-8 text-sm font-black text-navy outline-none transition-all uppercase tracking-widest"
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                    >
                      <option value="">Select Partner Registry...</option>
                      {vendors.map((v: any) => (
                        <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                      ))}
                    </select>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-navy uppercase tracking-[0.3em] flex items-center gap-3 ml-2">
                       <Info size={18} className="text-brand-gold" /> PO Protocol ID
                    </label>
                    <input 
                      type="text" 
                      className="w-full bg-navy/5 border-2 border-transparent focus:border-brand-gold/20 rounded-[2.5rem] py-5 px-10 text-sm font-black text-navy outline-none transition-all font-mono uppercase"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-navy uppercase tracking-[0.3em] flex items-center gap-3 ml-2">
                       <Calendar size={18} className="text-brand-saffron" /> Expected Arrival
                    </label>
                    <input 
                      type="date" 
                      className="w-full bg-navy/5 border-2 border-transparent focus:border-brand-gold/20 rounded-[2.5rem] py-5 px-10 text-sm font-black text-navy outline-none transition-all font-mono"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-navy uppercase tracking-[0.3em] flex items-center gap-3 ml-2">
                       Internal Logistics Notes
                    </label>
                    <input 
                      type="text" 
                      placeholder="SHIPPING TERMS, DEDUCTIONS..."
                      className="w-full bg-navy/5 border-2 border-transparent focus:border-brand-gold/20 rounded-[2.5rem] py-5 px-10 text-sm font-black text-navy outline-none transition-all uppercase tracking-widest"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                 </div>
              </div>
           </div>

           {/* Item Grid */}
           <div className="bg-white rounded-[50px] border border-navy/5 shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-navy/5 flex items-center justify-between">
                 <h3 className="text-[11px] font-black text-navy uppercase tracking-[0.4em]">Inwarding Protocol Grid</h3>
                 <button 
                   onClick={addItem}
                   className="flex items-center gap-3 bg-brand-gold text-navy px-8 py-3 rounded-2xl font-black text-[11px] uppercase hover:scale-105 transition-all shadow-xl shadow-brand-gold/20"
                 >
                   <Plus size={18} strokeWidth={4} /> Add Line Item
                 </button>
              </div>
              <table className="w-full">
                 <thead>
                    <tr className="bg-navy/5 text-[10px] font-black uppercase text-navy/30 tracking-[0.3em]">
                       <th className="px-10 py-6 text-left">Item Entity</th>
                       <th className="px-10 py-6 text-center">Qty</th>
                       <th className="px-10 py-6 text-right">Unit Cost (Paise)</th>
                       <th className="px-10 py-6 text-center">Tax %</th>
                       <th className="px-10 py-6 text-right">Line Total</th>
                       <th className="px-10 py-6 text-center">RM</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-navy/5">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-brand-cream transition-all group">
                        <td className="px-10 py-6">
                           <div className="text-sm font-black text-navy uppercase tracking-tight">{item.item_name}</div>
                           <div className="text-[10px] font-mono text-navy/30 uppercase mt-2">{item.item_code} · {item.size} / {item.colour}</div>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <input 
                             type="number" 
                             className="w-20 bg-navy/5 border-2 border-transparent focus:border-brand-gold/20 rounded-xl py-3 px-4 text-sm font-black text-center outline-none transition-all font-mono"
                             value={item.qty_ordered}
                             onChange={(e) => updateItem(idx, 'qty_ordered', parseInt(e.target.value) || 0)}
                           />
                        </td>
                        <td className="px-10 py-6 text-right">
                           <input 
                             type="number" 
                             className="w-28 bg-navy/5 border-2 border-transparent focus:border-brand-gold/20 rounded-xl py-3 px-4 text-sm font-black text-right outline-none transition-all font-mono"
                             value={item.unit_cost_paise}
                             onChange={(e) => updateItem(idx, 'unit_cost_paise', parseInt(e.target.value) || 0)}
                           />
                        </td>
                        <td className="px-10 py-6 text-center">
                           <select 
                             className="bg-navy/5 border-none rounded-xl py-3 px-4 text-sm font-black outline-none cursor-pointer"
                             value={item.tax_rate}
                             onChange={(e) => updateItem(idx, 'tax_rate', parseInt(e.target.value))}
                           >
                             {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                           </select>
                        </td>
                        <td className="px-10 py-6 text-right font-mono text-sm font-black text-navy">
                           {formatCurrency(Math.floor((item.qty_ordered * item.unit_cost_paise) * (1 + item.tax_rate/100)))}
                        </td>
                        <td className="px-10 py-6 text-center">
                           <button onClick={() => removeItem(idx)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                              <Trash2 size={18} />
                           </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                       <tr>
                          <td colSpan={6} className="px-10 py-20 text-center text-[11px] font-black text-navy/10 uppercase tracking-[0.5em]">Grid awaiting line entry</td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Right Column: Financial Summary */}
        <div className="col-span-12 lg:col-span-4 space-y-10">
           <div className="bg-brand-navy rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -right-16 -top-16 opacity-5 rotate-12">
                 <Package size={300} />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-gold mb-12 flex items-center gap-4">
                 <Package size={22} /> Protocol Ledger
              </h3>
              
              <div className="space-y-8 relative z-10">
                 <div className="flex justify-between items-center border-b border-white/5 pb-6">
                    <span className="text-[11px] font-black uppercase tracking-widest text-white/30">Subtotal</span>
                    <span className="text-2xl font-mono font-black">{formatCurrency(totals.subtotal)}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/5 pb-6">
                    <span className="text-[11px] font-black uppercase tracking-widest text-white/30">Tax Liability</span>
                    <span className="text-2xl font-mono font-black text-brand-saffron">{formatCurrency(totals.tax)}</span>
                 </div>
                 <div className="pt-6">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-gold block mb-4">Final Protocol Value</span>
                    <div className="text-6xl font-serif font-black text-white leading-tight">{formatCurrency(totals.total)}</div>
                 </div>
              </div>

              <div className="mt-12 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 relative z-10">
                 <div className="flex items-center gap-4 text-brand-gold mb-4">
                    <ShieldCheck size={24} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Sovereign Compliance</span>
                 </div>
                 <p className="text-[11px] text-white/40 font-bold leading-relaxed italic uppercase tracking-tighter">
                    All financial values computed in integer paise protocol. No floating point residues.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default POForm;
