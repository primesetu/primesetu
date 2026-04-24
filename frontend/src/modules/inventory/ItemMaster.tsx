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
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Edit2, Trash2, X, CheckCircle2, AlertCircle,
  ChevronRight, ChevronDown, List, Grid, ScanBarcode, Tag,
  Package, Layers, ToggleLeft, ToggleRight, Save, RefreshCw,
  Filter, Download, Settings2, GripVertical, PlusCircle
} from 'lucide-react'
import { api } from '@/api/client'

/* ── Field Schema (Shoper9 Classic View columns) ── */
interface ItemField {
  key: string; label: string; type: 'text'|'number'|'select'|'bool'; required: boolean
  options?: string[]; group: 'basic'|'class'|'tax'|'price'|'flag'
}

const ITEM_FIELDS: ItemField[] = [
  { key:'code',         label:'Stock No / Barcode',  type:'text',   required:true,  group:'basic' },
  { key:'name',         label:'Description',          type:'text',   required:true,  group:'basic' },
  { key:'brand',        label:'Brand (Class 1)',      type:'select', required:true,  group:'class', options:[] },
  { key:'category',     label:'Category (Class 2)',   type:'select', required:true,  group:'class', options:[] },
  { key:'subcategory',  label:'Dept (Super Class 1)', type:'select', required:false, group:'class', options:[] },
  { key:'size',         label:'Size Group',           type:'select', required:false, group:'class', options:['UK6','UK7','UK8','UK9','UK10','UK11','Free'] },
  { key:'color',        label:'Colour',               type:'text',   required:false, group:'basic' },
  { key:'hsn_code',     label:'HSN Code',             type:'text',   required:false, group:'tax' },
  { key:'tax_rate',     label:'Tax Rate %',           type:'number', required:true,  group:'tax' },
  { key:'mrp',          label:'MRP (Incl. Tax)',      type:'number', required:true,  group:'price' },
  { key:'cost_price',   label:'Cost Price',           type:'number', required:false, group:'price' },
  { key:'lsq',          label:'Least Sale Qty',       type:'number', required:false, group:'price' },
  { key:'is_tax_inclusive', label:'Tax Inclusive MRP',type:'bool',   required:false, group:'flag' },
  { key:'is_inventory_item',label:'Track Inventory',  type:'bool',   required:false, group:'flag' },
  { key:'is_service',   label:'Service Item',         type:'bool',   required:false, group:'flag' },
]

const EMPTY_ITEM: any = {
  code:'', name:'', brand:'', category:'', subcategory:'', size:'', color:'',
  hsn_code:'', tax_rate:12, mrp:0, cost_price:0, lsq:1,
  is_tax_inclusive:true, is_inventory_item:true, is_service:false
}

type ViewMode = 'list' | 'classic' | 'grid'

/* ── Custom / Analyst Fields (persisted in localStorage) ── */
interface CustomField {
  id: string          // unique key, e.g. 'anal1'
  label: string       // display name, e.g. 'Season'
  type: 'text'|'number'|'select'|'bool'
  required: boolean
  options: string[]   // comma-separated dropdown options (for 'select' type)
}

const CF_KEY = 'primesetu_custom_fields_v1'

const loadCF = (): CustomField[] => {
  try { return JSON.parse(localStorage.getItem(CF_KEY) || '[]') } catch { return [] }
}
const saveCF = (fields: CustomField[]) => localStorage.setItem(CF_KEY, JSON.stringify(fields))

/* ── Grid View row type ── */
type GridRow = Record<string, any> & { _id: string; _status: 'idle'|'ok'|'error'; _msg: string }

