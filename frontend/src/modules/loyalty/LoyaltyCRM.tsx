/* ============================================================
 * SMRITI-OS — Module 18: Loyalty & CRM Workbench
 * Sovereign Customer Relationship & Points Management Centre
 * ============================================================ */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';
import { Search, Award, TrendingUp, Gift, Star, ArrowUpRight, Edit2, CheckCircle } from 'lucide-react';

const TIER_BADGES: Record<string, { emoji: string; gradient: string }> = {
  BRONZE:   { emoji: '🥉', gradient: 'linear-gradient(135deg, #b45309, #92400e)' },
  SILVER:   { emoji: '🥈', gradient: 'linear-gradient(135deg, #6b7280, #374151)' },
  GOLD:     { emoji: '🥇', gradient: 'linear-gradient(135deg, #d97706, #b45309)' },
  PLATINUM: { emoji: '💎', gradient: 'linear-gradient(135deg, #7c3aed, #4c1d95)' },
};

export default function LoyaltyCRM() {
  const [searchQ, setSearchQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adjustPts, setAdjustPts] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustMsg, setAdjustMsg] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: searchResults = [], isFetching: searching } = useQuery({
    queryKey: ['loyalty-search', searchQ],
    queryFn: () => api.loyalty.search(searchQ),
    enabled: searchQ.length >= 2,
    staleTime: 5000,
  });

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['loyalty-profile', selectedId],
    queryFn: () => api.loyalty.getProfile(selectedId!),
    enabled: !!selectedId,
  });

  const { data: tiers } = useQuery({
    queryKey: ['loyalty-tiers'],
    queryFn: () => api.loyalty.getTiers(),
    staleTime: Infinity,
  });

  const adjustMutation = useMutation({
    mutationFn: () =>
      api.loyalty.adjust({
        partner_id: selectedId!,
        points: parseInt(adjustPts),
        reason: adjustReason || 'Manual adjustment',
      }),
    onSuccess: (data) => {
      setAdjustMsg(`Adjusted. New balance: ${data.new_balance} pts`);
      setAdjustPts('');
      setAdjustReason('');
      qc.invalidateQueries({ queryKey: ['loyalty-profile', selectedId] });
    },
  });

  const badge = profile ? TIER_BADGES[profile.tier] || TIER_BADGES.SILVER : null;

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-primary)' }}>
          LOYALTY & CRM
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Customer Points Ledger · Tier Management · Redemption Control
        </p>
      </div>

      {/* Tier Overview Bar */}
      {tiers && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          {Object.entries(tiers).map(([name, cfg]: [string, any]) => {
            const b = TIER_BADGES[name] || TIER_BADGES.SILVER;
            return (
              <div key={name} style={{ padding: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{b.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{cfg.label}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {cfg.min_pts > 0 ? `${cfg.min_pts}+ pts earned` : 'Entry tier'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {cfg.multiplier}x accrual · 1pt = Rs.{cfg.points_value_rs}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* LEFT — Search Panel */}
        <div>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search by name or mobile..."
              style={{ width: '100%', padding: '9px 9px 9px 32px', border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>

          {searching && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: 16 }}>Searching...</div>}

          {searchResults.map((r: any) => {
            const b = TIER_BADGES[r.tier] || TIER_BADGES.SILVER;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                style={{
                  padding: '12px 14px', marginBottom: 6, cursor: 'pointer',
                  border: `2px solid ${selectedId === r.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: selectedId === r.id ? 'var(--color-primary-10, #0f766e10)' : 'var(--color-surface)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{r.mobile}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11 }}>{b.emoji} {r.tier}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 13 }}>{r.points_balance} pts</div>
                  </div>
                </div>
              </div>
            );
          })}

          {searchQ.length >= 2 && !searching && searchResults.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: 20 }}>No customers found.</div>
          )}
        </div>

        {/* RIGHT — CRM Card */}
        {!selectedId ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--color-text-muted)', flexDirection: 'column', gap: 12 }}>
            <Award size={40} style={{ opacity: 0.2 }} />
            <div style={{ fontWeight: 700 }}>Search and select a customer to view their loyalty profile</div>
          </div>
        ) : loadingProfile ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            Loading profile...
          </div>
        ) : profile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Identity card */}
            <div style={{ padding: 20, background: badge?.gradient, color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 80, opacity: 0.15 }}>{badge?.emoji}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>LOYALTY MEMBER</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{profile.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.8, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{profile.mobile}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>{profile.tier_label}</div>
                  <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{profile.points_balance}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>pts = Rs.{profile.points_value_rs}</div>
                </div>
              </div>
              {profile.next_tier && (
                <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(255,255,255,0.15)', fontSize: 11 }}>
                  <ArrowUpRight size={12} style={{ display: 'inline', marginRight: 4 }} />
                  <strong>{profile.pts_to_next_tier} pts</strong> more to reach {profile.next_tier}
                </div>
              )}
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Lifetime Spend', value: formatCurrency(profile.lifetime_spend_rs), icon: TrendingUp },
                { label: 'Total Pts Earned', value: `${profile.total_earned}`, icon: Star },
                { label: 'Accrual Rate', value: `${profile.tier_multiplier}x`, icon: Gift },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ padding: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <Icon size={18} color="var(--color-primary)" style={{ marginBottom: 6 }} />
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 800 }}>{value}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Points Ledger */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 12 }}>RECENT POINTS HISTORY</div>
              {profile.ledger?.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Date', 'Type', 'Points', 'Balance'].map(h => (
                        <th key={h} style={{ textAlign: h === 'Points' || h === 'Balance' ? 'right' : 'left', padding: '4px 8px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 10 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.ledger.map((e: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '6px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{e.date}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <span style={{ padding: '2px 8px', fontSize: 10, fontWeight: 700,
                            background: e.type === 'earn' ? '#10b98120' : e.type === 'redeem' ? '#ef444420' : '#f59e0b20',
                            color: e.type === 'earn' ? '#10b981' : e.type === 'redeem' ? '#ef4444' : '#f59e0b',
                          }}>
                            {e.type.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: e.points > 0 ? '#10b981' : '#ef4444' }}>
                          {e.points > 0 ? '+' : ''}{e.points}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>{e.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: 16 }}>No transactions yet.</div>
              )}
            </div>

            {/* Manual Adjust */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Edit2 size={12} /> MANUAL POINTS ADJUSTMENT (HO Override)
              </div>
              {adjustMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 12, marginBottom: 10, fontWeight: 700 }}>
                  <CheckCircle size={14} /> {adjustMsg}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 10, alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                    POINTS (+/-)
                  </label>
                  <input
                    type="number"
                    value={adjustPts}
                    onChange={e => setAdjustPts(e.target.value)}
                    placeholder="e.g. +50"
                    style={{ width: '100%', padding: '8px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>REASON</label>
                  <input
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value)}
                    placeholder="Goodwill / complaint resolution / correction..."
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  onClick={() => { setAdjustMsg(null); adjustMutation.mutate(); }}
                  disabled={!adjustPts || adjustMutation.isPending}
                  style={{ padding: '8px 14px', background: adjustPts ? 'var(--color-primary)' : '#94a3b8', color: '#fff', border: 'none', cursor: adjustPts ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 12 }}
                >
                  {adjustMutation.isPending ? '...' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
