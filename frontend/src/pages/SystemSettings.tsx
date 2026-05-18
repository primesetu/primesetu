/* ============================================================
 * SMRITI-OS — System Parameter Hub
 * Sovereign · Zero Cloud · AI-Governed
 * Full parity with Shoper9 SysParam (828 parameters)
 * ============================================================ */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings, Save, Search, RefreshCw, Info,
  Database, ChevronRight, Layers, ToggleLeft,
  ToggleRight, Hash, Type, Percent, Lock, AlertTriangle,
  ShoppingCart, Truck, CheckCircle2, XCircle, Eye, EyeOff
} from 'lucide-react';
import { apiClient } from '@/api/client';
import { cn } from '@/lib/utils';

/* ── Types ─────────────────────────────────────────────────── */
interface SysParam {
  param_code: string;
  origin_id?: string;
  descr?: string;
  opt_type?: string;         // B | I | T | S | C
  value_txt?: string;
  value_bool: boolean;
  value_int: number;
  value_float?: number;
  category?: string;
  cat_descr?: string;
  disp_order?: number;
  fixed_type?: string;       // Variable | Hidden | One Time | Installation
}

interface Category {
  category: string;
  cat_descr: string;
  count: number;
}

/* ── Helpers ────────────────────────────────────────────────── */
const OPT_ICON: Record<string, React.ReactNode> = {
  B: <ToggleLeft size={12} />,
  I: <Hash size={12} />,
  S: <Percent size={12} />,
  C: <Percent size={12} />,
  T: <Type size={12} />,
};

function getActiveValue(p: SysParam): string {
  const opt = p.opt_type?.toUpperCase() ?? 'T';
  if (opt === 'B') return p.value_bool ? 'Yes' : 'No';
  if (opt === 'I') return String(p.value_int ?? 0);
  if (opt === 'S' || opt === 'C') return String(p.value_float ?? 0);
  return p.value_txt ?? '';
}

const CATEGORY_COLORS: Record<string, string> = {
  '01': 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  '02': 'text-violet-400 border-violet-400/30 bg-violet-400/5',
  '03': 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
  '04': 'text-amber-400 border-amber-400/30 bg-amber-400/5',
  '05': 'text-pink-400 border-pink-400/30 bg-pink-400/5',
  '06': 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5',
  '07': 'text-orange-400 border-orange-400/30 bg-orange-400/5',
  '08': 'text-lime-400 border-lime-400/30 bg-lime-400/5',
  '09': 'text-teal-400 border-teal-400/30 bg-teal-400/5',
  '10': 'text-rose-400 border-rose-400/30 bg-rose-400/5',
  '11': 'text-indigo-400 border-indigo-400/30 bg-indigo-400/5',
  '12': 'text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-400/5',
  '13': 'text-sky-400 border-sky-400/30 bg-sky-400/5',
  '14': 'text-green-400 border-green-400/30 bg-green-400/5',
  '15': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
  '16': 'text-red-400 border-red-400/30 bg-red-400/5',
  '17': 'text-purple-400 border-purple-400/30 bg-purple-400/5',
};

function getCatColor(category: string) {
  const prefix = category?.match(/^(\d+)/)?.[1]?.padStart(2, '0') ?? 'XX';
  return CATEGORY_COLORS[prefix] ?? 'text-outline border-outline/30 bg-surface-container';
}

