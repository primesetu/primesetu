// ============================================================
// SMRITI-OS — Dual-Path Authentication Screen
// [R2-A] Sovereign Node Access + Report Viewer (Supabase)
// ============================================================
// TWO PATHS:
//   1. Store Login (PIN)    → cashier, admin, warehouse_manager
//                             → authenticates against local backend
//   2. Report Access (Email)→ owner, accountant, HO manager
//                             → authenticates against Supabase directly
// ============================================================

import React, { useState } from 'react'
import { apiClient } from '@/api/client'
import { supabase } from '@/lib/supabase'
import { storeLocalToken } from '@/core/hooks/useLocalAuth'

interface LocalLoginScreenProps {
  onSuccess: () => void
}

type AuthPath = 'store' | 'report'

// Role label map for display
const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  owner: 'Administrator',
  manager: 'Store Manager',
  warehouse: 'Warehouse Manager',
  wh: 'Warehouse Manager',
}

const LocalLoginScreen: React.FC<LocalLoginScreenProps> = ({ onSuccess }) => {
  const [path, setPath] = useState<AuthPath>('store')

  // Store PIN Login state
  const [username, setUsername] = useState('admin')
  const [pin, setPin] = useState('')

  // Report Email Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Store PIN Login ────────────────────────────────────────
  const handleStoreLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) { setError('PIN is required.'); return }
    setLoading(true); setError(null)
    try {
      const res = await apiClient.post('/auth/local-login', { username, pin })
      storeLocalToken(res.data.access_token)
      onSuccess()
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Login failed. Check your PIN.'
      setError(msg.replace('[SMRITI-OS] ', ''))
    } finally {
      setLoading(false)
    }
  }

  // ── Report Viewer Supabase Login ───────────────────────────
  const handleReportLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { setError('Email and password are required.'); return }
    setLoading(true); setError(null)
    try {
      const { error: sbError } = await supabase.auth.signInWithPassword({ email, password })
      if (sbError) throw sbError
      // Supabase session is stored automatically — just signal success
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const s = styles

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={s.badge}>SMRITI — SOVEREIGN NODE</div>
          <div style={s.title}>Node Access</div>
          <div style={s.subtitle}>Select your access type below</div>
        </div>

        {/* Path Selector */}
        <div style={s.tabRow}>
          <button
            style={{ ...s.tab, ...(path === 'store' ? s.tabActive : {}) }}
            onClick={() => { setPath('store'); setError(null) }}
            type="button"
          >
            🔐 Store Login
          </button>
          <button
            style={{ ...s.tab, ...(path === 'report' ? s.tabActive : {}) }}
            onClick={() => { setPath('report'); setError(null) }}
            type="button"
          >
            📊 Report Access
          </button>
        </div>

        {/* ── Store PIN Form ── */}
        {path === 'store' && (
          <form onSubmit={handleStoreLogin}>
            {/* Role Selector */}
            <div style={s.field}>
              <label style={s.label}>ROLE</label>
              <select
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={s.input}
              >
                <option value="admin">Administrator</option>
                <option value="manager">Store Manager</option>
                <option value="warehouse">Warehouse Manager</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
            {/* PIN */}
            <div style={s.field}>
              <label style={s.label}>NODE PIN</label>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Enter PIN"
                autoComplete="current-password"
                autoFocus
                style={{ ...s.input, letterSpacing: '0.3em', borderColor: error ? '#f87171' : 'var(--color-outline, #444)' }}
              />
            </div>
            {error && <div style={s.errorBox}>{error}</div>}
            <button type="submit" disabled={loading} style={s.btn}>
              {loading ? 'Authenticating...' : 'ACCESS NODE'}
            </button>
            <div style={s.hint}>
              Set <code style={s.code}>LOCAL_ADMIN_PIN</code> in <code style={s.code}>.env</code>
            </div>
          </form>
        )}

        {/* ── Report Viewer Form ── */}
        {path === 'report' && (
          <form onSubmit={handleReportLogin}>
            <div style={s.infoBanner}>
              📊 Report access uses cloud credentials. Your data is read-only and sourced directly from Supabase.
            </div>
            <div style={s.field}>
              <label style={s.label}>EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="owner@store.com"
                autoComplete="email"
                autoFocus
                style={s.input}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your Supabase password"
                autoComplete="current-password"
                style={{ ...s.input, borderColor: error ? '#f87171' : 'var(--color-outline, #444)' }}
              />
            </div>
            {error && <div style={s.errorBox}>{error}</div>}
            <button type="submit" disabled={loading} style={{ ...s.btn, background: loading ? 'var(--color-outline, #444)' : '#818cf8' }}>
              {loading ? 'Signing In...' : 'VIEW REPORTS'}
            </button>
            <div style={s.hint}>
              Contact your administrator to get report access credentials.
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100dvh', width: '100vw',
    background: 'var(--color-bg, #0d0d0d)',
    fontFamily: 'var(--font-body, "Inter", sans-serif)',
  },
  card: {
    width: 380, padding: '2rem',
    background: 'var(--color-surface, #1a1a1a)',
    border: '1px solid var(--color-outline, #333)',
    borderRadius: 'var(--radius-md, 8px)',
  },
  badge: {
    fontSize: 11, letterSpacing: '0.25em', fontWeight: 700,
    color: 'var(--color-primary, #6ee7b7)', textTransform: 'uppercase', marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: 700, color: 'var(--color-on-surface, #f5f5f5)' },
  subtitle: { fontSize: 12, color: 'var(--color-outline, #888)', marginTop: 4 },
  tabRow: {
    display: 'flex', gap: 8, marginBottom: '1.25rem',
    background: '#111', borderRadius: 6, padding: 4,
  },
  tab: {
    flex: 1, padding: '0.5rem', fontSize: 12, fontWeight: 600,
    border: 'none', borderRadius: 4, cursor: 'pointer',
    background: 'transparent', color: '#888', transition: 'all 0.15s',
  },
  tabActive: {
    background: 'var(--color-surface, #1a1a1a)',
    color: 'var(--color-on-surface, #f5f5f5)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
  },
  field: { marginBottom: '1rem' },
  label: {
    display: 'block', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--color-outline, #888)', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '0.6rem 0.8rem', boxSizing: 'border-box',
    background: 'var(--color-bg, #0d0d0d)',
    border: '1px solid var(--color-outline, #444)',
    borderRadius: 'var(--radius-sm, 4px)',
    color: 'var(--color-on-surface, #f5f5f5)', fontSize: 14, outline: 'none',
  },
  errorBox: {
    padding: '0.5rem 0.75rem', marginBottom: '1rem',
    background: 'rgba(248,113,113,0.1)', border: '1px solid #f87171',
    borderRadius: 4, fontSize: 12, color: '#f87171',
  },
  infoBanner: {
    padding: '0.6rem 0.75rem', marginBottom: '1rem',
    background: 'rgba(129,140,248,0.08)', border: '1px solid #818cf8',
    borderRadius: 4, fontSize: 12, color: '#a5b4fc', lineHeight: 1.5,
  },
  btn: {
    width: '100%', padding: '0.75rem',
    background: 'var(--color-primary, #6ee7b7)',
    color: '#0d0d0d', fontWeight: 700, fontSize: 13,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    border: 'none', borderRadius: 'var(--radius-sm, 4px)',
    cursor: 'pointer', transition: 'opacity 0.15s', marginBottom: '1rem',
  },
  hint: {
    textAlign: 'center', fontSize: 11,
    color: 'var(--color-outline, #555)', lineHeight: 1.6,
  },
  code: { fontFamily: 'monospace' },
}

export default LocalLoginScreen
