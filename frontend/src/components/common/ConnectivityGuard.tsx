import React, { useEffect, useState } from 'react';
import { useSovereignStore } from '@/store/useSovereignStore';
import { WifiOff, RefreshCw, Server, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/api/client';

export const ConnectivityGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isBackendAvailable = useSovereignStore(state => state.isBackendAvailable);
  const setBackendAvailable = useSovereignStore(state => state.setBackendAvailable);
  const companyName = useSovereignStore(state => state.companyName);
  const companyAddress = useSovereignStore(state => state.companyAddress);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Use health check endpoint
      await api.offline.getStatus();
      setBackendAvailable(true);
      setLastCheck(new Date());
    } catch (err) {
      console.warn('[ConnectivityGuard] Backend still unreachable.');
      setBackendAvailable(false);
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-check every 10 seconds if backend is down
  useEffect(() => {
    let interval: any;
    if (!isBackendAvailable) {
      interval = setInterval(checkConnection, 10000);
    }
    return () => clearInterval(interval);
  }, [isBackendAvailable]);

  if (isBackendAvailable) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md animate-fade-up">
      <div className="max-w-md w-full bg-surface-container-highest border-2 border-red-500/30 shadow-modal p-8 relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rotate-45 translate-x-12 -translate-y-12" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-1">
            <h1 className="text-xs font-mono font-black text-outline/40 uppercase tracking-widest">{companyAddress}</h1>
          </div>

          <div className="w-20 h-20 bg-red-500/10 flex items-center justify-center rounded-full border border-red-500/20">
            <WifiOff size={40} className="text-red-500 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tighter uppercase text-on-surface">Database or Network Disconnected</h2>
            <p className="text-sm text-outline font-medium leading-relaxed">
              "{companyName}" is unreachable. 
              The system cannot process live transactions without the database or network.
            </p>
          </div>

          <div className="w-full space-y-4 pt-4">
            <div className="bg-surface-container border border-outline-variant p-4 text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-outline">Action Required</span>
                  <p className="text-[11px] text-on-surface-variant font-mono">
                    1. Check if the terminal/cmd window for backend is running.<br />
                    2. If not, restart computer or server.<br />
                    3. Check if PostgreSQL service is active.<br />
                    4. Support: support@aitdl.com<br />
                    5. Support: +91 9323023007
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={checkConnection}
                disabled={isChecking}
                className={cn(
                  "w-full h-12 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-all",
                  isChecking 
                    ? "bg-surface-container-high text-outline cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                )}
              >
                <RefreshCw size={14} className={cn(isChecking && "animate-spin")} />
                {isChecking ? "Pinging Node..." : "Retry Connection"}
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full h-10 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] text-outline hover:text-on-surface transition-colors border border-outline-variant"
              >
                <RefreshCw size={12} />
                Hard Reload App
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4 text-[8px] font-mono font-black text-outline/30 uppercase tracking-[0.2em]">
             <span className="flex items-center gap-2 border-r border-outline-variant/30 pr-4">
               <div className="w-1 h-1 bg-red-500/50" />
               {companyName} · SOVEREIGN NODE
             </span>
             {lastCheck && <span>HEARTBEAT: {lastCheck.toLocaleTimeString()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
