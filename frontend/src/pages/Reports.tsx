import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Download, Calendar, ArrowUpRight, ArrowDownRight, 
  Package, ShoppingCart, AlertTriangle, Layers, Percent, DollarSign 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSovereignStore } from '@/core/stores/useSovereignStore';

type ReportTab = 'SALES' | 'CLASS12_INTEL' | 'PURCHASE' | 'STOCK' | 'CUSTOMER';
type IntelReportType = 'MARGIN' | 'CONSIGNMENT' | 'EXPIRY' | 'SEASONAL' | 'FRANCHISE' | 'SERVICES';

const MOCK_SALES = [
  { date:'12-May-26', billNo:'BL-9021', customer:'WALK-IN', items:3, amount:1240, gst:148.8, net:1091.2, mode:'CASH' },
  { date:'12-May-26', billNo:'BL-9022', customer:'RAJESH KUMAR', items:12, amount:8920.5, gst:1070.4, net:7850.1, mode:'CARD' },
  { date:'12-May-26', billNo:'BL-9023', customer:'ANITA SINGH', items:1, amount:450, gst:54, net:396, mode:'UPI' },
  { date:'11-May-26', billNo:'BL-9018', customer:'WALK-IN', items:5, amount:2310, gst:277.2, net:2032.8, mode:'CASH' },
  { date:'11-May-26', billNo:'BL-9017', customer:'SURESH MEHTA', items:8, amount:14500, gst:1740, net:12760, mode:'CARD' },
];

const INTEL_REPORTS_LIST = [
  { id: 'MARGIN', name: 'Target vs. Realized Gross Margin Analysis', desc: 'Compares active retail markup targets with actual point-of-sale realized margins.' },
  { id: 'CONSIGNMENT', name: 'Vendor Consignment Pay-When-Sold Settlement', desc: 'Reconciles payouts due to inventory suppliers based strictly on units sold.' },
  { id: 'EXPIRY', name: 'Near-Expiry Safe-Sales Sequester Picklist', desc: 'Flags batched stock units that have crossed the stopsalesbefexpdays buffer.' },
  { id: 'SEASONAL', name: 'Seasonal Merchandise Clearance & Markdown Planner', desc: 'Recommends markdown actions based on historical fashion season classification codes.' },
  { id: 'FRANCHISE', name: 'Franchise Outlet & B2B Dealer Outward Billing', desc: 'Applies dynamic dealer markup configurations to secondary store stock transfers.' },
  { id: 'SERVICES', name: 'Services & Non-Inventory Net Revenue Contribution', desc: 'Isolates and measures alteration, packing, and shipping service profit margins.' }
];

const MOCK_MARGIN_DATA = [
  { product: 'Footwear', brand: 'Adidas', target: 45, units: 48, cost: 48000, realizedSales: 68400, profit: 20400, actualMarkup: 42.5, status: 'Margin Warning' },
  { product: 'Apparel', brand: 'Levis', target: 55, units: 112, cost: 112000, realizedSales: 174200, profit: 62200, actualMarkup: 55.5, status: 'Perfect Margin' },
  { product: 'Footwear', brand: 'Nike', target: 50, units: 34, cost: 68000, realizedSales: 102000, profit: 34000, actualMarkup: 50.0, status: 'Perfect Margin' },
  { product: 'Bags', brand: 'Wildcraft', target: 30, units: 89, cost: 35600, realizedSales: 44500, profit: 8900, actualMarkup: 25.0, status: 'Promo Clearance' },
];

const MOCK_CONSIGNMENT_DATA = [
  { vendor: 'VEND-ADIDAS-01', product: 'Footwear', brand: 'Adidas', sold: 24, cost: 1000, due: 24000, status: 'Reconciled' },
  { vendor: 'VEND-LEVIS-99', product: 'Apparel', brand: 'Levis', sold: 80, cost: 1200, due: 96000, status: 'Pending Payout' },
  { vendor: 'VEND-PUMA-102', product: 'Activewear', brand: 'Puma', sold: 45, cost: 700, due: 31500, status: 'Pending Payout' },
];

