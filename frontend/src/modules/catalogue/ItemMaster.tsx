/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation     :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React from 'react';
import { Package, Search, Plus, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ItemMaster({ onOpenMatrix }: { onOpenMatrix: (code: string) => void }) {
  return (
    <div className="p-12 h-full flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="relative w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/20 group-focus-within:text-brand-gold transition-colors" />
          <input 
            placeholder="Search SKUs, Brands, HSN..." 
            className="w-full bg-white border-2 border-navy/5 rounded-2xl pl-12 pr-4 h-14 text-sm font-black outline-none focus:border-brand-gold shadow-sm" 
          />
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 h-14 bg-navy text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
            <Plus size={16}/> New SKU
          </button>
          <button className="flex items-center justify-center w-14 h-14 bg-white border-2 border-navy/5 rounded-2xl text-navy hover:border-brand-gold transition-all shadow-sm">
            <Filter size={20}/>
          </button>
          <button className="flex items-center justify-center w-14 h-14 bg-white border-2 border-navy/5 rounded-2xl text-navy hover:border-brand-gold transition-all shadow-sm">
            <Download size={20}/>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] shadow-xl border border-navy/5 overflow-hidden flex flex-col">
        <div className="grid grid-cols-6 bg-navy text-white text-[10px] font-black uppercase tracking-widest px-8 py-5">
           <span>Code</span>
           <span className="col-span-2">Product Name</span>
           <span>Brand</span>
           <span>Price (Paise)</span>
           <span className="text-right">Actions</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center opacity-10 select-none">
           <Package size={120} strokeWidth={1} />
           <span className="text-3xl font-black uppercase tracking-[0.5em] mt-8">Empty Ledger</span>
        </div>
      </div>
    </div>
  );
}
