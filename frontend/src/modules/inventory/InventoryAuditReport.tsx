/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useMemo } from 'react';
import { ShieldCheck, BarChart3, AlertCircle, X, Printer, FileText, Package } from 'lucide-react';
import { 
  Button, 
  Card, 
  Text, 
  Badge,
  DataTable 
} from '@/components/ui/SovereignUI';

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

  // ── VARIANCE COLUMNS ──
  const columns = useMemo(() => [
    {
      header: "ITEM PROTOCOL DETAIL",
      accessor: (item: any) => (
        <div className="flex flex-col py-2">
          <span className="font-black text-navy uppercase leading-none">{item.product_name || 'Generic Article'}</span>
          <span className="text-[9px] text-navy/30 font-mono mt-1 uppercase tracking-widest">{item.item_id}</span>
        </div>
      ),
      flex: 2,
      pinned: 'left' as const
    },
    {
      header: "SIZE / COLOUR",
      accessor: (item: any) => (
        <div className="flex gap-2">
          <Badge variant="info" className="bg-navy/5 text-navy border-none font-black">{item.size || 'UNI'}</Badge>
          <Badge variant="info" className="bg-navy/5 text-navy border-none font-black">{item.colour || 'NOS'}</Badge>
        </div>
      ),
      width: 160,
      className: 'text-center'
    },
    {
      header: "SYSTEM QTY",
      accessor: 'system_qty',
      width: 120,
      className: 'text-right font-mono font-black text-navy/30'
    },
    {
      header: "PHYSICAL",
      accessor: 'physical_qty',
      width: 120,
      className: 'text-right font-mono font-black text-navy'
    },
    {
      header: "VARIANCE",
      accessor: (item: any) => {
        const v = item.physical_qty - item.system_qty;
        return (
          <span className={`font-mono font-black ${
            v === 0 ? 'text-navy/10' : v < 0 ? 'text-rose-500' : 'text-emerald-500'
          }`}>
            {v > 0 ? '+' : ''}{v}
          </span>
        );
      },
      width: 120,
      className: 'text-right',
      pinned: 'right' as const
    }
  ], []);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-navy/60 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="bg-white w-full max-w-6xl rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] border-none">
        
        {/* Institutional Header */}
        <div className="bg-navy p-12 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 rotate-12 -translate-y-8">
             <ShieldCheck size={260} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                 <ShieldCheck className="text-brand-gold" size={32} />
              </div>
              <div>
                 <Text variant="h1" className="font-serif font-black uppercase tracking-tighter leading-none">Variance Certificate</Text>
                 <Text variant="xs" className="font-black text-white/30 uppercase tracking-[0.4em] mt-3">Audit Protocol: {audit.audit_no} · SMRITI-OS Audit Vault</Text>
              </div>
            </div>
          </div>
          <div className="text-right relative z-10">
            <Text variant="xs" className="font-black uppercase tracking-[0.2em] text-white/20 mb-3">Institutional Timestamp</Text>
            <Text variant="h2" className="font-black text-white">{new Date(audit.submitted_at || audit.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-12 gap-12 bg-navy/[0.01]">
          {/* Executive Summary */}
          <div className="grid grid-cols-4 gap-8">
            {[
              { label: 'Scanned DNA', value: stats.totalItems, icon: BarChart3, color: 'text-navy', bg: 'bg-navy/5' },
              { label: 'Net Units', value: stats.totalQty, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Operational Shortages', value: stats.shortages, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
              { label: 'Surplus Detection', value: stats.surplus, icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} p-10 rounded-[3rem] border border-transparent hover:border-navy/5 transition-all shadow-sm flex flex-col justify-center`}>
                <stat.icon className={`${stat.color} mb-6`} size={24} />
                <Text variant="h1" className={`text-4xl font-black ${stat.color}`}>{stat.value}</Text>
                <Text variant="xs" className="font-black text-navy/20 uppercase tracking-[0.2em] mt-2">{stat.label}</Text>
              </div>
            ))}
          </div>

          {/* Variance Ledger */}
          <div className="flex-1 flex flex-col min-h-0">
            <Text variant="xs" className="font-black text-navy/30 uppercase tracking-[0.4em] mb-8">Detailed Variance Ledger</Text>
            <Card className="flex-1 bg-white rounded-[3.5rem] border-none shadow-2xl overflow-hidden">
               <DataTable 
                 data={audit.items || []} 
                 columns={columns} 
                 overlayNoRowsTemplate={`
                   <div class="flex flex-col items-center justify-center opacity-10 h-full">
                      <Package size="60" class="mb-4" />
                      <div class="text-xs font-black uppercase tracking-[0.4em]">Zero Variance Detected</div>
                   </div>
                 `}
               />
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-10 bg-white border-t border-navy/5 flex justify-between items-center px-12">
          <Button 
            variant="sec" 
            onClick={onClose}
            className="h-16 px-10 rounded-[2rem] border-navy/5 text-navy font-black text-[10px] uppercase tracking-[0.3em] gap-3"
          >
            <X size={18} /> Close Protocol [Esc]
          </Button>
          <div className="flex gap-6">
            <Button 
              variant="sec"
              className="h-16 px-10 rounded-[2rem] border-navy/5 text-navy font-black text-[10px] uppercase tracking-[0.3em] gap-3"
            >
              <FileText size={18} className="text-indigo-500" /> Export CSV
            </Button>
            <Button 
              onClick={() => window.print()}
              className="h-16 px-12 bg-navy text-white rounded-[2rem] shadow-2xl font-black text-[10px] uppercase tracking-[0.3em] gap-3"
            >
              <Printer size={18} className="text-brand-gold" /> Print Certificate [P]
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
