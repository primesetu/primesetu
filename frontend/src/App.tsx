/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

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
import ResponsiveShell from './components/layouts/ResponsiveShell';
import SovereignDesktop from './components/layouts/SovereignDesktop';
import { useTheme } from './hooks/useTheme';
import { Routes, Route, useLocation } from 'react-router-dom';
import ArchitectExplorer from './modules/architect/ArchitectExplorer';
import ItemMasterWorkbench from './modules/inventory/ItemMasterWorkbench';
import CatalogueMasterWorkbench from './modules/inventory/CatalogueMasterWorkbench';

const PrimeSetu: React.FC = () => {
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
      if ((window as any).__isLoggingOut) return;
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

  // GLOBAL NAVIGATION (F3 / Ctrl+K / Alt+G)
  useHotkeys('f3, ctrl+k, cmd+k, alt+g', (e) => {
    e.preventDefault();
    setSearchContext(null);
    setIsCommandBarOpen(true);
  }, { enableOnFormTags: true, preventDefault: true });

  // RIGHT SIDEBAR TOGGLE (Alt+K)
  useHotkeys('alt+k', (e) => {
    e.preventDefault();
    setIsRightCollapsed(prev => !prev);
  }, { enableOnFormTags: true, preventDefault: true });

  const [layoutMode, setLayoutMode] = useState<'STANDARD' | 'SOVEREIGN'>('STANDARD');

  // LAYOUT MODE TOGGLE (Alt+D)
  useHotkeys('alt+d', (e) => {
    e.preventDefault();
    setLayoutMode(prev => prev === 'STANDARD' ? 'SOVEREIGN' : 'STANDARD');
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
        localStorage.removeItem('primesetu_pending_print');
        localStorage.removeItem('primesetu_last_catalogue_sync');
        setUser(null);
      }
    });

    const handleToggleSidebar = () => setIsCollapsed(prev => !prev);
    const handleToggleLayout = () => setLayoutMode(prev => prev === 'STANDARD' ? 'SOVEREIGN' : 'STANDARD');
    const handleNavigate = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    window.addEventListener('toggleLayout', handleToggleLayout);
    window.addEventListener('navigate', handleNavigate);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
      window.removeEventListener('toggleLayout', handleToggleLayout);
      window.removeEventListener('navigate', handleNavigate);
    };
  }, []);

  const renderContent = () => {
    const component = COMPONENT_MAP[activeTab] || COMPONENT_MAP['dashboard'];
    return component;
  };

  const location = useLocation();
  const isArchitectPath = location.pathname.startsWith('/jawaharmallah');
  const isWorkbenchPath = location.pathname === '/workbench';
  const isCatWorkbenchPath = location.pathname === '/catworkbench';
  const isPopoutPath = location.pathname.startsWith('/popout/');

  // Standalone Popout Logic
  if (isPopoutPath) {
    const moduleId = location.pathname.split('/')[2];
    const PopoutComponent = COMPONENT_MAP[moduleId];

    if (!PopoutComponent) return <div className="p-8 text-red-500 font-black">404: MODULE NOT FOUND IN SOVEREIGN REGISTRY</div>;

    return (
      <div className="h-screen w-screen bg-[var(--background)] p-0 overflow-hidden">
        {PopoutComponent}
      </div>
    );
  }

  // If on Architect path, render the Explorer directly
  if (isArchitectPath) {
    return (
      <Routes>
        <Route path="/jawaharmallah" element={<ArchitectExplorer />} />
        <Route path="/jawaharmallah/:module" element={<ArchitectExplorer />} />
      </Routes>
    );
  }

  if (!user) return <Login onLogin={handleLogin} />;

  if (layoutMode === 'SOVEREIGN') {
    return (
      <SovereignDesktop onExit={() => setLayoutMode('STANDARD')} />
    );
  }

  return (
    <ResponsiveShell 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      userRole={user.role}
      nodeType={nodeType}
      setNodeType={setNodeType}
      setIsCommandBarOpen={setIsCommandBarOpen}
      isRightCollapsed={isRightCollapsed}
      setIsRightCollapsed={setIsRightCollapsed}
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
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </ResponsiveShell>
  );
};

export default PrimeSetu;
