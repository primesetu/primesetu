/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Save, Trash2, Plus, LogOut, ChevronUp, ChevronDown, 
  ArrowLeft, ArrowRight, Settings, Database, List, CheckCircle2,
  AlertCircle, History, Keyboard,
  Clock
} from 'lucide-react'
import { 
  Button, 
  Card, 
  Input, 
  Label, 
  Badge, 
  Text, 
  Portal 
} from '@/components/ui/SovereignUI'
import { cn } from '@/lib/utils'
import { useHotkeys } from 'react-hotkeys-hook'

// ── TYPES ──
type TabId = 'view' | 'common' | 'details'

interface FieldDef {
  id: string
  label: string
  isMandatory?: boolean
}

const ALL_FIELDS: FieldDef[] = [
  { id: 'item_code', label: 'Stock No.', isMandatory: true },
  { id: 'name', label: 'Item Description', isMandatory: true },
  { id: 'brand', label: 'Brand', isMandatory: true },
  { id: 'category', label: 'Product', isMandatory: true },
  { id: 'style', label: 'Style', isMandatory: true },
  { id: 'shade', label: 'Shade' },
  { id: 'size', label: 'Size' },
  { id: 'retail_price', label: 'Retail Price', isMandatory: true },
  { id: 'cost_price', label: 'Cost Price' },
  { id: 'dealer_price', label: 'Dealer Price' },
  { id: 'tax_rate', label: 'Product Tax', isMandatory: true },
  { id: 'lsq', label: 'L.S.Q' },
  { id: 'moq', label: 'M.O.Q' },
  { id: 'eoq', label: 'E.O.Q' },
  { id: 'reorder_lvl', label: 'Reorder Lvl' },
  { id: 'material', label: 'Material' },
  { id: 'season', label: 'Season' },
]

