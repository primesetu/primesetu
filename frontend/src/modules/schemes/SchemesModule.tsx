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
import { api } from '@/api/client'

interface Scheme {
  id: number
  name: string
  type: string
  value: number
  min_amount: number
  is_active: boolean
  start_date: string
  created_at?: string
}

export default function SchemesModule() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [type, setType] = useState('percentage')
  const [value, setValue] = useState(0)
  const [minAmount, setMinAmount] = useState(0)

  const { data: schemes, isLoading } = useQuery<Scheme[]>({
    queryKey: ['schemes'],
    queryFn: async () => {
      return await api.schemes.list()
    }
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      return await api.schemes.create({
        name,
        type,
        value,
        min_amount: minAmount,
        is_active: true
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] })
      setShowForm(false)
      setName('')
      setValue(0)
      setMinAmount(0)
    }
  })

  return (
    <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-left-4 duration-500">
      {/* List Section */}
      <div className="col-span-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-black text-navy">Schemes & Promotions</h1>
            <p className="text-xs text-muted uppercase tracking-widest font-bold">Offer Engine Control</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-navy text-white px-6 py-2.5 rounded-xl font-bold hover:bg-navy/90 transition-all flex items-center gap-2 text-sm"
          >
            {showForm ? '✕ Close Form' : '+ New Scheme'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
             <div className="col-span-2 text-center py-20 text-muted italic">Initializing Offer Engine...</div>
          ) : schemes?.length === 0 ? (
            <div className="col-span-2 bg-cream/30 border-2 border-dashed border-border rounded-3xl py-20 flex flex-col items-center justify-center gap-4">
              <span className="text-5xl opacity-20">🏷️</span>
              <p className="font-serif italic text-muted">No active schemes found. Boost sales with a new offer!</p>
            </div>
          ) : schemes?.map(s => (
            <div key={s.id} className={`bg-white border rounded-3xl p-6 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden ${s.is_active ? 'border-border' : 'opacity-60 border-transparent grayscale'}`}>
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 group-hover:scale-125 transition-transform ${s.type === 'bogo' ? 'bg-orange-500' : 'bg-navy'}`}></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-[2px] px-2 py-1 rounded-lg ${s.type === 'bogo' ? 'bg-orange-100 text-orange-600' : 'bg-navy/10 text-navy'}`}>
                    {s.type}
                  </span>
                  <h3 className="font-serif text-lg font-black text-navy mt-2">{s.name}</h3>
                </div>
                <div className={`w-3 h-3 rounded-full ${s.is_active ? 'bg-green-500' : 'bg-muted'}`}></div>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-black text-navy">
                    {s.type === 'percentage' ? `${s.value}%` : `₹${s.value}`}
                  </span>
                  <span className="text-[10px] text-muted font-bold uppercase mb-1.5">Discount</span>
                </div>
                <p className="text-[10px] text-muted font-medium">Valid on orders above ₹{s.min_amount.toLocaleString()}</p>
              </div>

              <div className="mt-6 pt-6 border-t border-dashed border-border flex justify-between items-center relative z-10">
                <div className="text-[9px] text-muted font-bold uppercase">
                  Started: {new Date(s.start_date || s.created_at || '').toLocaleDateString()}
                </div>
                <button className="text-[10px] font-black text-saffron uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Edit Offer →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creation Form / Sidebar */}
      <div className="col-span-4">
        {showForm ? (
          <div className="bg-white border border-border rounded-3xl p-8 shadow-2xl sticky top-24 animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-serif text-xl font-black text-navy mb-6">Create New Scheme</h2>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Scheme Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Diwali Dhamaka 10%" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-cream/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-saffron outline-none transition-all mt-1" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-cream/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-saffron outline-none transition-all mt-1"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Discount</option>
                    <option value="bogo">BOGO</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Value</label>
                  <input 
                    type="number" 
                    placeholder="10" 
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-cream/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-saffron outline-none transition-all mt-1" 
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Min Order Amount</label>
                <input 
                  type="number" 
                  placeholder="500" 
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  className="w-full bg-cream/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-saffron outline-none transition-all mt-1" 
                />
              </div>
              <button 
                onClick={() => createMutation.mutate()}
                disabled={!name || createMutation.isPending}
                className="w-full bg-saffron text-white font-bold py-4 rounded-xl shadow-lg shadow-saffron/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Activating...' : 'Activate Scheme'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-navy rounded-3xl p-8 text-white space-y-6 sticky top-24">
            <div className="text-3xl">💡</div>
            <h3 className="font-serif text-lg font-bold">Pro Tip: BOGO Offers</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Buy-One-Get-One (BOGO) schemes are currently trending in Grocery categories. Try creating a percentage off for higher ticket sizes to increase Avg Bill Value.
            </p>
            <div className="pt-4 border-t border-white/10">
              <p className="text-[10px] uppercase font-black tracking-widest text-white/30">Last Updated</p>
              <p className="text-xs font-bold mt-1">Today, 10:45 AM</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
