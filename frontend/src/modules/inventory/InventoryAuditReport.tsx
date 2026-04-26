/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React from 'react';
import { ShieldCheck, BarChart3, AlertCircle } from 'lucide-react';

interface AuditReportProps {
  audit: any;
  onClose: () => void;
}

export default function InventoryAuditReport({ audit, onClose }: AuditReportProps) {
  if (!audit) return null;

  const stats = {
    totalItems: audit.items?.length || 0,
    totalQty: audit.items?.reduce((acc: number, item: any) => acc + item.physical_qty, 0) || 0,
    shortages: audit.items?.filter((item: any) => item.physical_qty < item.system_qty).length || 0,
    surplus: audit.items?.filter((item: any) => item.physical_qty > item.system_qty).length || 0,
    varianceQty: audit.items?.reduce((acc: number, item: any) => acc + (item.physical_qty - item.system_qty), 0) || 0,
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Print Header (Visible on screen and print) */}
        <div className="bg-navy p-10 text-white flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-brand-gold" size={24} />
              <h2 className="text-3xl font-serif font-black uppercase tracking-tighter">Variance Certificate</h2>
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Audit Reference: {audit.audit_no}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Audit Date</div>
            <div className="text-xl font-black">{new Date(audit.submitted_at || audit.created_at).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          {/* Executive Summary */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Scanned Items', value: stats.totalItems, icon: BarChart3, color: 'text-navy' },
              { label: 'Total Units', value: stats.totalQty, icon: ShieldCheck, color: 'text-emerald-600' },
              { label: 'Shortages', value: stats.shortages, icon: AlertCircle, color: 'text-rose-500' },
              { label: 'Surplus', value: stats.surplus, icon: ShieldCheck, color: 'text-indigo-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-navy/5 p-6 rounded-[2.5rem] border border-transparent hover:border-navy/10 transition-all">
                <stat.icon className={`${stat.color} mb-3`} size={20} />
                <div className={`text-3xl font-serif font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-[9px] font-black text-navy/30 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Variance Ledger */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-navy uppercase tracking-[0.4em] mb-6">Detailed Variance Ledger</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-navy/30 uppercase tracking-widest border-b border-navy/5">
                  <th className="py-4 px-2">Item Description</th>
                  <th className="py-4 px-2 text-center">Size/Color</th>
                  <th className="py-4 px-2 text-right">System Qty</th>
                  <th className="py-4 px-2 text-right">Physical</th>
                  <th className="py-4 px-2 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/5">
                {audit.items?.map((item: any, i: number) => {
                  const v = item.physical_qty - item.system_qty;
                  return (
                    <tr key={i} className="text-xs group hover:bg-navy/[0.02] transition-all">
                      <td className="py-5 px-2">
                        <div className="font-black text-navy uppercase">{item.product_name || 'Item Name'}</div>
                        <div className="text-[9px] text-navy/40 font-mono mt-0.5">{item.item_id}</div>
                      </td>
                      <td className="py-5 px-2 text-center font-bold text-navy/60">
                        {item.size || 'UNI'} / {item.colour || 'NOS'}
                      </td>
                      <td className="py-5 px-2 text-right font-mono text-navy/40">{item.system_qty}</td>
                      <td className="py-5 px-2 text-right font-mono font-black text-navy">{item.physical_qty}</td>
                      <td className={`py-5 px-2 text-right font-mono font-black ${
                        v === 0 ? 'text-navy/20' : v < 0 ? 'text-rose-500' : 'text-emerald-600'
                      }`}>
                        {v > 0 ? '+' : ''}{v}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-10 bg-navy/5 flex justify-between items-center border-t border-navy/10">
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-white border border-navy/10 text-navy rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-navy hover:text-white transition-all"
          >
            Close [Esc]
          </button>
          <div className="flex gap-4">
            <button 
              onClick={() => window.print()}
              className="px-10 py-4 bg-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-navy/20"
            >
              Print Certificate [P]
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #report-container, #report-container * { visibility: visible; }
          #report-container { position: absolute; left: 0; top: 0; width: 100%; }
          .non-print { display: none !important; }
        }
      `}} />
    </div>
  );
}