/* ── Main Component ─────────────────────────────────────────── */
const SystemSettings: React.FC = () => {
  const [params, setParams] = useState<SysParam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [oneTimeUpdated, setOneTimeUpdated] = useState<string[]>([]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Data Fetching ──────────────────────────────────────── */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiClient.get('/config/sysparam/categories');
      setCategories(res.data);
      if (res.data.length > 0 && !activeCategory) {
        setActiveCategory(res.data[0].category);
      }
    } catch { /* silent */ }
  }, []);

  const fetchParams = useCallback(async () => {
    if (!activeCategory) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/config/sysparam', {
        params: { category: activeCategory }
      });
      setParams(res.data);
    } catch {
      showToast('Failed to fetch parameters', false);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchParams(); }, [activeCategory]);

  /* ── Seed Handler ───────────────────────────────────────── */
  const handleSeed = async (profile: 'retail' | 'distributor') => {
    if (!window.confirm(`This will load all 828 SMRITI default parameters for the "${profile.toUpperCase()}" profile.\n\nExisting parameters will NOT be overwritten. Continue?`)) return;
    setSeeding(profile);
    try {
      const res = await apiClient.post(`/config/sysparam/import-legacy?profile=${profile}`);
      const { inserted, skipped, total } = res.data;
      showToast(`✓ ${profile.toUpperCase()} defaults loaded: ${inserted} inserted, ${skipped} skipped (${total} total)`);
      await fetchCategories();
      await fetchParams();
    } catch (e: any) {
      showToast(`Seed failed: ${e?.response?.data?.detail ?? e.message}`, false);
    } finally {
      setSeeding(null);
    }
  };

  /* ── Save Handler ───────────────────────────────────────── */
  const handleUpdate = async (param: SysParam, updates: Record<string, any>) => {
    if (param.fixed_type === 'One Time') {
      const confirmChange = window.confirm(
        `⚠️ Warning: "${param.param_code}" is a ONE-TIME configuration parameter.\n\nOnce set, it CANNOT be modified again during this active session. Do you want to proceed?`
      );
      if (!confirmChange) return;
    }

    setSaving(param.param_code);
    try {
      await apiClient.patch(`/config/sysparam/${param.param_code}`, updates);
      setParams(prev => prev.map(p => p.param_code === param.param_code ? { ...p, ...updates } : p));
      
      if (param.fixed_type === 'One Time') {
        setOneTimeUpdated(prev => [...prev, param.param_code]);
      }
      
      showToast(`Saved: ${param.param_code}`);
    } catch {
      showToast(`Failed to save: ${param.param_code}`, false);
    } finally {
      setSaving(null);
    }
  };

  /* ── Filtered Params ────────────────────────────────────── */
  const filtered = params.filter(p => {
    const matchSearch = !search
      || p.param_code.toLowerCase().includes(search.toLowerCase())
      || (p.descr ?? '').toLowerCase().includes(search.toLowerCase());
    const matchHidden = showHidden || p.fixed_type !== 'Hidden';
    return matchSearch && matchHidden;
  }).sort((a, b) => (a.disp_order ?? 0) - (b.disp_order ?? 0));

  const catColor = activeCategory ? getCatColor(activeCategory) : '';

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-background text-foreground font-sans overflow-hidden">

      {/* ── Toast ── */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold border animate-in slide-in-from-top-4 duration-300",
          toast.ok ? "bg-emerald-950 border-emerald-500/30 text-emerald-400" : "bg-red-950 border-red-500/30 text-red-400"
        )}>
          {toast.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex-shrink-0 h-20 border-b border-outline-variant px-6 flex items-center justify-between bg-surface-container/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Settings className="text-primary" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">System Parameters</h1>
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              SMRITI-Parity · 828 Configuration Points · Sovereign Control
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Hidden toggle */}
          <button
            onClick={() => setShowHidden(!showHidden)}
            title={showHidden ? "Hide locked params" : "Show hidden params"}
            className={cn("p-2 rounded-lg border transition-all", showHidden ? "border-amber-500/40 text-amber-400 bg-amber-500/10" : "border-outline-variant text-outline hover:text-foreground")}
          >
            {showHidden ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Search params..."
              className="pl-9 pr-4 py-2 bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs font-bold w-52 rounded-lg transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Seed buttons */}
          <button
            onClick={() => handleSeed('retail')}
            disabled={!!seeding}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-black uppercase rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            {seeding === 'retail' ? <RefreshCw size={12} className="animate-spin" /> : <ShoppingCart size={12} />}
            Retail Defaults
          </button>
          <button
            onClick={() => handleSeed('distributor')}
            disabled={!!seeding}
            className="h-9 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-[10px] font-black uppercase rounded-lg flex items-center gap-2 shadow-lg shadow-violet-500/20 transition-all"
          >
            {seeding === 'distributor' ? <RefreshCw size={12} className="animate-spin" /> : <Truck size={12} />}
            Distributor Defaults
          </button>

          <button onClick={fetchParams} className="p-2 text-outline hover:text-primary transition-colors" title="Refresh">
            <RefreshCw size={18} className={cn(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* ── Body: Sidebar + Main ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Category Sidebar ── */}
        <div className="w-72 flex-shrink-0 border-r border-outline-variant bg-surface-container/20 overflow-y-auto custom-scrollbar">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
              <Database size={40} className="text-outline mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-outline">No categories yet</p>
              <p className="text-[9px] text-outline/60 mt-1">Seed Retail or Distributor defaults first</p>
            </div>
          ) : (
            <div className="p-3 space-y-1">
              {categories.map(cat => {
                const isActive = cat.category === activeCategory;
                const color = getCatColor(cat.category);
                return (
                  <button
                    key={cat.category}
                    onClick={() => { setActiveCategory(cat.category); setSearch(''); }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg border transition-all group",
                      isActive
                        ? cn("border", color)
                        : "border-transparent hover:border-outline-variant/50 hover:bg-surface-container"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest leading-tight",
                        isActive ? color.split(' ')[0] : "text-outline group-hover:text-foreground"
                      )}>
                        {cat.category}
                      </span>
                      <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded",
                        isActive ? cn(color.split(' ')[0], color.split(' ')[2]) : "text-outline/50 bg-surface-container"
                      )}>
                        {cat.count}
                      </span>
                    </div>
                    <p className="text-[9px] text-outline/60 mt-0.5 truncate">{cat.cat_descr}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Params Main Area ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Category Header */}
          {activeCategory && (
            <div className={cn("mb-6 p-4 rounded-xl border", catColor)}>
              <div className="flex items-center gap-3">
                <Layers size={16} className={catColor.split(' ')[0]} />
                <div>
                  <h2 className={cn("text-sm font-black uppercase tracking-widest", catColor.split(' ')[0])}>
                    {activeCategory}
                  </h2>
                  <p className="text-[10px] text-outline/70">
                    {categories.find(c => c.category === activeCategory)?.cat_descr}
                    <span className="ml-2 opacity-50">· {filtered.length} params visible</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3 opacity-50">
                <RefreshCw size={32} className="animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-outline">Loading Parameters...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-40">
              <Settings size={48} className="text-outline mb-4" />
              <p className="font-black uppercase tracking-widest text-xs text-outline">No parameters found</p>
              {search && <p className="text-[10px] text-outline/60 mt-1">Try clearing the search filter</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {filtered.map(param => {
                const opt = param.opt_type?.toUpperCase() ?? 'T';
                const isOneTime = param.fixed_type === 'One Time';
                const isLocked = param.fixed_type === 'Hidden' || param.fixed_type === 'Installation' || (isOneTime && oneTimeUpdated.includes(param.param_code));
                const isSaving = saving === param.param_code;

                return (
                  <div
                    key={param.param_code}
                    className={cn(
                      "bg-surface-container/40 border rounded-xl p-4 transition-all hover:border-outline-variant",
                      isLocked ? "border-outline-variant/30 opacity-60" : "border-outline-variant/50",
                    )}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded border", catColor)}>
                            {OPT_ICON[opt] ?? <Type size={10} />}
                            {opt}
                          </span>
                          {isLocked && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/5 text-amber-400">
                              <Lock size={9} /> {param.fixed_type}
                            </span>
                          )}
                          {isOneTime && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded border border-sky-500/30 bg-sky-500/5 text-sky-400">
                              <AlertTriangle size={9} /> One Time
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1 truncate">
                          {param.param_code}
                        </p>
                        <p className="text-[10px] text-outline/70 mt-0.5 leading-relaxed line-clamp-2">
                          {param.descr ?? 'No description'}
                        </p>
                      </div>
                      {isSaving
                        ? <RefreshCw size={14} className="animate-spin text-primary flex-shrink-0 mt-1" />
                        : <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
                      }
                    </div>

                    {/* Value Editor */}
                    {opt === 'B' ? (
                      <button
                        onClick={() => !isLocked && handleUpdate(param, { value: param.value_bool ? 'false' : 'true' })}
                        disabled={isLocked || isSaving}
                        className={cn(
                          "flex items-center gap-3 w-full p-3 rounded-lg border transition-all",
                          param.value_bool
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : "border-outline-variant/40 bg-surface-container/40",
                          isLocked ? "cursor-not-allowed" : "hover:border-primary/30 cursor-pointer"
                        )}
                      >
                        {param.value_bool
                          ? <ToggleRight size={20} className="text-emerald-400" />
                          : <ToggleLeft size={20} className="text-outline/50" />
                        }
                        <span className={cn("text-xs font-black uppercase", param.value_bool ? "text-emerald-400" : "text-outline/50")}>
                          {param.value_bool ? 'Enabled' : 'Disabled'}
                        </span>
                      </button>
                    ) : opt === 'I' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={param.value_int}
                          disabled={isLocked}
                          onBlur={e => {
                            const newVal = parseInt(e.target.value);
                            if (newVal !== param.value_int) handleUpdate(param, { value: String(newVal) });
                          }}
                          className={cn(
                            "flex-1 bg-surface-container border border-outline-variant focus:border-primary outline-none text-sm font-bold px-3 py-2 rounded-lg transition-all",
                            isLocked && "opacity-50 cursor-not-allowed"
                          )}
                        />
                        <span className="text-[9px] font-black text-outline/50 uppercase">Integer</span>
                      </div>
                    ) : (opt === 'S' || opt === 'C') ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={param.value_float ?? 0}
                          disabled={isLocked}
                          onBlur={e => {
                            const newVal = parseFloat(e.target.value);
                            if (newVal !== param.value_float) handleUpdate(param, { value: String(newVal) });
                          }}
                          className={cn(
                            "flex-1 bg-surface-container border border-outline-variant focus:border-primary outline-none text-sm font-bold px-3 py-2 rounded-lg transition-all",
                            isLocked && "opacity-50 cursor-not-allowed"
                          )}
                        />
                        <span className="text-[9px] font-black text-outline/50 uppercase">{opt === 'C' ? 'Currency' : 'Decimal'}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        defaultValue={param.value_txt ?? ''}
                        disabled={isLocked}
                        placeholder="(empty)"
                        onBlur={e => {
                          if (e.target.value !== (param.value_txt ?? '')) handleUpdate(param, { value: e.target.value });
                        }}
                        className={cn(
                          "w-full bg-surface-container border border-outline-variant focus:border-primary outline-none text-sm font-bold px-3 py-2 rounded-lg transition-all",
                          isLocked && "opacity-50 cursor-not-allowed"
                        )}
                      />
                    )}

                    {/* Origin ID footer */}
                    {param.origin_id && (
                      <p className="text-[8px] text-outline/30 font-mono mt-2">{param.origin_id}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="p-4 bg-surface-container/50 border-t border-outline-variant flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Info size={14} className="text-primary" />
          <p className="text-[10px] text-outline font-medium">
            Changes save on blur. Hidden/Installation params require system restart.
            <span className="ml-2 text-outline/50">
              {categories.reduce((s, c) => s + c.count, 0)} total params across {categories.length} categories.
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-outline/40">
          <Database size={10} />
          SmritiParam · Sovereign Store
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
