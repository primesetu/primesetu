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
import { Download, FileText, Calendar, CheckCircle2, Shield, Search, FileJson } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession } from '@/hooks/useSession';
import { api } from '@/api/client';

export default function TallyExportModule() {
  const { t } = useLanguage();
  const { session } = useSession();
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      setSuccess(false);
      
      // We directly fetch the XML text from our endpoint
      // Using custom fetch here to handle XML blob response natively
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/v1/tally/export?start_date=${startDate}&end_date=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to export Tally XML");
      
      const xmlBlob = await response.blob();
      const url = window.URL.createObjectURL(xmlBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PrimeSetu_Tally_Export_${startDate}_to_${endDate}.xml`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert("Error generating Tally XML. Ensure your backend is running.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full gap-4 p-4">
      {/* ── Left Pane: Configuration ── */}
      <div className="flex-[2] shoper-panel flex flex-col overflow-hidden bg-white">
        <div className="p-6 border-b border-border bg-cream/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-saffron/10 rounded-2xl flex items-center justify-center border border-saffron/20 shadow-inner">
              <FileJson className="w-7 h-7 text-saffron" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-black text-navy">Tally ERP-9 Interface</h2>
              <p className="text-sm font-bold text-muted uppercase tracking-widest mt-1">Financial Voucher Synchronization</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-8">
          
          {/* Data Filter Panel */}
          <div className="p-6 border-2 border-border rounded-2xl bg-white shadow-sm space-y-6">
            <h3 className="text-lg font-black text-navy flex items-center gap-2">
              <Calendar className="w-5 h-5 text-saffron" />
              Extraction Period
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted">From Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-touch border-2 border-border focus:border-navy rounded-xl px-4 font-mono text-lg font-bold outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted">To Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-touch border-2 border-border focus:border-navy rounded-xl px-4 font-mono text-lg font-bold outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Export Action */}
          <div className="p-6 bg-navy/5 border-2 border-navy/10 rounded-2xl space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-black text-navy mb-1">Generate Standard XML</h4>
                <p className="text-xs text-muted font-bold leading-relaxed">
                  Generates a highly compliant Tally ERP-9 XML containing Daybook Sales, Tax Ledgers (CGST/SGST/IGST), and Cash/Bank entries.
                </p>
              </div>
              <Shield className="w-10 h-10 text-navy/20" />
            </div>
            
            <button 
              onClick={handleExport}
              disabled={exporting}
              className="w-full h-20 bg-navy hover:bg-navy-dk text-gold font-black uppercase tracking-widest text-xl rounded-2xl shadow-lg shadow-navy/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {exporting ? (
                <div className="w-6 h-6 border-4 border-gold border-t-transparent rounded-full animate-spin" />
              ) : success ? (
                <><CheckCircle2 className="w-6 h-6" /> Export Successful</>
              ) : (
                <><Download className="w-6 h-6" /> Extract Vouchers [F10]</>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* ── Right Pane: Ledger Mapping Info ── */}
      <div className="flex-1 shoper-panel bg-navy text-white flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        <div className="p-6 border-b border-white/10 shrink-0">
          <h3 className="text-xl font-black text-gold">Ledger Rules</h3>
          <p className="text-xs text-white/50 uppercase tracking-widest mt-1">Sovereign Accounting Standard</p>
        </div>
        
        <div className="flex-1 overflow-auto p-6 space-y-6 text-sm">
          <p className="text-white/80 font-medium leading-relaxed">
            The exported XML automatically maps POS transactions to the following standard Tally Ledgers. Ensure these exact ledger names exist in your Tally Company Master.
          </p>
          
          <div className="space-y-3">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gold uppercase tracking-widest font-bold mb-1">Sales Ledger</div>
              <div className="font-mono text-base">Sales - GST</div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gold uppercase tracking-widest font-bold mb-1">Tax Ledgers</div>
              <div className="font-mono text-base mb-1">Output CGST</div>
              <div className="font-mono text-base mb-1">Output SGST</div>
              <div className="font-mono text-base">Output IGST</div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gold uppercase tracking-widest font-bold mb-1">Payment Ledgers</div>
              <div className="font-mono text-base mb-1">Cash in Hand</div>
              <div className="font-mono text-base mb-1">UPI Collection A/c</div>
              <div className="font-mono text-base">Card Settlement A/c</div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gold uppercase tracking-widest font-bold mb-1">Customer Accounts</div>
              <div className="font-mono text-base">Sundry Debtors (By Name)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
