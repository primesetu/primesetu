/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-body)] flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <path d="M8 44 Q32 14 56 44" stroke="var(--color-primary)" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
            <line x1="6" y1="44" x2="58" y2="44" stroke="var(--color-text-primary)" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="32" cy="10" r="4" fill="var(--color-primary-hover)"/>
          </svg>
          <div>
            <div className="font-serif text-3xl font-black text-[var(--color-text-primary)] leading-none">
              Prime<span className="text-[var(--color-primary)]">Setu</span>
            </div>
            <div className="text-[10px] tracking-[3px] uppercase text-[var(--color-text-tertiary)] mt-1">Sovereign Retail OS</div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="bg-[var(--color-primary)] p-6 text-center">
            <h1 className="font-serif text-xl font-bold text-[var(--color-white)]">Store Access Control</h1>
            <p className="text-xs text-[var(--color-white)] opacity-60 mt-1 uppercase tracking-widest font-semibold">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger-text)] text-[var(--color-danger-text)] text-xs p-4 flex items-center gap-3">
                <span className="text-base">⚠️</span>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] ml-1">Email Address / ID</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--color-bg-body)] border border-[var(--color-border)] rounded-none px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] transition-all"
                  placeholder="admin@SMRITI-OS.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] ml-1">Secret Access Key</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--color-bg-body)] border border-[var(--color-border)] rounded-none px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] transition-all"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-white)] font-bold py-3.5 transition-all disabled:opacity-50 active:scale-[0.98]"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Terminal'}
            </button>

            <div className="pt-4 text-center">
              <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-tighter">
                Sovereign Stack Phase 2 · Shoper9 Reference Standard
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Lost credentials? Contact your <span className="text-[var(--color-primary)] font-semibold">AITDL Network Administrator</span>
          </p>
        </div>
      </div>
    </div>
  )
}
