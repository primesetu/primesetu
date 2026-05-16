import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Filter, Calendar, ArrowUpRight, ArrowDownRight, Package, Users, ShoppingCart, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSovereignStore } from '@/core/stores/useSovereignStore';

type ReportTab = 'SALES' | 'PURCHASE' | 'STOCK' | 'CUSTOMER';

const MOCK_SALES = [
  { date:'12-May-26', billNo:'BL-9021', customer:'WALK-IN', items:3, amount:1240, gst:148.8, net:1091.2, mode:'CASH' },
  { date:'12-May-26', billNo:'BL-9022', customer:'RAJESH KUMAR', items:12, amount:8920.5, gst:1070.4, net:7850.1, mode:'CARD' },
  { date:'12-May-26', billNo:'BL-9023', customer:'ANITA SINGH', items:1, amount:450, gst:54, net:396, mode:'UPI' },
  { date:'11-May-26', billNo:'BL-9018', customer:'WALK-IN', items:5, amount:2310, gst:277.2, net:2032.8, mode:'CASH' },
  { date:'11-May-26', billNo:'BL-9017', customer:'SURESH MEHTA', items:8, amount:14500, gst:1740, net:12760, mode:'CARD' },
];

const SUMMARY_CARDS = [
  { label:'Total Sales', value:'₹2,74,850', trend:'+12.5%', up:true, icon:TrendingUp },
  { label:'Total Bills', value:'142', trend:'+8.1%', up:true, icon:ShoppingCart },
  { label:'Avg Bill Value', value:'₹1,936', trend:'+4.2%', up:true, icon:BarChart3 },
  { label:'GST Collected', value:'₹32,982', trend:'+12.5%', up:true, icon:Package },
];

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('SALES');
  const [dateFrom, setDateFrom] = useState('2026-05-01');
  const [dateTo, setDateTo] = useState('2026-05-12');
  const { getParam } = useSovereignStore();

  const isEnabled = (tab: ReportTab) => {
    if (tab === 'SALES') return true;
    if (tab === 'PURCHASE') return getParam('ShowPurchaseReport') !== '0';
    if (tab === 'STOCK') return getParam('ShowStockReport') !== '0';
    if (tab === 'CUSTOMER') return getParam('ShowCustomerReport') !== '0';
    return true;
  };

  const totalAmt = MOCK_SALES.reduce((s, r) => s + r.amount, 0);
  const totalGST = MOCK_SALES.reduce((s, r) => s + r.gst, 0);
  const totalNet = MOCK_SALES.reduce((s, r) => s + r.net, 0);

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_CARDS.map((c, i) => (
          <div key={i} className="bg-surface border border-outline-variant p-4 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-outline">{c.label}</span>
              <c.icon size={16} className="text-primary" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-mono font-black">{c.value}</span>
              <span className={cn("text-xs font-bold flex items-center", c.up ? 'text-emerald-600' : 'text-red-500')}>
                {c.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{c.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-surface border border-outline-variant p-3">
        <div className="flex items-center gap-2 text-[9px] font-black text-outline uppercase tracking-widest">
          <Calendar size={14} className="text-primary" />From:
        </div>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="h-9 px-3 bg-surface-container border border-outline-variant text-xs font-mono font-bold outline-none focus:border-primary" />
        <span className="text-[9px] font-black text-outline uppercase">To:</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="h-9 px-3 bg-surface-container border border-outline-variant text-xs font-mono font-bold outline-none focus:border-primary" />
        <button className="h-9 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest">Apply Filter</button>
        <div className="ml-auto flex gap-2">
          {(['SALES','PURCHASE','STOCK','CUSTOMER'] as ReportTab[]).filter(isEnabled).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={cn("h-9 px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === t ? "bg-primary text-white" : "border border-outline-variant hover:bg-surface-container text-outline")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-surface border border-outline-variant">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <BarChart3 size={14} />{activeTab} REPORT — {dateFrom} to {dateTo}
          </h3>
          <button className="h-8 px-4 border border-outline-variant text-[10px] font-black uppercase hover:bg-surface-container transition-all flex items-center gap-2">
            <Download size={12} />Export .xlsx
          </button>
        </div>

        {activeTab === 'SALES' && (
          <div className="overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container text-[9px] font-black uppercase tracking-widest text-outline">
                  {['Date','Bill No','Customer','Items','Amount (₹)','GST (₹)','Net (₹)','Mode'].map(h => (
                    <th key={h} className="p-3 border border-outline-variant whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {MOCK_SALES.map((r, i) => (
                  <tr key={i} className="hover:bg-surface-container/50 transition-colors cursor-pointer">
                    <td className="p-3 border border-outline-variant text-outline">{r.date}</td>
                    <td className="p-3 border border-outline-variant font-bold text-primary">{r.billNo}</td>
                    <td className="p-3 border border-outline-variant font-sans font-medium">{r.customer}</td>
                    <td className="p-3 border border-outline-variant text-center">{r.items}</td>
                    <td className="p-3 border border-outline-variant text-right font-bold">{r.amount.toFixed(2)}</td>
                    <td className="p-3 border border-outline-variant text-right text-outline">{r.gst.toFixed(2)}</td>
                    <td className="p-3 border border-outline-variant text-right font-bold">{r.net.toFixed(2)}</td>
                    <td className="p-3 border border-outline-variant">
                      <span className={cn("px-2 py-0.5 text-[9px] font-black uppercase",
                        r.mode==='CASH'?'bg-emerald-100 text-emerald-700':r.mode==='CARD'?'bg-blue-100 text-blue-700':'bg-violet-100 text-violet-700')}>
                        {r.mode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-primary text-white text-xs font-black">
                  <td colSpan={4} className="p-3 border border-primary/50 uppercase tracking-widest">Total ({MOCK_SALES.length} Bills)</td>
                  <td className="p-3 border border-primary/50 text-right font-mono">₹{totalAmt.toFixed(2)}</td>
                  <td className="p-3 border border-primary/50 text-right font-mono opacity-70">₹{totalGST.toFixed(2)}</td>
                  <td className="p-3 border border-primary/50 text-right font-mono">₹{totalNet.toFixed(2)}</td>
                  <td className="p-3 border border-primary/50" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {activeTab !== 'SALES' && (
          <div className="flex items-center justify-center h-48 text-outline/30">
            <div className="text-center space-y-2">
              <BarChart3 size={32} className="mx-auto" />
              <p className="text-xs font-black uppercase tracking-widest">{activeTab} Report — Coming Soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
