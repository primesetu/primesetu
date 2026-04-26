/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * Finance Hub (GSTR-1 & Tally Bridge)
 * Tesla Style Reporting
 * ============================================================ */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  Globe,
  RefreshCw,
  Search
} from 'lucide-react';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';

export default function FinanceHub() {
  const [gstrData, setGstrData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gst' | 'tally' | 'advances'>('gst');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.accounts.getGSTR1Summary();
      setGstrData(data);
    } catch (err) {
      console.error('Finance data fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTallyExport = async () => {
    try {
      const res = await api.accounts.generateTallyXML();
      // Logic to trigger download
      const blob = new Blob([res.xml], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename;
      a.click();
    } catch (err) {
      alert('Tally Export Failed');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-12 gap-12 animate-in fade-in duration-700 overflow-auto">
      {/* ── HEADER ── */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="px-3 py-1 bg-brand-navy text-brand-gold text-[9px] font-black uppercase tracking-[0.2em] rounded-md">Institutional Accounts</div>
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <h1 className="text-5xl font-black text-navy tracking-tighter" style={{ fontFamily: 'var(--font-tesla)' }}>Finance Hub</h1>
          <p className="text-xs text-navy/40 font-bold uppercase tracking-widest mt-4">GSTR-1 Reconciliation · Tally Bridge · Ledger Management</p>
        </div>

        <div className="flex gap-4">
           <button onClick={() => setActiveTab('gst')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'gst' ? 'bg-navy text-white shadow-xl' : 'bg-navy/5 text-navy/40 hover:bg-navy/10'}`}>GSTR-1 Summary</button>
           <button onClick={() => setActiveTab('tally')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tally' ? 'bg-navy text-white shadow-xl' : 'bg-navy/5 text-navy/40 hover:bg-navy/10'}`}>Tally Bridge</button>
        </div>
      </div>

      {activeTab === 'gst' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="tesla-card bg-navy text-white p-10">
               <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Total Taxable Value</div>
               <div className="text-4xl font-black">{formatCurrency(850000)}</div>
               <div className="mt-6 flex items-center gap-2 text-emerald-400 text-[10px] font-black">
                 <ArrowUpRight size={14} /> +12.4% vs Prev Month
               </div>
            </div>
            <div className="tesla-card bg-white border border-navy/5 p-10">
               <div className="text-[10px] font-black text-navy/30 uppercase tracking-widest mb-6">Output CGST</div>
               <div className="text-4xl font-black text-navy">{formatCurrency(60300)}</div>
            </div>
            <div className="tesla-card bg-white border border-navy/5 p-10">
               <div className="text-[10px] font-black text-navy/30 uppercase tracking-widest mb-6">Output SGST</div>
               <div className="text-4xl font-black text-navy">{formatCurrency(60300)}</div>
            </div>
            <div className="tesla-card bg-brand-gold text-navy p-10">
               <div className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-6">Total Tax Liability</div>
               <div className="text-4xl font-black">{formatCurrency(120600)}</div>
            </div>
          </div>

          {/* HSN Summary Table */}
          <div className="tesla-card bg-white border border-navy/5 overflow-hidden">
            <div className="p-8 border-b border-navy/5 flex justify-between items-center bg-navy/[0.02]">
               <h3 className="text-xs font-black text-navy uppercase tracking-[0.3em]">HSN / SAC Wise Summary (GSTR-1)</h3>
               <button className="flex items-center gap-2 text-[10px] font-black text-navy/40 hover:text-navy uppercase tracking-widest">
                 <FileSpreadsheet size={16} /> Export Excel
               </button>
            </div>
            <table className="w-full text-left">
               <thead>
                 <tr className="text-[9px] font-black text-navy/30 uppercase tracking-[0.2em]">
                   <th className="px-8 py-6">HSN Code</th>
                   <th className="px-8 py-6">Description</th>
                   <th className="px-8 py-6 text-center">Rate (%)</th>
                   <th className="px-8 py-6 text-right">Taxable Val</th>
                   <th className="px-8 py-6 text-right">CGST</th>
                   <th className="px-8 py-6 text-right">SGST</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-navy/5">
                 {gstrData.map((row, i) => (
                   <tr key={i} className="hover:bg-brand-cream transition-all group">
                     <td className="px-8 py-6 font-mono font-black text-navy">{row.hsn}</td>
                     <td className="px-8 py-6 text-[11px] font-bold text-navy/60 uppercase">{row.description}</td>
                     <td className="px-8 py-6 text-center"><span className="px-3 py-1 bg-navy/5 rounded-lg text-[10px] font-black text-navy">{row.rate}%</span></td>
                     <td className="px-8 py-6 text-right font-black text-navy">{formatCurrency(row.taxable_val)}</td>
                     <td className="px-8 py-6 text-right font-black text-emerald-600">{formatCurrency(row.cgst)}</td>
                     <td className="px-8 py-6 text-right font-black text-emerald-600">{formatCurrency(row.sgst)}</td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'tally' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-10">
          <div className="w-32 h-32 bg-navy text-white rounded-[40px] flex items-center justify-center shadow-2xl relative">
             <Globe className="w-16 h-16 text-brand-gold animate-pulse" />
             <div className="absolute -right-2 -top-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white">
               <Zap size={16} className="text-white" />
             </div>
          </div>
          
          <div>
            <h2 className="text-4xl font-black text-navy tracking-tighter mb-4" style={{ fontFamily: 'var(--font-tesla)' }}>Tally ERP Bridge</h2>
            <p className="text-sm text-navy/40 font-bold uppercase tracking-widest max-w-lg leading-relaxed">
              Export institutional vouchers directly to Tally. PrimeSetu handles all ledger mapping, tax reconciliation, and voucher numbering automatically.
            </p>
          </div>

          <div className="flex gap-6 mt-6">
             <button onClick={handleTallyExport} className="tesla-button px-12 py-6 bg-navy text-white flex items-center gap-4">
               <Download size={20} className="text-brand-gold" />
               Generate Tally XML
             </button>
             <button className="tesla-button px-12 py-6 bg-white text-navy border-navy/10 flex items-center gap-4">
               <FileText size={20} className="text-navy/40" />
               View Export Log
             </button>
          </div>

          <div className="mt-12 p-8 bg-navy/5 rounded-[2.5rem] border border-navy/5 flex items-center gap-10">
             <div className="text-left">
               <div className="text-[9px] font-black text-navy/20 uppercase tracking-widest mb-1">Last Export</div>
               <div className="text-xs font-black text-navy">24 APR 2026, 18:30</div>
             </div>
             <div className="w-px h-10 bg-navy/10"></div>
             <div className="text-left">
               <div className="text-[9px] font-black text-navy/20 uppercase tracking-widest mb-1">Vouchers Ready</div>
               <div className="text-xs font-black text-emerald-600">42 NEW VOUCHERS</div>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
