/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
type Color = 'saffron' | 'gold' | 'green' | 'blue' | 'red' | 'navy'

interface KPICardProps {
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  icon: string
  color: Color
}

const colorMap: Record<Color, { top: string; ico: string }> = {
  saffron: { top: 'bg-saffron',    ico: 'bg-saffron/10' },
  gold:    { top: 'bg-gold',       ico: 'bg-gold/10'    },
  green:   { top: 'bg-green-500',  ico: 'bg-green-50'   },
  blue:    { top: 'bg-blue-500',   ico: 'bg-blue-50'    },
  red:     { top: 'bg-red-500',    ico: 'bg-red-50'     },
  navy:    { top: 'bg-navy',       ico: 'bg-navy/10'    },
}

export default function KPICard({ label, value, trend, trendUp, icon, color }: KPICardProps) {
  const c = colorMap[color]
  return (
    <div className="bg-white rounded-2xl border border-border p-4 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.top}`} />
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-semibold tracking-[1.5px] uppercase text-muted">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${c.ico} flex items-center justify-center text-sm`}>{icon}</div>
      </div>
      <div className="font-serif text-2xl font-bold text-navy mb-1.5">{value}</div>
      {trend && (
        <div className={`text-xs font-semibold ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
          {trendUp ? '▲' : '▼'} {trend}
        </div>
      )}
    </div>
  )
}
