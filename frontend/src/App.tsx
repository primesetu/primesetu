/* ============================================================
   SMRITI-OS — Lead Frontend Architect Main Shell
   Enforcing Smriti Sentinal Governance (Audit Rule 11)
   ============================================================ */

import React, { useState, useEffect } from 'react';
import { cn } from '@/components/ui/SovereignUI';
import { 
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';

import { COMPONENT_MAP } from './lib/ModuleRegistry';
import { useMenu } from './hooks/useMenu';
import CommandBar from './components/CommandBar';
import { useSovereignShortcuts } from './hooks/useSovereignShortcuts';
import { syncEngine } from './lib/SyncEngine';
import { supabase } from './lib/supabase';
import Login from './modules/auth/Login';
import TopBar from './components/layout/TopBar';

import Sidebar from './components/layout/Sidebar';
import FunctionBar from './components/layout/FunctionBar';
import StatusBar from './components/layout/StatusBar';
import { useTheme } from './hooks/useTheme';

const SmritiOS: React.FC = () => {
  useSovereignShortcuts();
  const { theme, isInstitutional } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { menu: dynamicMenu, findModule } = useMenu();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [searchContext, setSearchContext] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string, role: string, store_id?: string } | null>(null);
  const [selectedInstance, setSelectedInstance] = useState('X01');
  const [nodeType, setNodeType] = useState<'RETAIL' | 'HO' | 'WAREHOUSE'>('RETAIL');

  // SOVEREIGN SHORTCUT GUARD - Protecting against accidental refresh/loss
  useEffect(() => {
    const handleSovereignGuard = (e: KeyboardEvent) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.ctrlKey && e.shiftKey && e.key === 'R')) {
        e.preventDefault();
      }
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; 
    };

    window.addEventListener('keydown', handleSovereignGuard);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('keydown', handleSovereignGuard);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // CONTEXTUAL ZOOM (F2) - Sovereign Auto-Attach Logic
  useHotkeys('f2', (e) => {
    e.preventDefault();
    const activeEl = document.activeElement as HTMLElement;
    if (!activeEl || activeEl.tagName !== 'INPUT') return;

    const context = activeEl.getAttribute('data-f2') || activeEl.id || activeEl.getAttribute('name');

    if (context) {
      const cleanContext = context.replace(/input|field|search|-/gi, '').toLowerCase();
      setSearchContext(cleanContext || 'generic');
      setIsCommandBarOpen(true);
    }
  }, { enableOnFormTags: true, preventDefault: true });

  // GLOBAL NAVIGATION (F3 / Ctrl+K)
  useHotkeys('f3, ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    setSearchContext(null);
    setIsCommandBarOpen(true);
  }, { enableOnFormTags: true, preventDefault: true });

  const handleLogin = (role: string) => {
    setUser({
      name: 'System Admin (Bypass)',
      role: role.toUpperCase(),
      store_id: 'X01'
    });
    setActiveTab(role === 'CASHIER' ? 'sales' : 'dashboard');
  };

  // ── PAGE-SPECIFIC SCOPING ──
  useEffect(() => {
    document.body.id = `page-${activeTab}`;
  }, [activeTab]);

  useEffect(() => {
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
        localStorage.removeItem('smriti_os_pending_print');
        localStorage.removeItem('smriti_os_last_catalogue_sync');
        setUser(null);
      }
    });

    const handleToggleSidebar = () => setIsCollapsed(prev => !prev);
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
    };
  }, []);

  const renderContent = () => {
    const activeModule = findModule(activeTab);
    const component = COMPONENT_MAP[activeTab] || COMPONENT_MAP['dashboard'];
    
    if (Array.isArray(dynamicMenu) && dynamicMenu.length > 0 && !activeModule && activeTab !== 'dashboard') {
       return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-[var(--space-6)] text-center">
          <div className="w-20 h-20 bg-[var(--danger)]/10 rounded-[var(--radius-xl)] flex items-center justify-center text-[var(--danger)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] u-uppercase">Unauthorized</h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-md">This module is not active in your current navigation context.</p>
        </div>
       );
    }

    return component;
  };

  if (!user) return <Login onLogin={handleLogin} />;

  // ── FULLSCREEN BILLING MODE ──────────────────────────────────────────
  if (activeTab === 'sales') {
    return (
      <div className="fixed inset-0 z-[var(--z-modal)] bg-[var(--background)] overflow-hidden">
        <button
          onClick={() => setActiveTab('dashboard')}
          title="Exit Billing [Esc]"
          className="fixed top-[var(--space-3)] right-[var(--space-4)] z-[var(--z-modal)] text-[9px] font-black text-[var(--text-tertiary)] hover:text-[var(--text-primary)] u-uppercase tracking-widest bg-black/10 hover:bg-black/20 px-[var(--space-4)] py-[var(--space-2)] rounded-full transition-all"
        >
          ✕ Exit Billing
        </button>
        {COMPONENT_MAP['sales']}
      </div>
    );
  }

  return (
    <div 
      className="flex min-h-screen bg-[var(--background)] text-[var(--text-primary)]"
      style={{ 
        '--sw': isCollapsed ? '64px' : '256px',
        '--srw': isRightCollapsed ? '0px' : 'var(--sidebar-right-w)'
      } as React.CSSProperties}
    >
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={user?.role} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <div 
        className="main flex-1 flex flex-col relative transition-all duration-300 w-full overflow-x-hidden"
        style={{ 
          marginLeft: 'var(--sw)', 
          marginRight: 'var(--srw)',
          marginTop: 'var(--topbar-h)' 
        }}
      >
        <CommandBar 
          isOpen={isCommandBarOpen} 
          onClose={() => {
            setIsCommandBarOpen(false);
            setSearchContext(null);
          }} 
          onNavigate={(tab) => setActiveTab(tab)}
          initialContext={searchContext}
        />
        <TopBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          userRole={user?.role}
          nodeType={nodeType}
          setNodeType={setNodeType}
          setIsCommandBarOpen={setIsCommandBarOpen}
        />

        <FunctionBar 
          activeTab={activeTab} 
          isRightCollapsed={isRightCollapsed}
          setIsRightCollapsed={setIsRightCollapsed}
        />
        <StatusBar activeTab={activeTab} />

        {/* Main Content Area */}
        <main 
          className="flex-1 overflow-y-auto p-6 bg-[var(--background)]"
          style={{ 
            paddingBottom: 'calc(var(--status-bar-h, 24px) + 2rem)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SmritiOS;
