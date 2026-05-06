/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * F2 Global Context-Aware Search System
 * ============================================================ */
import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { api } from '@/api/client'

// ─── Field Types ───────────────────────────────────────────────────────────
// Add data-f2="items|customers|documents|vendors|lookups" to any input to
// enable context-aware F2 search for that field.
export type F2FieldType = 'items' | 'customers' | 'documents' | 'vendors' | 'lookups' | 'classifications' | null

interface F2SearchState {
  open: boolean
  fieldType: F2FieldType
  category: string
  targetEl: HTMLElement | null
  openSearch: (fieldType: F2FieldType, targetEl: HTMLElement | null, category?: string) => void
  closeSearch: () => void
}

const F2SearchContext = createContext<F2SearchState>({
  open: false, fieldType: null, category: '', targetEl: null,
  openSearch: () => {}, closeSearch: () => {}
})

export const useF2Search = () => useContext(F2SearchContext)

export function F2SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [fieldType, setFieldType] = useState<F2FieldType>(null)
  const [category, setCategory] = useState('')
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null)

  const openSearch = useCallback((type: F2FieldType, el: HTMLElement | null, cat: string = '') => {
    setFieldType(type)
    setTargetEl(el)
    setCategory(cat)
    setOpen(true)
  }, [])

  const closeSearch = useCallback(() => {
    setOpen(false)
    setFieldType(null)
    setCategory('')
  }, [])

  // Global F2 / F11 listener — detect active element's data-f2 attribute
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'F2' && e.key !== 'F11') return
      const active = document.activeElement as HTMLElement | null
      if (!active) return

      // Walk up DOM to find data-f2 attribute
      let el: HTMLElement | null = active
      let f2type: string | null = null
      let f2cat: string | null = null
      while (el && !f2type) {
        f2type = el.getAttribute?.('data-f2') ?? null
        f2cat = el.getAttribute?.('data-f2-category') ?? null
        el = el.parentElement
      }

      if (f2type) {
        e.preventDefault()
        openSearch(f2type as F2FieldType, active, f2cat ?? '')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openSearch])

  return (
    <F2SearchContext.Provider value={{ open, fieldType, category, targetEl, openSearch, closeSearch }}>
      {children}
    </F2SearchContext.Provider>
  )
}

// ─── Global F2 Overlay Component ───────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, User, ShoppingBag, FileText, Building2, List, ShieldCheck } from 'lucide-react'

