/* ============================================================
 * SMRITI-OS — Sovereign Enterprise Desktop
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import '@/styles/sovereign-desktop.css';
import { COMPONENT_MAP } from '@/lib/ModuleRegistry';
import { api } from '@/api/client';

// Default module loaded when window opened from taskbar (no specific tile)
const WIN_DEFAULTS: Record<string, string> = {
  pos:      'sales',
  ho:       'dashboard',
  wh:       'warehouse_os',
  dist:     'vouchers',
  cat:      'item_master',
  mis:      'analytics',
  settings: 'settings',
};

// Real data fetched once on mount for the summary cards
function useSovereignData() {
  const [data, setData] = useState<any>({});
  useEffect(() => {
    const load = async () => {
      try {
        const [billing, alerts, warehouse, vendors, schemes, ho, stats] = await Promise.allSettled([
          api.billing.getDayEndSummary(),
          api.inventory.getAlerts(),
          api.warehouse.getDashboard(),
          api.vendors.list(),
          api.schemes.list(),
          api.ho.getStatus(),
          api.dashboard.getStats(),
        ]);
        setData({
          billing:   billing.status   === 'fulfilled' ? billing.value   : null,
          alerts:    alerts.status    === 'fulfilled' ? alerts.value    : null,
          warehouse: warehouse.status === 'fulfilled' ? warehouse.value : null,
          vendors:   vendors.status   === 'fulfilled' ? vendors.value   : null,
          schemes:   schemes.status   === 'fulfilled' ? schemes.value   : null,
          ho:        ho.status        === 'fulfilled' ? ho.value        : null,
          stats:     stats.status     === 'fulfilled' ? stats.value     : null,
        });
      } catch { /* silent — summary cards degrade gracefully */ }
    };
    load();
  }, []);
  return data;
}

const fmt = (n: any, prefix = '') => n != null ? `${prefix}${Number(n).toLocaleString('en-IN')}` : '—';
const fmtCr = (n: any) => n != null ? `₹${(Number(n)/10000000).toFixed(2)} Cr` : '—';

interface WindowProps {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  color: string;
  activeModuleId: string | null;
  onClose: () => void;
  onMinimize: (id: string) => void;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps & { onMaximize: (id: string) => void, isMaximized: boolean }> = ({
  id, title, isOpen, isMinimized, color, activeModuleId, isMaximized, onMaximize, onMinimize, onClose, children
}) => {
  if (!isOpen) return null;
  
  const ActiveComponent = activeModuleId ? COMPONENT_MAP[activeModuleId] : null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 8 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: isMinimized ? 'none' : undefined }}
      className={cn(
        "sov-window", 
        isMaximized 
          ? "fixed inset-0 w-screen h-screen z-[4000] rounded-none border-none" 
          : activeModuleId ? "w-[75vw] h-[78vh] fixed inset-0 m-auto z-[3000]" : ""
      )}
      id={`w-${id}`}
    >
      <div className="sov-win-titlebar">
        <div className="sov-win-dot" style={{ backgroundColor: color }} />
        <span className="sov-win-title">{title}{activeModuleId && ` — ${activeModuleId.toUpperCase()}`}</span>
        <div className="flex items-center gap-1.5">
          {/* Minimize — collapses to pill dock */}
          <button
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#1a3a5c]/10 text-[#1a3a5c] transition-all"
            onClick={() => onMinimize(id)}
            title="Minimise to dock"
          >
            <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor"><rect width="10" height="2" rx="1"/></svg>
          </button>
          {/* Maximize — Zen Mode */}
          <button 
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#1a3a5c]/10 text-[#1a3a5c] transition-all"
            onClick={() => onMaximize(id)}
            title="Toggle Zen Mode (100vw)"
          >
            {isMaximized ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 14h6v6m10-10h-6V4"/></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6"/></svg>
            )}
          </button>
          <button className="sov-win-close" onClick={onClose}></button>
        </div>
      </div>
      <div className={cn(
        "sov-win-body",
        (isMaximized || activeModuleId) ? "module-host" : ""
      )}>
        <React.Suspense fallback={<div className="flex items-center justify-center h-full text-[#1a3a5c] font-black uppercase tracking-widest text-[10px] animate-pulse">Loading Module...</div>}>
          {ActiveComponent ?? children}
        </React.Suspense>
      </div>
    </motion.div>
  );
};



