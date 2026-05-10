/* ============================================================
 * SMRITI-OS — SyncStatusBadge
 * Topbar widget showing local PostgreSQL ↔ Cloud sync state.
 * Polls /api/v1/offline/status every 15 seconds.
 * ============================================================ */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface SyncStatus {
  mode: string;
  is_online: boolean;
  pending: number;
  synced: number;
  failed: number;
  local_db?: string;
}

export default function SyncStatusBadge() {
  const { data, isLoading } = useQuery<SyncStatus>({
    queryKey: ['offline-status'],
    queryFn: () => api.offline.getStatus(),
    refetchInterval: 15_000,
    retry: false,
  });

  if (isLoading || !data) return null;

  // In CLOUD or SOVEREIGN mode — show a simple green cloud indicator
  if (data.mode !== 'LOCAL_POSTGRES') {
    return (
      <div style={styles.badge('#10b981')}>
        <Cloud size={13} />
        <span>CLOUD</span>
      </div>
    );
  }

  // LOCAL_POSTGRES mode — show full sync status
  const hasFailed  = data.failed > 0;
  const hasPending = data.pending > 0;
  const color = !data.is_online
    ? '#f59e0b'                          // amber — offline
    : hasFailed  ? '#ef4444'            // red   — failed rows
    : hasPending ? 'var(--color-primary)' // teal  — syncing
    : '#10b981';                         // green — all clear

  const icon = !data.is_online
    ? <CloudOff size={13} />
    : hasPending
    ? <RefreshCw size={13} style={{ animation: 'spin 1.2s linear infinite' }} />
    : hasFailed
    ? <AlertTriangle size={13} />
    : <CheckCircle size={13} />;

  const label = !data.is_online
    ? 'OFFLINE'
    : hasPending
    ? `SYNCING ${data.pending}`
    : hasFailed
    ? `${data.failed} FAILED`
    : 'SYNCED';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={styles.badge(color)}>
        {icon}
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 800 }}>
          {label}
        </span>
      </div>

      {/* Tooltip on hover */}
      <div style={styles.tooltip}>
        <div style={{ fontWeight: 800, marginBottom: 6, color }}>
          {data.is_online ? '● ONLINE' : '○ OFFLINE'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>
          Mode: LOCAL_POSTGRES
        </div>
        {data.local_db && (
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>
            {data.local_db}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
          <span style={{ color: '#f59e0b' }}>⏳ {data.pending} pending</span>
          <span style={{ color: '#10b981' }}>✓ {data.synced} synced</span>
          <span style={{ color: '#ef4444' }}>✗ {data.failed} failed</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        div[data-sync-badge]:hover > div:last-child { display: block !important; }
      `}</style>
    </div>
  );
}

const styles = {
  badge: (color: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 10px',
    border: `1.5px solid ${color}`,
    color,
    background: `${color}18`,
    cursor: 'default',
    userSelect: 'none',
    fontSize: 11,
    fontWeight: 800,
    transition: 'all 0.2s',
  }),
  tooltip: {
    display: 'none',
    position: 'absolute' as const,
    top: 'calc(100% + 8px)',
    right: 0,
    zIndex: 9999,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    padding: '12px 16px',
    minWidth: 220,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    pointerEvents: 'none',
    fontSize: 12,
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
};
