/* ============================================================
 * SMRITI-OS — Offline / Local PostgreSQL Setup Panel
 * Settings sub-panel for configuring and monitoring LOCAL_POSTGRES mode
 * ============================================================ */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import {
  Database, Cloud, CloudOff, RefreshCw, CheckCircle,
  AlertTriangle, Wifi, WifiOff, Server, ArrowRight, Copy
} from 'lucide-react';

interface SyncStatus {
  mode: string;
  local_db?: string;
  is_online: boolean;
  pending: number;
  synced: number;
  failed: number;
}

const MONO: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace' };
const LABEL: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' };

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: ok ? '#10b981' : '#ef4444',
      boxShadow: ok ? '0 0 6px #10b98160' : '0 0 6px #ef444460',
      marginRight: 6,
    }} />
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} style={{
      padding: '2px 8px', fontSize: 10, fontWeight: 700,
      border: '1px solid var(--color-border)', background: 'transparent',
      color: 'var(--color-text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <Copy size={10} /> {copied ? 'COPIED!' : 'COPY'}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div style={{ position: 'relative', marginBottom: 8 }}>
      <pre style={{
        padding: '10px 14px', background: '#0a0f1a', color: '#7dd3fc',
        fontSize: 12, ...MONO, overflowX: 'auto', margin: 0, borderRadius: 0,
        border: '1px solid var(--color-border)',
      }}>{code}</pre>
      <div style={{ position: 'absolute', top: 6, right: 8 }}>
        <CopyBtn text={code} />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--color-primary)',
      borderLeft: '3px solid var(--color-primary)', paddingLeft: 10, marginBottom: 14, marginTop: 24,
    }}>{children}</div>
  );
}

