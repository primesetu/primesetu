import React, { useState } from 'react';
import { Settings2, XCircle, Home, Globe, Shield, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeCard } from './NodeCard';

interface ConnectivityHubProps {
  onClose: () => void;
  preferredBackendUrl: string | null;
  nodeStatus: Record<string, 'online' | 'offline' | 'checking'>;
  onApplyNode: (id: string, url: string) => void;
  validationError: string | null;
}

const PRESETS = [
  { id: 'local',  label: 'Local Sovereign Node', icon: Home,   url: 'http://127.0.0.1:8000', desc: 'Direct LAN access. Best for billing.' },
  { id: 'cloud',  label: 'Public Cloud Registry', icon: Globe,  url: 'https://smriti-api.primesetu.com', desc: 'Central HO backup. Needs internet.' },
  { id: 'tunnel', label: 'Secure Remote Tunnel', icon: Shield, url: '', desc: 'Custom Cloudflare Tunnel URL.' },
];

export const ConnectivityHub: React.FC<ConnectivityHubProps> = ({
  onClose,
  preferredBackendUrl,
  nodeStatus,
  onApplyNode,
  validationError
}) => {
  const [customUrl, setCustomUrl] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Settings2 size={18} />
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight text-white">Connection Hub</h2>
        </div>
        <button 
          onClick={onClose}
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
            <NodeCard
              key={preset.id}
              id={preset.id}
              label={preset.label}
              desc={preset.desc}
              icon={preset.icon}
              status={status}
              isActive={isActive}
              onClick={() => {
                if (preset.id !== 'tunnel') onApplyNode(preset.id, preset.url);
              }}
            />
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
              onClick={() => onApplyNode('custom', customUrl)}
              disabled={!customUrl.startsWith('https://')}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Apply
            </button>
          </div>
          {validationError && (
            <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold px-1 animate-in fade-in slide-in-from-top-1">
              <XCircle size={12} />
              {validationError}
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
        <p className="text-[9px] text-amber-500/60 text-center font-bold uppercase tracking-wider leading-relaxed">
          Operational Warning: Switching nodes requires elevated privileges. 
          All node transitions are logged for institutional auditing.
        </p>
      </div>
    </div>
  );
};
