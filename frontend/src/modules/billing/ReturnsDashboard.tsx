/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState } from 'react';
import { RotateCcw, Search, User, FileText, Banknote, ShieldAlert, BadgeIndianRupee } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { api } from '@/api/client';

export interface CustomerRecord {
  id: string;
  name?: string;
  label?: string;
  phone?: string;
  type?: string;
  role?: string;
}

export interface CreditNote {
  note_no: string;
  balance: number;
  expiry: string;
}

export interface AdvanceRecord {
  id: string;
  amount: number;
}

export default function ReturnsDashboard() {
  const { t } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [advances, setAdvances] = useState<AdvanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // ── RETURN WORKFLOW STATE ──
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [billSearch, setBillSearch] = useState('');
  const [billResults, setBillResults] = useState<any[]>([]);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [returnItems, setReturnItems] = useState<any[]>([]);

  // Search customers
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      // universalSearch handles customers as well if it's the global lookup
      const res = await api.catalogue.universalSearch(searchQuery);
      // Filter out only customers
      const filtered = (res || []).filter((item: CustomerRecord) => item.type === 'CUSTOMER' || item.role === 'customer');
      setCustomers(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = async (customer: CustomerRecord) => {
    setSelectedCustomer(customer);
    setCustomers([]);
    setSearchQuery('');
    
    try {
      setLoading(true);
      const cnRes = await api.accounts.getCustomerCreditNotes(customer.id);
      // Map paise to rupees for UI
      setCreditNotes(cnRes?.map((cn: any) => ({
        note_no: cn.note_no,
        balance: cn.balance_paise / 100,
        expiry: cn.expiry_date || '2099-12-31'
      })) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBillSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billSearch.trim()) return;
    try {
      setLoading(true);
      const res = await api.billing.getBill(billSearch);
      setBillResults(res || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleProcessReturn = async () => {
    if (!selectedCustomer || returnItems.length === 0) return;
    
    const returnTotal = returnItems.reduce((acc, item) => acc + (item.net_amount * (item.return_qty || 0)), 0);
    
    try {
      setLoading(true);
      await api.accounts.issueCreditNote({
        customer_id: selectedCustomer.id,
        sale_id: selectedBill.id,
        amount_paise: returnTotal,
        items: returnItems.filter(i => (i.return_qty || 0) > 0)
      });
      alert("Credit Note Issued Successfully!");
      setIsReturnMode(false);
      setSelectedBill(null);
      setReturnItems([]);
      // Refresh customer data
      handleSelectCustomer(selectedCustomer);
    } catch (err) { alert("Failed to issue credit note."); }
    finally { setLoading(false); }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="flex h-full gap-4 p-4">
      {/* ── Left Pane: Customer Search & Selection ── */}
      <div className="w-[350px] shoper-panel flex flex-col bg-brand-navy text-white overflow-hidden shrink-0 relative">
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
      <div className="flex-1 shoper-panel bg-bg-base flex flex-col overflow-hidden">
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
            </div>
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="flex justify-center p-10"><div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" /></div>
              ) : isReturnMode ? (
                /* ── RETURN WORKFLOW UI ── */
                <div className="space-y-6">
                   {!selectedBill ? (
                     <div className="bg-bg-float border-2 border-border rounded-2xl p-8">
                        <h5 className="text-xl font-black text-navy mb-4">Find Original Bill</h5>
                        <form onSubmit={handleBillSearch} className="flex gap-4">
                           <input 
                             className="flex-1 h-touch bg-white border border-border rounded-xl px-6 font-mono text-lg outline-none focus:border-brand-navy"
                             placeholder="Enter Bill Number..."
                             value={billSearch}
                             onChange={e => setBillSearch(e.target.value)}
                           />
                           <button type="submit" className="btn-pay px-8 bg-navy text-white">SEARCH</button>
                        </form>

                        <div className="mt-8 space-y-3">
                           {billResults.map(b => (
                             <button 
                               key={b.id}
                               onClick={() => {
                                 setSelectedBill(b);
                                 setReturnItems(b.items.map((i: any) => ({ ...i, return_qty: 0 })));
                               }}
                               className="w-full flex justify-between items-center p-4 rounded-xl border border-border hover:bg-cream/20"
                             >
                                <div className="text-left">
                                   <div className="font-black text-navy uppercase">{b.bill_no}</div>
                                   <div className="text-xs font-bold text-muted">{new Date(b.created_at).toLocaleDateString()}</div>
                                </div>
                                <div className="font-mono font-black text-navy">₹{b.net_payable / 100}</div>
                             </button>
                           ))}
                        </div>
                     </div>
                   ) : (
                     <div className="bg-bg-float border-2 border-border rounded-2xl overflow-hidden">
                        <div className="p-6 bg-navy text-white flex justify-between items-center">
                           <div>
                              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Bill Items for Return</div>
                              <div className="text-lg font-serif font-black">{selectedBill.bill_no}</div>
                           </div>
                           <button onClick={() => setSelectedBill(null)} className="text-xs font-black uppercase opacity-60 hover:opacity-100">Change Bill</button>
                        </div>
                        <div className="p-6">
                           <table className="w-full text-left">
                              <thead className="text-[10px] font-black uppercase text-muted border-b border-border">
                                 <tr>
                                    <th className="py-3">Stock No</th>
                                    <th>Item Name</th>
                                    <th className="text-right">Qty Sold</th>
                                    <th className="text-right">Return Qty</th>
                                    <th className="text-right">Return Val</th>
                                 </tr>
                              </thead>
                              <tbody className="text-sm font-bold text-navy">
                                 {returnItems.map((item, idx) => (
                                   <tr key={idx} className="border-b border-border/50">
                                      <td className="py-4 font-mono">{item.stock_no}</td>
                                      <td>{item.item_name}</td>
                                      <td className="text-right font-mono">{item.qty}</td>
                                      <td className="text-right">
                                         <input 
                                           type="number"
                                           max={item.qty}
                                           className="w-20 bg-cream/30 border border-border rounded-lg p-2 text-right outline-none focus:border-brand-navy"
                                           value={item.return_qty}
                                           onChange={e => {
                                             const val = Math.min(item.qty, parseInt(e.target.value) || 0);
                                             setReturnItems(prev => prev.map((it, i) => i === idx ? { ...it, return_qty: val } : it));
                                           }}
                                         />
                                      </td>
                                      <td className="text-right font-mono text-rose-600">
                                         ₹{(item.net_amount * (item.return_qty || 0)) / 100}
                                      </td>
                                   </tr>
                                 ))}
                              </tbody>
                           </table>

                           <div className="mt-8 flex justify-between items-center bg-rose-50 p-6 rounded-2xl border border-rose-100">
                              <div>
                                 <div className="text-[10px] font-black uppercase tracking-widest text-rose-600">Total Credit Amount</div>
                                 <div className="text-3xl font-black text-navy">
                                    ₹{returnItems.reduce((acc, i) => acc + (i.net_amount * (i.return_qty || 0)), 0) / 100}
                                 </div>
                              </div>
                              <div className="flex gap-4">
                                 <button onClick={() => setIsReturnMode(false)} className="px-8 py-3 font-black uppercase text-muted hover:text-navy">CANCEL</button>
                                 <button onClick={handleProcessReturn} className="btn-pay px-8 bg-rose-600 text-white shadow-rose-600/20">ISSUE CREDIT NOTE</button>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              ) : creditNotes.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  {creditNotes.map((cn, idx) => (
                    <div key={idx} className="bg-bg-float border-2 border-border rounded-2xl p-6 shadow-sm hover:border-brand-navy hover:shadow-xl transition-all group relative overflow-hidden">
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
                <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-border rounded-3xl bg-bg-float">
                  <ShieldAlert className="w-16 h-16 text-muted mb-4" />
                  <h5 className="text-xl font-black text-navy mb-2">No Active Credit Notes</h5>
                  <p className="text-sm font-bold text-muted">This customer has no outstanding returns or unadjusted balances.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-cream/10 text-center p-10">
            <div className="w-32 h-32 bg-bg-float rounded-full flex items-center justify-center shadow-xl shadow-navy/5 mb-6">
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




