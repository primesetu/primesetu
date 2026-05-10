/* ============================================================
 * SMRITI-OS — Module 7: Schemes & Promotions Builder
 * HO Promotion Control Centre — Create, Activate, Broadcast
 * ============================================================ */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/utils/currency';
import { Plus, Zap, Tag, ShoppingBag, Power, PowerOff, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

type PromoType = 'BILL_LEVEL' | 'ITEM_LEVEL' | 'BUY_GET';

interface PromoHeader {
  id: number; promo_code: string; description: string;
  promo_type: PromoType; priority: number; is_active: boolean;
  valid_from: string | null; valid_to: string | null;
  bill_discounts?: any[]; buy_get_rules?: any[];
}

const TYPE_ICONS: Record<PromoType, React.ReactNode> = {
  BILL_LEVEL: <ShoppingBag size={14} />,
  ITEM_LEVEL: <Tag size={14} />,
  BUY_GET: <Zap size={14} />,
};

const TYPE_LABELS: Record<PromoType, string> = {
  BILL_LEVEL: 'Bill Discount',
  ITEM_LEVEL: 'Item Offer',
  BUY_GET: 'Buy X Get Y',
};

const EMPTY_FORM = {
  promo_code: '', description: '', promo_type: 'BILL_LEVEL' as PromoType,
  priority: 1, is_active: true, valid_from: '', valid_to: '',
  min_bill_amt: '', disc_type: 'PERCENTAGE', disc_value: '',
  buy_sku: '', buy_qty: '', get_sku: '', get_qty: '', get_disc_pct: '100',
};

export default function SchemesBuilder() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: promos = [], isLoading } = useQuery<PromoHeader[]>({
    queryKey: ['schemes'],
    queryFn: () => apiClient.get('/schemes').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post('/schemes', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schemes'] }); setShowForm(false); setForm(EMPTY_FORM); },
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/schemes/${id}/activate`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schemes'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => apiClient.patch(`/schemes/${id}/deactivate`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schemes'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/schemes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schemes'] }),
  });

  const handleSubmit = () => {
    const payload: any = {
      promo_code: form.promo_code,
      description: form.description,
      promo_type: form.promo_type,
      priority: parseInt(form.priority.toString()),
      is_active: form.is_active,
      valid_from: form.valid_from || null,
      valid_to: form.valid_to || null,
    };

    if (form.promo_type === 'BILL_LEVEL') {
      payload.bill_discounts = [{
        min_bill_amt: parseFloat(form.min_bill_amt) * 100 || 0,
        max_bill_amt: null,
        disc_type: form.disc_type,
        disc_value: parseFloat(form.disc_value) || 0,
      }];
    } else if (form.promo_type === 'BUY_GET') {
      payload.buy_get_rules = [{
        buy_item_id: form.buy_sku,
        buy_qty: parseInt(form.buy_qty) || 1,
        get_item_id: form.get_sku,
        get_qty: parseInt(form.get_qty) || 1,
        get_disc_pct: parseFloat(form.get_disc_pct) || 100,
      }];
    }

    createMutation.mutate(payload);
  };

  const f = (key: keyof typeof EMPTY_FORM, val: any) => setForm(p => ({ ...p, [key]: val }));

  const activeCount = promos.filter(p => p.is_active).length;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-primary)' }}>
            SCHEMES & PROMOTIONS
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            HO Promotion Builder · {activeCount} active scheme{activeCount !== 1 ? 's' : ''} running
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{ padding: '9px 16px', background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={15} /> New Scheme
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ padding: 20, background: 'var(--color-surface)', border: '2px solid var(--color-primary)', marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 16 }}>NEW PROMOTION</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>PROMO CODE *</label>
              <input value={form.promo_code} onChange={e => f('promo_code', e.target.value)}
                placeholder="SUMMER25" style={{ width: '100%', padding: '8px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>DESCRIPTION</label>
              <input value={form.description} onChange={e => f('description', e.target.value)}
                placeholder="Summer Sale — 25% off on bills above Rs.2000"
                style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>TYPE</label>
              <select value={form.promo_type} onChange={e => f('promo_type', e.target.value as PromoType)}
                style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                {(Object.keys(TYPE_LABELS) as PromoType[]).map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>PRIORITY</label>
              <input type="number" value={form.priority} onChange={e => f('priority', e.target.value)} min={1} max={99}
                style={{ width: '100%', padding: '8px', fontFamily: 'JetBrains Mono, monospace', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>VALID FROM</label>
              <input type="date" value={form.valid_from} onChange={e => f('valid_from', e.target.value)}
                style={{ width: '100%', padding: '7px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>VALID TO</label>
              <input type="date" value={form.valid_to} onChange={e => f('valid_to', e.target.value)}
                style={{ width: '100%', padding: '7px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Conditional rule builder */}
          {form.promo_type === 'BILL_LEVEL' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12, padding: 14, background: 'var(--color-bg)', border: '1px dashed var(--color-border)' }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>MIN BILL (Rs.)</label>
                <input type="number" value={form.min_bill_amt} onChange={e => f('min_bill_amt', e.target.value)} placeholder="2000"
                  style={{ width: '100%', padding: '8px', fontFamily: 'JetBrains Mono, monospace', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>DISCOUNT TYPE</label>
                <select value={form.disc_type} onChange={e => f('disc_type', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (Rs.)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                  VALUE ({form.disc_type === 'PERCENTAGE' ? '%' : 'Rs.'})
                </label>
                <input type="number" value={form.disc_value} onChange={e => f('disc_value', e.target.value)} placeholder="25"
                  style={{ width: '100%', padding: '8px', fontFamily: 'JetBrains Mono, monospace', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}

          {form.promo_type === 'BUY_GET' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 12, padding: 14, background: 'var(--color-bg)', border: '1px dashed var(--color-border)' }}>
              {[
                { key: 'buy_sku', label: 'BUY SKU', placeholder: 'ITEM001' },
                { key: 'buy_qty', label: 'BUY QTY', placeholder: '2' },
                { key: 'get_sku', label: 'GET SKU', placeholder: 'ITEM002' },
                { key: 'get_qty', label: 'GET QTY', placeholder: '1' },
                { key: 'get_disc_pct', label: 'GET DISC %', placeholder: '100' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input value={(form as any)[key]} onChange={e => f(key as any, e.target.value)} placeholder={placeholder}
                    style={{ width: '100%', padding: '8px', fontFamily: 'JetBrains Mono, monospace', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSubmit} disabled={createMutation.isPending}
              style={{ padding: '9px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              {createMutation.isPending ? 'Creating...' : 'Create Scheme'}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: '9px 16px', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Schemes List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>Loading schemes...</div>
      ) : promos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>
          <Zap size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontWeight: 700 }}>No promotions configured yet.</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Create your first scheme to activate dynamic pricing.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {promos.map(promo => (
            <div key={promo.id} style={{ border: `2px solid ${promo.is_active ? 'var(--color-primary)' : 'var(--color-border)'}`, background: 'var(--color-surface)' }}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Status indicator */}
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: promo.is_active ? '#10b981' : '#94a3b8', flexShrink: 0 }} />

                {/* Type badge */}
                <div style={{ padding: '3px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                  background: promo.is_active ? 'var(--color-primary)' : 'var(--color-border)',
                  color: promo.is_active ? '#fff' : 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {TYPE_ICONS[promo.promo_type]} {TYPE_LABELS[promo.promo_type]}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: 14 }}>{promo.promo_code}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{promo.description}</div>
                </div>

                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'right', marginRight: 12 }}>
                  <div>Priority: <strong>{promo.priority}</strong></div>
                  {promo.valid_to && <div>Until: {new Date(promo.valid_to).toLocaleDateString('en-IN')}</div>}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => promo.is_active ? deactivateMutation.mutate(promo.id) : activateMutation.mutate(promo.id)}
                    title={promo.is_active ? 'Deactivate' : 'Activate'}
                    style={{ padding: '6px', background: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer', color: promo.is_active ? '#f59e0b' : '#10b981' }}
                  >
                    {promo.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                  </button>
                  <button
                    onClick={() => setExpanded(expanded === promo.id ? null : promo.id)}
                    style={{ padding: '6px', background: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                  >
                    {expanded === promo.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <button
                    onClick={() => { if (window.confirm(`Delete scheme ${promo.promo_code}?`)) deleteMutation.mutate(promo.id); }}
                    style={{ padding: '6px', background: 'transparent', border: '1px solid #ef444430', cursor: 'pointer', color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {expanded === promo.id && (
                <div style={{ padding: '0 16px 14px 38px', borderTop: '1px solid var(--color-border)' }}>
                  {promo.bill_discounts && promo.bill_discounts.length > 0 && promo.bill_discounts.map((bd: any, i: number) => (
                    <div key={i} style={{ fontSize: 12, marginTop: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-text-muted)' }}>
                      Min Bill: {formatCurrency(bd.min_bill_amt / 100)} → {bd.disc_type === 'PERCENTAGE' ? `${bd.disc_value}% off` : `Rs.${bd.disc_value} off`}
                    </div>
                  ))}
                  {promo.buy_get_rules && promo.buy_get_rules.length > 0 && promo.buy_get_rules.map((bg: any, i: number) => (
                    <div key={i} style={{ fontSize: 12, marginTop: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-text-muted)' }}>
                      Buy {bg.buy_qty}x [{bg.buy_item_id}] → Get {bg.get_qty}x [{bg.get_item_id}] at {bg.get_disc_pct}% off
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
