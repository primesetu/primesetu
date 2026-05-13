/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * ============================================================ */
import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { 
  Plus, Search, Save, Trash2, User, 
  MapPin, Phone, CreditCard, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VendorMaster() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    descr: '',
    addr1: '',
    addr2: '',
    city: '',
    pincode: '',
    phone: '',
    email: '',
    gstin: '',
    creditdays: 0,
    active: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.legacy.getData('vendors');
      setVendors(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await api.legacy.saveMaster('vendors', formData);
      setIsFormOpen(false);
      fetchData();
    } catch (e) { alert("Failed to save vendor"); }
  };

  const filtered = vendors.filter(v => 
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-surface text-foreground font-sans">
      {/* Header */}
      <div className="flex-shrink-0 h-20 border-b border-outline-variant px-8 flex items-center justify-between bg-surface-container/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <User className="text-emerald-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Vendor Manager</h1>
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Manage Suppliers & Partners</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={14} />
            <input 
              type="text" 
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-64 pl-10 pr-4 bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs font-bold uppercase transition-all"
            />
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="h-10 px-6 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus size={14} />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((vendor, idx) => (
              <div 
                key={idx}
                className="group bg-surface-container/50 border border-outline-variant p-6 hover:border-emerald-500/50 hover:bg-surface-container transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-black text-emerald-500 uppercase">{vendor.code}</span>
                    <h3 className="text-lg font-black uppercase tracking-tight">{vendor.name || vendor.descr}</h3>
                  </div>
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="text-emerald-500" size={20} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs font-bold text-outline">
                    <MapPin size={14} className="mt-0.5" />
                    <span>{vendor.city}, {vendor.pincode || 'No Pin'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-outline">
                    <Phone size={14} />
                    <span>{vendor.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-outline">
                    <CreditCard size={14} />
                    <span>Credit: {vendor.creditdays} Days</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-outline-variant flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase text-outline">Active Supplier</span>
                  </div>
                  <button className="text-outline hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-surface border border-outline-variant shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant pb-4">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-emerald-500">Register New Vendor</h3>
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Onboard a new supplier to the ecosystem</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-outline hover:text-white">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-outline">Vendor Code (Unique)</label>
                <input 
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant focus:border-emerald-500 outline-none text-xs font-bold uppercase"
                  placeholder="e.g. VEND001"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-outline">Vendor Name</label>
                <input 
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant focus:border-emerald-500 outline-none text-xs font-bold"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-outline">Address Line 1</label>
              <input 
                className="w-full h-11 px-4 bg-surface-container border border-outline-variant focus:border-emerald-500 outline-none text-xs font-bold"
                value={formData.addr1}
                onChange={(e) => setFormData({...formData, addr1: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-outline">City</label>
                <input 
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant focus:border-emerald-500 outline-none text-xs font-bold"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-outline">GSTIN</label>
                <input 
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant focus:border-emerald-500 outline-none text-xs font-mono font-bold uppercase"
                  placeholder="00AAAAA0000A1Z0"
                  value={formData.gstin}
                  onChange={(e) => setFormData({...formData, gstin: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-outline">Credit Days</label>
                <input 
                  type="number"
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant focus:border-emerald-500 outline-none text-xs font-bold"
                  value={formData.creditdays}
                  onChange={(e) => setFormData({...formData, creditdays: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setIsFormOpen(false)}
                className="flex-1 h-12 border border-outline-variant text-[10px] font-black uppercase hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-[2] h-12 bg-emerald-600 text-white text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
              >
                <Save size={14} />
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
