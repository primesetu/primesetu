import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Settings, Database, ArrowRightLeft, Activity, FileBarChart, Power, Search, X, Pin } from 'lucide-react';

export interface MenuAction {
  winKey: string;
  mid: string;
}

export interface MenuItemDef {
  label?: string;
  icon?: React.ReactNode;
  action?: MenuAction;
  children?: MenuItemDef[];
  divider?: boolean;
}

export const START_MENU_REGISTRY: MenuItemDef[] = [
  {
    label: 'Setup',
    icon: <Settings size={16} />,
    children: [
      { label: 'System Parameters', action: { winKey: 'settings', mid: 'sysparams' } },
      { label: 'Security Management', action: { winKey: 'settings', mid: 'security' } },
      { divider: true },
      { label: 'Architect Console', action: { winKey: 'settings', mid: 'architect_config' } },
      { label: 'Hybrid Storage', action: { winKey: 'settings', mid: 'hybrid_storage' } },
    ]
  },
  {
    label: 'Masters',
    icon: <Database size={16} />,
    children: [
      {
        label: 'Catalogue',
        children: [
          { label: 'Item Master', action: { winKey: 'cat', mid: 'item_workbench' } },
          { label: 'Price Lists', action: { winKey: 'cat', mid: 'price' } },
          { label: 'HSN / GS1 Codes', action: { winKey: 'cat', mid: 'hsn' } },
        ]
      },
      {
        label: 'Partners',
        children: [
          { label: 'Customer Master', action: { winKey: 'cat', mid: 'customers' } },
          { label: 'Vendor Master', action: { winKey: 'cat', mid: 'vendors' } },
          { label: 'Chainstore Master', action: { winKey: 'cat', mid: 'chainstores' } },
        ]
      },
      {
        label: 'Resources',
        children: [
          { label: 'Personnel Master', action: { winKey: 'cat', mid: 'personnel' } },
          { label: 'Accounts Master', action: { winKey: 'cat', mid: 'accounts' } },
        ]
      }
    ]
  },
  {
    label: 'Transactions',
    icon: <ArrowRightLeft size={16} />,
    children: [
      {
        label: 'Sales',
        children: [
          { label: 'POS Billing', action: { winKey: 'pos', mid: 'sales' } },
          { label: 'Sales Return', action: { winKey: 'pos', mid: 'returns' } },
          { label: 'Advance Slips', action: { winKey: 'pos', mid: 'ComingSoon' } },
        ]
      },
      {
        label: 'Purchase',
        children: [
          { label: 'Purchase Order', action: { winKey: 'wh', mid: 'procurement' } },
          { label: 'GRN Entry', action: { winKey: 'wh', mid: 'grn' } },
          { label: 'Purchase Return', action: { winKey: 'wh', mid: 'ComingSoon' } },
        ]
      },
      {
        label: 'Inventory',
        children: [
          { label: 'Stock Transfer', action: { winKey: 'wh', mid: 'stock_transfer' } },
          { label: 'Stock Adjustment', action: { winKey: 'wh', mid: 'inventory' } },
          { label: 'Physical Stock', action: { winKey: 'wh', mid: 'reconcile' } },
        ]
      }
    ]
  },
  {
    label: 'Operations',
    icon: <Activity size={16} />,
    children: [
      { label: 'Till Management', action: { winKey: 'pos', mid: 'tills' } },
      { label: 'Data Sync (HO)', action: { winKey: 'ho', mid: 'ho' } },
      { label: 'Day End', action: { winKey: 'pos', mid: 'dayend' } },
    ]
  },
  {
    label: 'Reports',
    icon: <FileBarChart size={16} />,
    children: [
      { label: 'Sales Register', action: { winKey: 'mis', mid: 'analytics' } },
      { label: 'Stock Ledger', action: { winKey: 'mis', mid: 'stockrep' } },
      { label: 'Tax Register (GSTR)', action: { winKey: 'mis', mid: 'taxrep' } },
    ]
  }
];

// ── Flatten all leaf items for search ──────────────────────────────────────
interface FlatItem {
  label: string;
  path: string;       // e.g. "Masters → Catalogue → Item Master"
  action: MenuAction;
  groupIcon?: React.ReactNode;
}

