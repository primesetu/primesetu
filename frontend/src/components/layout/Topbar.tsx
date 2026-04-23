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
import { useLocation } from 'react-router-dom'

const TITLES: Record<string, [string, string]> = {
  '/dashboard':  ['Dashboard',   '— Overview'],
  '/billing':    ['Billing',     '— POS Counter'],
  '/inventory':  ['Inventory',   '— Stock Control'],
  '/schemes':    ['Schemes',     '— Promo Engine'],
  '/ho':         ['HO Dashboard','— Head Office'],
  '/mis':        ['MIS Reports', '— Analytics'],
  '/alerts':     ['Alerts',      '— Notifications'],
}

export default function Topbar() {
  const { pathname } = useLocation()
  const [title, sub] = TITLES[pathname] ?? ['PrimeSetu', '']

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-border h-16 px-8 flex items-center gap-4 sticky top-0 z-40">
      <div className="flex flex-col">
        <h1 className="font-serif text-xl font-black text-navy leading-none">{title}</h1>
        <span className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1 opacity-50">{sub}</span>
      </div>
      
      <div className="flex-1" />

      <div className="hidden md:flex items-center gap-3 bg-cream/50 border border-border rounded-2xl px-4 py-2 text-xs text-muted/60 w-64 focus-within:bg-white focus-within:border-saffron focus-within:ring-4 focus-within:ring-saffron/5 transition-all">
        <span className="text-sm">🔍</span>
        <input type="text" placeholder="Search records..." className="bg-transparent outline-none w-full font-medium" />
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[9px] font-black text-green-700 uppercase tracking-tighter">Live Node</span>
      </div>

      <div className="w-10 h-10 rounded-2xl bg-white border border-border flex items-center justify-center text-sm relative cursor-pointer hover:bg-navy hover:text-white hover:border-navy transition-all group">
        ◬
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-saffron rounded-full border-2 border-white group-hover:border-navy transition-colors" />
      </div>
    </header>
  )
}
