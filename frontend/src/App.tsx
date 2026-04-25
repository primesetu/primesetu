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

import React, { useState, useEffect } from 'react';
import { 
  Settings,
  Bell,
  Search,
  Wifi,
  WifiOff,
  User,
  Terminal,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { COMPONENT_MAP } from './lib/ModuleRegistry';
import { useMenu } from './hooks/useMenu';
import CommandBar from './components/CommandBar';
import { useSovereignShortcuts } from './hooks/useSovereignShortcuts';
import { syncEngine } from './lib/SyncEngine';
import { useLanguage } from './hooks/useLanguage';
import { SupportedLanguage, LANGUAGES } from './lib/i18n';
import { supabase } from './lib/supabase';
import Login from './modules/auth/Login';
import TopBar from './components/layout/TopBar';

import Sidebar from './components/layout/Sidebar';
import FunctionBar from './components/layout/FunctionBar';
import StatusBar from './components/layout/StatusBar';

const PrimeSetuOS: React.FC = () => {
  useSovereignShortcuts();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { menu: dynamicMenu, findModule } = useMenu();
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const [user, setUser] = useState<{ name: string, role: string, store_id?: string } | null>(null);
  const [selectedInstance, setSelectedInstance] = useState('X01');
  const [nodeType, setNodeType] = useState<'RETAIL' | 'HO' | 'WAREHOUSE'>('RETAIL');

  const handleLogin = (role: string) => {
    setActiveTab(role === 'CASHIER' ? 'sales' : 'dashboard');
  };

  useEffect(() => {
    // 1. Authenticate and Establish User Context
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.auth.getUser().then(({ data: { user: supaUser } }) => {
          if (supaUser) {
            setUser({ 
              name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
              role: (supaUser.user_metadata?.role || 'CASHIER').toUpperCase(),
              store_id: supaUser.user_metadata?.store_id || 'X01'
            });
            if (supaUser.user_metadata?.store_id) setSelectedInstance(supaUser.user_metadata.store_id);
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const { user: supaUser } = session;
        setUser({ 
          name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
          role: (supaUser.user_metadata?.role || 'CASHIER').toUpperCase(),
          store_id: supaUser.user_metadata?.store_id || 'X01'
        });
        if (supaUser.user_metadata?.store_id) setSelectedInstance(supaUser.user_metadata.store_id);
      } else {
        setUser(null);
      }
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const syncInterval = setInterval(() => {
      setPendingSyncs(syncEngine.getPendingCount());
    }, 5000);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

  /**
   * Sovereign Rendering Engine
   * Resolves the active tab to a dynamic component from the map.
   */
  const renderContent = () => {
    const activeModule = findModule(activeTab);
    
    // If not found in dynamic menu or no component mapped, default to dashboard
    const component = COMPONENT_MAP[activeTab] || COMPONENT_MAP['dashboard'];
    
    // Security check: If backend didn't return it, it shouldn't be accessible
    if (dynamicMenu.length > 0 && !activeModule && activeTab !== 'dashboard') {
       return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          </div>
          <h2 className="text-2xl font-serif font-black text-navy uppercase">Unauthorized</h2>
          <p className="text-xs text-navy/50 max-w-md">This module is not active in your current navigation context.</p>
        </div>
      );
    }

    return component;
  };

  if (!user) return <Login onLogin={handleLogin} />;

  // ── FULLSCREEN BILLING MODE ──────────────────────────────────────────
  if (activeTab === 'sales') {
    return (
      <div className="fixed inset-0 z-[9000] bg-[#f0ede8] overflow-hidden">
        <button
          onClick={() => setActiveTab('dashboard')}
          title="Exit Billing [Esc]"
          className="fixed top-3 right-4 z-[9999] text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-full transition-all"
        >
          ✕ Exit Billing
        </button>
        {COMPONENT_MAP['sales']}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={user?.role} 
      />
      
      <div className="main flex-1 ml-[var(--sw)] mr-[var(--fw)] flex flex-col relative">
        <CommandBar 
          isOpen={isCommandBarOpen} 
          onClose={() => setIsCommandBarOpen(false)} 
          onNavigate={(tab) => setActiveTab(tab)}
        />
        <TopBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          userRole={user?.role}
          nodeType={nodeType}
          setNodeType={setNodeType}
        />

        <FunctionBar activeTab={activeTab} />
        <StatusBar activeTab={activeTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-[82px_28px_24px] animate-fadeUp">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default PrimeSetuOS;
