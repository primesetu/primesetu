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
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ShoppingCart, RotateCcw, Package, ShoppingBag,
  BookOpen, Tag, Users, Truck, BarChart3, TrendingUp, FileText,
  Settings, Globe, Lock, ChevronDown, ChevronRight, Zap,
  CreditCard, Boxes, ClipboardList, Receipt, UserSquare2,
  Percent, Building2, AlertTriangle, Database
} from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { supabase } from '@/lib/supabase'

/* ── Menu structure (Shoper9 CHM parity) ── */
interface MenuItem {
  id: string
  label: string
  shortLabel?: string
  icon: any
  shortcut?: string
  badge?: string
  roles?: ('OWNER'|'MANAGER'|'CASHIER')[]
  hot?: boolean   // highlight as high-frequency
}
interface MenuGroup {
  id: string
  label: string
  icon: any
  color: string      // tailwind bg class for accent
  items: MenuItem[]
  defaultOpen?: boolean
}

const MENU: MenuGroup[] = [
  {
    id: 'sales',
    label: 'Sales',
    icon: ShoppingCart,
    color: 'bg-amber-400',
    defaultOpen: true,
    items: [
      { id: 'dashboard',  label: 'Dashboard',       icon: LayoutDashboard, roles: ['OWNER','MANAGER'], hot: false },
      { id: 'sales',      label: 'Billing / POS',   icon: ShoppingCart,    shortcut: 'F1', roles: ['OWNER','MANAGER','CASHIER'], hot: true },
      { id: 'returns',    label: 'Returns & Credits',icon: RotateCcw,       shortcut: 'F4', roles: ['OWNER','MANAGER','CASHIER'] },
      { id: 'dayend',     label: 'Shift Closure',   icon: Lock,            shortcut: 'F12',roles: ['OWNER','MANAGER','CASHIER'] },
    ]
  },
  {
    id: 'stock',
    label: 'Stock',
    icon: Boxes,
    color: 'bg-blue-400',
    items: [
      { id: 'inventory',   label: 'Stock Take (PST)',  icon: ClipboardList,  shortcut: 'F9', roles: ['OWNER','MANAGER'] },
      { id: 'procurement', label: 'Goods Inwards / PO',icon: ShoppingBag,                   roles: ['OWNER','MANAGER'] },
      { id: 'barcode',     label: 'Barcode & Labels',  icon: Tag,                           roles: ['OWNER','MANAGER'], badge: 'soon' },
    ]
  },
  {
    id: 'catalogue',
    label: 'Catalogue',
    icon: BookOpen,
    color: 'bg-emerald-400',
    items: [
      { id: 'registry',   label: 'Item Master',       icon: Package,      shortcut: 'F2', roles: ['OWNER','MANAGER'], hot: true },
      { id: 'customers',  label: 'Customer Registry', icon: Users,                        roles: ['OWNER','MANAGER'] },
      { id: 'vendors',    label: 'Vendor Network',    icon: Truck,                        roles: ['OWNER','MANAGER'] },
      { id: 'personnel',  label: 'Sales Personnel',   icon: UserSquare2,                  roles: ['OWNER','MANAGER'] },
      { id: 'schemes',    label: 'Sales Promotions',  icon: Percent,                      roles: ['OWNER','MANAGER'] },
    ]
  },
  {
    id: 'reports',
    label: 'Reports & MIS',
    icon: BarChart3,
    color: 'bg-purple-400',
    items: [
      { id: 'analytics',  label: 'MIS Reports',        icon: TrendingUp,   shortcut: 'F3', roles: ['OWNER'] },
      { id: 'salesrep',   label: 'Daily Sales Book',   icon: Receipt,                      roles: ['OWNER','MANAGER'], badge: 'soon' },
      { id: 'stockrep',   label: 'Stock Reports',      icon: FileText,                     roles: ['OWNER','MANAGER'], badge: 'soon' },
      { id: 'taxrep',     label: 'Tax Register',       icon: CreditCard,                   roles: ['OWNER'],           badge: 'soon' },
    ]
  },
  {
    id: 'ho',
    label: 'HO & Sync',
    icon: Globe,
    color: 'bg-cyan-400',
    items: [
      { id: 'ho',         label: 'Corporate Sync',    icon: Globe,                        roles: ['OWNER','MANAGER'] },
      { id: 'alerts',     label: 'Chain Store Intel',  icon: Building2,                   roles: ['OWNER'],           badge: 'soon' },
    ]
  },
  {
    id: 'setup',
    label: 'Setup & Config',
    icon: Settings,
    color: 'bg-rose-400',
    items: [
      { id: 'settings',   label: 'System Config',     icon: Settings,     shortcut: 'F10',roles: ['OWNER'] },
      { id: 'security',   label: 'Security & Users',  icon: AlertTriangle,                roles: ['OWNER'],           badge: 'soon' },
      { id: 'housekeep',  label: 'Housekeeping',      icon: Database,                     roles: ['OWNER'],           badge: 'soon' },
    ]
  }
]

interface SidebarProps {
  activeTab: string
  setActiveTab: (id: string) => void
  userRole?: 'OWNER' | 'MANAGER' | 'CASHIER'
  isCollapsed?: boolean
  setIsCollapsed?: (val: boolean) => void
}

