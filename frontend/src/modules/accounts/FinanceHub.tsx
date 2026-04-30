/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  Box
} from 'lucide-react';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';
import { 
  Button, 
  Card, 
  Text, 
  Badge,
  DataTable 
} from '@/components/ui/SovereignUI';

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
      const blob = new Blob([res.xml], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename;
      a.click();
    } catch (err) {
      alert('Accounting Export Failed');
    }
  };

  // ── HSN COLUMNS ──
  const columns = useMemo(() => [
    {
      header: "HSN / SAC CODE",
      accessor: (row: any) => <span className="font-mono font-black text-navy uppercase tracking-tighter">{row.hsn}</span>,
      width: 150,
      pinned: 'left' as const
    },
    {
      header: "SERVICE DESCRIPTION",
      accessor: 'description',
      flex: 2,
      className: 'text-[11px] font-black text-navy/60 uppercase tracking-tight'
    },
    {
      header: "GST RATE",
      accessor: (row: any) => <Badge variant="info" className="bg-navy/5 text-navy font-black border-none">{row.rate}%</Badge>,
      width: 120,
      className: 'text-center'
    },
    {
      header: "TAXABLE VALUE",
      accessor: (row: any) => <span className="font-black text-navy">{formatCurrency(row.taxable_val)}</span>,
      width: 160,
      className: 'text-right'
    },
    {
      header: "CGST",
      accessor: (row: any) => <span className="font-black text-emerald-600">{formatCurrency(row.cgst)}</span>,
      width: 130,
      className: 'text-right'
    },
    {
      header: "SGST",
      accessor: (row: any) => <span className="font-black text-emerald-600">{formatCurrency(row.sgst)}</span>,
      width: 130,
      className: 'text-right',
      pinned: 'right' as const
    }
  ], []);

  return (
    <div className="flex flex-col h-full bg-navy/2 p-12 gap-12 animate-in fade-in duration-1000 overflow-auto">
      {/* ── HEADER ── */}
      <div className="flex justify-between items-center bg-white p-12 rounded-[4rem] shadow-sm border border-navy/5">
        <div className="flex items-center gap-8">
           <div className="h-20 w-20 bg-navy rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-navy/20">
              <TrendingUp className="w-10 h-10 text-brand-gold" />
           </div>
           <div>
             <Text variant="h1" className="font-serif font-black text-navy uppercase tracking-tighter leading-none">Finance Hub</Text>
             <Text variant="xs" className="text-navy/30 font-black uppercase tracking-[0.4em] mt-3">GSTR-1 Reconciliation · Institutional Accounting Bridge · Sovereign v3</Text>
           </div>
        </div>

        <div className="flex gap-4 p-2 bg-navy/5 rounded-[2rem]">
           <button onClick={() => setActiveTab('gst')} className={`px-10 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'gst' ? 'bg-navy text-white shadow-2xl' : 'text-navy/40 hover:bg-navy/10'}`}>GSTR-1 Summary</button>
           <button onClick={() => setActiveTab('tally')} className={`px-10 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tally' ? 'bg-navy text-white shadow-2xl' : 'text-navy/40 hover:bg-navy/10'}`}>Accounting Bridge</button>
        </div>
      </div>

      {activeTab === 'gst' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="bg-navy text-white p-10 rounded-[3rem] border-none shadow-2xl relative overflow-hidden group">
               <div className="absolute right-0 top-0 opacity-10 rotate-12 -translate-y-4 group-hover:scale-110 transition-transform duration-1000">
                  <BarChart3 size={160} />
               </div>
               <Text variant="xs" className="font-black text-white/40 uppercase tracking-widest mb-6 block">Total Taxable Value</Text>
               <Text variant="h1" className="text-4xl font-black">{formatCurrency(850000)}</Text>
               <div className="mt-8 flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                 <ArrowUpRight size={14} className="animate-bounce" /> +12.4% vs Prev Period
               </div>
            </Card>
            <Card className="bg-white p-10 rounded-[3rem] border-none shadow-xl">
               <Text variant="xs" className="font-black text-navy/30 uppercase tracking-widest mb-6 block">Output CGST</Text>
               <Text variant="h1" className="text-4xl font-black text-navy">{formatCurrency(60300)}</Text>
            </Card>
            <Card className="bg-white p-10 rounded-[3rem] border-none shadow-xl">
               <Text variant="xs" className="font-black text-navy/30 uppercase tracking-widest mb-6 block">Output SGST</Text>
               <Text variant="h1" className="text-4xl font-black text-navy">{formatCurrency(60300)}</Text>
            </Card>
            <Card className="bg-brand-gold text-navy p-10 rounded-[3rem] border-none shadow-2xl">
               <Text variant="xs" className="font-black text-navy/40 uppercase tracking-widest mb-6 block">Total Tax Liability</Text>
               <Text variant="h1" className="text-4xl font-black">{formatCurrency(120600)}</Text>
            </Card>
          </div>

          {/* HSN Summary Table */}
          <Card className="rounded-[4.5rem] bg-white border-none shadow-2xl overflow-hidden flex flex-col relative">
            <div className="px-12 py-10 border-b border-navy/5 flex justify-between items-center bg-navy text-white">
               <div className="flex items-center gap-4">
                  <ShieldCheck size={24} className="text-brand-gold" />
                  <Text variant="xs" className="font-black uppercase tracking-[0.4em]">HSN / SAC Wise Summary (GSTR-1 Protocol)</Text>
               </div>
               <Button variant="sec" className="h-12 px-6 rounded-xl bg-white/10 text-white border-none hover:bg-white/20 font-black text-[10px] uppercase tracking-widest gap-2">
                 <FileSpreadsheet size={16} /> Export Excel
               </Button>
            </div>
            <div className="h-[450px]">
               <DataTable 
                 data={gstrData} 
                 columns={columns} 
                 loading={loading}
                 overlayNoRowsTemplate={`
                   <div class="flex flex-col items-center justify-center opacity-10 h-full">
                      <Box size="60" class="mb-4" />
                      <div class="text-xs font-black uppercase tracking-[0.4em]">Accounting Ledger is Empty</div>
                   </div>
                 `}
               />
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'tally' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-12 bg-white rounded-[5rem] shadow-2xl border border-navy/5">
          <div className="w-40 h-40 bg-navy text-white rounded-[3rem] flex items-center justify-center shadow-2xl relative group">
             <Globe className="w-20 h-20 text-brand-gold group-hover:rotate-45 transition-transform duration-1000" />
             <div className="absolute -right-3 -top-3 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center border-8 border-white shadow-xl">
               <Zap size={20} className="text-white animate-pulse" />
             </div>
          </div>
          
          <div className="max-w-2xl">
            <Text variant="h1" className="text-5xl font-black text-navy uppercase tracking-tighter mb-6">Institutional Bridge</Text>
            <Text variant="xs" className="text-navy/40 font-black uppercase tracking-widest leading-relaxed">
              Export institutional vouchers directly to accounting. SMRITI-OS handles all ledger mapping, tax reconciliation, and voucher numbering automatically through the Sovereign Protocol.
            </Text>
          </div>

          <div className="flex gap-8">
             <Button onClick={handleTallyExport} className="h-20 px-16 rounded-3xl bg-navy text-white shadow-2xl font-black text-[10px] uppercase tracking-[0.3em] gap-4 group">
               <Download size={24} className="text-brand-gold group-hover:translate-y-1 transition-transform" />
               Generate Accounting XML
             </Button>
             <Button variant="sec" className="h-20 px-16 rounded-3xl border-navy/5 bg-navy/5 text-navy font-black text-[10px] uppercase tracking-[0.3em] gap-4">
               <FileText size={24} className="text-navy/30" />
               View Export Log
             </Button>
          </div>

          <Card className="mt-12 px-12 py-8 bg-navy/2 rounded-[2.5rem] border border-navy/5 flex items-center gap-16 shadow-inner">
             <div className="text-left">
               <Text variant="xs" className="font-black text-navy/20 uppercase tracking-widest mb-2">Protocol Signature</Text>
               <Text variant="sm" className="font-black text-navy uppercase">Last Export: 24 APR 2026</Text>
             </div>
             <div className="w-px h-12 bg-navy/10"></div>
             <div className="text-left">
               <Text variant="xs" className="font-black text-navy/20 uppercase tracking-widest mb-2">Audit Status</Text>
               <Badge variant="info" className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px]">42 NEW VOUCHERS READY</Badge>
             </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
