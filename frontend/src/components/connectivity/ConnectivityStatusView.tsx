import React from 'react';
import { WifiOff, RefreshCw, AlertTriangle, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectivityStatusViewProps {
  isChecking: boolean;
  onRetry: () => void;
  onOpenHub: () => void;
  companyName: string;
  lastCheck: Date | null;
  onSnooze?: (hours: number) => void;
}

export const ConnectivityStatusView: React.FC<ConnectivityStatusViewProps> = ({
  isChecking,
  onRetry,
  onOpenHub,
  companyName,
  lastCheck,
  onSnooze
}) => {
  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
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
            onClick={onRetry}
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

          {onSnooze && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-500">
                <Settings2 size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Maintenance Bypass</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSnooze(1)}
                  className="flex-1 h-9 flex items-center justify-center bg-amber-500 text-black font-black uppercase tracking-widest text-[9px] rounded-lg hover:bg-amber-400 active:scale-95 transition-all"
                >
                  Snooze 1 Hr
                </button>
                <button
                  onClick={() => onSnooze(2)}
                  className="flex-1 h-9 flex items-center justify-center bg-amber-500 text-black font-black uppercase tracking-widest text-[9px] rounded-lg hover:bg-amber-400 active:scale-95 transition-all"
                >
                  Snooze 2 Hrs
                </button>
              </div>
              <p className="text-[8px] text-amber-500/50 font-mono text-center">
                * Requires Manager PIN Authorization
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onOpenHub}
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
  );
};
