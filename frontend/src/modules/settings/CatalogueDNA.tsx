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
import { Dna, Tag, AlertCircle, Save, RefreshCw, Layers, CheckSquare } from 'lucide-react';
import { api } from '@/api/client';

export default function CatalogueDNA() {
  const [aliases, setAliases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAliases();
  }, []);

  const fetchAliases = async () => {
    try {
      setLoading(true);
      const data = await api.config.listAttributeAliases();
      // Fill missing slots for ANAL_CODE 1-10 for initialization
      const slots = Array.from({ length: 10 }, (_, i) => {
        const existing = data.find((a: any) => a.code_type === 'ANAL_CODE' && a.code_index === i + 1);
        return existing || { code_type: 'ANAL_CODE', code_index: i + 1, alias_name: '', is_mandatory: false, lookup_category: '' };
      });
      setAliases(slots);
    } catch (err) {
      console.error("Failed to fetch aliases", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (alias: any) => {
    if (!alias.alias_name) return;
    try {
      setSaving(true);
      await api.config.upsertAttributeAlias(alias);
    } catch (err) {
      console.error("Failed to save alias", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h2 className="text-3xl font-serif font-black text-white flex items-center gap-4">
            <Dna className="w-8 h-8 text-emerald-400" />
            Catalogue DNA (AnalCodes)
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Parity with Shoper 9 CatalogSettings</p>
        </div>
        
        <div className="px-6 py-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
          <AlertCircle className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Master Attribute Definitions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {aliases.map((alias, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={`${alias.code_type}-${alias.code_index}`}
            className="p-8 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-md border border-slate-700/50 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-[10px] font-black text-emerald-400 border border-slate-700">
                  #{alias.code_index}
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Shoper Identifier</div>
                  <div className="text-xs font-bold text-white uppercase">{alias.code_type} {alias.code_index}</div>
                </div>
              </div>
              <button 
                onClick={() => handleSave(alias)}
                className={`p-3 rounded-xl transition-all ${saving ? 'bg-slate-800' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Human-Readable Alias (Caption)</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="text" 
                    placeholder="e.g. Fabric, Season, Style Group"
                    value={alias.alias_name}
                    onChange={(e) => {
                      const newAliases = [...aliases];
                      newAliases[i].alias_name = e.target.value;
                      setAliases(newAliases);
                    }}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 pl-12 text-sm font-black text-white outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckSquare className={`w-4 h-4 ${alias.is_mandatory ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase">Mandatory</span>
                  </div>
                  <button 
                    onClick={() => {
                      const newAliases = [...aliases];
                      newAliases[i].is_mandatory = !newAliases[i].is_mandatory;
                      setAliases(newAliases);
                      handleSave(newAliases[i]);
                    }}
                    className={`w-10 h-5 rounded-full transition-all relative ${alias.is_mandatory ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${alias.is_mandatory ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex items-center gap-3 group/lookup cursor-pointer hover:border-emerald-500/50 transition-all">
                  <Layers className="w-4 h-4 text-slate-600 group-hover/lookup:text-emerald-400" />
                  <div className="flex-1">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lookup Registry</div>
                    <input 
                      type="text"
                      placeholder="e.g. FABRIC_TYPE"
                      value={alias.lookup_category || ''}
                      onChange={(e) => {
                        const newAliases = [...aliases];
                        newAliases[i].lookup_category = e.target.value;
                        setAliases(newAliases);
                      }}
                      onBlur={() => handleSave(aliases[i])}
                      className="bg-transparent border-none p-0 text-[10px] font-bold text-white outline-none w-full placeholder:text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-10 bg-slate-900/60 rounded-[3rem] border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <AlertCircle size={80} className="text-emerald-400" />
        </div>
        <h3 className="text-xl font-serif font-black text-white mb-4">DNA Integrity Warning</h3>
        <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-2xl">
          Changing the **Catalogue Alias** will update all search results, reporting headers, and item creation forms globally. 
          If you change an alias, ensure your <span className="text-emerald-400 font-bold underline">General Lookup</span> tables are updated to match the new taxonomy.
        </p>
      </div>
    </div>
  );
}




