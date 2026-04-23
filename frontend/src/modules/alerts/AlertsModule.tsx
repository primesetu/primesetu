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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Alert {
  id: number
  title: string
  message: string
  category: string
  priority: string
  is_read: boolean
  created_at: string
}

export default function AlertsModule() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')

  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const resp = await fetch('http://localhost:8000/api/v1/alerts')
      return resp.json()
    }
  })

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`http://localhost:8000/api/v1/alerts/${id}/read`, { method: 'PATCH' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] })
  })

  const filteredAlerts = alerts?.filter(a => filter === 'all' || a.priority === filter)

  return (
    <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-top-4 duration-500">
      {/* Main Feed */}
      <div className="col-span-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-black text-navy">Alerts Centre</h1>
            <p className="text-xs text-muted uppercase tracking-widest font-bold">Operational Awareness Engine</p>
          </div>
          <div className="flex bg-cream p-1 rounded-xl border border-border">
            {['all', 'high', 'medium'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-navy text-white shadow-md' : 'text-muted hover:text-navy'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 text-center text-muted italic">Scanning sovereign network...</div>
          ) : filteredAlerts?.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-border rounded-3xl py-24 flex flex-col items-center justify-center gap-4">
              <span className="text-5xl grayscale opacity-20">🛡️</span>
              <p className="font-serif italic text-muted">Sovereign OS is secure. No active alerts.</p>
            </div>
          ) : filteredAlerts?.map(alert => (
            <div 
              key={alert.id} 
              className={`bg-white border rounded-2xl p-5 flex gap-5 transition-all group hover:border-saffron/30 ${alert.is_read ? 'opacity-60 border-border/50' : 'border-border shadow-sm border-l-4 border-l-saffron'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${alert.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-cream text-navy'}`}>
                {alert.category === 'inventory' ? '📦' : alert.category === 'security' ? '🔒' : '⚙️'}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-bold text-navy ${alert.is_read ? 'font-medium' : ''}`}>{alert.title}</h3>
                  <span className="text-[9px] text-muted font-bold uppercase tracking-widest">{new Date(alert.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-muted leading-relaxed">{alert.message}</p>
                <div className="pt-2 flex items-center gap-4">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${alert.priority === 'high' ? 'bg-red-500 text-white' : 'bg-navy/10 text-navy'}`}>
                    {alert.priority} Priority
                  </span>
                  {!alert.is_read && (
                    <button 
                      onClick={() => markRead.mutate(alert.id)}
                      className="text-[9px] font-black text-saffron uppercase tracking-widest hover:underline"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side Stats */}
      <div className="col-span-4 space-y-6">
        <div className="bg-navy rounded-3xl p-8 text-white">
          <h3 className="font-serif text-xl font-bold mb-6">Network Health</h3>
          <div className="space-y-6">
            <HealthItem label="Database" status="Operational" color="bg-green-400" />
            <HealthItem label="Auth Engine" status="Secured" color="bg-green-400" />
            <HealthItem label="Inventory Sync" status="Real-time" color="bg-saffron" />
            <HealthItem label="Terminal T1" status="Online" color="bg-green-400" />
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Last System Audit</p>
              <p className="text-xs font-bold">2 mins ago • Clean</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HealthItem({ label, status, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/60 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold">{status}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
      </div>
    </div>
  )
}
