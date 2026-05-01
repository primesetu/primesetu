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
import React, { useState } from 'react'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { useGenLookup } from '@/hooks/useGenLookup'
import { cn } from '@/lib/utils'
import { 
  X, 
  Save, 
  Package, 
  Tag, 
  Layers, 
  DollarSign, 
  ShieldCheck,
  Plus,
  AlertCircle
} from 'lucide-react'
import { 
  Button, 
  Input, 
  Text,
  Badge
} from '@/components/ui/SovereignUI'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddItemModal({ isOpen, onClose, onSuccess }: AddItemModalProps) {
  const { theme } = useTheme()
  const isInstitutional = theme === 'SMRITI-OS'

  const [activeTab, setActiveTab] = useState<'basic' | 'dna' | 'pricing'>('basic')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    item_code: '',
    item_name: '',
    department_id: '',
    brand: '',
    mrp_paise: 0,
    gst_rate: 5,
    hsn_code: '',
    uom: 'Pcs',
    anal_codes: {} as Record<string, string>
  })

  // Hydrate Registry Dropdowns
  const { data: departments } = useGenLookup(2)
  const { data: brands } = useGenLookup(5)

  const handleSave = async () => {
    if (!formData.item_code || !formData.item_name) {
      alert("Please fill mandatory fields.")
      return
    }

    try {
      setLoading(true)
      await api.inventory.create({
        ...formData,
        stock_matrix: [] // Initialize empty matrix
      })
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Creation failed", err)
      alert("Failed to commit item to Sovereign Registry.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className={cn(
        "relative w-full max-w-4xl rounded-[var(--radius-lg)] shadow-2xl border flex flex-col overflow-hidden animate-in zoom-in-95 duration-300",
        isInstitutional ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]" : "bg-[var(--background)] border-[var(--border-subtle)]/50"
      )}>
        {/* Modal Header */}
        <div className="p-8 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--background)]/40">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-lg">
                 <Plus size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-black text-[var(--text-primary)]">New Institutional SKU</h2>
                <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Committing Item DNA to SMRITI-OS Registry</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-[var(--surface-elevated)] rounded-full transition-all text-[var(--text-tertiary)]">
              <X size={24} />
           </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-8 border-b border-[var(--border-subtle)] bg-[var(--background)]/20">
           {[
             { id: 'basic', label: 'Basic Info', icon: Package },
             { id: 'dna', label: 'Analysis Codes (DNA)', icon: Layers },
             { id: 'pricing', label: 'Pricing & Compliance', icon: DollarSign }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                 "px-8 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2",
                 activeTab === tab.id 
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-transparent text-[var(--text-tertiary)] hover:bg-[var(--surface-elevated)]"
               )}
             >
               <tab.icon size={14} />
               {tab.label}
             </button>
           ))}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-10 min-h-[400px]">
           {activeTab === 'basic' && (
             <div className="grid grid-cols-2 gap-8 animate-in slide-in-from-left-4 duration-500">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] ml-2">Item Code / Stock Number *</label>
                   <Input 
                    autoFocus
                    placeholder="E.G. SHIRT-PUMA-XL-001" 
                    className="h-14 font-serif font-black text-lg uppercase"
                    value={formData.item_code}
                    onChange={(e) => setFormData({...formData, item_code: e.target.value.toUpperCase()})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] ml-2">Item Description *</label>
                   <Input 
                    placeholder="E.G. PUMA GRAPHIC TEE WHITE" 
                    className="h-14 font-black text-sm uppercase"
                    value={formData.item_name}
                    onChange={(e) => setFormData({...formData, item_name: e.target.value.toUpperCase()})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] ml-2">Department</label>
                   <select 
                    className="w-full h-14 rounded-[var(--radius-md)] bg-[var(--background)] border border-[var(--border-subtle)] px-4 text-xs font-black uppercase outline-none focus:border-[var(--accent)] transition-all"
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                   >
                      <option value="">SELECT DEPARTMENT</option>
                      {departments.map(d => <option key={d.code} value={d.code}>{d.descr}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] ml-2">Brand</label>
                   <select 
                    className="w-full h-14 rounded-[var(--radius-md)] bg-[var(--background)] border border-[var(--border-subtle)] px-4 text-xs font-black uppercase outline-none focus:border-[var(--accent)] transition-all"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                   >
                      <option value="">SELECT BRAND</option>
                      {brands.map(b => <option key={b.descr} value={b.descr}>{b.descr}</option>)}
                   </select>
                </div>
             </div>
           )}

           {activeTab === 'dna' && (
             <div className="grid grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-500">
                {Array.from({ length: 6 }).map((_, i) => (
                   <div key={i} className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] ml-2">Anal Code {i + 1}</label>
                      <Input placeholder="N/A" className="h-12 text-[10px] font-black uppercase" />
                   </div>
                ))}
                <div className="col-span-3 p-6 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20 mt-4 flex items-center gap-4">
                   <AlertCircle size={20} className="text-[var(--accent)]" />
                   <p className="text-[10px] font-bold text-[var(--text-secondary)] leading-relaxed">
                      Analysis Codes are part of the **SMRITI-OS Item DNA**. 
                      They allow you to track attributes like "Fabric", "Fit", or "Season" without modifying the database schema.
                   </p>
                </div>
             </div>
           )}

           {activeTab === 'pricing' && (
             <div className="grid grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] ml-2">Standard MRP (₹)</label>
                   <Input 
                    type="number"
                    placeholder="0.00" 
                    className="h-14 font-serif font-black text-xl"
                    onChange={(e) => setFormData({...formData, mrp_paise: Math.round(parseFloat(e.target.value) * 100)})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] ml-2">GST Rate (%)</label>
                   <select 
                    className="w-full h-14 rounded-[var(--radius-md)] bg-[var(--background)] border border-[var(--border-subtle)] px-4 text-xs font-black uppercase outline-none focus:border-[var(--accent)] transition-all"
                    value={formData.gst_rate}
                    onChange={(e) => setFormData({...formData, gst_rate: parseInt(e.target.value)})}
                   >
                      {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}% GST</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] ml-2">HSN Code</label>
                   <Input 
                    placeholder="E.G. 6109" 
                    className="h-14 font-black text-sm"
                    value={formData.hsn_code}
                    onChange={(e) => setFormData({...formData, hsn_code: e.target.value})}
                   />
                </div>
             </div>
           )}
        </div>

        {/* Modal Footer */}
        <div className="p-8 border-t border-[var(--border-subtle)] bg-[var(--background)]/40 flex justify-between items-center">
           <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[var(--accent)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Verified Sovereign Committal</span>
           </div>
           <div className="flex gap-4">
              <Button variant="ghost" className="px-8 h-14 text-[10px] font-black uppercase tracking-widest" onClick={onClose}>Discard</Button>
              <Button 
                className="px-12 h-14 bg-[var(--accent)] text-white text-xs font-black uppercase tracking-widest shadow-2xl gap-2"
                onClick={handleSave}
                loading={loading}
              >
                <Save size={18} /> Commit to Registry [F9]
              </Button>
           </div>
        </div>
      </div>
    </div>
  )
}