const MOCK_EXPIRY_DATA = [
  { bin: 'Aisle 4B', sku: 'SKU-COSM-021', name: 'L\'Oreal Face Wash', batch: 'BT-MAY-04', expiry: '2026-05-30', buffer: 15, stock: 32, daysLeft: 13, status: 'SEQUESTERED' },
  { bin: 'Rack 1A', sku: 'SKU-FOOD-119', name: 'Cadbury Premium Pack', batch: 'BT-APR-88', expiry: '2026-05-25', buffer: 10, stock: 18, daysLeft: 8, status: 'SEQUESTERED' },
  { bin: 'Aisle 2C', sku: 'SKU-COSM-092', name: 'Nivea Soft Moisturizer', batch: 'BT-JUN-12', expiry: '2026-06-05', buffer: 15, stock: 44, daysLeft: 19, status: 'Safe (Active)' },
];

const MOCK_SEASONAL_DATA = [
  { season: 'SS25 (Spring/Summer)', product: 'Apparel', brand: 'Levis', units: 140, valuation: 140000, recommendedMarkdown: 50, status: 'Clearance Candidate' },
  { season: 'FW25 (Fall/Winter)', product: 'Jackets', brand: 'Nike', units: 65, valuation: 195000, recommendedMarkdown: 20, status: 'End of Season' },
  { season: 'SS26 (Spring/Summer)', product: 'Footwear', brand: 'Adidas', units: 85, valuation: 255000, recommendedMarkdown: 0, status: 'Active (Full Price)' },
];

const MOCK_FRANCHISE_DATA = [
  { transferId: 'TRF-1092', destination: 'FO-DELHI-01', product: 'Footwear', brand: 'Adidas', qty: 120, costValue: 120000, markup: 12, billingValue: 134400 },
  { transferId: 'TRF-1099', destination: 'FO-MUMBAI-03', product: 'Apparel', brand: 'Levis', qty: 250, costValue: 250000, markup: 15, billingValue: 287500 },
];

const MOCK_SERVICES_DATA = [
  { stream: 'Alteration Services (Stitching)', txns: 184, revenue: 36800, cogs: 0, profit: 36800, margin: 100 },
  { stream: 'Gift Wrapping (Premium)', txns: 92, revenue: 4600, cogs: 0, profit: 4600, margin: 100 },
  { stream: 'Standard Stock Retail Sales', txns: 942, revenue: 1884000, cogs: 980000, profit: 904000, margin: 48 },
];