export default function ItemMaster() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [form, setForm] = useState<any>({ ...EMPTY_ITEM })
  const [editId, setEditId] = useState<string|null>(null)
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{msg:string; ok:boolean}|null>(null)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [filterBrand, setFilterBrand] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [gridRows, setGridRows] = useState<GridRow[]>([])
  const [gridSaving, setGridSaving] = useState(false)
  // ── Custom Fields ──
  const [customFields, setCustomFields] = useState<CustomField[]>(loadCF)
  const [showCFMgr, setShowCFMgr] = useState(false)
  const [cfDraft, setCfDraft] = useState<CustomField>({ id:'', label:'', type:'text', required:false, options:[] })
  const searchRef = useRef<HTMLInputElement>(null)

  // ── Fetch ──────────────────────────────────────────────────
  const load = async () => {
    setLoading(true)
    try {
      const data = await api.inventory.list()
      setItems(data)
    } catch {
      // Use seed data as fallback
      setItems([])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  // ── Present Check (Shoper9 validation) ────────────────────
  const presentCheck = (f: any) => {
    const errs: Record<string,string> = {}
    ITEM_FIELDS.filter(fld => fld.required).forEach(fld => {
      const v = f[fld.key]
      if (v === '' || v === null || v === undefined || (typeof v === 'number' && v === 0 && fld.key !== 'tax_rate'))
        errs[fld.key] = `${fld.label} is mandatory`
    })
    // Also check required custom fields
    customFields.filter(cf => cf.required).forEach(cf => {
      const v = f[cf.id]
      if (!v && v !== false) errs[cf.id] = `${cf.label} is mandatory`
    })
    if (f.mrp > 0 && f.cost_price > f.mrp) errs.cost_price = 'Cost cannot exceed MRP'
    return errs
  }

  // ── Save (Add / Edit) ─────────────────────────────────────
  const handleSave = async () => {
    const errs = presentCheck(form)
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    try {
      const payload = { ...form, tax_rate: Number(form.tax_rate), mrp: Number(form.mrp), cost_price: Number(form.cost_price) }
      if (editId) {
        await api.inventory.update(editId, payload)
        showToast('Item updated successfully', true)
      } else {
        await api.inventory.create(payload)
        showToast('Item added successfully', true)
      }
      setForm({ ...EMPTY_ITEM }); setEditId(null); setViewMode('list'); load()
    } catch {
      showToast('Error saving item', false)
    } finally { setSaving(false) }
  }

  const handleEdit = (item: any) => {
    setForm({ ...EMPTY_ITEM, ...item.product || item }); setEditId(item.id || item.product_id)
    setViewMode('classic'); setErrors({})
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.inventory.delete(deleteId)
      showToast('Item deleted', true); load()
    } catch { showToast('Delete failed', false) }
    setDeleteId(null)
  }

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3000)
  }

  const newItem = () => {
    // Init form with empty values for custom fields too
    const cfDefaults = Object.fromEntries(customFields.map(cf => [cf.id, cf.type==='bool' ? false : cf.type==='number' ? 0 : '']))
    setForm({ ...EMPTY_ITEM, ...cfDefaults }); setEditId(null); setErrors({}); setViewMode('classic')
  }

  // ── Custom Field CRUD ──────────────────────────────────────
  const saveCFDraft = () => {
    if (!cfDraft.label.trim()) return
    const id = cfDraft.id || `cf_${Date.now()}`
    const updated = cfDraft.id
      ? customFields.map(f => f.id === cfDraft.id ? { ...cfDraft } : f)
      : [...customFields, { ...cfDraft, id }]
    setCustomFields(updated)
    saveCF(updated)
    setCfDraft({ id:'', label:'', type:'text', required:false, options:[] })
    showToast('Custom field saved', true)
  }

  const deleteCF = (id: string) => {
    const updated = customFields.filter(f => f.id !== id)
    setCustomFields(updated); saveCF(updated)
  }

  /* ── Grid View helpers ────────────────────────────────────── */
  const mkRow = (): GridRow => ({ ...EMPTY_ITEM, _id: Math.random().toString(36).slice(2), _status:'idle', _msg:'' })

  const addGridRow = () => setGridRows(r => [...r, mkRow()])

  const updateGridCell = (rowId: string, key: string, val: any) =>
    setGridRows(rows => rows.map(r => r._id === rowId ? { ...r, [key]: val } : r))

  const removeGridRow = (rowId: string) =>
    setGridRows(rows => rows.filter(r => r._id !== rowId))

  const validateGridRow = (row: GridRow): GridRow => {
    const errs = presentCheck(row)
    return { ...row, _status: Object.keys(errs).length ? 'error' : 'ok', _msg: Object.values(errs)[0] || '' }
  }

  const validateAllGrid = () => setGridRows(rows => rows.map(validateGridRow))

  const handleGridPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    const rows = text.split('\n').filter(l => l.trim())
      .map(line => {
        const cols = line.split('\t')
        // Map custom fields dynamically starting from index 9
        const cfVals: Record<string, any> = {}
        customFields.forEach((cf, idx) => {
          const raw = cols[9 + idx]?.trim() || ''
          if (cf.type === 'bool') cfVals[cf.id] = raw.toLowerCase() === 'yes' || raw.toLowerCase() === 'true' || raw === '1'
          else if (cf.type === 'number') cfVals[cf.id] = Number(raw) || 0
          else cfVals[cf.id] = raw
        })

        return {
          ...EMPTY_ITEM,
          ...cfVals,
          _id: Math.random().toString(36).slice(2),
          _status: 'idle' as const, _msg: '',
          code: cols[0]?.trim() || '',
          name: cols[1]?.trim() || '',
          brand: cols[2]?.trim() || '',
          category: cols[3]?.trim() || '',
          mrp: Number(cols[4]?.trim() || 0),
          cost_price: Number(cols[5]?.trim() || 0),
          tax_rate: Number(cols[6]?.trim() || 12),
          size: cols[7]?.trim() || '',
          color: cols[8]?.trim() || '',
        } as GridRow
      })
    setGridRows(prev => [...prev, ...rows])
    showToast(`${rows.length} rows pasted from clipboard`, true)
  }

  const commitGrid = async () => {
    const validated = gridRows.map(validateGridRow)
    setGridRows(validated)
    const valid = validated.filter(r => r._status === 'ok')
    if (!valid.length) { showToast('No valid rows to commit', false); return }
    setGridSaving(true)
    try {
      const payload = valid.map(({ _id, _status, _msg, ...rest }) => ({
        ...rest, mrp: Number(rest.mrp), cost_price: Number(rest.cost_price), tax_rate: Number(rest.tax_rate)
      }))
      await api.inventory.bulkCreate(payload)
      showToast(`${valid.length} SKUs committed successfully`, true)
      setGridRows([]); load()
    } catch { showToast('Error during bulk commit', false) }
    finally { setGridSaving(false) }
  }

  // ── Filtered Items ─────────────────────────────────────────
  const filtered = items.filter(i => {
    const p = i.product || i
    const q = search.toLowerCase()
    const matchQ = !q || p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
    const matchB = !filterBrand || p.brand === filterBrand
    const matchC = !filterCat || p.category === filterCat
    return matchQ && matchB && matchC
  })

  const brands = [...new Set(items.map(i => (i.product||i).brand).filter(Boolean))]
  const cats   = [...new Set(items.map(i => (i.product||i).category).filter(Boolean))]

  const setField = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  // ── Field Row renderer ─────────────────────────────────────
  const FieldInput = ({ fld }: { fld: ItemField }) => {
    const err = errors[fld.key]
    if (fld.type === 'bool') return (
      <button type="button" onClick={() => setField(fld.key, !form[fld.key])}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-xs font-black transition-all ${form[fld.key] ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
        {form[fld.key] ? <ToggleRight className="w-4 h-4"/> : <ToggleLeft className="w-4 h-4"/>}
        {form[fld.key] ? 'YES' : 'NO'}
      </button>
    )
    if (fld.type === 'select') return (
      <select value={form[fld.key]||''} onChange={e => setField(fld.key, e.target.value)}
        className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${err ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-amber-400'}`}>
        <option value="">— Select —</option>
        {(fld.options||[]).map(o => <option key={o}>{o}</option>)}
        {fld.key === 'brand' && brands.map(b => <option key={b}>{b}</option>)}
        {fld.key === 'category' && cats.map(c => <option key={c}>{c}</option>)}
      </select>
    )
    return (
      <input type={fld.type === 'number' ? 'number' : 'text'} value={form[fld.key]??''} onChange={e => setField(fld.key, e.target.value)}
        className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${err ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-amber-400'}`}/>
    )
  }

  const groups: Record<string, ItemField[]> = {
    'Basic Info': ITEM_FIELDS.filter(f => f.group === 'basic'),
    'Classification': ITEM_FIELDS.filter(f => f.group === 'class'),
    'Tax & Pricing': [...ITEM_FIELDS.filter(f => f.group === 'tax'), ...ITEM_FIELDS.filter(f => f.group === 'price')],
    'Flags': ITEM_FIELDS.filter(f => f.group === 'flag'),
  }

  // Custom field input renderer (for Classic View)
  const CustomFieldInput = ({ cf }: { cf: CustomField }) => {
    const val = form[cf.id]
    if (cf.type === 'bool') return (
      <button type="button" onClick={() => setField(cf.id, !val)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-xs font-black transition-all ${val ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
        {val ? <ToggleRight className="w-4 h-4"/> : <ToggleLeft className="w-4 h-4"/>}
        {val ? 'YES' : 'NO'}
      </button>
    )
    if (cf.type === 'select') return (
      <select value={val||''} onChange={e => setField(cf.id, e.target.value)}
        className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${errors[cf.id] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-amber-400'}`}>
        <option value="">— Select —</option>
        {cf.options.map(o => <option key={o}>{o}</option>)}
      </select>
    )
    return (
      <input type={cf.type==='number' ? 'number' : 'text'} value={val ?? ''} onChange={e => setField(cf.id, e.target.value)}
        className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${errors[cf.id] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-amber-400'}`}/>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#f0ede8] font-sans">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-black ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.ok ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} exit={{ scale:0.9 }}
              className="bg-white rounded-3xl p-8 shadow-2xl w-96 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500"/>
              </div>
              <h3 className="text-xl font-black text-navy mb-2">Delete Item?</h3>
              <p className="text-sm text-gray-500 mb-6">This will remove the SKU and its inventory records. Cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-black text-gray-500 text-sm hover:bg-gray-50">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 shrink-0">
        {/* Title */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 bg-[#1a2340] rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-amber-400"/>
          </div>
          <div>
            <div className="text-xs font-black text-[#1a2340] uppercase tracking-widest leading-none">Item Master</div>
            <div className="text-[9px] text-gray-400 font-bold">Catalogue › Items · {customFields.length} custom field{customFields.length!==1?'s':''}</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300"/>
          <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} data-f2="items"
            placeholder="Search code / name [F2]…"
            className="w-full bg-white border-2 border-gray-200 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs font-mono outline-none transition-all"/>
        </div>

        {/* Filters */}
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
          className="border-2 border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-amber-400 bg-white">
          <option value="">All Brands</option>
          {brands.map(b => <option key={b}>{b}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border-2 border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-amber-400 bg-white">
          <option value="">All Categories</option>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>

        <div className="flex-1"/>

        {/* View toggle */}
        <div className="flex bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
          {(['list','classic','grid'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => { setViewMode(v); if(v!=='classic'&&v!=='grid'){ setForm({...EMPTY_ITEM}); setEditId(null) } }}
              className={`px-3 py-2 text-[10px] font-black uppercase transition-all flex items-center gap-1 ${viewMode===v ? 'bg-[#1a2340] text-amber-400' : 'text-gray-400 hover:bg-gray-50'}`}>
              {v==='list'&&<List className="w-3 h-3"/>}
              {v==='classic'&&<Tag className="w-3 h-3"/>}
              {v==='grid'&&<Grid className="w-3 h-3"/>}
              {v}
            </button>
          ))}
        </div>

        <button onClick={load} className="p-2 bg-white border-2 border-gray-200 rounded-xl text-gray-400 hover:text-navy hover:border-amber-400 transition-all">
          <RefreshCw className="w-4 h-4"/>
        </button>
        <button onClick={() => setShowCFMgr(true)}
          className={`flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl text-xs font-black transition-all ${customFields.length > 0 ? 'border-purple-300 bg-purple-50 text-purple-600' : 'border-gray-200 bg-white text-gray-400 hover:border-purple-300'}`}>
          <Settings2 className="w-3.5 h-3.5"/> Columns {customFields.length > 0 && <span className="bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">{customFields.length}</span>}
        </button>
        <button onClick={newItem}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-[#1a2340] font-black text-xs uppercase px-4 py-2 rounded-xl shadow-md border-b-2 border-amber-600 transition-all">
          <Plus className="w-4 h-4"/> Add Item [F3]
        </button>
      </div>

      {/* ── Custom Fields Manager Panel ── */}
      <AnimatePresence>
        {showCFMgr && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale:0.93, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.93, y:20 }}
              className="bg-white rounded-3xl shadow-2xl w-[700px] max-h-[85vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-[#1a2340] px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-white"/>
                  </div>
                  <div>
                    <div className="text-white font-black text-sm">Manage Custom Columns</div>
                    <div className="text-[9px] text-purple-300 uppercase tracking-widest">Analyst Fields · Shoper9 Parity · Persisted per Terminal</div>
                  </div>
                </div>
                <button onClick={() => setShowCFMgr(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5"/></button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Existing fields list */}
                <div className="w-56 border-r border-gray-100 flex flex-col overflow-hidden shrink-0">
                  <div className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 flex items-center justify-between">
                    <span>Defined Fields ({customFields.length})</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {customFields.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-gray-200 gap-2 text-xs">
                        <PlusCircle className="w-8 h-8"/>
                        No custom fields yet
                      </div>
                    )}
                    {customFields.map(cf => (
                      <div key={cf.id}
                        onClick={() => setCfDraft({ ...cf })}
                        className={`px-4 py-3 cursor-pointer border-b border-gray-50 flex items-center justify-between group hover:bg-purple-50 transition-colors ${cfDraft.id===cf.id ? 'bg-purple-50 border-l-2 border-l-purple-400' : ''}`}>
                        <div>
                          <div className="text-xs font-black text-navy">{cf.label}</div>
                          <div className="text-[9px] text-gray-400 uppercase">{cf.type}{cf.required ? ' · required' : ''}</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); deleteCF(cf.id) }}
                          className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-all">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-100 shrink-0">
                    <button onClick={() => setCfDraft({ id:'', label:'', type:'text', required:false, options:[] })}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-purple-200 text-purple-400 hover:bg-purple-50 text-xs font-black transition-all">
                      <Plus className="w-3.5 h-3.5"/> New Field
                    </button>
                  </div>
                </div>

                {/* Field editor */}
                <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                  <div className="text-sm font-black text-navy">{cfDraft.id ? 'Edit Field' : 'Add New Field'}</div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Field Label *</label>
                      <input value={cfDraft.label} onChange={e => setCfDraft(d => ({ ...d, label: e.target.value }))}
                        placeholder="e.g. Season, Material, Collection"
                        className="border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"/>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Field Type</label>
                      <select value={cfDraft.type} onChange={e => setCfDraft(d => ({ ...d, type: e.target.value as any }))}
                        className="border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2.5 text-sm outline-none transition-all">
                        <option value="text">Text (free input)</option>
                        <option value="number">Number</option>
                        <option value="select">Dropdown (select)</option>
                        <option value="bool">Yes / No toggle</option>
                      </select>
                    </div>
                  </div>

                  {cfDraft.type === 'select' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dropdown Options (one per line)</label>
                      <textarea rows={4}
                        value={cfDraft.options.join('\n')}
                        onChange={e => setCfDraft(d => ({ ...d, options: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))}
                        placeholder="Summer&#10;Winter&#10;Monsoon&#10;Spring"
                        className="border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2.5 text-sm outline-none transition-all font-mono resize-none"/>
                      <span className="text-[9px] text-gray-400">{cfDraft.options.length} options defined</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setCfDraft(d => ({ ...d, required: !d.required }))}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-xs font-black transition-all ${cfDraft.required ? 'bg-red-50 border-red-300 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      {cfDraft.required ? <ToggleRight className="w-4 h-4"/> : <ToggleLeft className="w-4 h-4"/>}
                      {cfDraft.required ? 'Required (Present Check)' : 'Optional'}
                    </button>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-700 font-bold">
                    ⚡ Custom fields appear in Classic View form, Grid View columns, and are included in the bulk export payload as <code className="bg-amber-100 px-1 rounded">{cfDraft.id || 'cf_xxxxx'}</code>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button onClick={() => setCfDraft({ id:'', label:'', type:'text', required:false, options:[] })}
                      className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-black text-gray-500 hover:bg-gray-50">
                      Clear
                    </button>
                    <button onClick={saveCFDraft} disabled={!cfDraft.label.trim()}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white font-black text-sm py-2.5 rounded-xl shadow-md border-b-2 border-purple-700 transition-all">
                      <Save className="w-4 h-4"/> {cfDraft.id ? 'Update Field' : 'Add Field'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <div className="flex-1 flex gap-3 px-4 pb-3 overflow-hidden">

        {/* ══ LIST VIEW ══════════════════════════════════════════ */}
        {viewMode === 'list' && (
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            
            {/* Scrollable Container (Horizontal + Vertical) */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden flex flex-col">
              <div className="min-w-[1200px] flex flex-col flex-1">
                
                {/* Grid Header */}
                <div className="grid bg-[#1a2340] text-white text-[10px] font-black uppercase tracking-widest shrink-0"
                  style={{ gridTemplateColumns:'50px 130px minmax(250px, 1fr) 130px 110px 90px 110px 100px 90px 80px' }}>
                  {['#','Code','Description','Brand','Category','Size','MRP','Cost','GST%',''].map(h => (
                    <div key={h} className={`px-3 py-3.5 ${h==='Description'?'text-left':'text-center'}`}>{h}</div>
                  ))}
                </div>

                {/* Grid Body */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-32 text-gray-300 text-sm font-bold">Loading SKUs…</div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-10 gap-3">
                      <Package className="w-16 h-16" strokeWidth={0.8}/>
                      <span className="text-xl font-black uppercase tracking-widest">No Items Found</span>
                    </div>
                  ) : filtered.map((row, idx) => {
                    const p = row.product || row
                    return (
                      <motion.div key={row.id || p.id || idx} layout
                        initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                        className={`grid items-center border-b border-gray-50 hover:bg-amber-50 transition-colors group cursor-pointer ${idx%2===0?'bg-white':'bg-gray-50/50'}`}
                        style={{ gridTemplateColumns:'50px 130px minmax(250px, 1fr) 130px 110px 90px 110px 100px 90px 80px' }}
                        onClick={() => handleEdit(row)}>
                        <div className="px-3 py-3 text-center text-[10px] font-bold text-gray-300">{idx+1}</div>
                        <div className="px-3 py-3 text-center font-mono text-[11px] text-gray-500">{p.code}</div>
                        <div className="px-3 py-3">
                          <div className="font-bold text-navy text-xs leading-tight truncate">{p.name}</div>
                          {p.color && <div className="text-[10px] text-gray-400 mt-0.5">{p.color}</div>}
                        </div>
                        <div className="px-3 py-3 text-center text-[11px] font-bold text-gray-600 truncate">{p.brand || '—'}</div>
                        <div className="px-3 py-3 text-center text-[11px] text-gray-500 truncate">{p.category || '—'}</div>
                        <div className="px-3 py-3 text-center text-[11px] text-gray-400 truncate">{p.size || '—'}</div>
                        <div className="px-3 py-3 text-center font-black text-navy text-sm">₹{Number(p.mrp).toLocaleString()}</div>
                        <div className="px-3 py-3 text-center text-[11px] text-gray-400">₹{Number(p.cost_price||0).toLocaleString()}</div>
                        <div className="px-3 py-3 text-center text-[11px] text-gray-400">{p.tax_rate}%</div>
                        <div className="px-3 py-3 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={e => { e.stopPropagation(); handleEdit(row) }} className="p-1 rounded bg-white border border-gray-200 shadow-sm text-blue-500 hover:text-blue-700 hover:border-blue-300 transition-all"><Edit2 className="w-3.5 h-3.5"/></button>
                          <button onClick={e => { e.stopPropagation(); setDeleteId(p.id) }} className="p-1 rounded bg-white border border-gray-200 shadow-sm text-red-500 hover:text-red-700 hover:border-red-300 transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-5 py-2.5 flex items-center gap-6 shrink-0">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{filtered.length} of {items.length} SKUs</div>
              {filterBrand||filterCat||search ? (
                <button onClick={() => { setSearch(''); setFilterBrand(''); setFilterCat('') }}
                  className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5 hover:bg-amber-100 px-2 py-1 rounded transition-colors">
                  <X className="w-3.5 h-3.5"/> Clear Filters
                </button>
              ) : null}
              <div className="flex-1"/>
              <button className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-navy uppercase tracking-widest transition-colors hover:bg-gray-200 px-3 py-1.5 rounded">
                <Download className="w-3.5 h-3.5"/> Export CSV
              </button>
            </div>
          </div>
        )}

        {/* ══ CLASSIC FORM VIEW ══════════════════════════════════ */}
        {viewMode === 'classic' && (
          <div className="flex-1 flex flex-col gap-3 overflow-hidden">

            {/* Form Header */}
            <div className="bg-[#1a2340] rounded-2xl px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
                  <ScanBarcode className="w-5 h-5 text-[#1a2340]"/>
                </div>
                <div>
                  <div className="text-white font-black text-sm">
                    {editId ? 'Edit Item Master' : 'Add New Item Master'}
                  </div>
                  <div className="text-[9px] text-amber-400 uppercase tracking-widest font-bold">
                    {viewMode === 'classic' ? 'Classic View — Single Entry' : 'Grid View — Batch Entry'}
                    {' · Present Check Active'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {Object.keys(errors).length > 0 && (
                  <div className="flex items-center gap-2 text-red-400 text-[10px] font-black">
                    <AlertCircle className="w-4 h-4"/> {Object.keys(errors).length} field{Object.keys(errors).length>1?'s':''} failed Present Check
                  </div>
                )}
                <button onClick={() => { setViewMode('list'); setForm({...EMPTY_ITEM}); setEditId(null); setErrors({}) }}
                  className="text-white/40 hover:text-white transition-colors p-1"><X className="w-5 h-5"/></button>
              </div>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              {Object.entries(groups).map(([groupName, fields]) => (
                <div key={groupName} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-100 px-5 py-2.5 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-gray-400"/>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{groupName}</span>
                  </div>
                  <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {fields.map(fld => (
                      <div key={fld.key} className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          {fld.label}
                          {fld.required && <span className="text-red-400">*</span>}
                        </label>
                        <FieldInput fld={fld}/>
                        {errors[fld.key] && (
                          <span className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3"/> {errors[fld.key]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Custom Fields Group — rendered only if fields exist */}
              {customFields.length > 0 && (
                <div className="bg-white rounded-2xl border-2 border-purple-100 shadow-sm overflow-hidden">
                  <div className="bg-purple-50 border-b border-purple-100 px-5 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-3.5 h-3.5 text-purple-400"/>
                      <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Custom Fields (Analyst)</span>
                    </div>
                    <button onClick={() => setShowCFMgr(true)} className="text-[9px] font-black text-purple-400 hover:text-purple-600 uppercase tracking-widest">
                      + Manage
                    </button>
                  </div>
                  <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {customFields.map(cf => (
                      <div key={cf.id} className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                          {cf.label}
                          {cf.required && <span className="text-red-400">*</span>}
                        </label>
                        <CustomFieldInput cf={cf}/>
                        {errors[cf.id] && (
                          <span className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3"/> {errors[cf.id]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Footer */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-3 flex items-center gap-3 shrink-0">
              <button onClick={() => { setViewMode('list'); setForm({...EMPTY_ITEM}); setEditId(null); setErrors({}) }}
                className="px-6 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-black text-gray-500 hover:bg-gray-50 transition-all">
                Cancel [Esc]
              </button>
              {editId && (
                <button onClick={() => setDeleteId(editId)}
                  className="px-5 py-2.5 border-2 border-red-200 rounded-xl text-sm font-black text-red-500 hover:bg-red-50 transition-all flex items-center gap-2">
                  <Trash2 className="w-4 h-4"/> Delete
                </button>
              )}
              <div className="flex-1"/>
              {form.mrp > 0 && form.tax_rate > 0 && !form.is_tax_inclusive && (
                <div className="text-[10px] text-gray-400 font-bold">
                  MRP + Tax = ₹{Math.round(form.mrp * (1 + form.tax_rate/100)).toLocaleString()}
                </div>
              )}
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-[#1a2340] font-black text-sm px-8 py-2.5 rounded-xl shadow-md border-b-2 border-amber-600 transition-all">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin"/> : <><Save className="w-4 h-4"/> {editId ? 'Update [F10]' : 'Save [F10]'}</>}
              </button>
            </div>
          </div>
        )}

        {/* ══ GRID VIEW ── Inline Spreadsheet ══════════════════════ */}
        {viewMode === 'grid' && (
          <div className="flex-1 flex flex-col gap-2 overflow-hidden">
            <div className="bg-[#1a2340] rounded-2xl px-5 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                  <Grid className="w-4 h-4 text-[#1a2340]"/>
                </div>
                <div>
                  <div className="text-white font-black text-sm">Grid View — Batch Entry</div>
                  <div className="text-[9px] text-amber-400 uppercase tracking-widest font-bold">
                    Ctrl+V paste from Excel · Tab to move · {gridRows.length} rows
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-white/30 font-mono hidden lg:block">Col order: Code | Name | Brand | Category | MRP | Cost | Tax% | Size | Color</span>
                <button onClick={() => { setViewMode('list'); setGridRows([]) }} className="text-white/40 hover:text-white p-1">
                  <X className="w-5 h-5"/>
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" onPaste={handleGridPaste}>
              
              <div className="flex-1 overflow-x-auto overflow-y-hidden flex flex-col">
                <div className="flex flex-col flex-1" style={{ minWidth: `${800 + customFields.length*100}px` }}>
                  
                  {/* Column headers */}
                  <div className="grid bg-[#1a2340] text-white text-[9px] font-black uppercase tracking-widest shrink-0"
                    style={{ gridTemplateColumns:`36px 36px 110px 1fr 110px 90px 80px 70px 70px 80px ${customFields.map(()=>'minmax(100px,1fr)').join(' ')} 40px` }}>
                    {['#','','Code*','Description*','Brand*','Category*','MRP*','Cost','Tax%','Size','Color'].map((h, i) => (
                      <div key={i} className="px-2 py-3.5 text-center">{h}</div>
                    ))}
                    {customFields.map(cf => <div key={cf.id} className="px-2 py-3.5 text-center truncate">{cf.label}{cf.required?'*':''}</div>)}
                    <div className="px-2 py-3.5 text-center"></div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {gridRows.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-200 cursor-pointer select-none" onClick={addGridRow}>
                        <Grid className="w-14 h-14" strokeWidth={0.8}/>
                        <p className="font-black uppercase tracking-widest text-sm">Click to add a row · or Ctrl+V to paste from Excel</p>
                        <p className="text-[10px] text-gray-300 font-mono">Code | Name | Brand | Category | MRP | Cost | Tax% | Size | Color {customFields.map(cf => `| ${cf.label}`).join(' ')}</p>
                      </div>
                    ) : gridRows.map((row, idx) => (
                      <div key={row._id}
                        className={`grid items-center border-b text-xs ${
                          row._status==='error' ? 'bg-red-50 border-red-100' :
                          row._status==='ok'    ? 'bg-emerald-50/40 border-emerald-100' :
                          idx%2===0             ? 'bg-white border-gray-50' : 'bg-gray-50/50 border-gray-50'
                        }`}
                        style={{ gridTemplateColumns:`36px 36px 110px 1fr 110px 90px 80px 70px 70px 80px ${customFields.map(()=>'minmax(100px,1fr)').join(' ')} 40px` }}>
                        <div className="px-2 text-center text-[10px] text-gray-400 font-bold">{idx+1}</div>
                        <div className="flex items-center justify-center">
                          {row._status==='ok'    && <CheckCircle2 className="w-4 h-4 text-emerald-500"/>}
                          {row._status==='error' && <span title={row._msg}><AlertCircle className="w-4 h-4 text-red-500 cursor-help"/></span>}
                          {row._status==='idle'  && <span className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block"/>}
                        </div>
                        {(['code','name','brand','category','mrp','cost_price','tax_rate','size','color'] as const).map(key => (
                          <input key={key} value={row[key] ?? ''}
                            onChange={e => updateGridCell(row._id, key, e.target.value)}
                            onBlur={() => setGridRows(rows => rows.map(r => r._id===row._id ? validateGridRow(r) : r))}
                            className="w-full px-2 py-2 border-r border-gray-100 outline-none bg-transparent focus:bg-amber-50 focus:ring-1 focus:ring-inset focus:ring-amber-400 text-xs font-mono"
                            placeholder={key==='tax_rate' ? '12' : ''}
                          />
                        ))}
                        {customFields.map(cf => (
                          <input key={cf.id} value={row[cf.id] ?? ''}
                        onChange={e => updateGridCell(row._id, cf.id, e.target.value)}
                        onBlur={() => setGridRows(rows => rows.map(r => r._id===row._id ? validateGridRow(r) : r))}
                        className="w-full px-1.5 py-1.5 border-r border-gray-100 outline-none bg-transparent focus:bg-purple-50 focus:ring-1 focus:ring-inset focus:ring-purple-400 text-[11px] font-mono text-purple-900"
                        placeholder={cf.type==='bool'?'Yes/No':''}
                      />
                    ))}
                        <button onClick={() => removeGridRow(row._id)} className="flex items-center justify-center text-gray-200 hover:text-red-400 transition-colors p-1">
                          <X className="w-4 h-4"/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {gridRows.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-1.5 flex gap-4 text-[9px] font-black uppercase tracking-widest shrink-0">
                  <span className="text-gray-400">{gridRows.length} Rows</span>
                  <span className="text-emerald-500">{gridRows.filter(r=>r._status==='ok').length} Valid</span>
                  <span className="text-red-400">{gridRows.filter(r=>r._status==='error').length} Errors</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-2.5 flex items-center gap-3 shrink-0">
              <button onClick={addGridRow} className="flex items-center gap-1.5 px-4 py-2 border-2 border-gray-200 rounded-xl text-xs font-black text-gray-500 hover:border-amber-400 hover:bg-amber-50 transition-all">
                <Plus className="w-3.5 h-3.5"/> Add Row
              </button>
              <button onClick={validateAllGrid} className="flex items-center gap-1.5 px-4 py-2 border-2 border-gray-200 rounded-xl text-xs font-black text-blue-500 hover:bg-blue-50 transition-all">
                <CheckCircle2 className="w-3.5 h-3.5"/> Present Check
              </button>
              <button onClick={() => setGridRows([])} className="flex items-center gap-1.5 px-4 py-2 border-2 border-red-100 rounded-xl text-xs font-black text-red-400 hover:bg-red-50 transition-all">
                <Trash2 className="w-3.5 h-3.5"/> Clear
              </button>
              <div className="flex-1"/>
              <span className="text-[9px] text-gray-300 font-mono">{gridRows.filter(r=>r._status==='ok').length}/{gridRows.length} ready</span>
              <button onClick={commitGrid} disabled={gridSaving || !gridRows.some(r=>r._status==='ok')}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md border-b-2 border-emerald-700 transition-all">
                {gridSaving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin"/> Committing…</> : <><Save className="w-3.5 h-3.5"/> Commit Valid SKUs</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
