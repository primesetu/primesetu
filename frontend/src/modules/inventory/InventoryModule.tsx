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
import { useLanguage } from '@/hooks/useLanguage'
import { api } from '@/api/client'
import PhysicalStockModule from './PhysicalStockModule'
import BulkItemMaster from './BulkItemMaster'
import BarcodeStudio from './BarcodeStudio'
import InwardingModule from './InwardingModule'

interface InventoryItem {
  id: string
  code: string
  name: string
  brand: string
  category: string
  wh1_qty: number
  x01_qty: number
  min_stock: number
  mrp: number
}

export default function InventoryModule() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isTransferring, setIsTransferring] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isPrintingBarcodes, setIsPrintingBarcodes] = useState(false)
  const [isAddingStock, setIsAddingStock] = useState(false)
  const [isAuditing, setIsAuditing] = useState(false)
  const [transferData, setTransferData] = useState({ id: '', qty: 0 })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const data = await api.inventory.list()
      // Transform data to match the legacy view structure if needed
      // Assuming API returns items with stock levels for different stores
      setItems(data.map((i: any) => ({
        id: i.id,
        code: i.code,
        name: i.name,
        brand: i.brand || 'N/A',
        category: i.category || 'N/A',
        wh1_qty: i.stocks?.find((s: any) => s.store_id === 'WH1')?.quantity || 0,
        x01_qty: i.stocks?.find((s: any) => s.store_id === 'X01')?.quantity || 0,
        min_stock: i.min_stock || 10,
        mrp: i.mrp
      })))
    } catch (error) {
      console.error('[PrimeSetu] Inventory fetch failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = () => {
    setItems(prev => prev.map(item => {
      if (item.id === transferData.id && item.wh1_qty >= transferData.qty) {
        return {
          ...item,
          wh1_qty: item.wh1_qty - transferData.qty,
          x01_qty: item.x01_qty + transferData.qty
        }
      }
      return item
    }))
    setIsTransferring(false)
    setTransferData({ id: '', qty: 0 })
  }

  const filteredItems = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || 
                         i.code.toLowerCase().includes(search.toLowerCase()) ||
                         i.brand.toLowerCase().includes(search.toLowerCase())
    
    if (filter === 'LOW STOCK') return matchesSearch && (i.wh1_qty + i.x01_qty < i.min_stock)
    if (filter === 'ALL') return matchesSearch
    return matchesSearch && i.category.toUpperCase() === filter.toUpperCase()
  })

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Bulk Importer Overlay */}
      {isImporting && <BulkItemMaster onClose={() => setIsImporting(false)} />}
      
      {/* Barcode Printing Overlay */}
      {isPrintingBarcodes && (
        <BarcodeStudio 
          onClose={() => setIsPrintingBarcodes(false)} 
          initialItems={items.slice(0, 5)} // Sample: first 5 items
        />
      )}

      {/* Stock Inward Overlay */}
      {isAddingStock && <InwardingModule onClose={() => setIsAddingStock(false)} />}

      {/* Physical Audit Overlay */}
      {isAuditing && <PhysicalStockModule onClose={() => setIsAuditing(false)} />}

      {/* Transfer Modal (Glassmorphism) */}
      {isTransferring && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-navy/20">
          <div className="glass-dark w-full max-w-md p-10 rounded-[3rem] shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-serif font-black text-white mb-2">Stock Transfer</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-8 font-bold">WH1 Warehouse → X01 Retail Store</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-2">Select SKU</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:border-saffron outline-none"
                  value={transferData.id}
                  onChange={(e) => setTransferData({...transferData, id: e.target.value})}
                >
                  <option value="" className="bg-navy">Choose Product...</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id} className="bg-navy">{i.name} ({i.wh1_qty} available)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-2">Quantity to Move</label>
                <input 
                  type="number" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-black text-xl focus:border-saffron outline-none"
                  placeholder="0"
                  value={transferData.qty || ''}
                  onChange={(e) => setTransferData({...transferData, qty: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsTransferring(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTransfer}
                  className="flex-1 bg-saffron text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg shadow-saffron/30 transition-all"
                >
                  Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-navy">{t('inventory')}</h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Warehouse (WH1) & Store (X01) Control</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAuditing(true)}
            className="bg-navy text-gold px-8 py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-navy/90 transition-all shadow-xl flex items-center gap-2 border-2 border-gold/20"
          >
            <span>📋</span> PHYSICAL AUDIT (PST)
          </button>
          <button 
            onClick={() => setIsImporting(true)}
            className="bg-navy text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-navy/90 transition-all shadow-xl flex items-center gap-2"
          >
            <span>📄</span> BULK IMPORT
          </button>
          <button 
            onClick={() => setIsAddingStock(true)}
            className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest hover:shadow-emerald-300/30 transition-all shadow-xl flex items-center gap-2"
          >
            <span>📦</span> STOCK INWARD
          </button>
          <button 
            onClick={() => setIsTransferring(true)}
            className="bg-saffron text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest hover:shadow-saffron/30 transition-all shadow-xl flex items-center gap-2"
          >
            <span>🔄</span> STOCK TRANSFER
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass p-6 rounded-[2rem] flex flex-col md:flex-row gap-6 items-center justify-between shadow-2xl">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-6 flex items-center grayscale opacity-50">🔍</span>
          <input 
            type="text" 
            placeholder="Filter by Name, Brand, or Barcode..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cream/30 border border-border rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:border-saffron focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="flex bg-cream/50 p-1 rounded-2xl border border-border">
          {['ALL', 'LOW STOCK', 'FOOTWEAR', 'APPAREL'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-tighter transition-all ${filter === f ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="glass rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="bg-navy px-10 py-6 flex items-center justify-between">
          <h2 className="text-white font-serif font-bold text-lg">Central Stock Ledger</h2>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-white/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> WH1: Warehouse
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-saffron"></span> X01: Store
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream/30 text-[9px] uppercase font-black tracking-[0.2em] text-muted border-b border-border">
              <tr>
                <th className="pl-10 py-5 text-left">Product / SKU</th>
                <th className="px-6 py-5 text-center">Category</th>
                <th className="px-6 py-5 text-center">Brand</th>
                <th className="px-6 py-5 text-right">WH1 Qty</th>
                <th className="px-6 py-5 text-right">X01 Qty</th>
                <th className="px-6 py-5 text-right">Total</th>
                <th className="pr-10 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredItems.map((item) => {
                const total = item.wh1_qty + item.x01_qty
                const isLow = total < item.min_stock
                return (
                  <tr key={item.id} className="hover:bg-cream/30 transition-colors group">
                    <td className="pl-10 py-6">
                      <div className="font-bold text-navy group-hover:text-saffron transition-colors">{item.name}</div>
                      <div className="text-[10px] text-muted font-black uppercase tracking-tighter">{item.code}</div>
                    </td>
                    <td className="px-6 py-6 text-center text-[10px] font-black text-muted uppercase tracking-widest">{item.category}</td>
                    <td className="px-6 py-6 text-center font-bold text-navy">{item.brand}</td>
                    <td className="px-6 py-6 text-right">
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg font-black text-xs">{item.wh1_qty}</span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg font-black text-xs">{item.x01_qty}</span>
                    </td>
                    <td className="px-6 py-6 text-right font-black text-navy text-lg">{total}</td>
                    <td className="pr-10 py-6 text-center">
                      {isLow ? (
                        <span className="px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Critically Low</span>
                      ) : (
                        <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Healthy</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass p-8 rounded-[2rem] border-l-4 border-l-saffron">
          <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">Pending Transfers</h3>
          <div className="text-4xl font-serif font-black text-navy mb-2">12</div>
          <p className="text-[10px] text-muted font-bold">WH1 → X01 (In Transit)</p>
        </div>
        <div className="glass p-8 rounded-[2rem] border-l-4 border-l-emerald-500">
          <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">Inventory Value</h3>
          <div className="text-4xl font-serif font-black text-navy mb-2">₹1.2Cr</div>
          <p className="text-[10px] text-muted font-bold">Consolidated MRP Value</p>
        </div>
        <div className="glass p-8 rounded-[2rem] border-l-4 border-l-navy">
          <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">Fastest Moving</h3>
          <div className="text-4xl font-serif font-black text-navy mb-2">Puma RS-X</div>
          <p className="text-[10px] text-muted font-bold">Sold 42 units this week</p>
        </div>
      </div>
    </div>
  )
}
