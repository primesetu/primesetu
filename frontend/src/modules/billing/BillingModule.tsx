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
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'

interface Product {
  id: number
  sku: string
  name: string
  mrp: number
  stock_qty: number
  category: string
}

interface CartItem extends Product {
  qty: number
}

export default function BillingModule() {
  const [q, setQ] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState('')

  // Search Products
  const { data: results, isLoading: isSearching } = useQuery<Product[]>({
    queryKey: ['product-search', q],
    queryFn: async () => {
      if (!q || q.length < 2) return []
      const resp = await fetch(`http://localhost:8000/api/v1/products/search?q=${q}`)
      return resp.json()
    },
    enabled: q.length >= 2
  })

  // Create Bill Mutation
  const createBill = useMutation({
    mutationFn: async () => {
      const resp = await fetch('http://localhost:8000/api/v1/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customer || 'Walk-in Customer',
          items: cart.map(i => ({ product_id: i.id, qty: i.qty, unit_price: i.mrp }))
        })
      })
      return resp.json()
    },
    onSuccess: (data) => {
      alert(`Bill Generated: ${data.bill_number}\nTotal: ₹${data.total}`)
      setCart([])
      setCustomer('')
      setQ('')
    }
  })

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id)
      if (existing) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...p, qty: 1 }]
    })
    setQ('')
  }

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  }

  const subtotal = cart.reduce((acc, i) => acc + (i.mrp * i.qty), 0)
  const gst = subtotal * 0.18
  const total = subtotal + gst

  return (
    <div className="grid grid-cols-12 gap-8 h-[calc(100vh-120px)] animate-in slide-in-from-bottom-4 duration-500">
      {/* Left: Cart & Search */}
      <div className="col-span-8 flex flex-col gap-6">
        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center text-muted group-focus-within:text-saffron transition-colors">
            🔍
          </div>
          <input
            type="text"
            placeholder="Scan Barcode or Search Product (SKU, Name)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-white border border-border rounded-2xl pl-12 pr-4 py-4 text-lg shadow-sm focus:border-saffron focus:ring-4 focus:ring-saffron/10 outline-none transition-all font-medium"
          />
          
          {results && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto overflow-x-hidden p-2">
              {results.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="w-full flex items-center justify-between p-4 hover:bg-cream rounded-xl transition-colors text-left group"
                >
                  <div>
                    <div className="font-bold text-navy group-hover:text-saffron transition-colors">{p.name}</div>
                    <div className="text-xs text-muted font-medium">{p.sku} • Stock: {p.stock_qty}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-navy">₹{p.mrp}</div>
                    <div className="text-[10px] text-saffron font-bold uppercase tracking-widest">+ Add to Cart</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart Table */}
        <div className="bg-white border border-border rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="bg-navy px-6 py-4 flex items-center justify-between">
            <h2 className="text-white font-serif font-bold text-lg">Active Cart ({cart.length} items)</h2>
            <button onClick={() => setCart([])} className="text-white/40 hover:text-white text-xs uppercase font-bold tracking-widest transition-colors">Clear All</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted/40 gap-4">
                <span className="text-6xl grayscale opacity-30">🛒</span>
                <p className="font-serif italic">Cart is empty. Start scanning...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-cream/50 text-[10px] uppercase font-black tracking-widest text-muted border-b border-border sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left">Item Details</th>
                    <th className="px-6 py-3 text-center">Qty</th>
                    <th className="px-6 py-3 text-right">Unit Price</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cart.map(item => (
                    <tr key={item.id} className="hover:bg-cream/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-navy">{item.name}</div>
                        <div className="text-[10px] text-muted font-medium uppercase tracking-tighter">{item.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full bg-cream border border-border flex items-center justify-center hover:bg-saffron hover:text-white transition-all">-</button>
                          <span className="font-black text-navy w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full bg-cream border border-border flex items-center justify-center hover:bg-saffron hover:text-white transition-all">+</button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-navy">₹{item.mrp.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-black text-navy">₹{(item.mrp * item.qty).toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="text-muted/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Right: Summary */}
      <div className="col-span-4 space-y-6">
        <div className="bg-white border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col h-full border-b-8 border-b-saffron">
          <div className="bg-cream p-6 border-b border-border">
            <h2 className="font-serif text-xl font-black text-navy">Final Settlement</h2>
            <p className="text-[10px] text-muted uppercase tracking-widest font-bold mt-1">PrimeSetu Terminal T1</p>
          </div>
          
          <div className="p-6 space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Customer Info</label>
              <input
                type="text"
                placeholder="Walk-in / Search Customer..."
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full bg-cream/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-saffron focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-dashed border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted font-medium">Subtotal</span>
                <span className="text-navy font-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted font-medium">GST (18%)</span>
                <span className="text-navy font-bold">₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted font-medium">Discount</span>
                <span className="text-green-600 font-bold">₹0.00</span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between items-end">
                <span className="font-serif text-lg font-black text-navy">Payable</span>
                <span className="text-3xl font-black text-saffron">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-cream/30 border-t border-border">
            <button
              disabled={cart.length === 0 || createBill.isPending}
              onClick={() => createBill.mutate()}
              className="w-full bg-navy hover:bg-navy/90 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-navy/20 disabled:opacity-30 disabled:shadow-none active:scale-95 flex items-center justify-center gap-3 text-lg"
            >
              {createBill.isPending ? 'Processing...' : (
                <>
                  <span className="text-2xl">🖨️</span>
                  Print Bill & Close
                </>
              )}
            </button>
            <p className="text-center text-[9px] text-muted uppercase mt-4 tracking-tighter">
              Sovereign Stack v2.0 • Authorized Transaction
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
