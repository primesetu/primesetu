/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState } from 'react';
import {
  FileText, Download, Shield, CheckCircle2,
  Calendar, Hash, AlertTriangle, Loader2,
  BarChart3, Building2, Users, Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';

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

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tighter">
            GST Compliance
          </h1>
          <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em] mt-1">
            GSTR-1 · Sovereign Tax Register
          </p>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700">
          <Shield size={16} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">GSP Compliant Engine</span>
        </div>
      </header>

      {/* Period Selector */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-xl shadow-navy/5">
        <h2 className="text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] mb-6">Return Period</h2>
        <div className="flex items-end gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-navy/50 ml-1">Month</label>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="w-full bg-white border-2 border-transparent focus:border-navy px-4 py-3.5 rounded-2xl text-xs font-bold text-navy outline-none transition-all shadow-inner appearance-none"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-navy/50 ml-1">Year</label>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="w-full bg-white border-2 border-transparent focus:border-navy px-4 py-3.5 rounded-2xl text-xs font-bold text-navy outline-none transition-all shadow-inner appearance-none"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchPreview}
            disabled={loading}
            className="flex items-center gap-3 bg-navy text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-navy/90 transition-all shadow-xl shadow-navy/20 disabled:opacity-40"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <BarChart3 size={16} />}
            Generate Return
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-4 p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-700">
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{error}</p>
        </div>
      )}

      {/* Preview Panel */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Receipt, label: 'Grand Total', value: `₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'bg-navy text-white', dark: true },
                { icon: Building2, label: 'B2B Invoices', value: b2bCount, color: 'bg-white/60 text-navy', dark: false },
                { icon: Users, label: 'B2CS Entries', value: b2csCount, color: 'bg-white/60 text-navy', dark: false },
                { icon: Hash, label: 'HSN Codes', value: hsnCount, color: 'bg-white/60 text-navy', dark: false },
              ].map(({ icon: Icon, label, value, color, dark }) => (
                <div key={label} className={`${color} rounded-3xl p-6 shadow-xl border ${dark ? 'border-navy' : 'border-white/60'}`}>
                  <Icon size={20} className={dark ? 'text-white/60' : 'text-navy/30'} />
                  <div className={`text-3xl font-serif font-black mt-3 ${dark ? 'text-white' : 'text-navy'}`}>{value}</div>
                  <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${dark ? 'text-white/50' : 'text-navy/40'}`}>{label}</div>
                </div>
              ))}
            </div>

            {/* GSTIN + Period */}
            <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[9px] font-black text-navy/40 uppercase tracking-widest">GSTIN</div>
                  <div className="text-lg font-mono font-black text-navy mt-0.5">
                    {preview.gstin || <span className="text-rose-400">Not Configured</span>}
                  </div>
                </div>
                <div className="w-px h-10 bg-navy/10" />
                <div>
                  <div className="text-[9px] font-black text-navy/40 uppercase tracking-widest">Filing Period</div>
                  <div className="text-lg font-black text-navy mt-0.5">{MONTHS[month - 1]} {year}</div>
                </div>
                <div className="w-px h-10 bg-navy/10" />
                <div>
                  <div className="text-[9px] font-black text-navy/40 uppercase tracking-widest">Document Count</div>
                  <div className="text-lg font-black text-navy mt-0.5">
                    {preview.doc_issue?.doc_det?.[0]?.docs?.[0]?.totnum ?? 0} Invoices
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Return Generated</span>
              </div>
            </div>

            {/* B2B Table */}
            {preview.b2b?.length > 0 && (
              <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-navy/5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-navy/50">B2B Invoices</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-navy/5">
                        {['Customer GSTIN', 'Invoice No', 'Date', 'Value', 'Taxable', 'IGST', 'CGST', 'SGST'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[9px] font-black text-navy/40 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.b2b.flatMap((entry: any) =>
                        entry.inv.map((inv: any, i: number) => {
                          const taxable = inv.itms?.reduce((s: number, it: any) => s + it.txval, 0) ?? 0;
                          const igst = inv.itms?.reduce((s: number, it: any) => s + it.igst, 0) ?? 0;
                          const cgst = inv.itms?.reduce((s: number, it: any) => s + it.cgst, 0) ?? 0;
                          const sgst = inv.itms?.reduce((s: number, it: any) => s + it.sgst, 0) ?? 0;
                          return (
                            <tr key={`${entry.ctin}-${i}`} className="border-t border-navy/5 hover:bg-navy/[0.02]">
                              <td className="px-4 py-3 font-mono font-bold text-navy/80">{entry.ctin}</td>
                              <td className="px-4 py-3 font-bold text-navy">{inv.inum}</td>
                              <td className="px-4 py-3 text-navy/60">{inv.idt}</td>
                              <td className="px-4 py-3 font-bold text-navy">₹{inv.val.toLocaleString()}</td>
                              <td className="px-4 py-3 text-navy/70">₹{taxable.toFixed(2)}</td>
                              <td className="px-4 py-3 text-amber-600">₹{igst.toFixed(2)}</td>
                              <td className="px-4 py-3 text-blue-600">₹{cgst.toFixed(2)}</td>
                              <td className="px-4 py-3 text-emerald-600">₹{sgst.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* B2CS Aggregate */}
            {preview.b2cs?.length > 0 && (
              <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-navy/5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-navy/50">B2CS — Walk-in Sales Aggregate</h3>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-navy/5">
                      {['Supply Type', 'State', 'Tax Rate', 'Taxable', 'IGST', 'CGST', 'SGST'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[9px] font-black text-navy/40 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.b2cs.map((b: any, i: number) => (
                      <tr key={i} className="border-t border-navy/5 hover:bg-navy/[0.02]">
                        <td className="px-4 py-3 font-bold text-navy">{b.sply_ty}</td>
                        <td className="px-4 py-3 text-navy/60">{b.pos}</td>
                        <td className="px-4 py-3 text-navy/70">{b.rt}%</td>
                        <td className="px-4 py-3 font-bold text-navy">₹{b.txval.toFixed(2)}</td>
                        <td className="px-4 py-3 text-amber-600">₹{b.iamt.toFixed(2)}</td>
                        <td className="px-4 py-3 text-blue-600">₹{b.camt.toFixed(2)}</td>
                        <td className="px-4 py-3 text-emerald-600">₹{b.samt.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Download Actions */}
            <div className="flex gap-4">
              <button
                onClick={downloadJSON}
                className="flex items-center gap-3 bg-navy text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-navy/90 transition-all shadow-xl shadow-navy/20"
              >
                <Download size={16} /> Download JSON (IRP / GSP)
              </button>
              <button
                onClick={downloadCSV}
                disabled={loading}
                className="flex items-center gap-3 bg-white/60 text-navy border-2 border-navy/10 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-40"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                Download CSV (Human Readable)
              </button>
            </div>

            <p className="text-[9px] text-navy/30 text-center uppercase tracking-[0.2em]">
              Sovereign Compliance Engine · GSTIN-Level Isolation · IRP/GSP Schema v1.3
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompliancePanel;
