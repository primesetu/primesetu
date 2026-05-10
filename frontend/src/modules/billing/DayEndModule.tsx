/* ============================================================
 * SMRITI-OS — Module 8: Day-End / Z-Report Workbench
 * Sovereign Shift Closure & Cash Reconciliation Engine
 * ============================================================ */
import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';
import { CheckCircle, AlertTriangle, Printer, TrendingUp, TrendingDown, Lock, RefreshCw } from 'lucide-react';
import { DayEndReport } from './DayEndReport';

type SealStatus = 'idle' | 'sealing' | 'sealed' | 'error';

export default function DayEndModule() {
  const [declaredCash, setDeclaredCash] = useState<string>('');
  const [sealStatus, setSealStatus] = useState<SealStatus>('idle');
  const [sealResult, setSealResult] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ['day-end-summary'],
    queryFn: () => api.billing.getDayEndSummary(),
    refetchInterval: 60_000,
  });

  const { data: tallySummary } = useQuery({
    queryKey: ['tally-status'],
    queryFn: () => api.tally.getStatus(),
  });

  const sealMutation = useMutation({
    mutationFn: (cash: number) => api.billing.finalizeDayEnd(),
    onSuccess: (data) => {
      setSealResult(data);
      setSealStatus('sealed');
      qc.invalidateQueries({ queryKey: ['day-end-summary'] });
    },
    onError: () => setSealStatus('error'),
  });

  const handleSeal = () => {
    const cash = parseFloat(declaredCash) || 0;
    setSealStatus('sealing');
    sealMutation.mutate(cash);
  };

  const handlePrint = () => {
    window.print();
  };

  const variance = summary ? (parseFloat(declaredCash) || 0) - (summary.cash || 0) : 0;

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-primary)' }}>
            DAY-END / Z-REPORT
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Institutional Shift Closure · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => refetch()}
            style={{ padding: '8px 14px', fontSize: 12, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text)' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handlePrint}
            style={{ padding: '8px 14px', fontSize: 12, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text)' }}
          >
            <Printer size={14} /> Print Z-Report
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          Loading shift data...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
          {/* LEFT — KPI GRID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Revenue Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Gross Revenue', value: summary?.total_revenue || 0, icon: TrendingUp, accent: '#10b981' },
                { label: 'Total Tax (GST)', value: summary?.total_tax || 0, icon: TrendingUp, accent: '#3b82f6' },
                { label: 'Returns / CN', value: summary?.total_returns || 0, icon: TrendingDown, accent: '#ef4444' },
              ].map(({ label, value, icon: Icon, accent }) => (
                <div key={label} style={{ padding: 18, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 700 }}>{label}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 800, color: accent }}>
                    {formatCurrency(value)}
                  </div>
                </div>
              ))}
            </div>

            {/* Invoices KPI */}
            <div style={{ padding: 18, background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 24 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700 }}>INVOICES GENERATED TODAY</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 40, fontWeight: 800, color: 'var(--color-primary)' }}>
                  {summary?.bill_count || 0}
                </div>
              </div>
              <div style={{ flex: 1, borderLeft: '1px solid var(--color-border)', paddingLeft: 24 }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 10 }}>COLLECTION BREAKDOWN</div>
                {[
                  { label: 'Cash', value: summary?.cash || 0 },
                  { label: 'Card / POS', value: summary?.card || 0 },
                  { label: 'UPI / Wallet', value: summary?.upi || 0 },
                  { label: 'Other', value: summary?.other || 0 },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700 }}>{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tally Sync Status */}
            {tallySummary && (
              <div style={{ padding: 18, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 12 }}>TALLY ACCOUNTING SYNC</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    { label: 'Synced', value: tallySummary.synced, color: '#10b981' },
                    { label: 'Pending', value: tallySummary.pending, color: '#f59e0b' },
                    { label: 'Failed', value: tallySummary.failed, color: '#ef4444' },
                  ].map(k => (
                    <div key={k.label} style={{ flex: 1, textAlign: 'center', padding: '8px', border: `1px solid ${k.color}30`, background: `${k.color}08` }}>
                      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: k.color }}>{k.value}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{k.label}</div>
                    </div>
                  ))}
                </div>
                {tallySummary.pending > 0 && (
                  <button
                    onClick={() => api.tally.runSync()}
                    style={{ marginTop: 10, width: '100%', padding: '7px', fontSize: 11, fontWeight: 700, background: '#0f766e', color: '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    ⇅ Push {tallySummary.pending} Pending to Tally
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — CASH RECONCILIATION + SEAL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 20, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 16 }}>PHYSICAL CASH RECONCILIATION</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13 }}>System Cash (POS)</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{formatCurrency(summary?.cash || 0)}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  PHYSICAL COUNT (Cashier Blind Count)
                </label>
                <input
                  type="number"
                  value={declaredCash}
                  onChange={e => setDeclaredCash(e.target.value)}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                borderTop: '2px solid var(--color-border)', borderBottom: '2px solid var(--color-border)', marginBottom: 16,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Variance</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 800,
                  color: variance === 0 ? '#10b981' : variance < 0 ? '#ef4444' : '#f59e0b',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {variance > 0 ? <TrendingUp size={14} /> : variance < 0 ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                  {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                </span>
              </div>

              {sealStatus === 'sealed' && sealResult ? (
                <div style={{ padding: 16, background: '#10b98110', border: '1px solid #10b981', textAlign: 'center' }}>
                  <CheckCircle size={24} color="#10b981" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#10b981' }}>DAY SEALED</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, marginTop: 4 }}>{sealResult.z_number}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{sealResult.message}</div>
                </div>
              ) : (
                <button
                  onClick={handleSeal}
                  disabled={sealStatus === 'sealing'}
                  style={{
                    width: '100%', padding: '14px', fontSize: 13, fontWeight: 800,
                    background: sealStatus === 'sealing' ? '#94a3b8' : 'var(--color-primary)',
                    color: '#fff', border: 'none', cursor: sealStatus === 'sealing' ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    letterSpacing: '0.08em',
                  }}
                >
                  <Lock size={16} />
                  {sealStatus === 'sealing' ? 'SEALING...' : 'SEAL THE DAY'}
                </button>
              )}
            </div>

            {sealStatus === 'error' && (
              <div style={{ padding: 12, background: '#ef444415', border: '1px solid #ef4444', fontSize: 12, color: '#ef4444' }}>
                ✗ Failed to seal the day. Please try again or contact support.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print-only Z-Report (hidden on screen) */}
      <div ref={printRef} className="print:block hidden">
        {summary && (
          <DayEndReport
            stats={{
              cash: summary.cash, card: summary.card, upi: summary.upi,
              returns: summary.total_returns, bill_count: summary.bill_count, total_revenue: summary.total_revenue,
            }}
            declaredCash={parseFloat(declaredCash) || 0}
            variance={variance}
            store={{}}
            tallySyncStatus={tallySummary}
          />
        )}
      </div>
    </div>
  );
}
