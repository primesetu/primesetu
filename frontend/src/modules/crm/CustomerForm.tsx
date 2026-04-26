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

import React, { useState } from 'react';
import { Save, X, User, MapPin, CreditCard, Gift } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../../lib/supabase';

interface CustomerFormProps {
  onClose: () => void;
  editId?: string | null;
}

interface PriceGroup {
  id: string;
  name: string;
  is_active: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onClose, editId }) => {
  const queryClient = useQueryClient();
  
  // 1. Master Data (Price Groups)
  const { data: priceGroups = [] } = useQuery<PriceGroup[]>({
    queryKey: ['price-groups'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customer_price_groups').select('*').eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  // 2. Local State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gstin: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state_code: '',
    pincode: '',
    credit_limit_rupees: 0,
    credit_days: 30,
    price_group_id: ''
  });

  // 3. Create Mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Sovereign Money Standard
      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        gstin: data.gstin || null,
        address_line1: data.address_line1 || null,
        address_line2: data.address_line2 || null,
        city: data.city || null,
        state_code: data.state_code || (data.gstin ? data.gstin.substring(0, 2) : null),
        pincode: data.pincode || null,
        credit_limit_paise: Math.round(data.credit_limit_rupees * 100),
        credit_days: data.credit_days,
        price_group_id: data.price_group_id || null
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/customers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to register customer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-end">
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-cream w-full max-w-3xl h-full shadow-2xl flex flex-col animate-slideLeft">
        {/* Header */}
        <div className="bg-brand-navy p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center">
              <User className="text-navy" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-black uppercase tracking-tight">New Customer Profile</h2>
              <p className="text-[10px] font-mono text-brand-gold uppercase tracking-widest">C0001 Pattern Active › CRM Ready</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Section: Basic Identity */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-navy/30 uppercase tracking-widest flex items-center gap-2">
              <User size={12} /> Personal Identity
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-navy/50 uppercase mb-1.5 ml-1">Full Name *</label>
                <input 
                  type="text" 
                  className="w-full bg-white border-2 border-navy/5 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-brand-gold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-navy/50 uppercase mb-1.5 ml-1">Mobile Phone *</label>
                <input 
                  type="tel" 
                  className="w-full bg-white border-2 border-navy/5 rounded-xl py-3 px-4 text-sm font-mono font-black outline-none focus:border-brand-gold"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-navy/50 uppercase mb-1.5 ml-1">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-white border-2 border-navy/5 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-brand-gold"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Section: Location */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-navy/30 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={12} /> Address & GST
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-navy/50 uppercase mb-1.5 ml-1">GSTIN Number</label>
                <input 
                  type="text" 
                  maxLength={15}
                  placeholder="27XXXXX..."
                  className="w-full bg-white border-2 border-navy/5 rounded-xl py-3 px-4 text-sm font-mono font-black outline-none focus:border-brand-gold uppercase"
                  value={formData.gstin}
                  onChange={(e) => setFormData({...formData, gstin: e.target.value.toUpperCase()})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-navy/50 uppercase mb-1.5 ml-1">City</label>
                <input 
                  type="text" 
                  className="w-full bg-white border-2 border-navy/5 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-brand-gold"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-navy/50 uppercase mb-1.5 ml-1">Pincode</label>
                <input 
                  type="text" 
                  maxLength={6}
                  className="w-full bg-white border-2 border-navy/5 rounded-xl py-3 px-4 text-sm font-mono font-black outline-none focus:border-brand-gold"
                  value={formData.pincode}
                  onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Section: Commercials */}
          <div className="bg-brand-gold/5 rounded-[32px] p-8 border border-brand-gold/20 space-y-6">
            <h3 className="text-[10px] font-black text-brand-gold uppercase tracking-widest flex items-center gap-2">
              <CreditCard size={12} /> Credit & Pricing
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-navy/50 uppercase mb-1.5 ml-1">Credit Limit (Rupees)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30 text-xs">₹</span>
                  <input 
                    type="number" 
                    className="w-full bg-white border-none rounded-xl py-3 pl-8 pr-4 text-sm font-mono font-black outline-none focus:ring-2 focus:ring-brand-gold"
                    value={formData.credit_limit_rupees}
                    onChange={(e) => setFormData({...formData, credit_limit_rupees: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-navy/50 uppercase mb-1.5 ml-1">Price Group (Loyalty Level)</label>
                <select 
                  className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm font-black outline-none focus:ring-2 focus:ring-brand-gold"
                  value={formData.price_group_id}
                  onChange={(e) => setFormData({...formData, price_group_id: e.target.value})}
                >
                  <option value="">-- Choose Level --</option>
                  {priceGroups.map(pg => (
                    <option key={pg.id} value={pg.id}>{pg.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-navy/5 flex gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl font-black text-xs uppercase text-navy/40 hover:bg-navy/5 transition-all"
          >
            Discard [Esc]
          </button>
          <button 
            disabled={saveMutation.isPending || !formData.name || !formData.phone}
            onClick={() => saveMutation.mutate(formData)}
            className="flex-[2] py-3.5 bg-brand-navy text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-navy/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saveMutation.isPending ? 'Registering...' : 'Save Profile [F10]'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
