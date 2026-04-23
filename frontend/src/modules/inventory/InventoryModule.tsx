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

interface Product {
  id: number
  sku: string
  name: string
  mrp: number
  stock_qty: number
  category: string
  is_active: boolean
}

export default function InventoryModule() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const resp = await fetch('http://localhost:8000/api/v1/products')
      return resp.json()
    }
  })

  const updateStock = useMutation({
    mutationFn: async ({ id, qty }: { id: number, qty: number }) => {
      const resp = await fetch(`http://localhost:8000/api/v1/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_qty: qty })
      })
      return resp.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  })

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-black text-navy">Master Inventory</h1>
          <p className="text-xs text-muted uppercase tracking-widest font-bold">SKU Central Control</p>
        </div>
        <button className="bg-saffron text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-saffron/20 hover:bg-saffron/90 transition-all flex items-center gap-2 text-sm">
          <span className="text-xl">+</span> Add New SKU
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-4 flex items-center text-muted">🔍</span>
          <input
            type="text"
            placeholder="Search by SKU, Name or Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cream/50 border border-border rounded-xl pl-12 pr-4 py-2.5 text-sm focus:bg-white focus:border-saffron outline-none transition-all"
          />
        </div>
        <select className="bg-cream/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-saffron">
          <option>All Categories</option>
          <option>Grocery</option>
          <option>Dairy</option>
          <option>Personal Care</option>
        </select>
        <button className="p-2.5 bg-cream border border-border rounded-xl hover:bg-navy hover:text-white transition-all">
          📊
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy text-[10px] uppercase font-black tracking-widest text-white/50">
            <tr>
              <th className="px-6 py-4 text-left">SKU / ID</th>
              <th className="px-6 py-4 text-left">Product Name</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-right">MRP</th>
              <th className="px-6 py-4 text-center">Stock Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-cream rounded w-full"></div></td>
                </tr>
              ))
            ) : filteredProducts?.map(p => (
              <tr key={p.id} className="hover:bg-cream/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-navy text-xs">{p.sku}</div>
                  <div className="text-[10px] text-muted font-medium mt-0.5">#PS-{p.id.toString().padStart(4, '0')}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-navy">{p.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold uppercase tracking-tighter bg-cream px-2 py-0.5 rounded text-muted">
                    {p.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-black text-navy">
                  ₹{p.mrp.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.stock_qty < 5 ? 'bg-red-500 animate-pulse' : p.stock_qty < 10 ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                      <span className="font-black text-navy">{p.stock_qty}</span>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${p.stock_qty < 5 ? 'text-red-500' : p.stock_qty < 10 ? 'text-amber-600' : 'text-green-600'}`}>
                      {p.stock_qty < 5 ? 'Critical' : p.stock_qty < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => updateStock.mutate({ id: p.id, qty: p.stock_qty + 10 })}
                      className="p-2 bg-cream border border-border rounded-lg hover:bg-saffron hover:text-white transition-all text-xs"
                      title="Quick Refill (+10)"
                    >
                      ⚓
                    </button>
                    <button className="p-2 bg-cream border border-border rounded-lg hover:bg-navy hover:text-white transition-all text-xs">
                      ✎
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
