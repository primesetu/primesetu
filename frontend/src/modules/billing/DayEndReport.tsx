/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React from 'react';
import { formatCurrency } from '@/utils/currency';

interface DayEndStats {
  cash: number;
  card: number;
  upi: number;
  cn?: number;
  returns?: number;
  bill_count: number;
  total_revenue: number;
}

interface DayEndReportProps {
  stats: DayEndStats;
  declaredCash: number;
  variance: number;
  store: {
    name?: string;
    address?: string;
    gstin?: string;
  };
}

export const DayEndReport = React.forwardRef<HTMLDivElement, DayEndReportProps>(({ stats, declaredCash, variance, store }, ref) => {
  const now = new Date();
  
  return (
    <div ref={ref} className="p-12 text-navy font-mono text-[10px] leading-relaxed max-w-[800px] mx-auto bg-white print:p-8">
      {/* Institutional Header */}
      <div className="text-center border-b-2 border-navy pb-8 mb-8">
        <h1 className="text-2xl font-serif font-black uppercase tracking-tighter mb-1">Shift Closure Report</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Institutional Z-Report · Phase 2 Protocol</p>
      </div>

      {/* Store & Shift Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="font-black uppercase text-[8px] opacity-40 mb-1">Store Node</div>
          <div className="font-bold text-sm uppercase">{store?.name || 'PRIME SETU NODE X01'}</div>
          <div className="text-[9px] uppercase">{store?.address || 'Digital Sovereign Hub'}</div>
          <div className="text-[9px]">GSTIN: {store?.gstin || '27AAAAA0000A1Z5'}</div>
        </div>
        <div className="text-right">
          <div className="font-black uppercase text-[8px] opacity-40 mb-1">Closure Signature</div>
          <div className="font-bold text-sm uppercase">Z-{now.getTime().toString().slice(-6)}</div>
          <div className="text-[9px]">{now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          <div className="text-[9px]">{now.toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Financial Matrix */}
      <div className="border-2 border-navy rounded-2xl overflow-hidden mb-8">
        <div className="bg-navy text-white px-6 py-3 font-black uppercase tracking-widest flex justify-between">
          <span>Operational Metric</span>
          <span>System Value</span>
        </div>
        <div className="divide-y divide-navy/10">
          <div className="px-6 py-3 flex justify-between">
            <span className="font-bold uppercase">Total Invoices Generated</span>
            <span className="font-black">{stats.bill_count || 0}</span>
          </div>
          <div className="px-6 py-3 flex justify-between">
             <span className="font-bold uppercase">Gross Revenue</span>
             <span className="font-black">{formatCurrency(stats.total_revenue || 0)}</span>
          </div>
          <div className="px-6 py-3 flex justify-between text-rose-600 bg-rose-50">
             <span className="font-bold uppercase">Sales Returns / Credit Notes</span>
             <span className="font-black">({formatCurrency(stats.returns || 0)})</span>
          </div>
          <div className="px-6 py-4 flex justify-between bg-navy/5 text-base">
             <span className="font-black uppercase">Net Collectible Revenue</span>
             <span className="font-black">{formatCurrency(stats.total_revenue - (stats.returns || 0))}</span>
          </div>
        </div>
      </div>

      {/* Collection Breakdown */}
      <div className="mb-8">
        <h3 className="font-black uppercase tracking-widest text-[9px] opacity-40 mb-4">Collection Breakdown</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-navy/20 text-left">
              <th className="py-2 uppercase font-black">Mode</th>
              <th className="py-2 uppercase font-black text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            <tr>
              <td className="py-3 font-bold uppercase">Cash in Till</td>
              <td className="py-3 font-black text-right">{formatCurrency(stats.cash || 0)}</td>
            </tr>
            <tr>
              <td className="py-3 font-bold uppercase">Credit / Debit Cards</td>
              <td className="py-3 font-black text-right">{formatCurrency(stats.card || 0)}</td>
            </tr>
            <tr>
              <td className="py-3 font-bold uppercase">Digital UPI / Wallet</td>
              <td className="py-3 font-black text-right">{formatCurrency(stats.upi || 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Reconciliation Section */}
      <div className="bg-navy/[0.03] border-2 border-dashed border-navy/20 rounded-2xl p-8 mb-12">
        <h3 className="font-black uppercase tracking-widest text-[9px] opacity-40 mb-6 text-center">Physical Reconciliation Ledger</h3>
        <div className="space-y-4 max-w-sm mx-auto">
          <div className="flex justify-between items-center">
            <span className="font-bold uppercase">System Cash</span>
            <span className="font-black text-lg">{formatCurrency(stats.cash || 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold uppercase">Declared Physical</span>
            <span className="font-black text-lg">{formatCurrency(declaredCash)}</span>
          </div>
          <div className="border-t-2 border-navy/10 pt-4 flex justify-between items-center">
            <span className="font-black uppercase">Variance / Discrepancy</span>
            <span className={`font-black text-xl ${variance !== 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {variance > 0 ? '+' : ''}{formatCurrency(variance)}
            </span>
          </div>
        </div>
      </div>

      {/* Audit Footnotes */}
      <div className="grid grid-cols-2 gap-12 mt-24">
        <div className="text-center">
          <div className="border-t border-navy pt-4">
            <div className="font-black uppercase text-[8px] mb-1">Cashier Signature</div>
            <div className="text-[9px] font-bold">TER-01 / ADM-01</div>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-navy pt-4">
            <div className="font-black uppercase text-[8px] mb-1">Supervisor Signature</div>
            <div className="text-[9px] font-bold">NODE-X01-MANAGER</div>
          </div>
        </div>
      </div>

      <div className="mt-20 text-center text-[8px] text-navy/20 font-black uppercase tracking-[0.5em]">
        End of Institutional Report · Generated by PrimeSetu v2.0
      </div>
    </div>
  );
});
