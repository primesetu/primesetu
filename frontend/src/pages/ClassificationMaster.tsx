/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * ============================================================ */
import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { 
  Plus, Search, Save, Trash2, Filter, 
  Settings, Layers, Briefcase, Tag, Percent
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ClassificationMaster() {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    class1cd: '',
    class2cd: '',
    superclass1: '0',
    superclass2: '0',
    sizegroup: '',
    prodtaxtype: '',
    prefvendorid: '',
    retailmarkup: 0,
    batchapplicable: 0,
    gradeapplicable: 0,
    locationapplicable: 0
  });

  const [masters, setMasters] = useState<{
    brands: any[], products: any[], sections: any[], vendors: any[]
  }>({
    brands: [], products: [], sections: [], vendors: []
  });

  useEffect(() => {
    fetchData();
    fetchMasters();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.legacy.getData('class12combo');
      setCombos(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchMasters = async () => {
    try {
      const [p, b, s, v] = await Promise.all([
        api.legacy.getData('genlookup', { filters: JSON.stringify({ recid: 1 }) }),
        api.legacy.getData('genlookup', { filters: JSON.stringify({ recid: 2 }) }),
        api.legacy.getData('genlookup', { filters: JSON.stringify({ recid: 68 }) }),
        api.legacy.getData('vendors')
      ]);
      setMasters({
        products: p.data,
        brands: b.data,
        sections: s.data,
        vendors: v.data
      });
    } catch (e) { console.error("Failed to fetch masters", e); }
  };

  const [sizeList, setSizeList] = useState('');

  const handleSave = async () => {
    try {
      // 1. Save the Combo
      await api.legacy.saveMaster('class12combo', formData);
      
      // 2. If sizes provided, sync them to SizeCat
      if (sizeList) {
        const sizes = sizeList.split(',').map(s => s.trim()).filter(s => s);
        const sizePayload = sizes.map(sz => ({
          class1cd: formData.class1cd,
          class2cd: formData.class2cd,
          sizecd: sz,
          active: true // Default to active
        }));
        
        // Use bulkUpsert for SizeCat
        await api.legacy.bulkUpsert('sizecat', sizePayload);
      }
      
      setIsFormOpen(false);
      fetchData();
    } catch (e) { alert("Failed to save combination or sizes"); }
  };

  const filtered = combos.filter(c => 
    c.class1cd?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.class2cd?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.superclass1?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-surface text-foreground font-sans">
      {/* Header */}
      <div className="flex-shrink-0 h-20 border-b border-outline-variant px-8 flex items-center justify-between bg-surface-container/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Layers className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Classification Manager</h1>
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Manage Product-Brand-Section Combinations</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={14} />
            <input 
              type="text" 
              placeholder="Search combinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-64 pl-10 pr-4 bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs font-bold uppercase transition-all"
            />
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="h-10 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={14} />
            New Combo
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((combo, idx) => (
              <div 
                key={idx}
                className="group relative bg-surface-container/50 border border-outline-variant p-5 hover:border-primary/50 hover:bg-surface-container transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{combo.class2cd}</span>
                    <h3 className="text-lg font-black uppercase tracking-tight leading-tight">{combo.class1cd}</h3>
                  </div>
                  <div className="px-2 py-1 bg-primary/10 border border-primary/20 text-[8px] font-black uppercase text-primary">
                    {combo.sizegroup}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-outline">
                    <Tag size={12} />
                    Section: <span className="text-foreground">{combo.superclass1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-outline">
                    <Briefcase size={12} />
                    Vendor: <span className="text-foreground">{combo.prefvendorid || 'None'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-outline">
                    <Percent size={12} />
                    Tax: <span className="text-foreground">{combo.prodtaxtype}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-outline-variant">
                  {combo.batchapplicable === 1 && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-black rounded uppercase">Batch</span>}
                  {combo.gradeapplicable === 1 && <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black rounded uppercase">Grade</span>}
                  {combo.locationapplicable === 1 && <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded uppercase">Location</span>}
                </div>

                <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-outline hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-surface border border-outline-variant shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant pb-4">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-primary">Establish Combination</h3>
                <p className="text-[10px] font-bold text-outline uppercase">Define a new Product-Brand relation</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-outline hover:text-white">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-outline">Product (Class 1)</label>
                <select 
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs font-bold"
                  value={formData.class1cd}
                  onChange={(e) => setFormData({...formData, class1cd: e.target.value})}
                >
                  <option value="">Select Product</option>
                  {masters.products.map(p => <option key={p.code} value={p.code}>{p.descr}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-outline">Brand (Class 2)</label>
                <select 
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs font-bold"
                  value={formData.class2cd}
                  onChange={(e) => setFormData({...formData, class2cd: e.target.value})}
                >
                  <option value="">Select Brand</option>
                  {masters.brands.map(b => <option key={b.code} value={b.code}>{b.descr}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-outline">Section (SuperClass 1)</label>
                <select 
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs font-bold"
                  value={formData.superclass1}
                  onChange={(e) => setFormData({...formData, superclass1: e.target.value})}
                >
                  <option value="0">General Section</option>
                  {masters.sections.map(s => <option key={s.code} value={s.code}>{s.descr}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-outline">Size Group</label>
                <input 
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs font-bold uppercase"
                  placeholder="e.g. MENS_UK"
                  value={formData.sizegroup}
                  onChange={(e) => setFormData({...formData, sizegroup: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-outline">Tax Category</label>
                <input 
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs font-bold"
                  placeholder="e.g. GST18"
                  value={formData.prodtaxtype}
                  onChange={(e) => setFormData({...formData, prodtaxtype: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-outline">Preferred Vendor</label>
                <select 
                  className="w-full h-11 px-4 bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs font-bold"
                  value={formData.prefvendorid}
                  onChange={(e) => setFormData({...formData, prefvendorid: e.target.value})}
                >
                  <option value="">Select Vendor</option>
                  {masters.vendors.map(v => <option key={v.code} value={v.code}>{v.name || v.descr}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-primary">Valid Sizes (Comma Separated)</label>
              <textarea 
                className="w-full h-20 p-4 bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs font-mono font-bold leading-relaxed"
                placeholder="6, 7, 8, 9, 10, 11"
                value={sizeList}
                onChange={(e) => setSizeList(e.target.value)}
              />
              <p className="text-[8px] text-outline italic">These sizes will be saved to the SizeCat table for this combo.</p>
            </div>

            <div className="p-4 bg-surface-container/50 border border-outline-variant space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-outline">Control Flags</span>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.batchapplicable === 1}
                    onChange={(e) => setFormData({...formData, batchapplicable: e.target.checked ? 1 : 0})}
                    className="w-4 h-4 rounded bg-surface border-outline-variant text-primary"
                  />
                  <span className="text-[10px] font-black uppercase text-outline group-hover:text-foreground">Batch Track</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.gradeapplicable === 1}
                    onChange={(e) => setFormData({...formData, gradeapplicable: e.target.checked ? 1 : 0})}
                    className="w-4 h-4 rounded bg-surface border-outline-variant text-primary"
                  />
                  <span className="text-[10px] font-black uppercase text-outline group-hover:text-foreground">Grade Track</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setIsFormOpen(false)}
                className="flex-1 h-12 border border-outline-variant text-[10px] font-black uppercase hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-[2] h-12 bg-primary text-white text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <Save size={14} />
                Save Master
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
