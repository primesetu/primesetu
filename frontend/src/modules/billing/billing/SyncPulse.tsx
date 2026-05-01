import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface Props {
  isOffline:   boolean;
  isSyncing:   boolean;
  queueDepth:  number;
  lastSyncAt:  string | null;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export const SyncPulse: React.FC<Props> = ({ isOffline, isSyncing, queueDepth, lastSyncAt }) => {
  if (isOffline) {
    return (
      <div className="flex items-center gap-1.5 text-amber-400" title="OFFLINE — Local Mode Active">
        <WifiOff size={13} />
        <span className="text-[9px] font-black uppercase tracking-widest">OFFLINE</span>
        {queueDepth > 0 && (
          <span className="bg-amber-500 text-black text-[8px] font-black px-1 rounded">
            {queueDepth} QUEUED
          </span>
        )}
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 text-blue-300" title="Syncing write queue...">
        <RefreshCw size={12} className="animate-spin" />
        <span className="text-[9px] font-black uppercase tracking-widest">SYNCING</span>
        {queueDepth > 0 && (
          <span className="bg-blue-500 text-white text-[8px] font-black px-1 rounded">
            {queueDepth}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 text-emerald-400"
      title={lastSyncAt ? `Last sync: ${timeAgo(lastSyncAt)}` : 'Online'}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-[9px] font-black uppercase tracking-widest">ONLINE</span>
      {lastSyncAt && (
        <span className="text-[8px] font-black text-emerald-600 hidden xl:inline">
          {timeAgo(lastSyncAt)}
        </span>
      )}
    </div>
  );
};
