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
import type { ReactNode } from 'react'

interface PanelProps {
  title: string
  action?: { label: string; onClick: () => void }
  children: ReactNode
  className?: string
}

export default function Panel({ title, action, children, className = '' }: PanelProps) {
  return (
    <div className={`bg-white rounded-2xl border border-border overflow-hidden ${className}`}>
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-border">
        <h2 className="font-serif text-sm font-bold text-navy">{title}</h2>
        {action && (
          <button onClick={action.onClick} className="text-xs text-saffron font-medium hover:underline">
            {action.label}
          </button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}
