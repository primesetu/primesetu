/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState } from 'react';
import { Truck, Search, Plus, Edit2, Trash2, Globe, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VendorMaster() {
  const [search, setSearch] = useState('');
  
  // Placeholder data - in Phase 3+ this hits api.catalogue.vendors
  const vendors = [
    { id: 'V001', name: 'Luxe Leather Co.', contact: '9888877777', email: 'orders@luxeleather.com', location: 'Kanpur', category: 'Footwear' },
    { id: 'V002', name: 'Metro Soles Pvt Ltd', contact: '9922233344', email: 'sales@metrosoles.in', location: 'Mumbai', category: 'Accessories' },
    { id: 'V003', name: 'Urban Threads', contact: '9000011122', email: 'hi@urbanthreads.co', location: 'Delhi', category: 'Apparel' },
  ].filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black text-navy flex items-center gap-3">
            <Truck className="w-8 h-8 text-amber-500" />
            Vendor Network
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Sovereign Supply Chain Management</p>
        </div>
        <button className="bg-navy text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-widest shadow-xl hover:bg-navy/90 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-400" /> ONBOARD NEW VENDOR
        </button>
      </div>

      <div className="glass p-4 rounded-2xl flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search Vendor Name, ID or Location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-cream/50 border border-border rounded-xl text-sm font-bold outline-none focus:border-navy focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <motion.div 
            key={vendor.id}
            whileHover={{ y: -5 }}
            className="glass p-6 rounded-[2rem] border border-white shadow-xl relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button className="p-2 bg-white rounded-lg shadow-sm text-navy hover:text-amber-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
              <button className="p-2 bg-white rounded-lg shadow-sm text-rose-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-navy leading-tight">{vendor.name}</h3>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{vendor.id} · {vendor.category}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                <Phone className="w-3.5 h-3.5 text-navy/30" /> {vendor.contact}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                <Mail className="w-3.5 h-3.5 text-navy/30" /> {vendor.email}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                <Globe className="w-3.5 h-3.5 text-navy/30" /> {vendor.location}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-[9px] font-black text-muted uppercase tracking-widest">Active Ledger</span>
              <button className="text-[10px] font-black text-navy hover:text-amber-600 uppercase tracking-widest flex items-center gap-1 transition-colors">
                View History <Globe className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
