// ============================================================
// SMRITI-OS — Local Auth Guard
// [R2-A] Dual-path authentication: Local PIN + Supabase Cloud
// ============================================================
// Behavior:
//   1. Check Supabase session → if valid → 'ready' (report viewer path)
//   2. Check local backend auth status
//      - if local_auth_enabled=false → 'ready' (CLOUD mode, handled by Supabase)
//      - if local_auth_enabled=true:
//          - valid local token → 'ready'
//          - no token → 'local-login' (show dual-path login screen)
// ============================================================

import React, { useEffect, useState } from 'react'
import { apiClient } from '@/api/client'
import { supabase } from '@/lib/supabase'
import { isLocalTokenValid } from '@/hooks/useLocalAuth'
import LocalLoginScreen from './LocalLoginScreen'

type GuardState = 'loading' | 'local-login' | 'ready'

interface LocalAuthGuardProps {
  children: React.ReactNode
}

const LocalAuthGuard: React.FC<LocalAuthGuardProps> = ({ children }) => {
  const [state, setState] = useState<GuardState>('loading')

  useEffect(() => {
    let cancelled = false

    const checkAuth = async () => {
      // ── Step 1: Check Supabase session (report viewer path) ──
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!cancelled && session) {
          // Valid Supabase session → report viewer is authenticated
          setState('ready')
          return
        }
      } catch {
        // Supabase unreachable — continue to local check
      }

      // ── Step 2: Check local backend auth status ──────────────
      try {
        const res = await apiClient.get('/auth/local-status')
        if (cancelled) return

        const { local_auth_enabled } = res.data

        if (!local_auth_enabled) {
          // CLOUD or SOVEREIGN mode — Supabase handles auth globally
          setState('ready')
          return
        }

        // LOCAL_POSTGRES mode: validate stored local token
        if (isLocalTokenValid()) {
          setState('ready')
        } else {
          setState('local-login')
        }
      } catch {
        // Backend unreachable → show login so user can switch node
        if (!cancelled) setState('local-login')
      }
    }

    checkAuth()

    // ── Listen for Supabase auth state changes (sign-in/sign-out) ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        if (session) {
          setState('ready')
        }
        // sign-out is handled by the app's logout flow
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  if (state === 'loading') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100dvh', background: 'var(--color-bg, #0d0d0d)',
        color: 'var(--color-outline, #888)', fontSize: 13,
        fontFamily: 'var(--font-body, Inter, sans-serif)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        Initializing Node...
      </div>
    )
  }

  if (state === 'local-login') {
    return <LocalLoginScreen onSuccess={() => setState('ready')} />
  }

  return <>{children}</>
}

export default LocalAuthGuard