const FIELD_CONFIG: Record<NonNullable<F2FieldType>, {
  title: string; icon: JSX.Element; placeholder: string; color: string
  fetchFn: (q: string, category?: string) => Promise<any[]>
  columns: { key: string; label: string; width: string; render?: (v: any) => string }[]
}> = {
  items: {
    title: 'Item Search',
    icon: <ShoppingBag className="w-5 h-5 text-amber-400" />,
    placeholder: 'Search by code, name, brand, category...',
    color: 'border-amber-400',
    fetchFn: async (q) => {
      try { return await api.inventory.search(q) } catch { return [] }
    },
    columns: [
      { key: 'code',       label: 'Code',     width: '100px' },
      { key: 'name',       label: 'Name',     width: '1fr' },
      { key: 'brand',      label: 'Brand',    width: '120px' },
      { key: 'category',   label: 'Category', width: '120px' },
      { key: 'mrp',        label: 'MRP',      width: '80px', render: v => `₹${Number(v).toLocaleString()}` },
      { key: 'quantity',   label: 'Stock',    width: '70px' },
    ]
  },
  customers: {
    title: 'Customer Search',
    icon: <User className="w-5 h-5 text-blue-400" />,
    placeholder: 'Search by mobile, name, email...',
    color: 'border-blue-400',
    fetchFn: async (q) => {
      try { return await api.catalogue.getPartners('CUSTOMER', q) } catch { return [] }
    },
    columns: [
      { key: 'code',           label: 'Code',    width: '100px' },
      { key: 'name',           label: 'Name',    width: '1fr' },
      { key: 'mobile',         label: 'Mobile',  width: '130px' },
      { key: 'email',          label: 'Email',   width: '180px' },
      { key: 'loyalty_points', label: 'Points',  width: '80px' },
      { key: 'credit_limit',   label: 'Credit',  width: '90px', render: v => `₹${Number(v).toLocaleString()}` },
    ]
  },
  vendors: {
    title: 'Vendor Search',
    icon: <Building2 className="w-5 h-5 text-purple-400" />,
    placeholder: 'Search by name, code, GST...',
    color: 'border-purple-400',
    fetchFn: async (q) => {
      try { return await api.catalogue.getPartners('VENDOR', q) } catch { return [] }
    },
    columns: [
      { key: 'code',   label: 'Code',   width: '100px' },
      { key: 'name',   label: 'Name',   width: '1fr' },
      { key: 'mobile', label: 'Mobile', width: '130px' },
      { key: 'gst_no', label: 'GST No', width: '160px' },
      { key: 'credit_limit', label: 'Credit', width: '90px', render: v => `₹${Number(v).toLocaleString()}` },
    ]
  },
  documents: {
    title: 'Document Search',
    icon: <FileText className="w-5 h-5 text-emerald-400" />,
    placeholder: 'Search by bill number, date, customer...',
    color: 'border-emerald-400',
    fetchFn: async (_q) => { return [] }, // Hook into bills API when ready
    columns: [
      { key: 'bill_no',     label: 'Bill No',   width: '130px' },
      { key: 'type',        label: 'Type',      width: '90px' },
      { key: 'net_payable', label: 'Amount',    width: '100px', render: v => `₹${Number(v).toLocaleString()}` },
      { key: 'status',      label: 'Status',    width: '90px' },
      { key: 'created_at',  label: 'Date',      width: '160px', render: v => new Date(v).toLocaleDateString('en-IN') },
    ]
  },
  lookups: {
    title: 'Lookup Search',
    icon: <List className="w-5 h-5 text-gray-400" />,
    placeholder: 'Search categories, brands, sizes...',
    color: 'border-gray-400',
    fetchFn: async (q, cat) => {
      try { return await api.catalogue.getLookups(cat || q) } catch { return [] }
    },
    columns: [
      { key: 'category', label: 'Category', width: '140px' },
      { key: 'code',     label: 'Code',     width: '100px' },
      { key: 'label',    label: 'Name',     width: '1fr' },
      { key: 'is_active', label: 'Active',   width: '80px', render: v => v ? 'YES' : 'NO' },
    ]
  },
  classifications: {
    title: 'Classification Search',
    icon: <ShieldCheck className="w-5 h-5 text-rose-400" />,
    placeholder: 'Search Class1/Class2 combinations...',
    color: 'border-rose-400',
    fetchFn: async (q) => {
      try { 
        const res = await api.legacy.getData('class12combo', { search: q });
        // Handle both legacy array response and new paginated object response
        return Array.isArray(res.data) ? res.data : (res.data?.data || []);
      } catch { return [] }
    },
    columns: [
      { key: 'class1cd',     label: 'Dept (Class1)', width: '150px' },
      { key: 'class2cd',     label: 'Brand (Class2)', width: '150px' },
      { key: 'superclass1',  label: 'Class3',         width: '1fr' },
      { key: 'billable',     label: 'Billable',       width: '80px', render: v => v ? 'YES' : 'NO' },
      { key: 'sizegroup',    label: 'Size Grp',       width: '100px' },
    ]
  }
}

