/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState } from 'react';
import { Trophy, Star, TrendingUp, Settings2, ShieldCheck, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoyaltyModule() {
  const [activeTier, setActiveTier] = useState('GOLD');

  const tiers = [
    { id: 'SILVER', name: 'Silver Tier', icon: Star, color: 'text-slate-400', bg: 'bg-slate-50', points: '0 - 5,000', earn: '1 Point / ₹200', burn: '₹0.50 / Point' },
    { id: 'GOLD', name: 'Gold Tier', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50', points: '5,001 - 20,000', earn: '1 Point / ₹100', burn: '₹0.75 / Point' },
    { id: 'PLATINUM', name: 'Platinum Tier', icon: ShieldCheck, color: 'text-cyan-500', bg: 'bg-cyan-50', points: '20,000+', earn: '1 Point / ₹50', burn: '₹1.00 / Point' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-black text-navy flex items-center gap-4">
            <Star className="w-10 h-10 text-amber-500 fill-amber-500" />
            Loyalty Engine
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Sovereign Customer Retention Framework</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white border-2 border-border px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cream transition-all flex items-center gap-2">
            <Settings2 className="w-4 h-4" /> Global Rules
          </button>
          <button className="bg-navy text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-navy/90 transition-all flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> ACTIVATE CAMPAIGN
          </button>
        </div>
      </div>

      {/* Tier Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <motion.div 
            key={tier.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTier(tier.id)}
            className={`p-8 rounded-[3rem] border-2 cursor-pointer transition-all ${
              activeTier === tier.id ? 'border-navy shadow-2xl bg-white' : 'border-white bg-white/50 opacity-60'
            }`}
          >
            <div className={`w-16 h-16 ${tier.bg} ${tier.color} rounded-3xl flex items-center justify-center mb-6 shadow-inner`}>
              <tier.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-black text-navy mb-2">{tier.name}</h3>
            <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-6">Entry: {tier.points} Points</div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-400 uppercase">Earning Rate</span>
                <span className="text-xs font-black text-navy">{tier.earn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-400 uppercase">Burn Value</span>
                <span className="text-xs font-black text-emerald-600">{tier.burn}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campaign Insights */}
        <div className="glass p-10 rounded-[3rem] shadow-xl">
          <h4 className="text-lg font-serif font-black text-navy flex items-center gap-3 mb-8 uppercase">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Retention Analytics
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-cream/30 rounded-[2rem] border border-white">
              <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-2">Liability Balance</div>
              <div className="text-2xl font-black text-navy">₹14.2L</div>
              <div className="text-[8px] font-bold text-rose-500 mt-1">+4.2% This Month</div>
            </div>
            <div className="p-6 bg-cream/30 rounded-[2rem] border border-white">
              <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-2">Burn-to-Earn Ratio</div>
              <div className="text-2xl font-black text-navy">1:4.2</div>
              <div className="text-[8px] font-bold text-emerald-500 mt-1">Healthy Zone</div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border flex justify-between items-center">
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Active Members: 4,250</span>
            <button className="text-[10px] font-black text-navy hover:text-amber-600 uppercase tracking-widest flex items-center gap-1">
              View Segments <Users className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass p-10 rounded-[3rem] shadow-xl">
           <h4 className="text-lg font-serif font-black text-navy flex items-center gap-3 mb-8 uppercase">
            <Zap className="w-5 h-5 text-amber-500" />
            Instant Triggers
          </h4>
          <div className="space-y-4">
            {[
              { label: 'Double Points Weekend', desc: 'Auto-active Fri 6PM - Sun 11PM', status: 'Active' },
              { label: 'Birthday Multiplier (3x)', desc: 'For Gold & Platinum members', status: 'Paused' },
              { label: 'Lapsed Customer Recall', desc: 'Trigger SMS for 90-day inactive', status: 'Draft' }
            ].map((trigger, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/50">
                <div>
                  <div className="text-[11px] font-black text-navy">{trigger.label}</div>
                  <div className="text-[9px] text-gray-500 font-medium">{trigger.desc}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                  trigger.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {trigger.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
