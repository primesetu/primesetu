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
import { 
  Monitor, 
  Lock, 
  Unlock, 
  TrendingUp, 
  User, 
  Clock, 
  ShieldCheck, 
  ArrowUpCircle,
  Plus,
  RefreshCcw,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Till {
  id: string
  name: string
  code: string
  status: 'Open' | 'Closed' | 'Locked' | 'Idle'
  cash_collected: number
  current_cashier_id?: string
  last_opening_at?: string
}

export default function TillManagement() {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [newTill, setNewTill] = useState({ name: '', code: '' })

  const { data: tills, isLoading, isError } = useQuery<Till[]>({
    queryKey: ['tills'],
    queryFn: () => api.tills.list()
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.tills.create({ ...data, store_id: 'X01' }), // Store ID should be dynamic
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tills'] })
      setIsAdding(false)
      setNewTill({ name: '', code: '' })
    }
  })

  const statusActionMutation = useMutation({
    mutationFn: ({ id, action, data }: { id: string, action: string, data?: any }) => {
      if (action === 'open') return api.tills.open(id, data)
      if (action === 'close') return api.tills.close(id)
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tills'] })
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-emerald-500'
      case 'Locked': return 'bg-amber-500'
      case 'Idle': return 'bg-blue-500'
      default: return 'bg-slate-400'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-black text-navy uppercase tracking-tight">Till Status Board</h1>
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mt-1">Sovereign Point-of-Sale Monitoring</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['tills'] })}
            className="p-3 rounded-xl border border-border hover:bg-cream transition-all"
          >
            <RefreshCcw className="w-4 h-4 text-navy" />
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-navy text-white px-6 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-navy/90 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add New Till
          </button>
        </div>
      </div>

      {/* Tills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2.5rem]" />
          ))
        ) : tills?.length === 0 ? (
          <div className="col-span-full py-20 text-center glass rounded-[3rem] border-2 border-dashed border-border">
             <Monitor className="w-16 h-16 text-navy/10 mx-auto mb-4" />
             <p className="font-serif italic text-muted text-lg">No active tills registered for this showroom.</p>
          </div>
        ) : tills?.map((till) => (
          <motion.div 
            layout
            key={till.id} 
            className="shoper-card group hover:shadow-2xl transition-all border-2 hover:border-navy/10"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${getStatusColor(till.status)}`}>
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-sm leading-tight">{till.name}</h3>
                  <span className="text-[10px] font-black text-muted uppercase tracking-widest">{till.code}</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${getStatusColor(till.status)}`}>
                {till.status}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-3 bg-cream/30 rounded-2xl border border-border/30">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase">
                  <TrendingUp className="w-3.5 h-3.5" /> Cash in Till
                </div>
                <div className="text-lg font-serif font-black text-navy">₹{till.cash_collected.toLocaleString()}</div>
              </div>
              
              <div className="flex items-center gap-4 px-2">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-navy/40 uppercase">
                  <User className="w-3 h-3" /> {till.current_cashier_id || 'Unassigned'}
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-navy/40 uppercase">
                  <Clock className="w-3 h-3" /> {till.last_opening_at ? new Date(till.last_opening_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-dashed border-border">
              {till.status === 'Closed' ? (
                <button 
                  onClick={() => statusActionMutation.mutate({ id: till.id, action: 'open', data: { cashier_id: 'CASHIER-01' } })}
                  className="col-span-2 py-3 rounded-xl bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all"
                >
                  <Unlock className="w-3.5 h-3.5" /> Open Counter
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => statusActionMutation.mutate({ id: till.id, action: 'close' })}
                    className="py-3 rounded-xl border border-border text-navy font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-navy hover:text-white transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" /> Close
                  </button>
                  <button className="py-3 rounded-xl bg-gold/10 text-navy font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gold transition-all">
                    <ArrowUpCircle className="w-3.5 h-3.5" /> Lift
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Till Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-navy/20 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-saffron to-gold" />
              <h2 className="text-2xl font-serif font-black text-navy mb-2">Initialize New Till</h2>
              <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-8">Register a hardware counter in the store node</p>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted ml-1 mb-1 block">Till Identifier Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Counter 04 - Mens Dept"
                    value={newTill.name}
                    onChange={e => setNewTill({...newTill, name: e.target.value})}
                    className="w-full bg-cream/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-saffron outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted ml-1 mb-1 block">System Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. T04"
                    value={newTill.code}
                    onChange={e => setNewTill({...newTill, code: e.target.value})}
                    className="w-full bg-cream/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-saffron outline-none transition-all"
                  />
                </div>
                
                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-4 rounded-2xl border border-border font-black text-[10px] uppercase tracking-widest hover:bg-cream transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => createMutation.mutate(newTill)}
                    disabled={!newTill.name || !newTill.code || createMutation.isPending}
                    className="flex-1 py-4 rounded-2xl bg-navy text-white font-black text-[10px] uppercase tracking-widest hover:bg-saffron transition-all disabled:opacity-50 shadow-xl"
                  >
                    {createMutation.isPending ? 'Registering...' : 'Confirm Registration'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Card */}
      <div className="glass p-8 rounded-[3rem] border-l-8 border-gold flex items-center gap-8">
        <div className="w-16 h-16 rounded-[2rem] bg-gold/10 flex items-center justify-center text-gold shrink-0">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-serif text-lg font-black text-navy uppercase">Sovereign Compliance Guard</h4>
          <p className="text-sm text-muted font-medium mt-1 leading-relaxed">
            All till operations (lifts, closures, session handovers) are cryptographically signed and logged for institutional audit. 
            Discrepancies exceeding ₹100 will trigger an automatic Sovereign Alert to the HO Management.
          </p>
        </div>
      </div>
    </div>
  )
}
