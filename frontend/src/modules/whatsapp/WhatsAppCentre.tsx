/* ============================================================
 * SMRITI-OS — Module 16: WhatsApp Notifications Centre
 * BSP Gateway Config + Live Send Controls + Event Triggers
 * ============================================================ */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { MessageCircle, Wifi, WifiOff, CheckCircle, AlertTriangle, Settings, Send, Zap } from 'lucide-react';

const PROVIDER_INFO = {
  mock:      { label: 'Mock / Dev Mode',       color: '#6b7280', desc: 'Logs messages locally. No real sends.' },
  gupshup:   { label: 'Gupshup',               color: '#10b981', desc: 'Indian BSP — preferred for Tier 2/3 retail.' },
  interakt:  { label: 'Interakt',              color: '#3b82f6', desc: 'SaaS WA Business API. Easy template setup.' },
  meta:      { label: 'Meta Cloud API',         color: '#1d4ed8', desc: 'Direct Meta integration — lowest cost at scale.' },
};

export default function WhatsAppCentre() {
  const qc = useQueryClient();
  const [testMobile, setTestMobile] = useState('');
  const [testSent, setTestSent] = useState(false);
  const [cfgForm, setCfgForm] = useState<any>(null);
  const [cfgSaved, setCfgSaved] = useState(false);

  const { data: config, isLoading: cfgLoading } = useQuery({
    queryKey: ['wa-config'],
    queryFn: () => api.whatsapp.getConfig(),
  });

  React.useEffect(() => {
    if (config && !cfgForm) {
      const c = config as any;
      setCfgForm({
        provider: c.provider || 'mock',
        api_key: '',
        from_number: c.from_number || '',
        template_lang: c.template_lang || 'en',
      });
    }
  }, [config]);

  const { data: gwStatus } = useQuery({
    queryKey: ['wa-status'],
    queryFn: () => api.whatsapp.getStatus(),
    refetchInterval: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: () => api.whatsapp.updateConfig(cfgForm),
    onSuccess: () => { setCfgSaved(true); qc.invalidateQueries({ queryKey: ['wa-config'] }); },
  });

  const testMutation = useMutation({
    mutationFn: () => api.whatsapp.sendReceipt({
      mobile: testMobile,
      bill_no: 'TEST-0001',
      store_name: 'SMRITI-OS Store',
      total_rs: 1500,
      points_earned: 15,
      points_balance: 150,
    }),
    onSuccess: () => setTestSent(true),
  });

  const form = cfgForm || { provider: 'mock', api_key: '', from_number: '', template_lang: 'en' };
  const f = (k: string, v: string) => { setCfgForm((p: any) => ({ ...p, [k]: v })); setCfgSaved(false); };

  const providerInfo = PROVIDER_INFO[form.provider as keyof typeof PROVIDER_INFO] || PROVIDER_INFO.mock;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageCircle size={22} /> WHATSAPP NOTIFICATIONS
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
          BSP Gateway Configuration · Automated Triggers · Manual Send Controls
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Left — Config */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Provider select */}
          <div style={{ padding: 20, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Settings size={14} /> BSP GATEWAY CONFIGURATION
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>PROVIDER</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                  <div
                    key={key}
                    onClick={() => f('provider', key)}
                    style={{
                      padding: 12, cursor: 'pointer',
                      border: `2px solid ${form.provider === key ? info.color : 'var(--color-border)'}`,
                      background: form.provider === key ? `${info.color}10` : 'transparent',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 12, color: form.provider === key ? info.color : 'var(--color-text)' }}>{info.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{info.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {form.provider !== 'mock' && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>API KEY</label>
                  <input
                    type="password"
                    value={form.api_key}
                    onChange={e => f('api_key', e.target.value)}
                    placeholder={((config as any)?.api_key_set) ? '●●●●●●●● (saved — enter to update)' : 'Enter BSP API key'}
                    style={{ width: '100%', padding: '9px', fontFamily: 'JetBrains Mono, monospace', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>SENDER NUMBER (E.164)</label>
                  <input
                    value={form.from_number}
                    onChange={e => f('from_number', e.target.value)}
                    placeholder="+919876543210"
                    style={{ width: '100%', padding: '9px', fontFamily: 'JetBrains Mono, monospace', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>TEMPLATE LANGUAGE</label>
                  <select value={form.template_lang} onChange={e => f('template_lang', e.target.value)}
                    style={{ padding: '9px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={() => { setCfgSaved(false); saveMutation.mutate(); }}
                disabled={saveMutation.isPending}
                style={{ padding: '9px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </button>
              {cfgSaved && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 12, fontWeight: 700 }}>
                  <CheckCircle size={14} /> Saved
                </div>
              )}
            </div>
          </div>

          {/* Automated Triggers reference */}
          <div style={{ padding: 20, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} /> AUTOMATED TRIGGERS
            </div>
            {[
              { event: 'Bill Finalized', template: 'bill_receipt', auto: true, desc: 'Receipt + points earned, sent after every sale' },
              { event: 'Tier Upgraded', template: 'loyalty_tier_upgrade', auto: true, desc: 'Congratulation on Bronze → Silver etc.' },
              { event: 'Day-End Sealed', template: 'day_end_summary', auto: false, desc: 'Manual trigger from Day-End module' },
              { event: 'Low Stock Alert', template: 'low_stock_alert', auto: false, desc: 'Manual trigger from Stock Reports' },
            ].map(({ event, template, auto, desc }) => (
              <div key={event} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{event}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{desc}</div>
                  <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-text-muted)', marginTop: 2 }}>{template}</div>
                </div>
                <span style={{ padding: '2px 10px', fontSize: 10, fontWeight: 700,
                  background: auto ? '#10b98120' : '#f59e0b20',
                  color: auto ? '#10b981' : '#f59e0b',
                }}>
                  {auto ? 'AUTO' : 'MANUAL'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Status + Test */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Gateway status */}
          <div style={{ padding: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 12 }}>GATEWAY STATUS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              {gwStatus?.reachable ? <Wifi size={18} color="#10b981" /> : <WifiOff size={18} color="#ef4444" />}
              <span style={{ fontWeight: 700, fontSize: 13, color: gwStatus?.reachable ? '#10b981' : '#ef4444' }}>
                {gwStatus?.reachable ? 'Gateway Online' : 'Not Reachable'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Provider: <strong>{(gwStatus as any)?.provider || (config as any)?.provider || 'mock'}</strong>
            </div>
            {gwStatus?.from_number && (
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
                From: <strong>{gwStatus.from_number}</strong>
              </div>
            )}
          </div>

          {/* Test send */}
          <div style={{ padding: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 12 }}>SEND TEST RECEIPT</div>
            <input
              value={testMobile}
              onChange={e => { setTestMobile(e.target.value); setTestSent(false); }}
              placeholder="Mobile number (10 digits)"
              style={{ width: '100%', padding: '8px', fontFamily: 'JetBrains Mono, monospace', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box', marginBottom: 10 }}
            />
            {testSent && (
              <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={13} /> Sent ({config?.provider})
              </div>
            )}
            {testMutation.isError && (
              <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={13} /> Send failed
              </div>
            )}
            <button
              onClick={() => { setTestSent(false); testMutation.mutate(); }}
              disabled={!testMobile || testMutation.isPending}
              style={{ width: '100%', padding: '9px', background: testMobile ? 'var(--color-primary)' : '#94a3b8', color: '#fff', border: 'none', cursor: testMobile ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Send size={13} /> {testMutation.isPending ? 'Sending...' : 'Send Test Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
