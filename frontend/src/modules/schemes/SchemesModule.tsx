/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, Gift, Tag, Clock, Users, Package, 
  Plus, Search, ArrowRight, CheckCircle2,
  AlertCircle, Save, X, Layers, Calendar,
  BarChart3, Settings2, Trash2, ShieldCheck,
  Percent, ShoppingBag, ShoppingCart
} from 'lucide-react'

type SchemeType = 'ITEM_DISCOUNT' | 'ITEM_OFFER' | 'BILL_DISCOUNT' | 'BILL_OFFER';

interface Scheme {
  id: string;
  name: string;
  type: SchemeType;
  priority: number;
  validFrom: string;
  validTo: string;
  happyHours?: { start: string; end: string };
  status: 'ACTIVE' | 'DRAFT' | 'EXPIRED';
}

export default function SchemesModule() {
  const [phase, setPhase] = useState<0 | 1 | 2>(0) // 0: List, 1: Create/Edit, 2: Simulation
  const [activeTab, setActiveTab] = useState<SchemeType>('ITEM_DISCOUNT')
  const [search, setSearch] = useState('')
  
  // Mock Data from Shoper 9 Deep Analysis
  const [schemes] = useState<Scheme[]>([
    { id: 'S1', name: 'Weekend BOGO - Footwear', type: 'ITEM_OFFER', priority: 1, validFrom: '2026-04-01', validTo: '2026-06-30', status: 'ACTIVE' },
    { id: 'S2', name: 'Bill Level ₹500 Off (>₹5000)', type: 'BILL_DISCOUNT', priority: 2, validFrom: '2026-04-10', validTo: '2026-04-30', status: 'ACTIVE' },
    { id: 'S3', name: 'Festive 20% on Nexus', type: 'ITEM_DISCOUNT', priority: 3, validFrom: '2026-01-01', validTo: '2026-03-31', status: 'EXPIRED' },
  ])

  const filteredSchemes = schemes.filter(s => 
    s.type === activeTab && 
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Sovereign Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-navy text-gold text-[9px] font-black uppercase tracking-[0.2em] rounded-md">Promotion Engine</div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tight leading-none">Schemes & Offers</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-3 flex items-center gap-2 italic">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Automated Retail Promotion Matrix
          </p>
        </div>

        <div className="flex bg-white shadow-2xl rounded-3xl p-2 border border-gray-100">
          <div className="relative mr-4">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
             <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Find existing scheme..."
                className="bg-gray-50 border-none pl-12 pr-6 py-4 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:ring-4 ring-amber-400/10 w-64 transition-all" />
          </div>
          <button onClick={() => setPhase(1)} className="bg-navy text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-navy transition-all flex items-center gap-3 group shadow-xl">
             <Plus className="w-5 h-5 text-gold group-hover:text-navy transition-colors" /> New Promotion
          </button>
        </div>
      </div>

      {phase === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Nav */}
          <aside className="lg:col-span-1 space-y-4">
             {[
               { id: 'ITEM_DISCOUNT', label: 'Item Discounts', icon: Tag, desc: 'Flat/Var % on Products' },
               { id: 'ITEM_OFFER', label: 'Item Offers', icon: Gift, desc: 'BOGO & Free Items' },
               { id: 'BILL_DISCOUNT', label: 'Bill Discounts', icon: ShoppingCart, desc: 'Threshold Value Drops' },
               { id: 'BILL_OFFER', label: 'Bill Offers', icon: ShoppingBag, desc: 'Gifts on Total Value' },
             ].map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id as SchemeType)}
                 className={`w-full text-left p-6 rounded-[2.5rem] transition-all border-2 flex flex-col gap-4 group ${activeTab === tab.id ? 'bg-navy border-navy text-white shadow-2xl scale-105' : 'bg-white border-transparent text-gray-400 hover:border-gray-100 hover:bg-cream/20'}`}>
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTab === tab.id ? 'bg-gold/10 text-gold' : 'bg-gray-100 text-gray-300 group-hover:bg-white transition-all'}`}>
                    <tab.icon size={24} />
                 </div>
                 <div>
                    <h3 className="font-serif font-black text-lg uppercase tracking-tight">{tab.label}</h3>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${activeTab === tab.id ? 'text-white/40' : 'text-muted'}`}>{tab.desc}</p>
                 </div>
               </button>
             ))}
          </aside>

          {/* List Area */}
          <main className="lg:col-span-3">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredSchemes.map((scheme) => (
                    <motion.div layout key={scheme.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className={`glass rounded-[3rem] p-10 border transition-all relative overflow-hidden group ${scheme.status === 'ACTIVE' ? 'border-emerald-500/10' : 'opacity-60 grayscale'}`}>
                      
                      <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-3">
                         <div className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${scheme.status === 'ACTIVE' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-300 text-gray-500'}`}>
                            {scheme.status}
                         </div>
                         <div className="text-[10px] font-mono font-black text-navy/20">PRIORITY #{scheme.priority}</div>
                      </div>

                      <div className="flex items-center gap-6 mb-8">
                         <div className="w-16 h-16 bg-navy rounded-3xl flex items-center justify-center text-gold shadow-2xl shadow-navy/20">
                            <Percent size={28} />
                         </div>
                         <div>
                            <h3 className="text-xl font-serif font-black text-navy uppercase leading-tight">{scheme.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                               <Calendar className="w-3 h-3 text-muted" />
                               <span className="text-[9px] font-black text-muted uppercase tracking-widest">{scheme.validFrom} to {scheme.validTo}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                         <div className="flex gap-3">
                            <button className="px-8 py-3 bg-navy text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-gold hover:text-navy transition-all shadow-xl">Edit Protocol</button>
                            <button className="p-3 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                         </div>
                         <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-black text-navy">C{i}</div>)}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gold text-navy flex items-center justify-center text-[8px] font-black">+42</div>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
             {filteredSchemes.length === 0 && (
               <div className="py-40 text-center opacity-20">
                  <Zap size={80} className="mx-auto mb-6 text-navy" strokeWidth={0.5} />
                  <h3 className="text-2xl font-serif font-black text-navy uppercase">No Active Schemes</h3>
                  <p className="text-xs font-bold uppercase tracking-widest mt-2">Create your first retail promotion engine</p>
               </div>
             )}
          </main>
        </div>
      )}

      {phase === 1 && (
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden bg-white/80">
          <div className="flex justify-between items-start mb-12">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gold text-navy rounded-3xl flex items-center justify-center shadow-2xl shadow-gold/20"><Gift size={32} /></div>
                <div>
                   <h2 className="text-3xl font-serif font-black text-navy uppercase">Scheme Definition Wizard</h2>
                   <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-1">Configuring institutional retail logic</p>
                </div>
             </div>
             <button onClick={() => setPhase(0)} className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all"><X /></button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             {/* Left: Metadata */}
             <div className="lg:col-span-2 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-navy uppercase tracking-widest ml-2">Promotion Name</label>
                      <input placeholder="e.g. End of Season Sale 2026" className="w-full bg-cream/30 border border-gray-100 rounded-2xl p-5 text-sm font-bold focus:border-gold outline-none transition-all shadow-inner" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-navy uppercase tracking-widest ml-2">Application Priority</label>
                      <select className="w-full bg-cream/30 border border-gray-100 rounded-2xl p-5 text-sm font-bold focus:border-gold outline-none transition-all shadow-inner">
                         <option>1 - Highest Priority</option>
                         <option>2 - Standard</option>
                         <option>3 - Secondary</option>
                         <option>9 - Fallback</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-navy uppercase tracking-widest ml-2">Validity Start</label>
                      <input type="date" className="w-full bg-cream/30 border border-gray-100 rounded-2xl p-5 text-sm font-bold focus:border-gold outline-none transition-all shadow-inner" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-navy uppercase tracking-widest ml-2">Validity End</label>
                      <input type="date" className="w-full bg-cream/30 border border-gray-100 rounded-2xl p-5 text-sm font-bold focus:border-gold outline-none transition-all shadow-inner" />
                   </div>
                </div>

                <div className="p-10 bg-navy rounded-[3rem] text-white space-y-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-full bg-gold/[0.03] -skew-x-12"></div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-gold mb-6 border-b border-white/10 pb-4">Logic Configuration: {activeTab.replace('_',' ')}</h4>
                   
                   {activeTab === 'ITEM_OFFER' && (
                     <div className="grid grid-cols-3 gap-8 items-end relative z-10">
                        <div className="space-y-3">
                           <label className="text-[9px] font-black uppercase opacity-60">Buy Quantity</label>
                           <input type="number" defaultValue={2} className="w-full bg-white/10 border border-white/20 rounded-xl p-4 font-black outline-none focus:border-gold" />
                        </div>
                        <div className="flex flex-col items-center pb-4 text-gold"><ArrowRight /></div>
                        <div className="space-y-3">
                           <label className="text-[9px] font-black uppercase opacity-60">Get Free Qty</label>
                           <input type="number" defaultValue={1} className="w-full bg-white/10 border border-white/20 rounded-xl p-4 font-black outline-none focus:border-gold" />
                        </div>
                     </div>
                   )}

                   {activeTab === 'BILL_DISCOUNT' && (
                     <div className="grid grid-cols-3 gap-8 items-end relative z-10">
                        <div className="space-y-3">
                           <label className="text-[9px] font-black uppercase opacity-60">Bill Value Threshold</label>
                           <input type="number" placeholder="₹5000" className="w-full bg-white/10 border border-white/20 rounded-xl p-4 font-black outline-none focus:border-gold" />
                        </div>
                        <div className="flex flex-col items-center pb-4 text-gold"><Zap size={16} /></div>
                        <div className="space-y-3">
                           <label className="text-[9px] font-black uppercase opacity-60">Flat Cash Off</label>
                           <input type="number" placeholder="₹500" className="w-full bg-white/10 border border-white/20 rounded-xl p-4 font-black outline-none focus:border-gold" />
                        </div>
                     </div>
                   )}
                </div>
             </div>

             {/* Right: Triggers */}
             <div className="space-y-8">
                <div className="glass p-8 rounded-[2.5rem] border-gray-100 space-y-6">
                   <h4 className="text-[11px] font-black text-navy uppercase tracking-widest flex items-center gap-3"><Users size={16} /> Trigger Groups</h4>
                   <div className="space-y-3">
                      {['All Customers', 'Elite Loyalty', 'Staff Group', 'Birthday Club'].map(g => (
                        <label key={g} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-gray-100 cursor-pointer transition-all">
                           <span className="text-[10px] font-bold text-navy uppercase">{g}</span>
                           <input type="checkbox" className="w-4 h-4 rounded accent-navy" defaultChecked={g === 'All Customers'} />
                        </label>
                      ))}
                   </div>
                </div>

                <div className="glass p-8 rounded-[2.5rem] border-gray-100 space-y-6 bg-amber-50/50">
                   <h4 className="text-[11px] font-black text-navy uppercase tracking-widest flex items-center gap-3"><Clock size={16} /> Happy Hours</h4>
                   <div className="flex items-center gap-4">
                      <input type="time" className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-xs font-black outline-none" />
                      <span className="text-gray-400 font-bold">to</span>
                      <input type="time" className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-xs font-black outline-none" />
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                        <button key={d} className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-[8px] font-black text-navy/40 hover:bg-navy hover:text-white transition-all uppercase">{d}</button>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
             <div className="flex items-center gap-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">
                <ShieldCheck size={18} /> Protocol Verified by Sovereign Node
             </div>
             <div className="flex gap-4">
                <button onClick={() => setPhase(0)} className="px-10 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">Discard Draft</button>
                <button onClick={() => setPhase(0)} className="px-16 py-5 bg-navy text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gold hover:text-navy transition-all flex items-center gap-4 group">
                   <Save size={20} className="text-gold group-hover:text-navy" /> Save Scheme Protocol
                </button>
             </div>
          </div>
        </motion.div>
      )}

    </div>
  )
}
