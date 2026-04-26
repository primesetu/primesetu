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

import React, { useState, useRef } from "react";
import {
  Plus,
  Search,
  Package,
  RefreshCw,
  MoreVertical,
  Download,
  ShieldAlert,
  ChevronRight,
  BarChart3,
  Boxes,
  Zap,
  Filter
} from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

import { formatCurrency } from "../../utils/currency";
import ItemForm from "./ItemForm";
import { usePermission } from "../../hooks/usePermission";
import { useOfflineFallback } from "../../hooks/useOfflineFallback";

const ItemMaster: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { hasPermission } = usePermission();

  // 1. Fetch Items with Offline Fallback
  const { 
    data: items = [], 
    loading: isLoading, 
    isOfflineData 
  } = useOfflineFallback(
    `items_${searchTerm}`,
    async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/items/?search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('primesetu_token')}`,
          },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json();
    },
    []
  );

  // 2. Permission Guard
  if (!hasPermission('catalog.view')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert size={48} className="text-rose-500 mb-4" />
        <h2 className="text-xl font-black text-navy uppercase tracking-tighter">Access Denied</h2>
        <p className="text-xs text-navy/40 uppercase tracking-widest mt-2">Insufficient permissions to view Item Master</p>
      </div>
    );
  }

  // 3. Hotkeys
  useHotkeys("f3", (e) => { e.preventDefault(); searchInputRef.current?.focus(); }, { enableOnFormTags: true });
  useHotkeys("f4", (e) => { 
    e.preventDefault(); 
    if (hasPermission('catalog.edit')) {
      setSelectedItemId(null);
      setIsFormOpen(true);
    }
  }, { enableOnFormTags: true });

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Breadcrumb Pattern */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/20 mb-4">
         <span>Home</span> <ChevronRight size={10} />
         <span>Catalogue</span> <ChevronRight size={10} />
         <span className="text-navy/60">Item Master Registry</span>
      </nav>

      {/* Sovereign Header */}
      <div className="flex items-center justify-between bg-white/50 p-10 rounded-[40px] border border-navy/5 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-brand-navy rounded-[24px] flex items-center justify-center text-brand-gold shadow-2xl shadow-navy/20">
            <Package size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tight leading-none">Item Master</h1>
            <div className="flex items-center gap-3 mt-3">
              <p className="text-[10px] font-mono text-navy/40 uppercase tracking-[0.2em]">Universal SKU Registry · GTIN Alignment · Stock Control</p>
              {isOfflineData && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded-lg">Offline Buffer</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-brand-gold transition-colors" size={18} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search SKU / Name... [F3]"
              className="w-80 bg-white border-2 border-navy/5 rounded-[2rem] py-5 pl-14 pr-6 text-xs font-black outline-none focus:border-brand-gold transition-all shadow-sm uppercase tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-5 bg-white rounded-2xl text-navy/20 hover:text-navy border border-navy/5 shadow-sm transition-all"><Filter size={20} /></button>
          {hasPermission('catalog.edit') && (
            <button 
              onClick={() => {
                setSelectedItemId(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-4 bg-brand-saffron text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-brand-saffron/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              Add Item <span className="opacity-40 ml-1 text-[9px]">[F4]</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-8">
        {[
          { label: 'Total SKUs', val: items.length.toString(), icon: Boxes, color: 'navy' },
          { label: 'Stock Value', val: '₹1.2Cr', icon: BarChart3, color: 'gold' },
          { label: 'Low Stock', val: '24 Items', icon: ShieldAlert, color: 'saffron' },
          { label: 'Active Sync', val: 'Live', icon: Zap, color: 'green' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-[40px] p-10 border border-navy/5 shadow-xl relative overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl group">
             <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.color === 'navy' ? 'bg-navy text-white shadow-lg' : kpi.color === 'gold' ? 'bg-brand-gold/10 text-brand-gold' : kpi.color === 'saffron' ? 'bg-brand-saffron/10 text-brand-saffron' : 'bg-emerald-50 text-emerald-600'}`}>
                   <kpi.icon size={22} />
                </div>
                <span className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em]">{kpi.label}</span>
             </div>
             <div className="text-4xl font-serif font-black text-navy tracking-tight">{kpi.val}</div>
          </div>
        ))}
      </div>

      {/* List Container */}
      <div className="bg-white rounded-[50px] border border-navy/5 shadow-2xl overflow-hidden mt-10">
        <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-brand-navy text-white text-[10px] font-black uppercase tracking-[0.4em]">
                <th className="px-12 py-8 text-left">SKU Protocol</th>
                <th className="px-12 py-8 text-left">Description</th>
                <th className="px-12 py-8 text-center">In-Hand Stock</th>
                <th className="px-12 py-8 text-right">MRP (Paise)</th>
                <th className="px-12 py-8 text-center">Tax Matrix</th>
                <th className="px-12 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {isLoading && items.length === 0 ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={6} className="px-12 py-10 h-24 bg-navy/5" /></tr>
                ))
              ) : (Array.isArray(items) && items.length > 0) ? items.map((item: any) => (
                <tr key={item.id} className="hover:bg-brand-cream transition-all group">
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-4">
                       <span className="bg-navy/5 text-navy px-4 py-2 rounded-xl font-mono text-[12px] font-black uppercase group-hover:bg-white transition-all shadow-sm">{item.item_code}</span>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <div className="text-base font-black text-navy uppercase tracking-tight">{item.item_name}</div>
                    <div className="text-[10px] font-bold text-navy/30 uppercase tracking-widest mt-2 flex items-center gap-2">
                       {item.brand || "UNBRANDED"} · {item.department || "GENERAL"}
                    </div>
                  </td>
                  <td className="px-12 py-10 text-center">
                    <span className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${item.total_stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                      {item.total_stock} Units
                    </span>
                  </td>
                  <td className="px-12 py-10 text-right font-mono text-base font-black text-navy">
                    {formatCurrency(item.mrp_paise)}
                  </td>
                  <td className="px-12 py-10 text-center font-mono text-[12px] font-black text-navy/60">
                    {item.gst_rate}% GST
                  </td>
                  <td className="px-12 py-10 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setIsFormOpen(true);
                        }}
                        className="p-4 bg-navy/5 text-navy rounded-2xl hover:bg-navy hover:text-white transition-all shadow-sm"
                      >
                        <RefreshCw size={20} className="group-hover:rotate-180 transition-all duration-700" />
                      </button>
                      <button className="p-4 bg-navy/5 text-navy/20 hover:text-brand-saffron hover:bg-brand-saffron/10 rounded-2xl transition-all"><MoreVertical size={22} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={6} className="px-12 py-32 text-center text-navy/10 uppercase font-black tracking-[0.5em] text-sm">
                      {Array.isArray(items) ? 'No items found in registry' : 'Connectivity Error / Unauthorized'}
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Form Slide-over */}
      {isFormOpen && (
        <ItemForm
          editId={selectedItemId}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default ItemMaster;
