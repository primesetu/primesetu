// ============================================================
// SMRITI-OS — Minimal Local Login Screen
// [R1-D] Bootstrap login for LOCAL_POSTGRES mode only
// ============================================================
// IMPORTANT: This is a temporary bootstrap auth layer.
// Future phases will add per-cashier PIN, shift-bound sessions.
// ============================================================

import React, { useState } from 'react'
import { apiClient } from '@/api/client'
import { storeLocalToken } from '@/hooks/useLocalAuth'

interface LocalLoginScreenProps {
  onSuccess: () => void
}

const LocalLoginScreen: React.FC<LocalLoginScreenProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('admin')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) { setError('PIN is required.'); return }

    setLoading(true)
    setError(null)

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

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100dvh', width: '100vw',
      background: 'var(--color-bg, #0d0d0d)',
      fontFamily: 'var(--font-body, "Inter", sans-serif)',
    }}>
      <div style={{
        width: 360, padding: '2.5rem',
        background: 'var(--color-surface, #1a1a1a)',
        border: '1px solid var(--color-outline, #333)',
        borderRadius: 'var(--radius-md, 8px)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.25em', fontWeight: 700,
            color: 'var(--color-primary, #6ee7b7)', textTransform: 'uppercase', marginBottom: 8
          }}>
            SMRITI — SOVEREIGN NODE
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-on-surface, #f5f5f5)' }}>
            Node Access
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-outline, #888)', marginTop: 4 }}>
            Local offline authentication
          </div>
        </div>

        <form onSubmit={handleLogin}>
          {/* Username */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-outline, #888)', marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              style={{
                width: '100%', padding: '0.6rem 0.8rem', boxSizing: 'border-box',
                background: 'var(--color-bg, #0d0d0d)',
                border: '1px solid var(--color-outline, #444)',
                borderRadius: 'var(--radius-sm, 4px)',
                color: 'var(--color-on-surface, #f5f5f5)', fontSize: 14, outline: 'none',
              }}
            />
          </div>

          {/* PIN */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-outline, #888)', marginBottom: 6 }}>
              Node PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter PIN"
              autoComplete="current-password"
              autoFocus
              style={{
                width: '100%', padding: '0.6rem 0.8rem', boxSizing: 'border-box',
                background: 'var(--color-bg, #0d0d0d)',
                border: `1px solid ${error ? '#f87171' : 'var(--color-outline, #444)'}`,
                borderRadius: 'var(--radius-sm, 4px)',
                color: 'var(--color-on-surface, #f5f5f5)', fontSize: 14, outline: 'none',
                letterSpacing: '0.3em',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.5rem 0.75rem', marginBottom: '1rem',
              background: 'rgba(248,113,113,0.1)', border: '1px solid #f87171',
              borderRadius: 4, fontSize: 12, color: '#f87171',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.75rem',
              background: loading ? 'var(--color-outline, #444)' : 'var(--color-primary, #6ee7b7)',
              color: '#0d0d0d', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              border: 'none', borderRadius: 'var(--radius-sm, 4px)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Authenticating...' : 'Access Node'}
          </button>
        </form>

        {/* Footer note */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 11,
          color: 'var(--color-outline, #555)', lineHeight: 1.6 }}>
          Set <code style={{ fontFamily: 'monospace' }}>LOCAL_ADMIN_PIN</code> in{' '}
          <code style={{ fontFamily: 'monospace' }}>.env</code> to configure PIN.
        </div>
      </div>
    </div>
  )
}

export default LocalLoginScreen
