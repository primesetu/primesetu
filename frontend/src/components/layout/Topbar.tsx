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
  Percent, Building2, AlertTriangle, Database, Command
} from 'lucide-react'
import { useStore } from '@/hooks/useStore'
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
  tallyKey?: string // The letter to underline and use as a sub-shortcut
  badge?: string
  roles?: ('OWNER'|'MANAGER'|'CASHIER')[]
  hot?: boolean
}

interface MenuGroup {
  id: string
  label: string
  icon: any
  color: string
  tallyKey: string // The Alt+<Key> shortcut
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
      { id: 'dashboard',  label: 'Dashboard',       icon: LayoutDashboard, tallyKey: 'D', roles: ['OWNER','MANAGER'], hot: false },
      { id: 'sales',      label: 'Billing / POS',   icon: ShoppingCart,    shortcut: 'F1', tallyKey: 'B', roles: ['OWNER','MANAGER','CASHIER'], hot: true },
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
      { id: 'procurement', label: 'Goods Inwards',     icon: ShoppingBag,    tallyKey: 'G', roles: ['OWNER','MANAGER'] },
      { id: 'barcode',     label: 'Barcode & Labels',  icon: Tag,            tallyKey: 'L', roles: ['OWNER','MANAGER'], badge: 'soon' },
    ]
  },
  {
    id: 'catalogue',
    label: 'Catalogue',
    icon: BookOpen,
    color: 'bg-emerald-400',
    tallyKey: 'C',
    items: [
      { id: 'registry',   label: 'Item Master',       icon: Package,      shortcut: 'F2', tallyKey: 'I', roles: ['OWNER','MANAGER'], hot: true },
      { id: 'customers',  label: 'Customer Registry', icon: Users,        tallyKey: 'C', roles: ['OWNER','MANAGER'] },
      { id: 'vendors',    label: 'Vendor Network',    icon: Truck,        tallyKey: 'V', roles: ['OWNER','MANAGER'] },
      { id: 'personnel',  label: 'Sales Personnel',   icon: UserSquare2,  tallyKey: 'P', roles: ['OWNER','MANAGER'] },
      { id: 'schemes',    label: 'Sales Promotions',  icon: Percent,      tallyKey: 'M', roles: ['OWNER','MANAGER'] },
    ]
  },
  {
    id: 'reports',
    label: 'Reports & MIS',
    icon: BarChart3,
    color: 'bg-purple-400',
    tallyKey: 'R',
    items: [
      { id: 'analytics',  label: 'MIS Reports',        icon: TrendingUp,   shortcut: 'F3', tallyKey: 'M', roles: ['OWNER'] },
      { id: 'salesrep',   label: 'Daily Sales Book',   icon: Receipt,      tallyKey: 'D', roles: ['OWNER','MANAGER'] },
      { id: 'stockrep',   label: 'Stock Reports',      icon: FileText,     tallyKey: 'S', roles: ['OWNER','MANAGER'], badge: 'soon' },
      { id: 'taxrep',     label: 'Tax Register',       icon: CreditCard,   tallyKey: 'T', roles: ['OWNER'],           badge: 'soon' },
    ]
  },
  {
    id: 'ho',
    label: 'HO & Sync',
    icon: Globe,
    color: 'bg-cyan-400',
    tallyKey: 'H',
    items: [
      { id: 'ho',         label: 'Corporate Sync',    icon: Globe,        tallyKey: 'C', roles: ['OWNER','MANAGER'] },
      { id: 'alerts',     label: 'Chain Store Intel',  icon: Building2,   tallyKey: 'I', roles: ['OWNER'],           badge: 'soon' },
    ]
  },
  {
    id: 'setup',
    label: 'Setup & Config',
    icon: Settings,
    color: 'bg-rose-400',
    tallyKey: 'U',
    items: [
      { id: 'settings',   label: 'System Config',     icon: Settings,     shortcut: 'F10', tallyKey: 'S', roles: ['OWNER'] },
      { id: 'security',   label: 'Security & Users',  icon: AlertTriangle,tallyKey: 'E', roles: ['OWNER'],           badge: 'soon' },
      { id: 'housekeep',  label: 'Housekeeping',      icon: Database,     tallyKey: 'K', roles: ['OWNER'],           badge: 'soon' },
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
  const { store } = useStore()
  const { language, setLanguage, t } = useLanguage()
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

  // Listen for TallyPrime Alt Shortcuts using react-hotkeys-hook (Bulletproof cross-browser)
  useHotkeys('alt+g', (e) => {
    e.preventDefault()
    setOpenDropdown(null)
    openCommandBar()
  }, { preventDefault: true })

  useHotkeys('alt+s, alt+t, alt+c, alt+r, alt+h, alt+u', (e) => {
    e.preventDefault()
    const group = visibleGroups.find(g => 
      `Key${g.tallyKey.toUpperCase()}` === e.code || 
      g.tallyKey.toLowerCase() === e.key.toLowerCase()
    )
    if (group) {
      setOpenDropdown(prev => prev === group.id ? null : group.id)
    }
  }, { preventDefault: true })

  // All possible sub-menu item keys (e.g., 'd, b, r, c, s, g, l, i, v, p, m, e, k')
  const itemKeys = React.useMemo(() => 
    Array.from(new Set(MENU.flatMap(g => g.items.map(i => i.tallyKey?.toLowerCase())).filter(Boolean))).join(', '),
  [])

  useHotkeys(itemKeys, (e) => {
    if (openDropdown) {
      const group = visibleGroups.find(g => g.id === openDropdown)
      if (group) {
        const item = group.items.find(i => 
          i.tallyKey && (`Key${i.tallyKey.toUpperCase()}` === e.code || i.tallyKey.toLowerCase() === e.key.toLowerCase())
        )
        if (item && item.badge !== 'soon') {
          e.preventDefault()
          handleNav(item)
        }
      }
    }
  }, { enableOnFormTags: false }, [openDropdown, visibleGroups])

  // Helper to underline the TallyKey in a label
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
    <header className="fixed top-0 left-0 right-0 h-10 bg-[#e4dfd3] z-50 flex items-center px-4 shadow-sm border-b border-[#d1cbbd] text-[#1a2340]" ref={menuRef}>
      
      {/* TallyPrime Style Logo / Corner */}
      <div className="flex items-center gap-2 pr-4 mr-2 border-r border-[#d1cbbd] shrink-0 h-full">
        <img src={logo} alt="PrimeSetu" className="w-5 h-5 object-contain" />
        <div className="font-serif text-sm font-black tracking-tighter leading-none flex flex-col">
          <span>PrimeSetu</span>
          <span className="text-[7px] text-amber-600 uppercase tracking-tighter font-sans">Simple but Branded</span>
        </div>
      </div>

      {/* Main Nav Dropdowns (Shoper9 Style) */}
      <nav className="flex items-center h-full">
        {visibleGroups.map(group => {
          const isOpen = openDropdown === group.id
          const hasActive = group.items.some(i => i.id === activeTab)
          
          return (
            <div key={group.id} className="relative h-full flex items-center">
              <button
                onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                className={`flex items-center gap-1.5 px-3 h-full text-[11px] font-bold uppercase tracking-wider transition-colors hover:bg-white ${
                  isOpen || hasActive ? 'bg-white shadow-inner text-amber-600' : 'text-[#1a2340]'
                }`}
              >
                {renderTallyLabel(group.label, group.tallyKey)}
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute left-0 top-full mt-0 w-64 bg-white border border-[#d1cbbd] shadow-xl py-1 z-50"
                  >
                    {group.items.map(item => {
                      const isActive = activeTab === item.id
                      const ItemIcon = item.icon
                      const isSoon = item.badge === 'soon'

                      return (
                        <button
                          key={item.id}
                          onClick={() => !isSoon && handleNav(item)}
                          disabled={isSoon}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors group ${
                            isActive ? 'bg-amber-50 text-amber-700' : isSoon ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                          }`}
                        >
                          <ItemIcon className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-amber-500' : 'text-gray-400 group-hover:text-[#1a2340]'
                          }`}/>
                          <div className="flex-1">
                            <div className={`text-xs ${isActive ? 'font-black' : 'font-bold text-[#1a2340]'}`}>
                              {renderTallyLabel(item.label, item.tallyKey)}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-0.5">
                            {item.shortcut && !isSoon && (
                              <div className="text-[10px] font-mono font-bold text-gray-400">
                                {item.shortcut}
                              </div>
                            )}
                            {isSoon && (
                              <span className="text-[8px] font-black uppercase tracking-widest text-white bg-gray-300 px-1.5 py-0.5 rounded-sm">
                                soon
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* TallyPrime "Go To" Bar Equivalent */}
      <button 
        onClick={openCommandBar}
        className="flex items-center gap-2 bg-white border border-[#d1cbbd] hover:border-amber-400 px-3 py-1.5 rounded text-xs font-bold text-gray-500 transition-colors mr-4 shadow-inner"
      >
        <Search className="w-3.5 h-3.5 text-amber-500" />
        <span className="w-32 text-left">{renderTallyLabel('Go To...', 'G')}</span>
        <kbd className="text-[9px] font-black font-mono bg-gray-100 px-1 rounded border border-gray-200 text-gray-400">Alt+G</kbd>
      </button>

      {/* Language & Help */}
      <div className="flex items-center gap-3 border-l border-[#d1cbbd] pl-4 h-full">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[#1a2340] outline-none cursor-pointer hover:bg-white px-2 py-1 rounded"
        >
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <option key={code} value={code}>{name.split(' (')[0]}</option>
          ))}
        </select>
        <button className="text-gray-400 hover:text-[#1a2340] transition-colors"><HelpCircle className="w-4 h-4"/></button>
        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-sm">
          Node Active
        </div>
        
        {/* Store Context Menu */}
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-white px-2 py-1 h-full transition-colors"
          onClick={() => supabase.auth.signOut()}
          title="Sign Out"
        >
          <div className="text-right flex flex-col justify-center">
            <span className="text-[10px] font-black text-[#1a2340] leading-none">{store?.name ?? 'Sovereign'}</span>
            <span className="text-[9px] font-bold text-gray-400 leading-none mt-0.5">{userRole}</span>
          </div>
          <div className="w-6 h-6 rounded bg-[#1a2340] text-amber-400 flex items-center justify-center text-[10px] font-black">
            {store?.name?.[0] ?? 'P'}
          </div>
        </div>
      </div>
    </header>
  )
}
