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
import { NavLink } from 'react-router-dom'
import { useStore } from '@/hooks/useStore'
import { supabase } from '@/lib/supabase'

const NAV = [
  { label: 'Dashboard',  path: '/dashboard',  icon: '◈' },
  { label: 'Billing',    path: '/billing',    icon: '◉', badge: null },
  { label: 'Inventory',  path: '/inventory',  icon: '◫' },
  { label: 'Schemes',    path: '/schemes',    icon: '◎' },
  { label: 'HO View',    path: '/ho',         icon: '◐' },
  { label: 'MIS Reports',path: '/mis',        icon: '◑' },
  { label: 'Alerts',     path: '/alerts',     icon: '◬', badge: '3' },
  { label: 'Settings',   path: '/settings',   icon: '⚙' },
]

export default function Sidebar() {
  const { store } = useStore()

  return (
    <aside className="w-[252px] bg-navy min-h-screen fixed left-0 top-0 flex flex-col z-50 border-r border-white/5 shadow-2xl">
      <div className="px-6 py-6 border-b border-white/5 bg-navy/50 backdrop-blur-md">
        <div className="font-serif text-2xl font-black text-white tracking-tighter leading-none">
          Prime<span className="text-saffron">Setu</span>
        </div>
        <div className="text-[8px] tracking-[4px] uppercase font-bold text-white/30 mt-1.5 ml-0.5">
          Shoper9 · Retail OS
        </div>
      </div>

      <nav className="flex-1 py-6 space-y-1">
        <div className="px-6 mb-4 text-[9px] font-black tracking-[4px] uppercase text-white/20">
          Core Terminal
        </div>
        {NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3.5 text-[12px] transition-all relative group ${
                isActive
                  ? 'bg-saffron/10 text-white font-bold'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-saffron shadow-[0_0_15px_rgba(244,132,10,0.5)]" />}
                <span className={`text-sm w-6 text-center transition-transform group-hover:scale-125 ${isActive ? 'text-saffron' : 'text-white/20'}`}>{item.icon}</span>
                <span className="tracking-wide">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-saffron text-white text-[8px] font-black rounded-full px-2 py-0.5 shadow-lg shadow-saffron/20">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        className="border-t border-white/5 px-6 py-5 flex items-center gap-3 cursor-pointer hover:bg-white/5 group transition-colors"
        onClick={() => supabase.auth.signOut()}
      >
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-saffron to-gold flex items-center justify-center text-xs font-black text-white shadow-lg shadow-saffron/20 group-hover:rotate-12 transition-transform">
          {store?.name?.[0] ?? 'P'}
        </div>
        <div className="overflow-hidden">
          <div className="text-xs font-bold text-white truncate">{store?.name ?? 'Sovereign Node'}</div>
          <div className="text-[9px] text-white/30 font-bold uppercase tracking-tighter group-hover:text-saffron transition-colors">Terminate Session →</div>
        </div>
      </div>
    </aside>
  )
}