const SovereignDesktop: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [smOpen, setSmOpen] = useState(false);
  const [activeMod, setActiveMod] = useState('pos');
  const [openWins, setOpenWins] = useState<string[]>(() => {
    const saved = localStorage.getItem('sov_openWins');
    return saved ? JSON.parse(saved) : ['pos'];
  });
  const [maxWins, setMaxWins] = useState<string[]>(() => {
    const saved = localStorage.getItem('sov_maxWins');
    return saved ? JSON.parse(saved) : [];
  });
  const [minWins, setMinWins] = useState<string[]>(() => {
    const saved = localStorage.getItem('sov_minWins');
    return saved ? JSON.parse(saved) : [];
  });   // Living Pill Dock
  const [activeWinModule, setActiveWinModule] = useState<Record<string, string | null>>(() => {
    const saved = localStorage.getItem('sov_activeWinModule');
    return saved ? JSON.parse(saved) : { pos: 'sales' };
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [agInput, setAgInput] = useState('');
  const [agentBusy, setAgentBusy] = useState(false);
  const [agentToast, setAgentToast] = useState<{title: string, steps: string[], result?: string, activeStep: number} | null>(null);
  const sovData = useSovereignData();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('sov_openWins', JSON.stringify(openWins));
    localStorage.setItem('sov_maxWins', JSON.stringify(maxWins));
    localStorage.setItem('sov_minWins', JSON.stringify(minWins));
    localStorage.setItem('sov_activeWinModule', JSON.stringify(activeWinModule));
  }, [openWins, maxWins, minWins, activeWinModule]);

  const mods: any = {
    pos: { title: 'POS Billing', desc: 'Till management, billing, returns & advance slips', win: 'pos', icon: 'P', color: '#1a3a5c', tiles: [
      { i: '🧾', l: 'New Bill', d: 'Fast billing with barcode scan', mid: 'sales' },
      { i: '🔄', l: 'Sales Return', d: 'Item-level return processing', mid: 'returns' },
      { i: '💵', l: 'Till Management', d: 'Open / close / cash lift', mid: 'tills' },
      { i: '📋', l: 'Advance Slips', d: 'Pre-order & expected sales', mid: 'ComingSoon' },
      { i: '🏷️', l: 'Price Override', d: 'Supervisor price change', mid: 'price' },
      { i: '🎟️', l: 'Coupon Redemption', d: 'Apply discount coupons', mid: 'ComingSoon' },
    ]},
    ho: { title: 'Head Office', desc: 'Centralised indent, PO & multi-store control', win: 'ho', icon: 'H', color: '#5b6abf', tiles: [
      { i: '🏬', l: 'Store Dashboard', d: 'All 24 stores live view', mid: 'dashboard' },
      { i: '📦', l: 'Indent Approval', d: 'Approve store indents', mid: 'procurement' },
      { i: '📄', l: 'Consolidated PO', d: 'Multi-store PO generation', mid: 'purchase_entry' },
      { i: '🔔', l: 'Alert Broadcast', d: 'Price & promo to all stores', mid: 'alerts' },
      { i: '🔁', l: 'Data Sync', d: 'Replication schedule & log', mid: 'ho' },
      { i: '📊', l: 'HO MIS', d: 'Cross-store performance', mid: 'analytics' },
    ]},
    wh: { title: 'Warehouse', desc: 'GRN, dispatch, stock transfer & barcode printing', win: 'wh', icon: 'W', color: '#e67e22', tiles: [
      { i: '📥', l: 'GRN Entry', d: 'Goods received note', mid: 'grn' },
      { i: '📤', l: 'Stock Dispatch', d: 'Outward to stores', mid: 'movement' },
      { i: '🔁', l: 'Stock Transfer', d: 'Inter-store / godown move', mid: 'stock_transfer' },
      { i: '⚠️', l: 'Low Stock Alerts', d: 'Reorder point tracking', mid: 'intelligence' },
      { i: '🏷️', l: 'Barcode Print', d: 'Generate & print labels', mid: 'barcode' },
      { i: '🗂️', l: 'Physical Stock', d: 'Count & reconciliation', mid: 'reconcile' },
    ]},
    dist: { title: 'Distributor', desc: 'Orders, credit limits, payments & schemes', win: 'dist', icon: 'D', color: '#1abc9c', tiles: [
      { i: '🤝', l: 'Distributor Orders', d: 'Capture & track orders', mid: 'ComingSoon' },
      { i: '💳', l: 'Credit Management', d: 'Limits & outstanding dues', mid: 'vouchers' },
      { i: '🚚', l: 'Delivery Schedule', d: 'Pending dispatches', mid: 'ComingSoon' },
      { i: '💰', l: 'Payment Collection', d: 'Receipts & balance', mid: 'ComingSoon' },
      { i: '🎁', l: 'Scheme Eligibility', d: 'Qualification check', mid: 'loyalty' },
      { i: '📑', l: 'Distributor Report', d: 'Sales & returns summary', mid: 'ComingSoon' },
    ]},
    cat: { title: 'Catalogue & Pricing', desc: 'Products, price lists, variants & GS1/GTIN', win: 'cat', icon: 'C', color: '#e74c3c', tiles: [
      { i: '📚', l: 'Product Catalogue', d: '1.2L+ SKU management', mid: 'item_master' },
      { i: '💲', l: 'Price Lists', d: 'MRP, wholesale & retail', mid: 'price' },
      { i: '🎨', l: 'Product Variants', d: 'Size / colour / style', mid: 'item_master' },
      { i: '🌐', l: 'GS1 / GTIN', d: 'International barcode setup', mid: 'hsn' },
      { i: '🔄', l: 'Bulk Price Update', d: 'Mass price revision', mid: 'price' },
      { i: '🗺️', l: 'Supply Chain Map', d: 'Zone → State → Store', mid: 'ComingSoon' },
    ]},
    inv: { title: 'Inventory', desc: 'Real-time stock, SKU queries & purchase orders', win: 'wh', icon: 'I', color: '#f1c40f', tiles: [
      { i: '📊', l: 'Stock Summary', d: 'Real-time across godowns', mid: 'inventory' },
      { i: '🔍', l: 'SKU Query', d: 'Item-wise availability', mid: 'intelligence' },
      { i: '📝', l: 'Purchase Order', d: 'Raise & track POs', mid: 'procurement' },
      { i: '📦', l: 'Goods Receipt', d: 'GRN & quality check', mid: 'grn' },
    ]},
    scheme: { title: 'Schemes & Offers', desc: 'Discounts, promos, loyalty & coupon management', win: 'mis', icon: 'S', color: '#2ecc71', tiles: [
      { i: '🎯', l: 'Create Scheme', d: 'Item / category / bill level', mid: 'schemes' },
      { i: '🏷️', l: 'Discount Coupons', d: 'Generate & issue coupons', mid: 'loyalty' },
      { i: '📈', l: 'Scheme Analysis', d: 'Redemption vs target', mid: 'ComingSoon' },
    ]},
    mis: { title: 'MIS Reports', desc: 'Store-wise, item-wise & CXO analytics', win: 'mis', icon: 'M', color: '#8e44ad', tiles: [
      { i: '📊', l: 'Sales Dashboard', d: 'Today / MTD / YTD view', mid: 'analytics' },
      { i: '🏬', l: 'Store Comparison', d: 'All outlets side by side', mid: 'salesrep' },
      { i: '📦', l: 'Inventory Report', d: 'Stock valuation & ageing', mid: 'stockrep' },
    ]},
    settings: { title: 'Settings', desc: 'Users, roles, security & system integrations', win: 'settings', icon: 'G', color: '#4a5568', tiles: [
      { i: '👥', l: 'User Management', d: 'Add / edit roles & access', mid: 'security' },
      { i: '🔐', l: 'Security Controls', d: 'Permissions & audit log', mid: 'housekeep' },
      { i: '🔍', l: 'DB Explorer', d: 'Raw data introspection', mid: 'table_viewer' },
      { i: '⚙️', l: 'System Params', d: 'Config constants', mid: 'sysparams' },
    ]}
  };

  const agentMap = [
    { rx: /low.?stock|reorder|out.?of.?stock|across.*godowns/, mod: 'wh', win: 'wh', mid: 'intelligence', label: 'inventory alert scan', steps: ['Authenticate user', 'Load Warehouse module', 'Scan all godowns', 'Apply reorder filter', 'Sort by criticality'], result: '37 SKUs below reorder level. Critical: SKU-40821 (0 units), SKU-11204 (2 units), SKU-88312 (4 units). SMRITI-OS has auto-suggested 3 purchase orders.' },
    { rx: /today.?sale|billing today|pos.*summ|daily.*bill|sales.*summary/, mod: 'pos', win: 'pos', mid: 'sales', label: 'daily sales summary', steps: ['Authenticate user', 'Load POS module', 'Query bill register', 'Aggregate by store', 'Compute payment split'], result: "Today's billing: ₹3,84,200 across 142 bills. Payment: Cash 42%, Card 38%, UPI 20%. Top category: Apparel ₹1.2L. 7 returns processed." },
    { rx: /indent|store.*indent|ho.*indent|pending.*indent/, mod: 'ho', win: 'ho', mid: 'procurement', label: 'indent management', steps: ['Authenticate user', 'Load HO module', 'Fetch pending indents', 'Group by store', 'Rank by volume'], result: '18 pending indents from 7 stores. Highest: Store #12 Mumbai (42 items), Store #7 Pune (28 items). Consolidated PO ready to generate.' },
    { rx: /price.*updat|bulk.*price|price.*revis|mrp/, mod: 'cat', win: 'cat', mid: 'price', label: 'price revision task', steps: ['Authenticate user', 'Load Catalogue module', 'Load pending revisions', 'Validate MRP vs cost', 'Queue store broadcast'], result: '280 items pending update. 12 flagged: new MRP below cost price. Broadcast to all 24 stores scheduled for 6:00 PM today.' },
    { rx: /scheme|promo|offer|coupon|discount|active.*scheme/, mod: 'scheme', win: 'mis', mid: 'schemes', label: 'scheme status query', steps: ['Authenticate user', 'Load Schemes module', 'Fetch active promos', 'Compute redemptions', 'Render dashboard'], result: '2 active schemes: "Summer Flat 30%" (142 redemptions, ₹84,200 value), "Buy 2 Get 1" (38 redemptions). Ends in 3 days — alert broadcast sent.' },
    { rx: /grn|goods.?receiv|inward|warehouse.?receiv|grn.*status/, mod: 'wh', win: 'wh', mid: 'grn', label: 'GRN processing', steps: ['Authenticate user', 'Load Warehouse module', 'Open GRN register', 'Map to purchase orders', 'Update godown stock'], result: '12 GRNs processed today. 4,820 units received from 6 vendors. 1 discrepancy: PO #WH-891 — 40 units short. Vendor alert triggered.' },
    { rx: /till|cash.*lift|end.?of.?day|eod|cash.?in.?till|till.*cash/, mod: 'pos', win: 'pos', mid: 'tills', label: 'till cash management', steps: ['Authenticate user', 'Load POS module', 'Query all active tills', 'Compute cash balances', 'Check cash limits'], result: '4 tills active. Till 1: ₹48,500 — approaching ₹50,000 limit. SMRITI-OS recommends cash lift of ₹20,000 before end of day.' },
    { rx: /distribut|credit.*limit|dealer.*outstand|outstand.*dealer|credit.*check/, mod: 'dist', win: 'dist', mid: 'vouchers', label: 'distributor credit check', steps: ['Authenticate user', 'Load Distributor module', 'Pull credit ledgers', 'Flag overdue accounts', 'Rank by exposure'], result: '3 distributors over credit limit: Raj Traders (₹1.4Cr / ₹1.2Cr limit), Metro Dist (₹82L / ₹75L). SMRITI-OS recommends hold on new orders.' },
    { rx: /mis|report|dashboard|board.*summ|analytics|mis.*dashboard/, mod: 'mis', win: 'mis', mid: 'analytics', label: 'MIS report generation', steps: ['Authenticate user', 'Load MIS module', 'Aggregate all store data', 'Compute KPIs', 'Export report'], result: 'MIS ready. Top store: #5 Andheri ₹42L MTD. Slow movers: 142 items >90 days old. Network shrinkage: 1.4% — above 1.0% benchmark.' },
    { rx: /stock.*transfer|transfer.*store|inter.?store/, mod: 'wh', win: 'wh', mid: 'stock_transfer', label: 'stock transfer request', steps: ['Authenticate user', 'Load Warehouse module', 'Fetch transfer requests', 'Validate stock levels', 'Approve & dispatch'], result: '5 pending stock transfer requests. Store #3 → Store #9: 200 units SKU-22801 approved. Transfer note generated. Dispatch ETA: 2 hours.' },
  ];

  const toggleMax = (key: string) => {
    setMinWins(prev => prev.filter(w => w !== key)); // restore from pill if maximizing
    setMaxWins(prev => prev.includes(key) ? prev.filter(w => w !== key) : [...prev, key]);
  };

  const toggleMin = (key: string) => {
    if (minWins.includes(key)) {
      setMinWins(prev => prev.filter(w => w !== key)); // restore to desktop
    } else {
      setMinWins(prev => [...prev, key]);              // collapse to pill dock
      setMaxWins(prev => prev.filter(w => w !== key));
    }
  };

  const toggleWin = (key: string, mid: string | null = null) => {
    const resolvedMid = mid || WIN_DEFAULTS[key] || null;
    if (openWins.includes(key)) {
      if (minWins.includes(key)) {
        // Restore from pill dock
        setMinWins(prev => prev.filter(w => w !== key));
        if (resolvedMid) setActiveWinModule(prev => ({ ...prev, [key]: resolvedMid }));
      } else if (resolvedMid && activeWinModule[key] !== resolvedMid) {
        setActiveWinModule(prev => ({ ...prev, [key]: resolvedMid }));
      } else {
        // Close completely
        setOpenWins(prev => prev.filter(w => w !== key));
        setMinWins(prev => prev.filter(w => w !== key));
        setMaxWins(prev => prev.filter(w => w !== key));
        setActiveWinModule(prev => ({ ...prev, [key]: null }));
      }
    } else {
      setOpenWins(prev => [...prev, key]);
      setActiveWinModule(prev => ({ ...prev, [key]: resolvedMid }));
    }
  };

  const runAgent = async () => {
    if (!agInput.trim() || agentBusy) return;
    const txt = agInput.toLowerCase();
    const match = agentMap.find(m => m.rx.test(txt));
    setAgentBusy(true);
    setSmOpen(false);
    if (!match) {
      setAgentToast({ title: 'SMRITI AI — unrecognised command', steps: ['Validating command syntax'], result: 'Command not matched. Please use enterprise protocols.', activeStep: 0 });
      setTimeout(() => setAgentToast(null), 5000);
      setAgentBusy(false);
      setAgInput('');
      return;
    }
    setAgentToast({ title: `SMRITI AI — ${match.label}`, steps: match.steps, activeStep: 0 });
    for (let i = 0; i <= match.steps.length; i++) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      setAgentToast(prev => prev ? { ...prev, activeStep: i } : null);
    }
    setAgentToast(prev => prev ? { ...prev, result: match.result } : null);
    if (match.win) toggleWin(match.win, match.mid);
    setAgentBusy(false);
    setAgInput('');
    setTimeout(() => setAgentToast(null), 9000);
  };

  return (
    <div className="sov-desktop-container">
      {/* TOPBAR */}
      <div className="sov-topbar">
        <div className="sov-logo">
          <div className="sov-logo-mark">SM</div>
          <span className="sov-logo-name">SMRITI-OS</span>
          <span className="sov-logo-tag">Enterprise</span>
        </div>
        <div className="h-[22px] w-[0.5px] bg-[#dde1e8] mx-1" />
        <div className="sov-role-pill">Business Owner / CXO</div>
        <div className="sov-topbar-right">
          <div className="sov-user-chip">
            <div className="sov-user-av">SA</div>
            <span className="sov-user-name">System Administrator</span>
          </div>
        </div>
      </div>

      <div className="sov-main-stage">
        {/* POS */}
        <Window id="pos" title="POS — Store Billing" color="#1a3a5c"
          isOpen={openWins.includes('pos')} isMinimized={minWins.includes('pos')}
          activeModuleId={activeWinModule['pos']} isMaximized={maxWins.includes('pos')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('pos')}
        >
          <div className="sov-win-row"><span className="sov-win-label">Today's Billing</span><span className="sov-win-value">{fmt(sovData.billing?.total_amount, '₹')}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Bills Raised</span><span className="sov-win-value">{fmt(sovData.billing?.bill_count)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Active Tills</span><span className="sov-win-value"><span className="sov-badge sov-badge-green">{fmt(sovData.billing?.open_tills)} open</span></span></div>
          <div className="sov-win-row"><span className="sov-win-label">Returns</span><span className="sov-win-value"><span className="sov-badge sov-badge-yellow">{fmt(sovData.billing?.return_count)} items</span></span></div>
        </Window>
        {/* HO */}
        <Window id="ho" title="Head Office — Central Control" color="#5b6abf"
          isOpen={openWins.includes('ho')} isMinimized={minWins.includes('ho')}
          activeModuleId={activeWinModule['ho']} isMaximized={maxWins.includes('ho')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('ho')}
        >
          <div className="sov-win-row"><span className="sov-win-label">Sync Status</span><span className="sov-win-value"><span className="sov-badge sov-badge-green">{sovData.ho?.sync_status || 'Checking...'}</span></span></div>
          <div className="sov-win-row"><span className="sov-win-label">Pending Commands</span><span className="sov-win-value">{fmt(sovData.ho?.pending_commands)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Last Sync</span><span className="sov-win-value">{sovData.ho?.last_sync ? new Date(sovData.ho.last_sync).toLocaleTimeString() : '—'}</span></div>
        </Window>
        {/* Warehouse */}
        <Window id="wh" title="Warehouse — Godown Mgmt" color="#e67e22"
          isOpen={openWins.includes('wh')} isMinimized={minWins.includes('wh')}
          activeModuleId={activeWinModule['wh']} isMaximized={maxWins.includes('wh')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('wh')}
        >
          <div className="sov-win-row"><span className="sov-win-label">Total SKUs</span><span className="sov-win-value">{fmt(sovData.warehouse?.total_skus)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">GRNs Today</span><span className="sov-win-value">{fmt(sovData.warehouse?.grns_today)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Low Stock Alerts</span><span className="sov-win-value"><span className="sov-badge sov-badge-red">{fmt(Array.isArray(sovData.alerts) ? sovData.alerts.length : sovData.alerts?.count)} items</span></span></div>
        </Window>
        {/* Distributor */}
        <Window id="dist" title="Distributor Management" color="#1abc9c"
          isOpen={openWins.includes('dist')} isMinimized={minWins.includes('dist')}
          activeModuleId={activeWinModule['dist']} isMaximized={maxWins.includes('dist')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('dist')}
        >
          <div className="sov-win-row"><span className="sov-win-label">Active Vendors</span><span className="sov-win-value">{fmt(Array.isArray(sovData.vendors) ? sovData.vendors.length : null)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Outstanding POs</span><span className="sov-win-value">{fmt(sovData.stats?.pending_pos)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">GRN Pipeline</span><span className="sov-win-value"><span className="sov-badge sov-badge-blue">{fmt(sovData.stats?.open_grns)} open</span></span></div>
        </Window>
        {/* Catalogue */}
        <Window id="cat" title="Catalogue &amp; Pricing" color="#e74c3c"
          isOpen={openWins.includes('cat')} isMinimized={minWins.includes('cat')}
          activeModuleId={activeWinModule['cat']} isMaximized={maxWins.includes('cat')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('cat')}
        >
          <div className="sov-win-row"><span className="sov-win-label">Total Products</span><span className="sov-win-value">{fmt(sovData.stats?.total_products)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Active Schemes</span><span className="sov-win-value">{fmt(Array.isArray(sovData.schemes) ? sovData.schemes.length : null)}</span></div>
        </Window>
        {/* MIS */}
        <Window id="mis" title="MIS Reports &amp; Analytics" color="#8e44ad"
          isOpen={openWins.includes('mis')} isMinimized={minWins.includes('mis')}
          activeModuleId={activeWinModule['mis']} isMaximized={maxWins.includes('mis')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('mis')}
        >
          <div className="sov-win-row"><span className="sov-win-label">Network Sales MTD</span><span className="sov-win-value">{fmtCr(sovData.stats?.sales_mtd)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Shrinkage</span><span className="sov-win-value"><span className="sov-badge sov-badge-red">{sovData.stats?.shrinkage_pct ? `${sovData.stats.shrinkage_pct}%` : '—'}</span></span></div>
        </Window>
        {/* Settings */}
        <Window id="settings" title="Settings &amp; Admin" color="#4a5568"
          isOpen={openWins.includes('settings')} isMinimized={minWins.includes('settings')}
          activeModuleId={activeWinModule['settings']} isMaximized={maxWins.includes('settings')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('settings')}
        >
          <div className="sov-win-row"><span className="sov-win-label">Backend</span><span className="sov-win-value"><span className="sov-badge sov-badge-green">Online</span></span></div>
          <div className="sov-win-row"><span className="sov-win-label">Protocol</span><span className="sov-win-value">S9-SOV-2.4</span></div>
        </Window>
      </div>

      {/* ── LIVING PILL DOCK ── minimized windows float above taskbar */}
      <AnimatePresence>
        {minWins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="sov-pill-dock"
          >
            {minWins.map(key => {
              const mod = Object.values(mods).find((m: any) => m.win === key) as any || mods[key as keyof typeof mods] as any;
              const color = mod?.color || '#1a3a5c';
              const label = mod?.title || key.toUpperCase();
              // Pick a live metric per window
              const metric: Record<string, string> = {
                pos:      fmt(sovData.billing?.total_amount, '₹') || 'Billing',
                ho:       sovData.ho?.sync_status || 'HO',
                wh:       `${fmt(Array.isArray(sovData.alerts) ? sovData.alerts.length : null)} alerts`,
                dist:     `${fmt(Array.isArray(sovData.vendors) ? sovData.vendors.length : null)} vendors`,
                cat:      `${fmt(sovData.stats?.total_products)} SKUs`,
                mis:      fmtCr(sovData.stats?.sales_mtd) || 'MIS',
                settings: 'Online',
              };
              return (
                <motion.button
                  key={key}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="sov-pill"
                  onClick={() => toggleMin(key)}
                  style={{ '--pill-color': color } as React.CSSProperties}
                  title={`Restore ${label}`}
                >
                  <span className="sov-pill-dot" style={{ backgroundColor: color }} />
                  <span className="sov-pill-label">{label}</span>
                  <span className="sov-pill-metric">{metric[key] || '—'}</span>
                  <span className="sov-pill-restore">▲</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TASKBAR */}
      <div className="sov-taskbar">
        <button className="sov-start-btn" onClick={() => setSmOpen(!smOpen)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3px', width:'14px' }}>
            {[0,1,2,3].map(i => <span key={i} style={{ width:'5px', height:'5px', background:'rgba(255,255,255,0.8)', borderRadius:'1px', display:'block' }} />)}
          </div>
          SMRITI-OS
        </button>
        <div className="h-[24px] w-[0.5px] bg-[#dde1e8] mx-2" />
        
        {Object.keys(mods).map(k => (
          <div 
            key={k} 
            className={cn("sov-task-tab", openWins.includes(mods[k].win) && mods[k].win && "on")}
            onClick={() => mods[k].win && toggleWin(mods[k].win)}
          >
            <div className="sov-tab-dot" style={{ backgroundColor: mods[k].color }} />
            {mods[k].title.split(' ')[0]}
          </div>
        ))}

        <div className="sov-clock">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <br />
          <span className="text-[#8a9bb0] text-[9px] uppercase">{currentTime.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>

        <button 
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              if (document.exitFullscreen) {
                document.exitFullscreen();
              }
            }
          }}
          className="ml-2 p-2 hover:bg-[#f0f4fa] rounded-lg text-[#4a5568] transition-all"
          title="Toggle Fullscreen"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6" />
          </svg>
        </button>

        <button 
          onClick={onExit}
          className="ml-4 px-4 h-9 rounded-lg bg-[#1a3a5c]/5 text-[#1a3a5c] border border-[#1a3a5c]/20 text-[10px] font-black uppercase tracking-widest hover:bg-[#1a3a5c] hover:text-white transition-all"
        >
          Exit System
        </button>
      </div>

      {/* START MENU */}
      <AnimatePresence>
        {smOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sov-start-menu open"
          >
            <div className="sov-sm-body">
              <div className="sov-sm-sidebar">
                <div className="sov-sm-user-card">
                  <div className="sov-sm-user-av">SA</div>
                  <div className="sov-sm-user-name">System Admin</div>
                  <div className="sov-sm-user-role">Business Owner — SMRITI-OS</div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {Object.keys(mods).map(k => (
                    <div 
                      key={k} 
                      className={cn("sov-sni", activeMod === k && "on")}
                      onMouseEnter={() => setActiveMod(k)}
                    >
                      <div className="sov-sni-ico" style={{ backgroundColor: `${mods[k].color}15`, color: mods[k].color }}>{mods[k].icon}</div>
                      {mods[k].title}
                    </div>
                  ))}
                </div>
              </div>
              <div className="sov-sm-right">
                <div className="sov-sm-hdr">
                  <h3>{mods[activeMod].title}</h3>
                  <p>{mods[activeMod].desc}</p>
                </div>
                <div className="sov-sm-grid">
                  {mods[activeMod].tiles.map((t: any, i: number) => (
                    <div key={i} className="sov-stile" onClick={() => { mods[activeMod].win && toggleWin(mods[activeMod].win, t.mid); setSmOpen(false); }}>
                      <div className="sov-stile-ico">{t.i}</div>
                      <div className="sov-stile-lbl">{t.l}</div>
                      <div className="sov-stile-desc">{t.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="sov-agent-row">
              <div className="sov-agent-badge">SMRITI AI</div>
              <input 
                className="sov-ag-input" 
                placeholder='Command SMRITI-OS — e.g. "today&apos;s sales summary"' 
                value={agInput}
                onChange={(e) => setAgInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runAgent()}
              />
              <button className="sov-ag-btn" onClick={runAgent} disabled={agentBusy}>
                {agentBusy ? 'Executing...' : 'Execute'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {agentToast && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="sov-toast show"
          >
            <div className="th">
              <div className="tpulse" />
              <span className="ttitle">{agentToast.title}</span>
            </div>
            <div className="tsteps">
              {agentToast.steps.map((s, i) => (
                <div key={i} className={cn(
                  "ts",
                  i < agentToast.activeStep ? "ts-done" : (i === agentToast.activeStep ? "ts-run" : "ts-wait")
                )}>
                  {s}
                </div>
              ))}
            </div>
            {agentToast.result && (
              <div className="tresult">{agentToast.result}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SovereignDesktop;
