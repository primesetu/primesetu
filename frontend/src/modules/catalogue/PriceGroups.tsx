/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R. M.
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Settings2, 
  Percent, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert,
  RefreshCw,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '../../lib/supabase';
import { usePermission } from '../../hooks/usePermission';
import { useOfflineFallback } from '../../hooks/useOfflineFallback';

interface PriceGroup {
  id: string;
  name: string;
  code: string;
  price_level: string | null;
  discount_pct: number;
  is_taxable: boolean;
  is_active: boolean;
}

const PriceGroups: React.FC = () => {
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { hasPermission } = usePermission();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price_level: '',
    discount_pct: 0,
    is_taxable: true
  });

  // 1. Permission Guard
  if (!hasPermission('catalog.view')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert size={48} className="text-rose-500 mb-4" />
        <h2 className="text-xl font-black text-navy uppercase tracking-tighter">Access Denied</h2>
        <p className="text-xs text-navy/40 uppercase tracking-widest mt-2">Insufficient permissions to view Pricing Groups</p>
      </div>
    );
  }

  // 2. Fetch Price Groups with Offline Fallback (Phase 2 FastAPI Integration)
  const { 
    data: groups = [], 
    loading: isLoading, 
    isOfflineData 
  } = useOfflineFallback(
    'price_groups',
    async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/price-groups/`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch price groups");
      return response.json();
    },
    []
  );

  // 3. Create Mutation (Phase 2 FastAPI Integration)
  const createMutation = useMutation({
    mutationFn: async (newData: typeof formData) => {
      const { data: { session } } = await supabase.auth.getSession();
      const payload = {
        name: newData.name,
        code: newData.code,
        price_level: newData.price_level || null,
        discount_pct: newData.discount_pct,
        is_taxable: newData.is_taxable
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/price-groups/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to create price group");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price_groups'] });
      setIsModalOpen(false);
      setFormData({ name: '', code: '', price_level: '', discount_pct: 0, is_taxable: true });
    }
  });

  // 4. Hotkeys
  useHotkeys('f3', (e) => { e.preventDefault(); searchInputRef.current?.focus(); }, { enableOnFormTags: true });
  useHotkeys('f4', (e) => {
    e.preventDefault();
    if (hasPermission('catalog.edit')) {
      setIsModalOpen(true);
    }
  }, { enableOnFormTags: true });
  useHotkeys('f10', (e) => {
    e.preventDefault();
    if (isModalOpen && formData.name && formData.code) {
      createMutation.mutate(formData);
    }
  }, { enableOnFormTags: true });
  useHotkeys('esc', (e) => {
    e.preventDefault();
    if (isModalOpen) setIsModalOpen(false);
  }, { enableOnFormTags: true });

  const filteredGroups = groups.filter((g: PriceGroup) => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Breadcrumb Pattern */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/20 mb-4">
         <span>Home</span> <ChevronRight size={10} />
         <span>Catalogue</span> <ChevronRight size={10} />
         <span className="text-navy/60">Customer Price Groups</span>
      </nav>

      {/* Sovereign Header Area */}
      <div className="flex items-center justify-between bg-white/50 p-10 rounded-[40px] border border-navy/5 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-brand-navy rounded-[24px] flex items-center justify-center text-brand-gold shadow-2xl shadow-navy/20">
            <DollarSign size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tight leading-none">Price Groups</h1>
            <div className="flex items-center gap-3 mt-3">
              <p className="text-[10px] font-mono text-navy/40 uppercase tracking-[0.2em]">Tiered Pricing · Wholesale Protocols · Member Discounts</p>
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
              placeholder="Search Code / Name... [F3]"
              className="w-80 bg-white border-2 border-navy/5 rounded-[2rem] py-5 pl-14 pr-6 text-xs font-black outline-none focus:border-brand-gold transition-all shadow-sm uppercase tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['price_groups'] })}
            className="p-5 bg-white rounded-2xl text-navy/20 hover:text-navy border border-navy/5 shadow-sm transition-all"
          >
            <RefreshCw size={20} />
          </button>
          {hasPermission('catalog.edit') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-4 bg-brand-saffron text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-brand-saffron/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              Establish Group <span className="opacity-40 ml-1 text-[9px]">[F4]</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-4 gap-8 mb-10">
        <div className="bg-brand-navy rounded-[40px] p-10 text-white shadow-2xl shadow-navy/20 relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-all rotate-12">
            <Settings2 size={180} />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mb-4">Total Protocols</div>
            <div className="text-5xl font-serif font-black">{groups.length}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-[40px] p-10 border border-navy/5 shadow-xl">
          <div className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" /> Active Groups
          </div>
          <div className="text-5xl font-serif font-black text-navy">{groups.filter((g: PriceGroup) => g.is_active !== false).length}</div>
        </div>

        <div className="bg-white rounded-[40px] p-10 border border-navy/5 shadow-xl">
          <div className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
             <Percent size={14} className="text-brand-saffron" /> Discounted Tiers
          </div>
          <div className="text-5xl font-serif font-black text-navy">{groups.filter((g: PriceGroup) => g.discount_pct > 0).length}</div>
        </div>

        <div className="bg-white rounded-[40px] p-10 border border-navy/5 shadow-xl">
          <div className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
             <RefreshCw size={14} className="text-indigo-500" /> Sync Status
          </div>
          <div className="text-2xl font-black text-navy uppercase tracking-tight pt-4">{isOfflineData ? 'OFFLINE BUFFER' : 'Sovereign Live'}</div>
        </div>
      </div>

      {/* List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading && groups.length === 0 ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-navy/5 animate-pulse rounded-[40px]" />
          ))
        ) : filteredGroups.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-[50px] border-2 border-dashed border-navy/10 text-navy/10 uppercase font-black tracking-[0.5em]">No price groups established in registry</div>
        ) : filteredGroups.map((group: PriceGroup) => (
          <div 
            key={group.id}
            className="bg-white border-2 border-navy/5 rounded-[40px] p-10 hover:border-brand-gold hover:shadow-2xl hover:shadow-navy/5 transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="bg-navy text-white text-[11px] font-mono font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-sm">
                {group.code}
              </div>
              {group.is_taxable ? (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl shadow-sm border border-emerald-100/50">
                   <CheckCircle2 size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Taxable</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl shadow-sm border border-amber-100/50">
                   <AlertCircle size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Exempt</span>
                </div>
              )}
            </div>
            <h3 className="font-serif font-black text-navy text-2xl uppercase leading-tight mb-3 group-hover:text-brand-gold transition-colors">
              {group.name}
            </h3>
            
            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-navy/5">
              {group.price_level ? (
                <div className="flex items-center gap-3 bg-brand-gold/10 text-brand-gold px-5 py-3 rounded-2xl border border-brand-gold/10 shadow-sm">
                  <Tag size={16} />
                  <span className="text-[11px] font-black uppercase tracking-widest font-mono">Level: {group.price_level}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-brand-saffron/10 text-brand-saffron px-5 py-3 rounded-2xl border border-brand-saffron/10 shadow-sm">
                  <Percent size={16} />
                  <span className="text-[11px] font-black uppercase tracking-widest font-mono">{group.discount_pct}% Off MRP</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Create Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-navy/80 backdrop-blur-md" 
              onClick={() => setIsModalOpen(false)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-cream w-full max-w-2xl rounded-[50px] p-12 shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><Percent size={200} /></div>
              <h2 className="text-4xl font-serif font-black text-navy uppercase mb-10 relative z-10 tracking-tight">Establish Price Group</h2>
              
              <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[11px] font-black text-navy/30 uppercase mb-2 ml-2 tracking-[0.2em]">Protocol Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-navy/5 rounded-[2rem] py-5 px-8 text-sm font-black text-navy outline-none focus:border-brand-gold shadow-sm uppercase tracking-widest"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="ENTER NAME..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[11px] font-black text-navy/30 uppercase mb-2 ml-2 tracking-[0.2em]">Short Code</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-navy/5 rounded-[2rem] py-5 px-8 text-sm font-black text-navy outline-none focus:border-brand-gold uppercase font-mono shadow-sm tracking-[0.2em]"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      placeholder="SKU-CODE..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-navy/30 uppercase mb-2 ml-2 tracking-[0.2em]">Pricing Strategy</label>
                  <div className="grid grid-cols-2 gap-4 p-2 bg-navy/5 rounded-[2.5rem]">
                    <button 
                      onClick={() => setFormData({...formData, discount_pct: 0})}
                      className={`py-4 px-6 rounded-[2rem] text-[11px] font-black uppercase transition-all tracking-widest ${formData.discount_pct === 0 ? 'bg-white text-navy shadow-xl scale-[1.02]' : 'text-navy/30'}`}
                    >
                      Price Level
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, price_level: ''})}
                      className={`py-4 px-6 rounded-[2rem] text-[11px] font-black uppercase transition-all tracking-widest ${formData.discount_pct > 0 ? 'bg-white text-navy shadow-xl scale-[1.02]' : 'text-navy/30'}`}
                    >
                      Flat Discount
                    </button>
                  </div>
                </div>

                {formData.discount_pct === 0 ? (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <label className="block text-[11px] font-black text-navy/30 uppercase mb-2 ml-2 tracking-[0.2em]">Mapped Level</label>
                    <select 
                      className="w-full bg-white border-2 border-navy/5 rounded-[2rem] py-5 px-8 text-sm font-black text-navy outline-none focus:border-brand-gold shadow-sm appearance-none cursor-pointer uppercase tracking-widest"
                      value={formData.price_level}
                      onChange={(e) => setFormData({...formData, price_level: e.target.value})}
                    >
                      <option value="">-- CHOOSE LEVEL --</option>
                      <option value="mrp">MRP (STANDARD)</option>
                      <option value="wholesale">WHOLESALE protocol</option>
                      <option value="staff">INTERNAL STAFF</option>
                      <option value="vip">VIP ELITE</option>
                    </select>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <label className="block text-[11px] font-black text-navy/30 uppercase mb-2 ml-2 tracking-[0.2em]">Discount % From MRP</label>
                    <input 
                      type="number" 
                      className="w-full bg-white border-2 border-navy/5 rounded-[2rem] py-5 px-10 text-sm font-black text-navy outline-none focus:border-brand-gold font-mono shadow-sm tracking-[0.2em]"
                      value={formData.discount_pct}
                      onChange={(e) => setFormData({...formData, discount_pct: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </motion.div>
                )}

                <div className="flex items-center gap-6 pt-6 border-t border-navy/5">
                  <div 
                    onClick={() => setFormData({...formData, is_taxable: !formData.is_taxable})}
                    className={`w-16 h-10 rounded-full transition-all cursor-pointer flex items-center px-1.5 shadow-inner ${formData.is_taxable ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  >
                     <motion.div 
                       layout
                       className="w-7 h-7 bg-white rounded-full shadow-lg" 
                     />
                  </div>
                  <label className="text-[11px] font-black text-navy uppercase tracking-[0.2em] cursor-pointer">
                    Standard GST Taxation {formData.is_taxable ? 'Enforced' : 'Exempt'}
                  </label>
                </div>

                <div className="flex gap-6 pt-10">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-5 rounded-[2rem] font-black text-[11px] uppercase text-navy/30 hover:bg-navy/5 tracking-widest transition-all"
                  >
                    DISCARD [Esc]
                  </button>
                  <button 
                    onClick={() => createMutation.mutate(formData)}
                    disabled={createMutation.isPending || !formData.name || !formData.code}
                    className="flex-[2] py-5 bg-brand-navy text-brand-gold rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-navy/30 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                  >
                    {createMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                    {createMutation.isPending ? 'Establishing...' : 'Establish Registry [F10]'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PriceGroups;
