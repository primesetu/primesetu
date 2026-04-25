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

interface Product {
  id: string
  code: string
  name: string
  brand?: string
  mrp: number
  wholesale_price: number
  staff_price: number
  updated_at?: string
}

export default function PriceManagement() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Product>>({})

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products', search],
    queryFn: () => api.inventory.list() // In a real app, pass search filter to API
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.inventory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setEditingId(null)
    }
  })

  const startEditing = (p: Product) => {
    setEditingId(p.id)
    setEditValues({
      mrp: p.mrp,
      wholesale_price: p.wholesale_price,
      staff_price: p.staff_price
    })
  }

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      {/* Header */}
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

      {/* Toolbar */}
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

      {/* Price Table */}
      <div className="glass rounded-[3rem] overflow-hidden shadow-xl border border-white/20">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-navy text-white">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">SKU Detail</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">MRP (₹)</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">Wholesale (₹)</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">Staff Price (₹)</th>
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
                      value={editValues.mrp}
                      onChange={e => setEditValues({...editValues, mrp: parseFloat(e.target.value)})}
                      className="w-24 px-3 py-2 bg-white border border-saffron rounded-lg text-sm text-center outline-none"
                    />
                  ) : (
                    <span className="font-serif font-black text-navy text-lg">₹{p.mrp.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-6 py-6 text-center">
                  {editingId === p.id ? (
                    <input 
                      type="number" 
                      value={editValues.wholesale_price}
                      onChange={e => setEditValues({...editValues, wholesale_price: parseFloat(e.target.value)})}
                      className="w-24 px-3 py-2 bg-white border border-saffron rounded-lg text-sm text-center outline-none"
                    />
                  ) : (
                    <span className="font-bold text-emerald-600 text-sm">₹{p.wholesale_price.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-6 py-6 text-center">
                  {editingId === p.id ? (
                    <input 
                      type="number" 
                      value={editValues.staff_price}
                      onChange={e => setEditValues({...editValues, staff_price: parseFloat(e.target.value)})}
                      className="w-24 px-3 py-2 bg-white border border-saffron rounded-lg text-sm text-center outline-none"
                    />
                  ) : (
                    <span className="font-bold text-indigo-600 text-sm">₹{p.staff_price.toLocaleString()}</span>
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
                        onClick={() => updateMutation.mutate({ id: p.id, data: editValues })}
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

      {/* Summary Footer */}
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
