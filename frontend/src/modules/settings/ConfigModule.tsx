/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import { useState } from 'react'
import TaxMaster from './TaxMaster'
import Personalization from './Personalization'
import { api } from '@/api/client'

export default function ConfigModule() {
  const [activeSubTab, setActiveSubTab] = useState<'params' | 'classification' | 'brands' | 'tax' | 'integrations' | 'labels' | 'personalization'>('params')
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

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-white">Sovereign Control</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Managing Institutional Parameters & ItemMaster DNA</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-700/50 flex-wrap gap-1">
          {[
            { id: 'params', label: 'Parameters' },
            { id: 'classification', label: 'Item DNA' },
            { id: 'brands', label: 'Catalogue' },
            { id: 'tax', label: 'Tax Master' },
            { id: 'labels', label: 'Label Management' },
            { id: 'integrations', label: 'Corporate Bridge' },
            { id: 'personalization', label: '🎨 Personalization' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-slate-800 text-white shadow-lg border border-slate-600/50' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'params' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl border border-slate-700/50">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-lg border border-slate-600/50">⚙️</div>
              <h3 className="text-2xl font-serif font-black text-white">System-Wide Parameters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {params.map(p => (
                <div key={p.id} className="p-8 rounded-[2.5rem] bg-slate-800/40 border border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/80 transition-all group">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{p.code}</div>
                  <div className="text-xs font-bold text-slate-300 mb-6 h-8 leading-relaxed">{p.desc}</div>
                  
                  <div className="flex justify-between items-center">
                    {p.type === 'bool' ? (
                      <button 
                        onClick={() => setParams(params.map(x => x.id === p.id ? {...x, value: !x.value} : x))}
                        className={`w-14 h-8 rounded-full transition-all relative ${p.value ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-700/50'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${p.value ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    ) : (
                      <input 
                        type="text" 
                        value={p.value as string} 
                        className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-xs font-black text-white w-24 text-center outline-none focus:border-brand-saffron focus:bg-slate-800"
                      />
                    )}
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Verified Node</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-slate-700/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-saffron/10 blur-[100px]"></div>
            <h3 className="text-xl font-serif font-black mb-6 relative z-10 text-white">Security Note</h3>
            <p className="text-sm text-slate-400 leading-relaxed relative z-10 font-medium">
              Changes to System Parameters affect all active billing nodes across the PrimeSetu ecosystem. 
              Always verify <span className="text-brand-gold font-bold">MRP_INCL_TAX</span> settings before starting a new business day.
            </p>
            <div className="mt-12 p-6 bg-slate-800/50 rounded-3xl relative z-10 border border-slate-700/50">
              <div className="text-[10px] font-black uppercase text-slate-500 mb-2">Last Audit</div>
              <div className="text-xs font-bold text-white">14 Aug 2025 · 17:42</div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'brands' && (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl overflow-hidden border border-slate-700/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-serif font-black text-white">Classification Master</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Class1 (Brand) & Class2 (Dept) Repository</p>
            </div>
            <button className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-black tracking-widest hover:bg-slate-700 transition-all shadow-xl border border-slate-600/50">
              + NEW CLASSIFICATION
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/40 text-[9px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-700/50">
                <tr>
                  <th className="px-8 py-5">Brand Name</th>
                  <th className="px-8 py-5">Main Category</th>
                  <th className="px-8 py-5 text-center">Active SKUs</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {brands.map(brand => (
                  <tr key={brand.id} className="hover:bg-slate-800/30 transition-all group">
                    <td className="px-8 py-6 font-bold text-white">{brand.name}</td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">{brand.category}</td>
                    <td className="px-8 py-6 text-center font-black text-white">{brand.skus}</td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-emerald-500/20">
                        {brand.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'tax' && <TaxMaster onClose={() => setActiveSubTab('params')} />}
      
      {activeSubTab === 'integrations' && (
        <div className="space-y-10">
          <div className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl relative overflow-hidden border border-slate-700/50 border-b-8 border-b-brand-saffron">
             <div className="flex justify-between items-start mb-10">
                <div>
                   <h3 className="text-2xl font-serif font-black text-white mb-2">Sovereign Store Identity</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">PST Node PST-X01 Active</p>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase rounded-lg border border-emerald-500/20">Verified Identity</div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Store ID</label>
                   <input defaultValue="ST-001" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 text-sm font-black text-white outline-none focus:border-brand-saffron" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Site Code</label>
                   <input defaultValue="SITE-BANGALORE-MAIN" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 text-sm font-black text-white outline-none focus:border-brand-saffron" />
                </div>
                <div className="flex items-end pb-1">
                   <button className="w-full bg-slate-800 text-white p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-xl border border-slate-600/50">Update Node Config</button>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl relative overflow-hidden border border-slate-700/50 border-b-8 border-b-emerald-500">
            <div className="text-4xl mb-6">📊</div>
            <h3 className="text-2xl font-serif font-black text-white mb-4">Tally.ERP 9 Bridge</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10">
              Generate institutional XML vouchers for seamless synchronization with Tally accounting. 
              Supports Sales Vouchers, Stock Journals, and Master Imports.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={async () => {
                  try {
                    const data = await api.integration.exportTally('2026-01-01', '2026-12-31')
                    alert(`Generated Tally XML with ${data.bill_count} vouchers.\nFile: ${data.filename}`)
                  } catch (e) {
                    alert('Failed to generate Tally XML.')
                  }
                }}
                className="bg-emerald-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl"
              >
                GENERATE SALES XML
              </button>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl relative overflow-hidden border border-slate-700/50 border-b-8 border-b-brand-gold">
            <div className="text-4xl mb-6">📲</div>
            <h3 className="text-2xl font-serif font-black text-white mb-4">PDT Import (Legacy)</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10">
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
              className="bg-brand-gold text-slate-900 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl cursor-pointer inline-block"
            >
              UPLOAD PDT (.CSV)
            </label>
          </div>
        </div>
        </div>
      )}
      {activeSubTab === 'labels' && (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl border border-slate-700/50">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-lg border border-slate-600/50">🏷️</div>
            <div>
              <h3 className="text-2xl font-serif font-black text-white">Label Management</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Override Institutional Shoper 9 Defaults</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { key: 'billing', current: 'Billing (POS)', default: 'Sales' },
              { key: 'inward', current: 'Inward (GRN)', default: 'Procurement' },
              { key: 'outward', current: 'Outward (Returns)', default: 'Stock Movement' },
              { key: 'masters', current: 'Masters (Registry)', default: 'Catalogue' },
              { key: 'audit', current: 'Audit / Reconcile', default: 'Stock Reconciliation' },
              { key: 'khazana', current: 'Khazana', default: 'Inventory' },
            ].map(label => (
              <div key={label.key} className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/50 group hover:bg-slate-800/80 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label.key}</span>
                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md uppercase">Shoper 9 Preset</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Label</label>
                    <input 
                      type="text" 
                      defaultValue={label.current}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-sm font-black text-white outline-none focus:border-brand-saffron"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium italic">Global Default: {label.default}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-slate-800 border border-slate-700/50 rounded-[2rem] text-white flex justify-between items-center">
            <div>
              <h4 className="text-lg font-serif font-black text-brand-gold">Sovereign Dictionary Sync</h4>
              <p className="text-xs text-slate-400 font-medium">Updates will propagate to all terminals on next restart.</p>
            </div>
            <button className="bg-brand-gold text-slate-900 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-2xl">
              SAVE & PUSH UPDATES
            </button>
          </div>
        </div>
      )}
      {activeSubTab === 'personalization' && (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl border border-slate-700/50">
          <Personalization />
        </div>
      )}
    </div>
  )
}
