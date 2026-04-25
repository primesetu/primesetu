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
  DollarSign, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit3, 
  Check, 
  X,
  FileSpreadsheet,
  History
} from 'lucide-react'
import { toPaise, toRupees, formatCurrency } from '@/utils/currency'

interface Product {
  id: string
  code: string
  name: string
  brand?: string
  mrp: number // In Paise
  wholesale_price: number // In Paise
  staff_price: number // In Paise
  updated_at?: string
}

export default function PriceManagement() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValuesRupees, setEditValuesRupees] = useState<any>({})

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products', search],
    queryFn: () => api.inventory.list()
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => {
      // Convert Rupee inputs back to Paise for API
      const payload = {
        mrp: toPaise(data.mrp),
        wholesale_price: toPaise(data.wholesale_price),
        staff_price: toPaise(data.staff_price)
      }
      return api.inventory.update(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setEditingId(null)
    }
  })

  const startEditing = (p: Product) => {
    setEditingId(p.id)
    setEditValuesRupees({
      mrp: toRupees(p.mrp),
      wholesale_price: toRupees(p.wholesale_price),
      staff_price: toRupees(p.staff_price)
    })
  }

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-black text-navy uppercase tracking-tight">Price Management Master</h1>
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mt-1">Multi-Level Pricing & Institutional Margins</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-navy hover:bg-cream transition-all">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Bulk Export
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-navy/90 transition-all shadow-lg">
            <History className="w-4 h-4 text-gold" /> Price Logs
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-border shadow-sm flex items-center gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search SKU Code or Item Name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-cream/30 border border-transparent focus:border-saffron focus:bg-white rounded-2xl text-sm outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-cream/50 rounded-2xl border border-border/50 cursor-pointer hover:bg-cream transition-all">
          <Filter className="w-4 h-4 text-navy" />
          <span className="text-[10px] font-black text-navy uppercase tracking-widest">Filter: All Brands</span>
        </div>
      </div>

      <div className="glass rounded-[3rem] overflow-hidden shadow-xl border border-white/20">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-navy text-white">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">SKU Detail</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">MRP</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">Wholesale</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">Staff Price</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-8 h-20 bg-slate-50/50"></td>
                </tr>
              ))
            ) : filteredProducts?.map((p) => (
              <tr key={p.id} className="hover:bg-cream/20 transition-colors group">
                <td className="px-8 py-6">
                  <div className="font-bold text-navy text-sm">{p.name}</div>
                  <div className="text-[10px] font-black text-muted uppercase tracking-widest mt-0.5">{p.code} • {p.brand || 'Generic'}</div>
                </td>
                <td className="px-6 py-6 text-center">
                  {editingId === p.id ? (
                    <input 
                      type="number" 
                      value={editValuesRupees.mrp}
                      onChange={e => setEditValuesRupees({...editValuesRupees, mrp: e.target.value})}
                      className="w-24 px-3 py-2 bg-white border border-saffron rounded-lg text-sm text-center outline-none font-bold"
                    />
                  ) : (
                    <span className="font-serif font-black text-navy text-lg">{formatCurrency(p.mrp)}</span>
                  )}
                </td>
                <td className="px-6 py-6 text-center">
                  {editingId === p.id ? (
                    <input 
                      type="number" 
                      value={editValuesRupees.wholesale_price}
                      onChange={e => setEditValuesRupees({...editValuesRupees, wholesale_price: e.target.value})}
                      className="w-24 px-3 py-2 bg-white border border-saffron rounded-lg text-sm text-center outline-none font-bold"
                    />
                  ) : (
                    <span className="font-bold text-emerald-600 text-sm">{formatCurrency(p.wholesale_price)}</span>
                  )}
                </td>
                <td className="px-6 py-6 text-center">
                  {editingId === p.id ? (
                    <input 
                      type="number" 
                      value={editValuesRupees.staff_price}
                      onChange={e => setEditValuesRupees({...editValuesRupees, staff_price: e.target.value})}
                      className="w-24 px-3 py-2 bg-white border border-saffron rounded-lg text-sm text-center outline-none font-bold"
                    />
                  ) : (
                    <span className="font-bold text-indigo-600 text-sm">{formatCurrency(p.staff_price)}</span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  {editingId === p.id ? (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingId(null)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateMutation.mutate({ id: p.id, data: editValuesRupees })}
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => startEditing(p)}
                      className="p-3 rounded-xl border border-border text-navy opacity-0 group-hover:opacity-100 transition-all hover:bg-navy hover:text-white"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Active Price Lists', value: '4 (Retail, WS, Staff, E-Com)', color: 'border-navy' },
          { label: 'Pending Updates', value: '0 Items', color: 'border-emerald-500' },
          { label: 'Avg Margin %', value: '32.4%', color: 'border-saffron' }
        ].map((s, i) => (
          <div key={i} className={`bg-white p-6 rounded-[2rem] border-b-4 ${s.color} shadow-lg`}>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{s.label}</p>
            <div className="text-xl font-serif font-black text-navy">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
