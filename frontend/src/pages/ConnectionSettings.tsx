/* ============================================================
 * SMRITI-OS — Connection Settings
 * "Sovereign Node Topology Control."
 * ============================================================ */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, Server, Shield, Globe, RefreshCw, Save, 
  CheckCircle2, XCircle, AlertCircle, Info, Lock, Eye, EyeOff, Zap
} from 'lucide-react';
import { apiClient } from '@/api/client';
import { cn } from '@/lib/utils';

interface SysParam {
  param_code: string;
  descr?: string;
  opt_type?: string;
  value_txt?: string;
  value_bool: boolean;
  value_int: number;
}

export default function ConnectionSettings() {
  const [params, setParams] = useState<SysParam[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showPass, setShowPass] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchParams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/config/sysparam', { 
        params: { category: 'CONN' } 
      });
      setParams(res.data);
    } catch (e) {
      showToast('Failed to fetch connection details', false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await apiClient.post('/config/test-db');
      showToast(res.data.message || 'Connection successful!');
    } catch (e: any) {
      showToast(e.response?.data?.detail || 'Connection failed', false);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => { fetchParams(); }, [fetchParams]);

  const handleUpdate = async (param: SysParam, newVal: string) => {
    setSaving(param.param_code);
    try {
      await apiClient.patch(`/config/sysparam/${param.param_code}`, { value: newVal });
      setParams(prev => prev.map(p => p.param_code === param.param_code ? { ...p, 
        value_txt: param.opt_type === 'T' ? newVal : p.value_txt,
        value_int: param.opt_type === 'I' ? parseInt(newVal) : p.value_int,
        value_bool: param.opt_type === 'B' ? newVal.toLowerCase() === 'true' : p.value_bool
      } : p));
      showToast(`Updated: ${param.param_code}`);
    } catch {
      showToast('Update failed', false);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#020617] text-white overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-top-4",
          toast.ok ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-red-500/20 border-red-500/50 text-red-400"
        )}>
          {toast.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span className="text-sm font-bold">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-white/5 bg-[#0f172a]/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
            <Server className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Connection Settings</h1>
            <p className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase mt-0.5">Sovereign Node Topology Control</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleTestConnection}
            disabled={testing}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            )}
          >
            {testing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button 
            onClick={fetchParams}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors group"
          >
            <RefreshCw className={cn("w-5 h-5 text-indigo-400 group-hover:rotate-180 transition-transform duration-700", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Warning Card */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Critical Infrastructure Warning</h3>
              <p className="text-xs text-amber-400/70 mt-1 leading-relaxed">
                Modifying these parameters may disconnect the application from its data source. 
                Incorrect credentials or host settings will cause a system-wide outage. 
                Ensure the target database is reachable before applying changes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              [1,2,3,4,5,6].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
              ))
            ) : (
              params.sort((a,b) => (a.param_code > b.param_code ? 1 : -1)).map(param => {
                const isPass = param.param_code === 'DB_PASS';
                const isSaving = saving === param.param_code;
                
                return (
                  <div key={param.param_code} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          {param.opt_type === 'B' ? <Globe size={12} className="text-emerald-400" /> : <Database size={12} className="text-indigo-400" />}
                          <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">{param.param_code}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white/80 mt-1">{param.descr}</h4>
                      </div>
                      {isSaving && <RefreshCw size={14} className="animate-spin text-indigo-400" />}
                    </div>

                    <div className="relative">
                      {param.opt_type === 'B' ? (
                        <button 
                          onClick={() => handleUpdate(param, param.value_bool ? 'false' : 'true')}
                          disabled={!!saving}
                          className={cn(
                            "w-full px-4 py-3 rounded-xl border flex items-center justify-between transition-all font-bold text-xs uppercase",
                            param.value_bool ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-white/40"
                          )}
                        >
                          <span>{param.value_bool ? 'Enabled' : 'Disabled'}</span>
                          <div className={cn("w-2 h-2 rounded-full", param.value_bool ? "bg-emerald-400 animate-pulse" : "bg-white/20")} />
                        </button>
                      ) : (
                        <div className="relative group/input">
                          <input 
                            type={isPass && !showPass ? 'password' : 'text'}
                            defaultValue={param.opt_type === 'I' ? param.value_int : param.value_txt}
                            disabled={!!saving}
                            onBlur={(e) => handleUpdate(param, e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500/50 transition-all pr-12"
                          />
                          {isPass && (
                            <button 
                              onClick={() => setShowPass(!showPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/20 hover:text-white transition-colors"
                            >
                              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="pt-8 border-t border-white/5 flex items-center justify-between opacity-40">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Local Storage · Sovereign Access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest">Target Node:</span>
              <span className="text-[10px] font-mono text-indigo-400">smriti_local@127.0.0.1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
