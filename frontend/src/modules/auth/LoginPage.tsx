/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
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
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <path d="M8 44 Q32 14 56 44" stroke="#F4840A" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
            <line x1="6" y1="44" x2="58" y2="44" stroke="#0D1B3E" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="32" cy="10" r="4" fill="#F9B942"/>
          </svg>
          <div>
            <div className="font-serif text-3xl font-black text-navy leading-none">Prime<span className="text-saffron">Setu</span></div>
            <div className="text-[10px] tracking-[3px] uppercase text-muted mt-1">Sovereign Retail OS</div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-border shadow-xl shadow-navy/5 overflow-hidden">
          <div className="bg-navy p-6 text-center">
            <h1 className="font-serif text-xl font-bold text-white">Store Access Control</h1>
            <p className="text-xs text-muted/60 mt-1 uppercase tracking-widest font-semibold">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="bg-red/10 border border-red/20 text-red text-xs p-4 rounded-lg flex items-center gap-3">
                <span className="text-base">⚠️</span>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted ml-1">Email Address / ID</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cream border border-border rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-saffron focus:bg-white transition-all"
                  placeholder="admin@primesetu.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted ml-1">Secret Access Key</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cream border border-border rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-saffron focus:bg-white transition-all"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-saffron hover:bg-[#D9720A] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-saffron/20 disabled:opacity-50 disabled:shadow-none active:transform active:scale-[0.98]"
            >
              {loading ? 'Authenticating...' : 'Sign In to Terminal'}
            </button>

            <div className="pt-4 text-center">
              <p className="text-[10px] text-muted uppercase tracking-tighter">
                Sovereign Stack Phase 2 · Shoper9 Reference Standard
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted">
            Lost credentials? Contact your <span className="text-navy font-semibold">AITDL Network Administrator</span>
          </p>
        </div>
      </div>
    </div>
  )
}