export function GlobalF2SearchOverlay() {
  const { open, fieldType, category, targetEl, closeSearch } = useF2Search()
  const [searchQ, setSearchQ] = useState('')
  const [allResults, setAllResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load all results on open (unfiltered)
  useEffect(() => {
    if (!open || !fieldType) return
    setSearchQ('')
    setAllResults([])
    setLoading(true)
    const cfg = FIELD_CONFIG[fieldType]
    cfg.fetchFn('', category).then(r => { setAllResults(r); setLoading(false) }).catch(() => setLoading(false))
    setTimeout(() => inputRef.current?.focus(), 60)
  }, [open, fieldType, category])

  // Escape to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [closeSearch])

  const filtered = searchQ.trim().length === 0
    ? allResults
    : allResults.filter(row =>
        Object.values(row).some(v =>
          String(v ?? '').toLowerCase().includes(searchQ.toLowerCase())
        )
      )

  const handleSelect = (row: any) => {
    if (!targetEl) { closeSearch(); return }
    const tag = targetEl.tagName.toLowerCase()
    if (tag === 'input' || tag === 'textarea') {
      try {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
        const bestValue = row.code ?? row.label ?? row.mobile ?? row.name ?? row.class1cd ?? row.bill_no ?? ''
        nativeInputValueSetter?.call(targetEl, bestValue)
        if (typeof Event !== 'undefined') {
          targetEl.dispatchEvent(new Event('input', { bubbles: true }))
        }
        targetEl.focus()
      } catch (e) {
        console.warn('[SMRITI-OS] F2 event dispatch skipped:', e)
      }
    }
    // Dispatch a custom event so modules can handle selection
    try {
      if (typeof CustomEvent !== 'undefined') {
        targetEl.dispatchEvent(new CustomEvent('f2-select', { detail: row, bubbles: true }))
      }
    } catch (e) {
      console.warn('[SMRITI-OS] F2 custom event dispatch skipped:', e)
    }
    closeSearch()
  }

  if (!open || !fieldType) return null
  const cfg = FIELD_CONFIG[fieldType]
  const gridCols = cfg.columns.map(c => c.width).join(' ')

  return (
    <AnimatePresence>
      <motion.div
        key="f2-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center pt-16 bg-black/50 backdrop-blur-sm"
        onClick={closeSearch}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className={`bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 ${cfg.color} w-full max-w-5xl mx-6`}
          style={{ maxHeight: 'calc(100vh - 120px)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-4 bg-[var(--navy-deep)]">
            {cfg.icon}
            <div className="flex flex-col">
              <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest">[F2] Context Search</span>
              <span className="text-white font-black text-sm">{cfg.title}</span>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                ref={inputRef}
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder={cfg.placeholder}
                className="w-full bg-white/10 text-white placeholder:text-white/30 outline-none pl-12 pr-4 py-2.5 rounded-xl text-sm font-mono border border-white/10 focus:border-amber-400 transition-colors"
              />
            </div>
            <span className="text-white/30 text-[10px] font-mono whitespace-nowrap">{filtered.length} results</span>
            <button onClick={closeSearch} className="text-white/40 hover:text-white transition-colors ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Column Headers */}
          <div
            className="grid text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-200"
            style={{ gridTemplateColumns: gridCols }}
          >
            {cfg.columns.map(col => (
              <div key={col.key} className="px-4 py-2">{col.label}</div>
            ))}
          </div>

          {/* Results */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
                <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                Loading {cfg.title.toLowerCase()}...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-sm">
                {searchQ ? `No results for "${searchQ}"` : 'No data found'}
              </div>
            ) : (
              filtered.map((row, idx) => (
                <div
                  key={row.id ?? idx}
                  className={`grid items-center cursor-pointer border-b border-gray-50 hover:bg-amber-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}
                  style={{ gridTemplateColumns: gridCols }}
                  onClick={() => handleSelect(row)}
                >
                  {cfg.columns.map(col => (
                    <div key={col.key} className="px-4 py-3 text-sm text-navy truncate">
                      {col.render
                        ? <span className="font-bold">{col.render(row[col.key])}</span>
                        : col.key === 'name'
                          ? <span className="font-bold">{row[col.key]}</span>
                          : <span className="text-gray-500 font-mono text-[11px]">{row[col.key] ?? '—'}</span>
                      }
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 font-mono flex gap-8 flex-wrap">
            <span><span className="text-amber-500 font-bold">Click / Enter</span> Select &amp; fill field</span>
            <span><span className="text-amber-500 font-bold">Esc</span> Close</span>
            <span><span className="text-amber-500 font-bold">Type</span> Filter instantly</span>
            <span className="ml-auto text-gray-300">F2 context: <span className="text-amber-400">{fieldType}</span></span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}




