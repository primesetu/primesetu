/* ============================================================
 * SMRITI-OS — Sovereign Enterprise Desktop
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import '@/styles/index.css';
import { COMPONENT_MAP } from '@/lib/ModuleRegistry';
import { api } from '@/api/client';
import { ClassicStartMenu, AgentToastData } from './ClassicStartMenu';
import { useWindowManager } from '@/hooks/useWindowManager';
import { usePopout } from '@/hooks/usePopout';

const WIN_LABELS = {
  pos:      { label: 'POS',         color: '#1a3a5c' },
  ho:       { label: 'Head Office', color: '#5b6abf' },
  wh:       { label: 'Warehouse',   color: '#e67e22' },
  dist:     { label: 'Distributor', color: '#1abc9c' },
  cat:      { label: 'Catalogue',   color: '#e74c3c' },
  mis:      { label: 'MIS',         color: '#8e44ad' },
  settings: { label: 'Settings',    color: '#4a5568' },
} satisfies Record<string, { label: string; color: string }>;

let cachedSovereignData: any = null;
let sovereignDataPromise: Promise<any> | null = null;

// Real data fetched once on mount for the summary cards
function useSovereignData() {
  const [data, setData] = useState<any>(cachedSovereignData || {});
  
  useEffect(() => {
    if (cachedSovereignData) return;
    if (!sovereignDataPromise) {
      sovereignDataPromise = Promise.allSettled([
        api.billing.getDayEndSummary(),
        api.inventory.getAlerts(),
        api.warehouse.getDashboard(),
        api.vendors.list(),
        api.schemes.list(),
        api.ho.getStatus(),
        api.dashboard.getStats(),
      ]).then(([billing, alerts, warehouse, vendors, schemes, ho, stats]) => {
        cachedSovereignData = {
          billing:   billing.status   === 'fulfilled' ? billing.value   : null,
          alerts:    alerts.status    === 'fulfilled' ? alerts.value    : null,
          warehouse: warehouse.status === 'fulfilled' ? warehouse.value : null,
          vendors:   vendors.status   === 'fulfilled' ? vendors.value   : null,
          schemes:   schemes.status   === 'fulfilled' ? schemes.value   : null,
          ho:        ho.status        === 'fulfilled' ? ho.value        : null,
          stats:     stats.status     === 'fulfilled' ? stats.value     : null,
        };
        return cachedSovereignData;
      }).catch(() => { /* silent — summary cards degrade gracefully */ });
    }
    
    sovereignDataPromise.then(res => {
      if (res) setData(res);
    });
  }, []);
  
  return data;
}

const fmt = (n: any, prefix = '') => n != null ? `${prefix}${Number(n).toLocaleString('en-IN')}` : '—';
const fmtCr = (n: any) => n != null ? `₹${(Number(n)/10000000).toFixed(2)} Cr` : '—';

interface WindowProps {
  id: keyof typeof WIN_LABELS;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isPoppedOut: boolean;
  color: string;
  activeModuleId: string | null;
  onClose: () => void;
  onMinimize: (id: string) => void;
  onPopout: () => void;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps & { onMaximize: (id: string) => void, isMaximized: boolean }> = ({
  id, title, isOpen, isMinimized, isPoppedOut, color, activeModuleId, isMaximized, onMaximize, onMinimize, onClose, onPopout, children
}) => {
  // If popped out: render invisible placeholder so React keeps the component alive for state preservation
  if (isPoppedOut) {
    const ActiveComponent = activeModuleId ? COMPONENT_MAP[activeModuleId] : null;
    return (
      <div style={{ display: 'none' }} id={`w-${id}-popout-placeholder`}>
        {/* Module kept mounted to preserve any internal state when popped out */}
        <React.Suspense fallback={null}>
          {ActiveComponent ?? children}
        </React.Suspense>
      </div>
    );
  }
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
          {/* Popout — launch in separate browser window */}
          {activeModuleId && (
            <button
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#2563eb]/15 text-[#2563eb] transition-all"
              onClick={onPopout}
              title="Popout to separate window (data preserved on return)"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </button>
          )}
          <button className="sov-win-close" onClick={onClose}></button>
        </div>
      </div>
      <div className={cn(
        "sov-win-body",
        (isMaximized || activeModuleId) ? "module-host" : ""
      )}>
        <React.Suspense fallback={<div className="flex items-center justify-center h-full text-[#1a3a5c] font-black uppercase tracking-widest text-[10px] animate-pulse">Loading Module...</div>}>
          {/* If a module is active, it takes over the window content, silently replacing the summary cards (children). */}
          {ActiveComponent ?? children}
        </React.Suspense>
      </div>
    </motion.div>
  );
};



