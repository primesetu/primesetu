/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState } from 'react';
import { 
  Store, 
  UserPlus, 
  MapPin, 
  Phone, 
  Hash, 
  ShieldCheck, 
  ChevronRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';

const StoreOnboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    store_name: '',
    store_code: '',
    address: '',
    gstin: '',
    phone: '',
    state_code: '',
    admin_email: '',
    admin_password: '',
    admin_full_name: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.onboarding.registerStore(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register store. Please check the details and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center animate-fadeUp">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-black text-navy uppercase tracking-tighter">Onboarding Successful</h2>
          <p className="text-sm text-navy/60">Store "{formData.store_name}" is now provisioned and ready.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-8 py-3 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-navy/90 transition-all shadow-xl shadow-navy/20"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tighter mb-2">Store Onboarding</h1>
        <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em]">Institutional Deployment Registry</p>
      </header>

      {/* Progress Path */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {[1, 2].map((s) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${step >= s ? 'text-navy' : 'text-navy/20'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-[10px] ${step === s ? 'border-navy bg-navy text-white' : step > s ? 'border-navy bg-white text-navy' : 'border-navy/10 bg-transparent'}`}>
                {s === 1 ? <Store size={14} /> : <UserPlus size={14} />}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">
                {s === 1 ? 'Store Details' : 'Admin User'}
              </span>
            </div>
            {s < 2 && <div className={`w-12 h-px ${step > s ? 'bg-navy' : 'bg-navy/10'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-10 shadow-2xl shadow-navy/5 relative overflow-hidden">
        {/* Sovereign watermark */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none select-none">
          <Store size={200} />
        </div>

        <form onSubmit={handleSubmit} className="relative z-10">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-navy/50 ml-1">Legal Entity Name</label>
                    <div className="relative group">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-navy transition-colors" size={16} />
                      <input 
                        type="text" 
                        name="store_name"
                        value={formData.store_name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. PrimeSetu flagship"
                        className="w-full bg-white/60 border-2 border-transparent focus:border-navy focus:bg-white px-12 py-3.5 rounded-2xl text-xs font-bold text-navy placeholder:text-navy/20 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-navy/50 ml-1">Store Unit Code</label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-navy transition-colors" size={16} />
                      <input 
                        type="text" 
                        name="store_code"
                        value={formData.store_code}
                        onChange={handleChange}
                        required
                        placeholder="e.g. DEL01"
                        className="w-full bg-white/60 border-2 border-transparent focus:border-navy focus:bg-white px-12 py-3.5 rounded-2xl text-xs font-bold text-navy placeholder:text-navy/20 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-navy/50 ml-1">Compliance GSTIN</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-navy transition-colors" size={16} />
                    <input 
                      type="text" 
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      placeholder="Optional: 15-digit GSTIN"
                      className="w-full bg-white/60 border-2 border-transparent focus:border-navy focus:bg-white px-12 py-3.5 rounded-2xl text-xs font-bold text-navy placeholder:text-navy/20 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-navy/50 ml-1">Business Address</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-4 text-navy/20 group-focus-within:text-navy transition-colors" size={16} />
                    <textarea 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Full operating address"
                      className="w-full bg-white/60 border-2 border-transparent focus:border-navy focus:bg-white px-12 py-3.5 rounded-2xl text-xs font-bold text-navy placeholder:text-navy/20 outline-none transition-all shadow-inner resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-navy/50 ml-1">State Code</label>
                    <input 
                      type="text" 
                      name="state_code"
                      value={formData.state_code}
                      onChange={handleChange}
                      maxLength={2}
                      placeholder="e.g. 07"
                      className="w-full bg-white/60 border-2 border-transparent focus:border-navy focus:bg-white px-4 py-3.5 rounded-2xl text-xs font-bold text-navy placeholder:text-navy/20 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-navy/50 ml-1">Contact Phone</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-navy transition-colors" size={16} />
                      <input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91..."
                        className="w-full bg-white/60 border-2 border-transparent focus:border-navy focus:bg-white px-12 py-3.5 rounded-2xl text-xs font-bold text-navy placeholder:text-navy/20 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={handleNext}
                  disabled={!formData.store_name || !formData.store_code}
                  className="w-full mt-6 bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-navy/90 transition-all shadow-xl shadow-navy/20 disabled:opacity-20"
                >
                  Configure Admin User <ChevronRight size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-navy/50 ml-1">Administrator Full Name</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-navy transition-colors" size={16} />
                    <input 
                      type="text" 
                      name="admin_full_name"
                      value={formData.admin_full_name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. John Doe"
                      className="w-full bg-white/60 border-2 border-transparent focus:border-navy focus:bg-white px-12 py-3.5 rounded-2xl text-xs font-bold text-navy placeholder:text-navy/20 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-navy/50 ml-1">Admin Access Email</label>
                  <div className="relative group">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-navy transition-colors" size={16} />
                    <input 
                      type="email" 
                      name="admin_email"
                      value={formData.admin_email}
                      onChange={handleChange}
                      required
                      placeholder="admin@store.com"
                      className="w-full bg-white/60 border-2 border-transparent focus:border-navy focus:bg-white px-12 py-3.5 rounded-2xl text-xs font-bold text-navy placeholder:text-navy/20 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-navy/50 ml-1">Secure Credentials</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-navy transition-colors" size={16} />
                    <input 
                      type="password" 
                      name="admin_password"
                      value={formData.admin_password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/60 border-2 border-transparent focus:border-navy focus:bg-white px-12 py-3.5 rounded-2xl text-xs font-bold text-navy placeholder:text-navy/20 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[10px] font-bold text-rose-500 uppercase tracking-widest leading-relaxed">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button 
                    type="button" 
                    onClick={handleBack}
                    className="bg-white/60 text-navy/60 text-[10px] font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-white transition-all shadow-inner"
                  >
                    Back to Store
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading || !formData.admin_email || !formData.admin_password}
                    className="bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-navy/90 transition-all shadow-xl shadow-navy/20 disabled:opacity-20"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : 'Initialise Sovereign Node'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
      
      <footer className="mt-8 text-center">
        <p className="text-[8px] text-navy/20 uppercase tracking-[0.3em]">Institutional Grade · Sovereignty Guaranteed · PrimeSetu Engine</p>
      </footer>
    </div>
  );
};

export default StoreOnboarding;
