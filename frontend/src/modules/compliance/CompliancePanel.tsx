/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useMemo } from 'react';
import {
  FileText, Download, Shield, CheckCircle2,
  Calendar, Hash, AlertTriangle, Loader2,
  BarChart3, Building2, Users, Receipt,
  ChevronRight,
  Package,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';
import { 
  Button, 
  Input, 
  Select, 
  Label, 
  Card, 
  Text, 
  Badge,
  DataTable 
} from '@/components/ui/SovereignUI';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const CompliancePanel: React.FC = () => {
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const data = await api.compliance.getGstr1(month, year);
      setPreview(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate GSTR-1 return. Verify your store GSTIN in settings.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    setLoading(true);
    try {
      const data = await api.compliance.downloadGstr1Csv(month, year);
      const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `GSTR1_${month.toString().padStart(2,'0')}${year}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('CSV download failed.');
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!preview) return;
    const blob = new Blob([JSON.stringify(preview, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GSTR1_${preview.gstin}_${month.toString().padStart(2,'0')}${year}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const b2bCount = preview?.b2b?.length ?? 0;
  const b2csCount = preview?.b2cs?.length ?? 0;
  const hsnCount = preview?.hsn?.data?.length ?? 0;
  const totalValue = preview?.gt ?? 0;

  // ── B2B COLUMNS ──
  const b2bColumns = useMemo(() => [
    {
      header: "CUSTOMER GSTIN",
      accessor: (item: any) => <span className="font-mono font-black text-navy">{item.ctin}</span>,
      width: 180,
      pinned: 'left' as const
    },
    {
      header: "INVOICE NO",
      accessor: 'inum',
      width: 150,
      className: 'font-black text-navy'
    },
    {
      header: "DATE",
      accessor: 'idt',
      width: 120,
      className: 'text-navy/40 font-black'
    },
    {
      header: "GROSS VALUE",
      accessor: (item: any) => <span className="font-black text-navy">₹{item.val.toLocaleString()}</span>,
      width: 150,
      className: 'text-right'
    },
    {
      header: "TAXABLE",
      accessor: (item: any) => {
         const taxable = item.itms?.reduce((s: number, it: any) => s + it.txval, 0) ?? 0;
         return <span className="text-navy/60 font-black">₹{taxable.toFixed(2)}</span>;
      },
      width: 150,
      className: 'text-right'
    },
    {
      header: "IGST",
      accessor: (item: any) => {
         const igst = item.itms?.reduce((s: number, it: any) => s + it.igst, 0) ?? 0;
         return <span className="text-amber-600 font-black">₹{igst.toFixed(2)}</span>;
      },
      width: 120,
      className: 'text-right'
    },
    {
      header: "CGST",
      accessor: (item: any) => {
         const cgst = item.itms?.reduce((s: number, it: any) => s + it.cgst, 0) ?? 0;
         return <span className="text-indigo-600 font-black">₹{cgst.toFixed(2)}</span>;
      },
      width: 120,
      className: 'text-right'
    },
    {
      header: "SGST",
      accessor: (item: any) => {
         const sgst = item.itms?.reduce((s: number, it: any) => s + it.sgst, 0) ?? 0;
         return <span className="text-emerald-600 font-black">₹{sgst.toFixed(2)}</span>;
      },
      width: 120,
      className: 'text-right',
      pinned: 'right' as const
    }
  ], []);

  // Flatten B2B data for grid
  const flattenedB2B = useMemo(() => {
    if (!preview?.b2b) return [];
    return preview.b2b.flatMap((entry: any) =>
      entry.inv.map((inv: any) => ({
        ...inv,
        ctin: entry.ctin
      }))
    );
  }, [preview]);

  // ── B2CS COLUMNS ──
  const b2csColumns = useMemo(() => [
    { header: "SUPPLY TYPE", accessor: 'sply_ty', width: 150, className: 'font-black text-navy uppercase' },
    { header: "STATE CODE", accessor: 'pos', width: 120, className: 'text-navy/40 font-black' },
    { header: "TAX RATE", accessor: (item: any) => <Badge variant="info" className="bg-navy/5 text-navy font-black">{item.rt}%</Badge>, width: 120, className: 'text-center' },
    { header: "TAXABLE AMT", accessor: (item: any) => <span className="font-black text-navy">₹{item.txval.toFixed(2)}</span>, width: 160, className: 'text-right' },
    { header: "IGST", accessor: (item: any) => <span className="text-amber-600 font-black">₹{item.iamt.toFixed(2)}</span>, width: 130, className: 'text-right' },
    { header: "CGST", accessor: (item: any) => <span className="text-indigo-600 font-black">₹{item.camt.toFixed(2)}</span>, width: 130, className: 'text-right' },
    { header: "SGST", accessor: (item: any) => <span className="text-emerald-600 font-black">₹{item.samt.toFixed(2)}</span>, width: 130, className: 'text-right' }
  ], []);

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-start justify-between">
        <div>
          <Text variant="h1" className="font-serif font-black text-navy uppercase tracking-tighter leading-none">GST Compliance Registry</Text>
          <Text variant="xs" className="font-black text-navy/30 uppercase tracking-[0.4em] mt-3">GSTR-1 · Sovereign Tax Register · IRP Bridge Active</Text>
        </div>
        <Card className="px-6 py-3 bg-emerald-50 border-emerald-100 rounded-2xl flex items-center gap-3">
          <Shield className="text-emerald-500" size={18} />
          <Text variant="xs" className="font-black text-emerald-700 uppercase tracking-widest">GSP Compliant Engine</Text>
        </Card>
      </header>

      <Card className="p-10 rounded-[3rem] bg-white shadow-2xl border-none">
        <Text variant="xs" className="font-black text-navy/30 uppercase tracking-[0.2em] mb-8 block">Return Period Selection</Text>
        <div className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 md:col-span-4 space-y-3">
             <Label className="font-black text-navy/40 uppercase text-[9px] tracking-widest ml-1">Filing Month</Label>
             <Select 
               value={month} 
               onChange={e => setMonth(Number(e.target.value))}
               className="h-14 font-black bg-navy/5 border-none rounded-2xl"
             >
               {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
             </Select>
          </div>
          <div className="col-span-12 md:col-span-4 space-y-3">
             <Label className="font-black text-navy/40 uppercase text-[9px] tracking-widest ml-1">Financial Year</Label>
             <Select 
               value={year} 
               onChange={e => setYear(Number(e.target.value))}
               className="h-14 font-black bg-navy/5 border-none rounded-2xl"
             >
               {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
             </Select>
          </div>
          <div className="col-span-12 md:col-span-4">
             <Button 
               onClick={fetchPreview} 
               disabled={loading}
               className="w-full h-14 bg-navy text-white rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest gap-3"
             >
               {loading ? <RefreshCw className="animate-spin" size={18} /> : <BarChart3 size={18} className="text-brand-gold" />}
               Generate Return Protocol
             </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-8 bg-rose-50 border-rose-100 rounded-3xl flex items-start gap-4">
          <AlertTriangle className="text-rose-500 mt-1" size={24} />
          <div>
            <Text variant="xs" className="font-black text-rose-700 uppercase tracking-widest mb-1">Validation Protocol Failed</Text>
            <Text variant="xs" className="text-rose-600 font-bold leading-relaxed">{error}</Text>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div className="grid grid-cols-4 gap-8">
              {[
                { icon: Receipt, label: 'Gross Revenue', value: `₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'bg-navy text-white' },
                { icon: Building2, label: 'B2B Invoices', value: b2bCount, color: 'bg-white text-navy' },
                { icon: Users, label: 'B2CS Aggregates', value: b2csCount, color: 'bg-white text-navy' },
                { icon: Hash, label: 'HSN DNA Count', value: hsnCount, color: 'bg-white text-navy' },
              ].map((s, i) => (
                <Card key={i} className={`p-8 rounded-[3rem] shadow-xl border-none ${s.color}`}>
                   <s.icon size={20} className="opacity-20 mb-4" />
                   <Text variant="h2" className="font-serif font-black tracking-tighter">{s.value}</Text>
                   <Text variant="xs" className="font-black uppercase tracking-[0.2em] opacity-40 mt-1">{s.label}</Text>
                </Card>
              ))}
            </div>

            <Card className="p-8 bg-white/50 backdrop-blur rounded-[3rem] border-none shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-12">
                 <div>
                    <Text variant="xs" className="font-black text-navy/20 uppercase tracking-widest mb-2">Protocol GSTIN</Text>
                    <Text variant="h3" className="font-mono font-black text-navy">{preview.gstin || 'NOT_LINKED'}</Text>
                 </div>
                 <div className="w-px h-12 bg-navy/5" />
                 <div>
                    <Text variant="xs" className="font-black text-navy/20 uppercase tracking-widest mb-2">Return Period</Text>
                    <Text variant="h3" className="font-black text-navy uppercase">{MONTHS[month - 1]} {year}</Text>
                 </div>
              </div>
              <div className="flex items-center gap-3 text-emerald-500 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                 <CheckCircle2 size={18} />
                 <Text variant="xs" className="font-black uppercase tracking-widest">Return State: Generated</Text>
              </div>
            </Card>

            <Card className="rounded-[4rem] border-none shadow-2xl overflow-hidden flex flex-col bg-white">
              <div className="p-10 border-b border-navy/5 bg-navy text-white flex items-center justify-between">
                 <Text variant="xs" className="font-black uppercase tracking-[0.2em]">B2B Invoice Registry</Text>
                 <Badge variant="info" className="bg-white/10 text-white font-black">{flattenedB2B.length} Entries</Badge>
              </div>
              <div className="h-[400px]">
                 <DataTable data={flattenedB2B} columns={b2bColumns} />
              </div>
            </Card>

            <Card className="rounded-[4rem] border-none shadow-2xl overflow-hidden flex flex-col bg-white">
              <div className="p-10 border-b border-navy/5 bg-navy text-white flex items-center justify-between">
                 <Text variant="xs" className="font-black uppercase tracking-[0.2em]">B2CS Aggregate Ledger</Text>
                 <Badge variant="info" className="bg-white/10 text-white font-black">{preview.b2cs?.length || 0} Aggregates</Badge>
              </div>
              <div className="h-[300px]">
                 <DataTable data={preview.b2cs || []} columns={b2csColumns} />
              </div>
            </Card>

            <div className="flex gap-6 pb-20">
              <Button onClick={downloadJSON} className="flex-1 h-16 rounded-[2rem] bg-navy text-white shadow-2xl font-black text-[10px] uppercase tracking-widest gap-3">
                 <Download size={20} className="text-brand-gold" /> Download JSON (GSP Schema)
              </Button>
              <Button onClick={downloadCSV} variant="sec" className="flex-1 h-16 rounded-[2rem] bg-white border-navy/5 text-navy font-black text-[10px] uppercase tracking-widest gap-3">
                 <FileText size={20} className="text-indigo-500" /> Human Readable CSV
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompliancePanel;
