import React, { useState, useEffect } from 'react'
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Menu as MenuIcon, 
  Bell,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LayoutGrid,
  History,
  Command,
  User,
  Monitor,
  Sun,
  Moon,
  Database,
  ShieldCheck,
  ChevronDown,
  Palette
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { fetchMenu, MenuItem, STATIC_FALLBACK_MENU } from '@/api/menuService'
import { ICON_MAP } from '@/lib/ModuleRegistry'

/**
 * Recursive Navigation Component for deep-nested Sovereign Menus
 */
function RecursiveNavItem({ item, activeTab, setActiveTab, level = 0 }: { 
  item: MenuItem, 
  activeTab: string, 
  setActiveTab: (id: string) => void,
  level?: number 
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activeTab === item.id;
  const Icon = ICON_MAP[item.module] || LayoutGrid;

  return (
    <div className="space-y-1">
      <button
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          } else {
            setActiveTab(item.id);
          }
        }}
        className={cn(
          "w-full h-10 flex items-center gap-3 px-4 rounded-lg transition-all text-[11px]",
          isActive 
            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-black" 
            : "text-[var(--text-tertiary)] hover:bg-[var(--surface-container)] hover:text-[var(--text-primary)]"
        )}
      >
        <Icon size={14} className={isActive ? "text-[var(--primary)]" : "opacity-40"} />
        <span className="flex-1 text-left truncate">{item.label}</span>
        {hasChildren && (
          <ChevronDown size={12} className={cn("transition-transform", isOpen ? "rotate-180" : "opacity-30")} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden ml-3 border-l border-[var(--border-subtle)] pl-2 space-y-1"
          >
            {item.children.map(child => (
              <RecursiveNavItem 
                key={child.id} 
                item={child} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                level={level + 1} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  shortcut?: string
  color?: string
}

interface ResponsiveShellProps {
  children: React.ReactNode
  activeTab: string
  setActiveTab: (tab: string) => void
  userRole?: string
  nodeType?: 'RETAIL' | 'HO' | 'WAREHOUSE'
  setNodeType?: (type: 'RETAIL' | 'HO' | 'WAREHOUSE') => void
  setIsCommandBarOpen?: (val: boolean) => void
  setIsThemePickerOpen?: (val: boolean) => void
  isRightCollapsed?: boolean
  setIsRightCollapsed?: (val: boolean) => void
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, shortcut: 'F6', color: 'text-blue-500' },
  { id: 'sales', label: 'Terminal', icon: ShoppingCart, shortcut: 'F2', color: 'text-emerald-500' },
  { id: 'inventory', label: 'Inventory', icon: Package, shortcut: 'F9', color: 'text-amber-500' },
  { id: 'reports', label: 'Analytics', icon: History, shortcut: 'F12', color: 'text-purple-500' },
  { id: 'table_viewer', label: 'DB Explorer', icon: Database, shortcut: 'F4', color: 'text-rose-500' },
  { id: 'architect_config', label: 'SMRITI Config', icon: ShieldCheck, shortcut: 'F7', color: 'text-orange-500' },
  { id: 'settings', label: 'System', icon: Settings, shortcut: 'F10', color: 'text-slate-500' },
]

export default function ResponsiveShell({ 
  children, 
  activeTab, 
  setActiveTab,
  userRole,
  nodeType = 'RETAIL',
  setNodeType,
  setIsCommandBarOpen,
  setIsThemePickerOpen,
  isRightCollapsed,
  setIsRightCollapsed
}: ResponsiveShellProps) {
  const { theme, setTheme, themeMeta } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
   const [isCollapsed, setIsCollapsed] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(STATIC_FALLBACK_MENU)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['QUICK_ACCESS', 'POS'])

  useEffect(() => {
    fetchMenu().then(items => {
      setMenuItems(items);
    });
  }, [])

  // Auto-expand category when activeTab changes
  useEffect(() => {
    const item = menuItems.find(m => m.id === activeTab);
    if (item && item.category) {
      setExpandedGroups(prev => prev.includes(item.category!) ? prev : [...prev, item.category!]);
    } else {
      // Check if it's in Pinned items
      if (NAV_ITEMS.find(n => n.id === activeTab)) {
        setExpandedGroups(prev => prev.includes('QUICK_ACCESS') ? prev : [...prev, 'QUICK_ACCESS']);
      }
    }
  }, [activeTab, menuItems])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    )
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'LIGHT' ? 'DARK' : 'LIGHT')
  }

  // ── EXCLUSIVE MODES (Transactional Fullscreen) ──
  const isExclusive = [
    'sales', 
    'purchase_entry', 
    'purchase_journal', 
    'sales_journal', 
    'stock_ledger'
  ].includes(activeTab);

  // ── DESKTOP RENDERING (The Original "Feel") ──
  if (!isMobile) {
    return (
      <div className={cn(
        "flex h-screen w-full bg-[var(--background)] text-[var(--text-primary)] font-sans overflow-hidden transition-colors duration-500",
        theme === 'DARK' ? "selection:bg-blue-500/30" : "selection:bg-blue-500/10"
      )}>
        
        {/* SIDEBAR - Hide in Exclusive Mode */}
        {!isExclusive && (
          <motion.aside 
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="relative z-50 flex flex-col bg-[var(--surface)] border-r border-[var(--border-subtle)] shadow-[20px_0_50px_-20px_rgba(0,0,0,0.05)] transition-all duration-500"
          >
            {/* Brand Header */}
                <div className="h-20 flex items-center px-6 gap-4 border-b border-[var(--border-subtle)] shrink-0 overflow-hidden">
                   <button 
                     onClick={() => fetchMenu().then(setMenuItems)}
                     className="relative group shrink-0"
                   >
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative w-10 h-10 bg-[var(--surface-container)] rounded-lg border border-[var(--border-subtle)] flex items-center justify-center">
                        <span className="text-lg font-black text-[var(--primary)]">S</span>
                      </div>
                   </button>
               {!isCollapsed && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                   <span className="text-xs font-black tracking-[0.2em] uppercase text-[var(--text-primary)] leading-tight">SMRITI-OS</span>
                   <span className="text-[9px] font-black tracking-widest uppercase text-[var(--primary)] opacity-80">Sovereign Intel</span>
                 </motion.div>
               )}
            </div>

            {/* Search Trigger */}
            <div className="p-4 shrink-0">
               <button 
                onClick={() => setIsCommandBarOpen?.(true)}
                className={cn(
                  "flex items-center gap-3 w-full bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-xl hover:bg-[var(--surface-container)] transition-all duration-300 group overflow-hidden",
                  isCollapsed ? "h-12 justify-center" : "h-12 px-4"
                )}
               >
                  <Search size={18} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
                  {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]">Quick Search</span>
                      <span className="text-[10px] font-mono bg-[var(--surface-container-high)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-tertiary)]">Alt+G</span>
                    </div>
                  )}
               </button>
            </div>

            {/* Unified Collapsible Menu Structure */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-24">
              
              {/* 1. Quick Access (Pinned) - Now Collapsible */}
              <div className="px-3 space-y-1">
                <button 
                  onClick={() => toggleGroup('QUICK_ACCESS')}
                  className={cn(
                    "w-full h-11 flex items-center gap-4 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--surface-container)] hover:text-[var(--text-primary)] transition-all group",
                    isCollapsed ? "justify-center" : "px-4",
                    expandedGroups.includes('QUICK_ACCESS') && !isCollapsed ? "bg-[var(--surface-container-low)]" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    expandedGroups.includes('QUICK_ACCESS') && !isCollapsed ? "bg-blue-500/10 text-blue-500" : "bg-[var(--surface-container-high)] opacity-60"
                  )}>
                    <Zap size={16} />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left text-[11px] font-black uppercase tracking-widest">Quick Access</span>
                      <ChevronDown size={14} className={cn("transition-transform duration-300", expandedGroups.includes('QUICK_ACCESS') ? "rotate-180" : "opacity-40")} />
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {expandedGroups.includes('QUICK_ACCESS') && !isCollapsed && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-1 ml-4 border-l border-[var(--border-subtle)] pl-2"
                    >
                      {NAV_ITEMS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={cn(
                            "relative w-full h-10 flex items-center gap-3 px-4 rounded-lg transition-all duration-300 group",
                            activeTab === item.id 
                              ? "bg-[var(--primary)]/10 text-[var(--primary)] font-black shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]" 
                              : "text-[var(--text-tertiary)] hover:bg-[var(--surface-container)] hover:text-[var(--text-primary)]"
                          )}
                        >
                          <item.icon size={16} className={cn(activeTab === item.id ? item.color : "opacity-40 group-hover:text-[var(--text-primary)]")} />
                          <span className="flex-1 text-left text-[11px] uppercase tracking-widest leading-none truncate">{item.label}</span>
                          {item.shortcut && <span className="text-[9px] font-mono font-bold opacity-30 group-hover:opacity-100 transition-opacity">{item.shortcut}</span>}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. System Modules - Categories & Submenus */}
              <div className="px-3 space-y-1 mt-4">
                <div className="px-4 py-2 flex justify-between items-center">
                  {!isCollapsed && <span className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">System Modules</span>}
                </div>

                {(() => {
                  const categories = Array.from(new Set(menuItems.map(m => m.category || 'Other')));
                  
                  return categories.map(category => {
                    const items = menuItems.filter(m => (m.category || 'Other') === category);
                    const isExpanded = expandedGroups.includes(category);
                    
                    return (
                      <div key={category} className="space-y-1">
                        <button 
                          onClick={() => toggleGroup(category)}
                          className={cn(
                            "w-full h-11 flex items-center gap-4 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--surface-container)] hover:text-[var(--text-primary)] transition-all group",
                            isCollapsed ? "justify-center" : "px-4",
                            isExpanded && !isCollapsed ? "bg-[var(--surface-container-low)]" : ""
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            isExpanded && !isCollapsed ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "bg-[var(--surface-container-high)] opacity-60"
                          )}>
                            <LayoutGrid size={16} />
                          </div>
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-left text-[11px] font-black uppercase tracking-widest">{category}</span>
                              <ChevronDown size={14} className={cn("transition-transform duration-300", isExpanded ? "rotate-180" : "opacity-40")} />
                            </>
                          )}
                        </button>

                        <AnimatePresence>
                          {isExpanded && !isCollapsed && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden space-y-1 ml-4 border-l border-[var(--border-subtle)] pl-2"
                            >
                              {items.map(item => (
                                <RecursiveNavItem 
                                  key={item.id} 
                                  item={item} 
                                  activeTab={activeTab} 
                                  setActiveTab={setActiveTab} 
                                />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Footer Actions / Theme Toggle */}
            <div className="p-4 border-t border-[var(--border-subtle)] shrink-0 space-y-4">
               {/* Theme Picker Trigger */}
               <button 
                onClick={() => setIsThemePickerOpen?.(true)}
                title="Open Theme Manager (Alt+T)"
                className={cn(
                  "flex items-center gap-3 w-full h-12 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] hover:bg-[var(--surface-container)] hover:border-[var(--color-primary,#06b6d4)] transition-all group overflow-hidden",
                  isCollapsed ? "justify-center" : "px-4"
                )}
               >
                  <Palette size={18} className="text-[var(--color-primary,#06b6d4)] group-hover:rotate-12 transition-transform duration-300" />
                  {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary,#94a3b8)]">
                        {themeMeta?.label || 'Theme'}
                      </span>
                      <span className="text-[8px] font-mono bg-[var(--surface-container-high)] px-1.5 py-0.5 border border-[var(--color-border)] text-[var(--color-text-tertiary)]">Alt+T</span>
                    </div>
                  )}
               </button>

               <div className={cn(
                 "flex items-center gap-4 bg-[var(--surface-container-low)] rounded-2xl p-3 border border-[var(--border-subtle)] group hover:bg-[var(--surface-container)] transition-all cursor-pointer",
                 isCollapsed ? "justify-center px-0" : ""
               )}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--surface-container-high)] to-[var(--surface-container-highest)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                    <User size={20} className="text-[var(--text-tertiary)]" />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-black text-[var(--text-primary)] truncate leading-tight uppercase">{userRole || 'ADMIN'}</p>
                      <p className="text-[9px] font-black text-[var(--primary)] opacity-60 uppercase tracking-widest mt-0.5">Sovereign Guard</p>
                    </div>
                  )}
               </div>
               
               <button 
                 onClick={async () => {
                   (window as any).__isLoggingOut = true;
                   await import('@/lib/supabase').then(m => m.supabase.auth.signOut());
                   window.location.reload();
                 }}
                 className={cn(
                   "flex items-center gap-3 w-full rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all group overflow-hidden",
                   isCollapsed ? "justify-center h-12" : "px-4 py-3"
                 )}
                 title="Sign Out"
               >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover:rotate-12 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                 {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest leading-none">Sign Out</span>}
               </button>
            </div>

            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-24 w-6 h-6 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] transition-all z-10"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </motion.aside>
        )}

        {/* MAIN ENGINE */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* HEADER - Hide in Exclusive Mode */}
          {!isExclusive && (
            <header className={cn(
              "h-16 flex items-center justify-between px-8 z-40 transition-all duration-500",
              isScrolled ? "bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]" : "bg-transparent"
            )}>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3">
                   <Zap size={16} className="text-amber-500" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Node: MUM-X01-ACTIVE</span>
                 </div>
                 <div className="h-4 w-px bg-[var(--border-subtle)]" />
                 <div className="flex gap-2">
                    {['RETAIL', 'HO', 'WAREHOUSE'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setNodeType?.(type as any)}
                        className={cn(
                          "px-3 py-1 text-[9px] font-black rounded-full border transition-all",
                          nodeType === type ? "bg-[var(--primary)] border-[var(--primary)] text-white" : "border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 {/* Theme Picker Button */}
                 <button
                   onClick={() => setIsThemePickerOpen?.(true)}
                   title="Theme Manager (Alt+T)"
                   className="flex items-center gap-2 px-3 py-2 bg-[var(--color-primary,#06b6d4)]/10 text-[var(--color-primary,#06b6d4)] border border-[var(--color-primary,#06b6d4)]/25 text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-primary,#06b6d4)] hover:text-white transition-all"
                 >
                    <Palette size={14} />
                    {themeMeta?.label || 'Theme'}
                 </button>
                 <button 
                   onClick={() => window.dispatchEvent(new CustomEvent('toggleLayout'))}
                   className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                 >
                    <Monitor size={14} />
                    Sovereign
                 </button>
                 <div className="h-8 w-px bg-[var(--border-subtle)]" />
                 <div className="flex flex-col items-end">
                    <span className="text-[14px] font-black text-[var(--color-text-primary,#f8fafc)] tracking-widest leading-none">PRIMESETU</span>
                    <span className="text-[7px] font-black text-[var(--color-primary,#06b6d4)] tracking-[0.3em] uppercase mt-1 opacity-60">Sovereign Retail Tech</span>
                 </div>
              </div>
            </header>
          )}

          {/* Floating Fullscreen Toggle (Bottom Right) */}
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
            className="fixed bottom-6 right-6 p-3 bg-white border border-[var(--border-subtle)] rounded-full text-[var(--text-tertiary)] hover:text-[var(--primary)] hover:border-[var(--primary)] shadow-xl transition-all z-[1000]"
            title="Toggle Fullscreen"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6" />
            </svg>
          </button>

          {/* PAGE CONTENT */}
          <section 
            onScroll={(e: any) => setIsScrolled(e.target.scrollTop > 20)}
            className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth relative",
              !isExclusive ? "p-6 pb-24 md:pb-8" : "p-0"
            )}
          >
            <div className={cn("relative z-10 h-full", !isExclusive ? "max-w-[1600px] mx-auto" : "max-w-none")}>
              {children}
            </div>
          </section>
        </main>
      </div>
    )
  }

  // ── MOBILE RENDERING (Simplified) ──
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--background)] font-sans select-none antialiased">
      {/* MOBILE HEADER - Hide if Billing */}
      {!isExclusive && (
        <header className="h-14 bg-[var(--background)] border-b border-[var(--border-subtle)] flex items-center justify-between px-6 sticky top-0 z-[60] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
              <span className="text-xs font-black text-white">S</span>
            </div>
            <span className="font-black text-lg tracking-tighter text-[var(--text-primary)] uppercase italic">SMRITI<span className="text-[var(--primary)]">.OS</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-[var(--text-tertiary)]">
              {theme === 'LIGHT' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className="p-2 text-[var(--text-tertiary)]"><Bell size={20} /></button>
          </div>
        </header>
      )}

      {/* MOBILE PAGE CONTENT */}
      <section className={cn("flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth", !isExclusive ? "pb-24" : "pb-0")}>
        {children}
      </section>

      {/* MOBILE BOTTOM NAVIGATION - Hide if Billing */}
      {!isExclusive && (
        <nav className="fixed bottom-0 left-0 right-0 h-[76px] bg-[var(--surface)]/95 backdrop-blur-2xl border-t border-[var(--border-subtle)] flex items-center justify-around px-4 pb-safe z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 w-16 h-full relative",
                activeTab === item.id ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
              )}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-500",
                activeTab === item.id ? "bg-[var(--primary)]/10 scale-110 shadow-[0_0_20px_rgba(37,99,235,0.05)]" : ""
              )}>
                <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} className={activeTab === item.id ? item.color : ""} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="mobile-indicator"
                  className="absolute -top-1 w-10 h-1 bg-[var(--primary)] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                />
              )}
            </button>
          ))}
        </nav>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-disabled); }
      `}} />
    </div>
  )
}