/**
 * SovereignDesktop
 * @param onExit - Callback triggered to exit the desktop environment (e.g. returning to standard shell or signing out)
 */
const SovereignDesktop: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [smOpen, setSmOpen] = useState(false);
  const { openWins, minWins, maxWins, activeWinModule, toggleWin, toggleMin, toggleMax, closeWin } = useWindowManager();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [agentToast, setAgentToast] = useState<AgentToastData | null>(null);
  const sovData = useSovereignData();

  // When popup closes, restore the window in the desktop
  const handlePopoutClosed = useCallback((winKey: string) => {
    // The window was in "minimized" state while popped out — restore it
    if (minWins.includes(winKey)) {
      toggleMin(winKey);
    }
  }, [minWins, toggleMin]);

  const { poppedOut, launchPopout, closePopout } = usePopout(handlePopoutClosed);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const msUntilNextMinute = 60000 - (Date.now() % 60000);
    
    const timeout = setTimeout(() => {
      setCurrentTime(new Date());
      timer = setInterval(() => setCurrentTime(new Date()), 60000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeout);
      if (timer) clearInterval(timer);
    };
  }, []);



  return (
    <div className="sov-desktop-container h-screen overflow-hidden">
      {/* TOPBAR */}
      <div className="sov-topbar">
        <div className="sov-logo">
          <div className="sov-logo-mark">SM</div>
          <span className="sov-logo-name">SMRITI-OS</span>
          <span className="sov-logo-tag">Enterprise</span>
        </div>
        <div className="h-[22px] w-[0.5px] bg-[#dde1e8] mx-1" />
        <div className="sov-role-pill">Business Owner / CXO</div>
        <div className="sov-topbar-right flex items-center gap-2">
          <div className="sov-user-chip">
            <div className="sov-user-av">SA</div>
            <span className="sov-user-name">System Administrator</span>
          </div>
          <button 
            onClick={async () => {
              (window as any).__isLoggingOut = true;
              await import('@/lib/supabase').then(m => m.supabase.auth.signOut());
              window.location.reload();
            }}
            className="w-7 h-7 flex items-center justify-center rounded bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all ml-2"
            title="Sign Out"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>

      <div className="sov-main-stage">
        {/* POS */}
        <Window id="pos" title="POS — Store Billing" color="#1a3a5c"
          isOpen={openWins.includes('pos')} isMinimized={minWins.includes('pos')}
          isPoppedOut={poppedOut.has('pos')}
          activeModuleId={activeWinModule['pos']} isMaximized={maxWins.includes('pos')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('pos')}
          onPopout={() => { toggleMin('pos'); launchPopout('pos', activeWinModule['pos'] || 'sales', 'POS — Store Billing'); }}
        >
          <div className="sov-win-row"><span className="sov-win-label">Today's Billing</span><span className="sov-win-value">{fmt(sovData.billing?.total_amount, '₹')}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Bills Raised</span><span className="sov-win-value">{fmt(sovData.billing?.bill_count)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Active Tills</span><span className="sov-win-value"><span className="sov-badge sov-badge-green">{fmt(sovData.billing?.open_tills)} open</span></span></div>
          <div className="sov-win-row"><span className="sov-win-label">Returns</span><span className="sov-win-value"><span className="sov-badge sov-badge-yellow">{fmt(sovData.billing?.return_count)} items</span></span></div>
        </Window>
        {/* HO */}
        <Window id="ho" title="Head Office — Central Control" color="#5b6abf"
          isOpen={openWins.includes('ho')} isMinimized={minWins.includes('ho')}
          isPoppedOut={poppedOut.has('ho')}
          activeModuleId={activeWinModule['ho']} isMaximized={maxWins.includes('ho')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('ho')}
          onPopout={() => { toggleMin('ho'); launchPopout('ho', activeWinModule['ho'] || 'dashboard', 'Head Office'); }}
        >
          <div className="sov-win-row"><span className="sov-win-label">Sync Status</span><span className="sov-win-value"><span className="sov-badge sov-badge-green">{sovData.ho?.sync_status || 'Checking...'}</span></span></div>
          <div className="sov-win-row"><span className="sov-win-label">Pending Commands</span><span className="sov-win-value">{fmt(sovData.ho?.pending_commands)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Last Sync</span><span className="sov-win-value">{sovData.ho?.last_sync ? new Date(sovData.ho.last_sync).toLocaleTimeString() : '—'}</span></div>
        </Window>
        {/* Warehouse */}
        <Window id="wh" title="Warehouse — Godown Mgmt" color="#e67e22"
          isOpen={openWins.includes('wh')} isMinimized={minWins.includes('wh')}
          isPoppedOut={poppedOut.has('wh')}
          activeModuleId={activeWinModule['wh']} isMaximized={maxWins.includes('wh')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('wh')}
          onPopout={() => { toggleMin('wh'); launchPopout('wh', activeWinModule['wh'] || 'warehouse_os', 'Warehouse'); }}
        >
          <div className="sov-win-row"><span className="sov-win-label">Total SKUs</span><span className="sov-win-value">{fmt(sovData.warehouse?.total_skus)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">GRNs Today</span><span className="sov-win-value">{fmt(sovData.warehouse?.grns_today)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Low Stock Alerts</span><span className="sov-win-value"><span className="sov-badge sov-badge-red">{fmt(Array.isArray(sovData.alerts) ? sovData.alerts.length : sovData.alerts?.count)} items</span></span></div>
        </Window>
        {/* Distributor */}
        <Window id="dist" title="Distributor Management" color="#1abc9c"
          isOpen={openWins.includes('dist')} isMinimized={minWins.includes('dist')}
          isPoppedOut={poppedOut.has('dist')}
          activeModuleId={activeWinModule['dist']} isMaximized={maxWins.includes('dist')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('dist')}
          onPopout={() => { toggleMin('dist'); launchPopout('dist', activeWinModule['dist'] || 'vouchers', 'Distributor'); }}
        >
          <div className="sov-win-row"><span className="sov-win-label">Active Vendors</span><span className="sov-win-value">{fmt(Array.isArray(sovData.vendors) ? sovData.vendors.length : null)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Outstanding POs</span><span className="sov-win-value">{fmt(sovData.stats?.pending_pos)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">GRN Pipeline</span><span className="sov-win-value"><span className="sov-badge sov-badge-blue">{fmt(sovData.stats?.open_grns)} open</span></span></div>
        </Window>
        {/* Catalogue */}
        <Window id="cat" title="Catalogue &amp; Pricing" color="#e74c3c"
          isOpen={openWins.includes('cat')} isMinimized={minWins.includes('cat')}
          isPoppedOut={poppedOut.has('cat')}
          activeModuleId={activeWinModule['cat']} isMaximized={maxWins.includes('cat')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('cat')}
          onPopout={() => { toggleMin('cat'); launchPopout('cat', activeWinModule['cat'] || 'item_workbench', 'Catalogue'); }}
        >
          <div className="sov-win-row"><span className="sov-win-label">Total Products</span><span className="sov-win-value">{fmt(sovData.stats?.total_products)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Active Schemes</span><span className="sov-win-value">{fmt(Array.isArray(sovData.schemes) ? sovData.schemes.length : null)}</span></div>
        </Window>
        {/* MIS */}
        <Window id="mis" title="MIS Reports &amp; Analytics" color="#8e44ad"
          isOpen={openWins.includes('mis')} isMinimized={minWins.includes('mis')}
          isPoppedOut={poppedOut.has('mis')}
          activeModuleId={activeWinModule['mis']} isMaximized={maxWins.includes('mis')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('mis')}
          onPopout={() => { toggleMin('mis'); launchPopout('mis', activeWinModule['mis'] || 'analytics', 'MIS Reports'); }}
        >
          <div className="sov-win-row"><span className="sov-win-label">Network Sales MTD</span><span className="sov-win-value">{fmtCr(sovData.stats?.sales_mtd)}</span></div>
          <div className="sov-win-row"><span className="sov-win-label">Shrinkage</span><span className="sov-win-value"><span className="sov-badge sov-badge-red">{sovData.stats?.shrinkage_pct ? `${sovData.stats.shrinkage_pct}%` : '—'}</span></span></div>
        </Window>
        {/* Settings */}
        <Window id="settings" title="Settings &amp; Admin" color="#4a5568"
          isOpen={openWins.includes('settings')} isMinimized={minWins.includes('settings')}
          isPoppedOut={poppedOut.has('settings')}
          activeModuleId={activeWinModule['settings']} isMaximized={maxWins.includes('settings')}
          onMaximize={toggleMax} onMinimize={toggleMin} onClose={() => toggleWin('settings')}
          onPopout={() => { toggleMin('settings'); launchPopout('settings', activeWinModule['settings'] || 'sysparams', 'Settings & Admin'); }}
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
              const mod = WIN_LABELS[key] || { label: key.toUpperCase(), color: '#1a3a5c' };
              const color = mod.color;
              const label = mod.label;
              // Pick a live metric per window
              const alertsCount = fmt(Array.isArray(sovData.alerts) ? sovData.alerts.length : null);
              const vendorsCount = fmt(Array.isArray(sovData.vendors) ? sovData.vendors.length : null);
              const skuCount = fmt(sovData.stats?.total_products);
              const posMetric = fmt(sovData.billing?.total_amount, '₹');
              const misMetric = fmtCr(sovData.stats?.sales_mtd);

              const metric: Record<string, string> = {
                pos:      posMetric !== '—' ? posMetric : label,
                ho:       sovData.ho?.sync_status || label,
                wh:       alertsCount !== '—' ? `${alertsCount} alerts` : label,
                dist:     vendorsCount !== '—' ? `${vendorsCount} vendors` : label,
                cat:      skuCount !== '—' ? `${skuCount} SKUs` : label,
                mis:      misMetric !== '—' ? misMetric : label,
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
        
        {openWins.map(winKey => {
          const mod = WIN_LABELS[winKey as keyof typeof WIN_LABELS] || { label: winKey.toUpperCase(), color: '#1a3a5c' };
          const isMin = minWins.includes(winKey);
          return (
            <div 
              key={winKey} 
              className={cn("sov-task-tab on", isMin && "opacity-50")}
              onClick={() => toggleWin(winKey)}
            >
              <div className="sov-tab-dot" style={{ backgroundColor: mod.color }} />
              {mod.label.split(' ')[0]}
            </div>
          );
        })}

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
      {smOpen && (
        <ClassicStartMenu 
          onLaunch={(winKey, mid) => { toggleWin(winKey, mid); setSmOpen(false); }} 
          onClose={() => setSmOpen(false)} 
          onAgentToast={setAgentToast}
        />
      )}

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
