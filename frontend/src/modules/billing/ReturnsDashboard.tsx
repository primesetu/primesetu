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
import { RotateCcw, Search, User, FileText, Banknote, ShieldAlert, BadgeIndianRupee } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { api } from '@/api/client';

export default function ReturnsDashboard() {
  const { t } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [advances, setAdvances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Search customers
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      // universalSearch handles customers as well if it's the global lookup
      const res = await api.catalogue.universalSearch(searchQuery);
      // Filter out only customers
      const filtered = (res || []).filter((item: any) => item.type === 'CUSTOMER' || item.role === 'customer');
      setCustomers(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = async (customer: any) => {
    setSelectedCustomer(customer);
    setCustomers([]);
    setSearchQuery('');
    
    try {
      setLoading(true);
      const cnRes = await api.accounts.getCustomerCreditNotes(customer.id);
      setCreditNotes(cnRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="flex h-full gap-4 p-4">
      {/* ── Left Pane: Customer Search & Selection ── */}
      <div className="w-[350px] shoper-panel flex flex-col bg-navy text-white overflow-hidden shrink-0 relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        <div className="p-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-saffron rounded-xl flex items-center justify-center text-navy shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-black text-gold">Accounts</h2>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Returns & Adjustments</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder="Search Customer (Phone / Name)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-touch bg-white/10 border-2 border-white/20 rounded-xl px-4 pl-12 font-mono text-sm outline-none focus:border-saffron focus:bg-white/20 transition-all text-white placeholder-white/40"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <button type="submit" className="hidden" />
          </form>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2 relative z-10 custom-scrollbar">
          {loading && customers.length === 0 && !selectedCustomer && (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {customers.map((c, i) => (
            <button 
              key={i}
              onClick={() => handleSelectCustomer(c)}
              className="w-full text-left p-4 rounded-xl border-2 border-white/10 hover:border-saffron hover:bg-white/5 transition-all group"
            >
              <div className="font-black text-lg text-white group-hover:text-saffron">{c.name || c.label}</div>
              <div className="text-xs font-mono text-white/50 mt-1">{c.phone || c.id?.substring(0,8)}</div>
            </button>
          ))}

          {!loading && customers.length === 0 && searchQuery && (
             <div className="text-center p-8 text-white/40 font-bold text-sm">No customers found.</div>
          )}
        </div>
      </div>

      {/* ── Right Pane: Ledger & Credit Notes ── */}
      <div className="flex-1 shoper-panel bg-white flex flex-col overflow-hidden">
        {selectedCustomer ? (
          <>
            <div className="p-6 border-b border-border bg-cream/30 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-gold text-2xl font-black">
                  {selectedCustomer.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-navy">{selectedCustomer.name || selectedCustomer.label}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs font-bold text-muted uppercase tracking-widest">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {selectedCustomer.phone || 'No Phone'}</span>
                  </div>
                </div>
              </div>
              
              <button className="btn-pay h-touch px-8 gap-2 bg-rose-600 hover:bg-rose-700 text-white border-b-4 border-rose-800 shadow-rose-600/30">
                <RotateCcw className="w-5 h-5" /> Initiate Return [F4]
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 bg-cream/10 custom-scrollbar">
              <h4 className="text-lg font-black text-navy uppercase tracking-widest flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-saffron" /> Active Credit Notes
              </h4>

              {loading ? (
                <div className="flex justify-center p-10"><div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" /></div>
              ) : creditNotes.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  {creditNotes.map((cn, idx) => (
                    <div key={idx} className="bg-white border-2 border-border rounded-2xl p-6 shadow-sm hover:border-navy hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-saffron/10 rounded-full group-hover:scale-150 transition-all duration-500 ease-out" />
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Note Number</div>
                          <div className="font-mono text-lg font-bold text-navy">{cn.note_no}</div>
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Active
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-border flex justify-between items-end relative z-10">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Valid Until</div>
                          <div className="font-bold text-sm text-gray-600">
                            {new Date(cn.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Available Balance</div>
                          <div className="text-2xl font-black text-navy">{formatCurrency(cn.balance)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-border rounded-3xl bg-white">
                  <ShieldAlert className="w-16 h-16 text-muted mb-4" />
                  <h5 className="text-xl font-black text-navy mb-2">No Active Credit Notes</h5>
                  <p className="text-sm font-bold text-muted">This customer has no outstanding returns or unadjusted balances.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-cream/10 text-center p-10">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl shadow-navy/5 mb-6">
              <BadgeIndianRupee className="w-16 h-16 text-saffron" />
            </div>
            <h3 className="text-3xl font-serif font-black text-navy mb-3">Sovereign Ledger</h3>
            <p className="text-muted font-bold max-w-md mx-auto leading-relaxed">
              Search and select a customer from the left panel to view their active Credit Notes, Returns History, and Advance Deposits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
