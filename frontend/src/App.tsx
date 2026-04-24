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

import { MODULE_REGISTRY } from './lib/ModuleRegistry';
import CommandBar from './components/CommandBar';
import { useSovereignShortcuts } from './hooks/useSovereignShortcuts';
import { syncEngine } from './lib/SyncEngine';
import { useLanguage } from './hooks/useLanguage';
import { SupportedLanguage, LANGUAGES } from './lib/i18n';
import { supabase } from './lib/supabase';
import Login from './modules/auth/Login';
import TopBar from './components/layout/TopBar';

const PrimeSetuOS: React.FC = () => {
  useSovereignShortcuts();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncs, setPendingSyncs] = useState(0);
  const [user, setUser] = useState<{ name: string, role: 'OWNER' | 'MANAGER' | 'CASHIER', store_id?: string } | null>(null);
  const [selectedInstance, setSelectedInstance] = useState('X01');

  const handleLogin = (role: string) => {
    setActiveTab(role === 'CASHIER' ? 'sales' : 'dashboard');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const { user: supaUser } = session;
        setUser({ 
          name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
          role: supaUser.user_metadata?.role || 'CASHIER',
          store_id: supaUser.user_metadata?.store_id || 'X01'
        });
        if (supaUser.user_metadata?.store_id) setSelectedInstance(supaUser.user_metadata.store_id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const { user: supaUser } = session;
        setUser({ 
          name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
          role: supaUser.user_metadata?.role || 'CASHIER',
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
    
    // Periodically check sync queue
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

  const renderContent = () => {
    const activeModule = MODULE_REGISTRY.find(m => m.id === activeTab);
    return activeModule ? activeModule.component : MODULE_REGISTRY[0].component;
  };

  if (!user) return <Login onLogin={handleLogin} />;

  // ── FULLSCREEN BILLING MODE ──────────────────────────────────────────
  // When activeTab === 'sales', render billing in total fullscreen.
  // Sidebar, header, padding — all hidden. Pure POS terminal.
  if (activeTab === 'sales') {
    const billingModule = MODULE_REGISTRY.find(m => m.id === 'sales');
    return (
      <div className="fixed inset-0 z-[9000] bg-[#f0ede8] overflow-hidden">
        {/* Tiny escape hatch — top-right corner only */}
        <button
          onClick={() => setActiveTab('dashboard')}
          title="Exit Billing [Esc]"
          className="fixed top-3 right-4 z-[9999] text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-full transition-all"
        >
          ✕ Exit Billing
        </button>
        {billingModule?.component}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-navy font-sans selection:bg-gold/30">
      <CommandBar 
        isOpen={isCommandBarOpen} 
        onClose={() => setIsCommandBarOpen(false)} 
        onNavigate={(tab) => setActiveTab(tab)}
      />
      <TopBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={user?.role} 
        openCommandBar={() => setIsCommandBarOpen(true)}
      />

      {/* Main Content Area */}
      <main className="pt-16 pb-8 min-h-screen">
        {/* Dynamic Content with Animation */}
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default PrimeSetuOS;
