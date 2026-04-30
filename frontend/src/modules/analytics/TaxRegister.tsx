/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState } from 'react';
import { CreditCard, Download, Search, Landmark, PieChart, ShieldCheck, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { DataTable, cn } from '../../components/ui/SovereignUI';

export default function TaxRegister() {
  const [period, setPeriod] = useState('APR-2026');

  const taxSummary = [
    { rate: '5%', taxable: '₹1,42,000', cgst: '₹3,550', sgst: '₹3,550', total: '₹7,100' },
    { rate: '12%', taxable: '₹4,85,000', cgst: '₹29,100', sgst: '₹29,100', total: '₹58,200' },
    { rate: '18%', taxable: '₹88,000', cgst: '₹7,920', sgst: '₹7,920', total: '₹15,840' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-black text-navy flex items-center gap-4">
            <CreditCard className="w-10 h-10 text-rose-500" />
            Tax Register (GST)
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Compliance & Liability Ledger</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border-2 border-border px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cream transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> GSTR-1 JSON
          </button>
          <button className="bg-navy text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-navy/90 transition-all">
            PREVIEW REPORT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Taxable', value: '₹7.15L', icon: PieChart, color: 'text-blue-500' },
          { label: 'Output GST', value: '₹81,140', icon: Landmark, color: 'text-rose-500' },
          { label: 'Input Credit', value: '₹12,450', icon: History, color: 'text-emerald-500' },
          { label: 'Net Payable', value: '₹68,690', icon: ShieldCheck, color: 'text-navy' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-[2rem] shadow-xl border border-white">
            <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-3 flex items-center justify-between">
              {stat.label} <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </p>
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="bg-navy px-10 py-6 flex justify-between items-center text-white">
          <h3 className="font-serif font-black uppercase tracking-tight">GST Rate-wise Summary ({period})</h3>
          <select className="bg-white/10 border border-white/10 rounded-lg px-4 py-1.5 text-[10px] outline-none font-black cursor-pointer">
            <option>APRIL 2026</option>
            <option>MARCH 2026</option>
            <option>FEBRUARY 2026</option>
          </select>
        </div>
        <DataTable
          data={taxSummary}
          pinnedBottomRowData={[
            { rate: 'Total Liability', taxable: '₹7,15,000', cgst: '₹40,570', sgst: '₹40,570', total: '₹81,140', isTotal: true }
          ]}
          columns={[
            { header: 'Tax Rate', accessor: 'rate', className: 'px-10 font-black text-navy' },
            { header: 'Taxable Value', accessor: 'taxable', align: 'right', className: 'px-6 font-bold text-gray-600' },
            { header: 'CGST', accessor: 'cgst', align: 'right', className: 'px-6 text-gray-500' },
            { header: 'SGST', accessor: 'sgst', align: 'right', className: 'px-6 text-gray-500' },
            { 
              header: 'Total Tax', 
              accessor: (item: any) => (
                <span className={cn(item.isTotal ? "text-rose-600 text-lg font-black" : "text-rose-500 font-bold")}>
                  {item.total}
                </span>
              ), 
              align: 'right', 
              className: 'px-6' 
            },
            { 
              header: 'Compliance', 
              align: 'center', 
              accessor: (item: any) => !item.isTotal && (
                <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">Matched</span>
              ),
              className: 'px-10'
            }
          ]}
        />
      </div>
    </div>
  );
}




