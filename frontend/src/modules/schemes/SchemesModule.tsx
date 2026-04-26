/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * Promotions Cockpit (Schemes Parity)
 * Tesla Style Visual Builder
 * ============================================================ */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Plus, 
  Zap, 
  Calendar, 
  Tag, 
  ShoppingBag, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Percent,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { api } from '@/api/client';

export default function SchemesModule() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'create'>('list');

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const data = await api.schemes.list();
      setSchemes(data);
    } catch (err) {
      console.error('Failed to fetch schemes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden animate-in fade-in duration-700">
      {/* ── TOP NAVIGATION ── */}
      <div className="p-12 pb-0 flex justify-between items-end">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-brand-navy text-brand-gold text-[9px] font-black uppercase tracking-[0.2em] rounded-md">Growth Engine</div>
              <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
           </div>
           <h1 className="text-5xl font-black text-navy tracking-tighter" style={{ fontFamily: 'var(--font-tesla)' }}>Promotions Cockpit</h1>
           <p className="text-xs text-navy/40 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
             <Trophy className="w-3.5 h-3.5" /> Shoper 9 Compatible Scheme Engine Active
           </p>
        </div>

        <button 
          onClick={() => setView(view === 'list' ? 'create' : 'list')}
          className="tesla-button px-12 py-6"
        >
          {view === 'list' ? <><Plus className="w-5 h-5" /> Construct New Scheme</> : 'Return to Fleet'}
        </button>
      </div>

      <div className="p-12 flex-1 min-h-0 overflow-auto">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {/* STATS CARD */}
              <div className="tesla-card bg-navy text-white p-10 flex flex-col justify-between overflow-hidden relative">
                 <Zap className="absolute -right-4 -top-4 w-32 h-32 text-white/5" />
                 <div>
                   <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 italic">Performance Yield</h3>
                   <div className="text-5xl font-black mb-2">+18.4%</div>
                   <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Revenue Uplift via Offers</p>
                 </div>
                 <div className="mt-12 flex items-center gap-4 text-[10px] font-black text-white/40">
                   <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-brand-gold border-2 border-navy"></div>
                      <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-navy"></div>
                      <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-navy"></div>
                   </div>
                   <span>4 Active Campaigns</span>
                 </div>
              </div>

              {/* SCHEME CARDS */}
              {schemes.map((scheme, i) => (
                <motion.div 
                  key={scheme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="tesla-card bg-white border border-navy/5 p-10 flex flex-col justify-between group hover:shadow-2xl transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 bg-navy/5 rounded-2xl flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-white transition-colors">
                          {scheme.type === 'PERCENT' ? <Percent size={20} /> : <Tag size={20} />}
                       </div>
                       <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${scheme.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-navy/5 text-navy/20'}`}>
                         {scheme.is_active ? 'Active' : 'Draft'}
                       </span>
                    </div>
                    <h4 className="text-xl font-black text-navy uppercase tracking-tight mb-2">{scheme.name}</h4>
                    <p className="text-[10px] font-bold text-navy/40 uppercase tracking-widest leading-relaxed">
                      {scheme.description || 'Institutional promotional offer with automated trigger logic.'}
                    </p>
                  </div>

                  <div className="mt-10 pt-8 border-t border-navy/5 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-navy/40">
                        <Clock size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Expires in 12 days</span>
                     </div>
                     <ChevronRight className="text-brand-gold w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}

              {/* EMPTY STATE / ADD NEW */}
              <div 
                onClick={() => setView('create')}
                className="tesla-card bg-navy/5 border-2 border-dashed border-navy/10 p-10 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-brand-gold/40 hover:bg-white transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-navy group-hover:bg-brand-gold transition-all shadow-sm">
                   <Plus size={32} />
                </div>
                <span className="text-[10px] font-black text-navy uppercase tracking-[0.3em]">Launch New Campaign</span>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto grid grid-cols-12 gap-12"
            >
              <div className="col-span-12 lg:col-span-8 space-y-12">
                 <div className="tesla-card bg-white p-12 border border-navy/5">
                    <h3 className="text-xs font-black text-navy uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                       <ShieldCheck className="text-brand-gold" /> Parameters & Triggers
                    </h3>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="col-span-2">
                          <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest block mb-3">Scheme Identity</label>
                          <input type="text" placeholder="E.G. SUMMER CLEARANCE 2026" className="tesla-input w-full" />
                       </div>
                       <div>
                          <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest block mb-3">Benefit Type</label>
                          <select className="tesla-input w-full">
                             <option>PERCENTAGE DISCOUNT</option>
                             <option>FLAT AMOUNT OFF</option>
                             <option>BUY X GET Y (FREE)</option>
                          </select>
                       </div>
                       <div>
                          <label className="text-[9px] font-black text-navy/40 uppercase tracking-widest block mb-3">Trigger Mode</label>
                          <select className="tesla-input w-full">
                             <option>QUANTITY BASED</option>
                             <option>TOTAL VALUE BASED</option>
                             <option>SPECIFIC SKU GROUP</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="tesla-card bg-white p-12 border border-navy/5">
                    <h3 className="text-xs font-black text-navy uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                       <LayoutGrid className="text-brand-gold" /> Applicable Fleet (Items)
                    </h3>
                    <div className="p-10 bg-navy/5 rounded-[2rem] border-2 border-dashed border-navy/10 flex flex-col items-center justify-center gap-4">
                       <ShoppingBag className="text-navy/20" size={32} />
                       <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Select Items / Categories to Include</span>
                    </div>
                 </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-12">
                 <div className="tesla-card bg-navy text-white p-12 relative overflow-hidden">
                    <Zap className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5" />
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-10">Simulation</h3>
                    <div className="space-y-8 relative z-10">
                       <div className="flex justify-between items-end border-b border-white/10 pb-6">
                          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Est. Redemptions</span>
                          <span className="text-2xl font-black">1.2K</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-white/10 pb-6">
                          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Cost to Store</span>
                          <span className="text-2xl font-black text-rose-400">-₹45,000</span>
                       </div>
                       <div className="flex justify-between items-end">
                          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Net GMV Lift</span>
                          <span className="text-3xl font-black text-emerald-400">+₹2.4L</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col gap-6">
                    <button className="tesla-button w-full py-8 text-sm">
                       Launch Campaign <ArrowRight size={20} />
                    </button>
                    <button onClick={() => setView('list')} className="tesla-button w-full py-8 text-sm bg-white text-navy border-navy/10">
                       Discard Draft
                    </button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
