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
  Moon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

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
  isRightCollapsed?: boolean
  setIsRightCollapsed?: (val: boolean) => void
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, shortcut: 'F6', color: 'text-blue-500' },
  { id: 'sales', label: 'Terminal', icon: ShoppingCart, shortcut: 'F2', color: 'text-emerald-500' },
  { id: 'inventory', label: 'Inventory', icon: Package, shortcut: 'F9', color: 'text-amber-500' },
  { id: 'reports', label: 'Analytics', icon: History, shortcut: 'F12', color: 'text-purple-500' },
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
  isRightCollapsed,
  setIsRightCollapsed
}: ResponsiveShellProps) {
  const { theme, setTheme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'LIGHT' ? 'DARK' : 'LIGHT')
  }

  // ── EXCLUSIVE MODES (Billing Fullscreen) ──
  const isExclusive = activeTab === 'sales'

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
               <div className="relative group shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-10 h-10 bg-[var(--surface-container)] rounded-lg border border-[var(--border-subtle)] flex items-center justify-center">
                    <span className="text-lg font-black text-[var(--primary)]">S</span>
                  </div>
               </div>
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

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "relative w-full h-12 flex items-center gap-4 rounded-xl transition-all duration-300 group",
                    activeTab === item.id 
                      ? "bg-[var(--primary)]/10 text-[var(--primary)] shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]" 
                      : "text-[var(--text-tertiary)] hover:bg-[var(--surface-container)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <div className={cn(
                    "w-1 h-6 rounded-full absolute left-0 transition-all duration-500",
                    activeTab === item.id ? "bg-[var(--primary)] opacity-100" : "bg-transparent opacity-0"
                  )} />
                  <div className={cn(
                    "flex items-center justify-center transition-all duration-300",
                    isCollapsed ? "w-full" : "ml-4"
                  )}>
                    <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 1.5} className={cn(activeTab === item.id ? item.color : "group-hover:text-[var(--text-primary)]")} />
                  </div>
                  {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between pr-4">
                      <span className="text-[11px] font-black uppercase tracking-widest leading-none">{item.label}</span>
                      {item.shortcut && <span className="text-[9px] font-mono font-bold opacity-30 group-hover:opacity-100 transition-opacity">{item.shortcut}</span>}
                    </div>
                  )}
                </button>
              ))}
            </nav>

            {/* Footer Actions / Theme Toggle */}
            <div className="p-4 border-t border-[var(--border-subtle)] shrink-0 space-y-4">
               <button 
                onClick={toggleTheme}
                className={cn(
                  "flex items-center gap-3 w-full h-12 rounded-xl bg-[var(--surface-container-low)] border border-[var(--border-subtle)] hover:bg-[var(--surface-container)] transition-all group overflow-hidden",
                  isCollapsed ? "justify-center" : "px-4"
                )}
               >
                  {theme === 'LIGHT' ? <Moon size={18} className="text-slate-500" /> : <Sun size={18} className="text-amber-400" />}
                  {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{theme === 'LIGHT' ? 'Dark Mode' : 'Light Mode'}</span>}
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

              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                    <Monitor size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Terminal V2.0</span>
                 </div>
                 <button className="relative p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-[var(--background)]" />
                 </button>
                 <div className="h-8 w-px bg-[var(--border-subtle)]" />
                 <div className="flex flex-col items-end">
                    <span className="text-[14px] font-black text-[var(--text-primary)] tracking-widest leading-none">PRIMESETU</span>
                    <span className="text-[7px] font-black text-[var(--primary)] tracking-[0.3em] uppercase mt-1 opacity-60">Sovereign Retail Tech</span>
                 </div>
              </div>
            </header>
          )}

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
