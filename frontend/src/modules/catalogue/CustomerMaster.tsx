/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation     :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React from 'react';
import { Users, Search, Plus, Star } from 'lucide-react';

export default function CustomerMaster() {
  return (
    <div className="p-12 h-full flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="relative w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/20 group-focus-within:text-brand-gold" />
          <input 
            placeholder="Search CRM by Mobile, Name, UID..." 
            className="w-full bg-white border-2 border-navy/5 rounded-2xl pl-12 pr-4 h-14 text-sm font-black outline-none focus:border-brand-gold shadow-sm" 
          />
        </div>
        <button className="flex items-center gap-3 px-8 h-14 bg-brand-gold text-navy rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-gold/20">
          <Plus size={18}/> Enroll Member
        </button>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] shadow-xl border border-navy/5 overflow-hidden flex flex-col">
        <div className="grid grid-cols-5 bg-navy text-white text-[10px] font-black uppercase tracking-widest px-8 py-5">
           <span>Member ID</span>
           <span>Full Name</span>
           <span>Contact</span>
           <span>Points</span>
           <span className="text-right">Loyalty Tier</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center opacity-10 select-none">
           <Users size={120} strokeWidth={1} />
           <span className="text-3xl font-black uppercase tracking-[0.5em] mt-8">CRM Registry Empty</span>
        </div>
      </div>
    </div>
  );
}
