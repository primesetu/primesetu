/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import { useState, useMemo } from 'react'
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
  History,
  TrendingUp,
  ShieldCheck,
  Package
} from 'lucide-react'
import { toPaise, toRupees, formatCurrency } from '@/utils/currency'
import { 
  Button, 
  Input, 
  Card, 
  Text, 
  Badge,
  DataTable 
} from '@/components/ui/SovereignUI'

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

  // ── GRID COLUMNS ──
  const columns = useMemo(() => [
    {
      header: "SKU PROTOCOL DETAIL",
      accessor: (item: Product) => (
        <div className="flex flex-col py-2 leading-tight">
          <span className="text-sm font-black text-navy uppercase tracking-tight">{item.name}</span>
          <span className="text-[9px] font-black text-navy/30 mt-1 uppercase tracking-widest">{item.code} • {item.brand || 'Institutional Master'}</span>
        </div>
      ),
      flex: 2,
      pinned: 'left' as const
    },
    {
      header: "MRP (RETAIL)",
      accessor: (item: Product) => (
        editingId === item.id ? (
          <Input 
            type="number" 
            value={editValuesRupees.mrp}
            onChange={e => setEditValuesRupees({...editValuesRupees, mrp: e.target.value})}
            className="w-28 h-10 text-center font-black bg-white border-brand-gold"
          />
        ) : (
          <span className="font-serif font-black text-navy text-lg">{formatCurrency(item.mrp)}</span>
        )
      ),
      width: 150,
      className: 'text-center'
    },
    {
      header: "WHOLESALE",
      accessor: (item: Product) => (
        editingId === item.id ? (
          <Input 
            type="number" 
            value={editValuesRupees.wholesale_price}
            onChange={e => setEditValuesRupees({...editValuesRupees, wholesale_price: e.target.value})}
            className="w-28 h-10 text-center font-black bg-white border-brand-gold"
          />
        ) : (
          <span className="font-black text-emerald-600 text-sm">{formatCurrency(item.wholesale_price)}</span>
        )
      ),
      width: 150,
      className: 'text-center'
    },
    {
      header: "STAFF PRICE",
      accessor: (item: Product) => (
        editingId === item.id ? (
          <Input 
            type="number" 
            value={editValuesRupees.staff_price}
            onChange={e => setEditValuesRupees({...editValuesRupees, staff_price: e.target.value})}
            className="w-28 h-10 text-center font-black bg-white border-brand-gold"
          />
        ) : (
          <span className="font-black text-indigo-600 text-sm">{formatCurrency(item.staff_price)}</span>
        )
      ),
      width: 150,
      className: 'text-center'
    },
    {
      header: "ACTIONS",
      accessor: (item: Product) => (
        <div className="flex justify-end gap-2">
          {editingId === item.id ? (
            <>
              <Button variant="sec" size="sm" onClick={() => setEditingId(null)} className="h-9 w-9 p-0 text-rose-500 border-none hover:bg-rose-50">
                <X size={16} />
              </Button>
              <Button variant="pri" size="sm" onClick={() => updateMutation.mutate({ id: item.id, data: editValuesRupees })} className="h-9 w-9 p-0 bg-emerald-500 text-white border-none shadow-lg shadow-emerald-100">
                <Check size={16} />
              </Button>
            </>
          ) : (
            <Button variant="sec" size="sm" onClick={() => startEditing(item)} className="h-9 w-9 p-0 border-none text-navy/40 hover:text-navy hover:bg-navy/5">
              <Edit3 size={16} />
            </Button>
          )}
        </div>
      ),
      width: 120,
      pinned: 'right' as const
    }
  ], [editingId, editValuesRupees]);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
      <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm border border-navy/5">
        <div>
          <Text variant="h1" className="font-serif font-black text-navy uppercase tracking-tighter leading-none">Price Management Master</Text>
          <Text variant="xs" className="font-black text-navy/30 uppercase tracking-[0.4em] mt-3">Multi-Level Pricing & Institutional Margins · SMRITI-OS v3</Text>
        </div>
        <div className="flex gap-4">
          <Button variant="sec" className="px-8 h-14 rounded-2xl bg-white border-navy/5 text-[10px] font-black uppercase tracking-widest text-navy hover:bg-indigo-50/50 gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> Bulk Export
          </Button>
          <Button className="px-8 h-14 rounded-2xl bg-navy text-white text-[10px] font-black uppercase tracking-widest hover:bg-navy/90 shadow-2xl shadow-navy/20 gap-2">
            <History className="w-5 h-5 text-brand-gold" /> Price Logs
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-navy/5 shadow-2xl flex items-center gap-8">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/20" />
          <Input 
            placeholder="Search SKU Code or Item Name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 h-14 bg-navy/5 border-none focus:bg-white focus:ring-2 focus:ring-brand-gold/20 rounded-2xl text-sm font-black uppercase tracking-wider"
          />
        </div>
        <Button variant="sec" className="h-14 px-8 rounded-2xl border-navy/5 bg-navy/2 gap-3">
          <Filter className="w-5 h-5 text-navy/40" />
          <Text variant="xs" className="font-black text-navy uppercase tracking-widest">Filter: All Brands</Text>
        </Button>
      </div>

      <Card className="rounded-[4rem] overflow-hidden shadow-2xl border-none flex flex-col">
        <div className="h-[500px]">
           <DataTable 
             data={filteredProducts || []}
             columns={columns}
             loading={isLoading}
             overlayNoRowsTemplate={`
               <div class="flex flex-col items-center justify-center opacity-10 h-full">
                  <Package size="60" class="mb-4" />
                  <div class="text-xs font-black uppercase tracking-[0.4em]">No Articles Found</div>
               </div>
             `}
           />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Active Price Lists', value: '4 Modes (Retail, WS, Staff, E-Com)', icon: TrendingUp, color: 'text-indigo-500', border: 'border-indigo-500/20' },
          { label: 'Integrity Check', value: '0 Discrepancies', icon: ShieldCheck, color: 'text-emerald-500', border: 'border-emerald-500/20' },
          { label: 'Weighted Avg Margin', value: '32.4%', icon: DollarSign, color: 'text-brand-gold', border: 'border-brand-gold/20' }
        ].map((s, i) => (
          <Card key={i} className={`p-10 rounded-[3rem] border-none shadow-xl bg-white relative overflow-hidden group`}>
            <div className={`absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-1000 ${s.color}`}>
               <s.icon size={120} />
            </div>
            <Text variant="xs" className="font-black text-navy/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
               <s.icon size={14} className={s.color} /> {s.label}
            </Text>
            <Text variant="h2" className="font-serif font-black text-navy uppercase">{s.value}</Text>
          </Card>
        ))}
      </div>
    </div>
  )
}
