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
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout, Columns, Save, RefreshCw, Eye, EyeOff, Lock, Unlock, Type, ChevronRight } from 'lucide-react';
import { api } from '@/api/client';

const SCREENS = [
  { id: 'BILLING', label: 'Billing Terminal' },
  { id: 'ITEM_MASTER', label: 'Item Master Search' },
  { id: 'CUSTOMER_SEARCH', label: 'Customer Lookup' },
  { id: 'STOCK_LEDGER', label: 'Stock Movement Grid' }
];

export default function BrowseCustomizer() {
  const [selectedScreen, setSelectedScreen] = useState('BILLING');
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFields();
  }, [selectedScreen]);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const data = await api.config.getUIFields(selectedScreen);
      setFields(data);
    } catch (err) {
      console.error("Failed to fetch UI fields", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field: any) => {
    try {
      setSaving(true);
      await api.config.upsertUIField(field);
    } catch (err) {
      console.error("Failed to update field", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h2 className="text-3xl font-serif font-black text-white flex items-center gap-4">
            <Layout className="w-8 h-8 text-brand-saffron" />
            Browse Customization
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Parity with Shoper 9 BrowseSettings</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-slate-900/50 rounded-2xl border border-slate-700/50">
          {SCREENS.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedScreen(s.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedScreen === s.id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-1 shadow-2xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/40 text-[9px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-700/50">
              <tr>
                <th className="px-8 py-6">Field / ID</th>
                <th className="px-6 py-6">Display Label</th>
                <th className="px-6 py-6 text-center">Width (px)</th>
                <th className="px-6 py-6 text-center">Visibility</th>
                <th className="px-6 py-6 text-center">Editable</th>
                <th className="px-6 py-6 text-center">Mandatory</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <RefreshCw className="w-8 h-8 text-brand-saffron animate-spin mx-auto mb-4" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Consulting Registry...</span>
                  </td>
                </tr>
              ) : fields.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-bold">No custom fields defined for this screen.</p>
                    <button className="mt-4 text-brand-saffron text-[10px] font-black uppercase tracking-widest underline">+ Initialize Defaults</button>
                  </td>
                </tr>
              ) : (
                fields.map((field, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={field.id} 
                    className="hover:bg-slate-800/30 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="font-black text-white text-xs">{field.field_name}</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-tighter">RECID: {field.shoper_recid || 'NEW'}</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="relative group/input">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 group-focus-within/input:text-brand-saffron transition-colors" />
                        <input 
                          type="text"
                          defaultValue={field.display_label || field.field_name}
                          className="bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-white outline-none focus:border-brand-saffron w-full transition-all"
                          onBlur={(e) => handleUpdate({ ...field, display_label: e.target.value })}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <input 
                        type="number"
                        defaultValue={field.column_width}
                        className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-2 py-2 text-xs font-black text-white w-20 text-center outline-none focus:border-brand-saffron"
                        onBlur={(e) => handleUpdate({ ...field, column_width: parseInt(e.target.value) })}
                      />
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button 
                        onClick={() => handleUpdate({ ...field, is_visible: !field.is_visible })}
                        className={`p-2 rounded-lg transition-all ${field.is_visible ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'}`}
                      >
                        {field.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button 
                        onClick={() => handleUpdate({ ...field, is_editable: !field.is_editable })}
                        className={`p-2 rounded-lg transition-all ${field.is_editable ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 bg-slate-800'}`}
                      >
                        {field.is_editable ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <button 
                        onClick={() => handleUpdate({ ...field, is_mandatory: !field.is_mandatory })}
                        className={`w-12 h-6 rounded-full transition-all relative ${field.is_mandatory ? 'bg-amber-500 shadow-lg shadow-amber-500/20' : 'bg-slate-800'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${field.is_mandatory ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                       {saving ? <RefreshCw className="w-4 h-4 text-brand-saffron animate-spin inline" /> : <Save className="w-4 h-4 text-slate-600 group-hover:text-brand-saffron cursor-pointer" />}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-end items-center gap-6 p-8 bg-slate-900/60 rounded-[2.5rem] border border-slate-700/50">
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sovereign State</p>
          <p className="text-xs font-bold text-slate-400">All changes propagate to nodes in real-time.</p>
        </div>
        <button className="bg-brand-saffron text-slate-900 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-brand-saffron/20 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> SYNC ALL TERMINALS
        </button>
      </div>
    </div>
  );
}




