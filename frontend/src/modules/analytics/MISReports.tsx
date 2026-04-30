/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import { useState, useMemo } from 'react'
import { 
  FileSpreadsheet, 
  Download, 
  Filter, 
  TrendingUp, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  Layers,
  Database,
  Search,
  Box
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Button, 
  Card, 
  Text, 
  Badge,
  DataTable,
  cn
} from '@/components/ui/SovereignUI'

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

  // ── GRID COLUMNS FACTORY ──
  const salesColumns = useMemo(() => [
    {
      header: "DOCUMENT PROTOCOL REF",
      accessor: (row: any) => (
        <div className="flex items-center gap-3 py-2 cursor-pointer group" onClick={() => setDrillDownId(row.billNo)}>
          <span className="font-mono font-black text-navy uppercase tracking-tighter">{row.billNo}</span>
          <ChevronRight size={14} className="text-brand-gold opacity-0 group-hover:opacity-100 transition-all" />
        </div>
      ),
      flex: 1.5,
      pinned: 'left' as const
    },
    { header: "TXN DATE", accessor: 'date', width: 140, className: 'text-center font-black text-navy/40 uppercase tracking-widest' },
    { header: "UNIT QTY", accessor: 'items', width: 120, className: 'text-center font-black text-navy' },
    { header: "NET REVENUE", accessor: (row: any) => <span className="font-black text-navy">₹{row.value.toLocaleString()}</span>, width: 160, className: 'text-right' },
    { header: "MARGIN %", accessor: (row: any) => <Badge variant="info" className="bg-emerald-50 text-emerald-600 border-none font-black">{row.margin}</Badge>, width: 140, pinned: 'right' as const }
  ], []);

  const marginColumns = useMemo(() => [
    {
      header: "CATEGORY NODE",
      accessor: (row: any) => (
        <div className="flex items-center gap-3 py-2 cursor-pointer group" onClick={() => setDrillDownId(row.category)}>
          <span className="font-black text-navy uppercase tracking-tight">{row.category}</span>
          <ChevronRight size={14} className="text-brand-gold opacity-0 group-hover:opacity-100 transition-all" />
        </div>
      ),
      flex: 1.5,
      pinned: 'left' as const
    },
    { header: "GROSS SALES", accessor: (row: any) => <span className="font-black text-navy">₹{row.totalSales.toLocaleString()}</span>, width: 160, className: 'text-right' },
    { header: "COGS", accessor: (row: any) => <span className="font-black text-rose-500">₹{row.cogs.toLocaleString()}</span>, width: 160, className: 'text-right' },
    { header: "MARGIN VALUE", accessor: (row: any) => <span className="font-black text-emerald-600">₹{row.marginValue.toLocaleString()}</span>, width: 160, className: 'text-right' },
    { header: "MARGIN %", accessor: (row: any) => <Badge variant="info" className="bg-emerald-50 text-emerald-600 border-none font-black">{row.marginPct}</Badge>, width: 140, pinned: 'right' as const }
  ], []);

  const auditColumns = useMemo(() => [
    {
      header: "HSN / SAC PROTOCOL",
      accessor: (row: any) => (
        <div className="flex items-center gap-3 py-2 cursor-pointer group" onClick={() => setDrillDownId(row.hsnCode)}>
          <span className="font-mono font-black text-navy uppercase tracking-tighter">{row.hsnCode}</span>
          <ChevronRight size={14} className="text-brand-gold opacity-0 group-hover:opacity-100 transition-all" />
        </div>
      ),
      width: 180,
      pinned: 'left' as const
    },
    { header: "ENTITY DESCRIPTION", accessor: 'desc', flex: 1.5, className: 'font-black text-navy/40 uppercase tracking-tight' },
    { header: "TAXABLE VALUE", accessor: (row: any) => <span className="font-black text-navy">₹{row.taxableValue.toLocaleString()}</span>, width: 160, className: 'text-right' },
    { header: "TAX RATE", accessor: 'taxRate', width: 120, className: 'text-center font-black text-navy/40' },
    { header: "TAX AMOUNT", accessor: (row: any) => <span className="font-black text-rose-500">₹{row.taxAmount.toLocaleString()}</span>, width: 150, pinned: 'right' as const, className: 'text-right' }
  ], []);

  // Drill down line item columns
  const lineItemColumns = useMemo(() => [
    { header: "SKU DNA CODE", accessor: 'sku', width: 160, pinned: 'left' as const, className: 'font-mono font-black text-navy/40' },
    { header: "ITEM DESCRIPTION", accessor: 'name', flex: 2, className: 'font-black text-navy uppercase tracking-tight' },
    { header: "QTY", accessor: 'qty', width: 100, className: 'text-center font-black text-navy' },
    { header: "MRP (RETAIL)", accessor: (row: any) => <span>₹{row.mrp.toLocaleString()}</span>, width: 140, className: 'text-right font-black text-navy/40' },
    { header: "NET EXTENSION", accessor: (row: any) => <span className="font-black text-navy">₹{row.net.toLocaleString()}</span>, width: 160, pinned: 'right' as const, className: 'text-right bg-navy/2' }
  ], []);

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-1000 overflow-hidden">
      {/* Report Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { id: 'SALES_BOOK', label: 'Daily Sales Book', icon: FileSpreadsheet, desc: 'Detailed Transaction Pulse' },
          { id: 'MARGIN', label: 'Margin Analysis', icon: TrendingUp, desc: 'Product Profitability DNA' },
          { id: 'AUDIT', label: 'Audit Compliance', icon: ShieldCheck, desc: 'HSN / GSTR-1 Protocol' }
        ].map((rep) => (
          <Card 
            key={rep.id}
            onClick={() => {
              setReportType(rep.id as any)
              setDrillDownId(null)
            }}
            className={cn(
              "flex items-center gap-8 p-10 rounded-[3.5rem] transition-all cursor-pointer border-none shadow-xl relative overflow-hidden group",
              reportType === rep.id ? 'bg-navy text-white shadow-2xl shadow-navy/30' : 'bg-white hover:bg-navy/2'
            )}
          >
            <div className={cn(
              "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500",
              reportType === rep.id ? 'bg-brand-gold text-navy shadow-2xl shadow-brand-gold/20' : 'bg-navy/5 text-navy group-hover:bg-navy group-hover:text-white'
            )}>
              <rep.icon className="w-8 h-8" />
            </div>
            <div className="text-left relative z-10">
              <Text variant="h2" className="font-serif font-black uppercase tracking-tight leading-none mb-3">{rep.label}</Text>
              <Text variant="xs" className={cn("font-black uppercase tracking-[0.2em]", reportType === rep.id ? 'text-white/40' : 'text-navy/20')}>{rep.desc}</Text>
            </div>
            {reportType === rep.id && (
               <div className="absolute -right-4 -top-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                  <rep.icon size={160} />
               </div>
            )}
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <Card className="p-8 rounded-[3rem] bg-white border-none shadow-2xl flex items-center justify-between">
        <div className="flex gap-12 items-center">
          <div className="flex flex-col">
            <Text variant="xs" className="font-black text-navy/20 uppercase tracking-widest mb-2">Filing Range</Text>
            <div className="flex items-center gap-4 bg-navy/5 px-6 py-3 rounded-2xl border border-navy/5">
               <Calendar size={16} className="text-brand-gold" />
               <Text variant="sm" className="font-black text-navy uppercase tracking-widest">01 APR 2026 <ChevronRight size={14} className="inline mx-2 text-navy/20" /> 24 APR 2026</Text>
            </div>
          </div>
          <div className="w-px h-12 bg-navy/5" />
          <div className="flex flex-col">
             <Text variant="xs" className="font-black text-navy/20 uppercase tracking-widest mb-2">Protocol Mode</Text>
             <Badge variant="info" className="h-10 px-4 bg-indigo-50 text-indigo-600 border-none font-black text-[10px] uppercase">Shoper9 Fidelity active</Badge>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="sec" className="h-14 w-14 p-0 rounded-2xl bg-navy/2 border-none text-navy/40 hover:text-navy">
             <Filter size={20} />
          </Button>
          <Button className="h-14 px-10 rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-100 font-black text-[10px] uppercase tracking-widest gap-3">
            <Download className="w-5 h-5 text-white" /> EXPORT TO ACCOUNTING (XML)
          </Button>
        </div>
      </Card>

      {/* Report Content */}
      <Card className="rounded-[4.5rem] bg-white border-none shadow-2xl overflow-hidden flex flex-col relative flex-1 min-h-[500px]">
        <div className="bg-navy px-12 py-8 flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 rotate-12 -translate-y-4">
             <Database size={200} />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            {drillDownId && (
              <Button 
                onClick={() => setDrillDownId(null)} 
                variant="sec" 
                className="h-12 w-12 p-0 rounded-2xl bg-white/10 border-none text-white hover:bg-white/20"
              >
                <ArrowLeft size={18} />
              </Button>
            )}
            <div>
               <Text variant="h2" className="text-white font-serif font-black uppercase leading-none">
                 {drillDownId ? `Drill Down Protocol: ${drillDownId}` : reportType.replace('_', ' ')}
               </Text>
               <Text variant="xs" className="text-white/30 font-black uppercase tracking-[0.4em] mt-2">Verified Ledger Registry · SMRITI-OS Analytics</Text>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
           <AnimatePresence mode="wait">
              {!drillDownId ? (
                <motion.div 
                  key={reportType}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full"
                >
                   <DataTable 
                     data={reportType === 'SALES_BOOK' ? salesBookData : reportType === 'MARGIN' ? marginData : auditData}
                     columns={reportType === 'SALES_BOOK' ? salesColumns : reportType === 'MARGIN' ? marginColumns : auditColumns}
                   />
                </motion.div>
              ) : (
                <motion.div 
                  key="drill-down"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="h-full"
                >
                   <DataTable 
                     data={
                       reportType === 'SALES_BOOK' 
                         ? salesBookData.find(b => b.billNo === drillDownId)?.lineItems || []
                         : reportType === 'MARGIN'
                           ? marginData.find(m => m.category === drillDownId)?.items || []
                           : auditData.find(a => a.hsnCode === drillDownId)?.bills || []
                     }
                     columns={
                        reportType === 'SALES_BOOK' 
                          ? lineItemColumns 
                          : reportType === 'MARGIN'
                            ? [
                                { header: "SKU DNA", accessor: 'sku', width: 160, pinned: 'left' as const, className: 'font-mono font-black text-navy/40' },
                                { header: "DESCRIPTION", accessor: 'name', flex: 2, className: 'font-black text-navy uppercase tracking-tight' },
                                { header: "REVENUE", accessor: (row: any) => <span>₹{row.sales.toLocaleString()}</span>, width: 160, className: 'text-right font-black' },
                                { header: "MARGIN %", accessor: (row: any) => <Badge variant="info" className="bg-emerald-50 text-emerald-600 border-none font-black">{row.margin}</Badge>, width: 140, pinned: 'right' as const, className: 'text-center' }
                              ]
                            : [
                                { header: "BILL REF", accessor: 'billNo', width: 160, pinned: 'left' as const, className: 'font-mono font-black text-navy/40' },
                                { header: "TXN DATE", accessor: 'date', flex: 1, className: 'text-center font-black text-navy/20 uppercase tracking-widest' },
                                { header: "NET VAL", accessor: (row: any) => <span>₹{row.net.toLocaleString()}</span>, width: 160, className: 'text-right font-black' },
                                { header: "TAX APPLIED", accessor: (row: any) => <span className="text-rose-500 font-black">₹{row.tax.toLocaleString()}</span>, width: 160, pinned: 'right' as const, className: 'text-right' }
                              ]
                     }
                     overlayNoRowsTemplate={`
                       <div class="flex flex-col items-center justify-center opacity-10 h-full">
                          <Box size="60" class="mb-4" />
                          <div class="text-xs font-black uppercase tracking-[0.4em]">No Drill Down Data Available</div>
                       </div>
                     `}
                   />
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </Card>
    </div>
  )
}
