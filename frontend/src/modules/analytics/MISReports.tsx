/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import { useState } from 'react'
import { FileSpreadsheet, Download, Filter, TrendingUp, ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react'

export default function MISReports() {
  const [reportType, setReportType] = useState<'SALES_BOOK' | 'MARGIN' | 'AUDIT'>('SALES_BOOK')
  const [drillDownId, setDrillDownId] = useState<string | null>(null)

  const salesBookData = [
    { billNo: 'RET-10245', date: '2026-04-24', items: 3, value: 4500, margin: '32%', 
      lineItems: [
        { sku: '8901234', name: 'Cotton Premium Shirt', qty: 2, mrp: 1500, net: 3000 },
        { sku: '8901235', name: 'Denim Jeans Classic', qty: 1, mrp: 1500, net: 1500 }
      ]
    },
    { billNo: 'RET-10246', date: '2026-04-24', items: 1, value: 2499, margin: '28%',
      lineItems: [
        { sku: '8901236', name: 'Leather Jacket', qty: 1, mrp: 2499, net: 2499 }
      ]
    },
    { billNo: 'RET-10247', date: '2026-04-24', items: 2, value: 8200, margin: '41%',
      lineItems: [
        { sku: '8901237', name: 'Designer Suit', qty: 1, mrp: 5000, net: 5000 },
        { sku: '8901238', name: 'Formal Shoes', qty: 1, mrp: 3200, net: 3200 }
      ]
    }
  ]

  const marginData = [
    { category: 'Premium Wear', totalSales: 120000, cogs: 80000, marginValue: 40000, marginPct: '33.3%',
      items: [
        { sku: '8901234', name: 'Cotton Premium Shirt', sales: 45000, margin: '38%' },
        { sku: '8901237', name: 'Designer Suit', sales: 75000, margin: '30%' }
      ]
    },
    { category: 'Footwear', totalSales: 65000, cogs: 45000, marginValue: 20000, marginPct: '30.7%',
      items: [
        { sku: '8901238', name: 'Formal Shoes', sales: 65000, margin: '30.7%' }
      ]
    }
  ]

  const auditData = [
    { hsnCode: 'HSN-6205', desc: 'Men Shirts', taxableValue: 45000, taxRate: '12%', taxAmount: 5400,
      bills: [
        { billNo: 'RET-10245', date: '2026-04-24', net: 3000, tax: 360 },
        { billNo: 'RET-10248', date: '2026-04-24', net: 42000, tax: 5040 }
      ]
    },
    { hsnCode: 'HSN-6403', desc: 'Footwear Leather', taxableValue: 65000, taxRate: '18%', taxAmount: 11700,
      bills: [
        { billNo: 'RET-10247', date: '2026-04-24', net: 3200, tax: 576 },
        { billNo: 'RET-10249', date: '2026-04-24', net: 61800, tax: 11124 }
      ]
    }
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
            onClick={() => {
              setReportType(rep.id as any)
              setDrillDownId(null) // Reset drill down when switching tabs
            }}
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
      <div className="glass rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="bg-navy px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {drillDownId && (
              <button onClick={() => setDrillDownId(null)} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="text-white font-serif font-black">
              {drillDownId ? `Drill Down: ${drillDownId}` : reportType.replace('_', ' ')}
            </h3>
          </div>
          <span className="text-[10px] text-white/40 font-black tracking-widest uppercase">Shoper9 Fidelity Mode</span>
        </div>
        
        {/* Dynamic Report Content based on Report Type */}
        {!drillDownId && reportType === 'SALES_BOOK' && (
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
                <tr 
                  key={i} 
                  onClick={() => setDrillDownId(row.billNo)}
                  className="hover:bg-cream/20 transition-colors cursor-pointer group"
                >
                  <td className="pl-10 py-6 font-black text-navy flex items-center gap-2">
                    {row.billNo}
                    <ChevronRight className="w-3 h-3 text-saffron opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="px-6 py-6 text-center text-muted">{row.date}</td>
                  <td className="px-6 py-6 text-center font-bold">{row.items}</td>
                  <td className="px-6 py-6 text-right font-black">₹{row.value.toLocaleString()}</td>
                  <td className="pr-10 py-6 text-right font-black text-emerald-600">{row.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {drillDownId && reportType === 'SALES_BOOK' && (
          <div className="p-10 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="text-[10px] font-black text-muted uppercase tracking-widest">Document Line Items</div>
              <div className="text-[10px] font-black text-saffron uppercase tracking-widest">Store: X01</div>
            </div>
            <table className="w-full">
              <thead className="bg-navy/5 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
                <tr>
                  <th className="pl-6 py-4 text-left">SKU Code</th>
                  <th className="px-6 py-4 text-left">Item Description</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4 text-right">MRP (₹)</th>
                  <th className="pr-6 py-4 text-right">Net Ext (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono text-xs">
                {salesBookData.find(b => b.billNo === drillDownId)?.lineItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-cream/10 transition-colors">
                    <td className="pl-6 py-4 font-black text-navy/60">{item.sku}</td>
                    <td className="px-6 py-4 text-navy font-sans font-bold text-sm">{item.name}</td>
                    <td className="px-6 py-4 text-center font-bold">{item.qty}</td>
                    <td className="px-6 py-4 text-right">{item.mrp.toLocaleString()}</td>
                    <td className="pr-6 py-4 text-right font-black text-navy">₹{item.net.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!drillDownId && reportType === 'MARGIN' && (
          <table className="w-full">
            <thead className="bg-cream/30 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
              <tr>
                <th className="pl-10 py-5 text-left">Category</th>
                <th className="px-6 py-5 text-right">Total Sales</th>
                <th className="px-6 py-5 text-right">COGS</th>
                <th className="px-6 py-5 text-right">Margin Value</th>
                <th className="pr-10 py-5 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-mono text-xs">
              {marginData.map((row, i) => (
                <tr 
                  key={i} 
                  onClick={() => setDrillDownId(row.category)}
                  className="hover:bg-cream/20 transition-colors cursor-pointer group"
                >
                  <td className="pl-10 py-6 font-black text-navy flex items-center gap-2">
                    {row.category}
                    <ChevronRight className="w-3 h-3 text-saffron opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="px-6 py-6 text-right font-bold">₹{row.totalSales.toLocaleString()}</td>
                  <td className="px-6 py-6 text-right font-bold text-rose-600">₹{row.cogs.toLocaleString()}</td>
                  <td className="px-6 py-6 text-right font-black text-emerald-600">₹{row.marginValue.toLocaleString()}</td>
                  <td className="pr-10 py-6 text-right font-black text-emerald-600">{row.marginPct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {drillDownId && reportType === 'MARGIN' && (
          <div className="p-10 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="text-[10px] font-black text-muted uppercase tracking-widest">Product Performance: {drillDownId}</div>
            </div>
            <table className="w-full">
              <thead className="bg-navy/5 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
                <tr>
                  <th className="pl-6 py-4 text-left">SKU Code</th>
                  <th className="px-6 py-4 text-left">Item Description</th>
                  <th className="px-6 py-4 text-right">Sales (₹)</th>
                  <th className="pr-6 py-4 text-right">Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono text-xs">
                {marginData.find(m => m.category === drillDownId)?.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-cream/10 transition-colors">
                    <td className="pl-6 py-4 font-black text-navy/60">{item.sku}</td>
                    <td className="px-6 py-4 text-navy font-sans font-bold text-sm">{item.name}</td>
                    <td className="px-6 py-4 text-right font-bold">₹{item.sales.toLocaleString()}</td>
                    <td className="pr-6 py-4 text-right font-black text-emerald-600">{item.margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!drillDownId && reportType === 'AUDIT' && (
          <table className="w-full">
            <thead className="bg-cream/30 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
              <tr>
                <th className="pl-10 py-5 text-left">HSN Code</th>
                <th className="px-6 py-5 text-left">Description</th>
                <th className="px-6 py-5 text-right">Taxable Value</th>
                <th className="px-6 py-5 text-center">Tax Rate</th>
                <th className="pr-10 py-5 text-right">Tax Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-mono text-xs">
              {auditData.map((row, i) => (
                <tr 
                  key={i} 
                  onClick={() => setDrillDownId(row.hsnCode)}
                  className="hover:bg-cream/20 transition-colors cursor-pointer group"
                >
                  <td className="pl-10 py-6 font-black text-navy flex items-center gap-2">
                    {row.hsnCode}
                    <ChevronRight className="w-3 h-3 text-saffron opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="px-6 py-6 text-left font-bold">{row.desc}</td>
                  <td className="px-6 py-6 text-right font-bold">₹{row.taxableValue.toLocaleString()}</td>
                  <td className="px-6 py-6 text-center font-bold text-navy/60">{row.taxRate}</td>
                  <td className="pr-10 py-6 text-right font-black text-rose-600">₹{row.taxAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {drillDownId && reportType === 'AUDIT' && (
          <div className="p-10 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="text-[10px] font-black text-muted uppercase tracking-widest">Tax Documents: {drillDownId}</div>
            </div>
            <table className="w-full">
              <thead className="bg-navy/5 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
                <tr>
                  <th className="pl-6 py-4 text-left">Bill No</th>
                  <th className="px-6 py-4 text-center">Date</th>
                  <th className="px-6 py-4 text-right">Net Value (₹)</th>
                  <th className="pr-6 py-4 text-right">Tax Applied (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono text-xs">
                {auditData.find(a => a.hsnCode === drillDownId)?.bills.map((item, idx) => (
                  <tr key={idx} className="hover:bg-cream/10 transition-colors">
                    <td className="pl-6 py-4 font-black text-navy/60">{item.billNo}</td>
                    <td className="px-6 py-4 text-center font-sans font-bold text-sm text-muted">{item.date}</td>
                    <td className="px-6 py-4 text-right font-bold">₹{item.net.toLocaleString()}</td>
                    <td className="pr-6 py-4 text-right font-black text-rose-600">₹{item.tax.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}
