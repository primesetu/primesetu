/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState } from 'react';
import { UserSquare2, Search, Plus, Edit2, Trash2, Award, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonnelMaster() {
  const [search, setSearch] = useState('');
  
  // Placeholder data - in Phase 3+ this hits api.accounts.personnel
  const personnel = [
    { id: 'S01', name: 'Arjun Sharma', role: 'Senior Sales', commission: '2.5%', sales: '₹4.2L', performance: 92 },
    { id: 'S02', name: 'Priya Verma', role: 'Counter Cashier', commission: '1.0%', sales: '₹1.8L', performance: 88 },
    { id: 'S03', name: 'Rahul Bose', role: 'Store Assistant', commission: '1.5%', sales: '₹2.9L', performance: 75 },
  ].filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black text-navy flex items-center gap-3">
            <UserSquare2 className="w-8 h-8 text-amber-500" />
            Sales Personnel
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Institutional Workforce & Performance</p>
        </div>
        <button className="bg-navy text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-widest shadow-xl hover:bg-navy/90 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-400" /> REGISTER PERSONNEL
        </button>
      </div>

      <div className="glass p-4 rounded-2xl flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search Name, ID or Role..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-cream/50 border border-border rounded-xl text-sm font-bold outline-none focus:border-navy focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personnel.map((person) => (
          <motion.div 
            key={person.id}
            whileHover={{ y: -5 }}
            className="glass p-6 rounded-[2rem] border border-white shadow-xl relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button className="p-2 bg-white rounded-lg shadow-sm text-navy hover:text-amber-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
              <button className="p-2 bg-white rounded-lg shadow-sm text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-gold text-lg font-black">
                {person.name[0]}
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-navy leading-tight">{person.name}</h3>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{person.id} · {person.role}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cream/30 p-3 rounded-2xl border border-white/50">
                <div className="text-[9px] font-black text-muted uppercase tracking-wider mb-1">Commission</div>
                <div className="text-sm font-black text-navy">{person.commission}</div>
              </div>
              <div className="bg-cream/30 p-3 rounded-2xl border border-white/50">
                <div className="text-[9px] font-black text-muted uppercase tracking-wider mb-1">MTD Sales</div>
                <div className="text-sm font-black text-emerald-600">{person.sales}</div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black text-navy uppercase tracking-tight">
                <span>Performance Index</span>
                <span>{person.performance}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${person.performance > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${person.performance}%` }}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
              <div className="flex gap-1">
                {[1,2,3].map(i => <Star key={i} className={`w-3 h-3 ${i <= (person.performance/20) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}
              </div>
              <button className="text-[10px] font-black text-navy hover:text-amber-600 uppercase tracking-widest flex items-center gap-1 transition-colors">
                Settlement <Zap className="w-3 h-3 text-amber-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
