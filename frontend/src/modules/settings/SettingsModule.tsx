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
import { apiClient } from '@/api/client'

export default function SettingsModule() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('store')

  const { data: store } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const resp = await apiClient.get('/store/settings')
      return resp.data
    }
  })

  const updateSettings = useMutation({
    mutationFn: async (data: any) => {
      await apiClient.patch('/store/settings', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      alert('Sovereign settings updated successfully.')
    }
  })

  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Navigation Tabs */}
      <div className="col-span-3 space-y-2">
        <TabButton id="store" label="Store Profile" active={activeTab} onClick={setActiveTab} icon="🏢" />
        <TabButton id="tax" label="Taxation & GST" active={activeTab} onClick={setActiveTab} icon="📄" />
        <TabButton id="terminal" label="Terminal Setup" active={activeTab} onClick={setActiveTab} icon="💻" />
        <TabButton id="security" label="Network Security" active={activeTab} onClick={setActiveTab} icon="🔒" />
      </div>

      {/* Main Form Area */}
      <div className="col-span-9">
        <div className="bg-white border border-border rounded-3xl p-10 shadow-sm">
          {activeTab === 'store' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-black text-navy">Store Profile</h2>
                <p className="text-xs text-muted uppercase tracking-widest font-bold mt-1">Global Node Configuration</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <Field label="Store Name" value={store?.name} />
                <Field label="Store Code" value={store?.code} disabled />
                <Field label="GSTIN Number" value={store?.gstin} />
                <Field label="Contact Phone" value={store?.phone} />
                <div className="col-span-2">
                   <Field label="Physical Address" value={store?.address} />
                </div>
              </div>

              <div className="pt-8 border-t border-border flex justify-end">
                <button 
                  onClick={() => updateSettings.mutate({ name: store?.name })}
                  className="bg-navy text-white px-10 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[2px] shadow-xl shadow-navy/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Commit Changes
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'store' && (
            <div className="py-20 text-center space-y-4">
              <div className="text-4xl grayscale opacity-20">⚙️</div>
              <p className="font-serif italic text-muted text-lg">"{activeTab}" configurations are managed via Shoper9 Bridge.</p>
              <p className="text-[10px] uppercase font-black tracking-[2px] text-saffron">Phase 3 Integration Required</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({ id, label, active, onClick, icon }: any) {
  const isActive = active === id
  return (
    <button 
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${isActive ? 'bg-navy text-white shadow-xl' : 'text-muted hover:bg-cream/50'}`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-bold tracking-wide">{label}</span>
      {isActive && <span className="ml-auto text-saffron">●</span>}
    </button>
  )
}

function Field({ label, value, disabled }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">{label}</label>
      <input 
        type="text" 
        defaultValue={value}
        disabled={disabled}
        className={`w-full bg-cream/30 border border-border rounded-xl px-4 py-3 text-sm focus:border-saffron outline-none transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`} 
      />
    </div>
  )
}
