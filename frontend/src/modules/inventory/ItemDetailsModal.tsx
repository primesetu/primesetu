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
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { 
  X, 
  Package, 
  Tag, 
  Layers, 
  DollarSign, 
  Info,
  Database,
  ArrowRight,
  ClipboardList
} from 'lucide-react'
import { 
  Button, 
  Badge,
  Card
} from '@/components/ui/SovereignUI'

interface ItemDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  item: any
}

export default function ItemDetailsModal({ isOpen, onClose, item }: ItemDetailsModalProps) {
  const { theme } = useTheme()
  const isInstitutional = theme === 'LIGHT'
  const [activeTab, setActiveTab] = useState<'details' | 'legacy' | 'related'>('details')
  const [comboData, setComboData] = useState<any>(null)
  const [vendorName, setVendorName] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isCancelled = false
    
    if (isOpen && item?.class1cd) {
      const fetchData = async () => {
        try {
          setLoading(true)
          // Check related Class12Combo table
          const response = await api.legacy.getData('class12combo', {
            search_col: 'class1cd',
            search_val: item.class1cd
          })
          
          if (isCancelled) return

          const exactMatch = response.data?.find((d: any) => d.class2cd === item.class2cd)
          const data = exactMatch || (response.data && response.data.length > 0 ? response.data[0] : null)
          setComboData(data)

          if (data?.prefvendorid) {
            const vResponse = await api.legacy.getData('vendors', {
              search_col: 'code',
              search_val: data.prefvendorid
            })
            if (!isCancelled && vResponse.data && vResponse.data.length > 0) {
              setVendorName(vResponse.data[0].nm)
            }
          }
        } catch (err) {
          console.error("Failed to fetch related combo data", err)
        } finally {
          if (!isCancelled) setLoading(false)
        }
      }

      fetchData()
    } else {
      setComboData(null)
      setVendorName('')
    }

    return () => { isCancelled = true }
  }, [isOpen, item?.class1cd, item?.class2cd])

  const formatCurrency = (val: any) => {
    const num = parseFloat(val)
    if (isNaN(num)) return '₹0.00'
    return num.toLocaleString('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2 
    })
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className={cn(
        "relative w-full max-w-5xl rounded-[var(--radius-lg)] shadow-2xl border flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 h-[80vh]",
        isInstitutional ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]" : "bg-[var(--background)] border-[var(--border-subtle)]/50"
      )}>
        {/* Modal Header */}
        <div className="p-8 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--background)]/40">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-lg">
                 <Package size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-black text-[var(--text-primary)]">{item.itemdesc}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <Badge variant="muted" className="text-[10px] font-black uppercase tracking-widest">{item.stockno}</Badge>
                   <ArrowRight size={12} className="text-[var(--text-tertiary)]" />
                   <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">DNA Registry Entry</span>
                </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-[var(--surface-elevated)] rounded-full transition-all text-[var(--text-tertiary)]">
              <X size={24} />
           </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-[var(--border-subtle)] bg-[var(--background)]/20">
           {[
             { id: 'details', label: 'Item Details', icon: Info },
             { id: 'legacy', label: 'Shoper 9 Raw Data', icon: Database },
             { id: 'related', label: 'Combo Mappings (Class12)', icon: Layers }
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10">
           {activeTab === 'details' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-500">
                <div className="space-y-8">
                   <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-4 flex items-center gap-2">
                        <ClipboardList size={14} /> Classification
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                         <Card className="p-4 bg-[var(--surface-elevated)] border-[var(--border-subtle)]">
                            <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase">Super Class 1 (Dept)</p>
                            <p className="text-sm font-black text-[var(--text-primary)] mt-1">{comboData?.superclass1 || item.class1cd || 'N/A'}</p>
                         </Card>
                         <Card className="p-4 bg-[var(--surface-elevated)] border-[var(--border-subtle)]">
                            <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase">Super Class 2 (Buyer)</p>
                            <p className="text-sm font-black text-[var(--text-primary)] mt-1">{comboData?.superclass2 || item.class2cd || 'N/A'}</p>
                         </Card>
                         <Card className="p-4 bg-[var(--surface-elevated)] border-[var(--border-subtle)]">
                            <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase">Dept / Class 1</p>
                            <p className="text-sm font-black text-[var(--text-primary)] mt-1">{item.class1cd || 'N/A'}</p>
                         </Card>
                         <Card className="p-4 bg-[var(--surface-elevated)] border-[var(--border-subtle)]">
                            <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase">Brand / Class 2</p>
                            <p className="text-sm font-black text-[var(--text-primary)] mt-1">{item.class2cd || 'N/A'}</p>
                         </Card>
                      </div>
                   </section>

                   <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-4 flex items-center gap-2">
                        <Tag size={14} /> Item Flags
                      </h3>
                      <div className="flex gap-4">
                         <Badge variant={comboData?.isservicecombo ? 'warning' : 'muted'} className="px-4 py-2 text-[10px] font-black">
                            {comboData?.isservicecombo ? 'SERVICE ITEM' : 'PHYSICAL SKU'}
                         </Badge>
                         <Badge variant={comboData?.billable ? 'success' : 'danger'} className="px-4 py-2 text-[10px] font-black">
                            {comboData?.billable ? 'BILLABLE' : 'NON-BILLABLE (GIFT/SAMPLE)'}
                         </Badge>
                      </div>
                   </section>

                   <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-4 flex items-center gap-2">
                        <Layers size={14} /> Analysis Codes (DNA)
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                         {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="p-2 border border-[var(--border-subtle)] rounded-lg text-center">
                               <p className="text-[7px] font-bold text-[var(--text-tertiary)] uppercase">Anal {i}</p>
                               <p className="text-[10px] font-black text-[var(--text-primary)] mt-0.5">{item[`analcode${i}`] || '-'}</p>
                            </div>
                         ))}
                      </div>
                   </section>
                </div>

                <div className="space-y-8">
                   <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-4 flex items-center gap-2">
                        <DollarSign size={14} /> Pricing & Financials
                      </h3>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/10">
                            <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase">Retail Price (MRP)</span>
                            <span className="text-xl font-serif font-black text-[var(--accent)]">{formatCurrency(item.retail_price)}</span>
                         </div>
                         <div className="flex justify-between items-center p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                            <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase">Dealer Price</span>
                            <span className="text-xl font-serif font-black text-[var(--text-primary)]">{formatCurrency(item.dealer_price)}</span>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border border-[var(--border-subtle)] rounded-xl">
                               <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase">Last Pur. Price</p>
                               <p className="text-sm font-serif font-black text-[var(--text-primary)] mt-1">{formatCurrency(item.lastpurchprice)}</p>
                            </div>
                            <div className="p-4 border border-[var(--border-subtle)] rounded-xl">
                               <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase">Current Cost</p>
                               <p className="text-sm font-serif font-black text-[var(--text-primary)] mt-1">{formatCurrency(item.currentcost)}</p>
                            </div>
                         </div>
                      </div>
                   </section>

                   <Card className="p-6 bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--background)] border-[var(--border-subtle)]">
                      <div className="flex items-center gap-3 mb-4">
                         <Tag size={18} className="text-[var(--accent)]" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">Secondary Fields</span>
                      </div>
                      <div className="space-y-2">
                         {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex justify-between text-[10px]">
                               <span className="font-bold text-[var(--text-tertiary)] uppercase">SField {i}</span>
                               <span className="font-black text-[var(--text-secondary)]">{item[`sfield${i}`] || 'N/A'}</span>
                            </div>
                         ))}
                      </div>
                   </Card>
                </div>
             </div>
           )}

           {activeTab === 'legacy' && (
             <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Database size={16} className="text-[var(--accent)]" />
                      <span className="text-xs font-black uppercase tracking-widest">Shoper 9 Raw Record Explorer</span>
                   </div>
                   <Badge variant="muted">Table: itemmaster</Badge>
                </div>
                <div className="p-6 rounded-xl bg-[#000] text-green-500 font-mono text-[10px] overflow-x-auto shadow-inner border border-white/10">
                   <pre>{JSON.stringify(item, null, 2)}</pre>
                </div>
             </div>
           )}

            {activeTab === 'related' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 rounded-2xl bg-[var(--accent)]/5 border border(--accent)/20 flex items-center justify-between">
                   <div>
                      <h4 className="text-sm font-black text-[var(--accent)] uppercase tracking-widest">Class 1 & 2 Relationship Matrix</h4>
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] mt-1 uppercase">Fetched from Legacy class12combo Table</p>
                   </div>
                   <Badge variant={loading ? 'muted' : comboData ? 'success' : 'warning'}>
                      {loading ? 'FETCHING DNA...' : comboData ? 'CONNECTED' : 'MAPPING MISSING'}
                   </Badge>
                </div>

                {loading ? (
                   <div className="flex flex-col items-center justify-center p-20 space-y-4">
                      <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Accessing Legacy Registry...</p>
                   </div>
                ) : comboData ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                     {[
                       { label: 'Sizegroup', value: comboData.sizegroup },
                       { label: 'Retail Mark-up (%)', value: comboData.retailmarkup ? `${comboData.retailmarkup}%` : '0%' },
                       { label: 'Dealer Mark-up (%)', value: comboData.dealermarkup ? `${comboData.dealermarkup}%` : '0%' },
                       { label: 'Pref Vendor', value: vendorName ? `${vendorName} (${comboData.prefvendorid})` : comboData.prefvendorid },
                       { label: 'Prod Tax Type', value: comboData.prodtaxtype },
                       { label: 'Billable', value: comboData.billable ? 'YES' : 'NO' }
                     ].map((d, i) => (
                       <Card key={i} className="p-4 border-[var(--border-subtle)]">
                          <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase">{d.label}</p>
                          <p className="text-xs font-black text-[var(--text-primary)] mt-1">{d.value || 'N/A'}</p>
                       </Card>
                     ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                     <Layers size={48} className="text-[var(--text-tertiary)]/20" />
                     <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">No combo mapping found for this combination in Shoper 9.</p>
                  </div>
                )}
             </div>
           )}
        </div>

        {/* Modal Footer */}
        <div className="p-8 border-t border-[var(--border-subtle)] bg-[var(--background)]/40 flex justify-end">
           <Button className="px-12 h-14 bg-[var(--accent)] text-white text-xs font-black uppercase tracking-widest shadow-2xl" onClick={onClose}>
              Close Details [ESC]
           </Button>
        </div>
      </div>
    </div>
  )
}
