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
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHotkeys } from 'react-hotkeys-hook'
import {
  LayoutDashboard, ShoppingCart, RotateCcw, Package, ShoppingBag,
  BookOpen, Tag, Users, Truck, BarChart3, TrendingUp, FileText,
  Settings, Globe, Lock, ChevronDown, Zap, Search, HelpCircle,
  CreditCard, Boxes, ClipboardList, Receipt, UserSquare2,
  Percent, Building2, AlertTriangle, Database, Trophy, History
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/hooks/useLanguage'
import { LANGUAGES } from '@/lib/i18n'
import logo from '@/assets/logo.png'

interface MenuItem {
  id: string
  label: string
  shortLabel?: string
  icon: any
  shortcut?: string
  tallyKey?: string 
  badge?: string
  roles?: ('OWNER'|'MANAGER'|'CASHIER')[]
}

interface MenuGroup {
  id: string
  label: string
  icon: any
  color: string
  tallyKey: string 
  items: MenuItem[]
}

const MENU: MenuGroup[] = [
  {
    id: 'sales',
    label: 'Sales',
    icon: ShoppingCart,
    color: 'bg-amber-400',
    tallyKey: 'S',
    items: [
      { id: 'dashboard',  label: 'Dashboard',       icon: LayoutDashboard, tallyKey: 'D', roles: ['OWNER','MANAGER'] },
      { id: 'sales',      label: 'Billing / POS',   icon: ShoppingCart,    shortcut: 'F1', tallyKey: 'B', roles: ['OWNER','MANAGER','CASHIER'] },
      { id: 'returns',    label: 'Returns & Credits',icon: RotateCcw,       shortcut: 'F4', tallyKey: 'R', roles: ['OWNER','MANAGER','CASHIER'] },
      { id: 'dayend',     label: 'Shift Closure',   icon: Lock,            shortcut: 'F12',tallyKey: 'C', roles: ['OWNER','MANAGER','CASHIER'] },
    ]
  },
  {
    id: 'stock',
    label: 'Stock',
    icon: Boxes,
    color: 'bg-blue-400',
    tallyKey: 'T',
    items: [
      { id: 'inventory',   label: 'Stock Take (PST)',  icon: ClipboardList,  shortcut: 'F9', tallyKey: 'S', roles: ['OWNER','MANAGER'] },
      { id: 'procurement', label: 'Procurement Hub',    icon: ShoppingBag,    tallyKey: 'G', roles: ['OWNER','MANAGER'] },
      { id: 'movement',    label: 'Stock Movement',    icon: History,        tallyKey: 'M', roles: ['OWNER','MANAGER'] },
      { id: 'barcode',     label: 'Barcode & Labels',  icon: Tag,            tallyKey: 'L', roles: ['OWNER','MANAGER'] },
    ]
  },
  {
    id: 'catalogue',
    label: 'Catalogue',
    icon: BookOpen,
    color: 'bg-emerald-400',
    tallyKey: 'C',
    items: [
      { id: 'registry',   label: 'Item Master',       icon: Package,      shortcut: 'F2', tallyKey: 'I', roles: ['OWNER','MANAGER'] },
      { id: 'customers',  label: 'Customer Registry', icon: Users,        tallyKey: 'C', roles: ['OWNER','MANAGER'] },
      { id: 'vendors',    label: 'Vendor Network',    icon: Truck,        tallyKey: 'V', roles: ['OWNER','MANAGER'] },
      {id: 'personnel',  label: 'Sales Personnel',   icon: UserSquare2,  tallyKey: 'P', roles: ['OWNER','MANAGER'] },
      {id: 'loyalty',    label: 'Loyalty Programs',  icon: Trophy,       tallyKey: 'L', roles: ['OWNER','MANAGER'] },
      {id: 'schemes',    label: 'Sales Promotions',  icon: Percent,      tallyKey: 'M', roles: ['OWNER','MANAGER'] },
    ]
  },
  {
    id: 'reports',
    label: 'MIS & Analytics',
    icon: BarChart3,
    color: 'bg-purple-400',
    tallyKey: 'R',
    items: [
      { id: 'analytics',  label: 'MIS Reports',        icon: TrendingUp,   shortcut: 'F3', tallyKey: 'M', roles: ['OWNER'] },
      { id: 'salesrep',   label: 'Daily Sales Book',   icon: Receipt,      tallyKey: 'D', roles: ['OWNER','MANAGER'] },
      { id: 'stockrep',   label: 'Stock Reports',      icon: FileText,     tallyKey: 'S', roles: ['OWNER','MANAGER'] },
      { id: 'taxrep',     label: 'Tax Register',       icon: CreditCard,   tallyKey: 'T', roles: ['OWNER'] },
    ]
  },
  {
    id: 'ho',
    label: 'HO Sync',
    icon: Globe,
    color: 'bg-cyan-400',
    tallyKey: 'H',
    items: [
      { id: 'ho',         label: 'Corporate Sync',    icon: Globe,        tallyKey: 'C', roles: ['OWNER','MANAGER'] },
      { id: 'alerts',     label: 'Chain Store Intel',  icon: Building2,   tallyKey: 'I', roles: ['OWNER'] },
    ]
  },
  {
    id: 'setup',
    label: 'Config',
    icon: Settings,
    color: 'bg-rose-400',
    tallyKey: 'U',
    items: [
      { id: 'settings',   label: 'System Config',     icon: Settings,     shortcut: 'F10', tallyKey: 'S', roles: ['OWNER'] },
      { id: 'security',   label: 'Security & Users',  icon: AlertTriangle,tallyKey: 'E', roles: ['OWNER'] },
      { id: 'housekeep',  label: 'Housekeeping',      icon: Database,     tallyKey: 'K', roles: ['OWNER'] },
    ]
  }
]

interface TopBarProps {
  activeTab: string
  setActiveTab: (id: string) => void
  userRole?: 'OWNER' | 'MANAGER' | 'CASHIER'
  openCommandBar: () => void
}

export default function TopBar({ activeTab, setActiveTab, userRole = 'OWNER', openCommandBar }: TopBarProps) {
  const { language, setLanguage } = useLanguage()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNav = (item: MenuItem) => {
    setActiveTab(item.id)
    setOpenDropdown(null)
  }

  const visibleGroups = React.useMemo(() => MENU.map(g => ({
    ...g,
    items: g.items.filter(i => !i.roles || i.roles.includes(userRole))
  })).filter(g => g.items.length > 0), [userRole])

  const renderTallyLabel = (label: string, tallyKey?: string) => {
    if (!tallyKey) return label
    const idx = label.toLowerCase().indexOf(tallyKey.toLowerCase())
    if (idx === -1) return label
    return (
      <>
        {label.substring(0, idx)}
        <span className="underline decoration-2 underline-offset-[3px] text-inherit">{label.charAt(idx)}</span>
        {label.substring(idx + 1)}
      </>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#fdfcf9] z-[1000] flex items-center px-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-b border-navy/5 text-navy" ref={menuRef}>
      
      {/* Brand Identity */}
      <div className="flex items-center gap-5 pr-8 mr-6 border-r-2 border-navy/5 h-10">
        <div className="w-10 h-10 bg-navy text-gold rounded-xl flex items-center justify-center font-black text-2xl shadow-xl transform hover:rotate-6 transition-transform cursor-pointer">P</div>
        <div className="flex flex-col">
          <span className="text-xl font-serif font-black tracking-tighter leading-none">PrimeSetu</span>
          <span className="text-[9px] font-black uppercase text-gold tracking-[0.3em] mt-1">Sovereign Node</span>
        </div>
      </div>

      {/* Ribbon Menu */}
      <nav className="flex items-center h-full gap-2">
        {visibleGroups.map(group => {
          const isOpen = openDropdown === group.id
          const hasActive = group.items.some(i => i.id === activeTab)
          
          return (
            <div key={group.id} className="relative h-full flex items-center">
              <button
                onMouseEnter={() => setOpenDropdown(group.id)}
                onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
                  isOpen || hasActive ? 'bg-navy text-white shadow-2xl scale-105' : 'text-navy/50 hover:bg-navy/5 hover:text-navy'
                }`}
              >
                {renderTallyLabel(group.label, group.tallyKey)}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180 opacity-100' : 'opacity-30'}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    onMouseLeave={() => setOpenDropdown(null)}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute left-0 top-[90%] mt-2 w-80 bg-white border border-navy/5 shadow-[0_25px_60px_rgba(0,0,0,0.18)] rounded-[2.5rem] py-5 z-[1001] overflow-hidden backdrop-blur-3xl"
                  >
                    <div className="px-8 py-3 mb-3 text-[10px] font-black text-gold uppercase tracking-[0.25em] border-b border-navy/5 bg-navy/[0.02]">
                       {group.label} Menu
                    </div>
                    <div className="px-2 space-y-1">
                      {group.items.map(item => {
                        const isActive = activeTab === item.id
                        const ItemIcon = item.icon
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNav(item)}
                            className={`w-full flex items-center gap-5 px-6 py-4 text-left transition-all rounded-3xl group ${
                              isActive ? 'bg-navy text-white shadow-xl scale-[1.02]' : 'hover:bg-cream'
                            }`}
                          >
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                              isActive ? 'bg-white/10 text-gold' : 'bg-navy/5 text-navy group-hover:bg-navy group-hover:text-white'
                            }`}>
                              <ItemIcon className="w-5.5 h-5.5" />
                            </div>
                            <div className="flex-1">
                              <div className={`text-sm font-black ${isActive ? 'text-white' : 'text-navy'}`}>
                                {renderTallyLabel(item.label, item.tallyKey)}
                              </div>
                              <div className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? 'text-gold/60' : 'text-muted'}`}>
                                {item.shortcut || 'Jump'}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* Global Utilities */}
      <div className="flex items-center gap-8 h-full border-l-2 border-navy/5 pl-8">
        <button 
          onClick={openCommandBar}
          className="bg-white border-2 border-navy/5 px-8 py-3 rounded-2xl text-[10px] font-black text-navy/30 flex items-center gap-4 hover:border-gold hover:text-navy transition-all shadow-sm group"
        >
          <Search className="w-4 h-4 text-gold transition-transform group-hover:scale-125" />
          GO TO <kbd className="bg-navy/5 px-2 py-1 rounded-lg font-mono text-[9px] text-navy/40">ALT+G</kbd>
        </button>

        <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border-2 border-navy/5 pr-6 cursor-pointer hover:shadow-xl transition-all group active:scale-95" onClick={() => supabase.auth.signOut()}>
           <div className="w-10 h-10 bg-navy text-gold rounded-2xl flex items-center justify-center font-black text-lg shadow-lg group-hover:rotate-12 transition-transform">
             {userRole?.[0] || 'U'}
           </div>
           <div className="flex flex-col">
             <span className="text-[11px] font-black text-navy uppercase leading-none">Sovereign Node</span>
             <span className="text-[9px] font-black text-emerald-500 mt-1.5 uppercase tracking-widest flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               {userRole}
             </span>
           </div>
        </div>
      </div>
    </header>
  )
}