function flattenMenu(items: MenuItemDef[], breadcrumb: string[] = [], rootIcon?: React.ReactNode): FlatItem[] {
  const results: FlatItem[] = [];
  for (const item of items) {
    if (item.divider || !item.label) continue;
    const currentPath = [...breadcrumb, item.label];
    if (item.action) {
      results.push({
        label: item.label,
        path: currentPath.join(' → '),
        action: item.action,
        groupIcon: rootIcon,
      });
    }
    if (item.children) {
      const icon = breadcrumb.length === 0 ? item.icon : rootIcon;
      results.push(...flattenMenu(item.children, currentPath, icon));
    }
  }
  return results;
}

const ALL_ITEMS: FlatItem[] = flattenMenu(START_MENU_REGISTRY);

// ── AI Intents ─────────────────────────────────────────────────────────────
const INTENTS = [
  { id: 'low_stock', keywords: ['low stock', 'reorder', 'out of stock', 'godowns'], win: 'wh', mid: 'intelligence', label: 'inventory alert scan', steps: ['Authenticate user', 'Load Warehouse module', 'Scan all godowns', 'Apply reorder filter', 'Sort by criticality'], result: '37 SKUs below reorder level. Critical: SKU-40821 (0 units).' },
  { id: 'sales_summary', keywords: ['today sale', 'billing today', 'pos summ', 'daily bill', 'sales summary'], win: 'pos', mid: 'sales', label: 'daily sales summary', steps: ['Authenticate user', 'Load POS module', 'Query bill register', 'Aggregate by store', 'Compute payment split'], result: "Today's billing: ₹3,84,200 across 142 bills. Payment: Cash 42%, Card 38%, UPI 20%." },
  { id: 'indent_mgr', keywords: ['indent', 'store indent', 'ho indent', 'pending indent'], win: 'ho', mid: 'procurement', label: 'indent management', steps: ['Authenticate user', 'Load HO module', 'Fetch pending indents', 'Group by store', 'Rank by volume'], result: '18 pending indents from 7 stores. Highest: Store #12 Mumbai.' },
  { id: 'price_rev', keywords: ['price updat', 'bulk price', 'price revis', 'mrp'], win: 'cat', mid: 'price', label: 'price revision task', steps: ['Authenticate user', 'Load Catalogue module', 'Load pending revisions', 'Validate MRP vs cost', 'Queue store broadcast'], result: '280 items pending update. 12 flagged: new MRP below cost price.' },
  { id: 'schemes', keywords: ['scheme', 'promo', 'offer', 'coupon', 'discount', 'active scheme'], win: 'mis', mid: 'schemes', label: 'scheme status query', steps: ['Authenticate user', 'Load Schemes module', 'Fetch active promos', 'Compute redemptions', 'Render dashboard'], result: '2 active schemes: "Summer Flat 30%" (142 redemptions), "Buy 2 Get 1" (38 redemptions).' },
  { id: 'grn', keywords: ['grn', 'goods receiv', 'inward', 'warehouse receiv', 'grn status'], win: 'wh', mid: 'grn', label: 'GRN processing', steps: ['Authenticate user', 'Load Warehouse module', 'Open GRN register', 'Map to purchase orders', 'Update godown stock'], result: '12 GRNs processed today. 4,820 units received from 6 vendors.' },
  { id: 'tills', keywords: ['till', 'cash lift', 'end of day', 'eod', 'cash in till', 'till cash'], win: 'pos', mid: 'tills', label: 'till cash management', steps: ['Authenticate user', 'Load POS module', 'Query all active tills', 'Compute cash balances', 'Check cash limits'], result: '4 tills active. Till 1: ₹48,500 — approaching limit.' },
  { id: 'credit', keywords: ['distribut', 'credit limit', 'dealer outstand', 'outstand dealer', 'credit check'], win: 'dist', mid: 'vouchers', label: 'distributor credit check', steps: ['Authenticate user', 'Load Distributor module', 'Pull credit ledgers', 'Flag overdue accounts', 'Rank by exposure'], result: '3 distributors over credit limit. SMRITI-OS recommends hold on new orders.' },
  { id: 'mis', keywords: ['mis', 'report', 'dashboard', 'board summ', 'analytics', 'mis dashboard'], win: 'mis', mid: 'analytics', label: 'MIS report generation', steps: ['Authenticate user', 'Load MIS module', 'Aggregate all store data', 'Compute KPIs', 'Export report'], result: 'MIS ready. Top store: #5 Andheri ₹42L MTD.' },
  { id: 'stock_tx', keywords: ['stock transfer', 'transfer store', 'inter store'], win: 'wh', mid: 'stock_transfer', label: 'stock transfer request', steps: ['Authenticate user', 'Load Warehouse module', 'Fetch transfer requests', 'Validate stock levels', 'Approve & dispatch'], result: '5 pending stock transfer requests. Dispatch ETA: 2 hours.' },
];

