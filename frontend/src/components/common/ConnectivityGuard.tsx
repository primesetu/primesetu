import React, { useEffect, useState, useCallback } from 'react';
import { useSovereignStore } from '@/store/useSovereignStore';
import { 
  WifiOff, RefreshCw, Server, AlertTriangle, Settings2, 
  Shield, Globe, Home, CheckCircle2, XCircle, Lock, ArrowRight,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, apiClient } from '@/api/client';
import { syncEngine } from '@/lib/SyncEngine';

// Node presets
const PRESETS = [
  { id: 'local',  label: 'Local Sovereign Node', icon: Home,   url: 'http://127.0.0.1:8000', desc: 'Direct LAN access. Best for billing.' },
  { id: 'cloud',  label: 'Public Cloud Registry', icon: Globe,  url: 'https://smriti-api.primesetu.com', desc: 'Central HO backup. Needs internet.' },
  { id: 'tunnel', label: 'Secure Remote Tunnel', icon: Shield, url: '', desc: 'Custom Cloudflare Tunnel URL.' },
];

export const ConnectivityGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isBackendAvailable = useSovereignStore(state => state.isBackendAvailable);
  const setBackendAvailable = useSovereignStore(state => state.setBackendAvailable);
  const preferredBackendUrl = useSovereignStore(state => state.preferredBackendUrl);
  const setPreferredBackendUrl = useSovereignStore(state => state.setPreferredBackendUrl);
  const companyName = useSovereignStore(state => state.companyName);
  
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  
  // UI States
  const [showSettings, setShowSettings] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [pendingNode, setPendingNode] = useState<{ id: string; url: string } | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [nodeStatus, setNodeStatus] = useState<Record<string, 'online' | 'offline' | 'checking'>>({
    local: 'checking',
    cloud: 'checking',
    tunnel: 'checking'
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      await api.offline.getStatus();
      setBackendAvailable(true);
      setLastCheck(new Date());
    } catch (err) {
      console.warn('[ConnectivityGuard] Node still unreachable.');
      setBackendAvailable(false);
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  }, [setBackendAvailable]);

  // Live ping all nodes when settings open
  useEffect(() => {
    if (showSettings) {
      const pingNode = async (id: string, url: string) => {
        if (!url) return;
        setNodeStatus(prev => ({ ...prev, [id]: 'checking' }));
        try {
          // Simple health check ping
          const res = await fetch(`${url}/api/v1/onboarding/health`, { signal: AbortSignal.timeout(3000) });
          const data = await res.json();
          if (data.service === "smriti-os") {
            setNodeStatus(prev => ({ ...prev, [id]: 'online' }));
          } else {
            setNodeStatus(prev => ({ ...prev, [id]: 'offline' }));
          }
        } catch {
          setNodeStatus(prev => ({ ...prev, [id]: 'offline' }));
        }
      };

      pingNode('local', 'http://127.0.0.1:8000');
      pingNode('cloud', 'https://smriti-api.primesetu.com');
      if (preferredBackendUrl && !['http://127.0.0.1:8000', 'https://smriti-api.primesetu.com'].includes(preferredBackendUrl)) {
        pingNode('tunnel', preferredBackendUrl);
      }
    }
  }, [showSettings, preferredBackendUrl]);

  // Auto-check logic
  useEffect(() => {
    let interval: any;
    if (!isBackendAvailable && !showSettings) {
      interval = setInterval(checkConnection, 10000);
    }
    return () => clearInterval(interval);
  }, [isBackendAvailable, showSettings, checkConnection]);

  const validateAndSwitch = async (url: string, id: string) => {
    setValidationError(null);
    setIsChecking(true);

    try {
      // 1. Basic URL validation
      const parsed = new URL(url);
      if (id !== 'local' && parsed.protocol !== 'https:') {
        throw new Error('Remote nodes must use HTTPS.');
      }

      // 2. Health check + service identity validation
      const res = await fetch(`${url}/api/v1/onboarding/health`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      
      if (data.service !== "smriti-os") {
        throw new Error('Not a valid Smriti-OS node.');
      }

      // 3. Sovereign Phase check
      // For now we just log it, but could warn if mismatched
      console.log(`[ConnectivityGuard] Target node phase: ${data.sovereign_phase}`);

      // 4. Sync Queue Check
      const pending = syncEngine.getPendingCount();
      if (pending > 0) {
        if (!confirm(`Warning: You have ${pending} pending transactions. Switching nodes will attempt to sync these to the new node. Continue?`)) {
          return;
        }
      }

      // Apply switch
      setPreferredBackendUrl(url, `User switched to ${id} node via ConnectivityGuard`);
      setShowSettings(false);
      setPendingNode(null);
      
      // Immediate retry on new node
      setTimeout(checkConnection, 500);

    } catch (err: any) {
      setValidationError(err.message || 'Node validation failed.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplyNode = (id: string, url: string) => {
    // RBAC: Elevate for non-local switches
    setPendingNode({ id, url });
    setShowPinDialog(true);
  };

  const verifyPinAndSwitch = () => {
    // Mock Manager PIN for demo. In production, this would hit an API or check a local hash.
    if (pin === '0000' || pin === '1234') {
      if (pendingNode) validateAndSwitch(pendingNode.url, pendingNode.id);
      setShowPinDialog(false);
      setPin('');
    } else {
      alert('Invalid Manager PIN. Access Denied.');
    }
  };

  if (isBackendAvailable) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-xl animate-fade-up font-sans">
      <div className="max-w-md w-full bg-[#0f172a] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden rounded-3xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl translate-y-16 -translate-x-16" />
        
        <div className="p-8 relative z-10">
          {!showSettings ? (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-red-500/10 flex items-center justify-center rounded-2xl border border-red-500/20 rotate-3">
                <WifiOff size={40} className="text-red-500 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight uppercase text-white leading-none">Node Disconnected</h2>
                <p className="text-xs text-white/40 font-medium leading-relaxed px-4">
                  Sovereign instance unreachable. System cannot process transactions without node connectivity.
                </p>
              </div>

              <div className="w-full space-y-4 pt-4">
                <div className="bg-white/5 border border-white/5 p-5 rounded-2xl text-left">
                  <div className="flex items-start gap-4">
                    <AlertTriangle size={18} className="text-amber-500 mt-1 flex-shrink-0" />
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Action Required</span>
                      <p className="text-[11px] text-white/70 font-mono leading-relaxed">
                        1. Ensure Backend Terminal is active.<br />
                        2. Verify Local PostgreSQL Service.<br />
                        3. Check LAN/WiFi Connectivity.<br />
                        4. Support: +91 9323023007
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={checkConnection}
                    disabled={isChecking}
                    className={cn(
                      "w-full h-14 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all rounded-2xl",
                      isChecking 
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/20 active:scale-95"
                    )}
                  >
                    <RefreshCw size={16} className={cn(isChecking && "animate-spin")} />
                    {isChecking ? "Pinging Node..." : "Retry Local Pulse"}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="flex-1 h-12 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] text-white/40 hover:text-white transition-all border border-white/5 rounded-xl hover:bg-white/5"
                    >
                      <Settings2 size={14} />
                      Connection Hub
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-12 h-12 flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5 rounded-xl hover:bg-white/5"
                      title="Hard Reload"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col items-center gap-2">
                <div className="flex items-center gap-3 text-[8px] font-mono font-black text-white/20 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    NODE: {companyName}
                  </span>
                  {lastCheck && <span>• HEARTBEAT: {lastCheck.toLocaleTimeString()}</span>}
                </div>
                <div className="text-[7px] text-white/10 uppercase font-black tracking-widest">Sovereign Layer v3.2 · Zero Cloud</div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Settings2 size={18} />
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white">Connection Hub</h2>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-white/20 hover:text-white transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {PRESETS.map((preset) => {
                  const isActive = preferredBackendUrl === preset.url || (preset.id === 'local' && !preferredBackendUrl);
                  const status = nodeStatus[preset.id] || 'offline';
                  
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        if (preset.id === 'tunnel') return; // Handled by custom input
                        handleApplyNode(preset.id, preset.url);
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl border text-left transition-all group flex items-center gap-4",
                        isActive 
                          ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/5" 
                          : "bg-white/5 border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        isActive ? "bg-primary text-white" : "bg-white/5 text-white/40 group-hover:text-white"
                      )}>
                        <preset.icon size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-white">{preset.label}</span>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            status === 'online' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                            status === 'checking' ? "bg-amber-500 animate-pulse" : "bg-red-500"
                          )} />
                        </div>
                        <p className="text-[9px] text-white/40 font-medium mt-0.5">{preset.desc}</p>
                      </div>
                      {isActive && <CheckCircle2 size={16} className="text-primary" />}
                    </button>
                  );
                })}

                <div className="pt-4 border-t border-white/5 space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Custom Tunnel Endpoint</span>
                  <div className="relative group">
                    <Database size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      placeholder="https://your-node.trycloudflare.com"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="w-full h-11 bg-black/40 border border-white/5 rounded-xl pl-10 pr-20 text-[11px] font-mono text-white focus:outline-none focus:border-primary transition-all"
                    />
                    <button 
                      onClick={() => handleApplyNode('custom', customUrl)}
                      disabled={!customUrl.startsWith('https://')}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {validationError && (
                    <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold px-1">
                      <XCircle size={12} />
                      {validationError}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[9px] text-white/30 text-center font-medium">
                Switching nodes requires elevated privileges. <br />
                Node changes are logged for security audits.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PIN Dialog (RBAC) */}
      {showPinDialog && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in">
          <div className="bg-[#1e293b] border border-white/10 p-8 rounded-3xl w-full max-w-[320px] shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto border border-amber-500/20">
              <Lock size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Security Override</h3>
              <p className="text-[10px] text-white/40 font-medium">Enter Manager PIN to switch node</p>
            </div>
            <input 
              type="password"
              maxLength={4}
              value={pin}
              autoFocus
              onChange={(e) => setPin(e.target.value)}
              className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl text-center text-2xl font-black tracking-[1em] text-white focus:outline-none focus:border-amber-500/50 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && verifyPinAndSwitch()}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowPinDialog(false); setPin(''); }}
                className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={verifyPinAndSwitch}
                className="flex-1 h-12 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

