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
import React, { useState, useEffect, useMemo } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Monitor, Shield, Settings, Database, Tag, Layout, Store, Palette, Search, Plus, Filter, Save, X, Trash2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/api/client'
import Personalization from './Personalization'
import BrowseCustomizer from './BrowseCustomizer'
import CatalogueDNA from './CatalogueDNA'
import TaxMaster from './TaxMaster'
import { 
  Button, 
  Card, 
  Text, 
  Input, 
  Badge,
  DataTable 
} from '@/components/ui/SovereignUI'

export default function ConfigModule() {
  const { theme } = useTheme();
  const isInstitutional = theme === 'SMRITI-OS';

  const [activeSubTab, setActiveSubTab] = useState<'params' | 'classification' | 'brands' | 'tax' | 'integrations' | 'labels' | 'personalization' | 'browsers'>('params')
  const [params, setParams] = useState([
    { id: 1, code: 'MRP_INCL_TAX', desc: 'Is MRP inclusive of tax by default?', value: true, type: 'bool' },
    { id: 2, code: 'AUTO_ROUND_OFF', desc: 'Enable automatic round-off of bills?', value: true, type: 'bool' },
    { id: 3, code: 'ALLOW_NEGATIVE_STOCK', desc: 'Allow sales if stock is zero?', value: false, type: 'bool' },
    { id: 4, code: 'CURRENCY_SYMBOL', desc: 'Default currency symbol', value: '₹', type: 'string' },
    { id: 5, code: 'ROUND_OFF_LIMIT', desc: 'Nearest rounding limit', value: '0.50', type: 'float' },
  ])

  const [brands] = useState([
    { id: '1', name: 'Puma', category: 'Footwear', skus: 142, status: 'Active' },
    { id: '2', name: 'Nike', category: 'Footwear', skus: 89, status: 'Active' },
    { id: '3', name: 'Adidas', category: 'Footwear', skus: 120, status: 'Active' },
    { id: '4', name: 'Levi\'s', category: 'Apparel', skus: 210, status: 'Active' },
  ])

  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [loadingStore, setLoadingStore] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoadingStore(true);
        const data = await api.store.getSettings();
        setStoreSettings(data);
      } catch (err) {
        console.error("Failed to fetch store settings", err);
      } finally {
        setLoadingStore(false);
      }
    };
    if (activeSubTab === 'integrations') {
      fetchStore();
    }
  }, [activeSubTab]);

  const handleUpdateStore = async () => {
    try {
      await api.store.updateSettings(storeSettings);
      alert("Store profile updated successfully.");
    } catch (err) {
      alert("Failed to update store profile.");
    }
  };

  // ── BRAND COLUMNS ──
  const brandColumns = useMemo(() => [
    {
      header: "BRAND NAME",
      accessor: (item: any) => <span className="font-black text-navy uppercase tracking-widest">{item.name}</span>,
      flex: 2,
      pinned: 'left' as const
    },
    {
      header: "CATEGORY",
      accessor: (item: any) => <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">{item.category}</span>,
      width: 180
    },
    {
      header: "ACTIVE SKUS",
      accessor: (item: any) => <span className="font-serif font-black text-navy text-lg">{item.skus}</span>,
      width: 150,
      className: 'text-center'
    },
    {
      header: "ACTIONS",
      accessor: (item: any) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-navy/40 hover:text-navy">
            EDIT
          </Button>
        </div>
      ),
      width: 100,
      pinned: 'right' as const
    }
  ], []);

  return (
    <div className="flex flex-col gap-[var(--space-8)] animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-[var(--space-6)]">
        <div>
          <h1 className={cn(
            "text-4xl font-serif font-black",
            isInstitutional ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
          )}>Sovereign Control</h1>
          <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-widest mt-[var(--space-2)]">Managing Institutional Parameters & ItemMaster DNA</p>
        </div>
        
        <div className={cn(
          "flex p-[var(--space-1)] rounded-[var(--radius-lg)] border flex-wrap gap-[var(--space-1)]",
          isInstitutional ? "bg-[var(--background)] border-[var(--border-subtle)]" : "bg-[var(--background)]/50 border-[var(--border-subtle)]/50"
        )}>
          {[
            { id: 'params', label: 'Parameters', icon: Settings },
            { id: 'classification', label: 'Item DNA', icon: Database },
            { id: 'brands', label: 'Catalogue', icon: Tag },
            { id: 'tax', label: 'Tax Master', icon: Shield },
            { id: 'labels', label: 'Labels', icon: Tag },
            { id: 'browsers', label: 'Grid Mask', icon: Layout },
            { id: 'integrations', label: 'Store', icon: Store },
            { id: 'personalization', label: 'Personalization', icon: Palette },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-[var(--radius-md)] text-[10px] font-black tracking-widest transition-all flex items-center gap-[var(--space-2)]",
                activeSubTab === tab.id 
                  ? (isInstitutional ? "bg-[var(--accent)] text-white shadow-md" : "bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-lg border border-[var(--border-default)]/50")
                  : (isInstitutional ? "text-[var(--text-tertiary)] hover:text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]")
              )}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'params' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-8)]">
          <div className={cn(
            "lg:col-span-2 rounded-[var(--radius-lg)] p-[var(--space-8)] shadow-2xl border",
            isInstitutional ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]" : "bg-[var(--background)]/40 backdrop-blur-md border-[var(--border-subtle)]/50"
          )}>
            <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-8)]">
              <div className={cn(
                "w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center text-xl shadow-lg border",
                isInstitutional ? "bg-[var(--background)] border-[var(--border-subtle)]" : "bg-[var(--surface-elevated)] border-[var(--border-default)]/50"
              )}>⚙️</div>
              <h3 className={cn(
                "text-2xl font-serif font-black",
                isInstitutional ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"
              )}>System-Wide Parameters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-6)]">
              {params.map(p => (
                <div key={p.id} className={cn(
                  "p-[var(--space-6)] rounded-[var(--radius-lg)] border transition-all group",
                  isInstitutional 
                    ? "bg-[var(--background)] border-[var(--border-subtle)] hover:border-[var(--accent)]" 
                    : "bg-[var(--surface-elevated)]/40 border-[var(--border-subtle)]/50 hover:border-[var(--text-tertiary)] hover:bg-[var(--surface-elevated)]/80"
                )}>
                  <div className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-[var(--space-2)]">{p.code}</div>
                  <div className={cn(
                    "text-xs font-bold mb-[var(--space-6)] h-8 leading-relaxed",
                    isInstitutional ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"
                  )}>{p.desc}</div>
                  
                  <div className="flex justify-between items-center">
                    {p.type === 'bool' ? (
                      <button 
                        onClick={() => setParams(params.map(x => x.id === p.id ? {...x, value: !x.value} : x))}
                        className={cn(
                          "w-14 h-8 rounded-full transition-all relative",
                          p.value 
                            ? (isInstitutional ? "bg-[var(--accent)]" : "bg-[var(--secondary)] shadow-[0_0_15px_rgba(39,174,96,0.3)]") 
                            : "bg-[var(--surface-elevated)]/50"
                        )}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${p.value ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    ) : (
                      <input 
                        type="text" 
                        value={p.value as string} 
                        className={cn(
                          "rounded-[var(--radius-md)] px-4 py-2 text-xs font-black w-24 text-center outline-none focus:border-[var(--accent)] transition-all",
                          isInstitutional 
                            ? "bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]" 
                            : "bg-[var(--background)]/50 border border-[var(--border-subtle)]/50 text-[var(--text-primary)] focus:bg-[var(--surface-elevated)]"
                        )}
                        onChange={(e) => setParams(params.map(x => x.id === p.id ? {...x, value: e.target.value} : x))}
                      />
                    )}
                    <span className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-tighter">Verified Node</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "rounded-[var(--radius-lg)] p-[var(--space-8)] shadow-2xl relative overflow-hidden border",
            isInstitutional ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]" : "bg-[var(--background)]/60 backdrop-blur-xl border-[var(--border-subtle)]/50 text-[var(--text-primary)]"
          )}>
            {!isInstitutional && <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 blur-[100px]"></div>}
            <h3 className={cn(
              "text-xl font-serif font-black mb-[var(--space-6)] relative z-10",
              isInstitutional ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
            )}>Security Note</h3>
            <p className={cn(
              "text-sm leading-relaxed relative z-10 font-medium",
              isInstitutional ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"
            )}>
              Changes to System Parameters affect all active billing nodes across the SMRITI-OS ecosystem. 
              Always verify <span className="text-[var(--accent)] font-bold">MRP_INCL_TAX</span> settings before starting a new business day.
            </p>
            <div className={cn(
              "mt-[var(--space-8)] p-[var(--space-6)] rounded-[var(--radius-lg)] relative z-10 border",
              isInstitutional ? "bg-[var(--background)] border-[var(--border-subtle)]" : "bg-[var(--surface-elevated)]/50 border-[var(--border-subtle)]/50"
            )}>
              <div className="text-[10px] font-black uppercase text-[var(--text-tertiary)] mb-[var(--space-2)]">Last Audit</div>
              <div className={cn(
                "text-xs font-bold",
                isInstitutional ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"
              )}>14 Aug 2025 · 17:42</div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'brands' && (
        <div className={cn(
          "rounded-[var(--radius-lg)] p-[var(--space-8)] shadow-2xl overflow-hidden border",
          isInstitutional ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]" : "bg-[var(--background)]/40 backdrop-blur-md border-[var(--border-subtle)]/50"
        )}>
          <div className="flex items-center justify-between mb-[var(--space-8)]">
            <div>
              <h3 className={cn(
                "text-2xl font-serif font-black",
                isInstitutional ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"
              )}>Classification Master</h3>
              <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mt-1">Global Catalogue Index</p>
            </div>
          </div>
          
          <div className="h-[400px]">
             <DataTable 
               data={brands}
               columns={brandColumns}
             />
          </div>
        </div>
      )}

      {activeSubTab === 'classification' && (
        <CatalogueDNA />
      )}

      {activeSubTab === 'tax' && <TaxMaster onClose={() => setActiveSubTab('params')} />}
      
      {activeSubTab === 'integrations' && (
        <div className="space-y-[var(--space-8)]">
          <div className={cn(
            "rounded-[var(--radius-lg)] p-[var(--space-8)] shadow-2xl relative overflow-hidden border border-b-8",
            isInstitutional 
              ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)] border-b-[var(--accent)]" 
              : "bg-[var(--background)]/40 backdrop-blur-md border-[var(--border-subtle)]/50 border-b-[var(--accent)]"
          )}>
             <div className="flex justify-between items-start mb-[var(--space-8)]">
                <div>
                   <h3 className={cn(
                     "text-2xl font-serif font-black mb-[var(--space-2)]",
                     isInstitutional ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"
                   )}>Sovereign Store Identity</h3>
                   <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-widest italic">Institutional Profile (Sync Ready)</p>
                </div>
                <div className={cn(
                   "px-4 py-2 text-[9px] font-black uppercase rounded-[var(--radius-sm)] border",
                   isInstitutional 
                     ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20" 
                     : "bg-[var(--secondary)]/10 text-[var(--secondary)] border-[var(--secondary)]/20"
                )}>Verified Identity</div>
             </div>
             
             {loadingStore ? (
                <div className="h-64 flex items-center justify-center">
                  <div className={cn(
                    "w-10 h-10 border-4 border-t-transparent rounded-full animate-spin",
                    isInstitutional ? "border-[var(--accent)]" : "border-[var(--accent)]"
                  )}></div>
                </div>
             ) : (
                <div className="space-y-[var(--space-6)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-6)]">
                     <div className="space-y-[var(--space-2)]">
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-2">Store Name</label>
                        <input 
                          value={storeSettings?.name || ''} 
                          onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
                          className={cn(
                            "w-full rounded-[var(--radius-md)] p-5 text-sm font-black outline-none transition-all",
                            isInstitutional 
                             ? "bg-[var(--background)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent)]" 
                             : "bg-[var(--surface-elevated)]/50 border border-[var(--border-subtle)]/50 text-[var(--text-primary)] focus:border-[var(--accent)]"
                          )} 
                        />
                     </div>
                     <div className="space-y-[var(--space-2)]">
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-2">Site Code (SMRITI-OS ID)</label>
                        <input 
                          value={storeSettings?.code || ''} 
                          onChange={(e) => setStoreSettings({...storeSettings, code: e.target.value})}
                          className={cn(
                            "w-full rounded-[var(--radius-md)] p-5 text-sm font-black outline-none transition-all",
                            isInstitutional 
                             ? "bg-[var(--background)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent)]" 
                             : "bg-[var(--surface-elevated)]/50 border border-[var(--border-subtle)]/50 text-[var(--text-primary)] focus:border-[var(--accent)]"
                          )} 
                        />
                     </div>
                  </div>

                  <div className="space-y-[var(--space-2)]">
                     <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-2">Official Address</label>
                     <textarea 
                       rows={3}
                       value={storeSettings?.address || ''} 
                       onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                       className={cn(
                         "w-full rounded-[var(--radius-md)] p-5 text-sm font-black outline-none resize-none transition-all",
                         isInstitutional 
                           ? "bg-[var(--background)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent)]" 
                           : "bg-[var(--surface-elevated)]/50 border border-[var(--border-subtle)]/50 text-[var(--text-primary)] focus:border-[var(--accent)]"
                       )} 
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-6)]">
                     <div className="space-y-[var(--space-2)]">
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-2">GSTIN</label>
                        <input 
                          value={storeSettings?.gstin || ''} 
                          onChange={(e) => setStoreSettings({...storeSettings, gstin: e.target.value})}
                          className={cn(
                            "w-full rounded-[var(--radius-md)] p-5 text-sm font-black outline-none transition-all",
                            isInstitutional 
                             ? "bg-[var(--background)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent)]" 
                             : "bg-[var(--surface-elevated)]/50 border border-[var(--border-subtle)]/50 text-[var(--text-primary)] focus:border-[var(--accent)]"
                          )} 
                        />
                     </div>
                     <div className="space-y-[var(--space-2)]">
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-2">Phone</label>
                        <input 
                          value={storeSettings?.phone || ''} 
                          onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                          className={cn(
                            "w-full rounded-[var(--radius-md)] p-5 text-sm font-black outline-none transition-all",
                            isInstitutional 
                             ? "bg-[var(--background)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent)]" 
                             : "bg-[var(--surface-elevated)]/50 border border-[var(--border-subtle)]/50 text-[var(--text-primary)] focus:border-[var(--accent)]"
                          )} 
                        />
                     </div>
                     <div className="space-y-[var(--space-2)]">
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-2">State Code</label>
                        <input 
                          value={storeSettings?.state_code || ''} 
                          onChange={(e) => setStoreSettings({...storeSettings, state_code: e.target.value})}
                          placeholder="e.g. 27 for MH"
                          className={cn(
                            "w-full rounded-[var(--radius-md)] p-5 text-sm font-black outline-none transition-all",
                            isInstitutional 
                             ? "bg-[var(--background)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent)]" 
                             : "bg-[var(--surface-elevated)]/50 border border-[var(--border-subtle)]/50 text-[var(--text-primary)] focus:border-[var(--accent)]"
                          )} 
                        />
                     </div>
                  </div>

                  <div className="flex justify-end pt-[var(--space-4)]">
                     <button 
                       onClick={handleUpdateStore}
                       className={cn(
                         "px-12 py-5 rounded-[var(--radius-md)] text-xs font-black uppercase tracking-widest transition-all shadow-xl",
                         isInstitutional 
                           ? "bg-[var(--accent)] text-white hover:opacity-90" 
                           : "bg-[var(--accent)] text-[var(--background)] hover:opacity-90 shadow-[var(--accent)]/20"
                       )}
                     >
                       Update Store Profile [F10]
                     </button>
                  </div>
                </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-8)]">
          <div className={cn(
            "rounded-[var(--radius-lg)] p-[var(--space-8)] shadow-2xl relative overflow-hidden border border-b-8",
            isInstitutional 
              ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)] border-b-[var(--secondary)]" 
              : "bg-[var(--background)]/40 backdrop-blur-md border-[var(--border-subtle)]/50 border-b-8 border-b-[var(--secondary)]"
          )}>
            <div className="text-4xl mb-[var(--space-6)]">📊</div>
            <h3 className={cn(
              "text-2xl font-serif font-black mb-[var(--space-4)]",
              isInstitutional ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"
            )}>SMRITI-OS Bridge</h3>
            <p className={cn(
              "text-sm font-medium leading-relaxed mb-[var(--space-8)]",
              isInstitutional ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"
            )}>
              Generate institutional XML vouchers for seamless synchronization with external accounting. 
              Supports Sales Vouchers, Stock Journals, and Master Imports.
            </p>
            <div className="flex gap-[var(--space-4)]">
              <button 
                onClick={async () => {
                  try {
                    const data = await api.integration.exportTally('2026-01-01', '2026-12-31')
                    alert(`Generated Institutional XML with ${data.bill_count} vouchers.\nFile: ${data.filename}`)
                  } catch (e) {
                    alert('Failed to generate Institutional XML.')
                  }
                }}
                className={cn(
                  "px-8 py-4 rounded-[var(--radius-md)] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl",
                  isInstitutional ? "bg-[var(--accent)] text-white" : "bg-[var(--secondary)] text-white hover:opacity-90"
                )}
              >
                GENERATE SALES XML
              </button>
            </div>
          </div>

          <div className={cn(
            "rounded-[var(--radius-lg)] p-[var(--space-8)] shadow-2xl relative overflow-hidden border border-b-8",
            isInstitutional 
              ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)] border-b-[var(--accent)]" 
              : "bg-[var(--background)]/40 backdrop-blur-md border-[var(--border-subtle)]/50 border-b-8 border-b-[var(--accent)]"
          )}>
            <div className="text-4xl mb-[var(--space-6)]">📲</div>
            <h3 className={cn(
              "text-2xl font-serif font-black mb-[var(--space-4)]",
              isInstitutional ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"
            )}>PDT Import (Legacy)</h3>
            <p className={cn(
              "text-sm font-medium leading-relaxed mb-[var(--space-8)]",
              isInstitutional ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"
            )}>
              Bulk update your catalogue using Portable Data Terminal (PDT) flat files. 
              Essential for high-volume store audits and warehouse inwards.
            </p>
            <input 
              type="file" 
              id="pdt-upload" 
              className="hidden" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const data = await api.integration.importPDT(file)
                  alert(data.message);
                } catch (e) {
                  alert('Failed to import PDT file.')
                }
              }}
            />
            <label 
              htmlFor="pdt-upload"
              className="bg-[var(--accent)] text-[var(--background)] px-8 py-4 rounded-[var(--radius-md)] text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl cursor-pointer inline-block"
            >
              UPLOAD PDT (.CSV)
            </label>
          </div>
        </div>
        </div>
      )}
      {activeSubTab === 'labels' && (
        <div className={cn(
          "rounded-[var(--radius-lg)] p-[var(--space-8)] shadow-2xl border",
          isInstitutional ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]" : "bg-[var(--background)]/40 backdrop-blur-md border-[var(--border-subtle)]/50"
        )}>
          <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-8)]">
            <div className={cn(
              "w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center text-xl shadow-lg border",
              isInstitutional ? "bg-[var(--background)] border-[var(--border-subtle)]" : "bg-[var(--surface-elevated)] border-[var(--border-default)]/50"
            )}>🏷️</div>
            <div>
              <h3 className={cn(
                "text-2xl font-serif font-black",
                isInstitutional ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"
              )}>Label Management</h3>
              <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mt-1">Override Institutional Shoper 9 Defaults</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-6)]">
            {[
              { key: 'billing', current: 'Billing (POS)', default: 'Sales' },
              { key: 'inward', current: 'Inward (GRN)', default: 'Procurement' },
              { key: 'outward', current: 'Outward (Returns)', default: 'Stock Movement' },
              { key: 'masters', current: 'Masters (Registry)', default: 'Catalogue' },
              { key: 'audit', current: 'Audit / Reconcile', default: 'Stock Reconciliation' },
              { key: 'khazana', current: 'Khazana', default: 'Inventory' },
            ].map(label => (
              <div key={label.key} className={cn(
                "p-[var(--space-6)] rounded-[var(--radius-lg)] border group transition-all",
                isInstitutional 
                  ? "bg-[var(--background)] border-[var(--border-subtle)] hover:border-[var(--accent)]" 
                  : "bg-[var(--surface-elevated)]/40 border-[var(--border-subtle)]/50 hover:bg-[var(--surface-elevated)]/80"
              )}>
                <div className="flex justify-between items-center mb-[var(--space-4)]">
                  <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">{label.key}</span>
                  <span className={cn(
                    "text-[9px] font-black px-2 py-1 rounded-[var(--radius-sm)] uppercase border",
                    isInstitutional 
                      ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20" 
                      : "bg-[var(--secondary)]/10 text-[var(--secondary)] border-[var(--secondary)]/20"
                  )}>SMRITI-OS Preset</span>
                </div>
                <div className="space-y-[var(--space-4)]">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-tighter">Current Label</label>
                    <input 
                      type="text" 
                      defaultValue={label.current}
                      className={cn(
                        "w-full rounded-[var(--radius-md)] p-4 text-sm font-black outline-none transition-all",
                        isInstitutional 
                          ? "bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent)]" 
                          : "bg-[var(--background)]/50 border border-[var(--border-subtle)]/50 text-[var(--text-primary)] focus:border-[var(--accent)]"
                      )}
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] font-medium italic opacity-70">Global Default: {label.default}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={cn(
            "mt-[var(--space-8)] p-[var(--space-6)] rounded-[var(--radius-lg)] flex justify-between items-center border",
            isInstitutional 
              ? "bg-[var(--background)] border-[var(--border-subtle)]" 
              : "bg-[var(--surface-elevated)] border-[var(--border-subtle)]/50 text-[var(--text-primary)] shadow-2xl"
          )}>
            <div>
              <h4 className={cn(
                "text-lg font-serif font-black",
                isInstitutional ? "text-[var(--accent)]" : "text-[var(--accent)]"
              )}>Sovereign Dictionary Sync</h4>
              <p className={cn(
                "text-xs font-medium",
                isInstitutional ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"
              )}>Updates will propagate to all terminals on next restart.</p>
            </div>
            <button className={cn(
              "px-10 py-4 rounded-[var(--radius-md)] text-[10px] font-black uppercase tracking-widest transition-all",
              isInstitutional 
                ? "bg-[var(--accent)] text-white shadow-md" 
                : "bg-[var(--accent)] text-[var(--background)] shadow-2xl hover:opacity-90"
            )}>
              SAVE & PUSH UPDATES
            </button>
          </div>
        </div>
      )}
      {activeSubTab === 'personalization' && (
        <div className={cn(
          "rounded-[var(--radius-lg)] p-[var(--space-8)] shadow-2xl border",
          isInstitutional ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]" : "bg-[var(--background)]/40 backdrop-blur-md border-[var(--border-subtle)]/50"
        )}>
          <Personalization />
        </div>
      )}
      {activeSubTab === 'browsers' && (
        <BrowseCustomizer />
      )}
    </div>
  )
}