function matchIntent(input: string) {
  const lower = input.toLowerCase();
  return INTENTS
    .map(i => ({ intent: i, score: i.keywords.filter(k => lower.includes(k)).length }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.intent ?? null;
}

export interface AgentToastData {
  title: string;
  steps: string[];
  activeStep: number;
  result?: string;
}

interface ClassicStartMenuProps {
  onLaunch: (winKey: string, mid: string) => void;
  onClose: () => void;
  onAgentToast: (toast: AgentToastData | null) => void;
}

// ── Highlight matched text ─────────────────────────────────────────────────
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-brand-navy/20 text-brand-navy dark:bg-white/20 dark:text-white rounded px-0.5 not-italic font-bold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export const ClassicStartMenu: React.FC<ClassicStartMenuProps> = ({ onLaunch, onClose, onAgentToast }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [agentBusy, setAgentBusy] = useState(false);
  const [mode, setMode] = useState<'menu' | 'ai'>('menu');

  // Pinned and Recent State
  const [pinned, setPinned] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('smriti_pinned_modules');
      return stored ? JSON.parse(stored) : ['item_workbench', 'sales', 'grn', 'inventory', 'sysparams', 'analytics'];
    } catch { return ['item_workbench', 'sales', 'grn', 'inventory', 'sysparams', 'analytics']; }
  });

  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('smriti_recent_modules');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const togglePin = (mid: string) => {
    setPinned(prev => {
      const next = prev.includes(mid) ? prev.filter(id => id !== mid) : [...prev, mid];
      localStorage.setItem('smriti_pinned_modules', JSON.stringify(next));
      return next;
    });
  };

  const getItemByMid = (mid: string) => ALL_ITEMS.find(i => i.action.mid === mid);

  // Auto-focus search on open
  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Filter menu items by search query
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_ITEMS.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.path.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const isSearching = query.trim().length > 0;

  const handleSelect = (action: MenuAction) => {
    setRecents(prev => {
      const next = [action.mid, ...prev.filter(id => id !== action.mid)].slice(0, 4);
      localStorage.setItem('smriti_recent_modules', JSON.stringify(next));
      return next;
    });
    onLaunch(action.winKey, action.mid);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSearching && searchResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx(i => Math.min(i + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = searchResults[selectedIdx];
        if (item) handleSelect(item.action);
      }
    } else if (e.key === 'Enter' && mode === 'ai') {
      runAgent();
    }
    if (e.key === 'Escape') onClose();
  };

  // Reset selection when results change
  useEffect(() => { setSelectedIdx(0); }, [searchResults.length]);

  const runAgent = async () => {
    if (!query.trim()) return;
    const match = matchIntent(query);
    setAgentBusy(true);

    if (!match) {
      onAgentToast({ title: 'AI Command Execution', steps: ['Analyzing input...', 'No matching intent found.'], activeStep: 1, result: 'Command not recognized. Try: "low stock", "daily sales", "grn status".' });
      setTimeout(() => onAgentToast(null), 4000);
      setAgentBusy(false);
      setQuery('');
      return;
    }

    onAgentToast({ title: `AI Task: ${match.label}`, steps: match.steps, activeStep: 0 });
    for (let i = 1; i <= match.steps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      onAgentToast({ title: `AI Task: ${match.label}`, steps: match.steps, activeStep: i });
    }
    onAgentToast({ title: `AI Task: ${match.label}`, steps: match.steps, activeStep: match.steps.length, result: match.result });
    onLaunch(match.win, match.mid);
    setAgentBusy(false);
    setQuery('');
    onClose();
    setTimeout(() => onAgentToast(null), 9000);
  };

  return (
    <div
      ref={menuRef}
      className="absolute bottom-12 left-2 z-[999999] w-72 bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-slate-700 shadow-2xl rounded-t-lg rounded-br-lg flex flex-col font-sans text-sm animate-in slide-in-from-bottom-2 fade-in duration-200"
    >
      {/* ── User Header ── */}
      <div className="bg-brand-navy px-4 py-3 flex items-center gap-3 rounded-t-lg">
        <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-base border border-white/20 shrink-0">SA</div>
        <div className="flex flex-col min-w-0">
          <span className="text-white font-bold text-[13px] leading-tight truncate">System Admin</span>
          <span className="text-white/60 text-[10px] uppercase tracking-wider">SMRITI-OS Enterprise</span>
        </div>
      </div>

      {/* ── Global Search Bar ── */}
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a1f2b]">
        <div className="flex items-center gap-2 bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 focus-within:border-brand-navy dark:focus-within:border-blue-400 transition-colors">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            ref={searchRef}
            type="text"
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none min-w-0"
            placeholder={mode === 'ai' ? 'Ask SMRITI AI...' : 'Search menus & modules...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={agentBusy}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X size={12} />
            </button>
          )}
        </div>
        {/* Mode Tabs */}
        <div className="flex gap-1 mt-1.5">
          <button
            onClick={() => setMode('menu')}
            className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-colors",
              mode === 'menu'
                ? "bg-brand-navy text-white"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            🗂 Menus
          </button>
          <button
            onClick={() => setMode('ai')}
            className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-colors",
              mode === 'ai'
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            ✦ SMRITI AI
          </button>
          {mode === 'ai' && query && (
            <button
              onClick={runAgent}
              disabled={agentBusy || !query.trim()}
              className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
            >
              {agentBusy ? '...' : 'Run ↵'}
            </button>
          )}
        </div>
      </div>

      {/* ── Search Results (flat list) ── */}
      {isSearching && mode === 'menu' ? (
        <div className="flex-1 overflow-y-auto max-h-64 py-1">
          {searchResults.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-slate-400">
              <div className="text-2xl mb-2">🔍</div>
              No modules found for <span className="font-bold text-slate-600 dark:text-slate-300">"{query}"</span>
              <div className="mt-2 text-[10px]">Switch to <span className="font-bold text-emerald-600">SMRITI AI</span> for natural language commands</div>
            </div>
          ) : (
            searchResults.map((item, idx) => (
              <div
                key={item.path}
                onClick={() => handleSelect(item.action)}
                className={cn(
                  "w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors group cursor-pointer",
                  idx === selectedIdx
                    ? "bg-brand-navy text-white"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-200"
                )}
                onMouseEnter={() => setSelectedIdx(idx)}
              >
                <span className={cn("mt-0.5 opacity-60", idx === selectedIdx && "opacity-100")}>
                  {item.groupIcon ?? <span className="text-[14px]">📋</span>}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold leading-tight">
                    <HighlightMatch text={item.label} query={query} />
                  </span>
                  <span className={cn(
                    "text-[9px] mt-0.5 truncate",
                    idx === selectedIdx ? "text-white/60" : "text-slate-400"
                  )}>
                    {item.path.split(' → ').slice(0, -1).join(' → ')}
                  </span>
                </div>
                <span className={cn(
                  "ml-auto text-[8px] font-black uppercase tracking-widest shrink-0 mt-0.5",
                  idx === selectedIdx ? "text-white/40" : "text-slate-300 dark:text-slate-600"
                )}>
                  {item.action.winKey.toUpperCase()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(item.action.mid);
                  }}
                  className={cn(
                    "ml-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-opacity",
                    pinned.includes(item.action.mid) ? "text-brand-navy dark:text-blue-400 opacity-100" : "text-slate-400 opacity-0 group-hover:opacity-100"
                  )}
                  title={pinned.includes(item.action.mid) ? "Unpin" : "Pin to Start"}
                >
                  <Pin size={12} className={pinned.includes(item.action.mid) ? "fill-current" : ""} />
                </button>
              </div>
            ))
          )}
        </div>
      ) : isSearching && mode === 'ai' ? (
        /* AI mode with query — show hint */
        <div className="flex-1 px-4 py-4 text-center">
          <div className="text-2xl mb-2">✦</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Press <kbd className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono">Enter</kbd> or click <span className="font-bold text-emerald-600">Run</span> to execute
          </div>
          <div className="mt-2 text-[10px] text-slate-400">
            Try: "low stock alert", "today's billing", "grn status"
          </div>
        </div>
      ) : (
        /* ── Default Cascading Menu ── */
        <div className="py-1 flex-1 overflow-visible pb-2">
          {/* Pinned Grid */}
          <div className="px-4 py-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Pinned</div>
            <div className="grid grid-cols-3 gap-2">
              {pinned.map(mid => {
                const item = getItemByMid(mid);
                if (!item) return null;
                return (
                  <div
                    key={mid}
                    onClick={() => handleSelect(item.action)}
                    className="flex flex-col items-center gap-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group relative cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#1a1f2b] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-brand-navy dark:text-slate-300 group-hover:scale-105 transition-transform shadow-sm group-hover:shadow group-hover:border-brand-navy/30">
                      {item.groupIcon || <span className="text-[16px]">📋</span>}
                    </div>
                    <span className="text-[10px] font-semibold text-center leading-tight text-slate-700 dark:text-slate-300 line-clamp-2">
                      {item.label}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(mid);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-white dark:bg-slate-800 shadow shadow-black/10 text-brand-navy dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pin size={10} className="fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Recents Row */}
          {recents.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800/50">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Recent</div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {recents.map(mid => {
                  const item = getItemByMid(mid);
                  if (!item) return null;
                  return (
                    <button
                      key={'rec_'+mid}
                      onClick={() => handleSelect(item.action)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-300 transition-colors text-[10px] text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      <span className="opacity-60 scale-75">{item.groupIcon || '📋'}</span>
                      <span className="whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-4" />

          {/* All Apps List */}
          <div className="px-4 py-2 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">All Modules</div>
          {START_MENU_REGISTRY.map((item, idx) => (
            <MenuNode key={idx} item={item} onAction={(a) => { if (a) { handleSelect(a); } }} />
          ))}
        </div>
      )}

      {/* ── Footer: Exit ── */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-[#1a1f2b] rounded-b-lg">
        <button
          onClick={() => window.location.reload()}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-sm font-semibold"
        >
          <Power size={16} /> Exit System
        </button>
      </div>
    </div>
  );
};

// ── MenuNode (cascading menu items) ────────────────────────────────────────
const MenuNode: React.FC<{ item: MenuItemDef; onAction: (a?: MenuAction) => void }> = ({ item, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (item.divider) {
    return <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />;
  }

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => {
          if (!hasChildren) onAction(item.action);
        }}
        className={cn(
          "w-full text-left px-4 py-2 hover:bg-brand-navy hover:text-white transition-colors flex items-center justify-between text-slate-800 dark:text-slate-200",
          isOpen && hasChildren && "bg-brand-navy text-white"
        )}
      >
        <div className="flex items-center gap-3">
          {item.icon && <span className="opacity-80">{item.icon}</span>}
          <span>{item.label}</span>
        </div>
        {hasChildren && <ChevronRight size={16} className={cn("opacity-50", isOpen && "opacity-100")} />}
      </button>

      {hasChildren && isOpen && (
        <div className="absolute left-full top-[-4px] min-w-[200px] bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-slate-700 shadow-2xl py-1 z-[100] animate-in slide-in-from-left-2 fade-in duration-100 rounded-lg">
          {item.children!.map((child, idx) => (
            <MenuNode key={idx} item={child} onAction={onAction} />
          ))}
        </div>
      )}
    </div>
  );
};