export default function ItemMasterEntry({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('view')
  
  // Tab 1: Selection State
  const [selectedFields, setSelectedFields] = useState<string[]>(ALL_FIELDS.map(f => f.id))
  const [unselectedFields, setUnselectedFields] = useState<string[]>([])
  const [highlightedUnselected, setHighlightedUnselected] = useState<string[]>([])
  const [highlightedSelected, setHighlightedSelected] = useState<string[]>([])

  // Tab 2: Common Fields State
  const [commonFieldsEnabled, setCommonFieldsEnabled] = useState<Record<string, boolean>>({
    brand: true, category: true, tax_rate: true
  })
  const [commonFieldData, setCommonFieldData] = useState<Record<string, string>>({
    brand: '8001', category: 'PT001', tax_rate: '18'
  })

  // Tab 3: Grid State
  const [gridData, setGridData] = useState<Record<string, any>[]>([
    { id: '1', size: '38', item_description: 'PT' },
    { id: '2', size: '39', item_description: 'PT0002_1' },
    { id: '3', size: '40', item_description: 'PT0002_2' },
  ])
  const [frozenCols, setFrozenCols] = useState(0)

  // ── HOTKEYS ──
  useHotkeys('alt+1', (e) => { e.preventDefault(); setActiveTab('view') })
  useHotkeys('alt+2', (e) => { e.preventDefault(); setActiveTab('common') })
  useHotkeys('alt+3', (e) => { e.preventDefault(); setActiveTab('details') })
  useHotkeys('ctrl+n', (e) => { e.preventDefault(); handleAddRow() })
  useHotkeys('ctrl+s', (e) => { e.preventDefault(); handleSave() })
  useHotkeys('alt+h', (e) => { e.preventDefault(); alert('Hotkeys: Alt+1/2/3 Tabs, Ctrl+N Add, Ctrl+S Save, Ctrl+D Delete') })

  // ── ACTIONS ──
  const handleAddRow = () => {
    setGridData(prev => [...prev, { id: Date.now().toString() }])
  }

  const handleSave = () => {
    // Commit to API
    alert('Sovereign Ledger Updated: SKUs Committed to Registry.')
  }

  const moveRight = () => {
    const toMove = highlightedUnselected
    setUnselectedFields(prev => prev.filter(f => !toMove.includes(f)))
    setSelectedFields(prev => [...prev, ...toMove])
    setHighlightedUnselected([])
  }

  const moveLeft = () => {
    const toMove = highlightedSelected.filter(id => !ALL_FIELDS.find(f => f.id === id)?.isMandatory)
    setSelectedFields(prev => prev.filter(f => !toMove.includes(f)))
    setUnselectedFields(prev => [...prev, ...toMove])
    setHighlightedSelected([])
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[var(--background)] flex flex-col font-sans">
      {/* ── SOVEREIGN TITLE BAR ── */}
      <div className="h-12 bg-[var(--surface-elevated)] border-b border-[var(--border-saffron)] border-t-2 border-[var(--accent-light)] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Database size={18} className="text-[var(--accent)]" />
          <span className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">Item Master Entry Protocol</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex gap-1">
              <Badge variant="muted" className="h-5 text-[9px] uppercase">Data Mode: Add</Badge>
              <Badge variant="muted" className="h-5 text-[9px] uppercase">View Mode: Grid</Badge>
           </div>
           <button onClick={onClose} className="hover:text-[var(--accent)] transition-colors"><X size={20} /></button>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="flex bg-[var(--surface)] border-b border-[var(--border-subtle)]">
        {[
          { id: 'view', label: 'View', icon: List, shortcut: 'Alt+1' },
          { id: 'common', label: 'Common Fields', icon: Settings, shortcut: 'Alt+2' },
          { id: 'details', label: 'Item Details', icon: Database, shortcut: 'Alt+3' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={cn(
              "flex-1 py-3 px-6 flex flex-col items-center gap-1 border-r border-[var(--border-subtle)] transition-all relative overflow-hidden group",
              activeTab === tab.id ? "bg-[var(--background)]" : "hover:bg-[var(--background)]/50 opacity-60"
            )}
          >
            <div className="flex items-center gap-2">
               <tab.icon size={14} className={activeTab === tab.id ? "text-[var(--accent)]" : ""} />
               <span className="text-[11px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
            </div>
            <span className="text-[8px] font-bold opacity-30 group-hover:opacity-100">{tab.shortcut}</span>
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--accent)]" />}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'view' && (
            <motion.div 
              key="view" 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="h-full p-12 flex items-center justify-center gap-12 bg-[var(--background)]"
            >
              <div className="flex flex-col gap-4 w-[300px]">
                 <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Unselected Fields</Label>
                 <div className="h-[400px] bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl overflow-y-auto p-2">
                    {unselectedFields.map(fid => (
                      <div 
                        key={fid} 
                        onClick={() => setHighlightedUnselected(prev => prev.includes(fid) ? prev.filter(f=>f!==fid) : [...prev, fid])}
                        className={cn("px-4 py-2 text-xs font-bold rounded cursor-pointer mb-1", highlightedUnselected.includes(fid) ? "bg-[var(--accent)] text-[var(--background)]" : "hover:bg-[var(--accent)]/10")}
                      >
                         {ALL_FIELDS.find(f => f.id === fid)?.label}
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col gap-4">
                 <Button variant="secondary" className="w-12 h-12" onClick={moveRight}><ArrowRight size={20} /></Button>
                 <Button variant="secondary" className="w-12 h-12" onClick={moveLeft}><ArrowLeft size={20} /></Button>
                 <div className="h-8" />
                 <Button variant="secondary" className="w-12 h-12"><ChevronUp size={20} /></Button>
                 <Button variant="secondary" className="w-12 h-12"><ChevronDown size={20} /></Button>
              </div>

              <div className="flex flex-col gap-4 w-[300px]">
                 <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Selected Fields</Label>
                 <div className="h-[400px] bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl overflow-y-auto p-2">
                    {selectedFields.map(fid => {
                      const f = ALL_FIELDS.find(field => field.id === fid)
                      return (
                        <div 
                          key={fid} 
                          onClick={() => setHighlightedSelected(prev => prev.includes(fid) ? prev.filter(f=>f!==fid) : [...prev, fid])}
                          className={cn(
                            "px-4 py-2 text-xs font-bold rounded cursor-pointer mb-1 flex justify-between items-center",
                            highlightedSelected.includes(fid) ? "bg-[var(--accent)] text-[var(--background)]" : "hover:bg-[var(--accent)]/10",
                            f?.isMandatory && "opacity-50 grayscale"
                          )}
                        >
                           {f?.label}
                           {f?.isMandatory && <span className="text-[8px] font-black">MANDATORY</span>}
                        </div>
                      )
                    })}
                 </div>
                 <Button className="mt-4 bg-[var(--accent)] text-[var(--background)] font-black text-[10px] uppercase tracking-widest h-12 rounded-xl">Save Field Selections</Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'common' && (
            <motion.div 
              key="common" 
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className="h-full p-12 bg-[var(--background)] flex gap-12 overflow-hidden"
            >
               <div className="w-[300px] flex flex-col gap-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Common Fields Registry</Label>
                  <div className="flex-1 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl overflow-y-auto p-4 space-y-2">
                     {selectedFields.map(fid => (
                        <div key={fid} className="flex items-center gap-3 py-1">
                           <input 
                              type="checkbox"
                              checked={commonFieldsEnabled[fid]} 
                              onChange={(e) => setCommonFieldsEnabled(prev => ({...prev, [fid]: e.target.checked}))} 
                              className="w-4 h-4 rounded border-[var(--border-subtle)]"
                           />
                           <span className="text-xs font-bold">{ALL_FIELDS.find(f => f.id === fid)?.label}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Common Field Data Entry</Label>
                  <div className="flex-1 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl overflow-y-auto p-8">
                     <div className="max-w-md space-y-6">
                        {selectedFields.filter(fid => commonFieldsEnabled[fid]).map(fid => (
                          <div key={fid} className="space-y-2">
                             <Label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">{ALL_FIELDS.find(f => f.id === fid)?.label}</Label>
                             <Input 
                                value={commonFieldData[fid] || ''} 
                                onChange={e => setCommonFieldData(prev => ({...prev, [fid]: e.target.value}))}
                                className="h-10 bg-[var(--background)] border-[var(--border-subtle)] font-black text-xs"
                             />
                          </div>
                        ))}
                        {Object.keys(commonFieldsEnabled).filter(k => commonFieldsEnabled[k]).length === 0 && (
                          <div className="h-full flex items-center justify-center opacity-20 py-20 text-center">
                             <Text variant="xs" className="uppercase font-black">Select fields on the left to set common values</Text>
                          </div>
                        )}
                     </div>
                  </div>
                  <Button className="self-end bg-[var(--accent)] text-[var(--background)] font-black text-[10px] uppercase tracking-widest h-12 px-12 rounded-xl">Save Common Data</Button>
               </div>
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div 
              key="details" 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col bg-[var(--background)]"
            >
               <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-4 bg-[var(--surface)]">
                  <Label className="text-[10px] font-black uppercase">Columns to Freeze:</Label>
                  <Input 
                    type="number" 
                    value={frozenCols} 
                    onChange={e => setFrozenCols(Number(e.target.value))} 
                    className="w-16 h-8 text-center font-black"
                  />
                  <div className="flex-1" />
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 text-[10px] font-black opacity-30">
                        <Keyboard size={14} />
                        [Alt+H] FOR SHORTCUTS
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-auto bg-[var(--surface-elevated)] p-4">
                  <table className="min-w-full border-collapse bg-[var(--surface)] border border-[var(--border-subtle)]">
                     <thead>
                        <tr className="bg-[var(--surface-elevated)] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[var(--border-subtle)]">
                           <th className="w-10 px-4 py-3 border-r border-[var(--border-subtle)] sticky left-0 z-20 bg-[var(--surface-elevated)]">#</th>
                           {selectedFields.map((fid, idx) => (
                             <th 
                               key={fid} 
                               className={cn(
                                 "px-6 py-3 border-r border-[var(--border-subtle)] text-left min-w-[150px]",
                                 idx < frozenCols && "sticky bg-[var(--surface-elevated)] z-10"
                               )}
                               style={idx < frozenCols ? { left: `${40 + (idx * 150)}px` } : {}}
                             >
                                {ALL_FIELDS.find(f => f.id === fid)?.label}
                             </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[var(--border-subtle)]">
                        {gridData.map((row, rIdx) => (
                          <tr key={row.id} className="hover:bg-[var(--accent)]/5 group">
                             <td className="w-10 px-4 py-2 border-r border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-tertiary)] text-center sticky left-0 z-20 bg-[var(--surface)] group-hover:bg-[var(--surface-elevated)]">
                                {rIdx + 1}
                             </td>
                             {selectedFields.map((fid, cIdx) => (
                               <td 
                                 key={fid} 
                                 className={cn(
                                   "px-2 py-1 border-r border-[var(--border-subtle)]",
                                   cIdx < frozenCols && "sticky bg-[var(--surface)] z-10 group-hover:bg-[var(--surface-elevated)]"
                                 )}
                                 style={cIdx < frozenCols ? { left: `${40 + (cIdx * 150)}px` } : {}}
                               >
                                  <input 
                                    className="w-full bg-transparent border-none outline-none text-xs font-bold px-4 py-1"
                                    defaultValue={commonFieldsEnabled[fid] ? commonFieldData[fid] : row[fid]}
                                  />
                               </td>
                             ))}
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SOVEREIGN ACTION BAR ── */}
      <div className="h-20 bg-[var(--surface-elevated)] border-t-2 border-[var(--border-subtle)] flex items-center justify-between px-8">
        <div className="flex gap-2">
           <Button variant="secondary" className="h-10 px-6 font-black text-[10px] uppercase tracking-widest gap-2" onClick={handleAddRow}>
              <Plus size={14} /> Add Protocol [Ctrl+N]
           </Button>
           <Button variant="secondary" className="h-10 px-6 font-black text-[10px] uppercase tracking-widest gap-2">
              <History size={14} /> Edit Entry
           </Button>
           <Button variant="secondary" className="h-10 px-6 font-black text-[10px] uppercase tracking-widest gap-2 text-[var(--danger)]">
              <Trash2 size={14} /> Delete Entry [Ctrl+D]
           </Button>
        </div>

        <div className="flex gap-4">
           <Button 
            className="h-12 px-12 bg-[var(--accent)] text-[var(--background)] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-[var(--accent)]/20"
            onClick={handleSave}
           >
              Update Registry [Ok]
           </Button>
           <Button 
            variant="ghost" 
            className="h-12 px-8 font-black text-[10px] uppercase tracking-widest border border-[var(--border-subtle)]"
            onClick={onClose}
           >
              Abort Entry [Cancel]
           </Button>
        </div>
      </div>
    </div>
  )
}