const SUMMARY_CARDS = [
  { label:'Total Sales', value:'₹2,74,850', trend:'+12.5%', up:true, icon:TrendingUp },
  { label:'Total Bills', value:'142', trend:'+8.1%', up:true, icon:ShoppingCart },
  { label:'Avg Bill Value', value:'₹1,936', trend:'+4.2%', up:true, icon:BarChart3 },
  { label:'GST Collected', value:'₹32,982', trend:'+12.5%', up:true, icon:Package },
];

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('SALES');
  const [activeIntelReport, setActiveIntelReport] = useState<IntelReportType>('MARGIN');
  const [dateFrom, setDateFrom] = useState('2026-05-01');
  const [dateTo, setDateTo] = useState('2026-05-12');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { getParam } = useSovereignStore();

  const isEnabled = (tab: ReportTab) => {
    if (tab === 'SALES') return true;
    if (tab === 'CLASS12_INTEL') return true;
    if (tab === 'PURCHASE') return getParam('ShowPurchaseReport') !== '0';
    if (tab === 'STOCK') return getParam('ShowStockReport') !== '0';
    if (tab === 'CUSTOMER') return getParam('ShowCustomerReport') !== '0';
    return true;
  };

  const totalAmt = MOCK_SALES.reduce((s, r) => s + r.amount, 0);
  const totalGST = MOCK_SALES.reduce((s, r) => s + r.gst, 0);
  const totalNet = MOCK_SALES.reduce((s, r) => s + r.net, 0);

  const currentIntelReportDetails = INTEL_REPORTS_LIST.find(r => r.id === activeIntelReport);

  const getFilteredIntelData = () => {
    const q = searchQuery.toLowerCase();
    switch(activeIntelReport) {
      case 'MARGIN':
        return MOCK_MARGIN_DATA.filter(row => row.product.toLowerCase().includes(q) || row.brand.toLowerCase().includes(q) || row.status.toLowerCase().includes(q));
      case 'CONSIGNMENT':
        return MOCK_CONSIGNMENT_DATA.filter(row => row.vendor.toLowerCase().includes(q) || row.brand.toLowerCase().includes(q) || row.status.toLowerCase().includes(q));
      case 'EXPIRY':
        return MOCK_EXPIRY_DATA.filter(row => row.sku.toLowerCase().includes(q) || row.name.toLowerCase().includes(q) || row.status.toLowerCase().includes(q));
      case 'SEASONAL':
        return MOCK_SEASONAL_DATA.filter(row => row.season.toLowerCase().includes(q) || row.brand.toLowerCase().includes(q) || row.status.toLowerCase().includes(q));
      case 'FRANCHISE':
        return MOCK_FRANCHISE_DATA.filter(row => row.destination.toLowerCase().includes(q) || row.brand.toLowerCase().includes(q) || row.transferId.toLowerCase().includes(q));
      case 'SERVICES':
        return MOCK_SERVICES_DATA.filter(row => row.stream.toLowerCase().includes(q));
    }
  };

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

      {/* Filter & Selector Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-surface border border-outline-variant p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[9px] font-black text-outline uppercase tracking-widest">
            <Calendar size={14} className="text-primary" />From:
          </div>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="h-9 px-3 bg-surface-container border border-outline-variant text-xs font-mono font-bold outline-none focus:border-primary" />
          <span className="text-[9px] font-black text-outline uppercase">To:</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="h-9 px-3 bg-surface-container border border-outline-variant text-xs font-mono font-bold outline-none focus:border-primary" />
          <button className="h-9 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/95 transition-all">Apply Filter</button>
        </div>
        
        <div className="md:ml-auto flex flex-wrap gap-2">
          {(['SALES', 'CLASS12_INTEL', 'PURCHASE', 'STOCK', 'CUSTOMER'] as ReportTab[]).filter(isEnabled).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={cn("h-9 px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === t ? "bg-primary text-white" : "border border-outline-variant hover:bg-surface-container text-outline")}>
              {t === 'CLASS12_INTEL' ? '🧬 CLASS12 INTEL' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Class12 Combo Intelligence reports engine */}
      {activeTab === 'CLASS12_INTEL' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {/* Sidebar Report Type Selector */}
          <div className="xl:col-span-1 bg-[#0f172a] border border-outline-variant p-4 space-y-4 rounded-xl">
            <div className="space-y-1">
              <h4 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em]">Sovereign BI Suite</h4>
              <p className="text-[9px] font-bold text-outline uppercase leading-relaxed">Select a Class12Combo linked intelligence rule report</p>
            </div>
            
            <div className="flex flex-col gap-1.5">
              {INTEL_REPORTS_LIST.map((rpt) => (
                <button
                  key={rpt.id}
                  onClick={() => {
                    setActiveIntelReport(rpt.id as IntelReportType);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "w-full text-left p-3 border text-xs font-black uppercase transition-all tracking-wider flex flex-col gap-1 rounded-lg",
                    activeIntelReport === rpt.id 
                      ? "bg-gradient-to-r from-brand-gold/15 to-transparent border-brand-gold text-brand-gold font-black" 
                      : "border-outline-variant text-outline hover:bg-white/5"
                  )}
                >
                  <span className="leading-tight">{rpt.name}</span>
                  <span className="text-[8px] font-bold opacity-60 text-outline leading-tight normal-case">{rpt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Central Intel Table workspace */}
          <div className="xl:col-span-3 bg-[#0f172a] border border-outline-variant flex flex-col rounded-xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/5">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Layers size={14} className="text-brand-gold" /> {currentIntelReportDetails?.name}
                </h3>
                <p className="text-[9px] font-bold text-outline uppercase leading-none">{currentIntelReportDetails?.desc}</p>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Instant Filter..."
                  className="h-8 px-3 bg-[#020617] border border-outline-variant rounded-md text-xs font-bold text-white focus:outline-none focus:border-brand-gold/50 placeholder-white/30"
                />
                <button className="h-8 px-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/95 flex items-center gap-2 transition-all">
                  <Download size={12} />Export
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto min-h-[300px]">
              {/* Report 1: Target vs Realized Margin */}
              {activeIntelReport === 'MARGIN' && (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-outline">
                      {['Product Group', 'Brand Class', 'Target Markup', 'Realized Qty', 'Valuation Cost', 'Realized Revenue', 'Gross Profit', 'Realized Markup', 'Status'].map(h => (
                        <th key={h} className="p-3 border border-outline-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs text-white">
                    {getFilteredIntelData()?.map((row: any, i) => (
                      <tr key={i} className="hover:bg-white/5 border-b border-outline-variant/40 transition-colors">
                        <td className="p-3 font-sans font-black text-brand-gold">{row.product}</td>
                        <td className="p-3 font-sans font-bold">{row.brand}</td>
                        <td className="p-3 text-right">{row.target}%</td>
                        <td className="p-3 text-center">{row.units}</td>
                        <td className="p-3 text-right">₹{row.cost.toLocaleString()}</td>
                        <td className="p-3 text-right">₹{row.realizedSales.toLocaleString()}</td>
                        <td className="p-3 text-right text-emerald-400 font-black">₹{row.profit.toLocaleString()}</td>
                        <td className="p-3 text-right font-black">{row.actualMarkup}%</td>
                        <td className="p-3">
                          <span className={cn(
                            "px-2 py-0.5 text-[8px] font-black uppercase rounded-full",
                            row.status === 'Perfect Margin' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                            row.status === 'Margin Warning' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          )}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Report 2: Consignment Settlement */}
              {activeIntelReport === 'CONSIGNMENT' && (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-outline">
                      {['Preferred Vendor ID', 'Product Group', 'Brand Class', 'Sold Qty', 'Unit Cost', 'Payout Settlement Due', 'Status'].map(h => (
                        <th key={h} className="p-3 border border-outline-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs text-white">
                    {getFilteredIntelData()?.map((row: any, i) => (
                      <tr key={i} className="hover:bg-white/5 border-b border-outline-variant/40 transition-colors">
                        <td className="p-3 text-brand-gold font-black">{row.vendor}</td>
                        <td className="p-3 font-sans font-bold">{row.product}</td>
                        <td className="p-3 font-sans">{row.brand}</td>
                        <td className="p-3 text-center font-black">{row.sold}</td>
                        <td className="p-3 text-right">₹{row.cost}</td>
                        <td className="p-3 text-right text-emerald-400 font-black">₹{row.due.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={cn(
                            "px-2 py-0.5 text-[8px] font-black uppercase rounded-full",
                            row.status === 'Reconciled' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          )}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Report 3: Expiry Safe-Sales Block */}
              {activeIntelReport === 'EXPIRY' && (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-outline">
                      {['Store Bin', 'SKU Code', 'Item Name', 'Batch No', 'Expiry Date', 'Buffer (Days)', 'Stock Hand', 'Days Left', 'Safe-Sales Gate'].map(h => (
                        <th key={h} className="p-3 border border-outline-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs text-white">
                    {getFilteredIntelData()?.map((row: any, i) => (
                      <tr key={i} className="hover:bg-white/5 border-b border-outline-variant/40 transition-colors">
                        <td className="p-3 text-outline font-black">{row.bin}</td>
                        <td className="p-3 font-black text-brand-gold">{row.sku}</td>
                        <td className="p-3 font-sans">{row.name}</td>
                        <td className="p-3 font-black">{row.batch}</td>
                        <td className="p-3 text-rose-400">{row.expiry}</td>
                        <td className="p-3 text-center">{row.buffer} Days</td>
                        <td className="p-3 text-center font-black">{row.stock}</td>
                        <td className="p-3 text-center font-black text-rose-400">{row.daysLeft} Days</td>
                        <td className="p-3">
                          <span className={cn(
                            "px-2 py-0.5 text-[8px] font-black uppercase rounded-full",
                            row.status === 'SEQUESTERED' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          )}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Report 4: Seasonal Clearance Markdown */}
              {activeIntelReport === 'SEASONAL' && (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-outline">
                      {['Fashion Season Class', 'Product Group', 'Brand Class', 'Total Units', 'Valuation Cost', 'Suggested Markdown', 'Clearance Action'].map(h => (
                        <th key={h} className="p-3 border border-outline-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs text-white">
                    {getFilteredIntelData()?.map((row: any, i) => (
                      <tr key={i} className="hover:bg-white/5 border-b border-outline-variant/40 transition-colors">
                        <td className="p-3 text-brand-gold font-black">{row.season}</td>
                        <td className="p-3 font-sans font-bold">{row.product}</td>
                        <td className="p-3 font-sans">{row.brand}</td>
                        <td className="p-3 text-center font-black">{row.units}</td>
                        <td className="p-3 text-right">₹{row.valuation.toLocaleString()}</td>
                        <td className="p-3 text-center text-amber-400 font-black">{row.recommendedMarkdown}%</td>
                        <td className="p-3">
                          <span className={cn(
                            "px-2 py-0.5 text-[8px] font-black uppercase rounded-full",
                            row.status === 'Clearance Candidate' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                            row.status === 'End of Season' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          )}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Report 5: Franchise Outward transfers */}
              {activeIntelReport === 'FRANCHISE' && (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-outline">
                      {['Transfer ID', 'Franchise Outlet', 'Product Group', 'Brand Class', 'Shipped Qty', 'Depot Cost Value', 'Dealer Markup %', 'Invoice Billing Value'].map(h => (
                        <th key={h} className="p-3 border border-outline-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs text-white">
                    {getFilteredIntelData()?.map((row: any, i) => (
                      <tr key={i} className="hover:bg-white/5 border-b border-outline-variant/40 transition-colors">
                        <td className="p-3 text-primary font-black">{row.transferId}</td>
                        <td className="p-3 font-sans font-black text-brand-gold">{row.destination}</td>
                        <td className="p-3 font-sans">{row.product}</td>
                        <td className="p-3 font-sans">{row.brand}</td>
                        <td className="p-3 text-center">{row.qty}</td>
                        <td className="p-3 text-right">₹{row.costValue.toLocaleString()}</td>
                        <td className="p-3 text-center text-brand-gold font-black">+{row.markup}%</td>
                        <td className="p-3 text-right text-emerald-400 font-black">₹{row.billingValue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Report 6: Alteration & Services margins */}
              {activeIntelReport === 'SERVICES' && (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-outline">
                      {['Service Revenue Stream', 'Sales Transactions', 'Net Revenue', 'Service COGS', 'Net Profit Contribution', 'Gross Profit Margin'].map(h => (
                        <th key={h} className="p-3 border border-outline-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs text-white">
                    {getFilteredIntelData()?.map((row: any, i) => (
                      <tr key={i} className="hover:bg-white/5 border-b border-outline-variant/40 transition-colors">
                        <td className="p-3 font-sans font-black text-brand-gold">{row.stream}</td>
                        <td className="p-3 text-center font-black">{row.txns}</td>
                        <td className="p-3 text-right">₹{row.revenue.toLocaleString()}</td>
                        <td className="p-3 text-right text-outline">₹{row.cogs}</td>
                        <td className="p-3 text-right text-emerald-400 font-black">₹{row.profit.toLocaleString()}</td>
                        <td className="p-3 text-right text-emerald-400 font-black">{row.margin}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Core Sales report (Tab 1) */}
      {activeTab === 'SALES' && (
        <div className="bg-surface border border-outline-variant">
          <div className="flex items-center justify-between p-4 border-b border-outline-variant">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <BarChart3 size={14} />{activeTab} REPORT — {dateFrom} to {dateTo}
            </h3>
            <button className="h-8 px-4 border border-outline-variant text-[10px] font-black uppercase hover:bg-surface-container transition-all flex items-center gap-2">
              <Download size={12} />Export .xlsx
            </button>
          </div>

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
        </div>
      )}

      {/* Other tabs fallback */}
      {activeTab !== 'SALES' && activeTab !== 'CLASS12_INTEL' && (
        <div className="bg-surface border border-outline-variant flex items-center justify-center h-64 text-outline/30">
          <div className="text-center space-y-2">
            <BarChart3 size={32} className="mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest">{activeTab} Report — Coming Soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