export default function OfflineSetupPanel() {
  const qc = useQueryClient();

  const { data: status, isLoading, refetch } = useQuery<SyncStatus>({
    queryKey: ['offline-status'],
    queryFn: () => api.offline.getStatus(),
    refetchInterval: 10_000,
  });

  const isOfflineMode = status?.mode === 'LOCAL_POSTGRES';

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ ...MONO, fontSize: 20, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
          LOCAL DATABASE ENGINE
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Sovereign offline mode using Local PostgreSQL — identical engine to cloud Supabase.
          Zero SQL dialect friction. Full MVCC. JSONB sync queue.
        </p>
      </div>

      {/* Live Status Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard
          label="STORAGE MODE"
          value={isLoading ? '...' : (status?.mode || '—')}
          icon={<Database size={16} />}
          color={isOfflineMode ? 'var(--color-primary)' : '#6366f1'}
        />
        <StatCard
          label="NETWORK"
          value={isLoading ? '...' : (status?.is_online ? 'ONLINE' : 'OFFLINE')}
          icon={status?.is_online ? <Wifi size={16} /> : <WifiOff size={16} />}
          color={status?.is_online ? '#10b981' : '#f59e0b'}
        />
        <StatCard
          label="PENDING SYNC"
          value={isLoading ? '...' : String(status?.pending ?? 0)}
          icon={<RefreshCw size={16} />}
          color={(status?.pending ?? 0) > 0 ? '#f59e0b' : '#10b981'}
        />
        <StatCard
          label="SYNC ERRORS"
          value={isLoading ? '...' : String(status?.failed ?? 0)}
          icon={<AlertTriangle size={16} />}
          color={(status?.failed ?? 0) > 0 ? '#ef4444' : '#10b981'}
        />
      </div>

      {/* Sync Pipeline Visual */}
      {isOfflineMode && (
        <div style={{
          padding: 20, border: '1px solid var(--color-border)', background: 'var(--color-surface)',
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap',
        }}>
          <PipelineNode
            icon={<Server size={18} />}
            label="LOCAL POSTGRES"
            sublabel={status?.local_db || 'localhost:5432/smriti_local'}
            ok={true}
          />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 2, background: status?.is_online ? 'var(--color-primary)' : '#94a3b8', borderRadius: 1 }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: status?.is_online ? 'var(--color-primary)' : '#94a3b8' }}>
              {status?.is_online ? '▶ SYNCING' : '⏸ QUEUED'}
            </span>
            <div style={{ flex: 1, height: 2, background: status?.is_online ? 'var(--color-primary)' : '#94a3b8', borderRadius: 1 }} />
          </div>
          <PipelineNode
            icon={<Cloud size={18} />}
            label="SUPABASE CLOUD"
            sublabel="PostgREST REST API"
            ok={status?.is_online ?? false}
          />
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => refetch()}
              style={{
                padding: '8px 14px', border: '2px solid var(--color-border)', background: 'transparent',
                cursor: 'pointer', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <RefreshCw size={12} /> REFRESH
            </button>
          </div>
        </div>
      )}

      {/* Setup Guide */}
      <SectionTitle>STEP 1 — INSTALL POSTGRESQL LOCALLY</SectionTitle>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
        Download from <a href="https://www.postgresql.org/download/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>postgresql.org/download</a> — choose Windows x86-64.
        During setup, note the password for the <code style={MONO}>postgres</code> superuser.
      </p>

      <SectionTitle>STEP 2 — CREATE THE LOCAL DATABASE</SectionTitle>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
        Open <strong>psql</strong> or pgAdmin and run:
      </p>
      <CodeBlock code={`CREATE DATABASE smriti_local;\nGRANT ALL PRIVILEGES ON DATABASE smriti_local TO postgres;`} />

      <SectionTitle>STEP 3 — UPDATE .ENV FILE</SectionTitle>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
        In <code style={MONO}>backend/.env</code>, change the following (replace <code style={MONO}>YOUR_PW</code>):
      </p>
      <CodeBlock code={`STORAGE_MODE=LOCAL_POSTGRES\nLOCAL_DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PW@localhost:5432/smriti_local\nOFFLINE_SYNC_INTERVAL=30`} />

      <SectionTitle>STEP 4 — BOOTSTRAP SCHEMA</SectionTitle>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
        Run the bootstrap script once to apply all sovereign tables + sync queue:
      </p>
      <CodeBlock code={`cd backend\npython scripts/init_local_db.py`} />
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
        This creates all <code style={MONO}>smriti_*</code> tables in your local PostgreSQL, plus the <code style={MONO}>smriti_sync_queue</code> JSONB table with status index.
      </p>

      <SectionTitle>STEP 5 — START BACKEND</SectionTitle>
      <CodeBlock code={`cd backend\nuvicorn app.main:app --reload`} />
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
        The console should print: <code style={{ ...MONO, color: '#10b981' }}>[SMRITI-OS] Database connected. Mode: LOCAL_POSTGRES</code>
      </p>

      <SectionTitle>HOW SYNC WORKS</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[
          { title: '🟢 When Online', desc: 'Every 30 seconds, the backend probes 8.8.8.8:53. When reachable, all PENDING rows in smriti_sync_queue are pushed to Supabase PostgREST via HTTP upsert. Rows marked SYNCED on success.' },
          { title: '🟡 When Offline', desc: 'All billing, inventory, and sales operations continue normally against local PostgreSQL. Changes are queued in smriti_sync_queue. Nothing is lost — the queue is durable.' },
          { title: '🔴 On Sync Failure', desc: 'Failed rows get retry_count incremented. After 5 retries, rows are marked FAILED and surfaced in this panel for manual review or re-queue.' },
          { title: '🔵 Idempotent Upserts', desc: 'All cloud pushes use Supabase Prefer: resolution=merge-duplicates. Safe to retry — no duplicate bills or inventory entries will be created in the cloud.' },
        ].map(({ title, desc }) => (
          <div key={title} style={{ padding: 16, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <SectionTitle>ARCHITECTURE COMPARISON</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-border)', background: 'var(--color-surface)' }}>
            {['Feature', 'SQLite ❌', 'Local PostgreSQL ✅'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, fontSize: 11 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['SQL dialect parity with Supabase', '❌ Different', '✅ Identical'],
            ['Concurrent POS tills (MVCC)', '❌ Single writer lock', '✅ Full MVCC'],
            ['JSONB / Array types', '❌ Not supported', '✅ Native'],
            ['Window functions, CTEs', '❌ Limited', '✅ Full'],
            ['Schema migration (Alembic)', '⚠️ Requires adapters', '✅ Same as cloud'],
            ['Production-equivalent testing', '❌ Behavior differs', '✅ 1:1 mirror'],
            ['Logical replication (future)', '❌ Not possible', '✅ Ready'],
            ['Zero install (embedded)', '✅ Yes', '⚠️ ~10min install'],
          ].map(([feature, sqlite, pg], i) => (
            <tr key={feature} style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'var(--color-surface)' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600 }}>{feature}</td>
              <td style={{ padding: '10px 14px', color: '#ef4444', ...MONO, fontSize: 11 }}>{sqlite}</td>
              <td style={{ padding: '10px 14px', color: '#10b981', ...MONO, fontSize: 11 }}>{pg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ padding: '16px 20px', border: `2px solid ${color}20`, background: 'var(--color-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        {icon}
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, ...MONO, color }}>{value}</div>
    </div>
  );
}

function PipelineNode({ icon, label, sublabel, ok }: { icon: React.ReactNode; label: string; sublabel: string; ok: boolean }) {
  return (
    <div style={{ padding: '12px 18px', border: `2px solid ${ok ? 'var(--color-primary)' : '#94a3b8'}`, background: ok ? 'var(--color-primary)08' : 'transparent', textAlign: 'center', minWidth: 160 }}>
      <div style={{ color: ok ? 'var(--color-primary)' : '#94a3b8', marginBottom: 6 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{sublabel}</div>
      <div style={{ marginTop: 6, fontSize: 10, color: ok ? '#10b981' : '#94a3b8', fontWeight: 700 }}>
        <StatusDot ok={ok} />{ok ? 'CONNECTED' : 'WAITING'}
      </div>
    </div>
  );
}
