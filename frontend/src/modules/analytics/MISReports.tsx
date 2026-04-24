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
import { useState } from 'react'
import { FileSpreadsheet, Download, Filter, TrendingUp, ShieldCheck } from 'lucide-react'

export default function MISReports() {
  const [reportType, setReportType] = useState<'SALES_BOOK' | 'MARGIN' | 'AUDIT'>('SALES_BOOK')

  const salesBookData = [
    { billNo: 'RET-10245', date: '2026-04-24', items: 3, value: 4500, margin: '32%' },
    { billNo: 'RET-10246', date: '2026-04-24', items: 1, value: 2499, margin: '28%' },
    { billNo: 'RET-10247', date: '2026-04-24', items: 2, value: 8200, margin: '41%' }
  ]

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Report Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'SALES_BOOK', label: 'Daily Sales Book', icon: FileSpreadsheet, desc: 'Detailed transaction log' },
          { id: 'MARGIN', label: 'Margin Analysis', icon: TrendingUp, desc: 'Product-wise profitability' },
          { id: 'AUDIT', label: 'Audit Compliance', icon: ShieldCheck, desc: 'HSN/Tax register for Tally' }
        ].map((rep) => (
          <button 
            key={rep.id}
            onClick={() => setReportType(rep.id as any)}
            className={`flex items-center gap-6 p-8 rounded-[2.5rem] transition-all border-b-8 ${reportType === rep.id ? 'bg-navy text-white border-gold shadow-2xl' : 'glass border-transparent hover:border-navy/10'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${reportType === rep.id ? 'bg-gold text-navy' : 'bg-navy/5 text-navy'}`}>
              <rep.icon className="w-8 h-8" />
            </div>
            <div className="text-left">
              <div className="text-lg font-serif font-black uppercase tracking-tight">{rep.label}</div>
              <div className={`text-[9px] font-black uppercase tracking-widest ${reportType === rep.id ? 'text-white/40' : 'text-muted'}`}>{rep.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="glass p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Date Range</span>
            <div className="text-xs font-bold text-navy flex gap-2">
               <span>2026-04-01</span> <span>→</span> <span>2026-04-24</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="p-3 bg-navy/5 hover:bg-navy/10 rounded-xl transition-all"><Filter className="w-5 h-5 text-navy" /></button>
          <button className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl text-[10px] font-black tracking-widest hover:shadow-lg transition-all">
            <Download className="w-4 h-4" /> EXPORT TO TALLY (XML)
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="glass rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="bg-navy px-10 py-5 flex items-center justify-between">
           <h3 className="text-white font-serif font-black">{reportType.replace('_', ' ')}</h3>
           <span className="text-[10px] text-white/40 font-black tracking-widest uppercase">Shoper9 Fidelity Mode</span>
        </div>
        
        <table className="w-full">
          <thead className="bg-cream/30 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
            <tr>
              <th className="pl-10 py-5 text-left">Ref / Document No</th>
              <th className="px-6 py-5 text-center">Date</th>
              <th className="px-6 py-5 text-center">Qty</th>
              <th className="px-6 py-5 text-right">Net Value</th>
              <th className="pr-10 py-5 text-right">Margin (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 font-mono text-xs">
            {salesBookData.map((row, i) => (
              <tr key={i} className="hover:bg-cream/10 transition-colors">
                <td className="pl-10 py-6 font-black text-navy">{row.billNo}</td>
                <td className="px-6 py-6 text-center text-muted">{row.date}</td>
                <td className="px-6 py-6 text-center font-bold">{row.items}</td>
                <td className="px-6 py-6 text-right font-black">₹{row.value.toLocaleString()}</td>
                <td className="pr-10 py-6 text-right font-black text-emerald-600">{row.margin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
