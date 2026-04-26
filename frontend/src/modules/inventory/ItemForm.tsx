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

import React, { useState, useEffect } from 'react';
import { Save, X, Package, Ruler, Tag, Truck, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHotkeys } from 'react-hotkeys-hook';

import { supabase } from '../../lib/supabase';
import StockMatrix from './StockMatrix';

interface ItemFormProps {
  onClose: () => void;
  editId?: string | null;
}

interface Department {
  id: string;
  name: string;
}

interface SizeGroup {
  id: string;
  name: string;
  sizes: string[];
}

interface Partner {
  id: string;
  name: string;
  partner_type: string;
}

const ItemForm: React.FC<ItemFormProps> = ({ onClose, editId }) => {
  const queryClient = useQueryClient();
  
  // 1. Master Data Queries
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('departments').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: sizeGroups = [] } = useQuery<SizeGroup[]>({
    queryKey: ['size-groups'],
    queryFn: async () => {
      const { data, error } = await supabase.from('size_groups').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: partners = [] } = useQuery<Partner[]>({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('partners').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  // 2. Local State
  const [formData, setFormData] = useState({
    item_code: '',
    item_name: '',
    department_id: '',
    brand: '',
    supplier_id: '',
    size_group_id: '',
    colour: '',
    colour_code: '',
    mrp_rupees: 0,
    cost_rupees: 0,
    gst_rate: 12,
    hsn_code: '',
    stock_matrix: [] as any[]
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // 3. Size Group Selection Effect
  useEffect(() => {
    if (formData.size_group_id) {
      const group = sizeGroups.find(g => g.id === formData.size_group_id);
      if (group) setSelectedSizes(group.sizes);
    }
  }, [formData.size_group_id, sizeGroups]);

  // 4. Hotkeys
  useHotkeys('f10', (e) => { e.preventDefault(); handleSave(); }, { enableOnFormTags: true });
  useHotkeys('esc', (e) => { e.preventDefault(); onClose(); }, { enableOnFormTags: true });

  // 5. Create Mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        item_code: data.item_code,
        item_name: data.item_name,
        department_id: data.department_id,
        brand: data.brand || null,
        supplier_id: data.supplier_id || null,
        size_group_id: data.size_group_id || null,
        colour: data.colour || null,
        colour_code: data.colour_code || null,
        mrp_paise: Math.round(data.mrp_rupees * 100),
        cost_paise: data.cost_rupees ? Math.round(data.cost_rupees * 100) : null,
        gst_rate: data.gst_rate,
        hsn_code: data.hsn_code,
        stock_matrix: data.stock_matrix.filter(m => m.qty_on_hand > 0)
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('primesetu_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to save item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      onClose();
    }
  });

  const handleSave = () => {
    if (!formData.item_code || !formData.item_name || !formData.department_id) return;
    saveMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-end">
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-cream w-full max-w-4xl h-full shadow-2xl flex flex-col animate-slideLeft">
        {/* Header */}
        <div className="bg-brand-navy p-10 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-brand-gold rounded-[20px] flex items-center justify-center shadow-lg">
              <Package className="text-navy" size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-black uppercase tracking-tight leading-none">Item Master Entry</h2>
              <p className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.3em] mt-3">Sovereign Registry › Atomic Sync Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-4 rounded-full transition-all">
            <X size={28} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-12 space-y-12">
          
          {/* Section: Basic Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-navy/20 uppercase tracking-[0.4em] flex items-center gap-3">
                <Tag size={16} /> Basic Identity
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-navy/40 uppercase mb-2 ml-2 tracking-widest">Protocol Code *</label>
                  <input 
                    type="text" 
                    maxLength={20}
                    className="w-full bg-white border-2 border-navy/5 rounded-[1.5rem] py-4 px-6 text-sm font-mono font-black text-navy outline-none focus:border-brand-gold transition-all uppercase"
                    value={formData.item_code}
                    onChange={(e) => setFormData({...formData, item_code: e.target.value.toUpperCase()})}
                    placeholder="SKU-..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-navy/40 uppercase mb-2 ml-2 tracking-widest">Department *</label>
                  <select 
                    className="w-full bg-white border-2 border-navy/5 rounded-[1.5rem] py-4 px-6 text-sm font-black text-navy outline-none focus:border-brand-gold transition-all cursor-pointer"
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                  >
                    <option value="">-- SELECT --</option>
                    {Array.isArray(departments) && departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-navy/40 uppercase mb-2 ml-2 tracking-widest">Description Identity *</label>
                <input 
                  type="text" 
                  maxLength={40}
                  className="w-full bg-white border-2 border-navy/5 rounded-[1.5rem] py-4 px-6 text-sm font-black text-navy outline-none focus:border-brand-gold transition-all uppercase"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  placeholder="ITEM DESCRIPTION..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-navy/20 uppercase tracking-[0.4em] flex items-center gap-3">
                <Truck size={16} /> Supply Registry
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-navy/40 uppercase mb-2 ml-2 tracking-widest">Brand Label</label>
                  <input 
                    type="text" 
                    className="w-full bg-white border-2 border-navy/5 rounded-[1.5rem] py-4 px-6 text-sm font-black text-navy outline-none focus:border-brand-gold transition-all uppercase"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="BRAND NAME..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-navy/40 uppercase mb-2 ml-2 tracking-widest">Partner Supplier</label>
                  <select 
                    className="w-full bg-white border-2 border-navy/5 rounded-[1.5rem] py-4 px-6 text-sm font-black text-navy outline-none focus:border-brand-gold transition-all cursor-pointer"
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                  >
                    <option value="">-- SELECT --</option>
                    {Array.isArray(partners) && partners.filter(p => p.partner_type !== 'customer').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-navy/40 uppercase mb-2 ml-2 tracking-widest">Colour DNA</label>
                  <input 
                    type="text" 
                    className="w-full bg-white border-2 border-navy/5 rounded-[1.5rem] py-4 px-6 text-sm font-black text-navy outline-none focus:border-brand-gold transition-all uppercase"
                    value={formData.colour}
                    onChange={(e) => setFormData({...formData, colour: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-navy/40 uppercase mb-2 ml-2 tracking-widest">HEX / Code</label>
                  <input 
                    type="text" 
                    className="w-full bg-white border-2 border-navy/5 rounded-[1.5rem] py-4 px-6 text-sm font-mono font-black text-navy outline-none focus:border-brand-gold uppercase transition-all"
                    value={formData.colour_code}
                    onChange={(e) => setFormData({...formData, colour_code: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Pricing & Tax */}
          <div className="bg-white rounded-[40px] p-10 border border-navy/5 space-y-8 shadow-sm">
            <h3 className="text-[11px] font-black text-brand-gold uppercase tracking-[0.4em] flex items-center gap-3">
              <Tag size={16} /> Pricing Protocol & Compliance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-navy/40 uppercase mb-2 ml-2 tracking-widest">MRP (Paise-Calc) *</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/30 text-xs font-black">₹</span>
                  <input 
                    type="number" 
                    className="w-full bg-navy/5 border-none rounded-[1.5rem] py-4 pl-10 pr-6 text-sm font-mono font-black text-navy outline-none focus:ring-4 ring-brand-gold/10 transition-all"
                    value={formData.mrp_rupees}
                    onChange={(e) => setFormData({...formData, mrp_rupees: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-navy/40 uppercase mb-2 ml-2 tracking-widest">Sovereign Cost</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/30 text-xs font-black">₹</span>
                  <input 
                    type="number" 
                    className="w-full bg-navy/5 border-none rounded-[1.5rem] py-4 pl-10 pr-6 text-sm font-mono font-black text-navy outline-none focus:ring-4 ring-brand-gold/10 transition-all"
                    value={formData.cost_rupees}
                    onChange={(e) => setFormData({...formData, cost_rupees: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-navy/40 uppercase mb-2 ml-2 tracking-widest">GST Matrix % *</label>
                <select 
                  className="w-full bg-navy/5 border-none rounded-[1.5rem] py-4 px-6 text-sm font-black text-navy outline-none focus:ring-4 ring-brand-gold/10 transition-all cursor-pointer"
                  value={formData.gst_rate}
                  onChange={(e) => setFormData({...formData, gst_rate: parseInt(e.target.value)})}
                >
                  {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}% GST</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-navy/40 uppercase mb-2 ml-2 tracking-widest">HSN Protocol *</label>
                <input 
                  type="text" 
                  className="w-full bg-navy/5 border-none rounded-[1.5rem] py-4 px-6 text-sm font-mono font-black text-navy outline-none focus:ring-4 ring-brand-gold/10 transition-all"
                  value={formData.hsn_code}
                  onChange={(e) => setFormData({...formData, hsn_code: e.target.value})}
                  placeholder="HSN CODE..."
                />
              </div>
            </div>
          </div>

          {/* Section: Stock Matrix */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black text-navy/20 uppercase tracking-[0.4em] flex items-center gap-3">
                <Ruler size={16} /> Dimensional Stock Matrix
              </h3>
              <select 
                className="bg-brand-gold/10 text-brand-gold border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none shadow-sm cursor-pointer"
                value={formData.size_group_id}
                onChange={(e) => setFormData({...formData, size_group_id: e.target.value})}
              >
                <option value="">SELECT SIZE GROUP</option>
                {Array.isArray(sizeGroups) && sizeGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            {formData.size_group_id ? (
              <StockMatrix 
                sizes={selectedSizes}
                colours={[formData.colour || 'Standard']}
                matrix={formData.stock_matrix}
                onChange={(m) => setFormData({...formData, stock_matrix: m})}
              />
            ) : (
              <div className="h-40 border-2 border-dashed border-navy/5 rounded-[40px] flex flex-col items-center justify-center text-navy/10 gap-3 bg-white/30">
                <Ruler size={32} />
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Establish size group to enable grid</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t border-navy/5 flex gap-6 shrink-0 shadow-2xl">
          <button 
            onClick={onClose}
            className="flex-1 py-5 rounded-[2rem] font-black text-[11px] uppercase text-navy/30 hover:bg-navy/5 tracking-widest transition-all"
          >
            Discard Session [Esc]
          </button>
          <button 
            disabled={saveMutation.isPending || !formData.item_code || !formData.item_name || !formData.department_id}
            onClick={handleSave}
            className="flex-[2] py-5 bg-brand-navy text-brand-gold rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-navy/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {saveMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            {saveMutation.isPending ? 'Establishing SKU...' : 'Establish Registry [F10]'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemForm;
