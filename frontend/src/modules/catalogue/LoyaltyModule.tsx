/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState } from 'react';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Users, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  Gift,
  Star,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoyaltyModule() {
  const [filter, setFilter] = useState('ALL');

  const tiers = [
    { name: 'SILVER', color: 'bg-slate-400', textColor: 'text-slate-900', multiplier: '1.0x', threshold: '0 - 2,500' },
    { name: 'GOLD', color: 'bg-amber-400', textColor: 'text-amber-950', multiplier: '1.5x', threshold: '2,501 - 10,000' },
    { name: 'PLATINUM', color: 'bg-indigo-400', textColor: 'text-indigo-950', multiplier: '2.0x', threshold: '10,001+' }
  ];

  const recentTxns = [
    { id: 1, type: 'ACCRUE', member: 'Rahul Sharma', points: '+124', date: '10m ago', tier: 'GOLD' },
    { id: 2, type: 'REDEEM', member: 'Priya Patel', points: '-500', date: '45m ago', tier: 'PLATINUM' },
    { id: 3, type: 'ACCRUE', member: 'Amit Varma', points: '+42', date: '2h ago', tier: 'SILVER' },
  ];

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-black text-navy flex items-center gap-4">
            <Trophy className="w-12 h-12 text-brand-gold" />
            CRM & Loyalty Protocol
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-[0.2em] mt-3">Engagement Engine · Tier-Based Accrual Active</p>
        </div>
        
        <div className="flex gap-4">
          <button className="bg-white border-2 border-border px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cream transition-all flex items-center gap-2">
            <Gift className="w-4 h-4" /> Redemption Rules
          </button>
          <button className="bg-navy text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-navy/90 transition-all flex items-center gap-2">
            <Star className="w-4 h-4" /> Configure Campaigns
          </button>
        </div>
      </header>

      {/* Tier Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="glass p-10 rounded-[3rem] shadow-xl border border-white/50 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${tier.color} opacity-5 blur-[40px]`} />
            <div className="flex justify-between items-start mb-10">
              <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${tier.color} ${tier.textColor}`}>
                {tier.name}
              </span>
              <span className="text-2xl font-serif font-black text-navy">{tier.multiplier}</span>
            </div>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Points Threshold</p>
            <div className="text-xl font-black text-navy mb-6">{tier.threshold}</div>
            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-tighter">
              <TrendingUp className="w-3 h-3" /> 12% Growth this month
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Member Pulse */}
        <div className="lg:col-span-2 glass rounded-[3rem] p-10 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-serif font-black text-navy uppercase tracking-tight">Active Member Ledger</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search Member..."
                className="pl-12 pr-6 py-3 bg-cream/30 border-2 border-transparent focus:border-brand-gold/30 rounded-full outline-none text-xs font-bold transition-all w-64"
              />
            </div>
          </div>

          <div className="space-y-4">
            {recentTxns.map((row, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-white/50 hover:bg-white rounded-3xl transition-all border border-transparent hover:border-brand-gold/10 group">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs uppercase ${
                    row.tier === 'PLATINUM' ? 'bg-indigo-100 text-indigo-600' : 
                    row.tier === 'GOLD' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {row.member.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy group-hover:text-indigo-600 transition-colors">{row.member}</h4>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">{row.tier} MEMBER · {row.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <div className={`text-lg font-black ${row.type === 'ACCRUE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {row.points}
                    </div>
                    <div className="text-[9px] font-black text-muted uppercase tracking-tighter">{row.type}</div>
                  </div>
                  <button className="p-3 bg-cream rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-muted" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Stats */}
        <div className="bg-[#1a2340] rounded-[3rem] p-10 shadow-2xl text-white">
          <h3 className="text-xl font-serif font-black uppercase tracking-tight mb-10">Global CRM Health</h3>
          <div className="space-y-10">
            <div>
              <div className="flex justify-between items-end mb-4">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Active Members</p>
                <p className="text-3xl font-black">12,402</p>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-gold w-[70%]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <Zap className="w-5 h-5 text-brand-gold mb-4" />
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Redemption Rate</p>
                <div className="text-xl font-black">24.5%</div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <Target className="w-5 h-5 text-indigo-400 mb-4" />
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Retention Rate</p>
                <div className="text-xl font-black">88.2%</div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Tier Distribution</h4>
              <div className="space-y-4">
                {['SILVER', 'GOLD', 'PLATINUM'].map((t, idx) => (
                  <div key={t} className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-tighter">{t}</span>
                    <div className="flex-1 mx-4 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${idx === 2 ? 'bg-indigo-400' : idx === 1 ? 'bg-amber-400' : 'bg-slate-400'}`} style={{ width: `${60 - idx*20}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-white/40">{60 - idx*20}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