export default function Sidebar({ activeTab, setActiveTab, userRole = 'OWNER', isCollapsed = false, setIsCollapsed }: SidebarProps) {
  const { store } = useStore()
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(MENU.filter(g => g.defaultOpen || g.items.some(i => i.id === 'dashboard')).map(g => g.id))
  )

  const toggleGroup = (id: string) =>
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // Auto-open group when item is active
  const handleNav = (item: MenuItem, groupId: string) => {
    setActiveTab(item.id)
    setOpenGroups(prev => new Set([...prev, groupId]))
  }

  const visibleGroups = MENU.map(g => ({
    ...g,
    items: g.items.filter(i => !i.roles || i.roles.includes(userRole))
  })).filter(g => g.items.length > 0)

  return (
    <aside className={`${isCollapsed ? 'w-[72px]' : 'w-[240px]'} bg-[#0f172a] min-h-screen fixed left-0 top-0 flex flex-col z-50 border-r border-white/5 shadow-2xl transition-all duration-300 ease-in-out`}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5 shrink-0 flex items-center justify-between">
        {!isCollapsed && (
          <div className="font-serif text-xl font-black text-white tracking-tighter leading-none">
            Prime<span className="text-amber-400">Setu</span>
          </div>
        )}
        {isCollapsed && (
          <div className="font-serif text-xl font-black text-amber-400 tracking-tighter leading-none mx-auto">
            P<span className="text-white">S</span>
          </div>
        )}
        
        {!isCollapsed && (
          <button onClick={() => setIsCollapsed?.(true)} className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button onClick={() => setIsCollapsed?.(false)} className="w-full py-2 hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors border-b border-white/5">
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-none">
        {visibleGroups.map(group => {
          const isOpen = openGroups.has(group.id)
          const GroupIcon = group.icon
          const hasActive = group.items.some(i => i.id === activeTab)

          return (
            <div key={group.id} className="mb-0.5">
              {/* Group header */}
              <button
                onClick={() => !isCollapsed && toggleGroup(group.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all group hover:bg-white/5 ${hasActive ? 'bg-white/5' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? group.label : undefined}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all ${hasActive ? group.color : 'bg-white/5 group-hover:bg-white/10'}`}>
                  <GroupIcon className={`w-3.5 h-3.5 ${hasActive ? 'text-[#0f172a]' : 'text-white/40 group-hover:text-white/60'}`}/>
                </div>
                {!isCollapsed && (
                  <>
                    <span className={`text-[11px] font-black uppercase tracking-[0.15em] flex-1 transition-colors ${hasActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                      {group.label}
                    </span>
                    {isOpen
                      ? <ChevronDown className="w-3 h-3 text-white/20"/>
                      : <ChevronRight className="w-3 h-3 text-white/20"/>}
                  </>
                )}
              </button>

              {/* Group items */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pl-3 pb-1">
                      {group.items.map(item => {
                        const isActive = activeTab === item.id
                        const ItemIcon = item.icon
                        const isSoon = item.badge === 'soon'

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (!isSoon) {
                                handleNav(item, group.id)
                              }
                            }}
                            disabled={isSoon}
                            title={isCollapsed ? item.label : undefined}
                            className={`w-full flex items-center gap-2.5 py-2 rounded-lg mb-0.5 text-left transition-all group relative ${
                              isCollapsed ? 'justify-center px-0' : 'pl-3 pr-2'
                            } ${
                              isActive
                                ? 'bg-amber-400/10 text-white'
                                : isSoon
                                  ? 'text-white/20 cursor-not-allowed'
                                  : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                            }`}
                          >
                            {/* Active indicator */}
                            {isActive && (
                              <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]"/>
                            )}

                            <ItemIcon className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                              isActive ? 'text-amber-400' : item.hot ? 'text-white/50 group-hover:text-amber-400' : 'text-white/25 group-hover:text-white/60'
                            }`}/>

                            {!isCollapsed && (
                              <>
                                <span className={`text-[11px] font-bold flex-1 leading-tight ${isActive ? 'font-black' : ''}`}>
                                  {item.label}
                                </span>

                                <div className="flex items-center gap-1 shrink-0">
                                  {item.shortcut && !isSoon && (
                                    <kbd className={`text-[8px] font-black px-1 py-0.5 rounded ${isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-white/20 group-hover:text-white/40'}`}>
                                      {item.shortcut}
                                    </kbd>
                                  )}
                                  {isSoon && (
                                    <span className="text-[7px] font-black uppercase tracking-widest text-white/15 bg-white/5 px-1.5 py-0.5 rounded">
                                      soon
                                    </span>
                                  )}
                                  {item.badge && item.badge !== 'soon' && (
                                    <span className="bg-amber-400 text-[#0f172a] text-[8px] font-black rounded-full px-1.5 py-0.5">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
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

      {/* Quick actions bar */}
      <div className={`border-t border-white/5 py-3 shrink-0 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 mb-3">
            <button
              onClick={() => setActiveTab('sales')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-400 hover:bg-amber-500 rounded-lg text-[#0f172a] font-black text-[10px] uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 border-b-2 border-amber-600"
            >
              <ShoppingCart className="w-3 h-3"/> POS
            </button>
            <button
              onClick={() => setActiveTab('registry')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 font-black text-[10px] uppercase tracking-wider transition-all"
            >
              <Package className="w-3 h-3"/> Items
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 font-black text-[10px] uppercase tracking-wider transition-all"
            >
              <Boxes className="w-3 h-3"/> Stock
            </button>
          </div>
        )}

        {/* Store info + signout */}
        <div
          className={`flex items-center cursor-pointer hover:bg-white/5 rounded-lg py-2 group transition-colors ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2'}`}
          onClick={() => supabase.auth.signOut()}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-black text-white shadow-md shrink-0">
            {store?.name?.[0] ?? 'P'}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <div className="text-[11px] font-bold text-white truncate leading-tight">{store?.name ?? 'Sovereign Node'}</div>
                <div className="text-[8px] text-white/25 font-bold uppercase tracking-tighter group-hover:text-amber-400 transition-colors">
                  Sign Out →
                </div>
              </div>
              <Zap className="w-3 h-3 text-white/10 group-hover:text-amber-400 transition-colors"/>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
